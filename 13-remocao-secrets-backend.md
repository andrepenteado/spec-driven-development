# 13 - Remoção de secrets de módulos backend (padrão APsso)

Guia reutilizável para o Claude aplicar o MESMO padrão em outros projetos
(Spring Boot multi-módulo + Angular, deploy via Helm chart `springboot-angular-chart`,
Postgres + LDAP/ApacheDS, OAuth2 Authorization Server, IntelliJ para dev).

> Objetivo: nenhum segredo (senha, client-secret, token, keystore) versionado —
> nem no working tree nem no histórico git. Em produção vêm de Secret do k8s;
> em dev vêm de arquivos `.env` ignorados. Histórico reescrito com git-filter-repo.

> Regra de ouro: **valores reais só em arquivos git-ignored** (`secret.yaml`, `*.env`,
> `*-prod.jks`) ou fora do repo (`~/`). Em arquivos versionados, só `${PLACEHOLDER}`
> e modelos `*.template`/`*.example` sem valores reais.

---

## Ferramentas
- `git-filter-repo` (script único: `curl -fsSL -o /tmp/git-filter-repo https://raw.githubusercontent.com/newren/git-filter-repo/main/git-filter-repo`; rodar com `python3 /tmp/git-filter-repo`).
- `helm` (validar com `helm template ... --set app.image.tag=x`).
- `openssl` (senhas fortes), `keytool` (keystore), `kubectl`, `psql`, `ldap*`.

---

## Fase 0 — Inventário (NÃO pular)
Mapear TODOS os segredos antes de mexer. Procurar em:
- `*/src/main/resources/application.yml` e `application-dev.yml`
- `*/src/test/resources/application.yml`
- valores do Helm: `.helm/values.*.yaml`
- CI: `.gitlab-ci.yml`, `.github/`
- seeds Flyway: `*/db/migration/*Popular*Dados*.sql`, `V*.sql` (client_secret bcrypt, senhas de usuário)
- keystores/binários: `*.jks`, `*.p12`, `*.pem`, `*.key`
- imagePullSecret / dockerconfigjson: `*gitlab-secret.*`, `*.dockerconfigjson`
- bootstrap: `create-user-database.sql`

Comandos úteis:
```bash
grep -rnIE '(password|secret|passwd|token|client-secret|api[_-]?key)[:=]' \
  --include='*.yml' --include='*.yaml' --include='*.properties' --include='*.sql' \
  --include='*.java' --include='*.xml' . | grep -v /target/ | grep -vE '\$\{'
git ls-files | grep -iE '\.(jks|p12|pem|key|crt|pfx)$'
# valores distintos no HISTÓRICO (incl. base64 de tokens):
git grep -hE 'client-secret:|password:|auth":|dockerconfigjson:' $(git rev-list --all) | sort -u
```
Anotar cada valor distinto (inclusive os antigos/rotacionados que só existem no histórico
e as formas base64 de tokens). Eles entram na lista de scrub (Fase 6).

---

## Fase 1 — Secret de runtime do k8s (produção) + chart
1. Criar `.helm/secret.yaml` (GIT-IGNORED) como Secret `Opaque`, `stringData`, com TODOS os
   segredos. Se houver chaves específicas por módulo (ex.: OIDC client-secret), usar nomes
   distintos (`CONTROLE_OIDC_CLIENT_SECRET`, etc.).
2. Adicionar no MESMO arquivo (multi-doc `---`) o imagePullSecret (dockerconfigjson) que antes
   era versionado; apagar o arquivo versionado dele.
3. Criar `.helm/secret.template.yaml` (VERSIONADO) idêntico, mas com placeholders `<...>`.
4. Chart (`springboot-angular-chart`), em `templates/deployment.yaml`, suportar:
   - `app.envSecrets` (mapa `NOME_DA_VAR: chaveNoSecret`) → gera env via `secretKeyRef`:
     ```yaml
     {{- if or .Values.app.envVars .Values.app.envSecrets }}
     env:
       {{- range $k,$v := .Values.app.envVars }}
       - name: {{ $k }}
         value: {{ $v | quote }}
       {{- end }}
       {{- range $name,$key := .Values.app.envSecrets }}
       - name: {{ $name }}
         valueFrom: { secretKeyRef: { name: {{ $.Values.app.secretName }}, key: {{ $key }} } }
       {{- end }}
     {{- end }}
     ```
   - `app.secretVolumes` (lista `{name, secretName, mountPath}`) → monta Secrets como volume
     (keystores e outros binários) com `volumeMounts` + `volumes`.
   - Defaults `secretName: ""`, `envSecrets:`, `secretVolumes: []` em `values.yaml`.
   - Citar a imagem entre aspas: `image: "{{ .repository }}:{{ .tag }}"` (tolera tag vazia).
5. Nos `values.*.yaml` (versionados): trocar os segredos por `app.secretName` + `app.envSecrets`.
   Valores públicos (ex.: hCaptcha SITE KEY) podem ficar em `envVars`.
6. `make k8s-pre-init`: aplica namespace + `secret.yaml` (com checagem de existência) e, se houver
   keystore, cria o Secret dele a partir de `.helm/<app>-prod.jks` (GIT-IGNORED) de forma idempotente:
   ```bash
   kubectl create secret generic <app>-jks --from-file=<app>.jks=.helm/<app>-prod.jks \
     -n <ns> --dry-run=client -o yaml | kubectl apply -f -
   ```
   Assim, após recriar o namespace, o keystore volta sem passo manual (a chave do `--from-file`
   vira o nome do arquivo montado, ex. `/etc/<app>/<app>.jks`).
7. Versão do chart: bumpar APENAS se a versão atual já tiver sido publicada (OCI). O deploy usa
   a versão publicada, não o chart local — republicar (`helm push`) após mudar o chart.

Validar: `helm template <rel> <chart> -f .helm/values.<modulo>.yaml --set app.image.tag=x`.

---

## Fase 2 — Config das apps (placeholders)
- `application.yml` (prod) só usa `${VAR:}` (nunca hardcode). Ex.:
  `password: ${APSSO_DB_PASSWORD:}`, `client-secret: ${APSSO_OIDC_CLIENT_SECRET:}`.
- O nome da env var no container pode diferir da chave do Secret (mapeado em `app.envSecrets`).

---

## Fase 3 — Desenvolvimento (.env + IntelliJ + keystore de dev)
1. Em `application-dev.yml`, **remover os overrides redundantes** de senha que apenas repetem o
   placeholder do `application.yml` base (o perfil dev herda do base). Manter só o que difere
   (ex.: `url` do banco/ldap local).
2. Externalizar o que dev precisa via env (sem default redundante, já que serão setados na IDE):
   ex. `client-secret: ${APSSO_OIDC_CLIENT_SECRET}`.
3. Criar um `.env` por módulo backend em `.helm/<modulo>.env` (GIT-IGNORED) com os valores de dev.
   Valores de dev típicos: DB=`dev-local`, LDAP=`secret` (default ApacheDS), OIDC=secret do
   client LOCAL (tem que casar com o bcrypt do seed).
4. Criar `.helm/dev.env.example` (VERSIONADO) documentando as variáveis por módulo (sem valores).
5. Run configs do IntelliJ (`.run/*Backend*.run.xml`, Login): adicionar, dentro de `<configuration>`:
   ```xml
   <option name="envFilePaths">
     <option value="$PROJECT_DIR$/.helm/<modulo>.env" />
   </option>
   ```
6. Keystore de assinatura (se houver Authorization Server):
   - **Dev**: keystore descartável VERSIONADO (`apsso-dev.jks`, senha `changeit`),
     `path: classpath:apsso-dev.jks` e senhas fixas no `application-dev.yml`.
   - **Prod**: keystore criado UMA vez, fora do repo; vira Secret e é montado por volume
     (Fase 1.4). No código, carregar via `DefaultResourceLoader().getResource(path)`
     (aceita `classpath:` e `file:`), não `ClassPathResource`. Base usa
     `path: ${APSSO_JKS_PATH:file:/etc/<app>/<app>.jks}`.

---

## Fase 4 — Senhas fortes + rotação
- Gerar fortes (não precisam ser memorizadas): `openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 40`.
- Gravar no `secret.yaml` (DB/LDAP/JKS...). Para PKCS12, `keypass == storepass`.
- Regenerar keystore de prod com a nova senha (novo par de chaves) — fora do repo.
- Artefatos de rotação SIMPLES, fora do repo (`~/`), sem yaml/kubectl:
  - `rotate-db-password.sql`: `ALTER ROLE "<user>" WITH PASSWORD '<nova>';`
  - `rotate-ldap-password.ldif`: `dn: uid=admin,ou=system` / `changetype: modify` /
    `replace: userPassword` / `userPassword: <nova>`.
  - ⚠️ Rotacionar a chave/keystore TROCA o par RSA → invalida tokens emitidos (JWKS). Criar
    UMA vez e reusar; nunca regenerar a cada deploy.

---

## Fase 5 — Hardening OAuth2 (Authorization Server)
- Remover o grant `client_credentials` de clients que só fazem login interativo
  (`authorization_code`); resource servers não são clients registrados. Em 3 lugares:
  1. seed de dados (`*Popular_Dados.sql`): `'refresh_token,authorization_code'`;
  2. código que cria client em runtime (ex.: `*Service.novoAmbiente()`);
  3. banco existente, via script idempotente:
     ```sql
     UPDATE oauth2_registered_client
     SET authorization_grant_types = btrim(replace(replace(authorization_grant_types,
         'client_credentials',''),',,',','),',')
     WHERE authorization_grant_types LIKE '%client_credentials%';
     ```
  Motivo: com `client_credentials` + secret vazado, dá pra emitir token só com id+secret
  (sem usuário/redirect/PKCE) — o redirect `localhost` não protege esse grant.
- Manter PKCE (`require-proof-key: true`). Para clients de `localhost`/dev, considerar públicos
  (`client-authentication-method: none`, sem secret) — elimina o secret de vez.
- Seed com client_secrets (bcrypt) → mover para fora do repo (`~/`) e remover do histórico
  (Fase 6). Como vira "missing migration" no Flyway, ajustar depois com o log real
  (ex.: `spring.flyway.ignore-migration-patterns: "*:missing"` ou DELETE em `flyway_schema_history`).

---

## Fase 6 — Reescrever o histórico git (git-filter-repo)
1. Garantir working tree commitado e LIMPO antes (HEAD já sem segredos).
2. Backup: `git bundle create /tmp/<proj>-backup-$(date +%s).bundle --all`.
3. Redação de strings (`/tmp/replacements.txt`): uma por linha; literal sozinho usa
   `***REMOVED***`; para casos genéricos usar `chave: valor==>chave: ***REMOVED***`.
   ⚠️ Nunca usar palavra genérica isolada (ex.: `secret`) — usar com contexto
   (`password: secret==>password: ***REMOVED***`). Incluir tokens em plaintext E base64
   (inner `user:token` e o dockerconfigjson externo).
   ```bash
   python3 /tmp/git-filter-repo --force --replace-text /tmp/replacements.txt
   ```
4. Remover arquivos inteiros do histórico (keystore, seed, gitlab-secret):
   ```bash
   python3 /tmp/git-filter-repo --force --invert-paths \
     --path-glob '*apsso.jks' --path-glob '*Popular_Dados.sql' --path-glob '*gitlab-secret.*'
   ```
   (usar `--path-glob` porque o arquivo pode ter mudado de lugar no histórico; conferir com
   `git log --all --pretty=format: --name-only -- '*<arquivo>'`).
5. Reescritas removem o remote por segurança: `git remote add origin <url>` de volta.
6. Verificar 0 ocorrências: `for s in <valores>; do git grep -l "$s" $(git rev-list --all) | wc -l; done`.
   `git status` limpo, `git fsck --full`.
7. ⚠️ Efeito colateral: o scrub também altera o HEAD. Strings tipo `apsso-dbpasswd` em
   `.gitlab-ci.yml`/`create-user-database.sql` viram `***REMOVED***` — corrigir para o valor
   de dev (`dev-local`).
8. **Force-push é do usuário** (irreversível, reescreve remote compartilhado): `git push --force origin <branch>`.

---

## Fase 7 — Script de refresh de dados local (se existir)
No script que restaura dados de produção em local (`updatedb_*.sh`), ao FINAL trocar as
senhas restauradas pelas de DEV, para casar com os `.env`:
```bash
PGPASSWORD="<superuser-pass>" psql -U postgres -h localhost -d postgres \
  -c "ALTER ROLE \"<dbuser>\" WITH PASSWORD 'dev-local';"
ldappasswd -x -H ldap://localhost:10389 -D "uid=admin,ou=system" -w secret -s secret "uid=admin,ou=system"
```
Restaurar via superusuário local (não via o dbuser, cuja senha muda ao final) para o script
ficar re-executável.

---

## Fase 8 — .gitignore
```
.helm/secret.yaml
.helm/*-prod.jks
.helm/*.env
```
(Manter versionados: `secret.template.yaml`, `dev.env.example`, keystore de DEV.)

---

## Fase 9 — Deploy no cluster: TLS, namespace e ciclo de vida (k3s + Traefik + cert-manager)

**A) Traefik precisa do provider `kubernetescrd` se o chart usa Middleware (rate-limit).**
No deploy do Traefik (`apdevops/k3s/traefik/`):
- CRDs do Traefik vendorizadas da tag EXATA da imagem (arquivo `kubernetes-crd-definition-v1.yml`).
- `--providers.kubernetescrd` no daemonset (além do `kubernetesingress`).
- ClusterRole com o grupo `traefik.io` **e** com `configmaps`+`pods` no core group.
- ⚠️ Faltar `configmaps`/`pods` faz o provider falhar o sync e **derruba a config dinâmica
  inteira** → 404 (`404 page not found` do Go) em TODOS os ingressos. Sem a CRD: erro
  `no matches for kind "Middleware"`.

**B) Certificados TLS centralizados num namespace neutro `certs` + reflector (arquitetura final).**
Secret no k8s é escopo de namespace: vários ingressos no mesmo host, ou em namespaces distintos
(ex. `sistemas.apcode.com.br` usado por apsso e aproove), pedindo um cert cada estouram o limite
do Let's Encrypt (5 certs idênticos / 7 dias). Solução definitiva, sem depender do DNS/provedor:
- Namespace neutro `certs` emite **1 Certificate por host** (cert-manager, HTTP-01, ClusterIssuer
  já existente). Nome de Secret padronizado (ex. `<host>-apcode-tls`).
- No Certificate, `spec.secretTemplate.annotations` carimba as anotações do **reflector**
  (emberstack/kubernetes-reflector — 1 deployment): `reflection-allowed`,
  `reflection-allowed-namespaces`, `reflection-auto-enabled`, `reflection-auto-namespaces`
  apontando para os namespaces das apps. O reflector replica o Secret e mantém sincronizado
  nas renovações.
- Cada Ingress de app **referencia o Secret refletido** e **não usa cert-manager** (sem a
  anotação `cluster-issuer`). No chart, manter só `ingress.tlsSecretName`; o TLS é gerenciado
  fora do chart. (Removido o flag `certManager`/`clusterIssuer` — código morto nesse modelo.)
- Migração sem downtime: dê ao Secret refletido um nome NOVO (distinto do atual por-app); o cert
  antigo serve até o Ingress apontar para o novo; só então apague os Certificates antigos por-app.
- Resultado: 1 cert por host no cluster inteiro (apsso + aproove + futuros). App nova no mesmo
  host = só referenciar o Secret refletido (adicionar o namespace na lista de reflexão).

**C) Com os certs em `certs` + reflector, apagar o namespace da app é seguro.**
O cert NÃO mora mais no namespace da app — mora em `certs` e é re-refletido automaticamente
quando o namespace volta. Então o `delete` pode (e deve) apagar o namespace inteiro
(`kubectl delete namespace <ns>`), padronizado em todos os serviços; o `apply`/`pre-init` recria
o namespace e o reflector recoloca o Secret em segundos. (cert-manager renova sozinho ~30 dias
antes, reusando o Secret em `certs`: `kubectl get certificate <n> -n certs -o jsonpath='{.status.renewalTime}'`.)

**D) imagePullSecret (PAT) expira.** Se os pods ficarem `ImagePullBackOff` com `401 Unauthorized`
no registry, o token do `.dockerconfigjson` expirou. Regenerar o PAT, atualizar o `auth`
(base64 de `user:token`) no `.helm/secret.yaml` e no Secret do cluster, e reiniciar os deployments.

---

## Checklist final
- [ ] `grep` no working tree: nenhum segredo fora de `${...}`/template/.env.
- [ ] `git grep` no histórico: 0 para cada valor (DB/LDAP/JKS/OIDC prod+dev/tokens/base64).
- [ ] `helm template` renderiza com `--set app.image.tag=x`.
- [ ] backends compilam (`mvn -pl <modulo> -am compile`).
- [ ] `secret.yaml`, `*-prod.jks`, `*.env` git-ignored; `*.template`/`*.example` versionados.
- [ ] Certs centralizados em `certs` + reflector; Ingressos só referenciam o Secret refletido via
      `ingress.tlsSecretName` (chart sem `certManager`); `delete` apaga o namespace (cert sobrevive);
      `pre-init`/`apply` recria namespace + Secret do keystore a partir de `.helm/*-prod.jks`.
- [ ] Pendências do usuário: `git push --force`; publicar chart; pôr `<app>-prod.jks` em `.helm/`
      (git-ignored; `pre-init` cria o Secret); aplicar rotações; ajustar Flyway (missing migration).

## Armadilhas aprendidas
- O deploy usa o chart PUBLICADO (OCI), não o local → republicar após mudar o chart.
- `helm template` sem `--set app.image.tag` falha por causa do `:` final na imagem (não é bug
  do chart) — citar a imagem entre aspas.
- Seeds Flyway são imutáveis (checksum): não editar migration já aplicada; mover/seed externo +
  tratar "missing migration".
- Dev client-secrets podem estar acoplados ao bcrypt do seed → manter o valor que casa, ou
  tornar o client público.
- Rotacionar keystore = novo par RSA = invalida tokens. Criar uma vez, guardar (ex.: Vault).
- Secret TLS é namespace-scoped: vários ingressos (mesmo host OU namespaces distintos) pedindo
  cert cada um estouram o rate limit do LE (5 idênticos/7 dias). Centralizar em `certs` + reflector
  resolve de vez (1 cert por host, replicado). Migrar com nome de Secret NOVO = sem downtime.
- cert-manager reusa/renova sozinho; com o cert em `certs` + reflector, apagar o namespace da app
  é seguro (o Secret é re-refletido quando o namespace volta).
- Rate-limit (Middleware do Traefik) é proteção real de brute-force (login), não um workaround;
  o provider `kubernetescrd` no Traefik é requisito permanente pra qualquer Middleware.
- Plano futuro: HashiCorp Vault + External Secrets/Vault Secrets Operator materializando o
  Secret (ex.: `apsso-jks`/`apsso-secrets`) sem mudar o chart.

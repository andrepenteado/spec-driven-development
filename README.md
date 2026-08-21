# Spec Driven Development

Este repositório mantém uma especificação compartilhada para orientar a geração de código por IA e para documentar os padrões técnicos usados nos projetos que o adotam.

A ideia é concentrar aqui as regras comuns de arquitetura, stack, nomenclatura, geração de CRUDs, padrões de backend, padrões de frontend, validações e critérios de aceite. Assim, cada projeto consumidor pode manter no próprio `README.md` apenas a documentação específica do produto, como problema, objetivo, solução, público-alvo, escopo funcional e decisões de negócio.

## Conceito

Este projeto é baseado no conceito de **Spec-Driven Development (SDD)**.

No SDD, a implementação não parte apenas de prompts soltos ou decisões implícitas da IA. Antes de gerar ou alterar código, a IA deve ler uma especificação versionada, entender as regras do projeto, validar as entradas, reportar o que pretende fazer e só então executar a mudança confirmada pelo desenvolvedor.

Neste repositório, a spec funciona como uma camada de contrato entre:

- o desenvolvedor, que define intenção, padrões e limites;
- a IA, que usa a documentação como instrução principal;
- o projeto consumidor, que recebe código gerado de forma mais consistente;
- novos desenvolvedores, que podem consultar os padrões esperados antes de manter ou criar funcionalidades.

O objetivo não é substituir análise técnica, revisão de código ou testes. O objetivo é reduzir ambiguidade, evitar geração inconsistente e tornar explícitas as decisões que normalmente ficariam espalhadas em conversas, prompts ou código já existente.

## Papel deste repositório

Este repositório deve ser compartilhado entre projetos como uma documentação guia. Ele descreve como a IA deve trabalhar ao gerar código e quais padrões técnicos devem ser respeitados.

Ele pode ser usado para:

- orientar a IA durante geração de CRUDs;
- padronizar backend, frontend, banco de dados, nomenclatura e mensagens;
- registrar a stack técnica usada nos projetos;
- servir como material de onboarding para novos desenvolvedores;
- documentar critérios mínimos de aceite antes de considerar uma geração concluída;
- separar documentação técnica compartilhada da documentação específica de cada produto.

Nos projetos que usam esta spec, a recomendação é manter:

- `README.md` do projeto consumidor: documentação específica do produto, problema, objetivo, solução, público-alvo, execução local e decisões próprias daquele projeto;
- clone deste repositório: a documentação compartilhada, adicionada ao contexto da IA a partir da própria pasta do clone, sem cópia dentro do projeto consumidor.

## Stack documentada

A stack canônica está em `00-contexto-geral.md`, que é a versão lida pela IA. Em resumo: Java 25 + Spring Boot 4 no backend e Angular 22 no frontend.

Essas tecnologias devem ser tratadas como padrão da documentação atual. Se um projeto consumidor divergir, a divergência deve estar documentada no próprio projeto ou refletida em uma variação desta spec.

## Estrutura

- `orquestrador.md`: ponto de entrada para a IA. Define ordem de leitura, validação, confirmação e geração.
- `00-contexto-geral.md`: regras globais, stack, escopo, auditoria e critérios gerais.
- `01-yaml-contrato.md`: contrato esperado para os YAMLs de CRUD.
- `02-backend-liquibase.md`: regras para changelogs e banco de dados.
- `03-backend-domain.md`: regras para entidades de domínio.
- `04-backend-service.md`: regras para services.
- `05-backend-resource.md`: regras para resources/controllers.
- `06-frontend-rotas-menu-api.md`: regras de rotas, menu e APIs no frontend.
- `07-frontend-domain-service.md`: regras de domain e service no frontend.
- `08-frontend-pesquisar.md`: regras para tela de pesquisa.
- `09-frontend-cadastro.md`: regras para tela de cadastro.
- `10-checklist-final.md`: checklist de validação final.
- `11-monitoramento-faro.md`: RUM dos frontends (Grafana Faro via lib `ngx-apcore`) e padrão de logs dos componentes.
- `12-monitoramento-healthz.md`: healthz do nginx, probes do chart e observabilidade do backend (Tempo/Loki/Prometheus).
- `13-remocao-secrets-backend.md`: playbook de remoção de segredos do working tree e do histórico git.
- `templates/`: referências visuais executáveis para telas.
- `.cruds/`: pasta do projeto consumidor para YAMLs operacionais de CRUD. Ela fica no repositório do consumidor, fora desta spec, para não misturar dados do projeto com a documentação compartilhada.

## Uso no projeto consumidor

Esta spec não é copiada nem versionada dentro do projeto consumidor. Ela vive apenas neste
repositório, em um clone local, e é disponibilizada para a IA adicionando a pasta desse clone ao
contexto da sessão quando o projeto precisar gerar ou revisar código.

Esse modelo dispensa `git subtree` e submódulo, evita cópias divergentes entre projetos e faz com
que todo projeto passe a usar a versão atual da spec com um `git pull` feito aqui, sem sincronização
em cada consumidor.

### 1. Clonar a spec uma vez

```bash
git clone git@github.com:andrepenteado/spec-driven-development.git
```

Mantenha o clone atualizado antes de usá-lo em uma sessão:

```bash
cd /caminho/para/spec-driven-development
git pull
```

### 2. Adicionar a pasta ao contexto da IA

Trabalhando no projeto consumidor, adicione o diretório do clone ao contexto da sessão. No Claude
Code:

```text
/add-dir /caminho/para/spec-driven-development
```

A partir daí a IA lê `orquestrador.md` e os demais arquivos direto da spec, sem que exista qualquer
cópia dentro do projeto consumidor.

### 3. Criar a pasta operacional de CRUDs

Os YAMLs de CRUD são dados do projeto consumidor, não da spec compartilhada, e ficam no repositório
do consumidor. Crie uma pasta `.cruds/` na raiz dele:

```bash
mkdir .cruds
```

Use essa pasta para os YAMLs de entrada e para os manifestos gerados:

```text
.cruds/marca.yaml
.cruds/marca.generated.yaml
```

Um YAML por tabela, sempre — inclusive quando a tela precisa se comportar de forma
diferente conforme o perfil. Quem pode consultar, incluir, alterar e excluir vai em
`tabela.acoes`; o que cada perfil vê em cada campo vai em `por-perfil`, dentro do
próprio campo. As regras estão em `01-yaml-contrato.md`.

### 4. Alterar a spec

Mudanças na spec podem ser detectadas durante o trabalho em um projeto consumidor. Como não existe
cópia no consumidor, a alteração é feita direto no clone deste repositório e commitada aqui:

```bash
cd /caminho/para/spec-driven-development
git status --short
git add .
git commit -m "chore(specs): atualiza especificacoes compartilhadas"
git push
```

Os demais projetos passam a ver a mudança no próximo `git pull` deste repositório. Antes de commitar,
revise se a alteração pertence mesmo à spec compartilhada: YAMLs operacionais, regras específicas de
negócio do consumidor e documentação própria do produto não entram aqui.


## Regras para projetos consumidores

- Não versionar a spec dentro do projeto consumidor: nada de cópia manual, subtree ou submódulo. A spec é usada a partir do clone deste repositório, adicionado ao contexto da IA.
- Alterações em `*.md` e `templates/` são feitas e commitadas neste repositório, não no projeto consumidor.
- Não adaptar a spec silenciosamente em um único projeto consumidor; se a regra é compartilhada, ela deve vir para este repositório.
- Antes de uma sessão que dependa da spec, atualizar o clone com `git pull`.
- Manter a documentação específica do produto no `README.md` do projeto consumidor.
- Usar `.cruds/*.yaml` para os YAMLs operacionais do projeto consumidor, quando a geração de CRUD for necessária.
- Tratar `.cruds/*.generated.yaml` como manifesto daquilo que já foi gerado.
- Manter os YAMLs operacionais em `.cruds/`, no repositório do consumidor, nunca junto da spec compartilhada.
- Se um projeto consumidor precisar divergir da spec, documentar a exceção no próprio projeto e avaliar se a regra deveria virar uma variação oficial deste repositório.

## Como usar em um projeto consumidor

1. Adicione a pasta do clone deste repositório ao contexto da IA.
2. Crie os YAMLs de CRUD em `.cruds/[nome-crud].yaml`, conforme `01-yaml-contrato.md`.
3. Peça para a IA ler e seguir `orquestrador.md`.
4. Confirme explicitamente quais CRUDs executar, depois do relatório de validação.

O fluxo que a IA segue a partir daí — ordem de leitura das specs, validação, relatório de status, geração e manifesto — está definido em `orquestrador.md` e não é repetido aqui.

## Prompt recomendado

Para executar a leitura geral dos CRUDs pendentes:

```text
Leia e siga orquestrador.md como instrução principal para gerar CRUDs.
Os YAMLs de entrada estão em .cruds/.
Valide, reporte status e aguarde confirmação antes de alterar código.
```

Para um YAML específico:

```text
Leia e siga orquestrador.md.
Use o YAML .cruds/marca.yaml.
Valide primeiro, apresente o status e aguarde confirmação antes de criar arquivos.
```

Depois do relatório da IA, confirme explicitamente:

```text
Execute o CRUD marca.
```

## Regras importantes

As regras de precedência e o que a IA não pode fazer estão em `orquestrador.md` (fluxo e precedência) e em `00-contexto-geral.md` (regras globais e templates Angular). Para o desenvolvedor, o que importa saber:

- A IA não sobrescreve CRUD já gerado e não altera arquivos fora do CRUD solicitado.
- Configuração por perfil não gera mais de um CRUD: gera um só, com pesquisa e cadastro que se configuram conforme os perfis do usuário logado.
- `tabela.acoes` é segurança de verdade (vira `@Secured` no service); `por-perfil` é apresentação.
- YAMLs já executados devem ter o respectivo `.generated.yaml`; é ele que marca o CRUD como concluído.
- Padrões reais do projeto consumidor prevalecem sobre os exemplos da spec, desde que não violem os critérios de aceite.

## Observações

Evite pedir apenas:

```text
Execute orquestrador.md
```

Esse pedido pode ser interpretado como leitura simples ou resumo do arquivo.

Prefira:

```text
Leia e siga orquestrador.md como instrução principal.
```

Essa formulação deixa claro que o arquivo deve ser usado como regra de execução, não apenas como conteúdo de referência.

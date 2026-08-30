# Orquestrador de CRUD

Use este arquivo como ponto de entrada. Leia as specs na ordem indicada antes de alterar qualquer código.

## Objetivo

Criar CRUDs novos a partir de YAMLs em `.cruds/*.yaml`, usando Java 25, Spring Boot 4, PostgreSQL, Liquibase, QueryDSL e Angular 22.

## Onde a spec e o projeto vivem

A spec **não** é copiada para dentro do projeto consumidor, nem como cópia manual, nem
como subtree, nem como submódulo git. Ela é um clone próprio, adicionado ao contexto da
sessão (`/add-dir`). Existem, portanto, **duas raízes distintas** durante a geração:

- **Pasta da spec** (somente leitura): `orquestrador.md`, os `.md` numerados e
  `templates/`. Todo caminho citado nas specs que termine em `.md` ou comece por
  `templates/` é relativo a ela.
- **Raiz do projeto consumidor** (diretório de trabalho da sessão): `.cruds/`, código de
  backend e frontend, changelogs Liquibase, `frontend/src/styles.css`. Todo caminho de
  entrada ou de saída da geração é relativo a ela.

Regras:

- `.cruds/*.yaml` fica na raiz do projeto consumidor. Se não houver `.cruds/` lá, relatar
  isso e parar — não procurar YAML dentro da pasta da spec.
- Nada é criado ou alterado dentro da pasta da spec durante a geração de CRUD, inclusive
  `.generated.yaml`, que é gravado em `.cruds/` do consumidor.
- Alterar a spec só quando o pedido for explicitamente sobre ela. A mudança é commitada no
  repositório da spec, nunca copiada para o projeto consumidor.

## Ordem de leitura obrigatória

1. `00-contexto-geral.md`
2. `01-yaml-contrato.md`
3. `02-backend-liquibase.md`
4. `03-backend-domain.md`
5. `04-backend-service.md`
6. `05-backend-resource.md`
7. `06-frontend-rotas-menu-api.md`
8. `07-frontend-domain-service.md`
9. `08-frontend-pesquisar.md`
10. `09-frontend-cadastro.md`
11. `10-checklist-final.md`
12. `11-monitoramento-faro.md`
13. `12-monitoramento-healthz.md`
14. `13-remocao-secrets-backend.md`

As specs 11 a 13 são padrões de módulo/plataforma (monitoramento e segredos):
valem para o módulo como um todo, não por CRUD. Ler quando o trabalho tocar
telemetria, healthz/probes, deploy ou segredos — na geração de CRUD, aplicar
apenas o padrão de logs de `11-monitoramento-faro.md`.

## Fluxo obrigatório

1. Escanear `.cruds/*.yaml`, ignorando `*.generated.yaml`.
2. Validar cada YAML conforme `01-yaml-contrato.md`.
3. Inspecionar o projeto real e identificar padrões existentes.
4. Apresentar relatório com status: `novo`, `existente`, `conflito` ou `invalido`, listando os perfis e as ações de cada CRUD.
5. Executar a geração na sequência, sem pedir confirmação e sem aguardar aprovação: todo CRUD com status `novo` é implementado no mesmo comando que disparou a leitura. O relatório do item 4 é informativo, não é um ponto de parada.
6. Gerar apenas os CRUDs `novo`. CRUDs `existente`, `conflito` ou `invalido` não são gerados nem alterados: apenas relatados com o motivo. Se o usuário nomeou CRUDs específicos no pedido, gerar somente esses.
7. Gerar backend, depois frontend.
8. Criar `.cruds/[nome-crud].generated.yaml` apenas após sucesso.
9. Informar arquivos criados/alterados, validações executadas, campos `obrigatorio: true` ocultos para algum perfil que possa incluir e **o que foi implementado a partir do `prompt` de cada `regra` e de cada ação customizada**.

## Regras de precedência

- As specs da pasta adicionada ao contexto prevalecem sobre inferências genéricas da IA.
- Padrões reais do projeto prevalecem sobre exemplos, desde que não violem critérios de aceite.
- Templates em `templates/`, na pasta da spec, são referência visual executável, não código a copiar: as regras de template Angular estão em `00-contexto-geral.md`.
- Se houver conflito entre specs, pare e relate o conflito.

## Critérios de aceite

- Nenhum CRUD existente ou conflitante foi sobrescrito.
- Todas as specs aplicáveis foram usadas.
- Backend e frontend compartilham os mesmos nomes derivados, endpoints, labels, filtros e enums.
- Cada campo `tipo: lista` gerou tabela e entidade filhas nos dois lados, com service e resource próprios apenas quando `persistencia: independente`, e nunca rota ou menu.
- O CRUD é um só, parametrizado por perfil em tempo de execução, sem duplicar arquivo algum.
- As ações de `tabela.acoes` chegaram ao `@Secured` do service, não só aos botões da tela.
- O manifesto `.generated.yaml` foi criado somente depois da geração bem-sucedida.

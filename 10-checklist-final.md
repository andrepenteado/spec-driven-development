# 10 - Checklist Final

## Validação antes de gerar

- Escanear `.cruds/*.yaml`, ignorando `*.generated.yaml`.
- Classificar cada YAML como `novo`, `existente`, `conflito` ou `invalido`.
- Validar metadados obrigatórios, nomes, tipos, FKs, `fk-tipo`, enums, `aba`, blocos `lista`, pesquisa e layout.
- Confirmar padrões reais do backend/frontend.
- Perguntar quais CRUDs executar.

## Backend

- Liquibase criado/alterado na versão correta, incluindo a tabela filha de cada `tipo: lista`.
- Enum Java criado quando necessário.
- Entidade criada com auditoria e validações.
- Entidade filha criada por `tipo: lista`, conforme `lista.persistencia`: `agregado` com `@OneToMany` no pai e `@JsonIgnore` na volta; `independente` com auditoria, repository, service e resource próprios.
- Repository criado com QueryDSL quando houver pesquisa.
- Filter QueryDSL criado quando houver `pesquisavel != false`.
- Service criado com auditoria, segurança e logs, religando os filhos ao pai antes de gravar.
- Resource criado com endpoints corretos.

## Frontend

- Rotas criadas com `crudRoutes()` recebendo o objeto de opções.
- Menu atualizado.
- API constante criada.
- Enum TypeScript criado quando necessário.
- Entidade TypeScript criada, mais uma por `tipo: lista`; service Angular do filho criado apenas em `persistencia: independente`.
- Service Angular criado com `INIT_CONFIG`.
- Pesquisa criada seguindo template, estendendo `PesquisarBaseComponent`, com filtro resolvido no backend via `/pesquisar` e grid client-side.
- Cadastro criado seguindo template, estendendo `CadastroBaseComponent`, com abas de `aba`, controles de `fk-tipo` e abas de lista.
- Operações de pesquisar, buscar, gravar e excluir logam com `console.info` (padrão em `11-monitoramento-faro.md`).

## Regras críticas

- Não criar testes.
- Não sobrescrever CRUD existente.
- Não usar DTOs/mappers/interfaces de service salvo padrão obrigatório.
- Não usar `/api`, `baseUrl`, `resourceUrl` ou chamada relativa pura no Angular service.
- Não usar pesquisa antiga `campo`/`valor` nem filtrar a lista em memória no frontend.
- Não usar DataTables server-side (`Datatables.serverSide()`/`Datatables.aoClicarAcao()`): paginação, ordenação e busca são client-side. Server-side é evolução futura, fora desta spec.
- Não implementar pesquisa ou cadastro à mão: as telas estendem `PesquisarBaseComponent` e `CadastroBaseComponent`.
- Não usar `@ManyToMany` em nenhuma entidade.
- Não criar rota nem item de menu para entidade filha de lista, em nenhuma persistência.
- Não criar repository, service nem resource para lista `agregado`.
- Não gerar `<html>`, `<head>`, `<body>`, CDNs ou scripts em templates Angular.

## Manifesto

Criar `.cruds/[nome-crud].generated.yaml` após sucesso, com checksum normalizado, data/hora, status e arquivos gerados.

## Relatório final

Informar:
- CRUDs executados.
- Arquivos criados/alterados.
- Validações executadas.
- Qualquer pendência ou padrão do projeto que exigiu adaptação.

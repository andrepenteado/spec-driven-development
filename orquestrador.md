# Orquestrador de CRUD

Use este arquivo como ponto de entrada. Leia as specs na ordem indicada antes de alterar qualquer código.

## Objetivo

Criar CRUDs novos a partir de YAMLs em `.specs/cruds/*.yaml`, usando Java 25, Spring Boot 4, PostgreSQL, Liquibase, QueryDSL e Angular 21.

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

## Fluxo obrigatório

1. Escanear `.specs/cruds/*.yaml`, ignorando `*.generated.yaml`.
2. Validar cada YAML conforme `01-yaml-contrato.md`.
3. Inspecionar o projeto real e identificar padrões existentes.
4. Apresentar relatório com status: `novo`, `existente`, `conflito` ou `invalido`.
5. Perguntar explicitamente quais CRUDs novos executar.
6. Alterar código somente após confirmação do usuário.
7. Gerar backend, depois frontend.
8. Criar `.specs/cruds/[nome-crud].generated.yaml` apenas após sucesso.
9. Informar arquivos criados/alterados e validações executadas.

## Regras de precedência

- Specs desta pasta prevalecem sobre inferências genéricas da IA.
- Padrões reais do projeto prevalecem sobre exemplos, desde que não violem critérios de aceite.
- Templates em `.specs/templates` são referência visual executável; em Angular, omitir `<html>`, `<head>`, `<body>`, CDNs e scripts.
- Se houver conflito entre specs, pare e relate o conflito.

## Critérios de aceite

- Nenhum CRUD existente ou conflitante foi sobrescrito.
- Todas as specs aplicáveis foram usadas.
- Backend e frontend compartilham os mesmos nomes derivados, endpoints, labels, filtros e enums.
- O manifesto `.generated.yaml` foi criado somente depois da geração bem-sucedida.

# 10 - Checklist Final

## Validação antes de gerar

- Escanear `.cruds/*.yaml`, ignorando `*.generated.yaml`.
- Classificar cada YAML como `novo`, `existente`, `conflito` ou `invalido`.
- Validar metadados obrigatórios, nomes, tipos, FKs, enums, pesquisa e layout.
- Confirmar padrões reais do backend/frontend.
- Perguntar quais CRUDs executar.

## Backend

- Liquibase criado/alterado na versão correta.
- Enum Java criado quando necessário.
- Entidade criada com auditoria e validações.
- Repository criado com QueryDSL quando houver pesquisa.
- Filter QueryDSL criado quando houver `pesquisavel != false`.
- Service criado com auditoria, segurança e logs.
- Resource criado com endpoints corretos.

## Frontend

- Rotas criadas.
- Menu atualizado.
- API constante criada.
- Enum TypeScript criado quando necessário.
- Entidade TypeScript criada.
- Service Angular criado com `INIT_CONFIG`.
- Pesquisa criada seguindo template e filtros.
- Cadastro criado seguindo template.

## Regras críticas

- Não criar testes.
- Não sobrescrever CRUD existente.
- Não usar DTOs/mappers/interfaces de service salvo padrão obrigatório.
- Não usar `/api`, `baseUrl`, `resourceUrl` ou chamada relativa pura no Angular service.
- Não usar pesquisa antiga `campo`/`valor`.
- Não gerar `<html>`, `<head>`, `<body>`, CDNs ou scripts em templates Angular.

## Manifesto

Criar `.cruds/[nome-crud].generated.yaml` após sucesso, com checksum normalizado, data/hora, status e arquivos gerados.

## Relatório final

Informar:
- CRUDs executados.
- Arquivos criados/alterados.
- Validações executadas.
- Qualquer pendência ou padrão do projeto que exigiu adaptação.

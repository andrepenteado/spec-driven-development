# 00 - Contexto Geral

## Objetivo

Definir regras globais para geração de CRUD.

## Stack

- Backend: Java 25, Spring Boot 4, PostgreSQL, Liquibase, Logback e QueryDSL.
- Frontend: Angular 21, Node 24, Bootstrap 5, FontAwesome 7, ngx-ui-loader, ngx-toastr, ngx-mask e ng-select.

## Escopo

- Criar backend: Liquibase, domain, service e resource.
- Criar frontend: rotas, menu, API, domain, service, pesquisa e cadastro.
- Não criar testes.
- Não alterar CRUD já gerado.

## Regras gerais

- Inspecionar o projeto real antes de criar arquivos.
- Seguir padrões existentes de pacotes, nomes, imports, logs, exceptions, layout, menu, loaders e DataTables.
- Usar português do Brasil em mensagens, logs, validações e comentários.
- Mensagens devem usar `tabela.label`, não termos genéricos como "Registro".
- Concordância: labels terminados em "a" usam feminino; demais usam masculino.
- Todo arquivo `.java` ou `.ts` criado deve iniciar com comentário contendo autor, data/hora pt_BR e observação de que foi criado com ajuda da IA.
- Toda classe `.java` criada deve usar Javadoc na classe e nos métodos.
- Preserve código existente e não sobrescreva arquivos não pertencentes ao CRUD.

## Auditoria

Todo CRUD deve incluir, mesmo ausente no YAML:

| Campo | Coluna | Tipo | Preenchimento |
|---|---|---|---|
| `criadoPor` | `criado_por` | string/VARCHAR | Inclusão |
| `criadoEm` | `criado_em` | datetime/TIMESTAMP | Inclusão |
| `alteradoPor` | `alterado_por` | string/VARCHAR | Alteração |
| `alteradoEm` | `alterado_em` | datetime/TIMESTAMP | Alteração |

Regras:
- Não exibir auditoria no grid nem como controles editáveis.
- No cadastro, exibir auditoria conforme `09-frontend-cadastro.md`.
- Preencher auditoria exclusivamente no service com `SecurityService`.
- O service obtém usuário com `securityService.getUserLogin().getLogin()`, sem fallback.
- Na alteração, preservar criação e preencher alteração.

## Critérios de aceite

- Nenhum arquivo existente de outro CRUD foi sobrescrito.
- Auditoria existe no banco, entidade, TypeScript e service.
- Resource não participa do preenchimento da auditoria.

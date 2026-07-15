# 07 - Frontend Domain Service

## Objetivo

Criar enums, entidade TypeScript e service Angular.

## Saídas

- `src/app/domain/enums/[nome-enum].ts`
- `src/app/domain/entities/[nome-tabela].ts`
- `src/app/services/[nome-tabela].service.ts`

## Enum TypeScript

- Criar `enum` e `Record<Enum, string>` de labels.

## Entidade TypeScript

- `id?: number`.
- `fk`: tipo da entidade referenciada.
- `textoN`: tipo `string`.
- `foto`/`arquivo`: tipo `Upload` (de `@andre.penteado/ngx-apcore`).
- `enum`: tipo do enum gerado.
- Auditoria opcional: `criadoPor`, `criadoEm`, `alteradoPor`, `alteradoEm`.

## Service Angular

- Usar `inject()` para `HttpClient` e `INIT_CONFIG`.
- Concatenar `${this.initConfig.urlBackend}${API_[NOME_TABELA_PLURAL]}` em cada método.
- Não declarar `baseUrl`, `resourceUrl`, `/api` hardcoded nem chamada relativa pura.
- Métodos: `listar()`, `buscar(id)`, `incluir(obj)`, `alterar(obj, id)`, `excluir(id)`.
- Se houver pesquisa, criar `pesquisar(filtro)`.
- Pesquisa usa `HttpParams` com todos os campos preenchidos do objeto `filtro`.
- Não usar parâmetros genéricos `campo` e `valor`.
- Exportar interface `[NomeTabela]Filtro` com propriedades opcionais dos campos pesquisáveis.
- Exportar constante `[NOME_TABELA]_CAMPOS_PESQUISA` com `{ campo, label, tipo, enumLabels? }`.

## Critérios de aceite

- Tipos são específicos; não usar `any`.
- Filtro Angular tem os mesmos campos do filter backend.
- Enum usa labels consistentes no cadastro, pesquisa e filtros.

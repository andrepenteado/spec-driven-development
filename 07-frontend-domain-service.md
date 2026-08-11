# 07 - Frontend Domain Service

## Objetivo

Criar enums, entidade TypeScript e service Angular.

## Saídas

- `src/app/domain/enums/[nome-enum].ts`
- `src/app/domain/entities/[nome-tabela].ts`
- `src/app/domain/entities/[nome-tabela-filha].ts`, uma por campo `tipo: lista`
- `src/app/services/[nome-tabela].service.ts`

## Enum TypeScript

- Criar `enum` e `Record<Enum, string>` de labels.

## Entidade TypeScript

- `id?: number`.
- `fk`: tipo da entidade referenciada.
- `textoN`: tipo `string`.
- `foto`/`arquivo`: tipo `Upload` (de `@andre.penteado/ngx-apcore`).
- `enum`: tipo do enum gerado.
- `lista` com `persistencia: agregado`: `[NomeTabelaFilha][]`, com o nome do campo em camelCase.
- `lista` com `persistencia: independente`: **não** declarar o campo na entidade do CRUD — a coleção é carregada à parte, pelo service do filho.
- Auditoria opcional: `criadoPor`, `criadoEm`, `alteradoPor`, `alteradoEm`.

## Entidade TypeScript da lista

Uma classe por campo `tipo: lista`, com `id?: number` e um campo por subcampo de
`lista.campos` (mesmas regras de tipo acima). Subcampos com `fk` usam o service da
entidade referenciada para popular combo/switches, como qualquer FK.

`persistencia: agregado`:

- **Não** declarar a volta ao pai: ela é `@JsonIgnore` no backend e nunca trafega.
- **Não** declarar auditoria: ela pertence ao registro do CRUD.
- **Não** criar service Angular: a coleção viaja dentro do objeto do CRUD.

`persistencia: independente`:

- **Declarar** a volta ao pai (`paciente!: Paciente`): o filho trafega sozinho e o frontend a preenche antes de gravar.
- **Declarar** auditoria opcional, como em qualquer entidade gravada por si.
- **Criar** `src/app/services/[nome-tabela-filha].service.ts`, com os mesmos padrões dos demais services (`inject()`, `INIT_CONFIG`, constante de API) e os métodos `listarPor[NomeTabelaPai](id)`, `buscar(id)`, `incluir(obj)`, `alterar(obj, id)` e `excluir(id)`, batendo nos endpoints de `05-backend-resource.md`.

## Service Angular

- Usar `inject()` para `HttpClient` e `INIT_CONFIG`.
- Concatenar `${this.initConfig.urlBackend}${API_[NOME_TABELA_PLURAL]}` em cada método.
- Não declarar `baseUrl`, `resourceUrl`, `/api` hardcoded nem chamada relativa pura.
- Métodos: `listar()`, `buscar(id)`, `incluir(obj)`, `alterar(obj, id)`, `excluir(id)`.
- Se houver pesquisa, criar `pesquisar(filtro)` chamando `GET /[nome-tabela-plural]/pesquisar`.
- Pesquisa usa `HttpParams` com todos os campos preenchidos do objeto `filtro`.
- Não usar parâmetros genéricos `campo` e `valor`.
- Exportar interface `[NomeTabela]Filtro` com propriedades opcionais dos campos pesquisáveis. Subcampos de lista não entram no filtro.
- Exportar constante `[NOME_TABELA]_CAMPOS_PESQUISA` com `{ campo, label, tipo, enumLabels? }`.

## Critérios de aceite

- Tipos são específicos; não usar `any`.
- Filtro Angular tem os mesmos campos do filter backend.
- Enum usa labels consistentes no cadastro, pesquisa e filtros.
- Lista tem entidade TypeScript própria; `agregado` sem service/auditoria/volta ao pai, `independente` com os três.

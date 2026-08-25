# 07 - Frontend Domain Service

## Objetivo

Criar enums, entidade TypeScript e service Angular.

## Saídas

- `src/app/domain/enums/[nome-enum].ts`
- `src/app/domain/entities/[nome-tabela].ts`
- `src/app/domain/entities/[nome-tabela-filha].ts`, uma por campo `tipo: lista`
- `src/app/services/[nome-tabela].service.ts`

## Enum TypeScript

- Criar um arquivo por bloco `enum` (`01-yaml-contrato.md`) em
  `src/app/domain/enums/`, com o nome do arquivo em kebab-case de `enum.nome`.
- Exportar o `enum` com as mesmas constantes do Java, cada uma com o próprio nome como
  valor (nunca numérico: o backend serializa a constante como texto), e o
  `Record<Enum, string>` de labels chamado `[NOME_ENUM]_LABELS`.

```ts
export enum SituacaoPedido {
  ABERTO = 'ABERTO',
  FATURADO = 'FATURADO',
  CANCELADO = 'CANCELADO'
}

export const SITUACAO_PEDIDO_LABELS: Record<SituacaoPedido, string> = {
  [SituacaoPedido.ABERTO]: 'Aberto',
  [SituacaoPedido.FATURADO]: 'Faturado',
  [SituacaoPedido.CANCELADO]: 'Cancelado'
};
```

- Os labels são os mesmos de `enum.valores` e do `descricao` do enum Java. É esse
  `Record` que alimenta grid, filtro e radio buttons — nenhuma tela escreve label de
  enum à mão.
- Enum já existente com o mesmo nome é reaproveitado, nunca sobrescrito.

## Entidade TypeScript

- Campo oculto para um perfil por `por-perfil` (`01-yaml-contrato.md`) continua
  declarado aqui e continua trafegando no payload: a entidade é uma só.
- `id?: number`.
- `fk`: tipo da entidade referenciada.
- `textoN`, `editor`, `email` e `link`: tipo `string`.
- `moeda`: tipo `number`, com duas casas decimais. O JSON trafega número, não string formatada — a formatação com `R$` é da tela. Quem garante o `number` na volta do formulário é o `outputTransformFn` do campo (`09-frontend-cadastro.md`, "Campo monetário"): a máscara sozinha entrega texto.
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
- Um método por ação customizada (`01-yaml-contrato.md`), com o nome em camelCase, dando `POST` em `${API}/${id}/[acao-kebab]` com body vazio e devolvendo a entidade atualizada.
- Se houver pesquisa, criar `pesquisar(filtro)` chamando `GET /[nome-tabela-plural]/pesquisar`.
- Pesquisa usa `HttpParams` com todos os campos preenchidos do objeto `filtro`.
- Não usar parâmetros genéricos `campo` e `valor`.
- Exportar interface `[NomeTabela]Filtro` com propriedades opcionais dos campos pesquisáveis — os de **qualquer** perfil, igual ao filter do backend. Subcampos de lista não entram no filtro.
- Exportar constante `[NOME_TABELA]_CAMPOS_PESQUISA` com `{ campo, label, tipo, enumLabels? }`.

## Critérios de aceite

- Tipos são específicos; não usar `any`.
- Filtro Angular tem os mesmos campos do filter backend.
- Enum usa labels consistentes no cadastro, pesquisa e filtros.
- Lista tem entidade TypeScript própria; `agregado` sem service/auditoria/volta ao pai, `independente` com os três.

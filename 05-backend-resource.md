# 05 - Backend Resource

## Objetivo

Criar endpoints REST do CRUD.

## Saída

- `[pacote-base].resources.[NomeTabela]Resource`

## Regras

- Endpoint base: `[nome-tabela-plural]`.
- Usar `@Observed` na classe.
- Resource não participa da auditoria.
- Resource não repete `@Secured`: a autorização por ação (`tabela.acoes`) fica no
  service (`04-backend-service.md`), que é onde a regra de negócio vive.
- Retornar objetos diretamente, salvo padrão diferente do projeto.
- Logar endpoint, parâmetros e `tabela.label`.

## Endpoints

| Verbo | Path | Delegação |
|---|---|---|
| `GET` | `/[nome-tabela-plural]` | `servico.listar()` |
| `GET` | `/[nome-tabela-plural]/pesquisar?[campos-pesquisaveis]=...` | `servico.pesquisar(filtro)` |
| `GET` | `/[nome-tabela-plural]/{id}` | `servico.buscar(id)` |
| `POST` | `/[nome-tabela-plural]` | `servico.incluir(obj)` |
| `PUT` | `/[nome-tabela-plural]/{id}` | `servico.alterar(obj, id)` |
| `DELETE` | `/[nome-tabela-plural]/{id}` | `servico.excluir(id)` |
| `POST` | `/[nome-tabela-plural]/{id}/[acao-kebab]` | `servico.[acao](id)`, ação customizada sem `corpo` |
| `POST` | `/[nome-tabela-plural]/{id}/[acao-kebab]` | `servico.[acao](obj, id)`, ação customizada com `corpo: true` |

Crie `/pesquisar` somente se houver campo pesquisável para algum perfil
(`01-yaml-contrato.md`).

Cada item de `tabela.acoes-customizadas` gera um `POST` em `/{id}/[acao-kebab]`. Por
default a ação vai **sem request body**: é um comando sobre um registro. Com `corpo: true`
(`01-yaml-contrato.md`) ela recebe no body a entidade do CRUD, a mesma do `PUT` de
`alterar`, e delega `servico.[acao](obj, id)` — sem DTO próprio e sem endpoint a mais.
`POST` nos dois casos, porque muda estado sem ser substituição do recurso (`PUT`) nem
edição de campo (`PATCH`). O retorno é a entidade atualizada.

Em `/pesquisar`, receba `[NomeTabela]Filter filtro` por binding de query params, sem
request body e sem parâmetros genéricos `campo`/`valor`.

## Listas (`tipo: lista`)

### `persistencia: agregado`

- **Não** criar resource, endpoint nem sub-recurso para a entidade filha.
- A coleção trafega dentro do próprio objeto do CRUD, nos mesmos `POST`/`PUT`
  da tabela acima.

### `persistencia: independente`

Criar `[NomeTabelaFilha]Resource`, com `@Observed` e os mesmos padrões de log:

| Verbo | Path | Delegação |
|---|---|---|
| `GET` | `/[filhos-plural]/por-[nome-tabela-pai]/{id}` | `servico.listarPor[Pai](id)` |
| `GET` | `/[filhos-plural]/{id}` | `servico.buscar(id)` |
| `POST` | `/[filhos-plural]` | `servico.incluir(obj)` |
| `PUT` | `/[filhos-plural]/{id}` | `servico.alterar(obj, id)` |
| `DELETE` | `/[filhos-plural]/{id}` | `servico.excluir(id)` |

- O caminho de listagem é `por-[pai]/{id}` para não colidir com `GET /{id}`, que
  busca o filho pela própria chave. Não usar `GET /[filhos-plural]/{idPai}`.
- Não criar `/pesquisar` para o filho: lista não tem campos pesquisáveis.

## Critérios de aceite

- Endpoints delegam ao service correto.
- `/pesquisar` usa filter QueryDSL.
- Não existe recebimento de usuário/autenticação para auditoria no resource.
- Cada ação customizada tem um `POST /{id}/[acao]` que só delega ao service, com body
  apenas quando ela declara `corpo: true`.
- Lista `agregado` não gerou nenhum endpoint; lista `independente` gerou os cinco
  acima, com a listagem em `por-[pai]/{id}`.

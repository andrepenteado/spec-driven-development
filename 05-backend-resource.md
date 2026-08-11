# 05 - Backend Resource

## Objetivo

Criar endpoints REST do CRUD.

## Saída

- `[pacote-base].resources.[NomeTabela]Resource`

## Regras

- Endpoint base: `[nome-tabela-plural]`.
- Usar `@Observed` na classe.
- Resource não participa da auditoria.
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

Crie `/pesquisar` somente se houver campo pesquisável. Receba `[NomeTabela]Filter filtro` por binding de query params, sem request body e sem parâmetros genéricos `campo`/`valor`.

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
- Lista `agregado` não gerou nenhum endpoint; lista `independente` gerou os cinco
  acima, com a listagem em `por-[pai]/{id}`.

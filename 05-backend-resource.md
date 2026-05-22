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

## Critérios de aceite

- Endpoints delegam ao service correto.
- `/pesquisar` usa filter QueryDSL.
- Não existe recebimento de usuário/autenticação para auditoria no resource.

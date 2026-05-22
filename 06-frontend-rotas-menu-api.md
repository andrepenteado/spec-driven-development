# 06 - Frontend Rotas Menu API

## Objetivo

Registrar rotas, menu e constante de API.

## Saídas

- `src/app/pages/[nome-tabela]/[nome-tabela].routes.ts`
- Alteração em `src/app/config/routes.ts`
- Alteração em `src/app/config/menu.ts`
- Alteração em `src/app/config/api.ts`

## Rotas

- Rota raiz `[nome-tabela]` com `loadChildren`.
- Rotas internas:
  - `pesquisar`
  - `cadastro`
  - `cadastro/:id`

## Menu

- Adicionar item raiz, sem grupo/submenu.
- `id: "[nome-tabela]"`
- `texto: "tabela.plural"`
- `path: "/[nome-tabela-plural]"`
- `icone` coerente ou `"tag"`.
- Roles vêm do trecho depois de `:` em `projeto.perfis`, no formato `` `${PREFIXO_PERFIL_SISTEMA}PERFIL` ``.

## API

- Em `src/app/config/api.ts`, adicionar:

```ts
export const API_[NOME_TABELA_PLURAL]: string = '/[nome-tabela-plural]';
```

- Não usar `/api` hardcoded.

## Critérios de aceite

- Pesquisa e cadastro são acessíveis pelas rotas.
- Menu respeita roles.
- Services usam a constante de API.

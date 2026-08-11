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
- Rotas internas geradas por `crudRoutes()` de `@andre.penteado/ngx-apcore` (>= 22.0.0), não escritas à mão:

```ts
import { Routes } from '@angular/router';
import { PesquisarComponent } from "./pesquisar/pesquisar.component";
import { CadastroComponent } from "./cadastro/cadastro.component";
import { crudRoutes } from "@andre.penteado/ngx-apcore";
import { PREFIXO_PERFIL_SISTEMA } from "../../config/layout";

export const [nomeTabela]Routes: Routes = crudRoutes(
  PesquisarComponent,
  CadastroComponent,
  [`${PREFIXO_PERFIL_SISTEMA}PERFIL`]
  // idParam opcional (4º argumento) quando a chave não é "id", ex.: 'username'
);
```

- `crudRoutes()` monta as 3 rotas padrão (`pesquisar`, `cadastro`, `cadastro/:id`), já protegidas por `autorizarPerfilGuard`.
- Não recriar manualmente o array de rotas quando `crudRoutes()` cobrir o caso.

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

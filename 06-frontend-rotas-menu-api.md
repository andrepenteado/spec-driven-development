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
  { perfisAutorizados: [`${PREFIXO_PERFIL_SISTEMA}PERFIL`] }
);
```

- `crudRoutes()` monta as 3 rotas padrão (`pesquisar`, `cadastro`, `cadastro/:id`) mais o redirecionamento da rota vazia para `pesquisar`.
- O 3º argumento é um **objeto de opções** (`CrudRoutesOpcoes`), não uma lista de perfis:
  - `perfisAutorizados?: string[]` — protege as 3 rotas com `autorizarPerfilGuard`. Omitido, as rotas ficam sem guard de perfil.
  - `idParam?: string` — nome do parâmetro de rota do ID na edição. Default `id`; usar quando a chave for outra, ex.: `'username'`.
  - `redirecionarParaPesquisar?: boolean` — default `true`.
- Os componentes podem ser passados como classe ou como import dinâmico (`() => import('./x').then(c => c.X)`), para carga sob demanda.
- Não recriar manualmente o array de rotas quando `crudRoutes()` cobrir o caso.
- Campo `tipo: lista` **não** gera rota, nas duas persistências: a coleção é sempre editada dentro do cadastro do CRUD pai, mesmo quando o filho tem endpoints próprios.

## Menu

- Um item por CRUD; lista não gera item de menu.
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
- Cada lista `persistencia: independente` também ganha a sua constante,
  `API_[NOME_TABELA_FILHA_PLURAL]`. Lista `agregado` não ganha nenhuma: ela não tem
  endpoint próprio.

## Critérios de aceite

- Pesquisa e cadastro são acessíveis pelas rotas.
- `crudRoutes()` recebe o objeto de opções, não uma lista de perfis solta.
- Menu respeita roles.
- Services usam a constante de API.

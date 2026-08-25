# 06 - Frontend Rotas Menu API

## Objetivo

Registrar rotas, menu, constante de API e, quando o CRUD tiver ações ou campos
configurados por perfil, a configuração de perfil do CRUD.

## Saídas

- `src/app/pages/[nome-tabela]/[nome-tabela].routes.ts`
- Alteração em `src/app/config/routes.ts`
- Alteração em `src/app/config/menu.ts`
- Alteração em `src/app/config/api.ts`

Somente quando o YAML tiver `tabela.acoes`, `lista.acoes` ou algum `por-perfil`
(`01-yaml-contrato.md`):

- `src/app/config/perfis-crud.ts` — criado uma única vez no projeto e reaproveitado
  pelos CRUDs seguintes
- `src/app/pages/[nome-tabela]/[nome-tabela].perfis.ts`

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

- `perfisAutorizados` recebe **todos** os perfis depois de `:` em `projeto.perfis`, e
  não apenas os de uma ação: as rotas são as mesmas para todos os perfis do CRUD, e o
  que muda é o conteúdo das telas. Quem pode consultar precisa abrir tanto a pesquisa
  quanto o cadastro.
- `crudRoutes()` aplica o mesmo `perfisAutorizados` às três rotas, então a rota de
  inclusão não é separável por guard: perfil sem a ação `incluir` é barrado dentro do
  componente de cadastro (`09-frontend-cadastro.md`).

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
- Roles vêm do trecho depois de `:` em `projeto.perfis`, no formato `` `${PREFIXO_PERFIL_SISTEMA}PERFIL` ``, com todos os perfis do CRUD.
- O item de menu é **um só**, independente de quantos perfis ou ações o CRUD tenha.

## API

- Em `src/app/config/api.ts`, adicionar:

```ts
export const API_[NOME_TABELA_PLURAL]: string = '/[nome-tabela-plural]';
```

- Não usar `/api` hardcoded.
- Cada lista `persistencia: independente` também ganha a sua constante,
  `API_[NOME_TABELA_FILHA_PLURAL]`. Lista `agregado` não ganha nenhuma: ela não tem
  endpoint próprio.

## Configuração por perfil

Só quando o YAML tem `tabela.acoes`, `lista.acoes` ou algum `por-perfil`
(`01-yaml-contrato.md`). Sem nada disso, nada desta seção é gerado — nem os arquivos,
nem a injeção de `LoginService` nas telas.

### Por que existem dois arquivos

A tela é **uma só** e é compilada uma vez, mas o perfil do usuário só é conhecido
quando ele faz login. Então "esconder o botão Excluir do caixa" não é uma decisão de
geração: é uma decisão que o template precisa tomar a cada carregamento, com o
usuário na mão.

Sem um lugar para guardar essa configuração, a lista de perfis vaza para dentro do
HTML, repetida em cada ponto onde o campo aparece — cadastro, coluna do grid, filtro
da pesquisa:

```html
<!-- o que NÃO fazer -->
@if (loginService.hasAnyRole([`${PREFIXO}GERENTE`])) {
  <input formControlName="desconto">
}
@if (loginService.hasAnyRole([`${PREFIXO}CAIXA`, `${PREFIXO}GERENTE`])) {
  <td>{{ item.desconto }}</td>
}
```

Trocar um perfil vira caça ao string em vários arquivos, e a regra "perfis somam
permissões" acaba reimplementada errado em cada `@if`. Os dois arquivos separam isso
em **motor** e **dados**:

| Arquivo | Escopo | O que contém |
|---|---|---|
| `src/app/config/perfis-crud.ts` | um por projeto | os tipos e a função que combina os perfis do usuário. É sempre o mesmo código: escrito uma vez, reusado por todos os CRUDs |
| `src/app/pages/[nome-tabela]/[nome-tabela].perfis.ts` | um por CRUD | a tradução literal do YAML daquele CRUD: uma entrada por perfil, com ações e campos |

O CRUD tem duas telas (pesquisa e cadastro) que precisam da **mesma** configuração —
por isso ela fica ao lado das duas, no arquivo do CRUD, e não dentro de um dos
componentes.

### Gere só as fatias que o YAML declara

A configuração tem quatro fatias independentes, e **cada uma só existe quando o YAML
declara a coisa correspondente**:

| Fatia | Só quando o YAML tem |
|---|---|
| `acoes` | `tabela.acoes` |
| `acoesCustomizadas` | `tabela.acoes-customizadas` |
| `campos` | algum campo com `por-perfil` ou `edicao` |
| `listas` | algum `lista.acoes` |

O gate é **por fatia, não por CRUD**: um YAML que declara só `lista.acoes` gera só
`listas` — e o `perfis-crud.ts` daquele projeto só carrega o código dessa fatia.

Não é preciosismo. Emitir a estrutura inteira porque *uma* das fatias existe produz um
mapa de campos com os mesmos valores repetidos para todos os perfis, um mapa de ações
todo `true` e um `acoesCustomizadas` vazio — dezenas de linhas por CRUD que nenhum
template lê e que precisam ser mantidas em sincronia com o YAML na mão. O sintoma é
sempre o mesmo: uma configuração de duzentas linhas cujo conteúdo real são dois
booleanos.

Quando nenhuma fatia existe, **não gere nenhum dos dois arquivos**: perfil vira
`loginService.hasRole(...)` no componente que precisar, e a seção "Configuração por
perfil" de `09-frontend-cadastro.md` não se aplica.

### `src/app/config/perfis-crud.ts`

Criado uma única vez no projeto, no primeiro CRUD que precisar, e reaproveitado pelos
seguintes. Não duplicar por CRUD.

```ts
import { LoginService } from "@andre.penteado/ngx-apcore";

/** Ações de CRUD liberadas para o usuário logado. */
export interface AcoesCrud {
  consultar: boolean;
  incluir: boolean;
  alterar: boolean;
  excluir: boolean;
}

/** Configuração de um campo para o usuário logado. */
export interface ConfigCampo {
  exibeFormulario: boolean;
  somenteLeitura: boolean;
  exibeGrid: boolean;
  exibeTitulo: boolean;
  pesquisavel: boolean;
}

/** O que um perfil vê e pode fazer no CRUD. Uma entrada por perfil de `projeto.perfis`. */
export interface PerfilCrud {
  perfil: string;
  acoes: AcoesCrud;
  acoesCustomizadas: Record<string, boolean>;
  campos: Record<string, ConfigCampo>;
  listas: Record<string, AcoesCrud>;
}

/** Resultado da combinação dos perfis que o usuário logado possui. */
export interface ConfigCrud {
  acoes: AcoesCrud;
  acoesCustomizadas: Record<string, boolean>;
  campos: Record<string, ConfigCampo>;
  listas: Record<string, AcoesCrud>;
}

const SEM_ACAO: AcoesCrud = { consultar: false, incluir: false, alterar: false, excluir: false };

const CAMPO_OCULTO: ConfigCampo = {
  exibeFormulario: false,
  somenteLeitura: true,
  exibeGrid: false,
  exibeTitulo: false,
  pesquisavel: false
};

/**
 * Combina os perfis do CRUD que o usuário logado possui. Perfis somam permissões: a ação existe
 * se qualquer perfil dele tiver, o campo aparece se qualquer perfil dele exibir, e o campo só é
 * somente leitura quando nenhum perfil dele está no `edicao` do campo.
 *
 * O mapa devolvido tem entrada para todos os campos e listas do CRUD, então consultar um nome
 * nunca devolve `undefined`.
 */
export function resolverPerfil(perfis: PerfilCrud[], loginService: LoginService): ConfigCrud {
  const meus = perfis.filter(perfilCrud => loginService.hasRole(perfilCrud.perfil));

  if (meus.length === 0) {
    console.warn("Nenhum perfil do CRUD corresponde ao usuário logado: a tela ficará sem ações e sem campos");
  }

  const nomesCampos = new Set(perfis.flatMap(perfilCrud => Object.keys(perfilCrud.campos)));
  const nomesListas = new Set(perfis.flatMap(perfilCrud => Object.keys(perfilCrud.listas)));

  const campos: Record<string, ConfigCampo> = {};
  for (const nome of nomesCampos) {
    const configs = meus.map(perfilCrud => perfilCrud.campos[nome] ?? CAMPO_OCULTO);
    const noFormulario = configs.filter(config => config.exibeFormulario);

    campos[nome] = {
      exibeFormulario: noFormulario.length > 0,
      somenteLeitura: noFormulario.length === 0 || noFormulario.every(config => config.somenteLeitura),
      exibeGrid: configs.some(config => config.exibeGrid),
      exibeTitulo: configs.some(config => config.exibeTitulo),
      pesquisavel: configs.some(config => config.pesquisavel)
    };
  }

  const listas: Record<string, AcoesCrud> = {};
  for (const nome of nomesListas) {
    listas[nome] = somarAcoes(meus.map(perfilCrud => perfilCrud.listas[nome] ?? SEM_ACAO));
  }

  const nomesCustomizadas = new Set(perfis.flatMap(perfilCrud => Object.keys(perfilCrud.acoesCustomizadas)));
  const acoesCustomizadas: Record<string, boolean> = {};
  for (const nome of nomesCustomizadas) {
    acoesCustomizadas[nome] = meus.some(perfilCrud => perfilCrud.acoesCustomizadas[nome] === true);
  }

  return {
    acoes: somarAcoes(meus.map(perfilCrud => perfilCrud.acoes)),
    acoesCustomizadas,
    campos,
    listas
  };
}

function somarAcoes(acoes: AcoesCrud[]): AcoesCrud {
  return {
    consultar: acoes.some(acao => acao.consultar),
    incluir: acoes.some(acao => acao.incluir),
    alterar: acoes.some(acao => acao.alterar),
    excluir: acoes.some(acao => acao.excluir)
  };
}
```

- `exibeFormulario` é o `exibe-formulario` do YAML, e `exibeGrid` é o `exibe-grid`.
  São independentes: `exibe-formulario: false` com `exibe-grid: true` mantém o campo
  no grid e o tira do formulário.
- A largura não entra aqui: `colunas-layout` é igual para todos os perfis
  (`01-yaml-contrato.md`), então fica escrita direto na classe Bootstrap do template.
  A configuração por perfil só liga e desliga coisas.
- Usuário sem nenhum dos perfis do CRUD só chega aqui por defeito de configuração — o
  `autorizarPerfilGuard` já barrou quem não tem perfil algum. O `console.warn` existe
  para essa tela não sumir em silêncio.

### `src/app/pages/[nome-tabela]/[nome-tabela].perfis.ts`

Um por CRUD. É a tradução direta do YAML, com as propriedades comuns do campo e as de
`por-perfil` **já combinadas** pelo gerador: cada perfil aparece com a configuração
final dele, sem herança a resolver em tempo de execução.

Para o `pedido.yaml` do contrato — caixa inclui e altera, gerente altera e exclui, o
desconto tem `edicao: [ GERENTE ]` e é pesquisável só para ele, e o gerente confere os
itens sem mexer neles:

```ts
import { PerfilCrud } from "../../config/perfis-crud";
import { PREFIXO_PERFIL_SISTEMA } from "../../config/layout";

export const PERFIS_PEDIDO: PerfilCrud[] = [
  {
    perfil: `${PREFIXO_PERFIL_SISTEMA}CAIXA`,
    acoes: { consultar: true, incluir: true, alterar: true, excluir: false },
    acoesCustomizadas: { fechar: true },
    campos: {
      numero:   { exibeFormulario: true, somenteLeitura: true,  exibeGrid: true, exibeTitulo: true,  pesquisavel: true },
      cliente:  { exibeFormulario: true, somenteLeitura: false, exibeGrid: true, exibeTitulo: true,  pesquisavel: true },
      desconto: { exibeFormulario: true, somenteLeitura: true,  exibeGrid: true, exibeTitulo: false, pesquisavel: false }
    },
    listas: {
      itens: { consultar: true, incluir: true, alterar: true, excluir: true }
    }
  },
  {
    perfil: `${PREFIXO_PERFIL_SISTEMA}GERENTE`,
    acoes: { consultar: true, incluir: false, alterar: true, excluir: true },
    acoesCustomizadas: { fechar: false },
    campos: {
      numero:   { exibeFormulario: true, somenteLeitura: true,  exibeGrid: true, exibeTitulo: true,  pesquisavel: true },
      cliente:  { exibeFormulario: true, somenteLeitura: false, exibeGrid: true, exibeTitulo: true,  pesquisavel: true },
      desconto: { exibeFormulario: true, somenteLeitura: false, exibeGrid: true, exibeTitulo: false, pesquisavel: true }
    },
    listas: {
      itens: { consultar: true, incluir: false, alterar: false, excluir: false }
    }
  }
];
```

- Uma entrada por perfil de `projeto.perfis`, na ordem do YAML.
- Chaves de `campos` e `listas` em **camelCase**, iguais aos nomes dos `FormControl` e
  aos atributos da entidade TypeScript — não ao `nome` snake_case do YAML.
- Quando a fatia `campos` existe, ela traz **todos** os campos do CRUD para todos os
  perfis, com os valores já resolvidos: propriedade comum do campo se repete igual em
  cada perfil, propriedade de `por-perfil` entra com o valor daquele perfil. Nada fica
  como regra a interpretar depois. Sem `por-perfil` nem `edicao` no YAML a fatia não
  existe — ver "Gere só as fatias que o YAML declara".
- `listas` tem uma entrada por campo `tipo: lista`, e `acoesCustomizadas` uma por item
  de `tabela.acoes-customizadas`.

### Uso nas telas

Pesquisa e cadastro consomem a mesma configuração, resolvida uma vez:

```ts
private readonly loginService: LoginService = inject(LoginService);
protected readonly config: ConfigCrud = resolverPerfil(PERFIS_PEDIDO, this.loginService);

protected campo(nome: string): ConfigCampo {
  return this.config.campos[nome];
}
```

No template, `config.acoes` decide botões e `campo(...)` decide cada campo:

```html
@if (config.acoes.incluir) {
  <button type="button" class="btn btn-primary" (click)="novo()">
    <i class="fa-solid fa-plus me-2"></i>Novo
  </button>
}

@if (config.acoesCustomizadas['fechar']) {
  <button type="button" class="btn btn-outline-secondary" (click)="fechar()">
    <i class="fa-solid fa-lock me-2"></i>Fechar
  </button>
}

@if (campo('desconto').exibeFormulario) {
  <input class="form-control" formControlName="desconto"
         [readonly]="campo('desconto').somenteLeitura">
}
```

- A configuração é resolvida **na construção do componente** e não muda durante a
  sessão: o DataTables enxerga um conjunto estável de colunas e o `FormGroup`, um
  conjunto estável de controles.
- O `FormGroup` e a entidade continuam com **todos** os campos, inclusive os ocultos:
  o valor recebido do backend precisa voltar intacto no `Gravar`. Ocultar é decisão de
  template, nunca remoção de `FormControl` — pelo mesmo motivo de o bloqueio de edição
  nunca usar `disabled` (`09-frontend-cadastro.md`).
- Esconder botão **não** é segurança: quem barra é o `@Secured` por ação no service
  (`04-backend-service.md`). A tela esconde para não oferecer ao usuário um caminho
  que terminaria em 403.


## Critérios de aceite

- Pesquisa e cadastro são acessíveis pelas rotas.
- `crudRoutes()` recebe o objeto de opções, não uma lista de perfis solta.
- Menu respeita roles.
- Services usam a constante de API.
- Rotas e menu usam todos os perfis de `projeto.perfis`.
- Cada fatia da configuração por perfil (`acoes`, `acoesCustomizadas`, `campos`,
  `listas`) só foi gerada porque o YAML declara a coisa correspondente.
- YAML com `acoes` ou `por-perfil` gerou um único `[nome-tabela].perfis.ts` e reusou o
  `perfis-crud.ts` do projeto; YAML sem nenhum dos dois não gerou nenhum dos arquivos.

# 08 - Frontend Pesquisar

## Objetivo

Criar tela de pesquisa Angular seguindo `templates/pesquisar.html`.

As regras globais de template Angular (blocos `@if`/`@for`, Bootstrap 5, CSS) estão
em `00-contexto-geral.md` e valem aqui sem repetição.

## Saídas

- `src/app/pages/[nome-tabela]/pesquisar/pesquisar.componente.ts`
- `src/app/pages/[nome-tabela]/pesquisar/pesquisar.componente.html`

## Estrutura visual

- Não declarar loader na tela: o `<ngx-spinner>` é único por aplicação, no `app.component`, e o `PesquisarBaseComponent` o aciona via `NgxSpinnerService`. A tela começa direto pelo breadcrumb.
- Renderizar o breadcrumb fora do container principal, iniciando com link para `/pagina-inicial` contendo ícone FontAwesome `fa-house` antes do texto `Início`, seguido de `tabela.plural`.
- Após o breadcrumb, encapsular o restante do conteúdo visual da tela em `<section class="container py-3">`.
- Header com `kicker`, ícone `fa-table-list`, título `tabela.plural` em negrito, subtítulo curto e botão `Novo`. Com `acoes`, o `Novo` fica em `@if (config.acoes.incluir)`.
- Dashboard opcional com até 3 cards úteis; ocultar em dispositivos pequenos.
- Card de consulta com botão `Filtrar Pesquisa` no lado esquerdo do header, substituindo título textual da seção.
- Filtros começam escondidos em `collapse filters-collapse`.
- Tabela em `div.table-responsive`.

## Filtros

- Renderizar todos os campos com `pesquisavel != false`. Cada campo tem controle próprio.
- Com `por-perfil`, envolver o controle de cada filtro em
  `@if (campo('nomeDoCampo').pesquisavel)`. O objeto `filtro` e o `pesquisar(filtro)`
  do service continuam com **todos** os campos pesquisáveis do CRUD — só o controle
  some.
- Não usar `<label>` visível nos filtros escondidos; identificar cada campo somente por `placeholder`, `aria-label` e/ou texto da primeira opção.
- Manter campos e botões do formulário de filtros na mesma linha em viewports médios e grandes, usando `row`, `align-items-center` e colunas Bootstrap adequadas.
- Botões de pesquisar e limpar nos filtros devem ser icon-only, com `title` e `aria-label`; não incluir texto visível.
- Texto (`texto`, `textoN`, `editor`, `email`, `link`): input texto. Em `email` e `link` o filtro é texto comum, sem `type="email"`/`type="url"` — o usuário filtra por trecho, não digita um endereço completo. Em `editor`, a busca é sobre o HTML armazenado (`01-yaml-contrato.md`).
- Enum: combo/select com os labels de `[NOME_ENUM]_LABELS` (`07-frontend-domain-service.md`), com uma primeira opção vazia identificando o campo.
- FK: `ng-select` com `class="ng-select-bootstrap"` para receber o tema global Bootstrap-like do projeto. Vale mesmo quando o campo usa `fk-tipo: radio` no cadastro — `fk-tipo` não afeta o filtro.
- `booleano` e numéricos: controle compatível. Filtro numérico segue a regra de teclado do cadastro (`09-frontend-cadastro.md`, "Teclado numérico no celular"): `inputmode` declarado, `numeric` por padrão.
- `data` e `data-hora`: `apcore-campo-data` da ngx-apcore (`09-frontend-cadastro.md`, "Campo de data"), nunca `type="date"` — pelo mesmo motivo do cadastro, e para a data se digitar do mesmo jeito nas duas telas. Sem `<label>`, identificado por `rotuloAcessivel` e `titulo`; o `icone` fica de fora, que o filtro escondido é compacto.
- `moeda`: `apcore-campo-moeda` da ngx-apcore, a mesma configuração do cadastro (`09-frontend-cadastro.md`, "Campo monetário" — máscara, `typeFromDecimals`, `leadZero`, `outputTransformFn` e `inputmode`). Filtrar com digitação diferente da do cadastro faria o usuário procurar um valor que ele nunca digitou daquele jeito, e é por isso que aqui o filtro abre exceção à regra de compactação e mantém o `input-group` de `R$` que o componente traz.

## Grid

- `<table id="datatables-pesquisar-[nome-tabela-plural]">`.
- Ordem fixa: `Ações`, `ID`, coluna principal, demais campos `exibe-grid: true`.
- `exibe-grid` é `false` por padrão (`01-yaml-contrato.md`): entram no grid só os campos marcados. `Ações` e `ID` são fixas e não dependem da marcação; a coluna principal é o primeiro campo marcado.
- Coluna principal usa `record-cell`, `record-main` e `record-sub`; ID nunca entra em main/sub.
- Coluna principal deve incluir um ícone FontAwesome à esquerda, coerente com a entidade ou com fallback `fa-tag`.
- Ações usam `action-stack`, editar `fa-pen-to-square`, excluir `fa-trash-can`.
- Botões da coluna `Ações` são **redondos**, só com utilitários do Bootstrap, sem CSS
  customizado: `btn btn-outline-[cor] btn-sm rounded-circle p-2 lh-1`. O `p-2` com `lh-1`
  deixa o padding igual nos quatro lados e o `rounded-circle` fecha o círculo; sem eles o
  botão fica retangular, porque o padding horizontal padrão do `.btn` é maior que o
  vertical. Os ícones levam `fa-fw`, para que todos os botões da linha tenham a mesma
  largura independentemente do glifo. Vale para editar/visualizar, excluir e ações
  customizadas.
- Com `por-perfil`, envolver `<th>` e `<td>` de cada coluna opcional no mesmo
  `@if (campo('nomeDoCampo').exibeGrid)`. Os dois precisam usar exatamente a mesma
  condição, ou o DataTables recebe cabeçalho e corpo com contagens diferentes de
  colunas e quebra. `Ações` e `ID` nunca são condicionais.
- Enum mostra o label de `[NOME_ENUM]_LABELS`, nunca a constante crua; FK mostra `fk-display`; `booleano` mostra Sim/Não.
- `email` vira `<a href="mailto:...">` com ícone `fa-envelope`; `link` vira `<a target="_blank" rel="noopener noreferrer">` com ícone `fa-arrow-up-right-from-square`. Nos dois, o clique **não** pode disparar a navegação da linha: usar `(click)="$event.stopPropagation()"` no `<a>`.
- `editor` mostra o conteúdo **sem as tags HTML**, truncado com `text-truncate` e o texto completo no `title`. Nunca renderizar o HTML dentro da célula.
- `moeda` usa `CurrencyPipe` com `'BRL'` e locale `pt-BR` (`{{ item.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}`), com `<th>` e `<td>` em `text-end`. O locale `pt-BR` precisa estar registrado uma vez na aplicação (`registerLocaleData`), como já vale para as datas.
- Valor longo de `link` não pode alargar a tabela: truncar com `text-truncate` e `d-inline-block` com largura máxima, mantendo o endereço completo no `title`.
- Campo `tipo: lista` nunca vira coluna do grid, nem seus subcampos.

## Pesquisa

O gerador produz **uma única estratégia**: a tela chama o endpoint `/pesquisar`
(`05-backend-resource.md`), que resolve os critérios com o QueryDSL filter
(`03-backend-domain.md`) e devolve a lista pronta. O DataTables recebe essa lista
inteira e faz paginação, ordenação e busca rápida **client-side**.

- A tela mantém um objeto `filtro: [NomeTabela]Filtro` (de `07-frontend-domain-service.md`) ligado aos controles do form de filtros.
- `listar()` decide a origem da lista: `service.pesquisar(this.filtro)` quando houver ao menos um filtro preenchido, `service.listar()` caso contrário.
- O botão de pesquisar chama um método próprio `aplicarFiltro()`, que valida o preenchimento e delega para `this.pesquisar()` (herdado) — é ele que refaz `listar()` e redesenha o grid.
- "Limpar filtros" recria o objeto `filtro` vazio e chama `this.pesquisar()`.
- Em telas de volume alto, que não devem listar tudo na abertura, `aplicarFiltro()` sem nenhum filtro preenchido mostra o toastr `Informe ao menos um filtro para pesquisar.` e não pesquisa.

### Duas coisas que o gerador NÃO deve fazer

- **Não filtrar `this.lista` em memória.** Filtrar a lista já carregada obriga a trazer a
  tabela inteira a cada abertura de tela, deixa `/pesquisar`, o `[NomeTabela]Filter` e o
  `pesquisar(filtro)` do service como código morto, e faz `pesquisavel: contem` significar
  duas coisas diferentes — `ILIKE` no Postgres contra `toLowerCase().indexOf()` no
  navegador, que divergem em acentuação e collation.
- A busca rápida do próprio DataTables continua valendo: ela opera sobre o resultado já
  filtrado pelo backend e é conveniência de leitura, não o filtro da tela.
- **Não usar DataTables server-side.** `Datatables.serverSide()` e
  `Datatables.aoClicarAcao()` existem na lib e algumas telas antigas já os usam, mas
  paginação, ordenação e busca no servidor estão **fora do escopo desta spec** — são
  evolução futura. Enquanto isso, toda tela gerada estende `PesquisarBaseComponent` e
  renderiza as linhas pelo Angular (`@for`), nunca por `render`/`columns` do DataTables.

## Configuração por perfil

Só quando o YAML tem `tabela.acoes` ou algum `por-perfil` (`01-yaml-contrato.md`). A
tela é **uma só**: os mesmos arquivos servem todos os perfis, e o que muda é quais
ações, filtros e colunas aparecem.

- Injetar `LoginService` e resolver a configuração na construção do componente,
  conforme `06-frontend-rotas-menu-api.md`.
- `campo(nome)` decide filtro (`pesquisavel`) e coluna (`exibeGrid`);
  `config.acoes` decide os botões.

### Ações no grid

| Ação | Efeito na tela |
|---|---|
| `incluir` | `@if` no botão `Novo` do header |
| `alterar` | primeira ação da linha vira `Editar` (`fa-pen-to-square`) |
| `excluir` | `@if` na ação de excluir da linha (`fa-trash-can`) |

- Sem `alterar`, a primeira ação da linha continua existindo, mas como
  **`Visualizar`**: ícone `fa-eye`, `title`/`aria-label` `Visualizar`, mesma navegação
  para `cadastro/:id`. Quem consulta precisa abrir o registro; é o cadastro que fica
  somente leitura (`09-frontend-cadastro.md`).

### Ações customizadas

Ação customizada com `tela: pesquisa` ou `tela: ambos` (`01-yaml-contrato.md`) vira mais
um botão no `action-stack` da linha, depois de editar e excluir. A propriedade `aba` da
ação não vale aqui — ela posiciona o botão no cadastro, e a pesquisa não tem abas:

- `@if (config.acoesCustomizadas['revogar'])` no botão, com o `icone` e o `label` da
  ação em `title`/`aria-label`. Botão icon-only e redondo, como os demais da linha.
- `confirmar: true` (default): `exibirMensagem.showConfirm(...)` antes de chamar o
  service, com a mensagem `Confirma [label] [de/do/da] [entidade] [identificação]`.
- No sucesso, toastr de sucesso e `this.pesquisar()` (herdado) para recarregar só a
  lista. Nunca `window.location.reload()`.
- No erro, cuidar apenas de estado local: o `httpErrorsInterceptor` já mostra o 409/422
  que a regra de negócio devolve (`04-backend-service.md`).
- A coluna `Ações` e a `<th>` dela nunca são condicionais: `consultar` sempre rende ao
  menos o `Visualizar`.
- `listar()`, `pesquisar()`, `excluirRegistro()` e o service **não** mudam: a
  configuração por perfil não altera o que a tela busca no backend, só o que mostra.
- Nada de gerar uma segunda tela, um segundo componente ou um segundo `basePath` por
  perfil.

## Componente

- `standalone: true`.
- `changeDetection: ChangeDetectionStrategy.Eager` — obrigatório, inclusive estendendo a base, que não o transmite (`00-contexto-geral.md`). Sem ele o grid e os cards não refletem o retorno do HTTP.
- Selector: `[nomeprojeto]-[nometabela]-pesquisar`.
- **Estender obrigatoriamente `PesquisarBaseComponent<T>`** de `@andre.penteado/ngx-apcore` (>= 22.0.0), em vez de reimplementar o ciclo de listar/incluir/editar/excluir/DataTable do zero. A página só declara:
  - `basePath` (rota base, ex.: `'[nome-tabela-plural]'`), `tableId` (id da `<table>`) e `rotuloPlural` (ex.: `'produtos'`, usado nos logs);
  - `listar()`, `excluirRegistro(id)`, `idDoRegistro(item)`, `mensagemConfirmarExclusao(item)` (mensagem completa, ex.: `` `Confirma a exclusão [de/do/da] [entidade] ${item.nome}` ``);
  - `aplicarFiltro()` e o objeto `filtro`, conforme a seção acima.
- `ngOnInit` (herdado) já mostra o spinner, chama `pesquisar()` e, ao concluir, chama `redesenharTabela()` — a página não chama `show()`/`hide()` manualmente.
- `Novo`/`editar`/`excluir` (herdados) já navegam para cadastro e confirmam exclusão com SweetAlert2 usando `mensagemConfirmarExclusao(item)`.
- Após exclusão com sucesso, a base recarrega apenas a lista (`pesquisar()`), preservando o contexto da tela; nunca usar `window.location.reload()`.
- A base implementa `ngOnDestroy` destruindo a DataTable ao sair da tela — não reimplementar na página.
- Logs de listagem e exclusão são emitidos pela própria base a partir de `rotuloPlural`; a página não os repete. Log adicional de pesquisa com filtro segue `11-monitoramento-faro.md`.
- Em erro HTTP, cuidar apenas de estado local; o tratamento global é do `httpErrorsInterceptor` (`00-contexto-geral.md`).
- **Regra obrigatória do grid, já implementada por `PesquisarBaseComponent.redesenharTabela()` — a página NÃO deve reimplementá-la, só chamá-la:** ao receber uma nova lista, destruir o DataTables, remover a tabela do DOM (via `tabelaPronta`/`@if` no template), limpar temporariamente o array, forçar detecção de mudanças (`ChangeDetectorRef.detectChanges()`), atribuir a nova lista, recriar a tabela no DOM e só então reinicializar o DataTables. Não simplificar para apenas `destroy()` + troca do array + nova inicialização: o DataTables mantém controle próprio sobre o DOM da tabela e pode não refletir a lista nova, especialmente ao alternar entre pesquisas com conjuntos diferentes ou ao limpar filtros.
- O template DEVE envolver a tabela em `@if (tabelaPronta) { <table id="datatables-pesquisar-[nome-tabela-plural]">...</table> }` — sem esse `@if`, a sequência acima não tem efeito e o grid pode não refletir a lista nova.
- A única exceção ao contrato da base é a página com múltiplas tabelas independentes na mesma tela, que não é o caso de um CRUD gerado. Volume de dados **não** é motivo para sair da base: se a tela precisar de paginação no servidor, isso é evolução da spec, não decisão da geração.

## Critérios de aceite

- Componente declara `changeDetection: ChangeDetectionStrategy.Eager`.
- Cards de dashboard não aparecem em dispositivos pequenos.
- Filtros refletem exatamente os campos pesquisáveis do YAML, sem labels visíveis, com placeholders identificando os campos.
- Com configuração por perfil, filtros e colunas refletem os perfis do usuário logado, `<th>` e `<td>` usam a mesma condição, e existe uma única tela de pesquisa para todos os perfis.
- `Novo` e `Excluir` só aparecem para quem tem a ação; sem `alterar`, a ação da linha é `Visualizar` com `fa-eye`.
- Ação customizada com `tela` incluindo `pesquisa` aparece na linha, confirma antes e recarrega a lista no sucesso.
- Campos e botões dos filtros permanecem na mesma linha em telas médias e grandes, e os botões exibem somente ícones, com acessibilidade por `title` e `aria-label`.
- Filtro de `data` usa `apcore-campo-data` e filtro de `moeda` usa `apcore-campo-moeda`, os mesmos componentes do cadastro; nenhum filtro só de dígitos abre o teclado alfabético no celular.
- A tela estende `PesquisarBaseComponent`.
- Pesquisar chama `/pesquisar` no backend; não há filtro em memória sobre `this.lista` nem DataTables server-side.
- Grid respeita ordem fixa das colunas e a coluna principal exibe ícone à esquerda, título e subtítulo.
- Coluna de `email` e `link` é clicável, não dispara a navegação da linha, e `link` abre em nova aba com `rel="noopener noreferrer"`.
- Segunda execução de pesquisa, limpeza de filtros e recarregamento após exclusão atualizam o grid corretamente, inclusive quando a nova lista contém registros diferentes dos exibidos na consulta anterior.
- Loader não desaparece antes do grid estar inicializado.
- Operações de listar, pesquisar e excluir logam com `console.info` no padrão de `11-monitoramento-faro.md`.

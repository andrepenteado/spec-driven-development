# 08 - Frontend Pesquisar

## Objetivo

Criar tela de pesquisa Angular seguindo `.specs/templates/pesquisar.html`.

As regras globais de template Angular (blocos `@if`/`@for`, Bootstrap 5, CSS) estão
em `00-contexto-geral.md` e valem aqui sem repetição.

## Saídas

- `src/app/pages/[nome-tabela]/pesquisar/pesquisar.componente.ts`
- `src/app/pages/[nome-tabela]/pesquisar/pesquisar.componente.html`

## Estrutura visual

- Não declarar loader na tela: o `<ngx-spinner>` é único por aplicação, no `app.component`, e o `PesquisarBaseComponent` o aciona via `NgxSpinnerService`. A tela começa direto pelo breadcrumb.
- Renderizar o breadcrumb fora do container principal, iniciando com link para `/pagina-inicial` contendo ícone FontAwesome `fa-house` antes do texto `Início`, seguido de `tabela.plural`.
- Após o breadcrumb, encapsular o restante do conteúdo visual da tela em `<section class="container py-3">`.
- Header com `kicker`, ícone `fa-table-list`, título `tabela.plural` em negrito, subtítulo curto e botão `Novo`.
- Dashboard opcional com até 3 cards úteis; ocultar em dispositivos pequenos.
- Card de consulta com botão `Filtrar Pesquisa` no lado esquerdo do header, substituindo título textual da seção.
- Filtros começam escondidos em `collapse filters-collapse`.
- Tabela em `div.table-responsive`.

## Filtros

- Renderizar todos os campos com `pesquisavel != false`. Cada campo tem controle próprio.
- Não usar `<label>` visível nos filtros escondidos; identificar cada campo somente por `placeholder`, `aria-label` e/ou texto da primeira opção.
- Manter campos e botões do formulário de filtros na mesma linha em viewports médios e grandes, usando `row`, `align-items-center` e colunas Bootstrap adequadas.
- Botões de pesquisar e limpar nos filtros devem ser icon-only, com `title` e `aria-label`; não incluir texto visível.
- Texto: input texto.
- Enum: combo/select com labels.
- FK: `ng-select` com `class="ng-select-bootstrap"` para receber o tema global Bootstrap-like do projeto. Vale mesmo quando o campo usa `fk-tipo: radio` no cadastro — `fk-tipo` não afeta o filtro.
- Boolean/date/datetime/number: controle compatível.

## Grid

- `<table id="datatables-pesquisar-[nome-tabela-plural]">`.
- Ordem fixa: `Ações`, `ID`, coluna principal, demais campos `exibe-grid: true`.
- Coluna principal usa `record-cell`, `record-main` e `record-sub`; ID nunca entra em main/sub.
- Coluna principal deve incluir um ícone FontAwesome à esquerda, coerente com a entidade ou com fallback `fa-tag`.
- Ações usam `action-stack`, editar `fa-pen-to-square`, excluir `fa-trash-can`.
- Enum mostra label; FK mostra `fk-display`; boolean mostra Sim/Não.
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

## Componente

- `standalone: true`.
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
- Em erro HTTP, cuidar apenas de estado local; o tratamento global é do `HttpErrorsInterceptor` (`00-contexto-geral.md`).
- **Regra obrigatória do grid, já implementada por `PesquisarBaseComponent.redesenharTabela()` — a página NÃO deve reimplementá-la, só chamá-la:** ao receber uma nova lista, destruir o DataTables, remover a tabela do DOM (via `tabelaPronta`/`@if` no template), limpar temporariamente o array, forçar detecção de mudanças (`ChangeDetectorRef.detectChanges()`), atribuir a nova lista, recriar a tabela no DOM e só então reinicializar o DataTables. Não simplificar para apenas `destroy()` + troca do array + nova inicialização: o DataTables mantém controle próprio sobre o DOM da tabela e pode não refletir a lista nova, especialmente ao alternar entre pesquisas com conjuntos diferentes ou ao limpar filtros.
- O template DEVE envolver a tabela em `@if (tabelaPronta) { <table id="datatables-pesquisar-[nome-tabela-plural]">...</table> }` — sem esse `@if`, a sequência acima não tem efeito e o grid pode não refletir a lista nova.
- A única exceção ao contrato da base é a página com múltiplas tabelas independentes na mesma tela, que não é o caso de um CRUD gerado. Volume de dados **não** é motivo para sair da base: se a tela precisar de paginação no servidor, isso é evolução da spec, não decisão da geração.

## Critérios de aceite

- Cards de dashboard não aparecem em dispositivos pequenos.
- Filtros refletem exatamente os campos pesquisáveis do YAML, sem labels visíveis, com placeholders identificando os campos.
- Campos e botões dos filtros permanecem na mesma linha em telas médias e grandes, e os botões exibem somente ícones, com acessibilidade por `title` e `aria-label`.
- A tela estende `PesquisarBaseComponent`.
- Pesquisar chama `/pesquisar` no backend; não há filtro em memória sobre `this.lista` nem DataTables server-side.
- Grid respeita ordem fixa das colunas e a coluna principal exibe ícone à esquerda, título e subtítulo.
- Segunda execução de pesquisa, limpeza de filtros e recarregamento após exclusão atualizam o grid corretamente, inclusive quando a nova lista contém registros diferentes dos exibidos na consulta anterior.
- Loader não desaparece antes do grid estar inicializado.
- Operações de listar, pesquisar e excluir logam com `console.info` no padrão de `11-monitoramento-faro.md`.

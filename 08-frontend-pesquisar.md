# 08 - Frontend Pesquisar

## Objetivo

Criar tela de pesquisa Angular seguindo `.specs/templates/pesquisar.html`.

## Saídas

- `src/app/pages/[nome-tabela]/pesquisar/pesquisar.componente.ts`
- `src/app/pages/[nome-tabela]/pesquisar/pesquisar.componente.html`

## Estrutura visual

- O template Angular omite `<html>`, `<head>`, `<body>`, CDNs e scripts.
- Usar sintaxe moderna de blocos Angular (`@for`, `@if`) em vez de `*ngFor` e `*ngIf`.
- Usar ao máximo classes Bootstrap 5; CSS customizado deve ser mínimo e ficar em `frontend/src/styles.css`.
- Não importar nem referenciar CSS de `.specs/templates/assets` em arquivos Angular gerados.
- Não declarar loader na tela: o `<ngx-spinner>` é único por aplicação, no `app.component`, e o `PesquisarBaseComponent` o aciona via `NgxSpinnerService`. A tela começa direto pelo breadcrumb.
- Renderizar o breadcrumb fora do container principal.
- O breadcrumb deve iniciar com link para `/pagina-inicial` contendo ícone FontAwesome `fa-house` antes do texto `Início`, seguido de `tabela.plural`.
- Após o breadcrumb, encapsular o restante do conteúdo visual da tela em `<section class="container py-3">`.
- Header com `kicker`, ícone `fa-table-list`, título `tabela.plural` em negrito, subtítulo curto e botão `Novo`.
- Dashboard opcional com até 3 cards úteis; ocultar em dispositivos pequenos.
- Card de consulta com botão `Filtrar Pesquisa` no lado esquerdo do header, substituindo título textual da seção.
- Filtros começam escondidos em `collapse filters-collapse`.
- Tabela em `div.table-responsive`.

## Filtros

- Renderizar todos os campos com `pesquisavel != false`.
- Cada campo tem controle próprio.
- Não usar `<label>` visível nos filtros escondidos; identificar cada campo somente por `placeholder`, `aria-label` e/ou texto da primeira opção.
- Manter campos e botões do formulário de filtros na mesma linha em viewports médios e grandes, usando `row`, `align-items-center` e colunas Bootstrap adequadas.
- Botões de pesquisar e limpar nos filtros devem ser icon-only, com `title` e `aria-label`; não incluir texto visível.
- Texto: input texto.
- Enum: combo/select com labels.
- FK: `ng-select` com `class="ng-select-bootstrap"` para receber o tema global Bootstrap-like do projeto.
- Boolean/date/datetime/number: controle compatível.
- Pesquisa sem filtro preenchido: toastr `Informe ao menos um filtro para pesquisar.`

## Grid

- `<table id="datatables-pesquisar-[nome-tabela-plural]">`.
- Ordem fixa: `Ações`, `ID`, coluna principal, demais campos `exibe-grid: true`.
- Coluna principal usa `record-cell`, `record-main` e `record-sub`; ID nunca entra em main/sub.
- Coluna principal deve incluir um ícone FontAwesome à esquerda, coerente com a entidade ou com fallback `fa-tag`.
- Ações usam `action-stack`, editar `fa-pen-to-square`, excluir `fa-trash-can`.
- Enum mostra label; FK mostra `fk-display`; boolean mostra Sim/Não.

## Componente

- `standalone: true`.
- Selector: `[nomeprojeto]-[nometabela]-pesquisar`.
- Estender `PesquisarBaseComponent<T>` de `@andre.penteado/ngx-apcore` (>= 22.0.0) em vez de reimplementar o ciclo de listar/incluir/editar/excluir/DataTable do zero. A página só declara:
  - `basePath` (rota base, ex.: `'[nome-tabela-plural]'`), `tableId` (id da `<table>`) e `rotuloPlural` (ex.: `'produtos'`, usado nos logs);
  - `listar()`, `excluirRegistro(id)`, `idDoRegistro(item)`, `mensagemConfirmarExclusao(item)` (mensagem completa, ex.: `` `Confirma a exclusão [de/do/da] [entidade] ${item.nome}` ``).
- `PesquisarBaseComponent` usa `NgxSpinnerService` (`ngx-spinner`, peer dependency da lib) internamente: `ngOnInit` (herdado) já mostra o spinner, chama `pesquisar()` e, ao concluir, chama `redesenharTabela()` — a página não chama `show()`/`hide()` manualmente.
- `Novo`/`editar`/`excluir` (herdados de `PesquisarBaseComponent`) já navegam para cadastro e confirmam exclusão com SweetAlert2 usando `mensagemConfirmarExclusao(item)`.
- Após exclusão com sucesso, a base recarrega apenas a lista (`pesquisar()`), preservando o contexto da tela; nunca usar `window.location.reload()`.
- A base implementa `ngOnDestroy` destruindo a DataTable ao sair da tela — não reimplementar na página.
- Filtro é responsabilidade da página (campos e critérios variam por entidade, não fazem parte da base): implementar um método `filtrar()` que filtra `this.lista` em memória e chama `this.redesenharTabela(listaFiltrada)`; "Limpar filtros" chama `redesenharTabela(this.lista)` (lista completa). Pesquisa sem filtro preenchido continua usando toastr `Informe ao menos um filtro para pesquisar.` quando fizer sentido para o volume de dados da tela.
- Logs de listagem e exclusão são emitidos pela própria base a partir de `rotuloPlural` — a página não repete esses `console.info`. Logs adicionais da tela (ex.: pesquisa com filtro) seguem a regra de identificação abaixo.
- **Regra obrigatória do grid, já implementada por `PesquisarBaseComponent.redesenharTabela()` — a página NÃO deve reimplementá-la, só chamá-la:** ao receber uma nova lista, destruir o DataTables, remover a tabela do DOM (via `tabelaPronta`/`@if` no template), limpar temporariamente o array, forçar detecção de mudanças (`ChangeDetectorRef.detectChanges()`), atribuir a nova lista, recriar a tabela no DOM e só então reinicializar o DataTables. Não simplificar para apenas `destroy()` + troca do array + nova inicialização: o DataTables mantém controle próprio sobre o DOM da tabela e pode não refletir a lista nova, especialmente ao alternar entre pesquisas com conjuntos diferentes ou ao limpar filtros.
- O template DEVE envolver a tabela em `@if (tabelaPronta) { <table id="datatables-pesquisar-[nome-tabela-plural]">...</table> }` — sem esse `@if`, a sequência acima não tem efeito e o grid pode não refletir a lista nova.
- Só sobrescrever `redesenharTabela()`/reimplementar o ciclo manualmente se o caso realmente não couber no contrato de `PesquisarBaseComponent` (ex.: página com múltiplas tabelas independentes na mesma tela).

## Critérios de aceite

- Cards de dashboard não aparecem em dispositivos pequenos.
- Breadcrumb fica antes do container principal e usa ícone `fa-house` no link inicial.
- Template usa `@for`/`@if`, não `*ngFor`/`*ngIf`.
- Título da página aparece em negrito.
- Filtros refletem exatamente os campos pesquisáveis do YAML.
- Filtros escondidos não têm labels visíveis; placeholders identificam os campos.
- Campos e botões dos filtros permanecem na mesma linha em telas médias e grandes.
- Botões dos filtros exibem somente ícones, com acessibilidade por `title` e `aria-label`.
- Grid respeita ordem fixa das colunas.
- Coluna principal do grid exibe ícone à esquerda, título e subtítulo.
- Segunda execução de pesquisa, limpeza de filtros e recarregamento após exclusão atualizam o grid corretamente, inclusive quando a nova lista contém registros diferentes dos exibidos na consulta anterior.
- Loader não desaparece antes do grid estar inicializado.
- Operações de listar, pesquisar e excluir logam com `console.info` no padrão definido.

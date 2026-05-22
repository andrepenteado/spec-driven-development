# 08 - Frontend Pesquisar

## Objetivo

Criar tela de pesquisa Angular seguindo `.specs/templates/pesquisar.html`.

## Saídas

- `src/app/pages/[nome-tabela]/pesquisar/pesquisar.componente.ts`
- `src/app/pages/[nome-tabela]/pesquisar/pesquisar.componente.html`

## Estrutura visual

- O template Angular omite `<html>`, `<head>`, `<body>`, CDNs e scripts.
- Iniciar com `<ngx-ui-loader>` configurado com `loaderId="[nome-tabela]-pesquisar"`, `fgsType`, `fgsColor`, `overlayColor`, `pbColor` e `[hasProgressBar]="true"`.
- Depois do loader, breadcrumb: home `/pagina-inicial` > `tabela.plural`.
- Header com `kicker`, ícone `fa-table-list`, título `tabela.plural`, subtítulo curto e botão `Novo`.
- Dashboard opcional com até 3 cards úteis; ocultar em dispositivos pequenos.
- Card de consulta com botão `Filtros`.
- Filtros começam escondidos em `collapse filters-collapse`.
- Tabela em `div.table-responsive`.

## Filtros

- Renderizar todos os campos com `pesquisavel != false`.
- Cada campo tem controle próprio.
- Texto: input texto.
- Enum: combo/select com labels.
- FK: `ng-select`.
- Boolean/date/datetime/number: controle compatível.
- Pesquisa sem filtro preenchido: toastr `Informe ao menos um filtro para pesquisar.`

## Grid

- `<table id="datatables-pesquisar-[nome-tabela-plural]">`.
- Ordem fixa: `Ações`, `ID`, coluna principal, demais campos `exibe-grid: true`.
- Coluna principal usa `record-cell`, `record-main` e `record-sub`; ID nunca entra em main/sub.
- Ações usam `action-stack`, editar `fa-pen-to-square`, excluir `fa-trash-can`.
- Enum mostra label; FK mostra `fk-display`; boolean mostra Sim/Não.

## Componente

- `standalone: true`.
- Selector: `[nomeprojeto]-[nometabela]-pesquisar`.
- Usar `NgxUiLoaderService`.
- Loader inicia antes do HTTP e para somente após preencher lista e inicializar DataTable.
- Em erro, parar loader.
- `Novo` navega para cadastro.
- Editar navega para cadastro.
- Excluir confirma com SweetAlert2: `Confirma a exclusão [NomeTabela] de ID #[id]`.
- Após exclusão com sucesso, recarregar lista.
- Inicializar DataTable após `listar()`:

```ts
setTimeout(() => {
  $('#datatables-pesquisar-[nome-tabela-plural]').DataTable(Datatables.config);
  this.uiLoaderService.stopLoader('[nome-tabela]-pesquisar');
}, 5);
```

## Critérios de aceite

- Cards de dashboard não aparecem em dispositivos pequenos.
- Filtros refletem exatamente os campos pesquisáveis do YAML.
- Grid respeita ordem fixa das colunas.
- Loader não desaparece antes do grid estar inicializado.

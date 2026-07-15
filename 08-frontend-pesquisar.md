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
- Iniciar com `<ngx-ui-loader>` configurado com `loaderId="[nome-tabela]-pesquisar"`, `fgsType`, `fgsColor`, `overlayColor`, `pbColor` e `[hasProgressBar]="true"`.
- Depois do loader, renderizar o breadcrumb fora do container principal.
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
- Usar `NgxUiLoaderService`.
- Loader inicia antes do HTTP e para somente após preencher lista e inicializar DataTable.
- Em erro, parar loader.
- `Novo` navega para cadastro.
- Editar navega para cadastro.
- Excluir confirma com SweetAlert2: `Confirma a exclusão [NomeTabela] de ID #[id]`.
- Após exclusão com sucesso, recarregar lista.
- Logar as operações com `console.info`, espelhando as mensagens do resource do backend (em produção o Faro envia ao Loki — ver `11-monitoramento-faro.md`):
  - Listagem completa: `console.info('Listar todos [plural]')` no início de `listar()`.
  - Pesquisa com filtro: `` console.info(`Pesquisar [plural] com filtro ${JSON.stringify(this.filtro)}`) `` antes da chamada ao service.
  - Exclusão: `` console.info(`Excluir [label] de ID #${id}`) `` após a confirmação, antes da chamada ao service.
- Limpar filtros deve apenas limpar o objeto de filtro e recarregar a lista completa, preservando o comportamento padrão do DataTables.
- Regra obrigatória para qualquer atualização de grid com DataTables: ao receber uma nova lista, destruir o DataTables, remover a tabela do DOM com `@if`, limpar temporariamente o array, forçar detecção de mudanças, atribuir a nova lista, recriar a tabela no DOM e só então inicializar o DataTables novamente.
- Não simplificar essa sequência para apenas `destroy()` + troca do array + nova inicialização. O DataTables mantém controle próprio sobre o DOM da tabela e pode impedir que a segunda atualização reflita a nova lista, especialmente ao alternar entre pesquisas que retornam conjuntos diferentes ou ao limpar filtros.
- Inicializar DataTable após `listar()`:

```ts
setTimeout(() => {
  $('#datatables-pesquisar-[nome-tabela-plural]').DataTable(Datatables.config);
  this.uiLoaderService.stopLoader('[nome-tabela]-pesquisar');
}, 5);
```

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

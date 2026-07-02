# 09 - Frontend Cadastro

## Objetivo

Criar tela de cadastro Angular seguindo `.specs/templates/cadastro.html`.

## Saídas

- `src/app/pages/[nome-tabela]/cadastro/cadastro.componente.ts`
- `src/app/pages/[nome-tabela]/cadastro/cadastro.componente.html`

## Estrutura visual

- O template Angular omite `<html>`, `<head>`, `<body>`, CDNs e scripts.
- Usar sintaxe moderna de blocos Angular (`@if`, `@for`) em vez de `*ngIf` e `*ngFor`.
- Usar ao máximo classes Bootstrap 5; CSS customizado deve ser mínimo e ficar em `frontend/src/styles.css`.
- Não importar nem referenciar CSS de `.specs/templates/assets` em arquivos Angular gerados.
- Renderizar o breadcrumb fora do container principal.
- O breadcrumb deve iniciar com link para `/pagina-inicial` contendo ícone FontAwesome `fa-house` antes do texto `Início`, seguido de `tabela.plural` apontando para pesquisa e `Cadastro`.
- Após o breadcrumb, encapsular o restante do conteúdo visual da tela em `<section class="container py-3">`.
- Header em `section.row g-3 align-items-start mb-4`.
- `kicker` com ícone e texto `Cadastro`.
- Título em negrito: `Novo [label]` ou `Editar [label]`.
- Em modo de edição, exibir card de auditoria compacto à direita usando classes Bootstrap, como `card d-none d-md-block`.
- Card de auditoria não deve exibir título/label "Auditoria".
- Card de auditoria deve ter largura automática pelo conteúdo, fonte reduzida, ícone `fa-clock-rotate-left` à esquerda centralizado verticalmente, criação à esquerda e alteração à direita somente se houver dados de alteração.
- Em modo de inclusão, não exibir o card de auditoria.
- Não exibir auditoria em dispositivos pequenos, mesmo em modo de edição.
- Abas arredondadas com ícones: `nav nav-pills`, `nav-link rounded-pill px-3`.
- As abas devem ficar dentro do mesmo card do formulário, antes do conteúdo da aba.
- Primeira aba: `Dados cadastrais`.
- Abas extras somente se YAML ou padrão real justificar.
- Um único card principal envolvendo abas e conteúdo do formulário.
- Agrupar campos por seções internas com estrutura Bootstrap contendo ícone, título, subtítulo e `hr`, como exemplo "Endereço".
- Não criar cards/forms lado a lado nem cards separados por grupo.

## Campos

- Formulário reativo.
- `colunas-layout`: `0` oculta; `N` usa Bootstrap; `N*` encerra linha; ausente usa largura confortável.
- Labels dos campos devem usar negrito (`fw-semibold`).
- Campos obrigatórios devem ter o label inteiro em vermelho usando `required-label`.
- Além do label em vermelho, campos obrigatórios devem exibir o ícone `fa-circle-exclamation help-dot` também em vermelho.
- Inputs com ícone usam `input-group` e `input-group-text` quando fizer sentido.
- `mask` aplica atributo `mask`.
- `fk` usa `ng-select` com service da entidade referenciada, `fk-display` e `class="ng-select-bootstrap"`.
- FK com ícone pode encapsular `ng-select` em `input-group`, usando `input-group-text` antes do componente.
- Não criar wrappers próprios para `ng-select` sem necessidade; priorizar `input-group` Bootstrap quando houver ícone.
- Não alimentar `[items]` do `ng-select` com getter que recria arrays a cada detecção de mudança; usar propriedade estável e atualizá-la quando a lista base ou o registro atual mudar.
- `enum` usa radio buttons com labels.
- `boolean` usa checkbox/toggle.
- `textoN` usa `<textarea>` com `rows="N"` (N = número no sufixo do tipo, ex.: `texto3` → 3 linhas) e ocupa a largura do `colunas-layout`.
- `foto`: exibe miniatura (thumbnail) da imagem; clicar na miniatura abre o diálogo para incluir/editar. Usa `UploadService` de `@andre.penteado/ngx-apcore` e preview `data:[tipoMime];base64,[base64]`.
- O campo `foto` deve ficar **sempre centralizado verticalmente** em relação aos demais campos da mesma linha: usar `align-items-center` na `row` e centralizar a miniatura na coluna (`d-flex flex-column align-items-center justify-content-center`), dando à linha um aspecto de portfólio.
- `arquivo`: campo de upload simples (seletor de arquivo mostrando o nome), sem miniatura, também via `UploadService`.
- Textarea e campos longos ocupam `col-12`.

## Botões

- Fora do card, abaixo do form.
- À esquerda, texto curto sobre obrigatórios.
- À direita: `Voltar` secundário e `Gravar` primário com `fa-floppy-disk`.

## Componente

- `standalone: true`.
- Selector: `[nomeprojeto]-[nometabela]-cadastro`.
- LoaderId: `[nome-tabela]-cadastro`.
- Desabilitar `Gravar` enquanto loader ativo.
- Com `:id`, carregar `service.buscar(id)` e aplicar `patchValue`.
- `Gravar` chama `incluir` ou `alterar`.
- Em sucesso, mostrar toastr e voltar para `[nome-tabela]/pesquisar`.
- Em erro HTTP, não exibir mensagens nem navegar localmente; o tratamento global é responsabilidade do `HttpErrorsInterceptor` da lib Angular ativado por `provideApcoreHttpInterceptors()`.
- Em callbacks de erro, cuidar apenas do estado local da tela, como parar loader e reabilitar botões.

## Critérios de aceite

- Auditoria não é editável, aparece somente em modo de edição e não aparece em dispositivos pequenos.
- Breadcrumb fica antes do container principal e usa ícone `fa-house` no link inicial.
- Template usa `@if`/`@for`, não `*ngIf`/`*ngFor`.
- Título da página aparece em negrito.
- Card de auditoria é compacto, sem título, com ícone à esquerda e criação/alteração lado a lado quando houver alteração.
- Abas ficam dentro do mesmo card do formulário e têm ícone.
- Seções internas do formulário têm ícone, título e subtítulo.
- Labels dos campos aparecem em negrito.
- Não há cards/forms lado a lado.
- Botões finais são `Voltar` e `Gravar`.
- Campos obrigatórios têm validação, label em vermelho e ícone de exclamação em vermelho.

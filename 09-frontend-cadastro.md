# 09 - Frontend Cadastro

## Objetivo

Criar tela de cadastro Angular seguindo `.specs/templates/cadastro.html`.

## Saídas

- `src/app/pages/[nome-tabela]/cadastro/cadastro.componente.ts`
- `src/app/pages/[nome-tabela]/cadastro/cadastro.componente.html`

## Estrutura visual

- O template Angular omite `<html>`, `<head>`, `<body>`, CDNs e scripts.
- Breadcrumb: home `/pagina-inicial` > `tabela.plural` apontando para pesquisa > `Cadastro`.
- Header em `section.row g-3 align-items-start mb-4`.
- `kicker` com ícone e texto `Cadastro`.
- Título: `Novo [label]` ou `Editar [label]`.
- Em modo de edição, exibir card de auditoria à direita com `card flat-card audit-card d-none d-md-block`.
- Em modo de inclusão, não exibir o card de auditoria.
- Não exibir auditoria em dispositivos pequenos, mesmo em modo de edição.
- Abas arredondadas: `nav nav-pills`, `nav-link rounded-pill px-3`.
- Primeira aba: `Dados cadastrais`.
- Abas extras somente se YAML ou padrão real justificar.
- Um único card principal por aba.
- Agrupar campos por seções internas com `section-heading`, `section-icon` e `hr`, como exemplo "Endereço".
- Não criar cards/forms lado a lado nem cards separados por grupo.

## Campos

- Formulário reativo.
- `colunas-layout`: `0` oculta; `N` usa Bootstrap; `N*` encerra linha; ausente usa largura confortável.
- Labels obrigatórios em vermelho com `required-label` e `fa-circle-exclamation help-dot`.
- Inputs com ícone usam `input-group` e `input-group-text` quando fizer sentido.
- `mask` aplica atributo `mask`.
- `fk` usa `ng-select` com service da entidade referenciada e `fk-display`.
- `enum` usa radio buttons com labels.
- `boolean` usa checkbox/toggle.
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
- HTTP 400/422: warning com mensagem da API.
- HTTP 500+: erro genérico.
- Em erro, permanecer no cadastro.

## Critérios de aceite

- Auditoria não é editável, aparece somente em modo de edição e não aparece em dispositivos pequenos.
- Não há cards/forms lado a lado.
- Botões finais são `Voltar` e `Gravar`.
- Campos obrigatórios têm validação e linguagem visual do modelo.

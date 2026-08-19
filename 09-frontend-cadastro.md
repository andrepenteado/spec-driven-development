# 09 - Frontend Cadastro

## Objetivo

Criar tela de cadastro Angular seguindo `templates/cadastro.html`.

As regras globais de template Angular (blocos `@if`/`@for`, Bootstrap 5, CSS) estão
em `00-contexto-geral.md` e valem aqui sem repetição.

## Saídas

- `src/app/pages/[nome-tabela]/cadastro/cadastro.componente.ts`
- `src/app/pages/[nome-tabela]/cadastro/cadastro.componente.html`

## Estrutura visual

- Renderizar o breadcrumb fora do container principal, iniciando com link para `/pagina-inicial` contendo ícone FontAwesome `fa-house` antes do texto `Início`, seguido de `tabela.plural` apontando para pesquisa e `Cadastro`.
- Após o breadcrumb, encapsular o restante do conteúdo visual da tela em `<section class="container py-3">`.
- Header em `section.row g-3 align-items-start mb-4`, com `kicker` (ícone + texto `Cadastro`) e título em negrito: `Novo [label]` ou `Editar [label]`.
- Em modo de edição, exibir card de auditoria compacto à direita usando classes Bootstrap, como `card d-none d-md-block`. Em modo de inclusão, não exibir o card; em dispositivos pequenos, nunca exibir.
- Card de auditoria: sem título/label "Auditoria", largura automática pelo conteúdo, fonte reduzida, ícone `fa-clock-rotate-left` à esquerda centralizado verticalmente, criação à esquerda e alteração à direita somente se houver dados de alteração.
- Um único card principal envolvendo abas e conteúdo do formulário. Não criar cards/forms lado a lado nem cards separados por grupo.
- Dentro de cada aba, agrupar campos por seções internas com estrutura Bootstrap contendo ícone, título, subtítulo e `hr`, como o exemplo "Endereço" do template.

## Abas

As abas vêm da propriedade `aba` dos campos e dos campos `tipo: lista`
(`01-yaml-contrato.md`). Elas ficam **dentro do mesmo card do formulário**, antes do
conteúdo, em `nav nav-pills` com `nav-link rounded-pill px-3` e ícone por aba.

- Ordem: `Dados cadastrais` (aba padrão) primeiro, depois as demais na ordem da primeira ocorrência em `tabela.campos`, e por último uma aba por `tipo: lista`, na ordem de declaração.
- Título da aba: o texto de `aba`; nas listas, `lista.label`.
- Ícone: coerente com o conteúdo, com fallback `fa-table-list` para abas comuns e `fa-list` para abas de lista.
- Ids derivados do título em kebab-case sem acentos: `aba-[slug]-tab` no botão e `aba-[slug]` no `tab-pane` (ex.: `Dados cadastrais` → `aba-dados-cadastrais`).
- A primeira aba nasce `active`.
- Manter o `nav nav-pills` mesmo quando houver uma única aba.

## Campos

- Formulário reativo.
- `colunas-layout`: `0` oculta; `N` usa Bootstrap; `N*` encerra linha; ausente usa largura confortável.
- Labels dos campos devem usar negrito (`fw-semibold`).
- Campos obrigatórios devem ter o label inteiro em vermelho usando `required-label` e exibir o ícone `fa-circle-exclamation help-dot` também em vermelho.
- Inputs com ícone usam `input-group` e `input-group-text` quando fizer sentido.
- `mask` aplica atributo `mask`.
- `enum` usa radio buttons com labels.
- `boolean` usa checkbox/toggle.
- `textoN` usa `<textarea>` com `rows="N"` (N = número no sufixo do tipo, ex.: `texto3` → 3 linhas) e ocupa a largura do `colunas-layout`. Textarea e campos longos ocupam `col-12`.
- `foto`: exibe miniatura (thumbnail) da imagem; clicar na miniatura abre o diálogo para incluir/editar. Usa `UploadService` de `@andre.penteado/ngx-apcore` e preview `data:[tipoMime];base64,[base64]`.
- O campo `foto` deve ficar **sempre centralizado verticalmente** em relação aos demais campos da mesma linha: usar `align-items-center` na `row` e centralizar a miniatura na coluna (`d-flex flex-column align-items-center justify-content-center`), dando à linha um aspecto de portfólio.
- `arquivo`: campo de upload simples (seletor de arquivo mostrando o nome), sem miniatura, também via `UploadService`.

## Campos de relacionamento (`fk-tipo`)

O controle depende de `fk-tipo` (`01-yaml-contrato.md`). Em ambos os casos o
`FormControl` guarda **a entidade referenciada inteira**, não o id.

### `fk-tipo: combo` (default)

- `ng-select` com o service da entidade referenciada, `fk-display` e `class="ng-select-bootstrap"`.
- FK com ícone pode encapsular o `ng-select` em `input-group`, usando `input-group-text` antes do componente. Não criar wrappers próprios sem necessidade.
- Não alimentar `[items]` com getter que recria arrays a cada detecção de mudança; usar propriedade estável e atualizá-la quando a lista base ou o registro atual mudar.

### `fk-tipo: radio`

Grupo de switches do Bootstrap, um por registro da entidade referenciada:

```html
<div class="d-flex flex-wrap gap-3">
  @for (opcao of formasPagamento; track opcao.id; let ultimo = $last) {
    <div class="form-check form-switch">
      <input class="form-check-input" type="radio" role="switch"
             id="formaPagamento_{{ opcao.id }}" name="formaPagamento"
             formControlName="formaPagamento" [value]="opcao" required>
      <label class="form-check-label" for="formaPagamento_{{ opcao.id }}">{{ opcao.descricao }}</label>
      @if (ultimo) {
        <span class="invalid-feedback">Forma de Pagamento é um campo obrigatório</span>
      }
    </div>
  }
</div>
```

- `type="radio"` dentro de `form-check form-switch`: a exclusividade mútua vem do próprio radio (mesmo `name`), e o `form-switch` dá o visual de chave. Não usar `type="checkbox"`, que permitiria marcar mais de uma opção.
- O texto exibido é o campo de `fk-display`.
- `obrigatorio: true`: `required` nos inputs e `invalid-feedback` na última opção, como no padrão de radio de `enum`.
- **Pré-seleção na edição:** `[value]` compara por referência, e a entidade carregada do backend é uma instância diferente da que está na lista do combo. Em `aposCarregar`, reselecionar a instância da lista pelo id:

```ts
this.form.get('formaPagamento').setValue(
  this.formasPagamento.find(f => f.id === entidade.formaPagamento?.id) ?? null
);
```

- Para isso, `carregarListasAuxiliares()` **precisa devolver o `Observable`** da carga da lista: sem isso `aposCarregar` roda antes da lista existir e nada fica marcado.

## Listas (`tipo: lista`)

Cada campo `tipo: lista` ocupa **uma aba dedicada**. Dois eixos independentes
governam a aba:

- **`lista.formato`** decide o layout dentro dela (`modal` ou `sem-modal`). Vale igual nas duas persistências.
- **`lista.persistencia`** decide como a coleção vive no componente e quando o filho é gravado.

### Subformulário (comum às duas persistências)

- Os controles de entrada do subregistro ficam em um **`FormGroup` separado, fora do `form` principal** (ex.: `formItens`). Se ficassem dentro dele, os `Validators.required` dos subcampos deixariam o formulário do CRUD inválido enquanto o subformulário estivesse vazio, travando o `Gravar`.
- Cada subformulário tem a própria flag de envio (`formItensEnviado`), usada no `was-validated`.
- No HTML, o subformulário usa `<div [formGroup]="formItens">`, **nunca `<form>`**: ele fica dentro do `<form>` principal e formulários aninhados são HTML inválido.
- O `was-validated` do CRUD fica no **contêiner do conteúdo da aba de dados**, não no `<form>` que envolve as abas. Bootstrap aplica `.was-validated :invalid` a todos os descendentes: no `<form>`, um `Gravar` com o formulário inválido acenderia em vermelho também os campos obrigatórios dos subformulários das listas, que nem foram usados ainda. Cada subformulário tem o seu próprio `was-validated`, ligado à flag dele.
- Subcampo com `fk` segue as regras de `fk-tipo` da seção anterior, inclusive a reseleção por id.
- Subcampo `foto`/`arquivo` segue as regras de upload da seção de campos: o arquivo sobe pelo `UploadService` **antes** de o subregistro ser incluído, e o subregistro guarda o UUID retornado.

### `persistencia: agregado`

A coleção é um `FormArray` no `form` principal e só é persistida no `Gravar` do CRUD.
Adicionar ou excluir um subregistro **não chama o backend** e **não chama `gravar()`**.

```ts
itens = new FormArray<FormControl<PedidoItem>>([]);
protected readonly form = new FormGroup({ /* ...campos... */, itens: this.itens });

get itensArray() {
  return this.form.get('itens') as FormArray<FormControl<PedidoItem>>;
}
```

- `obrigatorio: true` na lista: validador no `FormArray` rejeitando `length === 0`, com mensagem `[lista.label] deve ter ao menos um registro`.
- `aposCarregar` reconstrói o `FormArray` de forma idempotente, com `setControl` e nunca com `push`:

```ts
this.form.setControl('itens', new FormArray((entidade.itens ?? []).map(i => new FormControl(i))));
```

- Adicionar: validar `formItens`; se inválido, marcar a flag de envio e mostrar o toastr `Dados obrigatórios`, sem incluir. Se válido, `push(new FormControl(formItens.value))` e `formItens.reset()`.
- Excluir: `removeAt(index)` direto, **sem SweetAlert** — o registro ainda não existe no banco.

### `persistencia: independente`

A coleção é um **array comum** no componente (não `FormArray`): cada item já foi
persistido pelo service do filho, então não há estado de formulário a manter.

```ts
prontuarios: Prontuario[] = [];
```

- **A lista só funciona depois que o pai existe.** Sem isso, o `POST` do filho sairia com o pai sem `id`. Bloquear em três níveis, do mais visível ao mais defensivo:
  1. a aba fica `[class.disabled]="incluir"` com `[title]` explicando o porquê;
  2. o botão de adicionar/`Novo` fica `[disabled]="incluir"`;
  3. o método de adicionar começa checando `incluir`/`entidade?.id` e, se o pai não existe, mostra toastr de atenção e retorna sem chamar o service.
- Carregar em `aposCarregar`, guardando contra o modo inclusão:

```ts
protected override aposCarregar(paciente: Paciente): void {
  if (!paciente?.id) {
    this.prontuarios = [];
    return;
  }
  this.prontuarioService.listarPorPaciente(paciente.id).subscribe(lista => this.prontuarios = lista);
}
```

- Adicionar: validar `formProntuario`; se válido, preencher a volta ao pai com `this.entidade`, chamar `service.incluir(valor)` e, no sucesso, `unshift` no array, `reset()` do subformulário, zerar a flag de envio e toastr de sucesso.
- Excluir: **com** confirmação SweetAlert (`exibirMensagem.showConfirm`), porque o registro existe no banco. No sucesso, remover do array local — não recarregar a tela inteira.
- `obrigatorio: true` na lista não é validável aqui: o pai é gravado antes de a coleção existir. Tratar como aviso na tela, nunca bloqueando o `Gravar`.
- Os erros HTTP continuam sendo do `httpErrorsInterceptor`; o callback de erro cuida só de estado local.

### Tabela da lista (comum às duas)

- Tabela simples (`table table-hover align-middle`) em `div.table-responsive`. **Sem DataTables** e sem `id="datatables-..."`: o conteúdo é uma coleção pequena, em memória.
- **1ª coluna: apenas o botão Excluir** (`action-stack`, `btn btn-outline-danger btn-sm`, ícone `fa-trash-can`, com `title` e `aria-label`). Não há edição de linha; para corrigir, exclui e adiciona de novo.
- Demais colunas: um por subcampo com `exibe-grid: true`, na ordem do YAML, com o `label` do subcampo no cabeçalho.
- Enum mostra label; FK mostra `fk-display`; boolean mostra Sim/Não; datas usam o formato pt-BR — mesmas regras do grid da pesquisa.
- Subcampo `foto` mostra a miniatura; `arquivo` mostra o nome do anexo e ganha um botão de download na 1ª coluna, ao lado do Excluir, quando o registro já estiver persistido.
- Lista vazia: no lugar da tabela, `<div class="alert alert-light border mb-0">Nenhum registro adicionado em [lista.label].</div>`.

### `formato: sem-modal` (default)

Ordem dentro da aba:

1. Seção interna com ícone, título (`lista.label`) e subtítulo.
2. Subformulário de inclusão, com os subcampos posicionados por `colunas-layout`.
3. Botão `+ Adicionar` (`btn btn-primary`, ícone `fa-plus`) alinhado à direita em `d-flex justify-content-end`.
4. Tabela da lista.

### `formato: modal`

Ordem dentro da aba:

1. Seção interna com ícone, título (`lista.label`) e subtítulo.
2. Botão `Novo` (`btn btn-primary`, ícone `fa-plus`) com `data-bs-toggle="modal"` e `data-bs-target="#modal-[nome-do-campo-kebab]"`.
3. Tabela da lista.

O modal:

- Fica no **fim do template, fora do `<form>` principal e fora das abas**, para não aninhar formulários nem herdar o contexto de empilhamento do `tab-pane`.
- `modal fade` com `modal-dialog modal-lg`, header com `lista.label` e botão de fechar, body com o subformulário e footer com `Cancelar` (`btn btn-light`, `data-bs-dismiss="modal"`) e `Adicionar` (`btn btn-primary`).
- Fechar depois de adicionar sem depender da API JS do Bootstrap: manter um botão oculto com `data-bs-dismiss="modal"` e acioná-lo por `@ViewChild` após a inclusão bem-sucedida (em `independente`, dentro do `next` do service). Se a validação falhar, o modal continua aberto.

## Botões

- Fora do card, abaixo do form.
- À esquerda, texto curto sobre obrigatórios.
- À direita: `Voltar` secundário e `Gravar` primário com `fa-floppy-disk`.

## Componente

- `standalone: true`.
- `changeDetection: ChangeDetectionStrategy.Eager` — obrigatório, inclusive estendendo a base, que não o transmite (`00-contexto-geral.md`). Sem ele o formulário não reflete o registro carregado, as listas auxiliares nem os itens das abas de lista.
- Selector: `[nomeprojeto]-[nometabela]-cadastro`.
- **Estender obrigatoriamente `CadastroBaseComponent<T>`** de `@andre.penteado/ngx-apcore` (>= 22.0.0), em vez de reimplementar o ciclo de buscar/patchValue/incluir/alterar/mensagens do zero. A página só declara:
  - `form` (o `FormGroup` reativo da tela);
  - `buscar(id)`, `incluirEntidade(valor)`, `alterarEntidade(valor)`;
  - `tituloGravar` (título do toastr, ex.: `"Gravar [label]"`), `mensagemGravarSucesso(entidade)` (mensagem completa, ex.: `` `Dados [de/do/da] [label] ${entidade.nome} gravados com sucesso` ``) e `rotulo` (ex.: `'produto'`, usado nos logs);
  - `tituloFormulario()`/`subtituloFormulario()` continuam sendo métodos próprios da página (texto livre, não fazem parte da base).
- Se o service do projeto expõe um único método `gravar(obj, incluir)` em vez de `incluir`/`alterar` separados, `incluirEntidade`/`alterarEntidade` viram um adaptador de uma linha cada, delegando para esse método com o booleano correspondente.
- Hooks opcionais da base, usar somente quando a tela precisar:
  - `carregarListasAuxiliares()`: combos/listas carregadas na abertura da tela (ex.: lista de empresas para um `ng-select` de FK), independente de incluir/editar. **Devolva o `Observable` da carga** quando `aposCarregar` depender dessas listas — obrigatório com `fk-tipo: radio` e com FK dentro de lista. Devolver `void` mantém o comportamento não-bloqueante.
  - `novaEntidade()`: registro em branco usado no modo inclusão (padrão `{}`); sobrescreva quando a tela precisar de uma instância real da classe de domínio.
  - `aposCarregar(entidade)`: repatch de campos que `patchValue` não resolve sozinho — FK cujo `FormControl` guarda o objeto inteiro (não só o id), `FormArray` de lista reconstruído a partir da coleção, campos derivados. É chamado **nos três momentos**: ao abrir em inclusão (com `novaEntidade()`), ao carregar para edição e após gravar com sucesso — por isso **deve ser idempotente** (recrie o `FormArray` com `setControl`, não acumule com `push`).
  - `antesGravar(valor)`: pré-processamento assíncrono do valor do form antes de incluir/alterar — ex.: subir o arquivo do campo `foto`/`arquivo` via `UploadService` e só então gravar a entidade com o UUID retornado.
- Utilitários da base para listas (a partir de `@andre.penteado/ngx-apcore` >= 22.1.0), para não reescrever a mesma checagem em cada tela:
  - `subformularioValido(subformulario)`: valida o `FormGroup` do subregistro e mostra o toastr `Dados obrigatórios` quando faltar campo. Use no início do método que adiciona.
  - `registroGravado()`: em listas `independente`, confirma que o CRUD já foi gravado e mostra o toastr de atenção quando não. É a última barreira, depois da aba e do botão desabilitados.
- `ngOnInit` (herdado) aguarda `carregarListasAuxiliares()`, resolve o parâmetro de rota (`idParam`, default `'id'`) e então: havendo id, `pesquisar(id)` → `buscar(id)` → `patchValue` → `aposCarregar`; sem id, `novaEntidade()` → `aposCarregar`.
- `gravar()` (herdado): valida o form: se inválido, mostra toastr "Dados obrigatórios" e para; se válido, aplica `antesGravar`, despacha `incluirEntidade`/`alterarEntidade` e, em sucesso, faz `form.reset()` + `patchValue(entidade)` + `aposCarregar(entidade)` + toastr de sucesso (`tituloGravar`/`mensagemGravarSucesso`) — a tela permanece na página, agora em modo de edição do registro salvo (não navega de volta para `pesquisar`).
- Em erro HTTP, cuidar apenas de estado local; o tratamento global é do `httpErrorsInterceptor` (`00-contexto-geral.md`).
- **Única exceção ao contrato da base:** telas com múltiplos formulários independentes na mesma página (ex.: cadastro composto de entidade principal + sub-cadastros, cada um com seu próprio `formEnviado`/estado de abertura) têm complexidade de domínio real, não boilerplate — implementar à mão nesses casos, seguindo o restante desta spec (estrutura visual, campos, botões) mas sem forçar o contrato da base. **Isso não é um CRUD gerado.** Uma lista `tipo: lista` **não** é esse caso: o subformulário auxiliar não é um formulário independente e a base cobre a tela. Quantidade de campos, de abas ou de listas nunca é motivo para sair da base.
- Vínculo incremental (gravar a cada item adicionado, mantendo o contexto da tela) é uma exceção deliberada de telas específicas, não o comportamento gerado para `tipo: lista`.
- Logs de buscar e gravar são emitidos pela própria base a partir de `rotulo` e `identificacao(entidade)` — a página não repete esses `console.info`. Sobrescreva `identificacao()` quando o campo identificador não for `nome`/`descricao`/`id` (ex.: `razaoSocial`, `username`).

## Critérios de aceite

- A tela estende `CadastroBaseComponent` e declara `changeDetection: ChangeDetectionStrategy.Eager`.
- Auditoria não é editável, aparece somente em modo de edição e não aparece em dispositivos pequenos.
- Card de auditoria é compacto, sem título, com ícone à esquerda e criação/alteração lado a lado quando houver alteração.
- Abas ficam dentro do mesmo card do formulário, têm ícone e seguem a ordem definida; campos sem `aba` estão em `Dados cadastrais`.
- Seções internas do formulário têm ícone, título e subtítulo, e não há cards/forms lado a lado.
- Labels dos campos aparecem em negrito; campos obrigatórios têm validação, label em vermelho e ícone de exclamação em vermelho.
- FK com `fk-tipo: radio` renderiza switches mutuamente exclusivos e vem pré-selecionada ao editar.
- Cada `tipo: lista` tem aba própria, tabela sem DataTables com Excluir na 1ª coluna, e o subformulário está fora do `FormGroup` principal e fora de um `<form>` aninhado.
- Lista `agregado`: adicionar/excluir não chama o backend e a coleção é gravada junto com o registro do CRUD.
- Lista `independente`: adicionar/excluir chama o service do filho, a exclusão confirma antes, e a aba fica bloqueada com aviso enquanto o CRUD ainda não foi gravado.
- Botões finais são `Voltar` e `Gravar`.
- Operações de buscar e gravar logam com `console.info` no padrão de `11-monitoramento-faro.md`.

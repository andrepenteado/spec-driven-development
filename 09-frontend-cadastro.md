# 09 - Frontend Cadastro

## Objetivo

Criar tela de cadastro Angular seguindo `templates/cadastro.html`, na pasta da spec.

As regras globais de template Angular (blocos `@if`/`@for`, Bootstrap 5, CSS) estão
em `00-contexto-geral.md` e valem aqui sem repetição.

## Saídas

- `src/app/pages/[nome-tabela]/cadastro/cadastro.componente.ts`
- `src/app/pages/[nome-tabela]/cadastro/cadastro.componente.html`

## Estrutura visual

- Renderizar o breadcrumb fora do container principal, iniciando com link para `/pagina-inicial` contendo ícone FontAwesome `fa-house` antes do texto `Início`, seguido de `tabela.plural` apontando para pesquisa e `Cadastro`.
- Após o breadcrumb, encapsular o restante do conteúdo visual da tela em `<section class="container py-3">`.
- Header em `section.row g-3 align-items-start mb-4`, com `kicker` (ícone + texto `Cadastro`) e título em negrito: `Novo [label]` ou `Editar [label]`.
- Abaixo do título, o subtítulo da tela e, quando houver campos com `exibe-titulo: true`, a linha de resumo descrita em "Resumo no título".
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
- Com configuração por perfil, a aba só é renderizada se **ao menos um** dos campos
  dela estiver visível para o usuário: `@if` no botão e no `tab-pane`, com a mesma
  condição. Aba de lista segue `config.listas['nomeDaLista'].consultar`. A primeira
  aba **visível** recebe `active`.

## Campos

- Formulário reativo.
- `colunas-layout`: `N` usa Bootstrap; `N*` encerra linha; ausente usa largura confortável. **Nunca varia por perfil** (`01-yaml-contrato.md`): a classe Bootstrap e o fechamento da `row` são escritos uma vez no template, valendo para todos.
- `exibe-formulario: false` não renderiza o campo. É a única diferença de formulário entre perfis: um `@if` em volta do bloco do campo, dentro da mesma linha, com os vizinhos fluindo normalmente.
- Labels dos campos devem usar negrito (`fw-semibold`).
- Campos obrigatórios devem ter o label inteiro em vermelho usando `required-label` e exibir o ícone `fa-circle-exclamation help-dot` também em vermelho.
- Inputs com ícone usam `input-group` e `input-group-text` quando fizer sentido.
- `mask` aplica atributo `mask`.
- Campo cujo perfil está fora de `edicao` aparece sem permitir edição (ver "Campos sem edição").
- Com configuração por perfil, cada campo é envolvido em
  `@if (campo('nomeDoCampo').exibeFormulario)` e o bloqueio de edição passa a vir de
  `campo('nomeDoCampo').somenteLeitura` (ver "Configuração por perfil").
- `enum` usa radio buttons com os labels de `[NOME_ENUM]_LABELS` (`07-frontend-domain-service.md`), um por constante, na ordem do YAML. Com `obrigatorio: true`, `required` nos inputs e `invalid-feedback` na última opção.
- `booleano` usa checkbox/toggle.
- `textoN` usa `<textarea>` com `rows="N"` (N = número no sufixo do tipo, ex.: `texto3` → 3 linhas) e ocupa a largura do `colunas-layout`. Textarea e campos longos ocupam `col-12`.
- `editor` usa o componente do CKEditor 5 (ver "Campo de texto rico").
- `moeda` usa `<input type="text">` em `input-group`, com `input-group-text` `R$` antes do campo, `class="form-control text-end"` e a configuração completa do campo monetário do ngx-mask (ver "Campo monetário"). Não usar `type="number"`: ele ignora a máscara e mostra as setas de incremento, que não fazem sentido em dinheiro.
- `data` usa o `apcore-campo-data` da ngx-apcore (ver "Campo de data"). Não usar `type="date"`: no celular ele abre o seletor de calendário e não deixa digitar nada, e chegar a um ano de nascimento rolando mês a mês é penoso.
- Todo campo que recebe só dígitos declara `inputmode` (ver "Teclado numérico no celular"). É um atributo por campo, e é o que separa digitar um CPF no celular de brigar com o teclado alfabético.
- `email` usa `<input type="email">` em `input-group` com `input-group-text` e ícone `fa-envelope`, mais `Validators.email` no `FormControl`.
- `link` usa `<input type="url">` em `input-group` com `input-group-text` e ícone `fa-link`, mais um validador de URL absoluta (`http`/`https`) no `FormControl`, com `placeholder="https://"`.
- Em `email` e `link`, a mensagem de formato é `[label] inválido`, em `invalid-feedback` própria, separada da mensagem de campo obrigatório: obrigatório e formato inválido são erros diferentes e o usuário precisa saber qual dos dois ocorreu.
- `foto`: exibe miniatura (thumbnail) da imagem; clicar na miniatura abre o diálogo para incluir/editar. Usa `UploadService` de `@andre.penteado/ngx-apcore` e preview `data:[tipoMime];base64,[base64]`.
- O campo `foto` deve ficar **sempre centralizado verticalmente** em relação aos demais campos da mesma linha: usar `align-items-center` na `row` e centralizar a miniatura na coluna (`d-flex flex-column align-items-center justify-content-center`), dando à linha um aspecto de portfólio.
- `arquivo`: campo de upload simples (seletor de arquivo mostrando o nome), sem miniatura, também via `UploadService`.

## Campo monetário (`moeda`)

O controle de `moeda` (`01-yaml-contrato.md`) é a máscara **e mais quatro configurações**.
Aplicar só `mask="separator.2"` produz um campo que parece certo e erra o valor.

Por isso ele **não é escrito à mão**: use o `apcore-campo-moeda` da ngx-apcore, que já
traz a configuração inteira, o `input-group` com `R$` e o alinhamento à direita.

```html
<label class="form-label fw-semibold" for="valor">Valor</label>
<apcore-campo-moeda inputId="valor" formControlName="valor"
                    [somenteLeitura]="!podeEditar"></apcore-campo-moeda>
```

- Inputs: `inputId`, `somenteLeitura`, `obrigatorio`, `mensagemObrigatorio`,
  `placeholder`, `rotuloAcessivel`. O label continua fora do componente, seguindo as
  regras gerais de label desta página.
- `somenteLeitura`, nunca `disabled`: controle desabilitado sai de `form.value` e o
  campo chegaria vazio ao backend, apagando o valor gravado.
- Requer `provideNgxMask()` nos providers da aplicação, e `ngx-mask` instalado — é
  `peerDependency` **opcional** da ngx-apcore, necessária só para quem tem campo
  monetário.

O restante desta seção é o porquê de cada configuração, e vale para quem precisar
reproduzir o campo fora da ngx-apcore:

```html
<div class="input-group">
  <span class="input-group-text">R$</span>
  <input id="valor" type="text" formControlName="valor" class="form-control text-end"
         inputmode="numeric"
         [mask]="mascaraMoeda" thousandSeparator="." decimalMarker=","
         [typeFromDecimals]="true" [leadZero]="true"
         [outputTransformFn]="saidaMoeda" placeholder="0,00">
</div>
```

| Configuração | Por quê |
|---|---|
| `mask="separator.2"` | Agrupa o milhar e limita a duas casas decimais. |
| `thousandSeparator="."` / `decimalMarker=","` | Convenção pt-BR: `1.234,56`. |
| `[typeFromDecimals]="true"` | Os dígitos entram **pela direita**, como em caixa eletrônico: `15050` vira `150,50`. |
| `[leadZero]="true"` | Completa as casas decimais: um valor gravado como `1234.5` aparece `1.234,50`, não `1.234,5`. |
| `[outputTransformFn]="saidaMoeda"` | Devolve `number` ao `FormControl`, e `null` no campo vazio. |
| `inputmode="numeric"` | O campo é `type="text"`, e sem isto o celular abre o teclado alfabético para digitar dinheiro. |

- **`typeFromDecimals` não é preferência de digitação, é correção.** Sem ele o separador
  decimal precisa ser digitado, e quem digita `15050` esperando R$ 150,50 grava **quinze
  mil e cinquenta reais**. Com ele, ponto e vírgula digitados são ignorados — o usuário
  que trocar um pelo outro, por hábito ou por teclado numérico, digita o valor certo do
  mesmo jeito.
- **`inputmode` é `numeric`, não `decimal`.** Com `typeFromDecimals` os dígitos entram
  pela direita e o separador decimal é ignorado, então uma tecla de vírgula no teclado do
  celular só teria como enganar: quem a apertasse esperaria mudar as casas decimais e não
  mudaria nada.
- **`outputTransformFn` é o que mantém o tipo do domínio.** `leadZero` faz o ngx-mask
  entregar o valor desmascarado como texto (`'1234.56'`), e `07-frontend-domain-service.md`
  declara `moeda` como `number`. Sem a conversão o `FormControl` guardaria string e a
  entidade mentiria o próprio tipo. A função é declarada uma vez no componente, como
  campo `readonly`, e não como arrow no template: `outputTransformFn` é input signal, e
  uma arrow nova a cada ciclo de detecção seria uma troca de valor a cada ciclo.

```ts
export const MASCARA_MOEDA = "separator.2";

// Campo vazio vira null, e nao 0: valor nao informado nao e valor zero.
export function saidaMoeda(valor: string | number | undefined | null): unknown {
  return valor === "" || valor === null || valor === undefined ? null : Number(valor);
}
```

- O mesmo conjunto vale em **todo** campo `moeda` do projeto, inclusive nos
  subformulários de `tipo: lista` e nos filtros da pesquisa (`08-frontend-pesquisar.md`).
  Dois campos de dinheiro que se comportam diferente na mesma aplicação são um bug de
  usabilidade, não uma escolha de tela — e é exatamente o que o componente compartilhado
  existe para impedir.
- Testar a **combinação**, não a constante: um spec que só verifica `mask="separator.2"`
  passa com o campo errado. O teste digita caractere a caractere num host renderizado —
  disparando `focus` antes, senão o ngx-mask engole a primeira tecla — e confere o valor
  exibido e o valor que chega ao `FormControl`.

## Campo de data (`data`)

`type="date"` parece a escolha óbvia para `data` (`01-yaml-contrato.md`) e não é: no
celular ele abre o seletor de calendário e **não deixa digitar nada**, e chegar a um ano
de nascimento rolando mês a mês é penoso. Com `type="text"` mais `inputmode="numeric"` o
teclado numérico aparece e a data é digitada direto.

Trocar o `type` sozinho, porém, perde o que o campo nativo dava de graça — o formato, o
valor em ISO e a recusa de 30 de fevereiro. Por isso o campo **não é escrito à mão**: use
o `apcore-campo-data` da ngx-apcore.

```html
<label class="form-label fw-semibold" for="dataNascimento">Nascimento</label>
<apcore-campo-data inputId="dataNascimento" formControlName="dataNascimento"
                   icone="fa-solid fa-calendar-day"
                   autocomplete="bday"></apcore-campo-data>
```

- Inputs: `inputId`, `icone`, `somenteLeitura`, `obrigatorio`, `mensagemObrigatorio`,
  `autocomplete`, `placeholder`, `rotuloAcessivel`, `titulo`. Saída `alterado`, que é o
  `change` de um input nativo. O label continua fora do componente.
- **Por fora o campo fala ISO** (`aaaa-mm-dd`), igual ao `type="date"` que substitui: é o
  formato que o backend recebe num `LocalDate` e o que a tela compara e ordena como
  texto. A troca é transparente para o service e para o DTO — só o que o usuário vê muda.
- Na tela o formato é `dd/mm/aaaa`, com as barras postas pela máscara e
  `placeholder="dd/mm/aaaa"` para o formato ficar visível antes de digitar.
- **Vale preencher o `autocomplete`**: `bday` faz o navegador oferecer a data de
  nascimento que ele já guarda, e é o que evita a digitação inteira no celular.
- `somenteLeitura`, nunca `disabled`, pelo mesmo motivo do campo monetário.
- A validação é do componente e reprova mais que a contagem de dígitos: data incompleta,
  `32/13/2026`, `30/02/2026` e `29/02` de ano não bissexto. O erro entra no formulário
  como `data` e o `invalid-feedback` do próprio campo explica o que houve.
- Como o validador é do Angular e não da validação nativa do HTML, o visual de campo
  inválido depende de a aplicação espelhar `.ng-invalid` no `was-validated`, como já faz
  com as demais máscaras.
- O `ng-content` sai dentro do `input-group`, para o campo dividir o grupo com outro
  controle quando os dois são a mesma informação — a data e o horário de um atendimento,
  por exemplo.
- Requer `provideNgxMask()` nos providers, e `ngx-mask` instalado — a mesma
  `peerDependency` opcional do campo monetário.
- O mesmo componente vale nos subformulários de `tipo: lista` e nos filtros da pesquisa
  (`08-frontend-pesquisar.md`): duas telas do mesmo sistema em que a data se digita de
  jeitos diferentes são um bug de usabilidade.

## Teclado numérico no celular

O teclado que o celular abre é decidido pelo `inputmode`, e o padrão é o alfabético.
Um CPF, um CEP ou um telefone com máscara são `type="text"` — sem `inputmode` o usuário
recebe as letras e precisa trocar de teclado antes de cada campo.

**Regra: todo campo cujo conteúdo é só dígitos declara `inputmode`.** Vale para os campos
com `mask` numérica do ngx-mask (`00.000.000/0000-00`, `000.000.000-00`, `00000-000`,
`(00) 00000-0000`) e também para `type="number"`, que sozinho já abre o teclado numérico
na maioria dos navegadores, mas não em todos.

| Conteúdo | `inputmode` |
|---|---|
| Só dígitos: `inteiro`, `longo`, máscaras de CPF/CNPJ/CEP/telefone, data, moeda | `numeric` |
| Aceita casas decimais digitadas: `decimal`, quantidades fracionárias | `decimal` |

- `numeric` é o padrão; `decimal` só quando o usuário **precisa digitar** o separador
  decimal. Oferecer a tecla de vírgula num campo que a ignora é um convite a errar.
- `data` e `moeda` não precisam do atributo escrito na tela: `apcore-campo-data` e
  `apcore-campo-moeda` já o declaram por dentro. É mais um motivo para não reescrever
  esses campos à mão.
- Não usar `type="tel"` para conseguir o teclado: ele traz `*`, `#` e `+`, que não fazem
  parte de um CPF nem de um CEP, e muda a semântica do campo para o leitor de tela.

## Campo de texto rico (`editor`)

`editor` (`01-yaml-contrato.md`) renderiza o **CKEditor 5** ligado ao formulário
reativo.

### Instalação, uma vez por projeto

```bash
npm install ckeditor5 @ckeditor/ckeditor5-angular
```

- Importar `CKEditorModule` de `@ckeditor/ckeditor5-angular` nos `imports` do
  componente standalone.
- Importar `ClassicEditor` e os plugins de `ckeditor5` (pacote único, não os antigos
  `@ckeditor/ckeditor5-*` por plugin).
- Importar `ckeditor5/ckeditor5.css` no `styles.css` global do projeto, seguindo a
  regra de CSS compartilhado de `00-contexto-geral.md`.
- `licenseKey: 'GPL'` na configuração: a partir da v44 o CKEditor exige a chave
  declarada explicitamente para uso sob GPL.
- Configurar o `language` para `pt-br` e importar a tradução correspondente, para a
  barra de ferramentas sair em português como o resto da tela.

### No componente

```ts
protected readonly Editor = ClassicEditor;

protected readonly configEditor = {
  licenseKey: 'GPL',
  language: 'pt-br',
  plugins: [ Essentials, Paragraph, Bold, Italic, Link, List, Heading ],
  toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo' ]
};
```

```html
<ckeditor [editor]="Editor" [config]="configEditor" formControlName="preambulo"
          (ready)="aoPrepararEditor($event)"></ckeditor>
```

- O componente implementa `ControlValueAccessor`, então `formControlName` funciona como
  em qualquer controle.
- Ocupa `col-12` na linha, como `textoN`: barra de ferramentas em coluna estreita fica
  ilegível.
- Toolbar enxuta é o padrão. Só inclua o plugin que a tela precisa — cada um entra no
  bundle.

### Bloqueio de edição

Perfil fora de `edicao`, ou tela sem `podeGravar`, usa o **read-only do próprio
CKEditor**, no evento `ready`:

```ts
protected aoPrepararEditor(editor: any): void {
  if (this.campo('preambulo').somenteLeitura || !this.podeGravar) {
    editor.enableReadOnlyMode('perfil');
  }
}
```

- **Não** usar `[disabled]` no `<ckeditor>` nem `disable()` no `FormControl`: valem as
  mesmas razões da seção "Campos sem edição" — `form.value` omitiria o campo e o HTML
  iria vazio para o backend.
- `enableReadOnlyMode` exige um identificador de trava (`'perfil'`, acima); libere com
  `disableReadOnlyMode` usando o mesmo identificador, se a tela precisar reabilitar.

### Renderização do conteúdo fora do editor

O valor é HTML vindo do banco. Ao exibi-lo em outro lugar que não o CKEditor, usar
`[innerHTML]`, que o Angular sanitiza. **Nunca** `bypassSecurityTrustHtml`: o conteúdo
foi digitado por um usuário e é exatamente o vetor que a sanitização existe para barrar.

## Campos sem edição (`edicao`)

Perfil fora de `edicao` (`01-yaml-contrato.md`) mantém o campo no formulário, na
posição do `colunas-layout`, bloqueando apenas a edição.

- **Nunca usar o estado `disabled` do `FormControl`** (`disable()` ou
  `new FormControl({ value, disabled: true })`): `form.value` — usado pelo `gravar()`
  de `CadastroBaseComponent` — omite controles desabilitados, e o campo iria vazio
  para o backend. O controle continua habilitado; o bloqueio é do template.
- O label segue as mesmas regras dos demais campos (negrito e, se `obrigatorio`,
  em vermelho com o ícone).
- Bloqueio por tipo de controle:

| Controle | Como bloquear |
|---|---|
| `input`, `textarea` (`texto`, `textoN`, `email`, `link`, numéricos, datas, com ou sem `mask`) | atributo `readonly` e classe `bg-body-secondary` para deixar claro que não é editável |
| `ng-select` (`fk-tipo: combo`) | `[readonly]="true"` no próprio `ng-select` |
| radio de `enum`, switches de `fk-tipo: radio`, checkbox de `booleano` | envolver o grupo em `div.pe-none` com `aria-disabled="true"` e `tabindex="-1"` nos inputs — `readonly` não funciona em radio/checkbox |
| `foto`, `arquivo` | mostrar só a miniatura ou o nome do anexo (com download, quando fizer sentido); não renderizar o seletor de arquivo nem a ação de trocar/remover |

- `exibe-formulario: false`: o campo não é renderizado e `edicao` não muda nada na tela — mas continua barrando a escrita no service.
- A tela e o service leem o mesmo `edicao`: o backend repõe o valor anterior do campo
  que o perfil não edita (`04-backend-service.md`). Bloquear no template não é o que
  protege — é o que evita oferecer ao usuário uma edição que o service descartaria.

## Resumo no título (`exibe-titulo`)

Campos com `exibe-titulo: true` (`01-yaml-contrato.md`) são repetidos no cabeçalho
da tela, abaixo do título e do subtítulo, com a fonte de subtítulo:

```html
<h1 class="display-6 fw-bold mb-2">Editar pedido</h1>
<p class="text-secondary mb-0">Pedido de venda com itens e ocorrências.</p>
<p class="text-secondary mb-0 mt-1">
  <span class="fw-semibold">Número:</span> {{ form.get('numero').value }}
  <span class="mx-2">·</span>
  <span class="fw-semibold">Cliente:</span> {{ form.get('cliente').value?.nome }}
</p>
```

- Uma única linha `p.text-secondary mb-0 mt-1`, com os campos na ordem de
  `tabela.campos`, separados por `<span class="mx-2">·</span>`. Só o rótulo é
  `fw-semibold`; o valor fica na fonte normal do subtítulo.
- O valor vem do **`FormControl`**, não da entidade carregada: assim a linha
  acompanha o que está na tela, inclusive depois de gravar.
- Formatação igual à do grid da pesquisa: `enum` mostra o label, `fk` mostra o
  `fk-display`, `booleano` mostra Sim/Não, datas usam o formato pt-BR, `decimal` usa o
  separador pt-BR, `moeda` usa `CurrencyPipe` com `'BRL'` e `email`/`link` saem
  clicáveis, com as mesmas regras de `target` e `rel` do grid
  (`08-frontend-pesquisar.md`).
- Valor `null`, `undefined` ou string vazia: o item some, junto com o separador
  vizinho. Sem nenhum valor preenchido (modo inclusão, tipicamente), a linha
  inteira não é renderizada — envolver o bloco em `@if`.
- O campo **continua** no formulário conforme o `colunas-layout`;
  `exibe-formulario: false` é o que deixa o valor só no cabeçalho.
- A linha não substitui o subtítulo de `subtituloFormulario()`: vem depois dele.
- Com configuração por perfil, cada item da linha é condicionado a
  `campo('nomeDoCampo').exibeTitulo`, além da checagem de valor preenchido.

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
- Demais colunas: um por subcampo com `exibe-grid: true`, na ordem do YAML, com o `label` do subcampo no cabeçalho. O default é `false`, como no grid da pesquisa (`01-yaml-contrato.md`).
- Enum mostra label; FK mostra `fk-display`; `booleano` mostra Sim/Não; datas usam o formato pt-BR; `email` e `link` saem clicáveis; `moeda` usa `CurrencyPipe` com `'BRL'`, na coluna alinhada à direita — mesmas regras do grid da pesquisa.
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

## Configuração por perfil

Só quando o YAML tem `tabela.acoes`, `lista.acoes` ou algum `por-perfil`
(`01-yaml-contrato.md`). A tela é **uma só**: os mesmos arquivos servem todos os
perfis, e o que muda é quais campos aparecem, quais são editáveis e se dá para gravar.

- Injetar `LoginService` e resolver a configuração na construção do componente,
  conforme `06-frontend-rotas-menu-api.md`.
- O `FormGroup` continua declarando **todos** os campos da união, com os mesmos
  `Validators` — inclusive os ocultos para o perfil. O valor que veio do backend
  precisa voltar intacto no `Gravar`, e é isso que evita que um perfil apague dados
  que nem enxerga.
- Pelo mesmo motivo, **nunca** remover controle do `FormGroup`, nem usar `disable()`,
  para ocultar campo de um perfil: `form.value` omitiria o controle e o campo iria
  vazio para o backend. Ocultar é decisão de template.
- `campo(...).somenteLeitura` é o `edicao` do YAML já resolvido para o usuário: a
  tabela de bloqueio da seção "Campos sem edição" continua valendo, trocando o valor
  fixo pelo binding.

```html
@if (campo('desconto').exibeFormulario) {
  <div class="col-md-4">
    <label class="form-label fw-semibold" for="desconto">Desconto</label>
    <input id="desconto" type="text" class="form-control" formControlName="desconto"
           [readonly]="campo('desconto').somenteLeitura"
           [class.bg-body-secondary]="campo('desconto').somenteLeitura">
  </div>
}
```

- Grupos de `enum`, switches de `fk-tipo: radio` e checkbox de `booleano` usam
  `[class.pe-none]="campo('x').somenteLeitura"` e
  `[attr.aria-disabled]="campo('x').somenteLeitura || null"`, em vez do `div.pe-none`
  fixo.
- Aba com todos os campos ocultos não é renderizada (ver "Abas"). Aba de lista some
  quando o campo `tipo: lista` está oculto para o perfil; a coleção continua chegando
  no payload e é gravada como veio.
### Ações no cadastro

`podeGravar` é a única derivação que a página precisa fazer: depende do modo da tela.

```ts
protected get podeGravar(): boolean {
  return this.incluir ? this.config.acoes.incluir : this.config.acoes.alterar;
}
```

- `Gravar` fica em `@if (podeGravar)`. `Voltar` é sempre exibido.
- **Sem `podeGravar`, a tela inteira é somente leitura**, independente do `edicao` de
  cada campo: o bloqueio de cada controle passa a ser
  `campo('x').somenteLeitura || !podeGravar`. Não faz sentido oferecer edição num
  formulário que não pode ser enviado.
- Modo inclusão sem a ação `incluir`: o `crudRoutes()` protege as três rotas com os
  mesmos perfis e não separa a de inclusão (`06-frontend-rotas-menu-api.md`), então a
  barreira fica aqui — em `ngOnInit`, antes de montar a tela, mostrar toastr de
  atenção e navegar de volta para a pesquisa.
- O texto curto sobre obrigatórios à esquerda dos botões some junto com o `Gravar`:
  sem edição não há campo obrigatório a preencher.

### Ações customizadas

Ação customizada com `tela: cadastro` ou `tela: ambos` (`01-yaml-contrato.md`) vira mais
um botão. Sem `aba`, ele fica na barra de botões, à direita, antes de `Voltar` e
`Gravar`:

```html
@if (config.acoesCustomizadas['revogar'] && !incluir) {
  <button type="button" class="btn btn-outline-danger" (click)="revogar()">
    <i class="fa-solid fa-ban me-2"></i>Revogar
  </button>
}
```

- **Sempre `&& !incluir`**: a ação opera sobre um registro existente, e em modo de
  inclusão ele ainda não tem id. É o mesmo motivo pelo qual a aba de lista
  `independente` fica bloqueada antes do primeiro `Gravar`.
- Com `aba` declarada, o botão sai da barra e vai para **o fim do conteúdo daquela
  aba**, em `d-flex justify-content-end`, no lugar onde a aba de lista põe o
  `+ Adicionar`. É onde a ação pertence quando ela age sobre o que a aba mostra — um
  `Assinar` na aba `Assinatura`, um `Conferir` na aba de conferência.
- O botão continua **fora** de qualquer `<form>` aninhado e não é `type="submit"`: ele
  chama o service da ação, não o `gravar()` da tela.
- Aba escondida para o perfil (todos os campos ocultos, ou lista sem `consultar`) leva
  o botão junto. Se a ação precisa ficar disponível de qualquer forma, declare-a sem
  `aba` — na barra de botões ela não depende de aba nenhuma.
- `confirmar: true` (default): `exibirMensagem.showConfirm(...)` antes de chamar o
  service.
- No sucesso, toastr e `this.pesquisar(this.entidade.id)` (herdado da base) para
  recarregar o registro — é ele que refaz `buscar` → `patchValue` → `aposCarregar`, e a
  tela reflete o novo estado sem navegação.
- No erro, cuidar apenas de estado local; o 409/422 da regra de negócio é mostrado pelo
  `httpErrorsInterceptor`.
- A ação **não** depende de `podeGravar` nem de `edicao`: ela é autorizada pelos
  `perfis` dela e pode alterar campos que ninguém edita pela tela — um `revogar` muda a
  `situacao` que tem `edicao: []`.

### Ações das listas

`config.listas['nomeDaLista']` governa cada aba de lista, com as regras de
`lista.acoes` (`01-yaml-contrato.md`):

| Ação | Efeito |
|---|---|
| `consultar` | `@if` na aba (botão e `tab-pane`). Sem ela, a aba não existe para o perfil |
| `incluir` | `@if` no subformulário e no botão `+ Adicionar` (`sem-modal`) ou `Novo` (`modal`) |
| `excluir` | `@if` no botão de excluir da primeira coluna da tabela da lista |

- Sem `incluir`, a aba mostra só a seção interna e a tabela: vira uma aba de consulta
  da coleção. A mensagem de lista vazia continua valendo.
- Sem `incluir` e sem `excluir`, a primeira coluna da tabela fica vazia — nesse caso,
  não renderizar a coluna (nem `<th>` nem `<td>`).
- As ações da lista são independentes de `podeGravar` no que diz respeito a
  `persistencia: independente`, onde adicionar e excluir chamam o service do filho na
  hora. Em `agregado`, a coleção só é persistida no `Gravar`, então uma aba com
  `incluir` num perfil sem `alterar` seria trabalho perdido — `lista.acoes` herda de
  `tabela.acoes` justamente para isso não acontecer por descuido.

### Regras gerais

- Esconder botão **não** é segurança: quem barra é o `@Secured` por ação no service
  (`04-backend-service.md`). A tela esconde para não oferecer um caminho que
  terminaria em 403.
- Nada de gerar um segundo componente, um segundo template ou um segundo `form` por
  perfil.

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
  - `novaEntidade()`: registro em branco usado no modo inclusão (padrão `{}`); sobrescreva quando a tela precisar de uma instância real da classe de domínio, ou quando alguma `regra` do YAML (`01-yaml-contrato.md`) definir valor inicial que a tela deve mostrar antes de gravar — a tela espelha, o service é quem garante.
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
- Campo fora do `edicao` do perfil aparece no formulário, não aceita edição e chega gravado ao backend com o valor anterior — nenhum `FormControl` desabilitado.
- Campo `exibe-titulo: true` aparece como `label: valor` abaixo do título, com fonte de subtítulo, e some quando não há valor.
- Campo `email` e `link` validam formato no cliente, com mensagem própria distinta da de obrigatório, e aparecem clicáveis no resumo do título.
- Campo `moeda` usa máscara pt-BR com `R$` no `input-group`, alinhado à direita, e nunca `type="number"`.
- Campo `moeda` usa o `apcore-campo-moeda` da ngx-apcore, e não a máscara escrita à mão: digitar `15050` resulta em `150,50`, ponto e vírgula digitados são ignorados e o `FormControl` recebe `number` (`null` quando vazio).
- Campo `data` usa o `apcore-campo-data` da ngx-apcore e nunca `type="date"`: digita-se `dd/mm/aaaa` pelo teclado numérico, o `FormControl` guarda ISO (`aaaa-mm-dd`) e `30/02` é reprovado.
- Todo campo só de dígitos declara `inputmode` — `numeric`, ou `decimal` quando o separador decimal é digitado. Nenhum campo com máscara numérica abre o teclado alfabético no celular.
- Campo `editor` renderiza o CKEditor 5 ligado ao `FormControl`, ocupa `col-12`, e o bloqueio usa `enableReadOnlyMode`, nunca `disabled`.
- FK com `fk-tipo: radio` renderiza switches mutuamente exclusivos e vem pré-selecionada ao editar.
- Cada `tipo: lista` tem aba própria, tabela sem DataTables com Excluir na 1ª coluna, e o subformulário está fora do `FormGroup` principal e fora de um `<form>` aninhado.
- Lista `agregado`: adicionar/excluir não chama o backend e a coleção é gravada junto com o registro do CRUD.
- Lista `independente`: adicionar/excluir chama o service do filho, a exclusão confirma antes, e a aba fica bloqueada com aviso enquanto o CRUD ainda não foi gravado.
- Botões finais são `Voltar` e `Gravar`.
- Com configuração por perfil, existe uma única tela de cadastro para todos os perfis; o `FormGroup` tem todos os campos, nenhum controle é removido ou desabilitado, e aba sem campo visível não é renderizada.
- `Gravar` só aparece para quem tem a ação do modo atual, e sem ela o formulário inteiro fica somente leitura.
- Ação customizada com `tela` incluindo `cadastro` aparece na barra de botões, ou no fim da aba de `aba`, some em modo de inclusão, confirma antes e recarrega o registro no sucesso.
- Aba de lista respeita `lista.acoes`: sem `consultar` não existe, sem `incluir` não tem subformulário, sem `excluir` não tem botão de excluir.
- Operações de buscar e gravar logam com `console.info` no padrão de `11-monitoramento-faro.md`.

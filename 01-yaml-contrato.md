# 01 - YAML Contrato

## Objetivo

Definir entrada de metadados para criação do CRUD.

## Local

YAMLs de entrada ficam em `.cruds/*.yaml`.

## Exemplo

```yaml
crud:
  nome: pedido

autor: Nome do Autor

projeto:
  nome: venda
  perfis:
    - PerfisUsuario.CAIXA:CAIXA
    - PerfisUsuario.GERENTE:GERENTE

# Regras de negócio do service, escritas em português. Opcional.
regras:
  - nome: situação inicial
    prompt: >
      Ao incluir um pedido, gravar a situação como ABERTO, ignorando o que vier
      no payload.

tabela:
  nome: pedido
  label: Pedido
  plural: Pedidos
  # Quem pode fazer o quê. Ausente, todos os perfis podem tudo.
  acoes:
    consultar: [CAIXA, GERENTE]
    incluir: [CAIXA]
    alterar: [CAIXA, GERENTE]
    excluir: [GERENTE]
  campos:
    - nome: id
      tipo: longo
      pk: true
      autoincremento: true

    # Gerado pelo sistema: aparece no form sem permitir edição e é repetido
    # no topo do cadastro, abaixo do título.
    - nome: numero
      tipo: texto
      label: Número
      obrigatorio: true
      unique: true
      indice: true
      pesquisavel: exato
      edicao: []
      exibe-titulo: true
      colunas-layout: 4
      exibe-grid: true

    # FK padrão: ng-select (equivale a fk-tipo: combo)
    - nome: cliente
      tipo: longo
      label: Cliente
      fk: cliente
      fk-display: nome
      obrigatorio: true
      indice: true
      pesquisavel: exato
      exibe-titulo: true
      colunas-layout: 8*
      exibe-grid: true

    # `edicao` diz quem grava o campo; os demais perfis o veem somente leitura.
    # O que varia fora disso vai em `por-perfil`, declarado para todos os perfis.
    - nome: desconto
      tipo: moeda
      label: Desconto
      colunas-layout: 4
      exibe-grid: true
      edicao: [ GERENTE ]
      por-perfil:
        CAIXA:
          pesquisavel: false
        GERENTE:
          pesquisavel: exato

    # Enum: `tipo: texto` mais o bloco `enum` com os valores e seus labels.
    # Gera SituacaoPedido no Java e no TypeScript, e radio buttons no cadastro.
    - nome: situacao
      tipo: texto
      label: Situação
      obrigatorio: true
      pesquisavel: exato
      colunas-layout: 8*
      exibe-grid: true
      enum:
        nome: SituacaoPedido
        valores:
          ABERTO: Aberto
          FATURADO: Faturado
          CANCELADO: Cancelado

    # FK como switches do Bootstrap: poucas opções e estáveis
    - nome: forma_pagamento
      tipo: longo
      label: Forma de Pagamento
      fk: forma_pagamento
      fk-display: descricao
      fk-tipo: radio
      obrigatorio: true
      colunas-layout: 12*
      exibe-grid: true

    # Texto com validação de formato e link clicável no grid
    - nome: email_contato
      tipo: email
      label: E-mail de Contato
      pesquisavel: contem
      colunas-layout: 6*
      exibe-grid: true

    # Sem `aba`: vai para a aba padrão "Dados cadastrais"
    - nome: observacao
      tipo: texto3
      label: Observação
      colunas-layout: 12*

    # Campos agrupados em uma aba própria
    - nome: cep_entrega
      tipo: texto
      label: CEP de Entrega
      mask: "00000-000"
      aba: Entrega
      colunas-layout: 4

    - nome: endereco_entrega
      tipo: texto
      label: Endereço de Entrega
      aba: Entrega
      colunas-layout: 8*

    - nome: previsao_entrega
      tipo: data
      label: Previsão de Entrega
      aba: Entrega
      colunas-layout: 4

    - nome: rastreamento
      tipo: link
      label: Rastreamento
      aba: Entrega
      colunas-layout: 8*

    # Lista N:M — há subcampo com `fk` (produto).
    # Vira a entidade intermediária PedidoItem, mapeada com @OneToMany (nunca @ManyToMany).
    # persistencia: agregado (default) — os itens são gravados junto com o pedido.
    - nome: itens
      tipo: lista
      obrigatorio: true
      lista:
        label: Itens
        tabela: pedido_item
        formato: sem-modal
        # O gerente confere os itens sem mexer neles.
        acoes:
          consultar: [CAIXA, GERENTE]
          incluir: [CAIXA]
          excluir: [CAIXA]
        campos:
          - nome: produto
            tipo: longo
            label: Produto
            fk: produto
            fk-display: nome
            obrigatorio: true
            colunas-layout: 6
            exibe-grid: true

          - nome: quantidade
            tipo: decimal
            label: Quantidade
            obrigatorio: true
            colunas-layout: 3
            exibe-grid: true

          - nome: preco_unitario
            tipo: moeda
            label: Preço Unitário
            obrigatorio: true
            colunas-layout: 3*
            exibe-grid: true

    # Lista 1:N — nenhum subcampo tem `fk`.
    # persistencia: independente — a ocorrência é registro de negócio próprio, gravado
    # no "Adicionar" e consultado fora da tela do pedido. Gera resource e service dela.
    - nome: ocorrencias
      tipo: lista
      lista:
        label: Ocorrências
        tabela: pedido_ocorrencia
        persistencia: independente
        formato: modal
        campos:
          - nome: data
            tipo: data-hora
            label: Data
            obrigatorio: true
            colunas-layout: 4
            exibe-grid: true

          - nome: descricao
            tipo: texto3
            label: Descrição
            obrigatorio: true
            colunas-layout: 8*
            exibe-grid: true

          # Uploads são permitidos dentro de lista
          - nome: comprovante
            tipo: arquivo
            label: Comprovante
            colunas-layout: 12*
            exibe-grid: true
```

## Campos obrigatórios

`crud.nome`, `autor`, `projeto.nome`, `projeto.perfis`, `tabela.nome`, `tabela.label`, `tabela.plural`, `tabela.campos`.

`regras` é a única chave opcional da raiz. Ver "Regras de negócio".

## Regras de negócio (`regras`)

`regras` é uma lista na **raiz** do YAML com as regras que o service precisa aplicar
nas operações padrão do CRUD. Cada item tem um `nome`, para referência, e um `prompt`
com a regra em português:

```yaml
regras:
  - nome: situação inicial
    prompt: >
      Ao incluir um edital, gravar a situação como RASCUNHO e a unidade
      universitária como a sigla da unidade do usuário logado, ignorando o que
      vier no payload.

  - nome: bloqueio de edital publicado
    prompt: >
      Ao alterar um edital cuja situação seja PUBLICADO ou REVOGADO, recusar a
      operação com erro de negócio.
```

| Propriedade | Default | Efeito |
|---|---|---|
| `nome` | - | Obrigatório. Identifica a regra no código e no relatório. |
| `prompt` | - | Obrigatório. A regra, em português, implementada no service. |

### Regra ou ação customizada?

As duas carregam um `prompt`, e a diferença é o que cada uma gera:

| | `regras` | `tabela.acoes-customizadas` |
|---|---|---|
| O que produz | comportamento **dentro** de `incluir`/`alterar`/`excluir` | um método, um endpoint e um botão novos |
| Como é acionada | acontece sozinha, ao gravar | o usuário clica |
| Perfil | não tem: vale para todo mundo que grava | tem `perfis` próprios, com `@Secured` |

Valor inicial, bloqueio por estado, cálculo de campo derivado e consistência entre
campos são `regras`. Revogar, publicar e homologar são ações.

### Regras

- O `prompt` precisa dizer **em que momento** a regra vale — na inclusão, na alteração,
  na exclusão ou sempre. É por ele que a IA decide em qual método escrever o código.
- O `prompt` precisa dizer **sobre o que** a regra age quando não for o registro do
  CRUD: o service de uma lista `persistencia: independente` também é alvo, e aí a regra
  nomeia a tabela filha.
- A maioria das regras é de negócio e vive no service, mas uma regra pode ser **de
  tela** — mudar como uma lista é apresentada, por exemplo. Nesse caso o `prompt` diz
  isso explicitamente, e a implementação vai para o componente, não para o service.
  Prefira uma propriedade declarativa quando existir uma; `regras` é para o que o
  contrato não cobre.
- Escreva como regra, não como pedido: a condição, o efeito e o que fazer quando a
  condição não vale. Os dois exemplos acima fazem isso.
- Regra que **recusa** uma operação usa a exception de negócio do projeto, que o
  handler converte em 409/422 — nunca falha em silêncio (`04-backend-service.md`).
- Regra que define **valor inicial** e a tela precisa mostrar antes de gravar deve ser
  espelhada em `novaEntidade()` no cadastro (`09-frontend-cadastro.md`). O service
  continua sendo quem garante.
- `nome` repetido entre duas regras é `invalido`.
- Valem para `regras` as mesmas ressalvas de `prompt` das ações customizadas: é um
  rascunho gerado de texto livre, precisa de revisão, entra no relatório final e mudar
  o texto de um CRUD já gerado não reescreve o service.

## Perfis (`projeto.perfis`)

`projeto.perfis` declara quais perfis acessam o CRUD. Cada item tem o formato
`ConstanteJava:NOME_PERFIL`:

- **antes de `:`** — a referência Java usada no `@Secured` do service, no formato
  `Classe.CONSTANTE` (ex.: `PerfisUsuario.CAIXA`). Ver `04-backend-service.md`.
- **depois de `:`** — o sufixo do perfil no frontend, usado como
  `` `${PREFIXO_PERFIL_SISTEMA}CAIXA` `` nas rotas e no menu. Ver
  `06-frontend-rotas-menu-api.md`.

Os perfis valem para o CRUD inteiro: liberam as rotas e o item de menu, e são a base
de `tabela.acoes` e de `por-perfil`, que só podem citar perfis declarados aqui.

`projeto.perfis` lista os perfis que acessam **este** CRUD, não todos os do sistema:
cada YAML declara os seus. A referência Java antes de `:` e o prefixo do frontend são
do projeto — por isso o bloco fica em `projeto` — mas a lista é escolhida por CRUD.

## Ações (`tabela.acoes`)

`acoes` declara **quais perfis podem fazer o quê**. É uma chave por operação do CRUD,
com a lista dos perfis que a possuem — o nome depois de `:` em `projeto.perfis`:

```yaml
  acoes:
    consultar: [CAIXA, GERENTE]
    incluir: [CAIXA]
    alterar: [CAIXA, GERENTE]
    excluir: [GERENTE]
```

| Ação | Backend | Frontend |
|---|---|---|
| `consultar` | `listar()`, `buscar()` e `pesquisar()` | abre a pesquisa e abre o cadastro |
| `incluir` | `incluir()` | botão `Novo` e `Gravar` em modo inclusão |
| `alterar` | `alterar()` | `Gravar` em modo edição |
| `excluir` | `excluir()` | ação de excluir na linha do grid |

- `acoes` é **opcional**. Ausente, todos os perfis de `projeto.perfis` têm as quatro
  ações — é o comportamento de sempre, e nenhum YAML existente precisa mudar.
- Chave ausente dentro de `acoes` vale para todos os perfis de `projeto.perfis`. Para
  negar uma ação a todo mundo, declare a lista vazia: `excluir: []`.
- Perfil citado em `acoes` que não esteja em `projeto.perfis` torna o YAML `invalido`.
- Operação de negócio fora das quatro (revogar, publicar, homologar) não entra aqui:
  ver "Ações customizadas".
- Perfil sem `consultar` é `invalido`: ele não conseguiria abrir tela nenhuma e não
  deveria estar em `projeto.perfis`.
- Diferente da configuração de campos, `acoes` **é** barreira de segurança: vira
  `@Secured` por método no service (`04-backend-service.md`), não apenas botão
  escondido na tela.

## Ações customizadas (`tabela.acoes-customizadas`)

Operação de negócio que não é nenhuma das quatro do CRUD: revogar, publicar, cancelar,
homologar. Fica ao lado de `acoes`, em uma lista, e cada item traz a **regra em
português** que o service vai implementar:

```yaml
  acoes-customizadas:
    - nome: revogar
      label: Revogar
      icone: fa-ban
      perfis: [ PUBLICADOR ]
      tela: ambos
      prompt: >
        Muda a situação do edital para REVOGADO e registra a data da revogação.
        Só é permitido quando a situação atual é PUBLICADO; nos demais casos,
        rejeitar com erro de negócio.
```

| Propriedade | Default | Efeito |
|---|---|---|
| `nome` | - | Obrigatório, snake_case. Origem do método, do endpoint e da chave no frontend. |
| `prompt` | - | Obrigatório. A regra de negócio, em português, implementada no service. |
| `perfis` | todos de `projeto.perfis` | Quem executa. Vira `@Secured` no método. |
| `label` | Capitalização de `nome` | Texto do botão, da confirmação e das mensagens. |
| `icone` | `fa-bolt` | Ícone FontAwesome do botão. |
| `tela` | `cadastro` | Em que tela o botão aparece: `cadastro`, `pesquisa` ou `ambos`. |
| `aba` | barra de botões | Aba do cadastro que recebe o botão. Não se aplica a `tela: pesquisa`. |
| `confirmar` | `true` | Pede confirmação SweetAlert antes de executar. |

### Nomes derivados

Para `tabela.nome: edital` e `nome: revogar`:

| Item | Derivação | Exemplo |
|---|---|---|
| Método do service | camelCase de `nome` | `revogar(Long id)` |
| Endpoint | `POST /[plural]/{id}/[nome-kebab]` | `POST /editais/{id}/revogar` |
| Método do service Angular | camelCase de `nome` | `revogar(id)` |
| Chave no frontend | camelCase de `nome` | `acoesCustomizadas['revogar']` |

### Regras

- A ação opera sobre **um registro**, identificado pelo id. Sem parâmetros extras e sem
  body: é um comando, não um formulário.
- Ação que precisa de dado digitado **não é ação customizada**. Ou o dado é um campo do
  CRUD, gravado pelo `alterar`, ou é uma tela própria. Manter o comando de um clique é
  o que permite gerá-lo inteiro a partir do `prompt`.
- `nome` não pode ser `consultar`, `incluir`, `alterar`, `excluir`, `listar`, `buscar`
  nem `pesquisar`: colidiria com os métodos padrão. Nome repetido entre duas ações
  customizadas também é `invalido`.
- Perfil citado em `perfis` que não esteja em `projeto.perfis` torna o YAML `invalido`.
- `tela` fora de `cadastro`/`pesquisa`/`ambos` é `invalido`.
- `aba` posiciona o botão **dentro de uma aba do cadastro**, em vez da barra de botões
  do rodapé. Ausente, o botão vai para a barra, ao lado de `Voltar` e `Gravar`.
  Renderização: `09-frontend-cadastro.md`.
- `aba` com `tela: pesquisa` é `invalido`: a pesquisa não tem abas, e o botão dela vive
  na linha do grid. Com `tela: ambos`, `aba` vale só para a metade do cadastro.
- O texto de `aba` precisa corresponder a uma aba existente do cadastro — a aba padrão
  `Dados cadastrais`, um valor de `aba` usado por algum campo, ou o `lista.label` de uma
  aba de lista. Aba inexistente é `invalido`, e a comparação é literal, como em
  "Agrupamento por abas".
- Como `tabela.acoes`, a ação customizada **é barreira de segurança**: `@Secured` no
  método do service (`04-backend-service.md`), não só botão escondido.

### O `prompt` e o que ele garante

`prompt` é a única parte do contrato que é **texto livre para a IA**, e isso muda o que
se pode esperar dela:

- O corpo do método é um **primeiro rascunho** derivado de linguagem natural. Ele
  precisa de revisão humana como qualquer código gerado — mais, não menos.
- A IA deve descrever, no relatório final (`orquestrador.md`), o que implementou para
  cada ação customizada. O checksum do YAML garante que o texto não mudou; não garante
  que o código faz o que o texto diz.
- Escreva o `prompt` como uma regra, não como um pedido: diga a transição de estado, as
  pré-condições e o que fazer quando elas não valem. O exemplo acima faz as três
  coisas.
- Mudar o `prompt` de uma ação **já gerada** não reescreve o service: continua valendo
  "não alterar CRUD já gerado" (`00-contexto-geral.md`). O checksum muda e o CRUD
  aparece como divergente no relatório, mas a alteração do código é manual.

## Configuração por perfil (`por-perfil`)

O mesmo CRUD pode se apresentar de formas diferentes conforme o perfil: um campo que
um perfil edita e o outro só lê, uma coluna que só aparece para um deles, um filtro
exclusivo de um perfil.

Tudo isso é declarado **no mesmo YAML da tabela**, dentro do campo, no bloco
`por-perfil`. Cada propriedade fica em **um dos dois lugares, nunca nos dois**: ou é
comum, declarada direto no campo e valendo para todos os perfis, ou varia, e aí é
declarada em `por-perfil` para **todos** os perfis, um por um:

```yaml
    - nome: desconto
      tipo: moeda
      label: Desconto
      colunas-layout: 4          # comum: a largura é a mesma para todos
      exibe-grid: true           # comum: a coluna aparece para todos
      edicao: [ GERENTE ]        # quem grava; ver "Edição do campo"
      por-perfil:
        CAIXA:                   # o caixa não pesquisa por desconto
          pesquisavel: false
        GERENTE:                 # o gerente pesquisa
          pesquisavel: exato
```

**Isso não gera um segundo CRUD.** Banco, entidade, repository, filter, service,
resource, rota, menu, entidade TypeScript, service Angular, tela de pesquisa e tela
de cadastro continuam sendo **um único** conjunto de arquivos. O que muda é o que
cada perfil enxerga, resolvido em tempo de execução a partir dos perfis do usuário
logado (`06-frontend-rotas-menu-api.md`, `08-frontend-pesquisar.md` e
`09-frontend-cadastro.md`).

CRUD sem nenhum `por-perfil` e sem `acoes` — o caso normal — não gera nada além do
que as demais specs já descrevem.

### Exaustividade: propriedade declarada por perfil vale para todos

Esta é a regra que torna o bloco legível sem precisar cruzar informação com o resto do
campo. **Se uma propriedade aparece em `por-perfil`, ela precisa aparecer em todos os
perfis, e não pode ter valor comum no campo.**

```yaml
    - nome: orgao_expedidor
      tipo: texto
      label: Órgão Expedidor
      colunas-layout: 4*
      por-perfil:
        EDITOR:
          exibe-grid: false
        CONFERENTE:
          exibe-grid: true
        ASSINANTE:
          exibe-grid: true
```

- `exibe-grid` não aparece no campo: quem quiser saber o que cada perfil vê no grid lê
  as três linhas do `por-perfil` e pronto, sem somar com default nem com valor comum.
- `colunas-layout` continua no campo porque é igual para todos.
- O `por-perfil` precisa ter uma entrada para **cada** perfil de `projeto.perfis`.
  Perfil faltando torna o YAML `invalido` — o silêncio de um perfil seria exatamente a
  ambiguidade que a regra elimina.
- Propriedade em `por-perfil` para uns perfis e não para outros é `invalido`.
- Mesma propriedade no campo e em `por-perfil` é `invalido`: o leitor teria de decidir
  qual vence.
- Vale por propriedade, não pelo bloco: no exemplo do `desconto` acima, `pesquisavel`
  está nos dois perfis e `colunas-layout`, `exibe-grid` e `edicao` estão só no campo.
  Cada uma escolheu um lado.

O default documentado em "Propriedades de campo" só se aplica a propriedade **ausente
das duas partes**. Uma vez que ela entra em `por-perfil`, cada perfil declara o valor,
inclusive quando o valor é o default (`pesquisavel: false`, no exemplo do `desconto`).

### Propriedades aceitas em `por-perfil`

Aceitas: `exibe-formulario`, `exibe-grid`, `exibe-titulo`, `pesquisavel` e
`fk-tipo`.

`edicao` **não** entra em `por-perfil`: ela já é uma lista de perfis, exaustiva por
construção, e vive direto no campo (ver "Edição do campo").

Rejeitadas (tornam o YAML `invalido`): `nome`, `tipo`, `label`, `pk`,
`autoincremento`, `obrigatorio`, `unique`, `indice`, `fk`, `fk-display`, `enum`,
`mask`, `aba`, `colunas-layout`, `lista` e `por-perfil` aninhado. Essas definem o
esquema e a estrutura do template, que são únicos: uma coluna no banco, um atributo na
entidade, uma largura, uma aba.

#### Exibição no formulário (`exibe-formulario`)

`colunas-layout` **não existe por perfil**: a largura e o fim da linha são os mesmos
para todo mundo. O que varia é o campo aparecer ou não, e isso é
`exibe-formulario` — o par de `exibe-grid`, um para cada tela:

```yaml
    - nome: orgao_expedidor
      tipo: texto
      label: Órgão Expedidor
      colunas-layout: 4*         # comum: mesma largura para todos
      exibe-grid: true
      por-perfil:
        EDITOR:
          exibe-formulario: false     # o editor não vê o campo no formulário
        CONFERENTE:
          exibe-formulario: true
        ASSINANTE:
          exibe-formulario: true
```

- Default `true`: sem a propriedade, o campo aparece no formulário. É o oposto de
  `exibe-grid`, que nasce `false` — no cadastro o normal é mostrar, no grid o normal é
  não poluir.
- Vale no campo também, fora de `por-perfil`, para esconder de todos os perfis — e aí,
  pela exaustividade, não pode estar nos dois lugares.
- Não remove nada do banco, da entidade, do payload nem do `FormGroup`: some só da
  tela.
- `exibe-formulario: false` com `exibe-grid: true` é caso comum: dado que se consulta
  mas não se edita.

Isso mantém o formulário **um só desenho para todos os perfis**: a linha é gerada uma
vez, com a classe Bootstrap escrita no HTML e o `*` fechando a `row` sempre no mesmo
ponto. A única diferença por perfil é um `@if` em volta do campo, e os vizinhos fluem
normalmente na mesma linha quando ele some.

### Regras

- A chave de `por-perfil` é o nome do perfil depois de `:` em `projeto.perfis`. Perfil
  desconhecido torna o YAML `invalido`.
- Ocultar um campo **não** o remove do banco, da entidade, do payload nem do
  `FormGroup`: o valor que veio do backend volta intacto no `Gravar`, e é isso que
  impede um perfil de apagar dado que nem enxerga.
- `pesquisavel` entra no backend pela **união** dos perfis: campo pesquisável para
  qualquer perfil existe no `[NomeTabela]Filter`, no `/pesquisar` e no
  `[NomeTabela]Filtro`. Só o formulário de filtros da tela respeita o perfil.
- O **modo** de `pesquisavel` (`exato` ou `contem`) precisa ser o mesmo em todos os
  perfis que o declaram. `exato` para um e `contem` para outro é `invalido`; o que
  varia é pesquisar ou não (`false`).
- `por-perfil` é aceito nos campos comuns de `tabela.campos` e **rejeitado** em
  `tipo: lista` e dentro de `lista.campos`. Na lista, o que varia por perfil são as
  ações (`lista.acoes`): tirar o perfil de `consultar` já esconde a aba inteira, e o
  subformulário do subregistro é o mesmo para todos.

### Usuário com mais de um perfil

Perfis **somam permissões**. Quando o usuário tem mais de um perfil do CRUD, cada
atributo é a combinação dos perfis que ele possui:

| Atributo | Combinação |
|---|---|
| ações de `tabela.acoes` e `lista.acoes` | tem a ação se **qualquer** perfil dele tiver |
| exibição no cadastro | exibido se **qualquer** perfil dele exibir |
| `edicao` | edita o campo se **qualquer** perfil dele estiver na lista |
| `exibe-grid`, `exibe-titulo`, `pesquisavel` | verdadeiro em **qualquer** perfil dele |

Não existe ordem de precedência nem "perfil vencedor": o resultado independe da ordem
em que os perfis aparecem no YAML.

### Segurança

Três camadas, com alcances diferentes:

| Declaração | Onde vale |
|---|---|
| `tabela.acoes` | `@Secured` por método no service: barra a operação inteira |
| `edicao` | regra de escrita no service: o campo não é gravado por quem está fora da lista |
| `exibe-formulario`, `exibe-grid`, `exibe-titulo`, `pesquisavel`, `fk-tipo` | só apresentação; a API não olha para elas |

Ou seja: esconder um campo de um perfil **não** impede que ele o grave por fora da
tela. Para impedir, o perfil precisa ficar fora de `edicao`.

Regra mais fina que campo — "só o gerente altera pedido já fechado", que depende do
estado do registro — não cabe em nenhuma das três e pertence ao service
(`04-backend-service.md`).

### Campo obrigatório oculto

Campo `obrigatorio: true` com `exibe-formulario: false` em `por-perfil` só funciona
se o valor vier de `novaEntidade()` ou do backend — caso contrário aquele perfil nunca
consegue incluir um registro. Não é erro de contrato, mas deve ser relatado no
relatório de validação (`orquestrador.md`). Perfil sem a ação `incluir` não tem esse
problema: ele nunca cria registro.


## Propriedades de campo

| Propriedade | Default | Efeito |
|---|---|---|
| `nome` | - | Nome snake_case. |
| `tipo` | - | `texto`, `textoN`, `email`, `link`, `editor`, `inteiro`, `longo`, `booleano`, `data`, `data-hora`, `decimal`, `moeda`, `foto`, `arquivo`, `lista`. |
| `label` | Capitalização de `nome` | Texto de UI e mensagens. |
| `pk` | `false` | Primary key. |
| `autoincremento` | `false` | Coluna auto incrementável. |
| `obrigatorio` | `false` | `NOT NULL` e validações. Em `lista`, exige ao menos um registro. |
| `unique` | `false` | Constraint unique. |
| `indice` | `false` | Índice. |
| `fk` | - | Relacionamento e FK SQL. |
| `fk-display` | `label`, `descricao`, `nome` ou `id` existente | Campo exibido. |
| `fk-tipo` | `combo` | Controle do cadastro: `combo` (`ng-select`) ou `radio` (switches Bootstrap). |
| `enum` | - | Bloco do enumerado. Exclusivo de `tipo: texto`. Ver "Enumerado". |
| `mask` | - | Atributo `mask` do ngx-mask. |
| `pesquisavel` | `false` | Se diferente de `false`, entra no filtro oculto e no QueryDSL filter. |
| `aba` | `Dados cadastrais` | Aba do cadastro que recebe o campo. |
| `edicao` | todos os perfis | Perfis que gravam o campo. Ver "Edição do campo". |
| `exibe-titulo` | `false` | Repete `label: valor` abaixo do título do cadastro. |
| `colunas-layout` | - | Largura Bootstrap no cadastro. `N*` encerra linha. Nunca varia por perfil. |
| `exibe-formulario` | `true` | Exibição do campo no formulário do cadastro. |
| `exibe-grid` | `false` | Exibição no grid da pesquisa. Em `lista.campos`, coluna da tabela da lista. |
| `lista` | - | Bloco da coleção. Obrigatório e exclusivo de `tipo: lista`. |
| `por-perfil` | - | Sobreposição da configuração do campo por perfil. Ver "Configuração por perfil". |

`exibe-grid` é `false` por padrão: o grid da pesquisa mostra só o que for marcado
explicitamente. Grid enxuto é a regra — coluna demais é o que torna a pesquisa
ilegível no celular.

- **Ao menos um campo** de `tabela.campos` precisa ter `exibe-grid: true`: é dele que
  sai a coluna principal do grid (`08-frontend-pesquisar.md`). Nenhum campo marcado
  torna o YAML `invalido`.
- A PK é exibida sempre, na coluna fixa `ID`, independente de `exibe-grid`.
- Em `lista.campos` vale o mesmo default e a mesma exigência: ao menos um subcampo com
  `exibe-grid: true`, ou a tabela da lista não teria coluna nenhuma além do botão de
  excluir.

## Pesquisa

- `pesquisavel: exato`: igualdade.
- `pesquisavel: contem`: busca parcial case-insensitive, apenas para os tipos de
  texto — `texto`, `textoN`, `editor`, `email` e `link`.
- Campo pesquisável aparece no form oculto de filtros.
- Enum pesquisável aparece como combo.
- FK pesquisável aparece como `ng-select`, independente de `fk-tipo`.

## Campo de texto longo (`textoN`)

O tipo `textoN` representa texto livre de **N linhas**, onde `N` é o número no sufixo
do tipo: `texto3` → 3 linhas, `texto5` → 5 linhas.

- **Persistência:** coluna `TEXT`; em Java, `String`; em TypeScript, `string`.
- Aceita `obrigatorio`, `indice` e `pesquisavel: contem` (é texto).
- Renderização: `09-frontend-cadastro.md`.

## Campo de texto rico (`editor`)

`editor` é conteúdo formatado — negrito, listas, links, títulos — editado no **CKEditor
5** e guardado como HTML. É o tipo do preâmbulo de um edital, do corpo de um
comunicado, da descrição longa de um produto.

- **Persistência:** coluna `TEXT`; em Java, `String`; em TypeScript, `string`. O que é
  gravado é o HTML produzido pelo editor.
- Aceita `obrigatorio`, `edicao`, `exibe-formulario` e `pesquisavel: contem`.
- **Não** aceita `unique`, `indice`, `mask`, `enum` nem `exibe-titulo`: o resumo do
  cabeçalho é uma linha de `label: valor`, e HTML formatado não cabe nela. Declarar
  qualquer um deles torna o YAML `invalido`.
- `pesquisavel: contem` busca **no HTML armazenado**, marcação inclusive. Serve para
  achar um trecho de texto; não confunda com busca semântica.
- Em `exibe-grid`, a coluna mostra o texto **sem as tags**, truncado
  (`08-frontend-pesquisar.md`) — HTML dentro de célula de tabela quebra o layout do
  grid.
- Diferença para `textoN`: `textoN` é texto puro em um `<textarea>` de N linhas;
  `editor` é HTML com barra de ferramentas. Se o usuário só digita texto corrido, use
  `textoN`, que é mais leve e não traz dependência nova.
- Instalação do CKEditor, configuração e bloqueio de edição:
  `09-frontend-cadastro.md`. Mapeamento JPA: `03-backend-domain.md`.

## Campos de texto com formato (`email` e `link`)

`email` e `link` são texto com **formato validado** e **apresentação própria**: no
banco e nas entidades são idênticos a `texto`, e o que muda é a validação e como o
valor aparece na tela.

| Tipo | Conteúdo | Validação | Apresentação |
|---|---|---|---|
| `email` | endereço de e-mail | formato de e-mail nas duas pontas | link `mailto:` no grid e no resumo do título |
| `link` | URL absoluta (`http`/`https`) | formato de URL nas duas pontas | link que abre em nova aba |

- **Persistência:** coluna `VARCHAR`; em Java, `String`; em TypeScript, `string`.
- Aceitam `obrigatorio`, `unique`, `indice`, `exibe-titulo`, `edicao` e `pesquisavel`
  nos dois modos (são texto).
- **Não** aceitam `mask` nem `enum`: o formato já é o do tipo, e ngx-mask sobre
  e-mail ou URL só atrapalharia a digitação. Declarar `mask` torna o YAML `invalido`.
- Validação é **de formato, não de existência**: ninguém verifica se a caixa recebe
  e-mail ou se a URL responde. Se o domínio exigir isso, é regra de service.
- Mensagem de formato inválido: `[label_campo] inválido`, separada da mensagem de
  campo obrigatório.
- Validação e mapeamento JPA: `03-backend-domain.md`. Renderização do controle:
  `09-frontend-cadastro.md`. Renderização no grid: `08-frontend-pesquisar.md`.

## Campo monetário (`moeda`)

`moeda` representa **valor em dinheiro**, em reais. É numérico como `decimal`, mas com
escala fixa de 2 casas, tipo Java próprio e apresentação de moeda.

- **Persistência:** coluna `NUMERIC` com escala 2 (ex.: `NUMERIC(15,2)`); em Java,
  `BigDecimal`; em TypeScript, `number`.
- **Nunca** mapear como `double` ou `float`, em nenhuma das pontas: ponto flutuante
  binário não representa valores decimais com exatidão e vira erro de centavo em soma
  e comparação.
- Aceita `obrigatorio`, `unique`, `indice`, `exibe-titulo`, `edicao` e
  `pesquisavel: exato`. `pesquisavel: contem` é rejeitado — não é texto.
- **Não** aceita `mask` nem `enum`: a máscara de moeda já vem do tipo
  (`09-frontend-cadastro.md`). Declarar `mask` torna o YAML `invalido`.
- Aceita valor negativo: desconto, estorno e ajuste são parte do domínio.
- Formatação pt-BR com símbolo em toda exibição — grid, tabela de lista e resumo do
  título: `R$ 1.234,56`, alinhado à direita.

Quando usar cada um:

| Situação | Tipo |
|---|---|
| Preço, valor, saldo, desconto, total | `moeda` |
| Quantidade, peso, percentual, nota, medida | `decimal` |

`decimal` continua existindo para número fracionário que não é dinheiro: ele não força
escala 2, não ganha `R$` e não é alinhado à direita por padrão.

## Campos de upload (`foto` e `arquivo`)

Os tipos `foto` e `arquivo` representam um anexo e são mapeados como **FK para a
tabela `upload`** da dependência `br.unesp.fc.andrepenteado.core:upload` (lib APcore),
cuja entidade `Upload` tem PK `uuid` (UUID) e os campos `nome`, `descricao`,
`tipoMime`, `tamanho`, `base64`.

- **Persistência:** coluna `fk_[nomecampo]` do tipo `UUID` referenciando `upload(uuid)`.
- **`foto`:** imagem com miniatura. **`arquivo`:** anexo genérico, sem miniatura.
- Aceitam `obrigatorio`; **não** se aplicam `unique`, `indice`, `pesquisavel`,
  `mask` nem `enum`. Em `exibe-grid`, `foto` mostra miniatura pequena e `arquivo`
  mostra o nome do anexo.
- Mapeamento JPA: `03-backend-domain.md`. Renderização: `09-frontend-cadastro.md`.

## Enumerado (`enum`)

Campo cujo valor vem de um conjunto fechado e conhecido: situação, tipo, categoria.
O campo declara `tipo: texto` — no banco o valor é gravado como texto
(`@Enumerated(EnumType.STRING)`) — e o bloco `enum` com o nome do enumerado e os
valores:

```yaml
    - nome: situacao
      tipo: texto
      label: Situação
      obrigatorio: true
      pesquisavel: exato
      colunas-layout: 8*
      exibe-grid: true
      enum:
        nome: SituacaoPedido
        valores:
          ABERTO: Aberto
          FATURADO: Faturado
          CANCELADO: Cancelado
```

| Propriedade de `enum` | Default | Efeito |
|---|---|---|
| `nome` | PascalCase de `[tabela.nome]_[nome-campo]` | Nome do enum Java e TypeScript. |
| `valores` | - | Obrigatório e não vazio. Mapa `CONSTANTE: Label`. |

- A chave de `valores` é a constante, em `UPPER_SNAKE_CASE`, e é ela que vai para o
  banco. O valor é o label exibido em toda a UI — grid, filtro, radio, resumo do
  título. Chave fora de `UPPER_SNAKE_CASE`, ou que não seja identificador Java válido,
  torna o YAML `invalido`.
- Renomear uma chave depois de gerado quebra os registros existentes: a coluna guarda
  o texto da constante. Trocar só o label é seguro.
- `enum` é exclusivo de `tipo: texto`. Em qualquer outro tipo é `invalido` — inclusive
  em `inteiro`, para não abrir espaço para `EnumType.ORDINAL`, que faz o significado do
  registro depender da ordem de declaração.
- Aceita `obrigatorio`, `indice`, `pesquisavel: exato`, `exibe-titulo`,
  `edicao` e `colunas-layout`. `pesquisavel: contem` e `mask` são rejeitados.
- É aceito também em `lista.campos`, com as mesmas regras.
- O default de `nome` inclui a tabela justamente para dois CRUDs poderem ter um campo
  `situacao` sem colidir. Informe `enum.nome` sempre que o default ficar ruim.

### Enum compartilhado

Se `enum.nome` apontar para um enum que **já existe** no projeto, ele é reaproveitado:
nenhum arquivo é recriado nem sobrescrito. É assim que dois CRUDs compartilham a mesma
lista de valores.

- Os `valores` declarados precisam bater exatamente com os do enum existente —
  mesmas constantes, mesmos labels. Divergência é `conflito`, não sobrescrita
  silenciosa.
- Para um enum realmente transversal (`Uf`, `SimNao`, `Situacao`), dê a ele um nome
  sem a tabela e repita o bloco `enum` idêntico em cada CRUD que o usa.

### Nomes derivados

Para `enum.nome: SituacaoPedido`:

| Item | Derivação | Exemplo |
|---|---|---|
| Enum Java | `enum.nome` em `[pacote-base].domain.enums` | `SituacaoPedido` |
| Enum TypeScript | `enum.nome` | `SituacaoPedido` |
| Arquivo TypeScript | kebab-case de `enum.nome` | `situacao-pedido.ts` |
| Record de labels | `[NOME_ENUM]_LABELS` | `SITUACAO_PEDIDO_LABELS` |
| Check constraint | `ck_[nometabelasemseparador]_[nomecamposemseparador]` | `ck_pedido_situacao` |

Geração do enum Java: `03-backend-domain.md`. Do TypeScript:
`07-frontend-domain-service.md`. Renderização: `08-frontend-pesquisar.md` (combo no
filtro, label no grid) e `09-frontend-cadastro.md` (radio buttons).

## Relacionamento (`fk` e `fk-tipo`)

`fk` nomeia a tabela referenciada e gera a coluna FK no banco e o `@ManyToOne` na
entidade. `fk-display` define qual campo da entidade referenciada aparece na UI.

`fk-tipo` escolhe **apenas o controle do cadastro**; não afeta banco, entidade,
service, resource nem o filtro da pesquisa:

| `fk-tipo` | Controle gerado no cadastro |
|---|---|
| `combo` (default) | `<ng-select>` com a lista da entidade referenciada. |
| `radio` | Grupo de switches Bootstrap (`form-check form-switch`), um por registro. |

- `radio` é para conjuntos pequenos e estáveis (formas de pagamento, situações,
  tipos). Com muitos registros a tela fica impraticável — nesse caso usar `combo`.
- Valor inválido em `fk-tipo`, ou `fk-tipo` em campo sem `fk`, torna o YAML `invalido`.
- O filtro da tela de pesquisa usa `ng-select` mesmo quando `fk-tipo: radio`.

## Agrupamento por abas (`aba`)

`aba` é opcional e vale **somente para o frontend**: distribui os campos do
cadastro entre as abas do card do formulário. Não tem efeito em banco, entidade,
service ou resource.

- Ausente, o campo vai para a aba padrão **`Dados cadastrais`**.
- Campos com o mesmo texto em `aba` vão para a mesma aba; a comparação é literal
  (mesma grafia, acentuação e caixa).
- Ordem das abas: a aba padrão sempre primeiro, depois as demais na ordem da
  **primeira ocorrência** em `tabela.campos`, e por último as abas das listas
  (ver abaixo), na ordem de declaração.
- `aba` não substitui as seções internas do formulário (bloco com ícone, título,
  subtítulo e `hr`): uma aba pode conter várias seções.
- `aba` é rejeitada em campos `tipo: lista` (a lista já cria a própria aba) e em
  subcampos dentro de `lista.campos`.
- Renderização: `09-frontend-cadastro.md`.

## Edição do campo (`edicao`)

`edicao` lista **quais perfis gravam o campo**. Quem está fora da lista continua vendo
o valor no formulário, na posição do `colunas-layout`, mas sem conseguir alterá-lo.

```yaml
    - nome: nome
      tipo: texto
      label: Nome
      obrigatorio: true
      colunas-layout: 12*
      exibe-grid: true
      edicao: [ EDITOR ]          # os demais perfis veem somente leitura

    - nome: numero
      tipo: inteiro
      label: Número
      colunas-layout: 4
      exibe-grid: true
      edicao: []                  # ninguém edita: gerado pelo sistema
```

| Valor | Efeito |
|---|---|
| ausente | Todos os perfis de `projeto.perfis` gravam o campo |
| `[PERFIL, ...]` | Só os perfis da lista gravam; os demais veem somente leitura |
| `[]` | Ninguém grava. É o número gerado, o saldo calculado, a situação controlada por regra |

- Mesmo formato de `tabela.acoes`: a chave diz o que se pode fazer e o valor diz quem
  pode. Uma linha resolve o caso comum e o caso por perfil.
- **Não entra em `por-perfil`**, e por isso escapa da regra de exaustividade: a lista
  já é a declaração completa, não existe perfil omitido por descuido.
- Perfil citado em `edicao` que não esteja em `projeto.perfis` torna o YAML `invalido`.
- Perfil na lista que não tenha `incluir` nem `alterar` em `tabela.acoes` não grava
  nada de qualquer forma — não é erro, mas deve ser relatado no relatório de validação.
- **É barreira de escrita, não só de tela** (`04-backend-service.md`): no `alterar`, o
  valor recebido de quem está fora da lista é descartado e o do registro existente é
  reposto; no `incluir`, é ignorado. Sem endpoint nem payload separado por perfil.
- O campo continua trafegando no payload e no `FormGroup`, para voltar intacto no
  `Gravar`. Não tem efeito em banco nem em entidade.
- Combina com `obrigatorio: true`: as validações continuam valendo sobre o valor que
  veio do backend ou de `novaEntidade()`.
- `exibe-formulario: false` esconde o campo; nesse caso `edicao` não tem efeito
  visível e não é erro — mas continua valendo como barreira de escrita.
- Renderização por tipo de controle: `09-frontend-cadastro.md`.

## Resumo no título (`exibe-titulo`)

`exibe-titulo: true` repete o campo no **cabeçalho do cadastro**, no formato
`label: valor`, logo abaixo do título (`Novo [label]` / `Editar [label]`), com a
fonte de subtítulo.

- Vale **somente para o frontend** e **não** remove o campo do formulário: ele
  continua sendo renderizado conforme `colunas-layout`. Para exibir o valor apenas
  no cabeçalho, use `exibe-formulario: false` junto.
- É comum combinar com `edicao: []`: o dado identifica o registro e não é editável.
- Vários campos podem ter `exibe-titulo: true`; aparecem na ordem de
  `tabela.campos`, na mesma linha.
- Valor vazio ou nulo (modo inclusão, por exemplo) não é exibido.
- Aceito em `texto`, `textoN`, `email`, `link`, `inteiro`, `longo`, `decimal`,
  `moeda`, `booleano`, `data`, `data-hora`, `enum` e campos `fk` (exibe o
  `fk-display`). É rejeitado em `foto`, `arquivo` e `tipo: lista`. Em `email` e
  `link`, o valor sai clicável, como no grid; em `moeda`, sai formatado com `R$`.
- Renderização e formatação dos valores: `09-frontend-cadastro.md`.

## Listas (`tipo: lista`)

Representa uma coleção de registros filhos do CRUD. O campo declara `tipo: lista`
e o bloco `lista`:

| Propriedade de `lista` | Default | Efeito |
|---|---|---|
| `label` | `label` do campo, ou capitalização de `nome` | Título da aba e da tabela. |
| `tabela` | `[tabela.nome]_[nome-do-campo]` | Nome da tabela/entidade filha. |
| `persistencia` | `agregado` | `agregado` ou `independente`. Ver abaixo. |
| `formato` | `sem-modal` | `modal` ou `sem-modal`. Ver `09-frontend-cadastro.md`. |
| `acoes` | herda de `tabela.acoes` | Perfis que consultam, incluem e excluem itens da coleção. Ver abaixo. |
| `campos` | - | Obrigatório e não vazio. Subcampos da coleção. |

Informe `lista.tabela` sempre que o default ficar ruim: o gerador **não
singulariza** o nome do campo, então `itens` produziria `pedido_itens`.

### `persistencia`: quando o filho é gravado

Esta é a decisão de arquitetura da lista, e ela muda o que é gerado nas duas pontas.

**`persistencia: agregado` (default)** — o filho só existe junto com o pai. A coleção
viaja dentro do payload do CRUD e é gravada por cascata no `Gravar`. O filho **não**
ganha repository, service, resource nem service Angular.

> Ex.: itens de um pedido. Um item sem pedido não significa nada, e ninguém consulta
> "todos os itens" fora do contexto do pedido.

**`persistencia: independente`** — o filho é uma entidade de negócio por si. Ele tem
repository, service, resource e service Angular próprios, e é gravado **no momento em
que é adicionado**, não no `Gravar` do pai.

> Ex.: prontuários e exames de um paciente. Um atendimento registrado precisa ser
> gravado quando é escrito; perdê-lo porque o usuário não clicou em `Gravar` na aba de
> dados cadastrais seria um erro de domínio. Além disso o registro é consultado,
> auditado e exportado por si.

Como escolher:

- A pergunta decisiva é **"perder este registro por não ter clicado em Gravar é aceitável?"**.
  Se não for, é `independente`.
- Se o filho é consultado, exportado ou auditado fora da tela do pai, é `independente`.
- Tabela de vínculo N:M (subcampo `fk` e pouco mais) é praticamente sempre `agregado`:
  publicar um resource para uma tabela de ligação cria API sem dono.
- Na dúvida, fique com `agregado`. Ele gera menos superfície pública, e promover para
  `independente` depois é aditivo — o caminho contrário exige remover endpoints já
  publicados.

O default é `agregado` justamente por isso: `independente` é uma decisão deliberada
(o filho passa a ter API e segurança próprias) e decisão deliberada se declara.

`persistencia` é ortogonal à cardinalidade: 1:N e N:M aceitam as duas, e o mapeamento
JPA continua sendo `@OneToMany`/`@ManyToOne`, nunca `@ManyToMany`.

### Ações da lista (`lista.acoes`)

Mesma forma de `tabela.acoes`, aplicada à coleção: uma chave por operação, com os
perfis que a possuem.

```yaml
        acoes:
          consultar: [CAIXA, GERENTE]
          incluir: [CAIXA]
          excluir: [CAIXA]
```

| Ação | Efeito |
|---|---|
| `consultar` | A aba da lista aparece para o perfil. Sem ela, a aba não é renderizada. |
| `incluir` | Subformulário e botão `Adicionar`/`Novo` da aba. |
| `excluir` | Botão de excluir na primeira coluna da tabela da lista. |
| `alterar` | Só em `persistencia: independente`, e só no backend: protege o `PUT` do filho. A tabela da lista não tem edição de linha (`09-frontend-cadastro.md`). |

- `lista.acoes` é opcional. Ausente, **herda `tabela.acoes`**: quem pode alterar o
  registro pode mexer na coleção dele. Chave ausente dentro de `lista.acoes` também
  herda a chave correspondente de `tabela.acoes`.
- `incluir` da lista herda de `tabela.acoes.alterar`, não de `tabela.acoes.incluir`:
  adicionar item é alterar o registro pai.
- Em `persistencia: agregado` as ações valem **só no frontend** — não existe service
  nem endpoint do filho, e a coleção é gravada pelo `@Secured` do pai.
- Em `persistencia: independente` as ações viram `@Secured` no service do filho
  (`04-backend-service.md`), como em `tabela.acoes`.
- Perfil citado em `lista.acoes` que não esteja em `projeto.perfis` torna o YAML
  `invalido`.

### Cardinalidade derivada dos subcampos

A cardinalidade é deduzida de `lista.campos`, não declarada:

- **Nenhum subcampo com `fk`** → relação **1:N**. A lista é uma coleção de
  registros próprios do CRUD (ex.: ocorrências de um pedido).
- **Ao menos um subcampo com `fk`** → relação **N:M**. A tabela filha é a
  entidade intermediária entre o CRUD e a entidade referenciada (ex.: itens de um
  pedido apontando para produto).

**Auto-referência não conta.** Subcampo cuja `fk` aponta para a própria `lista.tabela`
é hierarquia ou vínculo entre irmãos (tópico superior, tópico corrigido), não ligação
com outra entidade: ele não torna a lista N:M. Uma lista cujos únicos `fk` são
auto-referências continua sendo 1:N.

Em **nenhum dos dois casos** o mapeamento JPA usa `@ManyToMany`: a tabela filha é
sempre uma entidade própria, ligada ao CRUD por `@OneToMany`. Ver
`03-backend-domain.md`.

### Nomes derivados

Para `tabela.nome: pedido` e um campo `nome: itens` com `lista.tabela: pedido_item`:

| Item | Derivação | Exemplo |
|---|---|---|
| Tabela filha | `lista.tabela` | `pedido_item` |
| Entidade filha | PascalCase da tabela filha | `PedidoItem` |
| Campo na entidade pai | camelCase de `nome` | `List<PedidoItem> itens` |
| Campo de volta ao pai | camelCase de `tabela.nome` | `Pedido pedido` |
| Coluna FK do pai | `fk_[tabela.nome]` | `fk_pedido` |
| PK da tabela filha | sempre `id`, `BIGINT` autoincremento | `id` |

Só em `persistencia: independente`, que publica API própria para o filho:

| Item | Derivação | Exemplo |
|---|---|---|
| Endpoint base do filho | plural da tabela filha, em kebab-case | `/prontuarios` |
| Constante de API | `API_[NOME_TABELA_FILHA_PLURAL]` | `API_PRONTUARIOS` |
| Listagem por pai | `GET /[filhos]/por-[tabela.nome]/{id}` | `/prontuarios/por-paciente/7` |

O caminho de listagem é `por-[pai]/{id}` e não `/{idPai}` para não colidir com o
`GET /[filhos]/{id}`, que busca o filho pela própria chave.

### Propriedades aceitas em `lista.campos`

Aceitas: `nome`, `tipo`, `label`, `obrigatorio`, `indice`, `fk`, `fk-display`,
`fk-tipo`, `enum`, `mask`, `colunas-layout`, `exibe-formulario`, `exibe-grid`.

`exibe-formulario: false` tira o subcampo do subformulário sem tirá-lo da tabela nem
do banco: é como se declara a coluna de ordenação, a FK de hierarquia e tudo o mais que
o service preenche e o usuário não digita.

Dentro de uma lista, `colunas-layout` posiciona o subcampo no **formulário do
subregistro** e `exibe-grid` decide se o subcampo vira **coluna da tabela da
lista** — nunca coluna do grid da pesquisa do CRUD pai.

Os tipos `foto` e `arquivo` **são aceitos** em subcampos e seguem as mesmas regras
de upload da tabela principal (coluna `UUID` para `upload(uuid)`, `UploadService` no
frontend). Na tabela da lista, `foto` mostra miniatura e `arquivo` mostra o nome do
anexo, com botão de download quando fizer sentido.

Rejeitadas (tornam o YAML `invalido`): `pk`, `autoincremento`, `unique`,
`pesquisavel`, `aba`, `edicao`, `exibe-titulo`, `por-perfil` e `lista` aninhada.
Coleção dentro de coleção é um CRUD próprio, não uma lista. `edicao` não faz sentido em
um subformulário de inclusão (o campo ficaria impossível de preencher), `exibe-titulo`
pertence ao cabeçalho do CRUD pai, não a um subregistro, e `por-perfil` não se aplica
porque o subformulário é o mesmo para todos os perfis — quem varia por perfil na lista
são as ações (`lista.acoes`).

### Restrições do campo `tipo: lista`

- Aceita apenas `nome`, `tipo`, `obrigatorio`, `label` e o bloco `lista`.
- `unique`, `indice`, `mask`, `enum`, `fk`, `fk-tipo`, `pesquisavel`,
  `colunas-layout`, `exibe-formulario`, `exibe-grid`, `aba`, `edicao`,
  `exibe-titulo` e `por-perfil` são rejeitados nesse campo. Configuração por perfil de uma lista se
  faz em `lista.acoes`: perfil fora de `consultar` não vê a aba.
- Uma lista nunca aparece no grid da pesquisa nem nos filtros.
- `obrigatorio: true` exige ao menos um registro na coleção.

## Manifesto

Após sucesso, criar `.cruds/[nome-crud].generated.yaml`:

```yaml
crud: pedido
metadados: .cruds/pedido.yaml
checksumNormalizado: "sha256:..."
executadoEm: "YYYY-MM-DDTHH:mm:ss-03:00"
status: criado
perfis: [CAIXA, GERENTE]
arquivos:
  - backend/src/main/java/.../Pedido.java
  - backend/src/main/java/.../PedidoItem.java
```

## Critérios de aceite

- YAML inválido ou conflitante é rejeitado antes de qualquer alteração.
- YAML sem `projeto.perfis`, ou com item fora do formato `ConstanteJava:NOME_PERFIL`,
  é rejeitado.
- Perfil citado em `tabela.acoes`, `lista.acoes` ou `por-perfil` que não esteja em
  `projeto.perfis` é rejeitado.
- Perfil sem a ação `consultar` é rejeitado.
- Ação fora de `consultar`/`incluir`/`alterar`/`excluir` em `tabela.acoes` ou
  `lista.acoes` é rejeitada.
- Regra sem `nome` ou sem `prompt`, ou com `nome` repetido, é rejeitada.
- Ação customizada sem `nome` ou sem `prompt`, com `nome` colidindo com método padrão
  ou repetido, ou com `tela` fora de `cadastro`/`pesquisa`/`ambos`, é rejeitada.
- Ação customizada com `aba` junto de `tela: pesquisa`, ou com `aba` que não
  corresponde a nenhuma aba do cadastro, é rejeitada.
- Propriedade estrutural dentro de `por-perfil` é rejeitada, `colunas-layout`
  incluído: a largura do campo é a mesma para todos os perfis.
- Propriedade declarada em `por-perfil` sem estar em todos os perfis de
  `projeto.perfis` é rejeitada.
- Propriedade declarada ao mesmo tempo no campo e em `por-perfil` é rejeitada.
- `por-perfil` em campo `tipo: lista` ou dentro de `lista.campos` é rejeitado.
- `pesquisavel` com modos diferentes (`exato` na base e `contem` em `por-perfil`, ou
  vice-versa) no mesmo campo é rejeitado.
- `pesquisavel: contem` em campo que não seja `texto`, `textoN`, `editor`, `email` ou
  `link`
  é rejeitado.
- `mask` ou `enum` em campo `email`, `link` ou `moeda` é rejeitado.
- `enum` em campo que não seja `tipo: texto` é rejeitado.
- `unique`, `indice`, `mask`, `enum` ou `exibe-titulo` em campo `editor` é rejeitado.
- Bloco `enum` sem `valores`, com `valores` vazio, ou com chave fora de
  `UPPER_SNAKE_CASE`, é rejeitado.
- `enum.nome` de um enum já existente no projeto com `valores` divergentes é
  rejeitado.
- `moeda` mapeado como `double`/`float`, ou sem escala 2 na coluna, é rejeitado.
- `fk-tipo` em campo sem `fk`, ou com valor fora de `combo`/`radio`, é rejeitado.
- `aba` em campo `tipo: lista` ou dentro de `lista.campos` é rejeitada.
- `edicao` e `exibe-titulo` em campo `tipo: lista` ou dentro de `lista.campos` são
  rejeitados.
- `edicao` dentro de `por-perfil`, ou citando perfil fora de `projeto.perfis`, é
  rejeitado.
- `exibe-titulo` em campo `foto` ou `arquivo` é rejeitado.
- Valor fora de `true`/`false` em `exibe-formulario` ou `exibe-titulo` é rejeitado.
- `tipo: lista` sem bloco `lista`, ou com `lista.campos` vazio, é rejeitado.
- `tabela.campos` sem nenhum `exibe-grid: true` é rejeitado, e o mesmo vale para
  `lista.campos`.
- Subcampo de lista com propriedade ou tipo não aceito é rejeitado.
- `lista.persistencia` fora de `agregado`/`independente` é rejeitado.
- Checksum ignora comentários, linhas em branco e indentação, preservando ordem das listas.

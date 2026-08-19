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
    - VendaApplication.PERFIL_CAIXA:CAIXA

tabela:
  nome: pedido
  label: Pedido
  plural: Pedidos
  campos:
    - nome: id
      tipo: long
      pk: true
      autoincremento: true
      exibe-grid: true

    # Gerado pelo sistema: aparece no form sem permitir edição e é repetido
    # no topo do cadastro, abaixo do título.
    - nome: numero
      tipo: string
      label: Número
      obrigatorio: true
      unique: true
      indice: true
      pesquisavel: exato
      somente-leitura: true
      exibe-titulo: true
      colunas-layout: 4
      exibe-grid: true

    # FK padrão: ng-select (equivale a fk-tipo: combo)
    - nome: cliente
      tipo: long
      label: Cliente
      fk: cliente
      fk-display: nome
      obrigatorio: true
      indice: true
      pesquisavel: exato
      exibe-titulo: true
      colunas-layout: 8*
      exibe-grid: true

    # FK como switches do Bootstrap: poucas opções e estáveis
    - nome: forma_pagamento
      tipo: long
      label: Forma de Pagamento
      fk: forma_pagamento
      fk-display: descricao
      fk-tipo: radio
      obrigatorio: true
      colunas-layout: 12*
      exibe-grid: true

    # Sem `aba`: vai para a aba padrão "Dados cadastrais"
    - nome: observacao
      tipo: texto3
      label: Observação
      colunas-layout: 12*
      exibe-grid: false

    # Campos agrupados em uma aba própria
    - nome: cep_entrega
      tipo: string
      label: CEP de Entrega
      mask: "00000-000"
      aba: Entrega
      colunas-layout: 4
      exibe-grid: false

    - nome: endereco_entrega
      tipo: string
      label: Endereço de Entrega
      aba: Entrega
      colunas-layout: 8*
      exibe-grid: false

    - nome: previsao_entrega
      tipo: date
      label: Previsão de Entrega
      aba: Entrega
      colunas-layout: 4*
      exibe-grid: false

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
        campos:
          - nome: produto
            tipo: long
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
            tipo: decimal
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
            tipo: datetime
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

## Propriedades de campo

| Propriedade | Default | Efeito |
|---|---|---|
| `nome` | - | Nome snake_case. |
| `tipo` | - | `string`, `textoN`, `integer`, `long`, `boolean`, `date`, `datetime`, `decimal`, `foto`, `arquivo`, `lista`. |
| `label` | Capitalização de `nome` | Texto de UI e mensagens. |
| `pk` | `false` | Primary key. |
| `autoincremento` | `false` | Coluna auto incrementável. |
| `obrigatorio` | `false` | `NOT NULL` e validações. Em `lista`, exige ao menos um registro. |
| `unique` | `false` | Constraint unique. |
| `indice` | `false` | Índice. |
| `fk` | - | Relacionamento e FK SQL. |
| `fk-display` | `label`, `descricao`, `nome` ou `id` existente | Campo exibido. |
| `fk-tipo` | `combo` | Controle do cadastro: `combo` (`ng-select`) ou `radio` (switches Bootstrap). |
| `enum` | - | Enum Java/TypeScript, check constraint e radio/combos. |
| `mask` | - | Atributo `mask` do ngx-mask. |
| `pesquisavel` | `false` | Se diferente de `false`, entra no filtro oculto e no QueryDSL filter. |
| `aba` | `Dados cadastrais` | Aba do cadastro que recebe o campo. |
| `somente-leitura` | `false` | Campo aparece no cadastro sem permitir edição. |
| `exibe-titulo` | `false` | Repete `label: valor` abaixo do título do cadastro. |
| `colunas-layout` | - | Largura Bootstrap no cadastro. `0` oculta; `N*` encerra linha. |
| `exibe-grid` | `true` | Exibição na pesquisa. |
| `lista` | - | Bloco da coleção. Obrigatório e exclusivo de `tipo: lista`. |

## Pesquisa

- `pesquisavel: exato`: igualdade.
- `pesquisavel: contem`: busca parcial case-insensitive, apenas para `string`.
- Campo pesquisável aparece no form oculto de filtros.
- Enum pesquisável aparece como combo.
- FK pesquisável aparece como `ng-select`, independente de `fk-tipo`.

## Campo de texto longo (`textoN`)

O tipo `textoN` representa texto livre de **N linhas**, onde `N` é o número no sufixo
do tipo: `texto3` → 3 linhas, `texto5` → 5 linhas.

- **Persistência:** coluna `TEXT`; em Java, `String`; em TypeScript, `string`.
- Aceita `obrigatorio`, `indice` e `pesquisavel: contem` (é texto).
- Renderização: `09-frontend-cadastro.md`.

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

## Campo somente leitura (`somente-leitura`)

`somente-leitura: true` mantém o campo no formulário do cadastro, na posição do
`colunas-layout`, mas **sem permitir edição**: o usuário lê o valor e não consegue
alterá-lo.

- Vale **somente para o frontend**. Não tem efeito em banco, entidade, service nem
  resource — o valor continua trafegando no payload e o campo continua no
  `FormGroup`, para ser gravado junto com o registro.
- **Não é controle de segurança.** A API aceita o campo normalmente; se a regra é
  "ninguém pode mudar isso", ela pertence ao service (`04-backend-service.md`).
- Combina com `obrigatorio: true`: as validações continuam valendo sobre o valor
  que veio do backend ou de `novaEntidade()`.
- Uso típico: número gerado pelo sistema, saldo calculado, situação controlada por
  regra de negócio, chave importada de outro sistema.
- `colunas-layout: 0` esconde o campo; nesse caso `somente-leitura` não tem efeito
  visível e não é erro.
- Renderização por tipo de controle: `09-frontend-cadastro.md`.

## Resumo no título (`exibe-titulo`)

`exibe-titulo: true` repete o campo no **cabeçalho do cadastro**, no formato
`label: valor`, logo abaixo do título (`Novo [label]` / `Editar [label]`), com a
fonte de subtítulo.

- Vale **somente para o frontend** e **não** remove o campo do formulário: ele
  continua sendo renderizado conforme `colunas-layout`. Para exibir o valor apenas
  no cabeçalho, use `colunas-layout: 0` junto.
- É comum combinar com `somente-leitura: true`: o dado identifica o registro e não
  é editável.
- Vários campos podem ter `exibe-titulo: true`; aparecem na ordem de
  `tabela.campos`, na mesma linha.
- Valor vazio ou nulo (modo inclusão, por exemplo) não é exibido.
- Aceito em `string`, `textoN`, `integer`, `long`, `decimal`, `boolean`, `date`,
  `datetime`, `enum` e campos `fk` (exibe o `fk-display`). É rejeitado em `foto`,
  `arquivo` e `tipo: lista`.
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

### Cardinalidade derivada dos subcampos

A cardinalidade é deduzida de `lista.campos`, não declarada:

- **Nenhum subcampo com `fk`** → relação **1:N**. A lista é uma coleção de
  registros próprios do CRUD (ex.: ocorrências de um pedido).
- **Ao menos um subcampo com `fk`** → relação **N:M**. A tabela filha é a
  entidade intermediária entre o CRUD e a entidade referenciada (ex.: itens de um
  pedido apontando para produto).

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
`fk-tipo`, `enum`, `mask`, `colunas-layout`, `exibe-grid`.

Dentro de uma lista, `colunas-layout` posiciona o subcampo no **formulário do
subregistro** e `exibe-grid` decide se o subcampo vira **coluna da tabela da
lista** — nunca coluna do grid da pesquisa do CRUD pai.

Os tipos `foto` e `arquivo` **são aceitos** em subcampos e seguem as mesmas regras
de upload da tabela principal (coluna `UUID` para `upload(uuid)`, `UploadService` no
frontend). Na tabela da lista, `foto` mostra miniatura e `arquivo` mostra o nome do
anexo, com botão de download quando fizer sentido.

Rejeitadas (tornam o YAML `invalido`): `pk`, `autoincremento`, `unique`,
`pesquisavel`, `aba`, `somente-leitura`, `exibe-titulo` e `lista` aninhada. Coleção
dentro de coleção é um CRUD próprio, não uma lista. `somente-leitura` não faz
sentido em um subformulário de inclusão (o campo ficaria impossível de preencher) e
`exibe-titulo` pertence ao cabeçalho do CRUD pai, não a um subregistro.

### Restrições do campo `tipo: lista`

- Aceita apenas `nome`, `tipo`, `obrigatorio`, `label` e o bloco `lista`.
- `unique`, `indice`, `mask`, `enum`, `fk`, `fk-tipo`, `pesquisavel`,
  `colunas-layout`, `exibe-grid`, `aba`, `somente-leitura` e `exibe-titulo` são
  rejeitados nesse campo.
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
arquivos:
  - backend/src/main/java/.../Pedido.java
  - backend/src/main/java/.../PedidoItem.java
```

## Critérios de aceite

- YAML inválido ou conflitante é rejeitado antes de qualquer alteração.
- `pesquisavel: contem` em campo não `string` é rejeitado.
- `fk-tipo` em campo sem `fk`, ou com valor fora de `combo`/`radio`, é rejeitado.
- `aba` em campo `tipo: lista` ou dentro de `lista.campos` é rejeitada.
- `somente-leitura` e `exibe-titulo` em campo `tipo: lista` ou dentro de
  `lista.campos` são rejeitados.
- `exibe-titulo` em campo `foto` ou `arquivo` é rejeitado.
- Valor fora de `true`/`false` em `somente-leitura` ou `exibe-titulo` é rejeitado.
- `tipo: lista` sem bloco `lista`, ou com `lista.campos` vazio, é rejeitado.
- Subcampo de lista com propriedade ou tipo não aceito é rejeitado.
- `lista.persistencia` fora de `agregado`/`independente` é rejeitado.
- Checksum ignora comentários, linhas em branco e indentação, preservando ordem das listas.

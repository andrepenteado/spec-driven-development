# 01 - YAML Contrato

## Objetivo

Definir entrada de metadados para criação do CRUD.

## Local

YAMLs de entrada ficam em `.cruds/*.yaml`.

## Exemplo

```yaml
crud:
  nome: marca

autor: Nome do Autor

projeto:
  nome: venda
  perfis:
    - VendaApplication.PERFIL_CAIXA:CAIXA

tabela:
  nome: marca
  label: Marca
  plural: Marcas
  campos:
    - nome: id
      tipo: long
      pk: true
      autoincremento: true
      exibe-grid: true

    - nome: descricao
      tipo: string
      label: Descrição
      obrigatorio: true
      unique: true
      indice: true
      pesquisavel: contem
      colunas-layout: 8*
      exibe-grid: true
```

## Campos obrigatórios

`crud.nome`, `autor`, `projeto.nome`, `projeto.perfis`, `tabela.nome`, `tabela.label`, `tabela.plural`, `tabela.campos`.

## Propriedades de campo

| Propriedade | Default | Efeito |
|---|---|---|
| `nome` | - | Nome snake_case. |
| `tipo` | - | `string`, `textoN`, `integer`, `long`, `boolean`, `date`, `datetime`, `decimal`, `foto`, `arquivo`. |
| `label` | Capitalização de `nome` | Texto de UI e mensagens. |
| `pk` | `false` | Primary key. |
| `autoincremento` | `false` | Coluna auto incrementável. |
| `obrigatorio` | `false` | `NOT NULL` e validações. |
| `unique` | `false` | Constraint unique. |
| `indice` | `false` | Índice. |
| `fk` | - | Relacionamento, FK SQL e `ng-select`. |
| `fk-display` | `label`, `descricao`, `nome` ou `id` existente | Campo exibido. |
| `enum` | - | Enum Java/TypeScript, check constraint e radio/combos. |
| `mask` | - | Atributo `mask` do ngx-mask. |
| `pesquisavel` | `false` | Se diferente de `false`, entra no filtro oculto e no QueryDSL filter. |
| `colunas-layout` | - | Largura Bootstrap no cadastro. `0` oculta; `N*` encerra linha. |
| `exibe-grid` | `true` | Exibição na pesquisa. |

## Pesquisa

- `pesquisavel: exato`: igualdade.
- `pesquisavel: contem`: busca parcial case-insensitive, apenas para `string`.
- Campo pesquisável aparece no form oculto de filtros.
- Enum pesquisável aparece como combo.
- FK pesquisável aparece como `ng-select`.

## Campo de texto longo (`textoN`)

O tipo `textoN` gera um `<textarea>` com **N linhas**, onde `N` é o número no
sufixo do tipo: `texto3` → textarea de 3 linhas, `texto5` → 5 linhas, etc.

- **Persistência:** coluna `TEXT`; em Java, `String`; em TypeScript, `string`.
- Aceita `obrigatorio`, `indice` e `pesquisavel: contem` (é texto). Ocupa a largura
  definida por `colunas-layout` (campos longos costumam usar a linha inteira).

## Campos de upload (`foto` e `arquivo`)

Os tipos `foto` e `arquivo` representam um anexo e são mapeados como **FK para a
tabela `upload`** da dependência `br.unesp.fc.andrepenteado.core:upload` (lib APcore),
cuja entidade `Upload` tem PK `uuid` (UUID) e os campos `nome`, `descricao`,
`tipoMime`, `tamanho`, `base64`.

- **Persistência:** `@ManyToOne` para `br.unesp.fc.andrepenteado.core.upload.Upload`;
  coluna FK `fk_[nomecampo]` do tipo `UUID`. No changelog Liquibase o tipo é `UUID`
  referenciando `upload(uuid)`.
- **Frontend:** usa o `UploadService` de `@andre.penteado/ngx-apcore`
  (`buscar`, `incluir`, `alterar`) e o DTO `Upload`.
- **`foto`:** exibe a miniatura (thumbnail) da imagem no formulário; clicar na
  miniatura abre o diálogo para **incluir/editar** a imagem. Preview via
  `data:[tipoMime];base64,[base64]`.
- **`arquivo`:** campo de **upload simples** (seletor de arquivo mostrando o nome),
  sem miniatura/preview.
- Aceitam `obrigatorio`; **não** se aplicam `unique`, `indice`, `pesquisavel`,
  `mask` nem `enum`. Em `exibe-grid`, `foto` mostra miniatura pequena e `arquivo`
  mostra o nome do anexo.

## Manifesto

Após sucesso, criar `.cruds/[nome-crud].generated.yaml`:

```yaml
crud: marca
metadados: .cruds/marca.yaml
checksumNormalizado: "sha256:..."
executadoEm: "YYYY-MM-DDTHH:mm:ss-03:00"
status: criado
arquivos:
  - backend/src/main/java/.../Marca.java
```

## Critérios de aceite

- YAML inválido ou conflitante é rejeitado antes de qualquer alteração.
- `pesquisavel: contem` em campo não `string` é rejeitado.
- Checksum ignora comentários, linhas em branco e indentação, preservando ordem das listas.

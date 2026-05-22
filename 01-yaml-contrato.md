# 01 - YAML Contrato

## Objetivo

Definir entrada de metadados para criação do CRUD.

## Local

YAMLs de entrada ficam em `.specs/cruds/*.yaml`.

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
| `tipo` | - | `string`, `integer`, `long`, `boolean`, `date`, `datetime`, `decimal`. |
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

## Manifesto

Após sucesso, criar `.specs/cruds/[nome-crud].generated.yaml`:

```yaml
crud: marca
metadados: .specs/cruds/marca.yaml
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

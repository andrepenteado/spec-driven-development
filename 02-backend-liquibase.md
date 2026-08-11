# 02 - Backend Liquibase

## Objetivo

Criar ou atualizar changelog Liquibase da tabela do CRUD.

## Entradas

- YAML validado.
- Versão do `backend/pom.xml`.

## Saídas

- `backend/src/main/resources/db/changelog/versions/[major.minor].xml`

## Regras

- Ler `<version>` de `backend/pom.xml` e usar `major.minor`.
- Se o changelog da versão existir, adicionar `<changeSet>`.
- `id`: data atual `YYYY-MM-DD`.
- `author`: `autor`.
- Tipos SQL: `string=VARCHAR`, `textoN=TEXT`, `integer=INTEGER`, `long=BIGINT`, `boolean=BOOLEAN`, `date=DATE`, `datetime=TIMESTAMP`, `decimal=NUMERIC`, `foto=UUID`, `arquivo=UUID`.
- `foto` e `arquivo`: coluna `fk_[nomecampo]` do tipo `UUID` com FK para `upload(uuid)` (tabela da lib APcore).
- PK: `pk_[nome_tabela]`.
- Unique: `un_[nometabelasemseparador]_[nomecamposemseparador]`.
- Índice: `idx_[nometabelasemseparador]_[nomecamposemseparador]`.
- FK: nomear conforme padrão do projeto; se não houver, usar nome legível derivado.
- Sempre adicionar auditoria.
- `criado_por` e `criado_em` são `NOT NULL`; alteração permite `NULL`.

## Tabelas de lista (`tipo: lista`)

Cada campo `tipo: lista` gera **uma tabela filha** com nome `lista.tabela`
(default e demais derivações em `01-yaml-contrato.md`).

- Criar a tabela filha **no mesmo changeSet**, depois da tabela do CRUD: a FK
  para o pai depende dela.
- Colunas: `id` `BIGINT` autoincremento como PK (`pk_[nome_tabela_filha]`),
  `fk_[tabela.nome]` `BIGINT` `NOT NULL` com FK para a tabela do CRUD, e uma
  coluna por subcampo em `lista.campos`, com os mesmos tipos SQL da tabela acima.
- Índice na FK do pai: `idx_[nometabelafilhasemseparador]_[nomecolunafksemseparador]`.
  A leitura da coleção sempre filtra por ele.
- Subcampo com `fk` gera coluna `fk_[nometabelareferenciadasemseparador]` e a
  constraint de FK correspondente (é o caso N:M do contrato).
- Subcampo `foto`/`arquivo` gera coluna `fk_[nomesubcampo]` do tipo `UUID`
  referenciando `upload(uuid)`, igual à tabela principal.
- Auditoria depende de `lista.persistencia`:
  - `agregado`: **sem** colunas de auditoria. A auditoria pertence ao registro do
    CRUD, que é quem grava a coleção inteira.
  - `independente`: **com** as quatro colunas de auditoria. O filho é gravado por
    conta própria, então precisa registrar quem o criou e quando.
- **Não** criar unique composta `(fk_pai, fk_filho)` automaticamente. Repetição do
  mesmo vínculo pode ser legítima (ex.: dois itens do mesmo produto); se o domínio
  proibir, declare a constraint manualmente no changelog.
- Em `agregado`, a exclusão do registro pai remove os filhos por `orphanRemoval` no
  JPA (`03-backend-domain.md`); ainda assim, declarar a FK com `onDelete="CASCADE"`
  quando o projeto já usar esse padrão.
- Em `independente` não há `orphanRemoval`: declarar `onDelete="CASCADE"` na FK, ou
  o pai não poderá ser excluído enquanto houver filhos. Se a regra de negócio for
  justamente impedir essa exclusão, deixar `RESTRICT` e documentar a escolha.

## Critérios de aceite

- Tabela contém todos os campos do YAML e auditoria.
- Constraints e índices seguem os nomes derivados.
- Changelog fica na versão correta.
- Cada `tipo: lista` tem tabela filha própria, com PK, FK indexada para o pai e
  sem colunas de auditoria.

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
- Tipos SQL: `string=VARCHAR`, `integer=INTEGER`, `long=BIGINT`, `boolean=BOOLEAN`, `date=DATE`, `datetime=TIMESTAMP`, `decimal=NUMERIC`.
- PK: `pk_[nome_tabela]`.
- Unique: `un_[nometabelasemseparador]_[nomecamposemseparador]`.
- Índice: `idx_[nometabelasemseparador]_[nomecamposemseparador]`.
- FK: nomear conforme padrão do projeto; se não houver, usar nome legível derivado.
- Sempre adicionar auditoria.
- `criado_por` e `criado_em` são `NOT NULL`; alteração permite `NULL`.

## Critérios de aceite

- Tabela contém todos os campos do YAML e auditoria.
- Constraints e índices seguem os nomes derivados.
- Changelog fica na versão correta.

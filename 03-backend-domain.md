# 03 - Backend Domain

## Objetivo

Criar enums, entidade, repository e filter QueryDSL.

## Saídas

- `[pacote-base].domain.enums.[NomeEnum]`
- `[pacote-base].domain.entities.[NomeTabela]`
- `[pacote-base].domain.repositories.[NomeTabela]Repository`
- `[pacote-base].domain.filter.[NomeTabela]Filter`, se houver pesquisa

## Enum Java

- Criar enum para cada campo `enum`.
- Incluir propriedade `descricao` e getter.

## Entidade JPA

- Classe em `[pacote-base].domain.entities`.
- `id` deve ser `Long`.
- Não usar `@Table`, salvo padrão obrigatório do projeto.
- `unique`: usar `@Column`.
- `obrigatorio`: `@NotBlank` para string; `@NotNull` para demais.
- Mensagem: `[label_campo] é um campo obrigatório`.
- `fk`: `@ManyToOne` e `@JoinColumn(name = "fk_[nometabelareferenciadasemseparador]")`.
- `enum`: `@Enumerated(EnumType.STRING)`.
- Incluir auditoria, `Serializable`, `serialVersionUID`, `equals/hashCode` por `id` e `toString()`.

## Repository

- Interface em `[pacote-base].domain.repositories`.
- Estender `JpaRepository<[NomeTabela], Long>`.
- Se houver campo pesquisável, adicionar suporte QueryDSL conforme padrão do projeto.
- Sem padrão específico, estender também `QuerydslPredicateExecutor<[NomeTabela]>`.
- Usar `@Query` apenas quando método derivado/QueryDSL não atender.

## Filter QueryDSL

Criar apenas se houver `pesquisavel != false`.

- Classe em `[pacote-base].domain.filter.[NomeTabela]Filter`.
- Propriedades para todos os campos pesquisáveis.
- `enum` usa tipo enum Java.
- `fk` recebe id da entidade relacionada como `Long`.
- Incluir getters/setters.
- Criar `toPredicate()` retornando `Predicate` ou `BooleanBuilder`, conforme padrão.
- Montar query com QueryDSL e `Q[NomeTabela]`.
- Ignorar nulos, strings em branco e enums não selecionados.
- Combinar filtros com `AND`.
- `exato`: igualdade.
- `contem`: parcial case-insensitive, apenas para string.
- Não usar reflexão.
- Se QueryDSL não estiver configurado, adicionar dependências/configuração compatíveis com Java 25, Spring Boot 4 e Jakarta.

## Critérios de aceite

- Domain compila com os nomes derivados.
- Filter contém todos os campos pesquisáveis.
- Não existe pesquisa antiga por `campo`/`valor`.
- Repository consegue executar `findAll(filtro.toPredicate())` ou padrão equivalente do projeto.

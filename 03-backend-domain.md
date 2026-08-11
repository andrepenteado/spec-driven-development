# 03 - Backend Domain

## Objetivo

Criar enums, entidade, repository e filter QueryDSL.

## Saídas

- `[pacote-base].domain.enums.[NomeEnum]`
- `[pacote-base].domain.entities.[NomeTabela]`
- `[pacote-base].domain.entities.[NomeTabelaFilha]`, uma por campo `tipo: lista`
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
- `textoN`: `String` com `@Column(columnDefinition = "TEXT")`.
- `foto`/`arquivo`: mapear como a **UUID** do anexo — campo `java.util.UUID` com `@Column(name = "fk_[nomecampo]")` e FK para `upload(uuid)`. Não usar `@ManyToOne` para `Upload`, pois a lib APcore não fornece o metamodelo `QUpload` exigido pelo QueryDSL ao varrer a entidade.
- `enum`: `@Enumerated(EnumType.STRING)`.
- Incluir auditoria, `Serializable`, `serialVersionUID` e `toString()`.
- `equals`/`hashCode` por `id`: usar `@EqualsAndHashCode(of = "id")` do Lombok (a entidade já usa `@Data`/`@Getter`/`@Setter` do Lombok, salvo padrão diferente do projeto) em vez de escrever os métodos manualmente. Para chave composta (ex.: mais de um campo `unique` juntos), listar os campos em `of = {"campo1", "campo2"}`.

## Entidades de lista (`tipo: lista`)

Cada campo `tipo: lista` gera **uma entidade filha** própria, em
`[pacote-base].domain.entities`, com os mesmos padrões da entidade principal
(Lombok, `Serializable`, `serialVersionUID`, `toString()`,
`@EqualsAndHashCode(of = "id")`, Javadoc).

**Regra de mapeamento — vale para 1:N, N:M e para as duas persistências:** nunca
usar `@ManyToMany`. Mesmo quando a lista contém subcampo `fk` (conceitualmente
N:M), a tabela intermediária é uma entidade própria, ligada por
`@OneToMany`/`@ManyToOne`.

Comum às duas persistências, na entidade filha:

- `id` `Long` com autoincremento, como na entidade principal.
- Campo de volta ao pai com `@ManyToOne` + `@JoinColumn(name = "fk_[tabela.nome]")`.
- Um campo por subcampo de `lista.campos`, seguindo as mesmas regras de tipo,
  `obrigatorio`, `indice`, `enum`, `fk` e upload da entidade principal — subcampo
  com `fk` vira `@ManyToOne` + `@JoinColumn`; subcampo `foto`/`arquivo` vira
  `java.util.UUID` com `@Column(name = "fk_[nomesubcampo]")`.

### `persistencia: agregado`

Na entidade do CRUD (lado pai):

```java
@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
@Valid
private List<PedidoItem> itens = new ArrayList<>();
```

- `mappedBy` é o campo de volta ao pai na entidade filha.
- `cascade = ALL` + `orphanRemoval = true`: a coleção é gravada e removida junto
  com o registro do CRUD, que é a raiz do agregado.
- `@Valid` propaga as validações dos subcampos ao gravar o pai.
- Inicializar com `new ArrayList<>()` para a coleção nunca chegar nula ao service.
- `obrigatorio: true` na lista: `@NotEmpty` com mensagem
  `[label_da_lista] deve ter ao menos um registro`.

Na entidade filha:

- Volta ao pai marcada com **`@JsonIgnore`**: sem ele a serialização da coleção
  entra em recursão infinita pai → filho → pai.
- **Sem campos de auditoria**: a auditoria fica na entidade do CRUD.

### `persistencia: independente`

O filho é entidade de primeira classe; o pai não o agrega.

- Na entidade do CRUD, **não** declarar `@OneToMany`. A coleção é carregada pelo
  endpoint do filho, não pela navegação do pai. Isso evita lazy loading na
  serialização do pai e mantém o payload do CRUD estável.
- Na entidade filha, a volta ao pai **não** leva `@JsonIgnore`: o filho é
  serializado sozinho e precisa carregar o pai a que pertence. Não há recursão,
  justamente porque o pai não tem a coleção.
- A volta ao pai é `@NotNull` com mensagem `[label_do_pai] é um campo obrigatório`.
- A entidade filha **tem** os quatro campos de auditoria, preenchidos no service
  dela (`04-backend-service.md`).
- `obrigatorio: true` na lista não vira constraint no backend: não existe momento
  em que pai e coleção sejam validados juntos. A exigência fica na tela
  (`09-frontend-cadastro.md`); para garanti-la no servidor, tratar como regra de
  negócio no service do pai.

## Repository

- Interface em `[pacote-base].domain.repositories`.
- Estender `JpaRepository<[NomeTabela], Long>`.
- Lista `agregado`: **não** criar repository para a entidade filha — ela é gravada e
  lida por cascata a partir da raiz do agregado.
- Lista `independente`: criar `[NomeTabelaFilha]Repository` estendendo
  `JpaRepository<[NomeTabelaFilha], Long>`, com um método derivado de listagem por
  pai (`findBy[NomeTabelaPai]Id(Long id)`) usado pelo endpoint `por-[pai]/{id}`.
- Se houver campo pesquisável, adicionar suporte QueryDSL conforme padrão do projeto.
- Sem padrão específico, estender também `QuerydslPredicateExecutor<[NomeTabela]>`.
- Usar `@Query` apenas quando método derivado/QueryDSL não atender.

## Filter QueryDSL

Criar apenas se houver `pesquisavel != false`.

- Classe em `[pacote-base].domain.filter.[NomeTabela]Filter`.
- Propriedades para todos os campos pesquisáveis. Subcampos de lista nunca são
  pesquisáveis e não entram no filter.
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
- Nenhuma entidade gerada usa `@ManyToMany`.
- Lista `agregado`: o pai tem `@OneToMany` com cascade/orphanRemoval, e a filha tem
  `@JsonIgnore` na volta ao pai, sem auditoria e sem repository próprio.
- Lista `independente`: o pai **não** tem `@OneToMany`, e a filha tem auditoria,
  repository próprio e a volta ao pai serializável.

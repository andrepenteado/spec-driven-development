# 04 - Backend Service

## Objetivo

Criar regra de negócio do CRUD e auditoria.

## Saída

- `[pacote-base].services.[NomeTabela]Service`

## Métodos

- `listar()`
- `buscar(Long id)`
- `incluir(@Valid obj)`
- `alterar(@Valid obj, Long id)`
- `excluir(Long id)`
- `pesquisar([NomeTabela]Filter filtro)`, somente se houver campo pesquisável

## Regras

- Aplicar `@Secured` em todos os métodos usando perfis antes de `:` em `projeto.perfis`.
- Se constante de perfil não existir na classe main, criar com valor `ROLE_[pacote-base]_[NOME_PERFIL]`.
- `incluir`: exige `id == null` e preenche `criadoPor`/`criadoEm`.
- `alterar`: exige `obj.id == id`, busca existente, preserva criação e preenche alteração.
- `excluir`: chamar `repository.deleteById(id)` diretamente, sem `try/catch`. O módulo `web` da lib apcore (`DatabaseExceptionHandler`) já converte `EmptyResultDataAccessException` (registro inexistente) em HTTP 404 globalmente — não reimplementar esse catch no service. Se o projeto ainda usa uma versão anterior da lib (sem esse handler), ou se a tela precisa de uma mensagem de erro customizada em vez do 404 genérico, usar `RepositoryUtils.deleteOrNotFound(() -> repository.deleteById(id))` de `br.unesp.fc.andrepenteado.core.web.utils` em vez de escrever o `try/catch` à mão.
- Auditoria usa `SecurityService.getUserLogin().getLogin()`, sem fallback.
- Pesquisa usa `repository.findAll(filtro.toPredicate())` ou padrão QueryDSL equivalente.
- Logs devem usar `tabela.label`.

## Listas (`tipo: lista`)

### `persistencia: agregado`

A coleção chega no mesmo payload do registro do CRUD e é gravada por cascata. Não
criar service próprio para a entidade filha.

- Em `incluir` e `alterar`, **religar cada filho ao pai antes de salvar**: o
  frontend não envia a volta ao pai (ela é `@JsonIgnore`) e sem isso a FK vai
  nula no insert.

```java
if (pedido.getItens() != null) {
    pedido.getItens().forEach(item -> item.setPedido(pedido));
}
```

- Em `alterar`, aplicar a coleção recebida sobre a coleção gerenciada em vez de
  trocar a referência da lista: com `orphanRemoval`, substituir a instância
  quebra o rastreamento do Hibernate. Limpar e repopular a lista existente
  (`existente.getItens().clear(); existente.getItens().addAll(...)`) ou usar o
  padrão de merge já adotado pelo projeto.
- A auditoria continua sendo preenchida só no registro do CRUD.
- `excluir` não precisa remover os filhos: `cascade`/`orphanRemoval` cuidam disso.

### `persistencia: independente`

Criar `[NomeTabelaFilha]Service` com os mesmos padrões desta spec — `@Secured` com
os perfis do CRUD pai, auditoria via `SecurityService`, logs com o label da lista.

- Métodos: `listarPor[NomeTabelaPai](Long id)`, `buscar(Long id)`,
  `incluir(@Valid obj)`, `alterar(@Valid obj, Long id)` e `excluir(Long id)`.
- A auditoria é preenchida **neste** service, não no do pai: o filho é gravado por
  conta própria.
- O service do pai não sabe da coleção: `incluir`/`alterar`/`excluir` do CRUD não
  tocam nos filhos. A exclusão em cascata é responsabilidade do banco
  (`onDelete` em `02-backend-liquibase.md`).

## Critérios de aceite

- Auditoria é preenchida no service.
- Pesquisa aceita múltiplos filtros simultâneos.
- Métodos estão protegidos pelos perfis.
- Mensagens usam label do YAML.
- Registro com lista grava, altera e exclui os filhos junto, sem service próprio
  para a entidade filha e sem FK nula.
- `excluir` de um ID inexistente retorna 404 (via handler global da lib ou `RepositoryUtils`), sem `try/catch` local reimplementando essa conversão.

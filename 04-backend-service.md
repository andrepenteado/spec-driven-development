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
- um método por item de `tabela.acoes-customizadas`, ver abaixo

## Regras

- Aplicar `@Secured` em **todos** os métodos, usando as referências Java antes de `:`
  em `projeto.perfis`, distribuídas por `tabela.acoes` (`01-yaml-contrato.md`).
- Se a constante de perfil não existir, criá-la na classe indicada antes do ponto
  (ex.: `PerfisUsuario.CAIXA` → classe `PerfisUsuario`), seguindo o prefixo já usado
  pelo projeto — o mesmo de `PREFIXO_PERFIL_SISTEMA` no frontend. Sem prefixo
  definido, usar `ROLE_[pacote-base]_[NOME_PERFIL]`.
- `edicao` do YAML é aplicado aqui (ver "Edição de campo por perfil"). As
  propriedades de `por-perfil` são só de tela.
- Regra mais fina que ação e campo — "só o gerente altera pedido já fechado" — também
  é escrita aqui, comparando os perfis do `SecurityService` com o estado do registro.
- `incluir`: exige `id == null` e preenche `criadoPor`/`criadoEm`.
- `alterar`: exige `obj.id == id`, busca existente, preserva criação e preenche alteração.
- `excluir`: chamar `repository.deleteById(id)` diretamente, sem `try/catch`. O módulo `web` da lib apcore (`DatabaseExceptionHandler`) já converte `EmptyResultDataAccessException` (registro inexistente) em HTTP 404 globalmente — não reimplementar esse catch no service. Se o projeto ainda usa uma versão anterior da lib (sem esse handler), ou se a tela precisa de uma mensagem de erro customizada em vez do 404 genérico, usar `RepositoryUtils.deleteOrNotFound(() -> repository.deleteById(id))` de `br.unesp.fc.andrepenteado.core.web.utils` em vez de escrever o `try/catch` à mão.
- Auditoria usa `SecurityService.getUserLogin().getLogin()`, sem fallback.
- Pesquisa usa `repository.findAll(filtro.toPredicate())` ou padrão QueryDSL equivalente.
- Logs devem usar `tabela.label`.

## Segurança por ação (`tabela.acoes`)

Cada método recebe os perfis da ação correspondente, e não a lista inteira de
`projeto.perfis`. É isto que impede um perfil de leitura de gravar chamando a API
direto — a tela escondendo o botão nunca foi barreira.

| Método | Ação |
|---|---|
| `listar()`, `buscar(id)`, `pesquisar(filtro)` | `consultar` |
| `incluir(obj)` | `incluir` |
| `alterar(obj, id)` | `alterar` |
| `excluir(id)` | `excluir` |

```java
@Secured({ PerfisUsuario.CAIXA, PerfisUsuario.GERENTE })
public List<Pedido> listar() { ... }

@Secured(PerfisUsuario.CAIXA)
public Pedido incluir(@Valid Pedido pedido) { ... }

@Secured(PerfisUsuario.GERENTE)
public void excluir(Long id) { ... }
```

- `tabela.acoes` ausente: todos os métodos recebem todos os perfis de
  `projeto.perfis`, como sempre foi.
- Ação com lista vazia (`excluir: []`): o método continua existindo, mas com
  `@Secured` que nenhum perfil satisfaz. Não remover o método nem o endpoint — a
  negação fica declarada e visível.
- Um único perfil na ação usa `@Secured(PerfisUsuario.X)`; mais de um usa a forma com
  chaves.

## Regras de negócio (`regras`)

Cada item de `regras` (`01-yaml-contrato.md`) vira código **dentro dos métodos
padrão** — não um método novo. O `prompt` diz o momento; é ele que decide onde o código
entra.

```java
@Secured(PerfisUsuario.EDITOR)
public Edital incluir(@Valid Edital edital) {
    // Regra "situação inicial" (.cruds/edital.yaml)
    edital.setSituacao(SituacaoEdital.RASCUNHO);
    edital.setUnidadeUniversitaria(securityService.getUserLogin().getUnidade());

    // ... auditoria e gravação
}

@Secured({ PerfisUsuario.EDITOR, PerfisUsuario.ASSINANTE })
public Edital alterar(@Valid Edital edital, Long id) {
    Edital existente = buscar(id);

    // Regra "bloqueio de edital publicado" (.cruds/edital.yaml)
    if (existente.getSituacao() == SituacaoEdital.PUBLICADO
            || existente.getSituacao() == SituacaoEdital.REVOGADO) {
        throw new ValidacaoException("Edital publicado ou revogado não pode ser alterado");
    }

    // ... preservar campos, auditoria e gravação
}
```

- **Comentar cada regra com o `nome` dela e o YAML de origem**, como acima. É o que
  liga o código à declaração e o que torna a revisão possível.
- Regra que define valor inicial **sobrescreve o que veio no payload**, não usa o valor
  do cliente como fallback.
- Regra que recusa a operação lança a exception de negócio do projeto, convertida em
  409/422 pelo handler — nunca ignora em silêncio nem grava pela metade.
- Ordem dentro do método: primeiro as regras que **recusam** (falhar cedo), depois as
  que **atribuem** valor, depois a preservação de campos e a auditoria.
- Uma regra pode tocar mais de um método: o `prompt` "sempre que gravar" vale em
  `incluir` e em `alterar`, com o mesmo comentário nos dois lugares.
- Dado do usuário logado vem do `SecurityService`, nunca do payload.
- O que foi implementado a partir de cada regra entra no relatório final
  (`orquestrador.md`).

## Ações customizadas

Cada item de `tabela.acoes-customizadas` (`01-yaml-contrato.md`) vira **um método** no
service, com a regra de negócio escrita a partir do `prompt`:

```java
/**
 * Revoga o edital. Só é permitido quando a situação atual é PUBLICADO.
 *
 * <p>Regra declarada em .cruds/edital.yaml, ação customizada "revogar".</p>
 */
@Secured(PerfisUsuario.PUBLICADOR)
public Edital revogar(Long id) {
    Edital edital = buscar(id);

    if (edital.getSituacao() != SituacaoEdital.PUBLICADO) {
        throw new ValidacaoException("Só é possível revogar um Edital publicado");
    }

    edital.setSituacao(SituacaoEdital.REVOGADO);
    edital.setDataRevogacao(LocalDate.now());
    edital.setAlteradoPor(securityService.getUserLogin().getLogin());
    edital.setAlteradoEm(LocalDateTime.now());

    log.info("Revogar Edital {}", edital.getNumero());

    return repository.save(edital);
}
```

- Assinatura fixa: recebe o `Long id` e devolve a entidade atualizada, para o frontend
  não precisar de um `GET` a seguir.
- `@Secured` com os `perfis` da ação, não com os do CRUD inteiro.
- **Validar as pré-condições antes de alterar** e recusar com a exception de negócio do
  projeto (a que o handler converte em 409/422), nunca alterar em silêncio. O `prompt`
  descreve o estado esperado justamente para isso virar código.
- **Preencher a auditoria de alteração**: a ação muda o registro, então `alteradoPor` e
  `alteradoEm` são obrigatórios, como em `alterar`.
- Não repetir a lógica de `alterar`: a ação mexe só no que o `prompt` manda.
- `edicao` não se aplica aqui. Uma ação customizada é uma operação de negócio inteira,
  autorizada pelos `perfis` dela; ela pode gravar campos que ninguém edita pela tela —
  é exatamente assim que `edicao: []` em `situacao` convive com um `revogar` que a
  altera.
- Log com `tabela.label`, no padrão de `11-monitoramento-faro.md`.
- O que foi implementado a partir de cada `prompt` entra no relatório final
  (`orquestrador.md`).

## Edição de campo por perfil

`edicao` (`01-yaml-contrato.md`) **não é só apresentação**: o service aplica a mesma
regra que a tela, para o campo não ser gravado por quem está fora da lista mesmo que a
requisição venha fora da tela.

Isso **não cria endpoint nem payload diferente por perfil**. `incluir` e `alterar`
continuam sendo os mesmos métodos, recebendo o objeto inteiro; o que muda é o valor que
o service aceita de cada campo.

| Momento | O que o service faz com campo que o usuário não edita |
|---|---|
| `alterar` | Descarta o valor recebido e repõe o do registro existente |
| `incluir` | Descarta o valor recebido; o campo fica com o valor que a regra de negócio definir, ou nulo |

Um método privado por CRUD concentra a regra, chamado no início de `incluir` e de
`alterar`, antes de gravar:

```java
@Secured({ PerfisUsuario.EDITOR, PerfisUsuario.ASSINANTE })
public Edital alterar(@Valid Edital edital, Long id) {
    Edital existente = buscar(id);
    preservarCamposNaoEditaveis(edital, existente);
    // ... auditoria e gravação
}

/**
 * Repõe os campos que o perfil do usuário não edita. `edicao` do YAML vale aqui, não
 * só na tela: sem isso, uma requisição fora da tela alteraria o campo.
 */
private void preservarCamposNaoEditaveis(Edital novo, Edital existente) {
    // edicao: [] — ninguém edita
    novo.setNumero(existente.getNumero());
    novo.setAno(existente.getAno());
    novo.setSituacao(existente.getSituacao());

    // um bloco por lista de `edicao`, com os campos que a compartilham
    if (!podeEditar(PerfisUsuario.EDITOR)) {
        novo.setNome(existente.getNome());
        novo.setPreambulo(existente.getPreambulo());
    }

    if (!podeEditar(PerfisUsuario.ASSINANTE)) {
        novo.setNomeAssinatura(existente.getNomeAssinatura());
        novo.setFuncaoAssinatura(existente.getFuncaoAssinatura());
        novo.setDataAssinatura(existente.getDataAssinatura());
    }
}

private boolean podeEditar(String... perfis) {
    return Stream.of(perfis).anyMatch(securityService::hasPerfil);
}
```

- **Sem reflexão.** O gerador conhece os campos e escreve `set`/`get` explícitos, como
  no resto do projeto.
- **Um bloco por lista de `edicao`**, não um `if` por campo: os campos que declaram a
  mesma lista andam juntos e o método fica curto.
- `podeEditar` usa `hasPerfil` do `SecurityService` (que compara com as authorities do
  usuário) em `anyMatch`, porque **perfis somam permissões**: basta um perfil que edite
  para o valor enviado valer.
- `edicao: []` vira reposição **incondicional** — nem o perfil mais privilegiado
  grava. É o caso de número gerado, situação controlada por regra e saldo calculado.
- Campo sem `edicao` no YAML não entra no método: todo perfil o grava.
- Campo com `edicao` restrita e `obrigatorio: true` ao mesmo tempo: em `incluir`, o service
  precisa atribuir o valor, senão a violação aparece no flush do Hibernate em vez de um
  400 limpo. O `@Valid` do parâmetro roda **antes** do corpo do método e valida o que o
  cliente mandou, não o que o service manteve.
- Ocultar campo (`exibe-formulario: false`) **não** impede gravar: quem impede é
  `edicao`. Campo escondido de um perfil que ainda está em `edicao` é quase sempre
  descuido — relatar no relatório de validação.

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

Criar `[NomeTabelaFilha]Service` com os mesmos padrões desta spec — auditoria via
`SecurityService`, logs com o label da lista e `@Secured` por ação, agora vindo de
`lista.acoes` (que herda de `tabela.acoes` quando ausente):
`listarPor[Pai]`/`buscar` usam `consultar`, `incluir` usa `incluir`, `alterar` usa
`alterar` e `excluir` usa `excluir`.

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
- Cada método está protegido pelos perfis da sua ação em `tabela.acoes`, e não pela
  lista inteira de `projeto.perfis`.
- Cada ação customizada virou um método com `@Secured` dos `perfis` dela, validando as
  pré-condições e preenchendo a auditoria de alteração.
- Cada `regra` virou código dentro do método padrão correspondente, comentada com o
  `nome` e o YAML de origem.
- Campo fora do `edicao` do perfil do usuário chega gravado com o valor anterior,
  mesmo quando a requisição manda outro — sem endpoint nem payload separado por perfil.
- Service de lista `independente` está protegido pelos perfis de `lista.acoes`.
- Mensagens usam label do YAML.
- Registro com lista grava, altera e exclui os filhos junto, sem service próprio
  para a entidade filha e sem FK nula.
- `excluir` de um ID inexistente retorna 404 (via handler global da lib ou `RepositoryUtils`), sem `try/catch` local reimplementando essa conversão.

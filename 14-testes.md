# 14 - Testes

## Objetivo

Gerar, junto com o CRUD, os testes automatizados que provam que o sistema faz o que o
YAML declara — e que continuam provando isso depois do próximo refactor.

Teste **não** é etapa posterior nem opcional: é parte da geração, escrito no mesmo
comando que gera o código e executado antes do manifesto `.generated.yaml`. CRUD com
suíte falhando, ou não executada, não está concluído.

O alvo é o que a spec gera e o que o YAML declara. Framework, lib `ngx-apcore`, Lombok,
getters/setters e mapeamento do Hibernate não são testados aqui: já têm dono.

## Saídas

Backend, em `backend/src/test/java/`, espelhando o pacote da classe testada:

- `[pacote-base].services.[NomeTabela]ServiceTest`
- `[pacote-base].services.[NomeTabela]ServiceSegurancaTest`
- `[pacote-base].services.[NomeTabelaFilha]ServiceTest`, só em lista `independente`
- `[pacote-base].resources.[NomeTabela]ResourceTest`
- `[pacote-base].domain.filter.[NomeTabela]FilterTest`, só se houver pesquisa

Frontend, ao lado do arquivo testado:

- `src/app/services/[nome-tabela].service.spec.ts`
- `src/app/services/[nome-tabela-filha].service.spec.ts`, só em lista `independente`
- `src/app/pages/[nome-tabela]/pesquisar/pesquisar.componente.spec.ts`
- `src/app/pages/[nome-tabela]/cadastro/cadastro.componente.spec.ts`
- `src/app/pages/[nome-tabela]/[nome-tabela].perfis.spec.ts`, só quando o CRUD gerou
  `[nome-tabela].perfis.ts` (`06-frontend-rotas-menu-api.md`)

Todo arquivo de teste segue as regras gerais de `00-contexto-geral.md`: cabeçalho de
autoria com data/hora pt_BR e observação de criação com ajuda da IA, Javadoc nas
classes Java e português do Brasil em nomes e mensagens.

## Rastreabilidade: o que o YAML declara vira teste

Esta é a regra central. Cada declaração do YAML tem um teste obrigatório, e é por ela
que se decide se a suíte está completa — não por percentual de cobertura.

| O que o YAML declara | Teste obrigatório | Onde |
|---|---|---|
| `tabela.acoes` | perfil autorizado executa; perfil não autorizado recebe `AccessDeniedException` e não toca no repository | `[NomeTabela]ServiceSegurancaTest` |
| `tabela.acoes` com lista vazia | nenhum perfil executa o método | `[NomeTabela]ServiceSegurancaTest` |
| `lista.acoes` | o mesmo, sobre o service da lista `independente` | `[NomeTabelaFilha]ServiceTest` |
| `regras` | um teste por regra: o caminho em que ela age e o caminho em que ela recusa | `[NomeTabela]ServiceTest` |
| `tabela.acoes-customizadas` | pré-condição válida grava e audita; pré-condição inválida recusa e não grava | `[NomeTabela]ServiceTest` |
| ação com `corpo: true` | grava o que veio da tela antes de aplicar a regra, com `edicao` valendo | `[NomeTabela]ServiceTest` |
| `edicao` | campo fora do `edicao` do perfil volta com o valor anterior no `alterar` e é descartado no `incluir` | `[NomeTabela]ServiceTest` |
| `por-perfil` | cada perfil recebe a configuração declarada; perfis somam permissões | `[nome-tabela].perfis.spec.ts` |
| auditoria (sempre) | `incluir` preenche criação; `alterar` preserva criação e preenche alteração | `[NomeTabela]ServiceTest` |
| campo `pesquisavel` | filtro entra no `toPredicate()` e vários filtros combinam com `AND` | `[NomeTabela]FilterTest` |
| endpoints de `05-backend-resource.md` | verbo, path e delegação ao service | `[NomeTabela]ResourceTest` |
| `tipo: lista` `agregado` | filhos religados ao pai antes de gravar, sem FK nula | `[NomeTabela]ServiceTest` |
| `tipo: lista` `independente` | aba/serviço do filho grava por conta própria, com auditoria própria | `[NomeTabelaFilha]ServiceTest` |
| campo `moeda` e `data` | comportamento do componente da ngx-apcore no formulário | `cadastro.componente.spec.ts` |

- Teste de regra e de ação customizada leva no nome o `nome` declarado no YAML, e um
  comentário citando o YAML de origem — igual ao código do service
  (`04-backend-service.md`). É o que liga declaração, implementação e prova.
- Declaração sem teste correspondente é pendência de relatório, não um detalhe: relatar
  explicitamente o que ficou sem cobertura e por quê.

## Princípios

- **Testar comportamento, não implementação.** Verificar o objeto que chegou ao
  `repository.save(...)`, não que um `setter` foi chamado. Um teste que espelha linha a
  linha o service quebra em todo refactor e não pega defeito nenhum.
- **Nada de mock contra mock.** Se o único assert do teste é `verify` de um mock que o
  próprio teste programou, o teste não prova nada.
- **Um comportamento por teste**, com nome em português dizendo o que se espera:
  `deveRecusarAlteracaoDeEditalPublicado`, `naoDeveExcluirComPerfilDeCaixa`.
- **Teste que falha precisa acusar a causa.** Preferir asserts sobre o valor final e a
  mensagem de erro a um `assertTrue` sem contexto.
- **Não alterar o código de produção para o teste passar.** Se o teste revelou um
  defeito, corrigir o código e dizer isso no relatório final. Se revelou que a spec e o
  YAML se contradizem, parar e relatar (`orquestrador.md`).
- **Não introduzir framework, runner ou dependência de teste** que o projeto não tenha.
  Usar o que já está configurado; se não houver nada configurado, gerar os testes,
  relatar que não há como executá-los e não inventar infraestrutura.

## Backend

### Infraestrutura

- JUnit 5 e Mockito, com `@ExtendWith(MockitoExtension.class)` para os testes de regra
  de negócio: eles não precisam de contexto Spring.
- Teste de segurança precisa do contexto, porque `@Secured` é interceptado por proxy:
  usar uma fatia mínima com `@EnableMethodSecurity(securedEnabled = true)`, o service
  importado e os colaboradores como `@MockitoBean` (Spring Boot 4; `@MockBean` foi
  removido).
- Repository, filter e Liquibase usam a infraestrutura de banco já adotada pelo projeto
  (Testcontainers com PostgreSQL, quando houver). Não trocar o banco de teste por H2
  para "facilitar": QueryDSL, `ilike` e tipos do PostgreSQL se comportam diferente, e um
  teste verde em H2 não diz nada sobre produção.
- `SecurityService` é sempre mock nos testes de service: o login vem dele, nunca do
  payload (`04-backend-service.md`).

### Segurança por ação (`tabela.acoes`)

É o teste que impede a regressão mais cara do CRUD: a tela esconde o botão, o `@Secured`
some num refactor e a API fica aberta. Um teste por par **perfil × ação**, cobrindo o
autorizado e o negado.

```java
@SpringBootTest(classes = PedidoServiceSegurancaTest.Config.class)
class PedidoServiceSegurancaTest {

    @Configuration
    @EnableMethodSecurity(securedEnabled = true)
    @Import(PedidoService.class)
    static class Config { }

    @Autowired
    private PedidoService servico;

    @MockitoBean
    private PedidoRepository repository;

    @MockitoBean
    private SecurityService securityService;

    @Test
    @WithMockUser(authorities = PerfisUsuario.CAIXA)
    void caixaDeveIncluirPedido() {
        given(securityService.getUserLogin()).willReturn(new UserLogin("caixa1"));
        given(repository.save(any(Pedido.class))).willAnswer(chamada -> chamada.getArgument(0));

        assertThat(servico.incluir(novoPedido())).isNotNull();
    }

    @Test
    @WithMockUser(authorities = PerfisUsuario.GERENTE)
    void gerenteNaoDeveIncluirPedido() {
        assertThatThrownBy(() -> servico.incluir(novoPedido()))
            .isInstanceOf(AccessDeniedException.class);

        verifyNoInteractions(repository);
    }
}
```

- **Usar `authorities`, não `roles`, no `@WithMockUser`**: as constantes de
  `PerfisUsuario` já vêm com o prefixo do projeto (`ROLE_...`), e `roles` prefixaria de
  novo — o teste passaria a testar um perfil que não existe, e passaria verde do jeito
  errado.
- **`verifyNoInteractions(repository)` no caso negado**: a recusa tem que acontecer
  antes de qualquer efeito. Só checar a exception deixa passar um método que grava e
  depois estoura.
- Ação declarada com lista vazia (`excluir: []`) tem teste próprio: **nenhum** perfil de
  `projeto.perfis` executa o método. A negação está declarada no YAML e fica provada.
- `listar`, `buscar` e `pesquisar` respondem por `consultar`; não deixar os três sem
  teste porque "só leem".
- CRUD com muitos perfis pode usar `@ParameterizedTest` com a matriz perfil × ação como
  `@MethodSource`, desde que cada caso continue afirmando o efeito (executou / recusou
  sem tocar no repository).

### Regras de negócio (`regras`)

Um teste para o caminho em que a regra age e um para o caminho em que ela não age ou
recusa.

```java
@Test
void deveGravarSituacaoInicialIgnorandoOPayload() {
    // Regra "situação inicial" (.cruds/edital.yaml)
    Edital enviado = novoEdital();
    enviado.setSituacao(SituacaoEdital.PUBLICADO);   // o cliente tentou mandar outra

    Edital gravado = servico.incluir(enviado);

    assertThat(gravado.getSituacao()).isEqualTo(SituacaoEdital.RASCUNHO);
}

@Test
void deveRecusarAlteracaoDeEditalPublicado() {
    // Regra "bloqueio de edital publicado" (.cruds/edital.yaml)
    given(repository.findById(1L)).willReturn(Optional.of(editalCom(SituacaoEdital.PUBLICADO)));

    assertThatThrownBy(() -> servico.alterar(novoEdital(), 1L))
        .isInstanceOf(ValidacaoException.class)
        .hasMessageContaining("publicado");

    verify(repository, never()).save(any());
}
```

- Regra que define valor inicial é testada **com o payload trazendo outro valor**: é
  exatamente o caso que a regra existe para cobrir.
- Regra que recusa é testada pela exception **e** pela ausência de gravação.
- Regra cujo `prompt` diz "sempre que gravar" tem teste em `incluir` e em `alterar`.
- Regra de tela (`01-yaml-contrato.md`) é testada no componente, não no service.

### Ações customizadas

```java
@Test
void deveRevogarEditalPublicado() {
    given(repository.findById(1L)).willReturn(Optional.of(editalCom(SituacaoEdital.PUBLICADO)));
    given(securityService.getUserLogin()).willReturn(new UserLogin("publicador1"));
    given(repository.save(any(Edital.class))).willAnswer(chamada -> chamada.getArgument(0));

    Edital revogado = servico.revogar(1L);

    assertThat(revogado.getSituacao()).isEqualTo(SituacaoEdital.REVOGADO);
    assertThat(revogado.getDataRevogacao()).isNotNull();
    assertThat(revogado.getAlteradoPor()).isEqualTo("publicador1");
}
```

- Sempre dois testes no mínimo: pré-condição satisfeita e pré-condição violada.
- A auditoria de alteração entra no assert: a ação muda o registro, então `alteradoPor` e
  `alteradoEm` são obrigatórios (`04-backend-service.md`).
- Ação com `corpo: true` tem um terceiro teste: o valor que veio da tela **foi gravado**
  antes da regra, os campos fora do `edicao` do perfil **não** foram, e a recusa da
  pré-condição não deixa a gravação de pé (uma transação só).

### `edicao` por perfil

```java
@Test
void deveReporDescontoQuandoOPerfilNaoEdita() {
    given(securityService.hasPerfil(PerfisUsuario.GERENTE)).willReturn(false);
    given(repository.findById(1L)).willReturn(Optional.of(pedidoComDesconto(new BigDecimal("10.00"))));
    given(repository.save(any(Pedido.class))).willAnswer(chamada -> chamada.getArgument(0));

    Pedido enviado = pedidoComDesconto(new BigDecimal("999.00"));   // fora da tela
    enviado.setId(1L);

    assertThat(servico.alterar(enviado, 1L).getDesconto()).isEqualByComparingTo("10.00");
}
```

- O teste manda o valor **por fora da tela**: é o cenário real que `edicao` no service
  existe para barrar. Testar pela tela só provaria o `readonly` do template.
- Campo com `edicao: []` tem teste com o perfil mais privilegiado do CRUD: nem ele grava.
- Em `incluir`, o valor enviado é descartado — o assert é sobre o valor que a regra
  define, ou nulo.

### Auditoria

- `incluir` preenche `criadoPor`/`criadoEm` com o login de `SecurityService`, e não com o
  que veio no payload.
- `alterar` preserva `criadoPor`/`criadoEm` do registro existente e preenche
  `alteradoPor`/`alteradoEm`.
- Data/hora: assertar que o valor está **entre** o instante anterior e o posterior à
  chamada, ou apenas que não é nulo. Não fixar instante nem introduzir `Clock` no código
  gerado só para o teste.
- Lista `agregado` não recebe auditoria; lista `independente` recebe, no service dela.

### Listas (`tipo: lista`)

- `agregado`: `incluir` e `alterar` religam cada filho ao pai antes de salvar — o assert
  é sobre a FK preenchida em todos os itens da coleção capturada no `save`. `alterar`
  com a coleção trocada mantém a instância gerenciada (limpa e repopula), não substitui
  a referência.
- `independente`: o service do pai **não** toca nos filhos; o service do filho grava,
  audita e é barrado por `lista.acoes`.

### Resource

`@WebMvcTest` do resource com o service mockado. O que se prova aqui é o contrato HTTP,
não a regra de negócio:

- verbo e path de cada endpoint de `05-backend-resource.md`, incluindo
  `POST /{id}/[acao-kebab]` de cada ação customizada e o corpo apenas quando
  `corpo: true`;
- `/pesquisar` recebe os filtros por **query params** ligados ao `[NomeTabela]Filter`,
  sem body e sem `campo`/`valor`;
- delegação: o resource chama o método certo do service e devolve o que ele retornou;
- `DELETE` de id inexistente responde **404** pelo handler global, sem `try/catch` local;
- o resource **não** preenche auditoria nem repete `@Secured`.

### Filter QueryDSL

- Cada campo pesquisável filtra sozinho.
- Dois ou mais filtros preenchidos combinam com `AND`.
- Nulo, string em branco e enum não selecionado são ignorados.
- `contem` é parcial e case-insensitive; `exato` é igualdade.
- Subcampo de lista não entra no filtro.

## Frontend

### Infraestrutura

- `TestBed` do Angular, com `provideHttpClient()` + `provideHttpClientTesting()` e
  `HttpTestingController` nos testes de service.
- Escrever os specs com a API comum aos runners (`describe`/`it`/`expect`,
  `toBe`/`toEqual`), evitando helpers exclusivos de um deles (`jasmine.createSpyObj`,
  `vi.fn`) quando um stub simples resolve: o projeto pode estar em Karma/Jasmine ou no
  runner de testes do Angular CLI, e o spec gerado precisa rodar nos dois.
- `LoginService`, `INIT_CONFIG` e os services do CRUD entram como stub via provider, não
  como instância real.

### Configuração por perfil (`[nome-tabela].perfis.spec.ts`)

O teste mais barato e mais valioso do frontend: é ele que prova a tradução do
`por-perfil` do YAML, sem renderizar tela nenhuma.

```ts
function configPara(...perfis: string[]): ConfigCrud {
  const loginService = { hasRole: (perfil: string) => perfis.includes(perfil) } as LoginService;
  return resolverPerfil(PERFIS_PEDIDO, loginService);
}

describe("PERFIS_PEDIDO", () => {
  it("caixa inclui e altera, mas nao exclui", () => {
    expect(configPara(CAIXA).acoes)
      .toEqual({ consultar: true, incluir: true, alterar: true, excluir: false });
  });

  it("desconto e somente leitura para o caixa e editavel para o gerente", () => {
    expect(configPara(CAIXA).campos["desconto"].somenteLeitura).toBe(true);
    expect(configPara(GERENTE).campos["desconto"].somenteLeitura).toBe(false);
  });

  it("perfis somam permissoes", () => {
    expect(configPara(CAIXA, GERENTE).acoes)
      .toEqual({ consultar: true, incluir: true, alterar: true, excluir: true });
  });

  it("usuario sem perfil do CRUD fica sem acao e sem campo visivel", () => {
    const config = configPara();
    expect(config.acoes.consultar).toBe(false);
    expect(config.campos["cliente"].exibeFormulario).toBe(false);
  });
});
```

- Um caso por perfil de `projeto.perfis`, mais o caso do **usuário com dois perfis**
  (perfis somam permissões) e o do usuário sem nenhum.
- Cobrir as quatro fatias que o CRUD gerou: `acoes`, `acoesCustomizadas`, `campos` e
  `listas`. Fatia que o YAML não declara não existe e não é testada.
- Consultar um campo do CRUD nunca devolve `undefined` — vale um teste.

### Service Angular

```ts
it("pesquisar chama /pesquisar com os filtros preenchidos", () => {
  service.pesquisar({ numero: 10, cliente: undefined }).subscribe();

  const req = httpTesting.expectOne(
    requisicao => requisicao.url === `${urlBackend}${API_PEDIDOS}/pesquisar`
  );
  expect(req.request.method).toBe("GET");
  expect(req.request.params.get("numero")).toBe("10");
  expect(req.request.params.has("cliente")).toBe(false);
});
```

- URL montada com `initConfig.urlBackend` + a constante de API: um teste que quebre se
  alguém escrever `/api` ou caminho relativo.
- Um teste por método, com o verbo certo, mais um por ação customizada
  (`POST /{id}/[acao-kebab]`, body vazio sem `corpo`, entidade com `corpo: true`).
- Filtro só manda o que está preenchido, e nunca `campo`/`valor`.
- `httpTesting.verify()` no `afterEach`.

### Pesquisa

- Filtros renderizados são exatamente os `pesquisavel` do perfil logado; com outro
  perfil, o conjunto muda.
- Colunas do grid seguem `exibeGrid` do perfil, e `<th>` e `<td>` usam a mesma condição.
- `Novo` e `Excluir` só aparecem para quem tem a ação; sem `alterar`, a ação da linha é
  `Visualizar`.
- Pesquisar chama o método do service (backend), sem filtrar `this.lista` em memória.
- Ação customizada com `tela` incluindo `pesquisa` aparece na linha e recarrega a lista
  no sucesso.

### Cadastro

- O `FormGroup` tem **todos** os campos do CRUD, inclusive os ocultos para o perfil, e
  nenhum controle é removido nem `disabled` — teste explícito, porque é a regressão que
  faz o `Gravar` apagar dado do banco.
- Campo fora do `edicao` do perfil aparece e não aceita edição (`readonly`), e o valor
  recebido volta intacto no valor enviado ao gravar.
- `Gravar` só aparece para quem tem a ação do modo atual; sem ela, o formulário inteiro
  é somente leitura.
- Aba sem campo visível não é renderizada; aba de lista respeita `lista.acoes`.
- Lista `agregado`: adicionar e excluir item **não** chama o backend, e a coleção vai no
  payload do CRUD. Lista `independente`: chama o service do filho, e a aba fica bloqueada
  enquanto o CRUD não foi gravado.
- Ação customizada com `tela` incluindo `cadastro` some em modo de inclusão, confirma
  antes e recarrega o registro no sucesso; com `corpo: true`, valida o formulário e manda
  `form.value` no corpo.
- `aposCarregar()` é idempotente: chamar duas vezes não duplica item de `FormArray`.

### Campos com máscara

- `moeda`: com o host renderizado, digitar `15050` caractere a caractere (disparando
  `focus` antes, senão o ngx-mask engole a primeira tecla) resulta em `150,50` na tela e
  em `150.5` **number** no `FormControl`; ponto e vírgula digitados são ignorados; campo
  vazio vira `null`, não `0`. Testar a combinação, não a constante da máscara
  (`09-frontend-cadastro.md`).
- `data`: `dd/mm/aaaa` digitado vira ISO (`aaaa-mm-dd`) no `FormControl`; `30/02/2026` e
  `29/02` de ano não bissexto são reprovados com o erro `data`.
- Todo campo só de dígitos declara `inputmode` — um teste de template basta para os dois
  lados (cadastro e filtros da pesquisa).

### `changeDetection`

Todo `@Component` gerado declara `ChangeDetectionStrategy.Eager` (`00-contexto-geral.md`),
e a falha por omissão é silenciosa. O teste que a pega é de comportamento: emitir o
retorno do service e verificar que **o DOM** mostra o dado — não assertar o metadado do
componente.

## Massa de dados e determinismo

- Massa fictícia, montada por método auxiliar no próprio teste (`novoPedido()`,
  `editalCom(situacao)`). Nunca dado pessoal real: CPF, e-mail, telefone e endereço de
  teste são inventados, pelo mesmo motivo que os logs não carregam o objeto inteiro
  (`00-contexto-geral.md`).
- Nada de `Thread.sleep`, de dependência de ordem entre testes ou de estado
  compartilhado: cada teste monta o que precisa.
- Nada de rede, arquivo real ou banco de produção. Backend usa mock ou o banco de teste
  do projeto; frontend usa `HttpTestingController`.
- Teste que só passa uma vez (não reexecutável) é defeito de teste, não característica.

## Execução

- Rodar a suíte **antes** de criar o `.generated.yaml`, com os comandos já configurados
  no projeto — tipicamente `./mvnw test` e `npm test` (em modo não interativo).
- Executar ao menos os testes do CRUD gerado. Rodar a suíte inteira quando for rápido, e
  relatar quando não for possível.
- Falhou: corrigir o código gerado e rodar de novo. Persistindo, **não** criar o
  manifesto — relatar o CRUD como pendente, com a saída do teste.
- O relatório final (`orquestrador.md`) informa os comandos executados, o resultado e
  qualquer declaração do YAML que ficou sem teste.

## Manifesto

O `.generated.yaml` lista os arquivos de teste junto dos demais em `arquivos` e registra
a execução (`01-yaml-contrato.md`):

```yaml
testes:
  comando-backend: "./mvnw test -Dtest='Pedido*Test'"
  comando-frontend: "npm test -- --watch=false"
  status: passou
```

## Critérios de aceite

- Todo CRUD gerado tem testes de backend e de frontend, criados no mesmo comando da
  geração.
- Cada ação de `tabela.acoes` e de `lista.acoes` tem teste do perfil autorizado e do
  perfil negado, e o negado não toca no repository.
- Ação declarada com lista vazia tem teste provando que nenhum perfil executa.
- Cada item de `regras` e de `tabela.acoes-customizadas` tem teste do caminho que age e
  do caminho que recusa, nomeado com o `nome` do YAML.
- Campo com `edicao` restrito tem teste provando que o valor enviado por fora da tela é
  descartado.
- A auditoria é verificada em `incluir` e em `alterar`, inclusive na preservação da
  criação.
- A configuração por perfil do frontend tem teste por perfil, mais o caso de perfis
  somados e o de usuário sem perfil do CRUD.
- O `FormGroup` do cadastro tem teste provando que nenhum controle é removido ou
  desabilitado por causa de perfil.
- Nenhum teste depende de rede, de ordem de execução, de dado pessoal real ou de instante
  fixo do relógio.
- Nenhum framework, runner ou dependência de teste foi adicionado ao projeto pela
  geração.
- A suíte foi executada e passou antes da criação do `.generated.yaml`.

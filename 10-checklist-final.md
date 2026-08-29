# 10 - Checklist Final

## Validação antes de gerar

- Escanear `.cruds/*.yaml`, ignorando `*.generated.yaml`.
- Classificar cada YAML como `novo`, `existente`, `conflito` ou `invalido`.
- Validar metadados obrigatórios, nomes, tipos, FKs, `fk-tipo`, enums, `aba`, blocos `lista`, pesquisa, layout e `projeto.perfis`.
- Validar que `tabela.campos` e cada `lista.campos` têm ao menos um `exibe-grid: true` — o default é `false`.
- Validar `regras` e `tabela.acoes-customizadas`: `nome` e `prompt` presentes, `nome` sem repetição, e `prompt` indicando o momento da regra.
- Validar `tabela.acoes`, `lista.acoes` e `por-perfil`: ações conhecidas, perfis existentes em `projeto.perfis`, todo perfil com `consultar` e nenhuma propriedade estrutural dentro de `por-perfil`.
- Validar a exaustividade do `por-perfil`: propriedade que aparece nele está declarada para todos os perfis de `projeto.perfis` e não tem valor comum no campo.
- Validar que `colunas-layout` não aparece em `por-perfil`: largura é igual para todos os perfis; o que varia é `exibe-formulario`.
- Confirmar padrões reais do backend/frontend.
- Gerar todo CRUD `novo` na sequência, sem pedir confirmação: a validação é etapa da execução, não um ponto de parada.

## Backend

- Liquibase criado/alterado na versão correta, incluindo a tabela filha de cada `tipo: lista`.
- Enum Java criado por bloco `enum`, com `descricao`, ou reaproveitado quando já existia.
- Entidade criada com auditoria e validações.
- Entidade filha criada por `tipo: lista`, conforme `lista.persistencia`: `agregado` com `@OneToMany` no pai e `@JsonIgnore` na volta; `independente` com auditoria, repository, service e resource próprios.
- Repository criado com QueryDSL quando houver pesquisa.
- Filter QueryDSL criado quando houver `pesquisavel != false`.
- Service criado com auditoria, segurança e logs, religando os filhos ao pai antes de gravar.
- `@Secured` de cada método usa os perfis da ação correspondente em `tabela.acoes`; service de lista `independente` usa `lista.acoes`.
- Service repõe os campos fora do `edicao` do perfil no `incluir` e no `alterar`, sem reflexão e sem endpoint separado por perfil.
- Resource criado com endpoints corretos, mais um `POST /{id}/[acao]` por ação customizada.
- Cada ação customizada virou método no service, com `@Secured` dos perfis dela, validação de pré-condições e auditoria de alteração.
- Cada item de `regras` virou código dentro do método padrão correspondente, comentado com o `nome` e o YAML de origem.

## Frontend

- Rotas criadas com `crudRoutes()` recebendo o objeto de opções, com todos os perfis de `projeto.perfis`.
- Menu atualizado, com todos os perfis de `projeto.perfis`.
- API constante criada.
- Enum TypeScript criado por bloco `enum`, com o `Record` de labels, ou reaproveitado quando já existia.
- Entidade TypeScript criada, mais uma por `tipo: lista`; service Angular do filho criado apenas em `persistencia: independente`.
- Service Angular criado com `INIT_CONFIG`, com um método por ação customizada.
- Pesquisa criada seguindo template, estendendo `PesquisarBaseComponent`, com filtro resolvido no backend via `/pesquisar` e grid client-side.
- Cadastro criado seguindo template, estendendo `CadastroBaseComponent`, com abas de `aba`, controles de `fk-tipo` e abas de lista.
- YAML com `acoes` ou `por-perfil` gerou `[nome-tabela].perfis.ts` e reusou `src/app/config/perfis-crud.ts`; pesquisa e cadastro resolvem a configuração pelo `LoginService`.
- Só as fatias que o YAML declara foram geradas (`acoes` ↔ `tabela.acoes`, `acoesCustomizadas` ↔ `tabela.acoes-customizadas`, `campos` ↔ `por-perfil`/`edicao`, `listas` ↔ `lista.acoes`); YAML sem nenhuma delas não gerou os arquivos e usa `hasRole` direto.
- Botões `Novo`, `Excluir` e `Gravar`, ação da linha, abas de lista e ações customizadas respeitam as ações do perfil.
- Todo `@Component` criado declara `changeDetection: ChangeDetectionStrategy.Eager`.
- Operações de pesquisar, buscar, gravar e excluir logam com `console.info` (padrão em `11-monitoramento-faro.md`).

## Regras críticas

- Não criar testes.
- Não sobrescrever CRUD existente.
- Não usar DTOs/mappers/interfaces de service salvo padrão obrigatório.
- Não usar `/api`, `baseUrl`, `resourceUrl` ou chamada relativa pura no Angular service.
- Não usar pesquisa antiga `campo`/`valor` nem filtrar a lista em memória no frontend.
- Não usar DataTables server-side (`Datatables.serverSide()`/`Datatables.aoClicarAcao()`): paginação, ordenação e busca são client-side. Server-side é evolução futura, fora desta spec.
- Não implementar pesquisa ou cadastro à mão: as telas estendem `PesquisarBaseComponent` e `CadastroBaseComponent`.
- Não duplicar CRUD por perfil: um YAML por tabela gera uma única tabela, entidade, service, resource, rota, menu, tela de pesquisa e tela de cadastro.
- Não remover `FormControl`, nem usar `disable()`, para ocultar campo de um perfil.
- Não tratar `exibe-formulario`/`exibe-grid` como segurança: quem barra é `tabela.acoes` via `@Secured` e `edicao` via reposição no service.
- Não criar endpoint, DTO ou payload por perfil: o service filtra os campos, a API é uma só.
- Não repetir `@Secured` no resource: a autorização por ação fica no service.
- Não usar `@ManyToMany` em nenhuma entidade.
- Não criar rota nem item de menu para entidade filha de lista, em nenhuma persistência.
- Não criar repository, service nem resource para lista `agregado`.
- Não gerar `<html>`, `<head>`, `<body>`, CDNs ou scripts em templates Angular.
- Não omitir `changeDetection: ChangeDetectionStrategy.Eager` em nenhum `@Component`, nem removê-lo de componente existente ao refatorar — estender as bases de CRUD não substitui o carimbo.
- Não repetir `provideHttpClient()` na lista de providers: uma única chamada com todos os recursos.
- Não usar `provideApcoreHttpInterceptors()`: função removida da lib, substituída pelo array `apcoreInterceptors`.

## Manifesto

Criar `.cruds/[nome-crud].generated.yaml` após sucesso, com checksum normalizado, data/hora, status, perfis e arquivos gerados.

## Relatório final

Informar:
- CRUDs executados.
- Arquivos criados/alterados.
- Validações executadas.
- Qualquer pendência ou padrão do projeto que exigiu adaptação.

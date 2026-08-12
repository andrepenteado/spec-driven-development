# 00 - Contexto Geral

## Objetivo

Definir regras globais para geração de CRUD.

## Stack

- Backend: Java 25, Spring Boot 4, PostgreSQL, Liquibase, Logback e QueryDSL.
- Frontend: Angular 22, Node 24.18.0, Bootstrap 5, FontAwesome 7, ngx-spinner, ngx-toastr, ngx-mask e ng-select.

## Escopo

- Criar backend: Liquibase, domain, service e resource.
- Criar frontend: rotas, menu, API, domain, service, pesquisa e cadastro.
- Não criar testes.
- Não alterar CRUD já gerado.

## Regras gerais

- Inspecionar o projeto real antes de criar arquivos.
- Seguir padrões existentes de pacotes, nomes, imports, logs, exceptions, layout, menu, loaders e DataTables.
- Usar português do Brasil em mensagens, logs, validações e comentários.
- Mensagens devem usar `tabela.label`, não termos genéricos como "Registro".
- Concordância: labels terminados em "a" usam feminino; demais usam masculino.
- Todo arquivo `.java` ou `.ts` criado deve iniciar com comentário contendo autor, data/hora pt_BR e observação de que foi criado com ajuda da IA.
- Toda classe `.java` criada deve usar Javadoc na classe e nos métodos.
- Preserve código existente e não sobrescreva arquivos não pertencentes ao CRUD.

## Templates Angular

Regras válidas para toda tela gerada; as specs 08 e 09 não as repetem.

- Omitir `<html>`, `<head>`, `<body>`, CDNs e scripts: os arquivos em `.specs/templates` são referência visual executável, não código a copiar literalmente.
- Usar sintaxe moderna de blocos (`@if`, `@for`, `@switch`) em vez das diretivas estruturais antigas (`*ngIf`, `*ngFor`, `*ngSwitch`).
- Preferir classes utilitárias e componentes do Bootstrap 5 para decoração e layout.
- Usar CSS customizado somente quando Bootstrap 5 não atender de forma simples.
- CSS compartilhado criado para CRUDs deve ficar no CSS global do projeto (`frontend/src/styles.css`), nunca referenciar ou importar CSS de `.specs/templates/assets` no código gerado.
- Estilos globais do projeto (`frontend/src/styles.css`) devem ser carregados depois dos CSS de bibliotecas no `angular.json`, para sobrescrever ajustes visuais de Bootstrap, DataTables e ng-select quando necessário.

## Componentes Angular

Regras válidas para todo `@Component` gerado; as specs 08 e 09 não as repetem.

- Declarar sempre `changeDetection: ChangeDetectionStrategy.Eager`. No Angular 22 o padrão passou a ser `OnPush`, e a migração `ng update` carimba `Eager` (equivalente ao antigo `Default`) em todos os componentes existentes justamente para preservar o comportamento. Sem o carimbo, a tela não reflete dados vindos de `subscribe` — e a falha é silenciosa: nenhum erro no console, nenhuma quebra de build, nenhum teste vermelho.
- **Nunca remover esse carimbo de um componente existente durante refactor.** É a única linha que separa a tela de funcionar e de congelar sem aviso.
- Obrigatório inclusive no `AppComponent` raiz da aplicação: `Eager` só age quando a travessia de change detection **alcança** o componente, então uma raiz em `OnPush` congela toda a árvore abaixo dela, mesmo que os filhos declarem `Eager`.
- `changeDetection` é metadado de `@Component` e **não é herdado**: estender `PesquisarBaseComponent`/`CadastroBaseComponent` não traz o carimbo da base — elas são `@Directive()`, que sequer aceita a propriedade. Cada tela declara o seu.
- Não compensar a ausência do carimbo com `detectChanges()` manual espalhado pelos `subscribe`: isso mascara a causa e deixa quebrado tudo que não recebeu a chamada.
- Tratamento global de erros HTTP pertence à lib Angular, via o array `apcoreInterceptors` (que inclui o `httpErrorsInterceptor`). Componentes de CRUD não devem duplicar mensagens ou navegações para erros 400, 401, 403, 404, 409, 422 ou 500; em callbacks de erro, cuidar apenas de estado local, como parar loader.
- Registrar o `HttpClient` em uma **única** chamada de `provideHttpClient()`, acumulando os recursos como argumentos: `provideHttpClient(withXhr(), withInterceptorsFromDi(), withInterceptors(apcoreInterceptors))`. Repetir `provideHttpClient()` na mesma lista de providers duplica a configuração do cliente e torna o resultado dependente da ordem das chamadas.
- A função `provideApcoreHttpInterceptors()` não existe mais: os interceptors viraram funcionais (`HttpInterceptorFn`) e são registrados pelo array `apcoreInterceptors` com `withInterceptors`.

## Logs

- **Nunca logar o objeto inteiro** (`JSON.stringify(entidade)`, `JSON.stringify(form.value)`), no frontend nem no backend: os logs do navegador vão para o Loki via Faro e as entidades carregam dados pessoais (CPF, e-mail, endereço) ou sensíveis (senha). Logar apenas o rótulo da entidade mais um campo identificador (`nome`, `descricao`, `razaoSocial`) ou o ID.
- Formato das mensagens e pontos obrigatórios de log: `11-monitoramento-faro.md`.

## Auditoria

Todo CRUD deve incluir, mesmo ausente no YAML:

| Campo | Coluna | Tipo | Preenchimento |
|---|---|---|---|
| `criadoPor` | `criado_por` | string/VARCHAR | Inclusão |
| `criadoEm` | `criado_em` | datetime/TIMESTAMP | Inclusão |
| `alteradoPor` | `alterado_por` | string/VARCHAR | Alteração |
| `alteradoEm` | `alterado_em` | datetime/TIMESTAMP | Alteração |

Regras:
- Não exibir auditoria no grid nem como controles editáveis.
- No cadastro, exibir auditoria conforme `09-frontend-cadastro.md`.
- Preencher auditoria exclusivamente no service com `SecurityService`.
- O service obtém usuário com `securityService.getUserLogin().getLogin()`, sem fallback.
- Na alteração, preservar criação e preencher alteração.
- Em `tipo: lista`, a auditoria segue `lista.persistencia`: `agregado` não recebe auditoria (ela pertence à raiz do agregado); `independente` recebe, porque o filho é gravado por conta própria.

## Critérios de aceite

- Nenhum arquivo existente de outro CRUD foi sobrescrito.
- Auditoria existe no banco, entidade, TypeScript e service do CRUD, e nas entidades filhas de lista somente quando `persistencia: independente`.
- Resource não participa do preenchimento da auditoria.

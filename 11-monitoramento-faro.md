# 11 - Monitoramento Faro (RUM dos frontends Angular)

Este documento é autossuficiente: contém tudo que é necessário para instrumentar
uma aplicação Angular da APcode com RUM (Real User Monitoring), sem depender de
outro contexto.

## Arquitetura (já provisionada — nada a fazer no cluster)

```
Angular + Faro SDK ──HTTPS──> https://faro.apcode.com.br/collect (Ingress)
                                  └─> Alloy (faro.receiver :12347)
                                        ├─> Loki  (logs, erros, eventos, Web Vitals)
                                        └─> Tempo (traces, via OTLP :4317)
```

- Endpoint de coleta: `https://faro.apcode.com.br/collect`
- Origens já liberadas no CORS do Alloy: `https://sistemas.apcode.com.br` e
  `https://login.apcode.com.br`. Frontend em outra origem exige incluir a origem
  em `cors_allowed_origins` no ConfigMap `alloy` (`k3s/monitor/01-config.yml`).
- O Faro propaga o header `traceparent` nas chamadas HTTP, então o trace do
  navegador e o do Spring Boot são **o mesmo trace** — do clique no Angular até
  o controller e a query no banco.

## Passo a passo na aplicação Angular

A integração é **centralizada na lib `@andre.penteado/ngx-apcore`** (>= 22.0.0),
que exporta `initFaro(config)` e `FaroErrorHandler`
(`projects/ngx-apcore/src/lib/monitoring/faro.ts` no repo apcore). As
aplicações não criam mais `src/app/faro.ts` próprio — apenas consomem a lib.

### 1. Dependências

O SDK do Faro é `peerDependency` da lib, então a aplicação instala ambos:

```bash
npm install @grafana/faro-web-sdk @grafana/faro-web-tracing
```

No `angular.json` (build → options), evitar warnings de CommonJS das
dependências transitivas do Faro:

```json
"allowedCommonJsDependencies": ["@opentelemetry/otlp-transformer", "ua-parser-js"]
```

### 2. Inicializar antes do bootstrap — `src/main.ts`

A inicialização deve ocorrer **antes** do bootstrap do Angular, para capturar
erros e métricas do próprio carregamento. Convenção de nome:
`<sistema>-frontend` (ex.: `portal-frontend`, `roove-frontend`,
`venda-frontend`) — vira o label `app_name` no Loki.

```ts
import { initFaro } from '@andre.penteado/ngx-apcore';
import { environment } from './environments/environment';
import packageJson from '../package.json';

// Antes do bootstrap, para capturar erros e métricas do próprio carregamento
initFaro({
  appName: 'portal-frontend',        // AJUSTAR por aplicação
  appVersion: packageJson.version,
  enabled: environment.production    // sem telemetria em desenvolvimento
});

bootstrapApplication(AppComponent, appConfig);
```

- `enabled: false` desliga tudo (localhost não está no CORS do Alloy e
  poluiria o Loki de produção). Projetos sem `src/environments/` devem criá-lo
  (`environment.ts` com `production: true` + variante de dev com
  `fileReplacements` na configuração de desenvolvimento).
- `import packageJson from '../package.json'` exige
  `"resolveJsonModule": true` no `tsconfig.json` (compilerOptions).
- Padrões embutidos na lib (sobrescrevíveis via `FaroConfig`): collector
  `https://faro.apcode.com.br/collect`, `environment: 'prod'`, propagação de
  `traceparent` para `sistemas.apcode.com.br` e `login.apcode.com.br`,
  `captureConsole: true`, eventos `faro.performance.*` **desligados**
  (`capturePerformance: false` — 1 linha por asset/XHR no Loki; o timing de
  HTTP já existe como span no Tempo, e Web Vitals não dependem disso) e
  filtros de ruído de extensões de navegador.

### 3. ErrorHandler do Angular — obrigatório

O Angular captura exceções de componentes/serviços no seu próprio
`ErrorHandler`; elas **não chegam** ao `window.onerror` que o Faro instrumenta.
Registrar o handler da lib como primeiro provider (no `app.config.ts`
standalone ou direto no `bootstrapApplication`):

```ts
import { FaroErrorHandler } from '@andre.penteado/ngx-apcore';

{ provide: ErrorHandler, useClass: FaroErrorHandler }
```

### 4. Logs das operações de CRUD — obrigatório

Como `captureConsole: true` envia `console.info/warn/error` ao Loki, os
componentes de tela logam as operações com `console.info`, espelhando as
mensagens que os resources do backend já logam com `log.info`. Padrão (ajustar
gênero/plural da entidade):

```ts
// pesquisar (listagem completa)
console.info('Listar todos pacientes');
// pesquisar com filtro
console.info(`Pesquisar produtos com filtro ${JSON.stringify(this.filtro)}`);
// buscar por ID (carregar cadastro)
console.info(`Buscar paciente de ID #${id}`);
// gravar (antes da chamada ao service)
console.info(`${this.modoEdicao ? 'Alterar dados do' : 'Incluir novo'} produto ${JSON.stringify(produto)}`);
// excluir (após a confirmação, antes da chamada)
console.info(`Excluir paciente de ID #${id}`);
```

Em desenvolvimento os logs ficam só no console; em produção chegam ao Loki com
`app_name` e, quando houver trace ativo, correlacionados ao trace do backend.

### 5. Logs e eventos explícitos (opcional)

```ts
import { faro } from '@grafana/faro-web-sdk';

faro.api.pushLog(['pagamento confirmado', pedidoId]);
faro.api.pushEvent('clique_exportar_pdf', { relatorio: 'mensal' });
```

### Checklist de integração

- [ ] `npm install @grafana/faro-web-sdk @grafana/faro-web-tracing` (peers da lib)
- [ ] `@andre.penteado/ngx-apcore` >= 22.0.0
- [ ] `initFaro({appName, appVersion, enabled})` no `main.ts` antes do bootstrap
- [ ] `FaroErrorHandler` registrado como `ErrorHandler`
- [ ] `console.info` nas operações de pesquisar/buscar/gravar/excluir dos componentes
- [ ] Origem do frontend consta no `cors_allowed_origins` do Alloy (apdevops)
- [ ] `resolveJsonModule` no tsconfig e `allowedCommonJsDependencies` no angular.json
- [ ] `src/environments/` existe com flag `production`

## Correlação log ↔ trace no Grafana

Já provisionada por arquivo (ConfigMap `grafana-datasources` em
`k3s/monitor/01-config.yml`) — nada a configurar na UI:

- **Loki → Tempo**: derived field `TraceID` casando o label `traceId` das
  linhas de log. O botão "Tempo" aparece em cada log do navegador com trace.
- **Tempo → Loki**: trace-to-logs com janela de ±2m a partir do span.

Como os dados do navegador chegam no mesmo Loki/Tempo do backend, a correlação
vale igual para os dois.

No Loki, os dados do Faro chegam com labels como `app_name` (nome dado no
`initializeFaro`) e `kind` (`log`, `exception`, `event`, `measurement`).
Exemplos de consulta:

```logql
{app_name="portal-frontend", kind="exception"}          # erros JS
{app_name="portal-frontend"} | session_id="abc123"      # jornada de um usuário
```

O usuário logado é anexado a toda a telemetria pela própria lib (o
`LoginService` chama `faro.api.setUser()` no login, no reload e limpa no
logout — nada a fazer nas aplicações) e vira o label `user` no Loki, o mesmo
label que o backend já grava via MDC. Ou seja, `{user="fulano"}` retorna o
rastro completo do usuário, frontend e backend juntos. O IP existe apenas nos
logs do backend (no texto da linha, via MDC — filtre com `|= "10.42."`); o
navegador não conhece o próprio IP público e o collector não o anexa.

Em `kind="log"` a linha segue o formato do backend, sem o IP —
`<módulo> <usuário> <level> <mensagem>` (ex.: `controle-frontend
andre.penteado info Buscar usuário andre.penteado`): o `loki.process "faro"`
do Alloy move a telemetria (`level`,
`traceId`, `spanId`, `session_id`, `page_url`, `app_version`, `browser_name`)
para **structured metadata** — armazenada por linha, sem indexar (labels aqui
explodiriam a cardinalidade) e filtrável sem parser, como no exemplo da
jornada acima. O `traceId` alimenta o derived field do Grafana
(`matcherType: label`), ligando o log ao trace no Tempo. Os demais kinds
(`event`, `measurement`, `exception`) mantêm a linha logfmt completa — para
eles, use `| logfmt` na consulta.

Volume: os eventos `faro.performance.*` são desligados na origem pela lib
(`capturePerformance: false`, padrão) e os eventos-espelho `faro.tracing.*`
(1 por span de XHR/fetch — duplicam o que o Tempo já tem) são suprimidos no
`beforeSend` da lib, sem afetar o envio dos spans ao Tempo. Como segunda
barreira, o Alloy também descarta ambos antes do Loki (`stage.drop` no
`loki.process "faro"` — apdevops `k3s/monitor/01-config.yml`), cobrindo apps
que ainda não atualizaram a lib. Web Vitals são mantidos. Para ver **apenas os
logs escritos pelo dev**, filtre por `kind="log"`.

## Consultar Web Vitals

Chegam como `kind="measurement"` no Loki (LCP, CLS, INP, TTFB etc.):

```logql
{app_name="portal-frontend", kind="measurement"} | logfmt | ttfb > 0
```

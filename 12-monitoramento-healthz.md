# 12 - Monitoramento Healthz e Observabilidade

Este documento define o padrão de monitoramento on/off e de observabilidade
dos módulos (frontend Angular + backend Spring Boot) implantados no cluster
k3s com o chart `springboot-angular-chart` (>= 1.4.0). O RUM dos frontends
(erros, Web Vitals, traces do navegador) está em
[11-monitoramento-faro.md](11-monitoramento-faro.md).

## Healthz do frontend (nginx)

Cada frontend responde health check direto do nginx, sem passar pelo Angular
(SPA roda no navegador — não existe "endpoint" na aplicação Angular). O
`frontend/nginx.conf` compartilhado tem **duas** locations, antes das demais:

```nginx
# Health check coletado pelo Prometheus do cluster via DNS interno do
# Service (<service>:80/healthz). Fica na RAIZ, fora do context-path
# público, de propósito: o Ingress não roteia /healthz, então só é
# alcançável pela rede interna. Match EXATO é obrigatório para não cair
# no fallback de SPA (HTML quebra o parse do Prometheus). O corpo é uma
# métrica fixa; o sinal de online/offline é o sucesso do scrape (métrica
# `up`), não o valor.
location = /healthz {
    access_log off;
    default_type "text/plain; version=0.0.4";
    return 200 "frontend_up 1\n";
}

# Probe de liveness/readiness do kubelet (o chart prefixa o path com o
# ingress.context, ex.: /portal/healthz).
location = /{{MODULE_NAME}}/healthz {
    access_log off;
    default_type "text/plain; version=0.0.4";
    return 200 "frontend_up 1\n";
}
```

Regras que não podem ser relaxadas:

- `location =` (match exato). Um prefix match cairia no fallback da SPA e
  devolveria o `index.html` — falso positivo clássico: HTTP 200 com HTML que
  quebra o parse do Prometheus.
- Content-type `text/plain; version=0.0.4` (formato de exposição do
  Prometheus) e corpo `frontend_up 1\n`.
- O `/healthz` da raiz fica **fora** do context-path público de propósito: o
  Ingress não roteia `/healthz`, então ele só é alcançável pela rede interna
  do cluster.
- Nenhuma alteração no código Angular é necessária.

Verificação obrigatória na imagem real (não só no arquivo de conf):

```bash
docker build -f frontend/Dockerfile --build-arg MODULE_NAME=<modulo> --build-arg ENV_NAME=<dist> -t healthz-test .
docker run -d --rm -p 8080:80 healthz-test
curl -i http://localhost:8080/healthz            # 200, text/plain; version=0.0.4, frontend_up 1
curl -i http://localhost:8080/<modulo>/healthz   # idem
curl -i http://localhost:8080/<modulo>/rota-spa  # 200 text/html (fallback SPA intacto)
```

## Probes do kubelet (helm values)

No `values.<modulo>-frontend.yaml` (ou `values.frontend.yaml`), dentro de
`app:`:

```yaml
  # Respondido pelo nginx (frontend/nginx.conf); o chart prefixa com ingress.context
  livenessProbe: "/healthz"
  readinessProbe: "/healthz"
```

O chart monta o path final como `<ingress.context>/healthz` (ex.:
`/portal/healthz`) na porta `app.port`. Backends usam os probes padrão do
chart (actuator).

## Coleta on/off pelo Prometheus (dashboard de serviços)

O sinal de online/offline dos módulos é a métrica `up` do scrape do
Prometheus interno do cluster, que raspa os Services via DNS interno
(`<service>.<namespace>.svc:80` com `metrics_path: /healthz` para frontends;
`/actuator/prometheus` para backends). Os jobs de scrape e o dashboard de
serviços online/offline ficam no repo **apdevops** (stack de monitoramento) —
nada a configurar nos repos dos módulos além do healthz acima.

## Observabilidade do backend via DNS interno do cluster

Backends exportam telemetria para a stack de monitoramento (namespace
`monitor`) usando DNS interno do cluster — nunca pela URL pública:

- **Traces → Tempo** (`application.yml`):

  ```yaml
  management:
    tracing:
      export:
        zipkin:
          endpoint: http://tempo.monitor.svc.cluster.local:9411/api/v2/spans
  ```

  O path `/api/v2/spans` faz parte do endpoint — sem ele o export falha.

- **Logs → Loki** (`logback-common.xml`, centralizado no apcore):
  `http://loki.monitor.svc.cluster.local:3100/loki/api/v1/push`.

- **Métricas**: endpoint `/actuator/prometheus` exposto apenas à rede interna
  do cluster (restrito via middleware no Ingress), raspado pelo Prometheus.

- **Actuator fora do trace**: probes e scrapes chegam a cada poucos segundos e
  poluiriam o Tempo. A lib apcore (módulo web) traz
  `br.unesp.fc.andrepenteado.core.web.config.ObservabilityConfig`, um
  `ObservationPredicate` que descarta na origem qualquer observação de request
  `<context-path>/actuator/**` (e as observações filhas, como
  `spring.security`). Cada aplicação precisa listar `ObservabilityConfig.class`
  no `scanBasePackageClasses` do `@SpringBootApplication`, como já faz com
  `CorsConfig`/`SecurityConfig`. Efeito colateral intencional: requests do
  actuator também saem da métrica `http.server.requests` — o sinal de on/off é
  a métrica `up` do scrape, não essa.

  ⚠️ `scanBasePackageClasses` escaneia o **pacote inteiro** da classe, não só
  ela — apontar para o `ObservabilityConfig` do apcore registra também
  `PkceOAuth2ClientConfig` e as demais configs do pacote. Módulos que definem o
  próprio `clientRegistrationRepository` (ex.: Authorization Server com login
  social) **não podem** depender do apcore/web para isso: manter uma cópia
  local da classe no pacote de config do módulo (caso do `login` do apsso).

## Checklist por módulo

- [ ] `frontend/nginx.conf` com as duas locations `= /healthz` e
      `= /{{MODULE_NAME}}/healthz` (antes das demais)
- [ ] `livenessProbe`/`readinessProbe: "/healthz"` nos values do frontend
- [ ] Chart `springboot-angular-chart` >= 1.4.0 no Makefile
- [ ] Zipkin endpoint do backend apontando para
      `tempo.monitor.svc.cluster.local:9411/api/v2/spans`
- [ ] `ObservabilityConfig.class` no `scanBasePackageClasses` da aplicação
      (actuator fora do trace)
- [ ] Healthz verificado com `curl` na imagem construída

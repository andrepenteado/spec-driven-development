# Spec Driven Development

Este repositório mantém uma especificação compartilhada para orientar a geração de código por IA e para documentar os padrões técnicos usados nos projetos que o adotam.

A ideia é concentrar aqui as regras comuns de arquitetura, stack, nomenclatura, geração de CRUDs, padrões de backend, padrões de frontend, validações e critérios de aceite. Assim, cada projeto consumidor pode manter no próprio `README.md` apenas a documentação específica do produto, como problema, objetivo, solução, público-alvo, escopo funcional e decisões de negócio.

## Conceito

Este projeto é baseado no conceito de **Spec-Driven Development (SDD)**.

No SDD, a implementação não parte apenas de prompts soltos ou decisões implícitas da IA. Antes de gerar ou alterar código, a IA deve ler uma especificação versionada, entender as regras do projeto, validar as entradas, reportar o que pretende fazer e só então executar a mudança confirmada pelo desenvolvedor.

Neste repositório, a spec funciona como uma camada de contrato entre:

- o desenvolvedor, que define intenção, padrões e limites;
- a IA, que usa a documentação como instrução principal;
- o projeto consumidor, que recebe código gerado de forma mais consistente;
- novos desenvolvedores, que podem consultar os padrões esperados antes de manter ou criar funcionalidades.

O objetivo não é substituir análise técnica, revisão de código ou testes. O objetivo é reduzir ambiguidade, evitar geração inconsistente e tornar explícitas as decisões que normalmente ficariam espalhadas em conversas, prompts ou código já existente.

## Papel deste repositório

Este repositório deve ser compartilhado entre projetos como uma documentação guia. Ele descreve como a IA deve trabalhar ao gerar código e quais padrões técnicos devem ser respeitados.

Ele pode ser usado para:

- orientar a IA durante geração de CRUDs;
- padronizar backend, frontend, banco de dados, nomenclatura e mensagens;
- registrar a stack técnica usada nos projetos;
- servir como material de onboarding para novos desenvolvedores;
- documentar critérios mínimos de aceite antes de considerar uma geração concluída;
- separar documentação técnica compartilhada da documentação específica de cada produto.

Nos projetos que usam esta spec, a recomendação é manter:

- `README.md` do projeto consumidor: documentação específica do produto, problema, objetivo, solução, público-alvo, execução local e decisões próprias daquele projeto;
- `.specs/` do projeto consumidor: cópia ou referência desta documentação compartilhada, usada como instrução para a IA.

## Stack documentada

A spec atual orienta geração para projetos com:

- Backend: Java 25, Spring Boot 4, PostgreSQL, Liquibase, Logback e QueryDSL.
- Frontend: Angular 21, Node 24, Bootstrap 5, FontAwesome 7, ngx-ui-loader, ngx-toastr, ngx-mask e ng-select.

Essas tecnologias devem ser tratadas como padrão da documentação atual. Se um projeto consumidor divergir, a divergência deve estar documentada no próprio projeto ou refletida em uma variação desta spec.

## Estrutura

- `orquestrador.md`: ponto de entrada para a IA. Define ordem de leitura, validação, confirmação e geração.
- `00-contexto-geral.md`: regras globais, stack, escopo, auditoria e critérios gerais.
- `01-yaml-contrato.md`: contrato esperado para os YAMLs de CRUD.
- `02-backend-liquibase.md`: regras para changelogs e banco de dados.
- `03-backend-domain.md`: regras para entidades de domínio.
- `04-backend-service.md`: regras para services.
- `05-backend-resource.md`: regras para resources/controllers.
- `06-frontend-rotas-menu-api.md`: regras de rotas, menu e APIs no frontend.
- `07-frontend-domain-service.md`: regras de domain e service no frontend.
- `08-frontend-pesquisar.md`: regras para tela de pesquisa.
- `09-frontend-cadastro.md`: regras para tela de cadastro.
- `10-checklist-final.md`: checklist de validação final.
- `templates/`: referências visuais executáveis para telas.
- `.cruds/`: pasta do projeto consumidor para YAMLs operacionais de CRUD. Ela fica fora de `.specs/` para não misturar dados do projeto consumidor com a spec compartilhada.

Em projetos consumidores, esses arquivos normalmente ficam sob `.specs/`.

## Instalação no projeto consumidor com Git Subtree

Como este repositório também é um repositório Git, a forma recomendada de incorporá-lo em outro projeto Git é usando `git subtree`.

Com `git subtree`, o projeto consumidor recebe uma cópia versionada da spec dentro de uma pasta do próprio repositório, normalmente `.specs/`, sem transformar o projeto consumidor em submódulo e sem exigir clone separado para quem for trabalhar no projeto.

### Pré-requisitos

Execute os comandos abaixo dentro do repositório do projeto consumidor.

Antes de importar a spec, garanta que o working tree esteja limpo:

```bash
git status
```

Se houver mudanças pendentes, faça commit ou stash antes de continuar.

Também confirme que a pasta `.specs/` ainda não existe no projeto consumidor. O `git subtree add` espera criar o prefixo informado.

```bash
ls .specs
```

Se a pasta já existir por cópia manual anterior, resolva isso antes de usar `git subtree`: remova a cópia manual em uma branch própria ou migre seu conteúdo com cuidado. YAMLs operacionais de CRUD devem ficar em `.cruds/`, não dentro de `.specs/`.

### 1. Adicionar o repositório da spec como remote

```bash
git remote add spec-driven-development git@github.com:andrepenteado/spec-driven-development.git
git fetch spec-driven-development
```

Se o remote já existir e você precisar corrigir a URL:

```bash
git remote set-url spec-driven-development git@github.com:andrepenteado/spec-driven-development.git
git fetch spec-driven-development
```

### 2. Incorporar a spec em `.specs/`

Use `main` se a branch principal deste repositório for `main`. Se for `master` ou outra branch, ajuste o comando.

```bash
git subtree add --prefix=.specs spec-driven-development main --squash
```

Esse comando cria a pasta `.specs/` no projeto consumidor com o conteúdo deste repositório.

Depois disso, confirme o estado do repositório. Em geral, `git subtree add` já cria um commit no projeto consumidor.

```bash
git status
```

### 3. Atualizar a spec no projeto consumidor

Quando este repositório de specs receber mudanças, atualize o projeto consumidor com:

```bash
git fetch spec-driven-development
git subtree pull --prefix=.specs spec-driven-development main --squash
```

Depois, revise as mudanças e rode as validações normais do projeto consumidor.

### 4. Criar a pasta operacional de CRUDs

Os YAMLs de CRUD do projeto consumidor não devem ficar dentro de `.specs/`, porque essa pasta é controlada pelo subtree da spec compartilhada.

Crie uma pasta `.cruds/` na raiz do projeto consumidor:

```bash
mkdir .cruds
```

Use essa pasta para os YAMLs de entrada e para os manifestos gerados:

```text
.cruds/marca.yaml
.cruds/marca.generated.yaml
```

### 5. Enviar mudanças para o repositório de specs

Por padrão, **não altere os arquivos compartilhados da spec diretamente no projeto consumidor**.

Se uma mudança na spec for necessária, prefira alterar este repositório diretamente, revisar, versionar e depois atualizar os projetos consumidores com `git subtree pull`.

Se, excepcionalmente, uma mudança for feita dentro de `.specs/` no projeto consumidor e precisar voltar para este repositório, use:

```bash
git subtree push --prefix=.specs spec-driven-development main
```

Use esse fluxo com cuidado. Antes de executar `subtree push`, revise se a pasta `.specs/` contém somente mudanças que realmente pertencem à spec compartilhada.

## Regras para projetos consumidores

- Não editar localmente os arquivos compartilhados da spec em `.specs/*.md` e `.specs/templates/`.
- Não adaptar a spec silenciosamente em um único projeto consumidor; mudanças de padrão devem nascer neste repositório.
- Atualizar a spec nos projetos consumidores com `git subtree pull`, não copiando arquivos manualmente.
- Manter a documentação específica do produto no `README.md` do projeto consumidor.
- Usar `.cruds/*.yaml` para os YAMLs operacionais do projeto consumidor, quando a geração de CRUD for necessária.
- Tratar `.cruds/*.generated.yaml` como manifesto daquilo que já foi gerado.
- Não colocar YAMLs operacionais em `.specs/`, porque essa pasta pertence ao subtree da spec compartilhada.
- Antes de atualizar a spec via subtree, garantir que não existam edições locais conflitantes dentro de `.specs/`.
- Se um projeto consumidor precisar divergir da spec, documentar a exceção no próprio projeto e avaliar se a regra deveria virar uma variação oficial deste repositório.

## Como usar em um projeto consumidor

1. Disponibilize esta documentação no projeto consumidor, preferencialmente em `.specs/`.
2. Crie os YAMLs de CRUD em `.cruds/[nome-crud].yaml`.
3. Peça para a IA ler e seguir `.specs/orquestrador.md`.
4. A IA deve validar os YAMLs e informar status.
5. O desenvolvedor confirma explicitamente quais CRUDs executar.
6. A IA gera backend e frontend seguindo as specs.
7. A IA cria `.cruds/[nome-crud].generated.yaml` após sucesso.
8. A IA informa arquivos criados ou alterados e validações executadas.

## Prompt recomendado

Para executar a leitura geral dos CRUDs pendentes:

```text
Leia e siga .specs/orquestrador.md como instrução principal para gerar CRUDs.
Os YAMLs de entrada estão em .cruds/.
Valide, reporte status e aguarde confirmação antes de alterar código.
```

Para um YAML específico:

```text
Leia e siga .specs/orquestrador.md.
Use o YAML .cruds/marca.yaml.
Valide primeiro, apresente o status e aguarde confirmação antes de criar arquivos.
```

Depois do relatório da IA, confirme explicitamente:

```text
Execute o CRUD marca.
```

## Fluxo esperado da IA

1. Ler `orquestrador.md`.
2. Ler as specs na ordem obrigatória.
3. Escanear `.cruds/*.yaml`, ignorando `*.generated.yaml`.
4. Validar cada YAML conforme o contrato.
5. Inspecionar o projeto real antes de criar arquivos.
6. Apresentar relatório com status: `novo`, `existente`, `conflito` ou `invalido`.
7. Aguardar confirmação explícita do desenvolvedor.
8. Gerar backend e frontend conforme as specs.
9. Criar o manifesto `.generated.yaml` somente após sucesso.
10. Informar arquivos alterados e validações executadas.

## Regras importantes

- As specs desta pasta prevalecem sobre inferências genéricas da IA.
- Padrões reais do projeto consumidor prevalecem sobre exemplos, desde que não violem os critérios de aceite.
- A IA deve inspecionar o projeto real antes de gerar arquivos.
- A IA não deve sobrescrever CRUD já gerado.
- A IA não deve alterar arquivos não pertencentes ao CRUD solicitado.
- YAMLs já executados devem ter o respectivo `.generated.yaml`.
- Templates em `.specs/templates` são referências visuais executáveis. Ao gerar Angular, a IA deve omitir `<html>`, `<head>`, `<body>`, CDNs e scripts.

## Observações

Evite pedir apenas:

```text
Execute orquestrador.md
```

Esse pedido pode ser interpretado como leitura simples ou resumo do arquivo.

Prefira:

```text
Leia e siga .specs/orquestrador.md como instrução principal.
```

Essa formulação deixa claro que o arquivo deve ser usado como regra de execução, não apenas como conteúdo de referência.

# HELP - Como Usar as Specs de CRUD

## Objetivo

Esta pasta contém specs para orientar uma IA a gerar CRUDs a partir de YAMLs em `.specs/cruds`.

Use `.specs/orquestrador.md` como ponto de entrada. Ele define a ordem de leitura, validação, confirmação e geração.

## Como pedir para a IA gerar um CRUD

Prompt recomendado:

```text
Leia e siga .specs/orquestrador.md como instrução principal para gerar CRUDs.
Os YAMLs de entrada estão em .specs/cruds/.
Valide, reporte status e aguarde confirmação antes de alterar código.
```

Para um YAML específico:

```text
Leia e siga .specs/orquestrador.md.
Use o YAML .specs/cruds/marca.yaml.
Valide primeiro, apresente o status e aguarde confirmação antes de criar arquivos.
```

Depois do relatório da IA, confirme explicitamente:

```text
Execute o CRUD marca.
```

## Fluxo esperado

1. Criar o YAML em `.specs/cruds/[nome-crud].yaml`.
2. Pedir para a IA ler e seguir `.specs/orquestrador.md`.
3. A IA deve validar os YAMLs e informar status.
4. O programador confirma quais CRUDs executar.
5. A IA gera backend e frontend seguindo as specs.
6. A IA cria `.specs/cruds/[nome-crud].generated.yaml` após sucesso.
7. A IA informa arquivos criados/alterados e validações executadas.

## Observações

- Evite pedir apenas `Execute orquestrador.md`; isso pode ser interpretado como resumo ou leitura simples.
- Prefira: `Leia e siga .specs/orquestrador.md como instrução principal`.
- Os templates em `.specs/templates` são exemplos visuais executáveis. Ao gerar Angular, a IA deve omitir `<html>`, `<head>`, `<body>`, CDNs e scripts.
- Não coloque YAMLs já executados sem o respectivo `.generated.yaml`; isso pode causar conflito.

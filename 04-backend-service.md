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
- Auditoria usa `SecurityService.getUserLogin().getLogin()`, sem fallback.
- Pesquisa usa `repository.findAll(filtro.toPredicate())` ou padrão QueryDSL equivalente.
- Logs devem usar `tabela.label`.

## Critérios de aceite

- Auditoria é preenchida no service.
- Pesquisa aceita múltiplos filtros simultâneos.
- Métodos estão protegidos pelos perfis.
- Mensagens usam label do YAML.

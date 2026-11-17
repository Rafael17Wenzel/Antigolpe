# Sprint 03 — PostgreSQL e regionalidade

## Objetivo
Persistir dados e incorporar região UF à vaga e aos tokens.

## Pré-requisitos
Ler `CLAUDE.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/ACCESSIBILITY.md`, `docs/DECISIONS.md` e `docs/PROGRESS.md`. Verificar conclusão/aprovação da sprint anterior.

## Tarefas
- [ ] Criar migrations Flyway para região, vaga, token, cursos e associações, preservando modelo histórico quando possível.
- [ ] Migrar repositórios em memória para JPA/PostgreSQL com seeds fictícios apenas em perfil demo/dev.
- [ ] Definir formato regional de token, geração segura, unicidade, expiração e revogação.
- [ ] Implementar lookup por hash/HMAC e associação token -> vaga -> região.
- [ ] Adicionar constraints, índices e testes Testcontainers.
- [ ] Definir política para vagas remotas e tokens legados; registrar decisão.

## Critérios de aceite
- [ ] Banco vazio sobe com migrations sem intervenção manual.
- [ ] Token válido retorna UF correta do banco; prefixo divergente não confirma.
- [ ] Seeds demo não aparecem em produção sem configuração explícita.
- [ ] Testes de constraints, validade e concorrência relevantes passam.

## Limite de escopo
Não prometer que prefixo regional ou domínio confirma autenticidade.

## Entrega obrigatória ao usuário
Resumo de mudanças, arquivos alterados, comandos e resultados reais de testes, evidências de aceite, riscos/bloqueios, instruções de execução e atualização de `docs/PROGRESS.md`. Parar e aguardar aprovação.

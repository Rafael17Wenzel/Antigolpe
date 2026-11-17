# Sprint 08 — Hardening e testes end-to-end

## Objetivo
Consolidar segurança, confiabilidade e qualidade.

## Pré-requisitos
Ler `CLAUDE.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/ACCESSIBILITY.md`, `docs/DECISIONS.md` e `docs/PROGRESS.md`. Verificar conclusão/aprovação da sprint anterior.

## Tarefas
- [ ] Implementar/validar rate limiting, validação de entrada, proteção contra enumeração e logs sem token.
- [ ] Revisar tratamento de URLs sem fetch remoto e sanitização de textos exibidos.
- [ ] Criar testes e2e para token confirmado, não confirmado, denúncia, sugestões e simulador.
- [ ] Verificar dependências, CORS, headers, segredos, health checks e acessibilidade.
- [ ] Definir métricas de observabilidade sem dados sensíveis.

## Critérios de aceite
- [ ] Pipeline de testes passa em ambiente reproduzível.
- [ ] Sem vazamento de tokens/PII em logs ou erros.
- [ ] Cenários críticos documentados com evidências.

## Limite de escopo
Não adicionar integrações externas fora do escopo.

## Entrega obrigatória ao usuário
Resumo de mudanças, arquivos alterados, comandos e resultados reais de testes, evidências de aceite, riscos/bloqueios, instruções de execução e atualização de `docs/PROGRESS.md`. Parar e aguardar aprovação.

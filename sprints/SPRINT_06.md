# Sprint 06 — Sugestões regionais discretas

## Objetivo
Oferecer oportunidades elegíveis após consulta não confirmada.

## Pré-requisitos
Ler `CLAUDE.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/ACCESSIBILITY.md`, `docs/DECISIONS.md` e `docs/PROGRESS.md`. Verificar conclusão/aprovação da sprint anterior.

## Tarefas
- [ ] Implementar busca de vagas publicadas/ativas por UF/cidade escolhida, com fallback definido.
- [ ] Exigir fonte cadastrada e critérios de elegibilidade; não usar apenas prefixo de token.
- [ ] Exibir bloco opcional depois da orientação e denúncia, inicialmente até três resultados.
- [ ] Oferecer seleção manual de região e opção de ocultar; sem GPS por padrão.
- [ ] Testar ausência de vagas, região desconhecida, vagas encerradas, remotas e acessibilidade.

## Critérios de aceite
- [ ] Não há recomendação de vagas inativas ou fictícias como se fossem reais.
- [ ] O bloco não bloqueia denúncia nem induz a clicar em links suspeitos.
- [ ] Usuário pode usar a função sem informar localização.

## Limite de escopo
Geolocalização automática por IP fica em backlog condicionado a análise de privacidade.

## Entrega obrigatória ao usuário
Resumo de mudanças, arquivos alterados, comandos e resultados reais de testes, evidências de aceite, riscos/bloqueios, instruções de execução e atualização de `docs/PROGRESS.md`. Parar e aguardar aprovação.

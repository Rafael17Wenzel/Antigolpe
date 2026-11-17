# Sprint 09 — Deploy Render

## Objetivo
Publicar ambiente demonstrativo reproduzível no Render.

## Pré-requisitos
Ler `CLAUDE.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/ACCESSIBILITY.md`, `docs/DECISIONS.md` e `docs/PROGRESS.md`. Verificar conclusão/aprovação da sprint anterior.

## Tarefas
- [ ] Criar `render.yaml` blueprint somente após confirmar configuração atual suportada.
- [ ] Configurar serviço backend Java, frontend estático e PostgreSQL com variáveis/segredos.
- [ ] Preparar build, health check, migrations, CORS e profiles para produção.
- [ ] Documentar custo/plano e limitações conforme painel/documentação atual, sem presumir gratuito.
- [ ] Executar smoke tests de frontend/API/banco após deploy e registrar URLs sem segredos.
- [ ] Criar plano de rollback e política de backup compatível com o plano contratado.

## Critérios de aceite
- [ ] Backend e frontend respondem via HTTPS e banco persiste entre reinícios.
- [ ] CORS aceita somente origens permitidas.
- [ ] Health checks e migrations funcionam.
- [ ] Sem seeds de vagas fictícias apresentadas como reais em produção.

## Limite de escopo
Não executar deploy ou criar recursos pagos sem aprovação explícita.

## Entrega obrigatória ao usuário
Resumo de mudanças, arquivos alterados, comandos e resultados reais de testes, evidências de aceite, riscos/bloqueios, instruções de execução e atualização de `docs/PROGRESS.md`. Parar e aguardar aprovação.

# Sprint 01 — Estabilização e contrato

## Objetivo
Garantir backend/frontend locais compilando e fixar contrato de API.

## Pré-requisitos
Ler `CLAUDE.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/ACCESSIBILITY.md`, `docs/DECISIONS.md` e `docs/PROGRESS.md`. Verificar conclusão/aprovação da sprint anterior.

## Tarefas
- [ ] Corrigir apenas bloqueios de compilação/integração detectados na Sprint 00.
- [ ] Centralizar configuração de API, CORS, erros e variáveis de ambiente.
- [ ] Criar testes de fumaça para inicialização e endpoint de saúde.
- [ ] Reconciliar `contracts/api.yaml` com DTOs reais e registrar compatibilidade.
- [ ] Criar `.env.example` sem segredos e instruções de execução local.

## Critérios de aceite
- [ ] Backend sobe com Java 21 e frontend compila.
- [ ] Fluxo de teste básico funciona sem depender exclusivamente de mock.
- [ ] Nenhum segredo incluído em arquivos versionados.

## Limite de escopo
Não iniciar migração de banco nem WhatsApp.

## Entrega obrigatória ao usuário
Resumo de mudanças, arquivos alterados, comandos e resultados reais de testes, evidências de aceite, riscos/bloqueios, instruções de execução e atualização de `docs/PROGRESS.md`. Parar e aguardar aprovação.

# Sprint 07 — Simulador de WhatsApp e OCR

## Objetivo
Criar experiência demonstrativa sem integração WhatsApp real.

## Pré-requisitos
Ler `CLAUDE.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/ACCESSIBILITY.md`, `docs/DECISIONS.md` e `docs/PROGRESS.md`. Verificar conclusão/aprovação da sprint anterior.

## Tarefas
- [ ] Isolar simulador React do site, reutilizando design system e API de validação.
- [ ] Permitir colar/encaminhar texto e anexar imagem/print com preview e remoção.
- [ ] Extrair token de texto por parser e de imagem por OCR experimental no cliente.
- [ ] Exibir token extraído para revisão/edição antes de enviar à API.
- [ ] Mostrar resposta contextual com cargo/região, ou orientação e denúncia; preservar acessibilidade.
- [ ] Adicionar limites de arquivo, tipos aceitos, erros e aviso de simulação.

## Critérios de aceite
- [ ] Texto e imagem seguem o mesmo fluxo de validação backend.
- [ ] OCR incorreto pode ser corrigido; ausência de token não é confirmada como fraude.
- [ ] Nenhum dado é enviado ao WhatsApp; não há alegação de IA real sem integração.
- [ ] Fluxos funcionam por teclado e alto contraste.

## Limite de escopo
Não integrar WhatsApp Business API, IA multimodal paga nem salvar prints por padrão.

## Entrega obrigatória ao usuário
Resumo de mudanças, arquivos alterados, comandos e resultados reais de testes, evidências de aceite, riscos/bloqueios, instruções de execução e atualização de `docs/PROGRESS.md`. Parar e aguardar aprovação.

# Sprint 05 — Denúncias e histórico

## Objetivo
Persistir consultas e denúncias com privacidade.

## Pré-requisitos
Ler `CLAUDE.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/ACCESSIBILITY.md`, `docs/DECISIONS.md` e `docs/PROGRESS.md`. Verificar conclusão/aprovação da sprint anterior.

## Tarefas
- [ ] Criar tabela `validacao` com resultado, timestamps e referências opcionais; não armazenar token cru.
- [ ] Persistir denúncias com protocolo opaco, contato opcional e referências opcionais.
- [ ] Implementar formulário e retorno acessível, com tratamento de erros.
- [ ] Definir aviso de privacidade, retenção e controle de acesso para consulta de denúncias.
- [ ] Adicionar testes de persistência, entradas inválidas e indisponibilidade.

## Critérios de aceite
- [ ] Denúncia de vaga desconhecida funciona sem FK obrigatória.
- [ ] Protocolo retornado e histórico armazenado sem segredos.
- [ ] Falha de backend não gera denúncia ficticiamente bem-sucedida.

## Limite de escopo
Sem envio real a SIEM ou equipe Bradesco.

## Entrega obrigatória ao usuário
Resumo de mudanças, arquivos alterados, comandos e resultados reais de testes, evidências de aceite, riscos/bloqueios, instruções de execução e atualização de `docs/PROGRESS.md`. Parar e aguardar aprovação.

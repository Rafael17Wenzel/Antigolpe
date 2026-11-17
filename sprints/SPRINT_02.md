# Sprint 02 — Token identifica vaga automaticamente

## Objetivo
Remover seletor de cargo e consultar vaga por token/link.

## Pré-requisitos
Ler `CLAUDE.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/ACCESSIBILITY.md`, `docs/DECISIONS.md` e `docs/PROGRESS.md`. Verificar conclusão/aprovação da sprint anterior.

## Tarefas
- [ ] Remover seletor de cargo do formulário React e textos antigos.
- [ ] Modificar DTO/serviço para receber somente `tokenOuLink`; manter endpoint existente.
- [ ] Fazer lookup backend e retornar cargo da vaga vinculada ao token.
- [ ] Tratar token desconhecido, expirado, revogado e serviço indisponível com mensagens responsáveis.
- [ ] Atualizar cursos para depender da vaga retornada, não de seleção local.
- [ ] Testar input vazio, token válido, desconhecido, vinculado a outra vaga, link e erros.

## Critérios de aceite
- [ ] Usuário valida sem escolher cargo.
- [ ] Cargo exibido vem exclusivamente do backend.
- [ ] Token não encontrado não é declarado automaticamente fraude.
- [ ] Testes unitários e integração relevantes passam.

## Limite de escopo
Não inferir vaga a partir do prefixo ou do texto da mensagem.

## Entrega obrigatória ao usuário
Resumo de mudanças, arquivos alterados, comandos e resultados reais de testes, evidências de aceite, riscos/bloqueios, instruções de execução e atualização de `docs/PROGRESS.md`. Parar e aguardar aprovação.

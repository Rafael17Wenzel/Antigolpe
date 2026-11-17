# Backlog pós-MVP

Itens fora do escopo do protótipo. Nenhum deve ser iniciado sem autorização formal (incluindo, quando
for o caso, autorização da instituição para uso de marca e integração).

| # | Item | Valor | Pré-requisitos e governança | Riscos |
|---|---|---|---|---|
| 1 | **WhatsApp Business API** (canal real de verificação) | Validar no canal onde o golpe acontece | Conta oficial verificada da instituição; termos da Meta; base legal LGPD para tratar mensagens; não armazenar conteúdo por padrão | Custo por conversa; uso indevido da marca; dados de terceiros nas mensagens |
| 2 | **IA multimodal** para ler prints e sinais de golpe | OCR mais robusto e explicação de sinais de alerta | Avaliação de precisão com conjunto rotulado; IA **nunca** decide validade (regra: só o backend confirma pelo cadastro); revisão humana mantida; contrato de tratamento de dados com o provedor | Alucinação; vazamento de imagens; custo |
| 3 | **Integração com ATS** (emissão de tokens na publicação da vaga) | Tokens reais e atualizados automaticamente | API oficial do ATS; autenticação serviço-a-serviço; rotação da chave HMAC com versão de chave | Dependência de sistema externo; sincronização de vagas encerradas |
| 4 | **Localização aproximada com governança** (por IP, opcional) | Sugestões regionais sem a pessoa escolher a UF | Relatório de impacto (LGPD), consentimento explícito, granularidade só de UF, sem armazenamento do IP, opção de recusar | Imprecisão (VPN/operadora); percepção de vigilância |
| 5 | Área administrativa autenticada | Cadastrar vagas/tokens, revogar, tratar denúncias | SSO/MFA, perfis de acesso, trilha de auditoria | Superfície de ataque maior |
| 6 | Encaminhamento de denúncias a um canal oficial | Denúncia útil fora do protótipo | Acordo com a área de segurança da instituição; SIEM/ticket | Volume e triagem |
| 7 | Limite de requisições distribuído (Redis/Key Value) | Várias instâncias da API | Armazenamento compartilhado | Custo |
| 8 | Exportação de métricas (Prometheus autenticado) e alertas | Operação | Endpoint protegido; painel | Exposição indevida se mal configurado |
| 9 | Migração para Tailwind 4 | Eliminar alertas `picomatch` de build | Refatorar configuração de tema | Regressão visual (cobrir com E2E/axe) |
| 10 | Testes manuais com leitores de tela e usuários reais | Acessibilidade comprovada | Roteiro de teste e participantes | — |
| 11 | Vagas em várias regiões (`vaga_regiao`) | Vagas multirregionais | Migration aditiva | — |

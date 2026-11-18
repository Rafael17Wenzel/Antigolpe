# Evidências de segurança (Sprint 08)

Cenários críticos e o teste que os comprova. Execução: `mvn test` (backend) e `npx playwright test` (frontend).

| # | Cenário | Comportamento | Evidência |
|---|---|---|---|
| 1 | Token cadastrado e vigente | `CONFIRMADO` + aviso "não garante" | `ValidacaoApiTest`, `acessibilidade.spec.js`, `chat.spec.js` |
| 2 | Token inexistente, expirado, revogado, vaga encerrada, região trocada | Mesma resposta `NAO_CONFIRMADO` (anti-enumeração); nunca "golpe" | `ValidacaoApiTest`, `PersistenciaTokenTest` |
| 3 | Texto/link sem token | `NAO_CONFIRMADO` com mensagem própria; link nunca acessado | `ValidacaoApiTest`, `TokenExtractorTest` |
| 4 | Falha de banco | `503` "não indica golpe"; front sem resultado negativo | `IndisponibilidadeTest`, `chat.spec.js` |
| 5 | Muitas consultas do mesmo cliente | `429` + `Retry-After`, com CORS; outro cliente não é afetado; preflight não consome | `SegurancaTest`, `seguranca.spec.js`, teste manual com o jar (abaixo) |
| 6 | Corpo enorme | `413` antes de ler | `SegurancaTest`, teste manual |
| 7 | JSON malformado com token | `400` sem eco do valor | `SegurancaTest`, `seguranca.spec.js` |
| 8 | Token em logs (mensagem ou stack trace) | Mascarado `BRD-BR-SP-************8NWD` | `SegurancaTest.logsNuncaContemTokenCompleto` |
| 9 | Token em denúncia | Guardado mascarado | `SegurancaTest.denunciaGuardaTokenMascarado` |
| 10 | Token armazenado | **Texto puro** desde a Sprint 11 (D056, a pedido do projeto): visível ao RH; quem acessa o banco vê os tokens | `PersistenciaTokenTest` |
| 18 | Área do RH | JWT HS256 (8 h, só `HS256`, assinatura em tempo constante), 401 sem token, adulterado ou `alg: none`; login com limite de 5/min | `AdminApiTest`, `SegurancaTest`, `rh.spec.js` |
| 11 | HTML/script digitado | Exibido como texto (React escapa; sem `dangerouslySetInnerHTML`) | `seguranca.spec.js` |
| 12 | Cabeçalhos | nosniff, DENY, no-referrer, CSP, no-store; HSTS em HTTPS | `SegurancaTest`, `seguranca.spec.js` |
| 13 | Produção sem segredo/banco | Não sobe | `PersistenciaTokenTest`, `DemoDesligadoTest` |
| 14 | Exemplos/dados fictícios em produção | Desligados (404) | `DemoDesligadoTest` |
| 15 | Imagem do simulador | Sem aceite: não sai do navegador (OCR local). Com aceite: vai ao Gemini pelo backend, só em memória, sem log; resposta só aceita no formato de token; instruções escritas na imagem são ignoradas | `chat.spec.js`, `LeituraImagemTest` |
| 19 | Chave do Gemini | Só no backend (`GEMINI_API_KEY`), enviada em cabeçalho (nunca na URL), ausente de logs e respostas; limite de 5 envios/min | `LeituraImagemTest`, `LeituraImagemSemChaveTest` |
| 16 | Geolocalização | Nunca solicitada | `sugestoes.spec.js`, `chat.spec.js` |
| 17 | Métricas | Sem token, e-mail ou URL nas etiquetas | `SegurancaTest.metricasContamResultadosSemDadosSensiveis` |

## Teste manual com o jar (2026-11-17)

```
SPRING_PROFILES_ACTIVE=h2 PORT=8081 LIMITE_VALIDACAO_POR_MINUTO=3 java -jar target/antigolpe-0.0.1-SNAPSHOT.jar
4 POSTs seguidos → 200, 200, 200, 429 (Retry-After: 60)
POST de 40 KB → 413
grep do token nos logs → 0 ocorrências
```

## Dependências

- `npm audit --omit=dev` → **0** vulnerabilidades (o que vai para o navegador).
- `npm audit` (inclui dev) → 12 altas, todas `picomatch` (ReDoS) em Tailwind 3/Vite, usadas só no build com padrões
  definidos pelo projeto. Correção exige Tailwind 4: risco aceito (D048).
- Backend: Spring Boot 4.1.2, PostgreSQL JDBC e H2 nas versões gerenciadas pelo Boot. A verificação OWASP
  Dependency-Check não roda no ambiente do assistente (sem acesso à base NVD); recomendada no CI pós-MVP.

## CORS e segredos

- CORS só em `/api/**`, origens por `CORS_ALLOWED_ORIGINS`, métodos GET/POST/OPTIONS.
- Nenhum segredo no repositório (`.env.example` sem valores); `frontend/.env` deve sair do índice do git
  (`git rm --cached frontend/.env`, pendente do usuário).

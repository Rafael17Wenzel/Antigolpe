# Arquitetura alvo

Monólito modular Spring Boot 4 + React 19 SPA + PostgreSQL. Módulos backend: `vagas`, `tokens`, `validacoes`, `denuncias`, `cursos`, `recomendacoes`, `regioes`, `admin` (admin apenas quando autorizado). Camadas Controller -> Service -> Repository; DTOs para APIs; regras no service; entidades JPA isoladas da API. Flyway para migrações. Java 21.

Frontend: componentes `TokenValidationForm`, `ValidationResult`, `ReportForm`, `CourseRecommendations`, `RegionalSuggestions`, `AccessibilityToolbar`, `WhatsAppSimulator`, `ImageTokenReview`; serviços API centralizados; tokens de design Tailwind/CSS.

Fluxo: input texto/link/imagem -> extração local de candidato (se imagem, OCR experimental) -> revisão do token -> POST `/api/vagas/validar` -> service consulta token armazenado de forma segura, associa vaga/região -> resultado seguro -> cursos/denúncia/sugestões opcionais.

Persistência mínima: `regiao`, `vaga`, `token`, `validacao` (metadados sem token cru), `denuncia`, `categoria`, `curso`, `vaga_curso`, `trilha`, `trilha_curso`. Se vaga multirregional, `vaga_regiao` na evolução. Definir migrations e constraints antes de implementar.

Tokens: prefixo público parseável para UX, sufixo aleatório de alta entropia; armazenar hash determinístico com chave/HMAC para lookup (segredo em env), nunca armazenar token em claro em logs. Planejar rotação/compatibilidade. Evitar que mensagens públicas exponham se um token específico existe quando isso causar enumeração; rate limiting por IP/identificador pseudonimizado.

API: manter endpoint histórico `POST /api/vagas/validar` se possível, com DTO `{ "tokenOuLink": "..." }`, sem `cargo`. Validar strings, tamanho e formato; não fazer fetch de links recebidos. Criar endpoints de recomendações somente se necessários. Contrato formal em `contracts/api.yaml`.

Deploy Render: web service backend e static site frontend (ou alternativa justificada); banco PostgreSQL gerenciado; variáveis `DATABASE_URL`/JDBC derivadas de configuração segura, `PORT`, `CORS_ALLOWED_ORIGINS`, segredo HMAC, profiles e URLs frontend; `/actuator/health` com exposição restrita e verificações adequadas. Atenção a configurações/plano/versões atuais do Render: verificar no momento de configurar, não presumir limites gratuitos.

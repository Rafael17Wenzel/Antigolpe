# Progresso por sprint

Status inicial: NÃO AUDITADO. O checkpoint descreve funcionalidades existentes, mas o repositório atual precisa ser inspecionado.

Para cada sprint preencher:
- Data e branch/commit:
- Escopo e arquivos:
- Migrações:
- Testes executados e resultados:
- Evidências de aceite:
- Pendências, riscos e bloqueios:
- Próxima ação:

---

## Sprint 00 — Auditoria do repositório

**Status: CONCLUÍDA COM BLOQUEIO PARCIAL. Aprovada pelo usuário em 2026-11-17.**

- **Data e branch/commit:** 2026-11-17, `main` @ `e492c8f` (auditado com working tree limpo).
- **Escopo e arquivos:**
  - Inventário e baseline; nenhuma lógica de negócio alterada.
  - Arquivos adicionados: pacote de instruções (`CLAUDE.md`, `contracts/api.yaml`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/ACCESSIBILITY.md`, `docs/DECISIONS.md`, `docs/DESIGN_SYSTEM.md`, `sprints/`, `templates/`) e `docs/AUDIT.md`.
  - O `README.md` do pacote **não** foi copiado, para preservar o README do projeto.
- **Migrações:** nenhuma (não existe banco).
- **Testes executados e resultados:**
  - Frontend:
    - `npm ci`, `npm run lint` e `npm run build`: OK.
    - `npm test`: inexistente.
    - `npm audit --omit=dev`: 0 vulnerabilidades.
    - `npm audit`: 2 vulnerabilidades em dev (picomatch alta, minimatch moderada).
  - Backend:
    - `./mvnw test`: **BLOQUEADO** (Maven Central recusado pelo proxy; VM local com Java 11).
    - Compilação com stubs (JDK 21): OK.
    - Harness da lógica dos controllers, sem Spring: 16/16 PASS.
  - Detalhes e comandos em `docs/AUDIT.md`, seção 3.
- **Evidências de aceite:**
  - O relatório identifica o que funciona, o que é mock e o que está bloqueado (`docs/AUDIT.md`, seção 4).
  - O baseline de testes está documentado com resultados e próximos passos (seções 3 e 7).
- **Pendências, riscos e bloqueios:**
  - Rodar `./mvnw -B test` em máquina com Java 21 e acesso ao Maven Central.
  - CORS fixo em `https://antigolpe-1.onrender.com` quebra o desenvolvimento local.
  - Exposição de token válido (`/api/vagas/exemplos`), mensagem que permite enumeração e token devolvido em claro.
  - Sem rate limiting, health check nem testes de frontend.
  - Alto contraste via `filter` global; modal sem gestão de foco.
  - Telefones reais e login Agência/Conta simulado podem sugerir canal oficial.
- **Próxima ação:** aguardar aprovação para iniciar a Sprint 01 (estabilização).

---

## Sprint 01 — Estabilização e contrato

**Status: CONCLUÍDA (2026-11-17).**

- **Data e branch/commit:** 2026-11-17, `main` @ `e492c8f` + alterações não commitadas.
- **Escopo e arquivos:**
  - `backend/pom.xml`: adicionado `spring-boot-starter-actuator`.
  - `backend/src/main/resources/application.properties`:
    - `server.port=${PORT:8080}`;
    - `app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:...}`;
    - Actuator expondo só `health`;
    - erros sem stack trace nem mensagem interna.
  - `backend/src/main/java/.../config/ApiExceptionHandler.java`: handler genérico. 404, 405 e 415 mantêm o status; o resto vira 500 neutro. Formato único `{ mensagem }`.
  - `backend/src/test/java/.../SmokeTest.java` (novo): 10 testes de fumaça.
  - `backend/.env.example` e `frontend/.env.example` (novos, sem segredos).
  - `.gitignore` (raiz) corrigido e ignorando `.env`; `frontend/.gitignore` ignorando `.env`.
  - `README.md`: variáveis, health check e testes.
  - `contracts/api.yaml`: contrato implementado (v0.1.0) com o alvo em `x-alvo` (D009).
  - `docs/DECISIONS.md`: D009 a D012.
- **Migrações:** nenhuma.
- **Ambiente de build (D012):** Maven offline com artefatos espelhados do `~/.m2` do usuário (Maven 3.9.16, JDK 21.0.12). O Maven Central não é acessível no ambiente do assistente.
- **Testes executados e resultados:**
  - `mvn -o -B test` → **BUILD SUCCESS, 11 testes, 0 falhas** (SmokeTest 10, AntigolpeApplicationTests 1).
  - `mvn -o -B -DskipTests package` → jar de 22 MB gerado.
  - `java -jar` + `GET /actuator/health` → `{"status":"UP"}`.
  - E2E Playwright, frontend real (Vite) contra a API Spring real, sem mock: **6/6 PASS**. Cobre: vagas carregadas da API, válido mostra cursos e não mostra denúncia, negativo mostra denúncia e cursos, denúncia recebe protocolo, nenhum erro de JavaScript.
  - Contrato: `swagger-cli validate` → válido; campos iguais aos 8 DTOs.
  - Frontend: `npm run lint` → 0 problemas; `npm run build` → OK.
- **Evidências de aceite:**
  - [x] Backend sobe com Java 21 e frontend compila.
  - [x] Fluxo de teste básico funciona sem depender exclusivamente de mock (E2E contra a API real).
  - [x] Nenhum segredo em arquivos versionados. Pendente apenas `git rm --cached frontend/.env`, a ser executado pelo usuário.
- **Pendências, riscos e bloqueios:**
  - O usuário deve rodar `git rm --cached frontend/.env` e commitar.
  - O health check mostra os grupos `liveness`/`readiness`, sem detalhes de componentes. Aceitável.
  - O build depende do espelho local do `.m2`. Dependências novas exigem nova sincronização.
- **Próxima ação:** Sprint 02.

---

## Sprint 02 — Token identifica vaga automaticamente

**Status: CONCLUÍDA (2026-11-17).**

- **Escopo e arquivos:**
  - Backend:
    - `ValidacaoRequest` agora só tem `tokenOuLink`, com `@NotBlank` e `@Size(max=2048)`.
    - `ValidacaoResponse` muda para `{status, mensagem, vaga, idValidacao, cursosRecomendados}`.
    - Novo `VagaResumo`.
    - Novo pacote `service`: `ValidacaoService` (regra), `TokenExtractor` (análise de texto, sem acessar links), `ResultadoInterno` e `ServicoIndisponivelException`.
    - Novo `TokenMock`, com situações ATIVO/EXPIRADO/REVOGADO e dois tokens fictícios de teste.
    - `VagaController` sem listagem nem lógica de negócio.
    - `ApiExceptionHandler` trata validação (400) e indisponibilidade (503).
    - `pom.xml` com `spring-boot-starter-validation`.
    - Removidos `VagaResponse` e `GET /api/vagas`.
  - Frontend:
    - Seletor de cargo removido.
    - Novos componentes `TokenValidationForm`, `ValidationResult` e `ReportForm`.
    - `Courses` renomeado para `CourseRecommendations`.
    - `ValidationPanel` passa a ser só o orquestrador.
    - `api.js` envia só `tokenOuLink`, expõe o status HTTP nos erros e envia `idValidacao` opcional na denúncia.
    - Textos responsáveis: "Token encontrado no cadastro" em vez de "Vaga reconhecida"; "não significa que seja golpe".
  - `contracts/api.yaml` v0.2.0.
  - D013 a D017.
- **Migrações:** nenhuma.
- **Testes executados e resultados:**
  - `mvn -o -B test` → **31 testes, 0 falhas**:
    - `ValidacaoApiTest` 11: confirmado, cargo do cliente ignorado, token em link, desconhecido/expirado/revogado com mesma resposta, link sem token, token não devolvido, vazio, >2048, falha técnica → 503;
    - `TokenExtractorTest` 9;
    - `SmokeTest` 10;
    - `AntigolpeApplicationTests` 1.
  - E2E Playwright contra a API Spring real: **15/15 PASS**:
    - sem seletor;
    - cargo vindo do backend;
    - 3 cursos do cargo;
    - token não exibido;
    - token em link;
    - revogado não confirmado e não chamado de golpe;
    - denúncia pré-preenchida;
    - trilha de segurança;
    - erro ligado ao campo (`aria-describedby`);
    - testes rápidos;
    - protocolo de denúncia;
    - sem erros de JavaScript.
    - Primeira rodada: 1 falha do próprio teste (seletor `article h3` casava com o FAQ); seletor corrigido.
  - `npm run lint` → 0 problemas; `npm run build` → OK.
  - `swagger-cli validate` → válido.
- **Evidências de aceite:**
  - [x] Usuário valida sem escolher cargo.
  - [x] Cargo exibido vem exclusivamente do backend.
  - [x] Token não encontrado não é declarado fraude.
  - [x] Testes unitários e de integração passam.
- **Pendências e riscos:**
  - `GET /api/vagas/exemplos` ainda expõe um token válido de demonstração (perfil demo na Sprint 03; revisão na Sprint 08).
  - README será atualizado com o novo formato de token na Sprint 03.
- **Próxima ação:** Sprint 03.

---

## Sprint 03 — PostgreSQL, Flyway e regionalidade

**Status: CONCLUÍDA (2026-11-17).**

- **Escopo e arquivos:**
  - Migrations Flyway:
    - `V1__esquema_inicial.sql`: 8 tabelas, com constraints e índices;
    - `V2__dados_de_referencia.sql`: 27 UFs, 4 categorias, 12 cursos e a trilha de segurança.
  - Novos pacotes: `vagas` (Vaga, Modalidade, SituacaoVaga, VagaRepository), `tokens` (Token, TokenRepository, TokenHasher HMAC, TokenService, FormatoToken), `cursos` (CursoConsulta), `validacoes` (ValidacaoService, TokenExtractor, ResultadoInterno, ServicoIndisponivelException), `demo` (DemoSeeder, DemoController) e `config/ClockConfig`.
  - Removido o pacote `mock` (repositórios em memória).
  - Configuração: `application.properties` (produção exige `DB_URL` e `TOKEN_HMAC_SECRET`), `application-dev.properties`, `application-h2.properties`, `src/test/resources/application-default.properties` e `backend/.env.example`.
  - `pom.xml`: data-jpa, flyway, flyway-database-postgresql, postgresql e h2.
  - README reescrito; contrato v0.3.0; D018 a D024.
- **Migrações e impactos:** V1 e V2. Banco vazio sobe sem intervenção manual. Os tokens antigos deixam de valer (D021).
- **Testes executados e resultados:**
  - `mvn -o -B test` (H2) → **54 testes: 53 OK, 1 ignorado** (o de PostgreSQL, que só roda com o banco configurado).
  - `mvn -o -B test` com `TEST_PG_URL` apontando para o **PostgreSQL 16.15** local, banco vazio → **54/54 OK**.
    - Primeira rodada: falha de validação do Hibernate nas colunas `CHAR` (`bpchar` × `varchar`), que o H2 não acusava. Corrigida com `@JdbcTypeCode(SqlTypes.CHAR)`.
  - Cobertura:
    - migrations e dados de referência;
    - token nunca guardado em claro;
    - constraints: hash único, validade invertida, vaga presencial sem UF, UF inexistente;
    - 2000 tokens gerados únicos e no formato;
    - token emitido confirma com UF do banco;
    - 200 consultas concorrentes consistentes;
    - cadastro concorrente do mesmo token aceita só 1;
    - prefixo alterado, expirado, revogado, vaga encerrada e token legado → mesma resposta pública;
    - vaga remota sem UF;
    - falha do banco → 503 sem detalhes;
    - demo desligado por padrão (sem vagas e `/exemplos` 404);
    - TokenHasher: sem chave não sobe, chave curta não sobe, chave efêmera só quando permitida.
  - Execução real:
    - jar sem `TOKEN_HMAC_SECRET` → não sobe (mensagem clara);
    - jar sem `DB_URL` → não sobe (exit 1). Antes, caía silenciosamente num H2 em memória;
    - perfil `dev` + PostgreSQL → Flyway aplica V1 e V2, demo carrega 5 vagas e 7 tokens;
    - reinício → "Schema up to date", sem duplicatas.
  - E2E Playwright (frontend real → API → PostgreSQL): **8/8 PASS**. Cobre cargo, região e fonte vindos do banco; prefixo alterado; vaga remota; token legado; teste rápido; sem erros de JavaScript.
- **Evidências de aceite:**
  - [x] Banco vazio sobe com migrations sem intervenção manual.
  - [x] Token válido retorna UF correta do banco; prefixo divergente não confirma.
  - [x] Seeds demo não aparecem em produção sem configuração explícita.
  - [x] Testes de constraints, validade e concorrência passam.
- **Pendências e riscos:**
  - Sem Testcontainers (D024).
  - Rotação da chave HMAC exige reemitir tokens.
  - O deploy no Render precisará de `DB_URL` em formato JDBC (Sprint 09).
- **Próxima ação:** Sprint 04.

---

## Sprint 04 — Design system e acessibilidade (WCAG 2.2 AA)

**Status: CONCLUÍDA (2026-11-17), com 3 verificações manuais pendentes (leitor de tela, zoom 200% manual, dispositivo móvel real).**

- **Escopo e arquivos (frontend):**
  - Base do design system:
    - `tailwind.config.js` com tokens semânticos;
    - `src/index.css` com as paletas padrão e alto contraste, foco visível, `sr-only-focavel` e movimento reduzido;
    - `index.html` com o script de tema antes do React, favicon e sem Google Fonts.
  - Hook novo: `src/hooks/useTema.js`.
  - Componentes:
    - `AccessibilityToolbar.jsx` (novo; substitui `TopBar.jsx`, removido);
    - reescritos com tokens e semântica: `Header`, `Hero`, `Footer` (sem telefones), `FAQ`, `Toast` (pausa), `ArchitectureModal` (gestão de foco e textos atualizados para a arquitetura real) e `App` (`main` focável);
    - tokens aplicados em `TokenValidationForm` (`aria-busy`), `ValidationResult`, `ReportForm`, `ValidationPanel` e `CourseRecommendations` (alvos ≥ 32 px, avisos de nova aba).
  - Fonte local `@fontsource/inter`.
  - Removido `App.css` (sobra do template).
  - Testes e ferramentas:
    - `scripts/contraste.mjs`;
    - `playwright.config.js` e `e2e/` (`apoio.js`, `acessibilidade.spec.js`);
    - dependências de desenvolvimento `@playwright/test` 1.63 e `@axe-core/playwright` 4.14;
    - scripts `test:e2e` e `contraste`.
  - Documentação: `docs/A11Y_EVIDENCIAS.md` (novo); README; D025 a D029.
- **Migrações:** nenhuma.
- **Testes executados e resultados:**
  - Playwright + axe: **19/19 OK**.
    - axe com 0 violações WCAG 2.2 AA em 5 cenários × 2 temas.
    - Teclado, erros anunciados, aria-live, alto contraste persistente e sem `filter`, foco do modal, FAQ, reflow em 320 px, movimento reduzido e aviso de protótipo.
  - Lighthouse 12.8.2: **acessibilidade 100, boas práticas 100**.
  - Contraste: **60 pares, 0 falhas**.
  - `npm run lint` → 0 problemas; `npm run build` → OK.
  - Problemas encontrados e corrigidos durante a sprint:
    - `label-content-name-mismatch` no logotipo;
    - borda de sucesso com 1,92:1;
    - erros de console (fonte do Google e favicon);
    - o servidor Vite que já estava rodando não recarregou o `tailwind.config.js`: as cores semânticas não apareciam e o axe tinha passado sobre fundos transparentes. Após reiniciar o Vite, todos os testes foram refeitos com as cores reais.
- **Evidências de aceite:**
  - [x] Fluxo principal operável sem mouse.
  - [x] Resultados e erros anunciados (aria-live, `role="alert"` e `aria-describedby`). Pendente a confirmação com leitor de tela real.
  - [x] Contrastes medidos; problemas críticos corrigidos.
  - [x] Aviso de protótipo acadêmico visível.
- **Pendências e riscos:**
  - Leitor de tela, zoom 200% manual e dispositivo real: verificar manualmente (roteiro em `docs/A11Y_EVIDENCIAS.md`).
  - Não se afirma conformidade WCAG só com pontuação automática.
- **Próxima ação:** Sprint 05.

---

## Sprint 05 — Histórico de validações e denúncias com privacidade

**Status: CONCLUÍDA (2026-11-17).**

- **Escopo e arquivos:**
  - Migration `V3__validacao_e_denuncia.sql`.
  - Backend:
    - `validacoes/Validacao` e `ValidacaoRepository`; `ValidacaoService` passa a registrar cada consulta;
    - novo pacote `denuncias` (`Denuncia`, `DenunciaRepository`, `DenunciaService`, `DenunciaController`); removido `controller/DenunciaController`;
    - `DenunciaRequest` com Bean Validation e `aceiteAviso`;
    - `config/RetencaoJob` com limpeza agendada;
    - propriedades `app.retencao.*`.
  - Frontend: `ReportForm` com aviso de privacidade e confirmação; `api.js` envia `aceiteAviso`; novo `e2e/denuncia.spec.js`.
  - Documentação: `docs/PRIVACIDADE.md` (novo); contrato v0.4.0; D030 a D032.
- **Migrações e impactos:** V3 cria `validacao` e `denuncia`. A FK opcional `denuncia.validacao_id` usa `ON DELETE SET NULL`, assim como as referências da validação a token e vaga.
- **Testes executados e resultados:**
  - `mvn -o -B test` (H2) → **68 testes: 67 OK, 1 ignorado** (o de PostgreSQL); com `TEST_PG_URL` (PostgreSQL 16.15) → **68/68**.
  - Testes novos:
    - `DenunciaApiTest` (9): sem referência, com referência, referência inexistente ou malformada ignorada, campos obrigatórios, aviso, e-mail inválido, texto longo, sem rota de listagem, constraint de aceite;
    - `HistoricoValidacaoTest` (3): resultado interno sem token, colunas mínimas, nenhum valor de token ou link no histórico;
    - `RetencaoTest` (1);
    - `IndisponibilidadeTest` +1: falha ao gravar denúncia → 503 sem protocolo.
  - Defeito encontrado e corrigido: denúncia **sem** `aceiteAviso` era aceita (`@AssertTrue` considera `null` válido); adicionado `@NotNull`.
  - Playwright: **24/24**. Os 5 novos cobrem protocolo, exigência do aviso, 503 da denúncia sem protocolo, e-mail inválido e validação indisponível (que não vira resultado negativo).
  - `swagger-cli validate` → válido.
- **Evidências de aceite:**
  - [x] Denúncia de vaga desconhecida funciona sem FK obrigatória.
  - [x] Protocolo retornado; histórico armazenado sem segredos.
  - [x] Falha de backend não gera denúncia fictícia bem-sucedida.
- **Pendências e riscos:**
  - Prazos de retenção são proposta (D031).
  - Área administrativa autenticada fora do MVP.
- **Próxima ação:** Sprint 06.

---

## Sprint 06 — Sugestões regionais após consulta não confirmada

**Status: CONCLUÍDA (2026-11-17).**

- **Escopo e arquivos:**
  - Backend:
    - `VagaRepository` com consultas de elegíveis por UF e remotas;
    - novos pacotes `recomendacoes` (`SugestaoService`, `SugestaoController`, `SugestoesResponse`) e `regioes` (`RegiaoController`);
    - `ApiExceptionHandler` trata validação de parâmetros e região desconhecida (400);
    - `DemoSeeder` com +3 vagas fictícias.
  - Frontend:
    - `RegionalSuggestions.jsx` (novo), integrado ao `ValidationPanel`;
    - `api.js` com `listarRegioes` e `sugerirVagas`;
    - `e2e/sugestoes.spec.js`.
  - Contrato v0.5.0; D033 a D035.
- **Migrações:** nenhuma (usa `regiao` e `vaga` da V1).
- **Testes executados e resultados:**
  - `mvn -o -B test` → **79 testes: 78 OK, 1 ignorado** (o de PostgreSQL). `SugestaoApiTest` (11):
    - prioridade da UF e limite 3;
    - mesma cidade primeiro;
    - encerradas e rascunhos excluídos;
    - UF sem vagas → fallback remoto;
    - sem região → remotas;
    - vagas fictícias marcadas e com fonte;
    - resposta sem links;
    - UF desconhecida ou malformada → 400;
    - sem nenhuma vaga elegível → lista vazia;
    - 27 UFs.
  - Playwright: **31/31**. Os novos 7 cobrem:
    - sem região mostra só remotas e nenhuma chamada a `navigator.geolocation`;
    - UF prioriza, limita a 3 e mostra o rótulo de vaga fictícia;
    - bloco sem links e orientando o site oficial;
    - ocultar e mostrar sem bloquear a denúncia;
    - axe sem violações nos dois temas;
    - bloco ausente quando o token é confirmado.
  - Ajuste visual após inspeção: "Remota · Remota" duplicado corrigido.
  - `swagger-cli validate` → válido.
- **Evidências de aceite:**
  - [x] Não há recomendação de vagas inativas, e as fictícias aparecem rotuladas.
  - [x] O bloco não bloqueia a denúncia nem tem links.
  - [x] Usuário usa a função sem informar localização.
- **Pendências:** geolocalização aproximada por IP fica em backlog, condicionada a análise de privacidade.
- **Próxima ação:** Sprint 07.

---

## Sprint 07 — Simulador de chat e OCR experimental

**Status: CONCLUÍDA (2026-11-17).**

- **Escopo e arquivos (só frontend):**
  - `src/simulador/`: `WhatsAppSimulator.jsx` (chat simulado), `ImageTokenReview.jsx` (revisão editável), `extrairToken.js`, `verificarImagem.js`, `ocr.js`.
  - `App.jsx` (rota `#/simulador`, carregamento sob demanda), `Header.jsx` (link "Simulador de chat").
  - Cores do chat em `index.css`, `tailwind.config.js` e `scripts/contraste.mjs`.
  - `scripts/copiar-ocr.mjs`; `package.json` (`tesseract.js` 7.0.0, `@tesseract.js-data/eng` 1.0.0, scripts `predev`/`prebuild`); `.gitignore` (`public/ocr`, relatórios do Playwright).
  - `e2e/chat.spec.js` e `e2e/fixtures/` (print com token, print sem token, arquivo falso).
  - D036 a D040.
- **Migrações e contrato:** nenhuma; o simulador usa os endpoints existentes.
- **Testes executados e resultados:**
  - `npx eslint src e2e` → sem problemas. `npm run build` → OK; simulador em chunk próprio (13,5 kB) e OCR só baixado ao usar.
  - `npm run contraste` → 0 falhas (inclui as cores do chat nos dois temas).
  - Playwright: **46/46** (31 anteriores + 15 novos em `chat.spec.js`):
    - rótulo de simulação, link no menu e volta ao validador;
    - texto com token → revisão focada, nenhuma consulta antes de confirmar, resultado confirmado com aviso "não garante";
    - correção do token antes de consultar (corpo da requisição verificado);
    - sem token → entrada manual, erro de campo vazio, não confirmado sem a palavra "golpe", denúncia opcional;
    - cancelar não consulta; 503 não vira negativo; mensagem vazia com erro acessível;
    - arquivo não-imagem e imagem > 5 MB recusados; remoção do anexo;
    - **OCR real** do print fixture lê `BRD-BR-MG-T3B7R5Y9Q2X8M4VC`, sem requisição externa e com o único POST sendo o token revisado (a imagem não sai do navegador);
    - sem chamada a geolocalização; fluxo por teclado; axe sem violações nos dois temas.
  - Erros encontrados e corrigidos pelos testes: token colado à palavra seguinte via travessão (D040); `role="log"` num `<ol>` invalidava os itens da lista (axe `listitem`).
- **Evidências de aceite:**
  - [x] Texto e imagem seguem o mesmo fluxo de validação no backend.
  - [x] OCR incorreto pode ser corrigido; ausência de token não é tratada como fraude.
  - [x] Nada é enviado ao WhatsApp; não há alegação de IA.
  - [x] Teclado e alto contraste verificados (E2E + axe).
- **Pendências e riscos:**
  - OCR é experimental: prints com fonte pequena, fundo colorido ou compressão podem falhar; a revisão humana mitiga.
  - Primeiro uso baixa ~10 MB (núcleo WASM + modelo) do próprio site.
  - Verificação manual com leitor de tela no simulador pendente.
  - No Windows, rodar `npm install` para as novas dependências.
- **Próxima ação:** Sprint 08.

---

## Sprint 08 — Hardening e testes end-to-end

**Status: CONCLUÍDA (2026-11-17).**

- **Escopo e arquivos:**
  - Backend, novo pacote `seguranca`: `LimiteRequisicoes`, `LimiteRequisicoesInterceptor`, `CabecalhosSegurancaFilter`, `MascaraToken`, `MascaraTokenConverter`, `MascaraTokenExcecaoConverter`.
  - Backend, novo pacote `observabilidade`: `Metricas`.
  - `WebConfig` (interceptores e limites; `Retry-After` exposto no CORS), `ValidacaoService` e `DenunciaService` (métricas; denúncia mascarada), `ApiExceptionHandler` (métrica de indisponibilidade).
  - `logback-spring.xml`; `application.properties` (limites, `FORWARD_HEADERS_STRATEGY`, tamanho de cabeçalho).
  - Testes: `SegurancaTest` (8), `MascaraTokenTest` (8).
  - Frontend: simulador mostra a mensagem do 429; `playwright.config.js` (limites altos para a suíte, `mvnw.cmd` no Windows); `e2e/seguranca.spec.js` (5); `npm audit fix` sem mudanças de versão maior.
  - `.github/workflows/ci.yml`; contrato v0.6.0; `docs/OBSERVABILIDADE.md`, `docs/SEGURANCA_EVIDENCIAS.md`; D041 a D048.
- **Migrações:** nenhuma.
- **Testes executados e resultados:**
  - `mvn -o -B test` com `TEST_PG_*` (PostgreSQL 16.15 real) → **95 testes, 0 falhas, 0 ignorados**.
  - `npx eslint src e2e` → OK; `npm run contraste` → 0 falhas; `npm run build` → OK.
  - `npx playwright test` → **51/51** (validador, denúncia, sugestões, simulador, hardening), repetido após o `npm audit fix`.
  - Jar real com limite 3: 200, 200, 200, **429** (`Retry-After: 60`); 40 KB → **413**; token nos logs → **0** ocorrências.
  - `swagger-cli validate contracts/api.yaml` → válido.
  - `npm audit --omit=dev` → 0; `npm audit` → 12 altas em ferramentas de build (D048).
  - O workflow de CI **não foi executado no GitHub** (sem acesso); os mesmos comandos foram rodados localmente.
- **Evidências de aceite:**
  - [x] Pipeline reproduzível: comandos únicos, CI descrito, mesmos resultados locais.
  - [x] Sem vazamento de tokens/PII em logs ou erros (teste com captura de saída; corpo do 400 sem eco).
  - [x] Cenários críticos documentados em `docs/SEGURANCA_EVIDENCIAS.md`.
- **Pendências e riscos:**
  - Limites e janelas são proposta (D042); limite por instância.
  - `picomatch` em dependências de build (D048).
  - Primeira execução do CI no GitHub pendente (após o commit do usuário).
- **Próxima ação:** Sprint 09.

---

## Sprint 09 — Deploy Render (preparado, não executado)

**Status: CONCLUÍDA NA PARTE PREPARATÓRIA (2026-11-17). Deploy e smoke test em HTTPS pendentes de aprovação.**

- **Escopo e arquivos:**
  - `render.yaml` (API Docker, site estático, PostgreSQL 16; segredos gerados pelo Render ou informados no painel).
  - `backend/Dockerfile` (cache de dependências, JRE, usuário sem privilégios), `backend/.dockerignore`.
  - `DatabaseUrlEnvironmentPostProcessor` + `META-INF/spring.factories`; `app.demo.seed=${DEMO_SEED:false}`.
  - Frontend: `public/tema.js` (script de tema fora do HTML), OCR com `workerBlobURL: false`, `scripts/servir-com-headers.mjs` (`npm run servir:prod`), `e2e/csp.spec.js`.
  - `scripts/smoke-deploy.sh`; `docs/DEPLOY.md` (custos/limites, passo a passo, rollback, backup); D049 a D054.
  - Testes: `DatabaseUrlEnvironmentPostProcessorTest` (5); `DemoDesligadoTest` ajustado ao padrão `${DEMO_SEED:false}`.
- **Migrações:** nenhuma nova.
- **Verificação da configuração do Render:** sintaxe do Blueprint e limites do plano gratuito conferidos na documentação oficial em 2026-11-17 (`render.com/docs/blueprint-spec`, `render.com/docs/free`).
- **Testes executados e resultados:**
  - `mvn -o -B test` com PostgreSQL real → **100 testes, 0 falhas, 0 ignorados**.
  - **Simulação de produção** (jar sem perfil, `DATABASE_URL=postgresql://…`, segredo de 32 bytes aleatórios, `FORWARD_HEADERS_STRATEGY=native`, `DEMO_SEED=true`, banco PostgreSQL 16 vazio):
    - Flyway aplicou V1–V3; health `UP`; validação `CONFIRMADO`; denúncia `201`.
    - CORS: origem configurada → 200 com `Access-Control-Allow-Origin`; outra origem → **403**; preflight de origem não listada → 403.
    - **Reinício real** (processo anterior encerrado e confirmado): "Schema is up to date", validações 3 → 4 e denúncias mantidas (2), tokens continuam 7 (carga idempotente).
    - Logs: 0 ocorrências do token, da senha do banco e do segredo HMAC.
    - Observação: na primeira tentativa o processo antigo não tinha sido encerrado e o "reinício" falhou por porta ocupada; o teste foi refeito corretamente e o resultado acima é o da segunda execução.
  - `scripts/smoke-deploy.sh` contra a simulação local: 13/15; as 2 falhas são as checagens de HTTPS, esperadas em `http://localhost`.
  - Site: `VITE_API_URL=http://localhost:8080 npm run build` servido com os cabeçalhos do `render.yaml` (CSP incluída) → Playwright **52/52**, incluindo OCR e `csp.spec.js` sem violações.
  - `npx eslint src e2e scripts` → OK.
- **Não verificado:** build da imagem Docker (sem daemon Docker no ambiente do assistente); HTTPS e deploy reais.
- **Evidências de aceite:**
  - [ ] Backend e frontend via HTTPS — **pendente do deploy** (checagens prontas no smoke test).
  - [x] Banco persiste entre reinícios (simulação com PostgreSQL 16). No plano gratuito do Render o banco **expira em 30 dias** (documentado).
  - [x] CORS aceita somente origens permitidas.
  - [x] Health check e migrations funcionam (simulação).
  - [x] Sem vagas fictícias apresentadas como reais: `DEMO_SEED` desligado por padrão; no ambiente de demonstração os dados são rotulados como fictícios (D052).
- **Pendências e riscos:**
  - Aprovar e criar o Blueprint; rodar `scripts/smoke-deploy.sh` com as URLs reais e registrar aqui.
  - Banco gratuito expira em 30 dias e não tem backup (D051).
  - Hibernação da API gratuita: a primeira consulta após 15 min ociosos leva ~1 min.
  - `connect-src` da CSP ainda amplo (`*.onrender.com`) até a URL da API existir (D053).
- **Próxima ação:** Sprint 10.

---

## Sprint 10 — Entrega acadêmica e documentação

**Status: CONCLUÍDA (2026-11-17).**

- **Escopo e arquivos:**
  - `docs/arquitetura.md`, `docs/mer.md`, `docs/der.md` reescritos a partir do código; `docs/img/*.png` regenerados.
  - Novos: `docs/ENTREGA.md` (real × simulado, limitações, índice), `docs/ROTEIRO_DEMO.md`, `docs/BACKLOG.md`.
  - `README.md` (seção de entrega); D055.
- **Migrações e contrato:** nenhuma mudança; `contracts/api.yaml` v0.6.0 conferido contra os controllers (6 rotas, todas documentadas).
- **Revisão de linguagem institucional:** todas as menções ao Bradesco na interface são ressalvas ("não é canal oficial", "não é encaminhada ao Bradesco") ou a atribuição dos cursos à Escola Virtual. Mantido o nome no logotipo do cabeçalho, decisão de design anterior, com rótulo de protótipo (ver riscos).
- **Testes executados e resultados (verificação final):**
  - Backend: `mvn -o -B test` com PostgreSQL 16 → **100 testes, 0 falhas** (execução da Sprint 09; sem mudança de código Java desde então).
  - Frontend: `npx eslint src e2e scripts` → OK; `npm run contraste` → 0 falhas; `npm run build` → OK.
  - Playwright (Vite + API h2) → **52/52**; e também **52/52** contra o build servido com os cabeçalhos/CSP do `render.yaml` (Sprint 09).
  - `swagger-cli validate contracts/api.yaml` → válido.
- **Evidências de aceite:**
  - [x] Documentação corresponde ao código (diagramas gerados das migrations; contrato conferido com os controllers; README com variáveis e rotas atuais).
  - [x] Demo reproduzível sem credenciais externas (perfil `h2`, roteiro em `docs/ROTEIRO_DEMO.md`, mesmos passos cobertos por E2E).
  - [x] Limitações e ausência de integração oficial identificadas (`docs/ENTREGA.md`, rodapé, barra superior, modal de arquitetura).
- **Pendências e riscos:** consolidados abaixo.

### Cronograma executado

| Sprint | Tema | Data | Situação |
|---|---|---|---|
| 00 | Auditoria do código existente | 2026-11-17 | Concluída |
| 01 | Fundação: CORS, health check, contrato, build | 2026-11-17 | Concluída |
| 02 | Validação pelo token, sem seletor de cargo | 2026-11-17 | Concluída |
| 03 | PostgreSQL, Flyway, tokens HMAC regionais | 2026-11-17 | Concluída |
| 04 | Design system e acessibilidade (alto contraste) | 2026-11-17 | Concluída |
| 05 | Histórico de validações, denúncias, retenção | 2026-11-17 | Concluída |
| 06 | Sugestões regionais | 2026-11-17 | Concluída |
| 07 | Simulador de chat e OCR experimental | 2026-11-17 | Concluída |
| 08 | Hardening, E2E, CI | 2026-11-17 | Concluída (CI não executado no GitHub) |
| 09 | Deploy Render | 2026-11-17 | Preparada; deploy pendente de aprovação |
| 10 | Entrega acadêmica e documentação | 2026-11-17 | Concluída |

### Evidências de teste consolidadas

| Suíte | Quantidade | Resultado |
|---|---|---|
| Backend JUnit (H2 + PostgreSQL 16 real) | 100 | 100 OK |
| E2E Playwright + axe (validador, denúncia, sugestões, chat/OCR, hardening, CSP) | 52 | 52 OK |
| Contraste dos tokens de cor (dois temas) | todos os pares | 0 falhas |
| Lighthouse acessibilidade (Sprint 04) | — | ver `A11Y_EVIDENCIAS.md` |
| Simulação de produção (sem perfil, `DATABASE_URL`, reinício) | manual | OK (Sprint 09) |

### Pendências do usuário / do projeto

1. `git rm --cached frontend/.env` e commit (o arquivo segue ignorado).
2. `npm install` no Windows (novas dependências: `tesseract.js`, `@tesseract.js-data/eng`).
3. Primeira execução do CI no GitHub após o push.
4. Aprovar e criar o Blueprint no Render; rodar `bash scripts/smoke-deploy.sh <api> <site> --com-denuncia` e registrar as URLs aqui.
5. Testes manuais: leitor de tela, zoom 200%, celular real.
6. Validar com a orientação: prazos de retenção (D031), limites de requisição (D042), uso do nome no cabeçalho.

### Riscos

- Banco gratuito do Render expira em 30 dias e não tem backup.
- Imagem Docker não foi construída no ambiente do assistente (sem daemon); o primeiro build ocorrerá no Render.
- Nome "bradesco" no logotipo do cabeçalho pode ser lido como marca oficial apesar das ressalvas; avaliar antes de publicação aberta.
- Alertas `picomatch` em dependências de build (D048).

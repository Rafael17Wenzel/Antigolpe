# Auditoria do repositório — Sprint 00

- **Data:** 2026-11-17
- **Branch/commit auditado:** `main` @ `e492c8f` ("CORS Render"); working tree limpo
- **Escopo:** inventário, baseline de build/testes, comparação com o produto alvo e varredura de segredos. Nenhuma lógica de negócio foi alterada.

---

## 1. Resumo executivo

| Área | Situação |
|---|---|
| Frontend (React 19/Vite/Tailwind) | **Funciona**: `npm ci`, `lint` e `build` passam. **Não há testes automatizados.** |
| Backend (Spring Boot 4/Java 21) | **Build e testes bloqueados** neste ambiente (Maven Central inacessível; VM local com Java 11). A lógica compila e passou 16/16 verificações em harness isolado, **sem** contexto Spring. |
| Persistência | **Inexistente.** Tudo é mock em memória. PostgreSQL existe só como modelo (`docs/der.md`). |
| Denúncia | **Simulada.** Gera protocolo aleatório e descarta os dados. |
| Deploy | Dockerfile do backend presente; CORS aponta só para `https://antigolpe-1.onrender.com`. Deploy não foi verificado. |
| Distância do produto alvo | **Grande.** A validação ainda exige cargo; não há região, hash/HMAC de token, rate limiting, health check, chat simulado nem OCR. |

---

## 2. Inventário

### 2.1 Git
- Branch única `main` (remoto `origin/main`). 6 commits: `13d4ed4 first commit` → `2031437 Cursos` → `f41c616 Divisao de curso e formulario` → `9a56ecf docs` → `2aab763 Docker Backend` → `e492c8f CORS Render`.
- Versionado indevidamente: `frontend/.env` (contém apenas `VITE_API_URL=http://localhost:8080`, sem segredo).
- `.gitignore` da raiz contém `node_modeules/` (erro de digitação). Sem efeito prático, porque `frontend/.gitignore` já ignora `node_modules` e `dist`.

### 2.2 Versões reais

| Componente | Versão |
|---|---|
| Java (alvo) | 21 (`pom.xml`) |
| Spring Boot | 4.1.2 (`spring-boot-starter-webmvc`; teste: `spring-boot-starter-webmvc-test`) |
| React / React DOM | 19.3.1 |
| Vite | 8.3.5 |
| Tailwind CSS | 3.4.19 |
| lucide-react | 0.468.0 |
| ESLint | 10.13.0 |
| Docker | `maven:3.9-eclipse-temurin-21` (build) → `eclipse-temurin:21-jre` (runtime) |

### 2.3 Backend — estrutura
```
com.backend.antigolpe
├── AntigolpeApplication
├── config/      WebConfig (CORS /api/**), ApiExceptionHandler ({ mensagem })
├── controller/  VagaController, DenunciaController
├── dto/         CursoResponse, DenunciaRequest/Response, ExemplosResponse,
│                VagaResponse, ValidacaoRequest/Response
└── mock/        VagaMock, VagaMockRepository, CursoMockRepository
```
- Não há camada de service: as regras ficam no controller (o alvo é Controller → Service → Repository).
- Não há JPA, Flyway, Actuator, validação Bean Validation nem logging estruturado.
- Configuração (`application.properties`): `server.port=8080`; `app.cors.allowed-origins=https://antigolpe-1.onrender.com`.
- O Dockerfile repassa `$PORT` via `-Dserver.port=${PORT:-8080}`.

### 2.4 Endpoints implementados

| Método | Rota | Comportamento real |
|---|---|---|
| GET | `/api/vagas` | 4 vagas fictícias `{id, cargo, cursos[]}`. O campo `cursos` não é mais usado pelo front. |
| GET | `/api/vagas/exemplos` | Devolve um **token válido** e um link de golpe para os botões de teste. |
| POST | `/api/vagas/validar` | Body `{vaga, tokenOuLink}`. `vaga` é **obrigatória**. Status: `VALIDO_DEMONSTRACAO` ou `NAO_CONFIRMADO`. Devolve `tokenConsultado` e `cursosRecomendados`. 400 se vazio ou vaga inexistente. |
| POST | `/api/denuncias` | Body `{urlSuspeita, emailContato?, descricao}`. 202 com protocolo `DEMO-XXXXXXXX`. Nada é persistido. |

### 2.5 Frontend — componentes
`App`, `TopBar` (alto contraste, skip link, campos "Agência/Conta" demonstrativos), `Header`, `Hero` (testes rápidos), `ValidationPanel` (seletor de cargo, campo de token, resultado, denúncia no negativo), `Courses`, `FAQ`, `Footer`, `ArchitectureModal`, `Toast`. Serviço central: `src/api.js` (`VITE_API_URL`). `App.css` é sobra do template Vite e não é importado.

### 2.6 Banco
Não há banco nem migrations. Existe o modelo em `docs/mer.md` e `docs/der.md` (7 tabelas: `categoria`, `curso`, `vaga`, `vaga_curso`, `token_vaga`, `trilha_seguranca`, `denuncia`). Esse modelo ainda **não** contempla `regiao` nem `validacao`, previstas em `docs/ARCHITECTURE.md`.

### 2.7 Variáveis de ambiente
| Variável | Onde | Observação |
|---|---|---|
| `VITE_API_URL` | `frontend/.env` (versionado) | Valor `http://localhost:8080`. Sem `.env.example`. |
| `PORT` | Dockerfile | Usada para `server.port`. |
| `app.cors.allowed-origins` | `application.properties` | Fixa no arquivo; pode ser sobrescrita por variável de ambiente (`APP_CORS_ALLOWEDORIGINS`), mas isso não está documentado. |

---

## 3. Baseline de build e testes

Execução numa cópia do repositório conferida por md5 contra o original.

| # | Comando | Ambiente | Resultado |
|---|---|---|---|
| 1 | `npm ci` | Node 22.23.4 / npm 10.9.9 | OK (exit 0) |
| 2 | `npm run lint` | idem | OK, 0 problemas (exit 0) |
| 3 | `npm run build` | idem | OK: `index.js` 260,72 kB (gzip 80,26 kB), `index.css` 21,25 kB |
| 4 | `npm test` | idem | **Inexistente**: script não definido (exit 1) |
| 5 | `npm audit --omit=dev` | idem | 0 vulnerabilidades em produção |
| 6 | `npm audit` | idem | 2 em dev: `picomatch` (**alta**, ReDoS), `minimatch` (moderada, DoS). Só afetam ferramentas de build. |
| 7 | `./mvnw test` / `mvn test` | nuvem e VM local | **BLOQUEADO**: `repo.maven.apache.org` recusado pelo proxy (403); a VM local tem só Java 11. |
| 8 | `javac` das classes de domínio com stubs do Spring | JDK 21.0.12 | OK (exit 0). Verificação **parcial**. |
| 9 | Harness Java dos controllers (sem Spring) | JDK 21.0.12 | **16/16 PASS** (detalhe abaixo) |

**Teste existente no backend:** só `AntigolpeApplicationTests.contextLoads()` (sobe o contexto Spring). Não há testes de controller nem de regra.

**Harness (item 9):**
- `GET /api/vagas` retorna 4 vagas, cada uma com 3 cursos.
- O exemplo válido é `BRD-2026-SEC89`.
- Os 4 tokens são válidos no próprio cargo.
- O token é aceito em minúsculas.
- Token de outro cargo e link de golpe retornam `NAO_CONFIRMADO`.
- Resultado negativo: Segurança recebe 4 cursos e RH recebe 5 (LGPD deduplicada).
- Vaga inexistente e token vazio lançam exceção (400).
- A denúncia gera `DEMO-[0-9A-F]{8}`; denúncia sem descrição lança exceção (400).

Na primeira rodada, 1 caso falhou por erro de expectativa no próprio harness (esperava 5 cursos para Segurança). Foi corrigido sem alterar o código auditado.

**Para reproduzir o backend** numa máquina com Java 21 e acesso ao Maven Central:
```bash
cd backend
./mvnw -B test            # Windows: mvnw.cmd -B test
./mvnw -B -DskipTests package && java -jar target/antigolpe-0.0.1-SNAPSHOT.jar
```

---

## 4. O que funciona, o que é mock, o que está bloqueado

| Item | Estado |
|---|---|
| UI de validação, resultado, cursos e denúncia | **Funciona** (build ok; fluxo testado antes contra API simulada) |
| Validação token × cargo | **Funciona sobre mock** (4 tokens fixos em memória) |
| Recomendação de cursos | **Mock** (12 cursos, nomes do catálogo público da Escola Virtual; descrições escritas para o protótipo; sem carga horária) |
| Denúncia | **Simulada** (nada é salvo nem enviado) |
| Campos "Agência/Conta" na TopBar | **Simulado** (só exibe aviso) |
| Telefones de atendimento no rodapé | Dados reais de terceiros exibidos como demonstração |
| Banco PostgreSQL | **Não implementado** (só modelo) |
| Testes do backend com Spring | **Bloqueado** (rede/Java) |
| Testes automatizados do frontend | **Inexistentes** |
| Deploy Render | **Não verificado** nesta sprint (fora do escopo) |
| Chat simulado e OCR | **Não implementados** |

---

## 5. Diferenças para o produto alvo (débitos)

### 5.1 Produto e contrato (`docs/PRODUCT.md`, `contracts/api.yaml`)
1. **A validação exige seletor de cargo.** O alvo é um único campo, com a vaga identificada pelo token (D002).
2. **Formato de token.** O atual é `BRD-2026-SEC89`; o alvo é `BRD-BR-<UF>-<segredo aleatório forte>`, sem região (D003).
3. **Status.** O atual usa `VALIDO_DEMONSTRACAO`/`NAO_CONFIRMADO`; o contrato prevê `CONFIRMADO`/`NAO_CONFIRMADO`, com `vaga {id, cargo, uf, cidade, fonteCadastrada}` e `idValidacao`.
4. **Denúncia.** O código retorna `202`; o contrato prevê `201`.
5. Faltam regionalidade, sugestões de vagas elegíveis, chat simulado e OCR.
6. O texto "Comece estudando com a gente" e o card "Vaga reconhecida" precisam ser revisados para não sugerir autenticidade (regra: "nenhum resultado afirma vaga 100% autêntica").

### 5.2 Segurança (`docs/SECURITY.md`, regras do `CLAUDE.md`)
1. **Enumeração de tokens.**
   - `GET /api/vagas/exemplos` expõe publicamente um token válido.
   - A mensagem "o token existe na base fictícia, mas não pertence à vaga selecionada" confirma que o token existe.
2. **Token em claro.** A resposta devolve o token completo (`tokenConsultado`), o front o exibe e o usa para preencher a denúncia. Não há hash/HMAC no armazenamento.
3. **Sem rate limiting** nem proteção contra força bruta.
4. Sem validação de tamanho de entrada (o contrato prevê no máximo 2048 caracteres) nem Bean Validation.
5. Sem logs estruturados; também não há logs que vazem token, o que é positivo.
6. **Sem health check** (`/actuator/health`).
7. A origem do CORS está fixa no arquivo. Com o valor atual, **o desenvolvimento local quebra**: o front em `localhost:5173` é bloqueado.
8. `frontend/.env` está versionado e não há `.env.example`.
9. **Identidade institucional.**
   - Falta o rótulo explícito "Protótipo acadêmico — não é canal oficial do Bradesco"; só há "Demonstração não oficial" no Hero e menções a "protótipo acadêmico" no rodapé e no modal.
   - O rodapé lista telefones de atendimento do Bradesco.
   - A TopBar imita um login com Agência/Conta.
10. Denúncia: sem aviso de privacidade nem política de retenção (hoje nada é guardado).

### 5.3 Acessibilidade (`docs/ACCESSIBILITY.md`)
1. O alto contraste é feito por `filter: contrast(125%)` global, mecanismo vetado como solução única. Não há tokens de cor por tema.
2. Os erros de formulário não estão ligados aos campos (`aria-describedby`/`aria-invalid`: 0 ocorrências).
3. O modal de arquitetura fecha com Esc e no clique fora, mas **não move nem contém o foco**, nem o devolve ao fechar.
4. Pontos positivos: skip link "Ir ao Conteúdo", landmarks (`header`, `nav`, `main`, `footer`), FAQ com `aria-expanded`/`aria-controls`, toast e resultado em live region, respeito a `prefers-reduced-motion`.
5. Não foram executados axe, Lighthouse nem teste com leitor de tela.

### 5.4 Arquitetura
- Regras ficam nos controllers; não há camada de service.
- Os módulos alvo (`tokens`, `validacoes`, `regioes`, `recomendacoes`) não existem.
- O DER atual não tem `regiao` nem `validacao` (metadados), nem a estrutura `trilha`/`trilha_curso` prevista.

---

## 6. Segredos

Varredura com `git grep` (senha, secret, api key, jdbc, chave privada, AWS, `sk-`) em todo o código versionado e no histórico do `.env`. **Nenhum segredo encontrado.** As ocorrências eram apenas variáveis `MVNW_USERNAME/MVNW_PASSWORD` dos scripts do Maven Wrapper, que leem do ambiente e não guardam valores.

---

## 7. Correções prioritárias sugeridas (para as próximas sprints, não executadas)

1. **CORS por variável de ambiente** com `localhost:5173` em dev e a URL do Render em produção (hoje o dev local está quebrado).
2. Garantir build e testes reais do backend em ambiente com Java 21 e Maven, e criar testes de controller (WebMvc) e de regra.
3. Remover a exposição de token válido (`/exemplos`) e a mensagem que confirma a existência do token. Parar de devolver o token completo.
4. Rate limiting, limites de tamanho e Bean Validation no `POST /api/vagas/validar`.
5. `.env.example`, retirar `frontend/.env` do git e corrigir o `.gitignore` da raiz.
6. Rótulo "Protótipo acadêmico — não é canal oficial do Bradesco"; remover os telefones reais e a imitação de login Agência/Conta.
7. Alto contraste por tokens de cor; erros ligados aos campos; gestão de foco no modal.
8. Adicionar `/actuator/health`.
9. Configurar testes de frontend (Vitest + Testing Library) e uma verificação com axe.
10. Atualizar `npm audit` em dev (picomatch/minimatch).

---

## 8. Riscos e bloqueios
- **Bloqueio:** sem Java 21 e Maven Central neste ambiente, os testes Spring não rodaram. O resultado do backend é parcial até rodar `./mvnw test` numa máquina com acesso.
- **Risco:** a configuração atual de CORS impede o uso local até ser parametrizada.
- **Risco:** se o static site do Render não definir `VITE_API_URL` no build, o front de produção chamará `http://localhost:8080`, porque o `.env` versionado aponta para lá. Não verificado.
- **Risco:** a exibição de marca, telefones e login simulado pode sugerir canal oficial.

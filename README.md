# Antigolpe — Validador de Vagas (protótipo acadêmico)

> **Protótipo acadêmico — não é canal oficial do Bradesco.** Todas as vagas e tokens de
> demonstração são fictícios. Um token encontrado indica correspondência no cadastro do
> protótipo; **não garante** que a mensagem, o recrutador ou o link sejam autênticos.

O candidato cola o token, o link ou o trecho da mensagem que recebeu. O backend identifica a
vaga **pelo token** (sem seletor de cargo) e responde se há correspondência no cadastro.

- `backend/` — API Spring Boot 4 (Java 21), PostgreSQL + Flyway
- `frontend/` — React 19 + Vite + Tailwind
- `contracts/api.yaml` — contrato OpenAPI do que está implementado
- `docs/` — produto, arquitetura, segurança, privacidade, acessibilidade, decisões, progresso por sprint

**Para a banca:** o que é real e o que é simulado em [`docs/ENTREGA.md`](docs/ENTREGA.md); roteiro de
demonstração em [`docs/ROTEIRO_DEMO.md`](docs/ROTEIRO_DEMO.md); arquitetura, MER e DER em
[`docs/arquitetura.md`](docs/arquitetura.md), [`docs/mer.md`](docs/mer.md) e [`docs/der.md`](docs/der.md);
backlog pós-MVP em [`docs/BACKLOG.md`](docs/BACKLOG.md).

---

## Tokens de demonstração

Disponíveis **somente** com dados de demonstração ativos (`DEMO_SEED=true`, ou perfis `dev` e `h2`).
Formato: `BRD-BR-<REGIÃO>-<16 caracteres aleatórios>`. Região = UF, ou `RM` para vaga remota.
O prefixo é só para leitura humana: **não autentica nada**.

| Token | Vaga fictícia | Região | Resultado |
|---|---|---|---|
| `BRD-BR-SP-7K2M9Q4XH3TZ8NWD` | Analista de Segurança da Informação | São Paulo / SP | CONFIRMADO |
| `BRD-BR-RJ-P4V8X2KD9M3QR7TB` | Analista de Atendimento (Agência) | Rio de Janeiro / RJ | CONFIRMADO |
| `BRD-BR-RM-H6N2C8W4Z9K5D3JF` | Desenvolvedor(a) de Software | Remota | CONFIRMADO |
| `BRD-BR-MG-T3B7R5Y9Q2X8M4VC` | Analista de Recursos Humanos | Belo Horizonte / MG | CONFIRMADO |
| `BRD-BR-RJ-E7X2P9D4K8M3Q6WA` | Atendimento (token expirado) | — | NAO_CONFIRMADO |
| `BRD-BR-MG-R5V9K3T7B2N8D4XC` | RH (token revogado) | — | NAO_CONFIRMADO |
| `BRD-BR-SP-C8M4W2Q9T6K3X7PD` | Analista de Dados (vaga encerrada) | — | NAO_CONFIRMADO |
| `http://bradesco-vagas-premio.example/inscricao` | link sem token (teste "golpe") | — | NAO_CONFIRMADO |

- Token, link com token (`...?token=BRD-...`) ou texto com token: tudo funciona; o link **nunca é acessado**.
- Minúsculas são aceitas.
- Trocar a região de um token válido (ex.: `-MG-` → `-SP-`) **não confirma**.
- Não encontrado, expirado, revogado e vaga encerrada recebem **a mesma resposta pública** (contra enumeração).
- Nenhum resultado não confirmado é chamado de golpe.

Fonte no código: `backend/src/main/java/com/backend/antigolpe/demo/DemoSeeder.java`.

## Cursos recomendados

Títulos e categorias do catálogo público da Escola Virtual da Fundação Bradesco (https://www.ev.org.br/).
As descrições são resumos do protótipo; a carga horária deve ser consultada no catálogo.

| Resultado | Cursos |
|---|---|
| CONFIRMADO | os cursos ligados à vaga (`vaga_curso`), na ordem cadastrada |
| NAO_CONFIRMADO | trilha de segurança: Segurança em TI · LGPD · Letramento Digital |

## Simulador de chat (demonstração)

Em `http://localhost:5173/#/simulador` (link "Simulador de chat" no menu). É uma **simulação visual —
não é o WhatsApp** e não envia nada a aplicativos de mensagem.

- Cole a mensagem recebida ou anexe um print (PNG, JPEG ou WebP, até 5 MB).
- O token é procurado no texto; sem token no texto, a imagem passa por **OCR experimental no navegador**
  (`tesseract.js`, arquivos servidos pelo próprio site). A imagem não é enviada ao servidor nem salva.
- O token encontrado aparece para **revisão e correção**; a consulta só acontece quando você confirmar,
  usando a mesma API do validador.

---

## Como rodar

Pré-requisitos: **Java 21** e **Node.js**. PostgreSQL 16 é opcional (veja o perfil `h2`).

### Variáveis de ambiente

Modelos sem segredos em `backend/.env.example` e `frontend/.env.example`.

| Variável | Módulo | Padrão | Uso |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | backend | — | `dev` (PostgreSQL local + demo), `h2` (sem banco instalado + demo), vazio = produção |
| `DB_URL` | backend | obrigatória em produção | JDBC do PostgreSQL. Sem ela, a aplicação **não sobe** |
| `DB_USER` / `DB_PASSWORD` | backend | `antigolpe` / — (dev) | Credenciais do banco |
| `TOKEN_HMAC_SECRET` | backend | obrigatória em produção | Chave do HMAC dos tokens (mín. 32 caracteres). Gere com `openssl rand -base64 48` |
| `PORT` | backend | `8080` | Porta HTTP (o Render define sozinho) |
| `LIMITE_VALIDACAO_POR_MINUTO` / `LIMITE_DENUNCIA_POR_HORA` / `LIMITE_SUGESTAO_POR_MINUTO` | backend | `20` / `10` / `30` | Limite por cliente; acima dele a API responde `429` |
| `FORWARD_HEADERS_STRATEGY` | backend | `none` | `native` atrás do proxy do Render (endereço real do cliente) |
| `DATABASE_URL` | backend | — | Formato do Render (`postgresql://…`); usada se `DB_URL` não existir |
| `DEMO_SEED` | backend | `false` | `true` carrega vagas/tokens fictícios rotulados (ambiente de demonstração) |
| `CORS_ALLOWED_ORIGINS` | backend | `http://localhost:5173,https://antigolpe-1.onrender.com` | Origens liberadas, separadas por vírgula |
| `VITE_API_URL` | frontend | `http://localhost:8080` | URL da API, lida no build do Vite |

O Spring não lê arquivos `.env`: defina as variáveis do backend no sistema ou no painel do Render.

### Backend — demonstração rápida, sem instalar banco (perfil `h2`)

```bash
cd backend
# Linux/macOS
SPRING_PROFILES_ACTIVE=h2 ./mvnw spring-boot:run
# Windows (PowerShell)
$env:SPRING_PROFILES_ACTIVE="h2"; .\mvnw.cmd spring-boot:run
```

### Backend — com PostgreSQL local (perfil `dev`)

```bash
# uma vez: criar usuário e banco
psql -U postgres -c "CREATE USER antigolpe WITH PASSWORD 'sua-senha';"
psql -U postgres -c "CREATE DATABASE antigolpe OWNER antigolpe;"

cd backend
SPRING_PROFILES_ACTIVE=dev DB_PASSWORD=sua-senha ./mvnw spring-boot:run
```

O Flyway cria as tabelas sozinho no primeiro início. Sem `TOKEN_HMAC_SECRET`, o perfil `dev` usa
uma chave efêmera e regenera os tokens de demonstração a cada início.

Health check: http://localhost:8080/actuator/health → `{"status":"UP", ...}`

### Testes do backend

```bash
cd backend
./mvnw -B test                # Windows: mvnw.cmd -B test
```

Os testes usam H2 em memória. Para rodar também contra um **PostgreSQL real** (banco vazio):

```bash
TEST_PG_URL=jdbc:postgresql://localhost:5432/antigolpe_test TEST_PG_USER=antigolpe TEST_PG_PASSWORD=sua-senha ./mvnw -B test
```

### Frontend (porta 5173)

```bash
cd frontend
cp .env.example .env          # Windows: copy .env.example .env
npm install
npm run dev
```

Acesse http://localhost:5173. Verificações:

```bash
npm run lint          # ESLint
npm run build         # build de produção
npm run contraste     # contraste dos tokens de cor nos dois temas (WCAG)
npm run test:e2e      # Playwright + axe contra a API real (sobe o backend no perfil h2 se não estiver rodando)
```

Se o backend já estiver rodando, inicie-o com limites altos antes da suíte E2E (ela faz dezenas de consultas):
`LIMITE_VALIDACAO_POR_MINUTO=10000 LIMITE_DENUNCIA_POR_HORA=10000 LIMITE_SUGESTAO_POR_MINUTO=10000`.

### Integração contínua

`.github/workflows/ci.yml` roda, a cada push/PR na `main`, os testes do backend (H2 e PostgreSQL 16),
lint, contraste, build, auditoria de dependências de produção e a suíte E2E. Não faz deploy.
Segurança e observabilidade: [`docs/SEGURANCA_EVIDENCIAS.md`](docs/SEGURANCA_EVIDENCIAS.md) e
[`docs/OBSERVABILIDADE.md`](docs/OBSERVABILIDADE.md).

### Acessibilidade

- Botão **Alto contraste** na barra superior: paleta própria (preto/branco/amarelo), lembrada no navegador.
  Se o sistema pedir mais contraste (`prefers-contrast: more`), já abre em alto contraste.
- Evidências (axe, Lighthouse, contraste medido e pendências manuais): [`docs/A11Y_EVIDENCIAS.md`](docs/A11Y_EVIDENCIAS.md).

### Deploy (Render)

O `render.yaml` descreve API (Docker), site estático e PostgreSQL. **O deploy não foi executado**: requer
aprovação de quem administra a conta, pois pode gerar custo. Guia completo, limites do plano gratuito
(o banco gratuito expira em 30 dias), rollback e backup: [`docs/DEPLOY.md`](docs/DEPLOY.md).

```bash
# conferir o build com os mesmos cabeçalhos (CSP) do site em produção
cd frontend && npm run build && npm run servir:prod          # http://localhost:4173
# depois do deploy
bash scripts/smoke-deploy.sh https://<api>.onrender.com https://<site>.onrender.com
```

---

## API

Contrato completo: [`contracts/api.yaml`](contracts/api.yaml). Erros sempre no formato `{ "mensagem": "..." }`.

| Método | Rota | Uso |
|---|---|---|
| POST | `/api/vagas/validar` | `{ "tokenOuLink": "..." }` → `{ status, mensagem, vaga, idValidacao, cursosRecomendados }` |
| POST | `/api/denuncias` | registra denúncia (201, protocolo `AG-…`); exige `aceiteAviso`; não é enviada a terceiros |
| GET | `/api/vagas/sugestoes?uf=SP` | até 3 vagas publicadas (UF escolhida → remotas); sem links; vagas fictícias rotuladas |
| GET | `/api/regioes` | 27 UFs para seleção manual de região |
| GET | `/api/vagas/exemplos` | exemplos dos testes rápidos (só com dados de demonstração) |
| GET | `/actuator/health` | health check |

Exemplo de resposta confirmada:

```json
{
  "status": "CONFIRMADO",
  "mensagem": "Encontramos este token no cadastro do protótipo... não garante...",
  "vaga": { "id": "recursos-humanos", "cargo": "Analista de Recursos Humanos", "uf": "MG",
            "cidade": "Belo Horizonte", "fonteCadastrada": "Cadastro fictício do protótipo acadêmico (não é vaga real)" },
  "idValidacao": "5f0c…",
  "cursosRecomendados": [ { "id": "comunicacao-empresarial", "titulo": "...", "descricao": "...", "categoria": "..." } ]
}
```

- `400`: entrada vazia ou maior que 2048 caracteres.
- `413`: corpo acima de 32 KB.
- `429`: limite de consultas do cliente atingido (`Retry-After` em segundos). Não é resultado negativo.
- `503`: consulta indisponível. **Não** é resultado negativo; o front mostra "tente novamente".

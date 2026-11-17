# Diagrama de arquitetura — Antigolpe

> Protótipo acadêmico, **não oficial**. Atualizado na Sprint 10 (2026-11-17) para refletir o código entregue.

O site (React) chama a API (Spring Boot), que consulta o PostgreSQL. A vaga é identificada **só pelo
token**, conferido por HMAC no banco. O simulador de chat e o OCR (em amarelo) são **simulações**
que rodam no navegador e usam a mesma API do validador. A Escola Virtual da Fundação Bradesco aparece
apenas como destino de links de cursos: não há integração.

![Arquitetura](img/arquitetura.png)

<details>
<summary>Fonte Mermaid</summary>

```mermaid
flowchart LR
  user(["Candidato<br/>(navegador)"])

  subgraph FE["Frontend · React 19 + Vite + Tailwind · site estático"]
    direction TB
    app["App.jsx<br/>rotas #validador · #/simulador<br/>tema · toast"]
    panel["ValidationPanel<br/>TokenValidationForm · ValidationResult"]
    neg["Somente se NÃO confirmado:<br/>ReportForm · cursos de acolhimento<br/>RegionalSuggestions"]
    pos["Se confirmado:<br/>CourseRecommendations"]
    chat["WhatsAppSimulator (simulação)<br/>extrairToken · ImageTokenReview"]
    ocr["OCR experimental no navegador<br/>tesseract.js · public/ocr"]
    api["api.js · fetch · VITE_API_URL"]
    app --> panel & chat
    panel --> pos & neg
    chat --> ocr
    panel & chat & neg --> api
  end

  subgraph BE["API · Spring Boot 4 · Java 21 · Docker"]
    direction TB
    filt["CabecalhosSegurancaFilter<br/>cabeçalhos · corpo ≤ 32 KB"]
    lim["CORS (origens por env)<br/>LimiteRequisicoesInterceptor → 429"]
    ctrl["Controllers<br/>vagas/validar · vagas/sugestoes · vagas/exemplos*<br/>denuncias · regioes · actuator/health"]
    svc["Services<br/>ValidacaoService · TokenExtractor · TokenHasher (HMAC)<br/>DenunciaService · SugestaoService · CursoConsulta"]
    obs["Metricas (Micrometer)<br/>logs com token mascarado"]
    job["RetencaoJob<br/>90 / 180 dias"]
    filt --> lim --> ctrl --> svc
    svc -.-> obs
  end

  db[("PostgreSQL 16<br/>Flyway V1–V3")]
  ev["Escola Virtual<br/>Fundação Bradesco<br/>(links de cursos)"]

  user --> FE
  FE -- "links de cursos" --> ev
  api -- "HTTPS / JSON" --> filt
  svc -- "JPA / JDBC" --> db
  job --> db

  classDef ext fill:#ecfdf5,stroke:#059669,color:#065f46;
  classDef sim fill:#fffbeb,stroke:#b45309,color:#78350f;
  class ev ext;
  class chat,ocr sim;
```

</details>

\* `GET /api/vagas/exemplos` só existe com dados de demonstração ativos (`DEMO_SEED=true` ou perfis `dev`/`h2`).

## Camadas

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| Cliente | React 19, Vite, Tailwind (site estático) | Validador (campo único), resultado, denúncia e sugestões (só no não confirmado), cursos, alto contraste, simulador de chat com OCR experimental |
| Comunicação | `api.js` (fetch/JSON), `VITE_API_URL` | Erros no formato `{ mensagem }`; 0/503 nunca viram resultado negativo |
| Borda da API | `CabecalhosSegurancaFilter`, CORS, `LimiteRequisicoesInterceptor` | Cabeçalhos de segurança, corpo ≤ 32 KB, origens permitidas, 429 por cliente |
| API | Controllers → Services → Repositories (Spring Boot 4, Java 21) | Regras de validação, denúncia, sugestões, cursos; DTOs separados das entidades |
| Dados | PostgreSQL 16 + Flyway (V1–V3); H2 só em testes/demonstração | Ver [MER](mer.md) e [DER](der.md) |
| Operação | Actuator (`/actuator/health`), Micrometer, `RetencaoJob` | Health check, métricas sem dados sensíveis, retenção 90/180 dias |
| Deploy (preparado) | `render.yaml`, `backend/Dockerfile` | API Docker, site estático, PostgreSQL gerenciado — ver [DEPLOY](DEPLOY.md) |

## Endpoints

| Método | Rota | Uso |
|---|---|---|
| POST | `/api/vagas/validar` | Validação de token, link ou texto (link nunca acessado) |
| POST | `/api/denuncias` | Denúncia opcional (protocolo `AG-…`), não enviada a terceiros |
| GET | `/api/vagas/sugestoes?uf=` | Até 3 vagas publicadas (UF escolhida → remotas) |
| GET | `/api/regioes` | 27 UFs para escolha manual |
| GET | `/api/vagas/exemplos` | Exemplos dos testes rápidos (só demonstração) |
| GET | `/actuator/health` | Health check |

Contrato completo: [`contracts/api.yaml`](../contracts/api.yaml).

## Fluxo de uma validação

1. A pessoa cola o token, o link ou a mensagem (ou, no simulador, anexa um print lido por OCR no navegador e revisa o token).
2. `POST /api/vagas/validar` → `TokenExtractor` localiza o candidato (`BRD-…`) só por texto.
3. `TokenHasher` calcula o HMAC e o banco é consultado pelo hash. Confirma somente se o token estiver ativo, vigente, a vaga publicada e o prefixo regional coincidir.
4. A validação é registrada sem o token (`validacao`), e as métricas são incrementadas.
5. **Confirmado:** cargo, região e cursos da vaga, com aviso de que isso não garante a autenticidade da mensagem.
6. **Não confirmado:** a mesma resposta para não encontrado, expirado, revogado e vaga encerrada (anti-enumeração), nunca "golpe"; o site mostra orientação, denúncia opcional, cursos de segurança e sugestões regionais.

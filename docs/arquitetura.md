# Diagrama de arquitetura — Antigolpe

Visão do protótipo **como está hoje**: o frontend React consome uma API Spring Boot que serve
dados mockados em memória. As setas tracejadas mostram onde o PostgreSQL entra quando o banco
for desenvolvido (ver [MER](mer.md) e [DER](der.md)).

![Arquitetura](img/arquitetura.png)

<details>
<summary>Fonte Mermaid</summary>

```mermaid
flowchart LR
  user(["👤 Candidato<br/>(navegador)"])

  subgraph FE["Frontend · React 19 + Vite + Tailwind · :5173"]
    direction TB
    app["App.jsx<br/>estado global · toast · contraste"]
    hero["Hero<br/>testes rápidos"]
    panel["ValidationPanel<br/>validação · resultado"]
    den["Formulário de denúncia<br/>(só no negativo)"]
    courses["Courses<br/>cursos por resultado"]
    faq["FAQ · Header · Footer<br/>TopBar · ArchitectureModal"]
    api["api.js<br/>fetch · VITE_API_URL"]
    hero -- "ref.runQuickTest()" --> panel
    app --> hero & panel & faq
    panel --> den & courses
    panel --> api
    den --> api
  end

  subgraph BE["Backend · Spring Boot 4 · Java 21 · :8080"]
    direction TB
    cors["WebConfig<br/>CORS /api/**"]
    err["ApiExceptionHandler<br/>{ mensagem }"]
    vc["VagaController<br/>GET /api/vagas<br/>GET /api/vagas/exemplos<br/>POST /api/vagas/validar"]
    dc["DenunciaController<br/>POST /api/denuncias"]
    vrepo[("VagaMockRepository<br/>vagas · tokens · link de golpe")]
    crepo[("CursoMockRepository<br/>cursos · categorias · trilha")]
    cors --> vc & dc
    vc --> vrepo & crepo
    vc -. erros .-> err
    dc -. erros .-> err
  end

  db[("PostgreSQL<br/>(futuro · ver DER)")]
  ev["Escola Virtual<br/>Fundação Bradesco<br/>ev.org.br"]

  user --> FE
  api -- "HTTP/JSON" --> cors
  vrepo -. "substituir por<br/>repositórios JPA" .-> db
  crepo -.-> db
  dc -. "persistir denúncias" .-> db
  courses -- "links externos" --> ev

  classDef future stroke-dasharray: 5 5,fill:#f9fafb,color:#374151,stroke:#9ca3af;
  classDef ext fill:#ecfdf5,stroke:#059669,color:#065f46;
  classDef red fill:#fff1f1,stroke:#cc0000,color:#7f1d1d;
  class db future;
  class ev ext;
  class vc,dc red;
```

</details>

## Camadas

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| Cliente | React 19 + Vite + Tailwind (porta 5173) | Interface, seletor de cargo, validação, denúncia (só no resultado negativo) e cursos (só após validar) |
| Comunicação | `api.js` (fetch, JSON) | Chamadas HTTP para a API; URL em `VITE_API_URL` |
| API | Spring Boot 4 / Java 21 (porta 8080) | Endpoints REST, CORS, tratamento de erros `{ mensagem }` |
| Dados (hoje) | `VagaMockRepository`, `CursoMockRepository` | Vagas, tokens, cursos, categorias e trilha de segurança em memória |
| Dados (futuro) | PostgreSQL | Mesmo conteúdo dos mocks + persistência das denúncias |
| Externo | Escola Virtual da Fundação Bradesco | Links do catálogo de cursos |

## Endpoints

| Método | Rota | Controller | Uso no front |
|---|---|---|---|
| GET | `/api/vagas` | VagaController | Preenche o seletor de cargo |
| GET | `/api/vagas/exemplos` | VagaController | Botões "Simular Vaga Válida" e "Simular Golpe / Phishing" |
| POST | `/api/vagas/validar` | VagaController | Valida token/link e devolve os cursos recomendados |
| POST | `/api/denuncias` | DenunciaController | Envia a denúncia simulada e devolve o protocolo |

## Fluxo de uma validação

1. O candidato escolhe o cargo e informa o token ou link.
2. `ValidationPanel` chama `POST /api/vagas/validar`.
3. `VagaController` busca a vaga e o dono do token em `VagaMockRepository` e monta os cursos com `CursoMockRepository`.
4. **Válido:** o front mostra os cursos do cargo abaixo do validador, sem rolar a tela.
5. **Não confirmado:** o front mostra a denúncia e os cursos de acolhimento lado a lado e rola até eles. A denúncia vai para `POST /api/denuncias`.

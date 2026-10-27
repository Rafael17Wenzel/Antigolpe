# Antigolpe — Validador de Vagas (protótipo acadêmico)

Protótipo de conscientização sobre golpes em processos seletivos, com tema visual Bradesco.
**Não é um serviço oficial.** Todos os dados são fictícios e ficam em memória no backend;
nada é salvo nem enviado a terceiros.

- `backend/` — API Spring Boot (Java 21)
- `frontend/` — React + Vite + Tailwind

---

## Códigos mockados

### Vagas e tokens

Cada token é válido **somente** para o seu cargo.

| Cargo | id da vaga | Token válido |
|---|---|---|
| Analista de Segurança da Informação | `seguranca-informacao` | `BRD-2026-SEC89` |
| Analista de Atendimento (Agência) | `atendimento-agencia` | `BRD-2026-X89K` |
| Desenvolvedor(a) de Software | `desenvolvimento-software` | `BRD-DEV-4022` |
| Analista de Recursos Humanos | `recursos-humanos` | `BRD-RH-1002` |

- O token não diferencia maiúsculas de minúsculas (`brd-dev-4022` também vale).
- Um token válido usado no cargo errado retorna **não confirmado**.
- Qualquer outro texto ou link retorna **não confirmado**.

### Exemplos dos botões de teste rápido

| Botão | Cargo | Token ou link |
|---|---|---|
| Simular Vaga Válida | Analista de Segurança da Informação | `BRD-2026-SEC89` |
| Simular Golpe / Phishing | Analista de Segurança da Informação | `http://bradesco-vagas-premio.example/inscricao` |

Fonte no código: `backend/src/main/java/com/backend/antigolpe/mock/VagaMockRepository.java`.

---

## Cursos por cargo

Os títulos e categorias seguem o catálogo público da Escola Virtual da Fundação Bradesco
(https://www.ev.org.br/). As descrições são resumos do protótipo e a carga horária deve ser
consultada no catálogo.

| Cargo | Cursos |
|---|---|
| Analista de Segurança da Informação | Segurança em Tecnologia da Informação · Introdução a Redes de Computadores · Lei Geral de Proteção de Dados (LGPD) |
| Analista de Atendimento (Agência) | Atendimento ao público · Educação financeira · Postura e imagem profissional |
| Desenvolvedor(a) de Software | Fundamentos de Lógica de Programação · Linguagem de Programação Java – Básico · Ética no Desenvolvimento de Sistemas |
| Analista de Recursos Humanos | Comunicação Empresarial · Qualidade de vida e trabalho · Lei Geral de Proteção de Dados (LGPD) |

**Trilha de segurança:** Segurança em Tecnologia da Informação · Lei Geral de Proteção de Dados (LGPD) · Letramento Digital

### Regra de exibição

| Resultado da validação | O que aparece |
|---|---|
| Antes de validar | Nenhum curso e nenhum formulário de denúncia |
| **Válido** | Título "Comece estudando com a gente:" e os cursos do cargo, abaixo do validador. A tela não rola. |
| **Não confirmado** | Formulário de denúncia (esquerda, já preenchido com o link) e, ao lado, o título "Não desista: seu próximo passo começa aqui" com a trilha de segurança seguida dos cursos do cargo, sem repetir. A tela rola até eles. |

Trocar o cargo depois de validar limpa o resultado.

Fonte no código: `backend/src/main/java/com/backend/antigolpe/mock/CursoMockRepository.java`.

---

## Endpoints da API

Base: `http://localhost:8080`. Erros retornam `{ "mensagem": "..." }`.

### `GET /api/vagas`

Lista as vagas (sem os tokens), cada uma com os seus cursos.

```json
[
  {
    "id": "seguranca-informacao",
    "cargo": "Analista de Segurança da Informação",
    "cursos": [{ "id": "seguranca-ti", "titulo": "...", "descricao": "...", "categoria": "..." }]
  }
]
```

### `GET /api/vagas/exemplos`

Valores usados pelos botões de teste rápido.

```json
{
  "valido": { "vaga": "seguranca-informacao", "tokenOuLink": "BRD-2026-SEC89" },
  "golpe":  { "vaga": "seguranca-informacao", "tokenOuLink": "http://bradesco-vagas-premio.example/inscricao" }
}
```

### `POST /api/vagas/validar`

```json
{ "vaga": "desenvolvimento-software", "tokenOuLink": "BRD-DEV-4022" }
```

Resposta:

```json
{
  "valido": true,
  "status": "VALIDO_DEMONSTRACAO",
  "mensagem": "Token reconhecido na base fictícia do protótipo para esta vaga.",
  "vaga": "Desenvolvedor(a) de Software",
  "tokenConsultado": "BRD-DEV-4022",
  "cursosRecomendados": [ ... ]
}
```

- `status`: `VALIDO_DEMONSTRACAO` ou `NAO_CONFIRMADO`
- `400` quando a vaga ou o token estão vazios, ou a vaga não existe

### `POST /api/denuncias`

```json
{
  "urlSuspeita": "http://bradesco-vagas-premio.example/inscricao",
  "emailContato": "voce@exemplo.com",
  "descricao": "Pediram taxa de inscrição pelo WhatsApp."
}
```

Resposta `202`:

```json
{ "recebida": true, "protocolo": "DEMO-1A2B3C4D", "mensagem": "Denúncia simulada recebida. Nenhum sistema externo foi notificado." }
```

- `emailContato` é opcional; `urlSuspeita` e `descricao` são obrigatórios (`400` se faltarem)
- O protocolo é gerado aleatoriamente a cada envio

---

## Como rodar

Pré-requisitos: Java 21 e Node.js.

**Backend** (porta 8080):

```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

**Frontend** (porta 5173):

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173.

- A URL da API fica em `frontend/.env` (`VITE_API_URL`).
- A origem liberada no CORS fica em `backend/src/main/resources/application.properties` (`app.cors.allowed-origins`).

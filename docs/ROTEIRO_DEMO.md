# Roteiro de demonstração (≈ 10 minutos)

Reproduzível **sem credenciais externas e sem instalar banco**: Java 21 e Node.js bastam.

## Preparação (uma vez)

```bash
# Terminal 1 — API com dados fictícios em memória
cd backend
SPRING_PROFILES_ACTIVE=h2 ./mvnw spring-boot:run          # Windows: $env:SPRING_PROFILES_ACTIVE="h2"; .\mvnw.cmd spring-boot:run

# Terminal 2 — site
cd frontend
npm install
npm run dev                                              # http://localhost:5173
```

Confira http://localhost:8080/actuator/health → `UP`. Tenha à mão o arquivo `frontend/e2e/fixtures/print-token.png`.

## Roteiro

| # | Passo | O que mostrar | Fala sugerida |
|---|---|---|---|
| 1 | Abrir o site | Faixa "Protótipo acadêmico — não é canal oficial do Bradesco" e o selo "Cadastro fictício" | "Tudo aqui é demonstração; nenhum dado é real." |
| 2 | Colar `BRD-BR-MG-T3B7R5Y9Q2X8M4VC` e validar | **Vaga automática**: cargo e região aparecem sem escolher cargo; cursos da vaga; a tela não rola | "O backend identifica a vaga só pelo token, conferido por HMAC no banco." |
| 3 | Ler o aviso do resultado | "…não garante que a mensagem, o recrutador ou o link sejam autênticos" | "Confirmado é correspondência no cadastro, não atestado de autenticidade." |
| 4 | **Token regional**: trocar `-MG-` por `-SP-` no mesmo token | `NAO_CONFIRMADO` | "O prefixo regional só ajuda a ler; ele pode impedir a confirmação, nunca produzi-la." |
| 5 | Validar `BRD-BR-RJ-E7X2P9D4K8M3Q6WA` (expirado) | Mesma resposta de um token inexistente; nenhuma palavra "golpe" | "Não revelamos se o token existe (anti-enumeração) e não chamamos de golpe o que só não foi encontrado." |
| 6 | **Denúncia** (rolou automaticamente) | Aviso de privacidade obrigatório, protocolo `AG-…` | "A denúncia fica no protótipo; não é enviada a nenhuma instituição." |
| 7 | **Sugestões**: escolher uma UF | Até 3 vagas fictícias rotuladas, sem links; nada de GPS | "A região vem só da escolha da pessoa." |
| 8 | **Alto contraste** (barra superior) | Paleta preto/branco/amarelo; recarregar mantém a escolha | "Meta WCAG 2.2 AA: axe sem violações nos dois temas." |
| 9 | Navegar só com Tab/Enter em parte do fluxo | Foco visível, link "pular para o conteúdo" | — |
| 10 | **Chat**: menu "Simulador de chat" | Rótulo "Simulação visual — não é o WhatsApp" | "Não integramos WhatsApp; é uma simulação da experiência." |
| 11 | Colar uma mensagem com `BRD-BR-RM-H6N2C8W4Z9K5D3JF` e enviar | Token encontrado vai para **revisão**; nada é consultado antes de "Consultar este token" | "Revisão humana obrigatória." |
| 12 | Anexar `print-token.png` e enviar | "Lendo a imagem (experimental)…", token lido, consulta confirmada | "OCR no navegador; a imagem não sai do dispositivo." |
| 13 | Enviar "Pague a taxa de cadastro pelo Pix" | Sem token → campo vazio para digitar; nada é chamado de fraude | — |
| 14 | (Opcional) Testes rápidos do topo | "Simular vaga cadastrada" / "Simular golpe / phishing" | — |

Outros tokens fictícios: tabela no [`README.md`](../README.md#tokens-de-demonstração).

## Se algo falhar ao vivo

- "Não foi possível consultar agora… não indica golpe": a API está parada ou hibernando (no Render, aguarde ~1 min).
- 429 "Muitas consultas": limite por cliente; aguarde o tempo indicado ou reinicie a API local.
- OCR lento na primeira vez: o modelo (~10 MB) é baixado do próprio site uma única vez.

## Evidências automatizadas do mesmo roteiro

`npx playwright test` cobre os passos 2–13 (52 testes, inclusive axe nos dois temas e OCR real).

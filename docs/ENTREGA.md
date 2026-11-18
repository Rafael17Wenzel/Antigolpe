# Entrega acadêmica — o que é real, o que é simulado

> **Protótipo acadêmico, não oficial.** Não há integração com o Bradesco, a Fundação Bradesco, WhatsApp,
> sistemas de recrutamento (ATS), SIEM ou qualquer serviço externo. Vagas e tokens de demonstração são
> fictícios. Um token confirmado indica correspondência no cadastro do protótipo; **não garante** que a
> mensagem, o recrutador ou o link sejam autênticos.

## Funcionalidades

| Funcionalidade | Situação | Detalhe |
|---|---|---|
| Validação de token, link ou texto | **Real (no protótipo)** | Backend extrai o token por texto, consulta o código no PostgreSQL e aplica as regras (ativo, validade, vaga publicada, prefixo regional). Links nunca são acessados |
| Token regional `BRD-BR-<UF\|RM>-…` | **Real** | Prefixo só para leitura humana; trocar a UF impede a confirmação, nunca a produz |
| Vaga identificada automaticamente | **Real** | Sem seletor de cargo: a vaga vem do token |
| Cadastro de vagas e tokens | **Real no protótipo** | Área do RH (`#/login` → `#/admin`, usuário fixo `root`/`root`): criar, editar, encerrar e excluir vagas; o token é gerado automaticamente e fica sempre visível. Além disso, 8 vagas fictícias de demonstração (`DEMO_SEED=true` ou perfis `dev`/`h2`) |
| Login do RH | **Real, com credencial fixa** | JWT de 8 horas; usuário `root`/`root` fixo no código (D057) — só para demonstração |
| Denúncia | **Real no protótipo; não encaminhada** | Gravada no banco com protocolo `AG-…`, tokens mascarados, retenção de 180 dias. Não é enviada ao Bradesco nem a órgãos |
| Histórico de validações | **Real** | Só resultado e data, sem o texto consultado; retenção de 90 dias |
| Cursos recomendados | **Links reais, dados resumidos** | Títulos e categorias do catálogo público da Escola Virtual; descrições escritas para o protótipo; carga horária não informada (consultar o catálogo) |
| Sugestões regionais | **Real sobre dados fictícios** | Até 3 vagas publicadas da UF escolhida pela pessoa, depois remotas; sem geolocalização |
| Alto contraste e acessibilidade | **Real** | Tema próprio, teclado, foco, leitor de tela (rótulos/regiões vivas), movimento reduzido; axe sem violações A/AA |
| Simulador de chat | **Simulação visual** | Não é o WhatsApp; nada é enviado a aplicativos de mensagem |
| Leitura de print por IA | **Real, integração com o Google Gemini** (com a chave do projeto) | Só com aceite da pessoa; via backend (`GEMINI_API_KEY`); a IA apenas sugere o token, que passa por revisão humana e pelo cadastro. Não é integração oficial nem do Bradesco |
| Leitura de print local (OCR) | **Experimental / fallback** | `tesseract.js` no navegador, usada sem o aceite ou quando a IA falha; a imagem não sai do dispositivo |
| Limite de requisições, cabeçalhos, logs mascarados, métricas | **Real** | 429 por cliente; tokens mascarados em logs; contadores sem dados pessoais |
| Deploy no Render | **Preparado, não executado** | `render.yaml`, Dockerfile e guia prontos; criar os recursos exige aprovação |
| CI no GitHub | **Preparado, não executado** | `.github/workflows/ci.yml`; os mesmos comandos foram rodados localmente |

## Limitações conhecidas

- **Sem integração oficial** de nenhum tipo; nenhum dado vem de sistemas reais de vagas.
- **Área do RH com um único usuário fixo (`root`/`root`)** e token em texto puro no banco: aceitáveis só em demonstração (D056, D057). Denúncias são somente leitura.
- **Limite de requisições em memória:** vale por instância (suficiente para uma instância).
- **OCR experimental:** falha com fonte pequena, fundo colorido ou compressão forte; primeiro uso baixa ~10 MB.
- **Gemini:** depende da chave, da cota e da rede; na cota gratuita o Google pode guardar e revisar as imagens enviadas (termos do Gemini API). O teste automático usa respostas simuladas: a chamada real ao Google não foi testada no ambiente do assistente (sem acesso de rede ao serviço).
- **Plano gratuito do Render:** API hiberna após 15 min sem uso; banco gratuito expira em 30 dias e não tem backup (`docs/DEPLOY.md`).
- **Verificações manuais pendentes:** leitor de tela real (NVDA/VoiceOver), zoom de 200% e dispositivos móveis reais (`docs/A11Y_EVIDENCIAS.md`).
- **Dependências de build:** alerta de `picomatch` (ReDoS) em Tailwind 3/Vite, sem impacto no código servido (D048).
- **Parâmetros propostos, não validados com a orientação:** prazos de retenção (D031) e limites de requisição (D042).
- **Identidade visual:** inspirada no Bradesco a pedido do projeto, sempre com o rótulo "Protótipo acadêmico — não é canal oficial do Bradesco". Antes de qualquer publicação aberta, avaliar a remoção do nome no cabeçalho (ver riscos em `PROGRESS.md`).

## Documentos

| Tema | Arquivo |
|---|---|
| Como rodar, variáveis, API | [`README.md`](../README.md) |
| Arquitetura, MER, DER | [`arquitetura.md`](arquitetura.md), [`mer.md`](mer.md), [`der.md`](der.md) |
| Contrato OpenAPI | [`contracts/api.yaml`](../contracts/api.yaml) (v0.6.0) |
| Roteiro de demonstração | [`ROTEIRO_DEMO.md`](ROTEIRO_DEMO.md) |
| Deploy, custos, rollback, backup | [`DEPLOY.md`](DEPLOY.md) |
| Segurança, observabilidade, privacidade | [`SEGURANCA_EVIDENCIAS.md`](SEGURANCA_EVIDENCIAS.md), [`OBSERVABILIDADE.md`](OBSERVABILIDADE.md), [`PRIVACIDADE.md`](PRIVACIDADE.md) |
| Acessibilidade | [`A11Y_EVIDENCIAS.md`](A11Y_EVIDENCIAS.md) |
| Decisões e progresso por sprint | [`DECISIONS.md`](DECISIONS.md), [`PROGRESS.md`](PROGRESS.md) |
| Backlog pós-MVP | [`BACKLOG.md`](BACKLOG.md) |

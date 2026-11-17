# Antigolpe — Instruções permanentes para Claude Code

## Missão
Evoluir o protótipo acadêmico Antigolpe, voltado à validação de oportunidades de emprego, preservando o código existente sempre que viável. Backend Java 21 / Spring Boot 4; frontend React 19 / Vite / Tailwind; PostgreSQL; deploy Render. Português brasileiro em UI, documentação e mensagens.

## Fontes e verdade
1. Inspecione o repositório antes de modificar qualquer arquivo. O código é a fonte da verdade para o estado implementado.
2. `docs/PRODUCT.md` define o comportamento desejado; `docs/ARCHITECTURE.md` define os limites; `contracts/api.yaml` é o contrato alvo.
3. Materiais de checkpoint e protótipos são referências históricas, não prova de integração real.
4. Não afirme integração oficial com Bradesco, WhatsApp, ATS, SIEM ou serviços externos. Não invente dados de vagas reais ou cargas horárias de cursos.
5. Não faça refatorações amplas fora do escopo da sprint.

## Ritual obrigatório por sprint
1. Ler `CLAUDE.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/ACCESSIBILITY.md`, o arquivo da sprint e `docs/DECISIONS.md`.
2. Fazer inventário de pastas, versões, endpoints, componentes, testes e variáveis; apresentar plano de alterações antes de editar.
3. Implementar em incrementos pequenos; manter contrato de API e migrations compatíveis.
4. Executar testes pertinentes, lint, build, verificações de segurança e acessibilidade quando disponíveis.
5. Atualizar `docs/PROGRESS.md` com mudanças, comandos, resultados reais, pendências e riscos.
6. Não marcar tarefa concluída sem evidência de execução; em ambiente sem dependências, registrar bloqueio e comandos para reprodução.
7. Não prosseguir automaticamente para a próxima sprint sem aprovação do usuário.

## Regras não negociáveis
- Validação de token feita no backend, nunca decidida pela IA, pelo prefixo regional ou pelo frontend.
- Um token encontrado indica correspondência no cadastro, NÃO garante autenticidade de mensagem/recrutador/link.
- Nunca classificar uma oferta como golpe apenas porque não foi encontrada.
- Não acessar URLs enviadas pelo usuário no servidor para validar; apenas analisar sua estrutura com parser seguro.
- Não expor tokens completos em logs, analytics, URLs públicas ou mensagens de erro.
- Dados pessoais mínimos, retenção definida, consentimento/aviso quando aplicável e nenhuma geolocalização precisa sem ação explícita.
- Proteção contra brute force, rate limiting e enumeração de tokens.
- Nenhuma credencial em git; usar variáveis de ambiente e `.env.example` sem valores secretos.
- Não inserir marcas ou afirmações que sugiram operação oficial do Bradesco; protótipo acadêmico claramente rotulado até autorização.
- Acessibilidade WCAG 2.2 AA como alvo, incluindo teclado, foco, contraste, leitores de tela, zoom e movimento reduzido.
- Render: escutar `$PORT`, health checks, migrações controladas, CORS por origem e banco via env.

## Resposta ao final de cada sprint
Resumo; arquivos modificados; migrations e impactos; testes/comandos com resultado; critérios atendidos/não atendidos; riscos; como executar localmente; próximos passos (sem iniciar sprint seguinte).

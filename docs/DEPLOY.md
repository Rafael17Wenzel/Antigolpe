# Deploy no Render (Sprint 09)

> **Nada foi publicado.** Este guia e o `render.yaml` preparam o deploy; a criação dos recursos
> depende de aprovação explícita de quem administra a conta do Render, porque pode gerar cobrança.

Sintaxe do Blueprint conferida em https://render.com/docs/blueprint-spec e limites do plano gratuito
em https://render.com/docs/free (consultados em 2026-11-17). **Preços e limites mudam: confira no painel
no momento da criação.**

## O que o `render.yaml` cria

| Recurso | Tipo | Plano no arquivo | Observação |
|---|---|---|---|
| `antigolpe-api` | Web service, Docker (`backend/Dockerfile`) | `free` | Health check `/actuator/health`; publica só após o CI passar (`autoDeployTrigger: checksPass`) |
| `antigolpe-web` | Site estático (`frontend/dist`) | — (sites estáticos não têm plano) | Cabeçalhos de segurança e CSP declarados no arquivo |
| `antigolpe-db` | PostgreSQL 16 | `free` | Acesso só pela rede privada do Render (`ipAllowList: []`) |

### Limitações do plano gratuito (documentação do Render, 2026-11-17)

- **Web service gratuito:** hiberna após 15 min sem tráfego; volta em cerca de 1 min. 750 horas/mês por
  workspace. Uma instância, sem disco persistente. Banda e minutos de build contam na cota do workspace.
- **PostgreSQL gratuito:** **expira 30 dias após a criação** (14 dias de carência para mudar de plano; depois
  é apagado), **sem backups**, 1 GB fixo, um por workspace.
- Consequência: o plano gratuito serve para **demonstração curta** (ex.: banca). Para manter dados por mais
  de 30 dias ou ter backup, mude o banco para um plano pago (ex.: `0.1c-256mb`, o padrão do Render) e
  confira o preço no painel. A API pode continuar gratuita se a hibernação for aceitável.

## Variáveis de ambiente

| Variável | Serviço | Origem | Valor |
|---|---|---|---|
| `DATABASE_URL` | API | `fromDatabase` (automática) | `postgresql://…`; o app converte para JDBC (`DatabaseUrlEnvironmentPostProcessor`) |
| `JWT_SECRET` | API | `generateValue` (automática) | Assina o login do RH. Trocar só derruba as sessões abertas |
| `CORS_ALLOWED_ORIGINS` | API | **informar no painel** (`sync: false`) | URL do site, ex.: `https://antigolpe-web.onrender.com` |
| `FORWARD_HEADERS_STRATEGY` | API | arquivo | `native` (IP real do cliente atrás do proxy, para o limite de requisições) |
| `DEMO_SEED` | API | arquivo | `true` = vagas e tokens **fictícios e rotulados**. Use `false` em qualquer uso real |
| `JAVA_TOOL_OPTIONS` | API | arquivo | Memória ajustada para instância pequena |
| `VITE_API_URL` | Site | **informar no painel** (`sync: false`) | URL da API, ex.: `https://antigolpe-api.onrender.com` (lida no build) |

As URLs `*.onrender.com` só são conhecidas depois da criação. Se o nome escolhido estiver ocupado, o Render
acrescenta um sufixo: ajuste `CORS_ALLOWED_ORIGINS` e `VITE_API_URL` e faça novo deploy do site.

## Passo a passo (após aprovação)

1. Fazer commit e push para `main` (incluindo `render.yaml`) e confirmar o CI verde no GitHub.
2. No Render: **New → Blueprint**, escolher o repositório. Revisar os recursos e planos listados.
3. Preencher `CORS_ALLOWED_ORIGINS` e `VITE_API_URL` quando o painel pedir.
4. Aguardar o deploy. As migrations do Flyway rodam no início da API (V1 a V3); o Hibernate só valida.
5. Rodar o smoke test e registrar o resultado em `docs/PROGRESS.md` (só as URLs públicas, sem segredos):

   ```bash
   bash scripts/smoke-deploy.sh https://<api>.onrender.com https://<site>.onrender.com --com-denuncia
   ```

6. Abrir o site, validar um token de demonstração e testar o simulador (o primeiro OCR baixa ~10 MB).

## Migrações

- Flyway na inicialização, com **uma instância** (não há corrida entre réplicas). Migrations só aditivas;
  nunca editar uma migration já aplicada.
- Para várias instâncias no futuro: rodar o Flyway num `preDeployCommand` e desligar no início do app.

## Rollback

| Situação | Ação |
|---|---|
| Deploy da API ou do site com defeito | Painel → serviço → **Events/Deploys** → **Rollback** para o deploy anterior. Ou `git revert` + push (o CI precisa passar) |
| Migration nova com defeito | Não editar a migration aplicada: criar `V(n+1)` corretiva. Rollback do código só é seguro se a migration for compatível com a versão anterior (por isso só mudanças aditivas) |
| Migration V4 (token em texto) | Os tokens anteriores, guardados só como hash, foram apagados por ela; vagas reais precisam de token novo (editar a vaga na área do RH emite um) |
| Banco corrompido/perdido | Plano pago: restaurar backup/PITR pelo painel. Plano gratuito: **não há backup** — recriar o banco; as migrations e o `DEMO_SEED` recriam os dados de demonstração (validações e denúncias se perdem) |

## Política de backup proposta

- **Plano gratuito (demonstração):** sem backup disponível no Render. Dados de demonstração são recriáveis;
  validações e denúncias são descartáveis (retenção de 90/180 dias de qualquer forma).
- **Plano pago:** usar os backups/recuperação oferecidos pelo plano contratado (confirmar no painel). Antes
  de cada migration nova, exportar manualmente: `pg_dump "$DATABASE_URL_EXTERNA" -Fc -f antigolpe-AAAAMMDD.dump`
  (URL externa no painel; arquivo fora do git, guardado pelo responsável).
- Restaurar: `pg_restore --clean --no-owner -d "$DATABASE_URL_EXTERNA" antigolpe-AAAAMMDD.dump`.

## Verificado localmente (sem Render)

Simulação do ambiente de produção com o jar, sem perfil, `DATABASE_URL` no formato do Render e segredo
gerado (detalhes em `docs/PROGRESS.md`, Sprint 09): migrations aplicadas, dados persistem após reiniciar,
CORS só para a origem configurada, nenhum segredo ou token nos logs; build do site servido com os mesmos
cabeçalhos do `render.yaml` passou nos 52 testes E2E, inclusive o OCR sob a CSP.

**Não verificado:** build da imagem Docker (sem Docker no ambiente do assistente), HTTPS real e deploy.

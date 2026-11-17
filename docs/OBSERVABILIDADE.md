# Observabilidade (Sprint 08)

Objetivo: saber se o serviço está saudável e como está sendo usado **sem guardar dados sensíveis**.

## O que existe

| Sinal | Onde | Conteúdo |
|---|---|---|
| Health check | `GET /actuator/health` | `{"status":"UP"}`, sem detalhes. Usado pelo Render. |
| Logs | stdout (coletado pelo Render) | Início/parada, retenção aplicada (contagens), falhas técnicas (só a classe da exceção). Tokens mascarados por `logback-spring.xml`. |
| Métricas | Micrometer, em memória | Contadores abaixo. Endpoint `/actuator/metrics` **não exposto**. |

### Contadores

| Métrica | Etiquetas | Para quê |
|---|---|---|
| `antigolpe.validacoes` | `status` (CONFIRMADO, NAO_CONFIRMADO), `resultado` (situação interna) | Volume e proporção de resultados; aumento de NAO_ENCONTRADO pode indicar varredura |
| `antigolpe.denuncias` | — | Volume de denúncias |
| `antigolpe.limite.excedido` | `rota` (validar, denuncias, sugestoes) | Abuso / necessidade de ajustar limites |
| `antigolpe.indisponivel` | — | Falhas técnicas (banco etc.) |

## O que nunca entra em logs ou métricas

Token completo, texto ou link consultado, endereço IP, e-mail, descrição de denúncia, URL suspeita,
navegador. As etiquetas são fixas e de baixa cardinalidade (verificado em `SegurancaTest`).

## Sinais de alerta sugeridos (pós-MVP)

- `antigolpe.indisponivel` > 0 por 5 minutos → verificar banco.
- `antigolpe.limite.excedido{rota="validar"}` crescendo junto com `resultado=NAO_ENCONTRADO` → tentativa de enumeração.
- Health check falhando → o Render reinicia a instância.

## Pendências

- Exportar métricas (ex.: Prometheus com autenticação) e painel: fora do MVP.
- Rastreamento distribuído: desnecessário com um único serviço.

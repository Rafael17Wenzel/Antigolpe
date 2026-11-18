# DER — Diagrama Entidade-Relacionamento (lógico · PostgreSQL)

> Atualizado na Sprint 11 (2026-11-17) a partir das migrations `V1__esquema_inicial.sql`,
> `V3__validacao_e_denuncia.sql` e `V4__token_em_texto.sql` (`V2` só insere dados de referência). O banco é criado e alterado
> **somente** pelo Flyway; o Hibernate apenas valida (`ddl-auto=validate`).

![DER](img/der.png)

<details>
<summary>Fonte Mermaid</summary>

```mermaid
erDiagram
  regiao |o--o{ vaga : "localiza"
  vaga ||--o{ token : "possui"
  vaga ||--o{ vaga_curso : "recomenda"
  curso ||--o{ vaga_curso : "é recomendado"
  categoria ||--o{ curso : "classifica"
  trilha ||--o{ trilha_curso : "agrupa"
  curso ||--o{ trilha_curso : "integra"
  token |o--o{ validacao : "consultado em"
  vaga |o--o{ validacao : "confirmada em"
  validacao |o--o{ denuncia : "origina"

  regiao {
    CHAR_2 uf PK
    VARCHAR_60 nome UK
  }
  vaga {
    BIGINT id PK "identity"
    VARCHAR_60 slug UK "id público"
    VARCHAR_120 cargo
    VARCHAR_12 modalidade "PRESENCIAL|HIBRIDA|REMOTA"
    CHAR_2 uf FK "nula só se REMOTA"
    VARCHAR_100 cidade
    VARCHAR_200 fonte_cadastrada
    VARCHAR_12 situacao "RASCUNHO|PUBLICADA|ENCERRADA"
    BOOLEAN ficticia
    TIMESTAMPTZ criada_em
  }
  token {
    BIGINT id PK
    BIGINT vaga_id FK
    VARCHAR_40 codigo UK "texto puro (V4)"
    VARCHAR_12 prefixo "BRD-BR-UF"
    VARCHAR_4 final_visivel
    BOOLEAN ativo
    TIMESTAMPTZ valido_de
    TIMESTAMPTZ valido_ate "> valido_de"
    TIMESTAMPTZ revogado_em
    TIMESTAMPTZ criado_em
  }
  categoria {
    BIGINT id PK
    VARCHAR_100 nome UK
  }
  curso {
    BIGINT id PK
    VARCHAR_60 slug UK
    VARCHAR_150 titulo
    TEXT descricao
    BIGINT categoria_id FK
  }
  vaga_curso {
    BIGINT vaga_id PK,FK
    BIGINT curso_id PK,FK
    SMALLINT ordem "UK(vaga_id, ordem)"
  }
  trilha {
    BIGINT id PK
    VARCHAR_60 slug UK
    VARCHAR_120 nome
  }
  trilha_curso {
    BIGINT trilha_id PK,FK
    BIGINT curso_id PK,FK
    SMALLINT ordem "UK(trilha_id, ordem)"
  }
  validacao {
    UUID id PK "idValidacao público"
    VARCHAR_20 resultado_interno
    VARCHAR_16 status_publico "CONFIRMADO|NAO_CONFIRMADO"
    BIGINT token_id FK "SET NULL"
    BIGINT vaga_id FK "SET NULL"
    TIMESTAMPTZ criada_em "retenção 90 dias"
  }
  denuncia {
    BIGINT id PK
    VARCHAR_16 protocolo UK "AG-xxxxxxxxxx"
    VARCHAR_2048 url_suspeita "token mascarado"
    VARCHAR_254 email_contato "opcional"
    VARCHAR_2000 descricao "token mascarado"
    UUID validacao_id FK "opcional, SET NULL"
    BOOLEAN aceite_aviso "CHECK = true"
    TIMESTAMPTZ registrada_em "retenção 180 dias"
  }
```

</details>

## Regras garantidas pelo banco

| Tabela | Restrição |
|---|---|
| `vaga` | `modalidade` ∈ PRESENCIAL/HIBRIDA/REMOTA; `situacao` ∈ RASCUNHO/PUBLICADA/ENCERRADA; `uf` obrigatória exceto em REMOTA; `slug` único |
| `token` | `codigo` em texto puro e único (V4, D056 — antes era só o hash HMAC); `prefixo` no formato `BRD-BR-__`; `valido_ate > valido_de` |
| `vaga_curso`, `trilha_curso` | Chave composta; `ordem` única por vaga/trilha |
| `validacao` | `status_publico` ∈ CONFIRMADO/NAO_CONFIRMADO; `resultado_interno` em lista fechada; referências viram `NULL` se o token/vaga for removido |
| `denuncia` | `protocolo` único; `aceite_aviso = true`; ligação opcional com a validação |

## Índices

`ix_vaga_uf_situacao` (sugestões por UF), `ix_token_vaga`, `ix_validacao_criada_em` e
`ix_denuncia_registrada_em` (limpeza por retenção).

## Mudanças em relação ao DER preliminar (out/2026)

- `token_vaga.codigo` (texto em claro) → `token.hash` + `prefixo` + `final_visivel` (D019).
- `trilha_seguranca` → `trilha` + `trilha_curso` (várias trilhas possíveis) (D018).
- Novas: `regiao`, `validacao`; `vaga` ganhou modalidade, UF, cidade, fonte, situação e `ficticia`.
- `denuncia` ganhou `aceite_aviso` e `validacao_id`; textos limitados a 2048/2000 caracteres.

# MER — Modelo Entidade-Relacionamento (conceitual)

Modelo conceitual em notação de Chen, independente de banco. A versão lógica para PostgreSQL,
com tipos e chaves, está no [DER](der.md).

![MER](img/mer.png)

<details>
<summary>Fonte Mermaid</summary>

```mermaid
flowchart TB
    a_cat_id(["<u>id</u>"]) --- CAT
    a_cat_nome(["nome"]) --- CAT
    CAT["CATEGORIA"] ---|"1"| R1{"classifica"} ---|"N"| CUR["CURSO"]
    CUR --- a_cur_id(["<u>id</u>"])
    CUR --- a_cur_slug(["slug"])
    CUR --- a_cur_tit(["titulo"])
    CUR --- a_cur_desc(["descricao"])
    CUR ---|"1"| R4{"integra"} ---|"0..1"| TRI[["TRILHA_SEGURANCA<br/>(entidade fraca)"]]
    TRI --- a_tri_ordem(["ordem"])

    a_vag_id(["<u>id</u>"]) --- VAG
    a_vag_slug(["slug"]) --- VAG
    a_vag_cargo(["cargo"]) --- VAG
    VAG["VAGA"] ---|"1"| R3{"possui"} ---|"N"| TOK["TOKEN"]
    TOK --- a_tok_id(["<u>id</u>"])
    TOK --- a_tok_cod(["codigo"])
    TOK --- a_tok_ativo(["ativo"])
    TOK --- a_tok_de(["valido_de"])
    TOK --- a_tok_ate(["valido_ate"])
    TOK --- a_tok_cri(["criado_em"])

  VAG ---|"N"| R2{"recomenda"} ---|"N"| CUR
  R2 --- a_r2_ordem(["ordem"])

    DEN["DENUNCIA"]
    DEN --- a_den_id(["<u>id</u>"])
    DEN --- a_den_prot(["protocolo"])
    DEN --- a_den_url(["url_suspeita"])
    DEN --- a_den_mail(["email_contato<br/>(opcional)"])
    DEN --- a_den_desc(["descricao"])
    DEN --- a_den_reg(["registrada_em"])

  classDef ent fill:#fff1f1,stroke:#cc0000,stroke-width:2px,color:#7f1d1d,font-weight:bold;
  classDef rel fill:#f3f4f6,stroke:#374151,color:#111827;
  classDef att fill:#ffffff,stroke:#9ca3af,color:#374151;
  class CAT,CUR,VAG,TOK,TRI,DEN ent;
  class R1,R2,R3,R4 rel;
  class a_cat_id,a_cat_nome,a_cur_id,a_cur_slug,a_cur_tit,a_cur_desc,a_vag_id,a_vag_slug,a_vag_cargo,a_r2_ordem,a_tok_id,a_tok_cod,a_tok_ativo,a_tok_de,a_tok_ate,a_tok_cri,a_tri_ordem,a_den_id,a_den_prot,a_den_url,a_den_mail,a_den_desc,a_den_reg att;
```

</details>

Legenda: retângulo = entidade · retângulo duplo = entidade fraca · losango = relacionamento ·
elipse = atributo · <u>sublinhado</u> = identificador.

## Entidades

| Entidade | Descrição | Atributos |
|---|---|---|
| **VAGA** | Oportunidade fictícia de um cargo | <u>id</u>, slug, cargo |
| **TOKEN** | Código que confirma uma vaga; uma vaga pode ter vários | <u>id</u>, codigo, ativo, valido_de, valido_ate, criado_em |
| **CURSO** | Curso sugerido (nome do catálogo da Escola Virtual) | <u>id</u>, slug, titulo, descricao |
| **CATEGORIA** | Categoria do catálogo (ex.: Tecnologia da Informação, Programação) | <u>id</u>, nome |
| **TRILHA_SEGURANCA** | Cursos de segurança mostrados quando a vaga não é confirmada; depende de CURSO | ordem |
| **DENUNCIA** | Denúncia de link ou token suspeito | <u>id</u>, protocolo, url_suspeita, email_contato (opcional), descricao, registrada_em |

## Relacionamentos

| Relacionamento | Entidades | Cardinalidade | Leitura |
|---|---|---|---|
| **possui** | VAGA – TOKEN | 1 : N | Uma vaga possui vários tokens; cada token pertence a uma única vaga |
| **recomenda** | VAGA – CURSO | N : N, com atributo **ordem** | Uma vaga recomenda vários cursos em ordem; um curso pode ser recomendado por várias vagas |
| **classifica** | CATEGORIA – CURSO | 1 : N | Uma categoria classifica vários cursos; cada curso tem uma categoria |
| **integra** | CURSO – TRILHA_SEGURANCA | 1 : 0..1 | Um curso pode integrar a trilha de segurança, com uma posição (ordem) |

A **DENUNCIA** não se relaciona com as outras entidades: hoje ela guarda só o link denunciado,
sem referência à vaga ou à validação.

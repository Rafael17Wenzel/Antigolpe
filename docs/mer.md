# MER — Modelo Entidade-Relacionamento (conceitual)

> Atualizado na Sprint 10 (2026-11-17). Modelo conceitual (notação de Chen), independente de banco.
> A versão lógica, com tipos e chaves, está no [DER](der.md).

![MER](img/mer.png)

<details>
<summary>Fonte Mermaid</summary>

```mermaid
flowchart TB
  REG["REGIÃO"] ---|"0..1"| R1{"localiza"} ---|"0..N"| VAG["VAGA"]
  VAG ---|"1"| R2{"possui"} ---|"0..N"| TOK["TOKEN"]
  VAG ---|"0..N"| R3{"recomenda<br/>(ordem)"} ---|"0..N"| CUR["CURSO"]
  CAT["CATEGORIA"] ---|"1"| R4{"classifica"} ---|"0..N"| CUR
  TRI["TRILHA"] ---|"0..N"| R5{"agrupa<br/>(ordem)"} ---|"0..N"| CUR
  TOK ---|"0..1"| R6{"consultado em"} ---|"0..N"| VAL["VALIDAÇÃO"]
  VAG ---|"0..1"| R7{"confirmada em"} ---|"0..N"| VAL
  VAL ---|"0..1"| R8{"origina"} ---|"0..N"| DEN["DENÚNCIA"]

  REG --- a1(["<u>uf</u> · nome"])
  VAG --- a2(["<u>id</u> · slug · cargo · modalidade<br/>cidade · fonte · situação · fictícia"])
  TOK --- a3(["<u>id</u> · código · prefixo · final visível<br/>ativo · validade · revogado_em"])
  CUR --- a4(["<u>id</u> · slug · título · descrição"])
  CAT --- a5(["<u>id</u> · nome"])
  TRI --- a6(["<u>id</u> · slug · nome"])
  VAL --- a7(["<u>id</u> UUID · resultado interno<br/>status público · data"])
  DEN --- a8(["<u>id</u> · protocolo · URL suspeita<br/>e-mail opcional · descrição · aceite"])
```

</details>

## Entidades

| Entidade | O que representa |
|---|---|
| REGIÃO | Unidade federativa (27 UFs) |
| VAGA | Oportunidade cadastrada no protótipo (fictícia nos dados de demonstração) |
| TOKEN | Código entregue ao candidato, gerado ao criar a vaga; guardado em texto (visível ao RH), com validade e revogação |
| CURSO / CATEGORIA | Cursos do catálogo público da Escola Virtual (só título e categoria; sem carga horária) |
| TRILHA | Sequência de cursos (ex.: segurança, mostrada no resultado não confirmado) |
| VALIDAÇÃO | Registro mínimo de cada consulta: resultado e data, sem o texto consultado |
| DENÚNCIA | Relato opcional do candidato, com protocolo e aviso de privacidade aceito |

## Relacionamentos

- Uma vaga fica em **0 ou 1** região (vagas remotas podem não ter UF) e tem **0..N** tokens.
- Vaga e curso: **N:N** com ordem (`recomenda`); trilha e curso: **N:N** com ordem (`agrupa`).
- Uma validação aponta para **0 ou 1** token e **0 ou 1** vaga (só a vaga quando confirmada).
- Uma denúncia pode nascer de **0 ou 1** validação: ofertas não cadastradas também podem ser denunciadas.

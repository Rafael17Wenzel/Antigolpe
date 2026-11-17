# Privacidade, retenção e acesso (Sprint 05)

Protótipo acadêmico — não é canal oficial do Bradesco. Valores de retenção são **propostas
configuráveis** (D031) e devem ser revistos se o projeto tiver uma política institucional.

## O que é guardado

| Registro | Campos | O que **não** é guardado |
|---|---|---|
| Validação (`validacao`) | id opaco (UUID), resultado interno, status público, referência ao token e à vaga (quando houver), data | texto/link/token consultado, IP, navegador, localização |
| Denúncia (`denuncia`) | protocolo opaco, link/token/texto denunciado, e-mail **opcional**, descrição, referência opcional à validação, confirmação do aviso, data | IP, navegador, localização, arquivos/prints |
| Token (`token`) | HMAC-SHA256, prefixo público (ex.: `BRD-BR-SP`), 4 últimos caracteres, validade | o valor do token em claro |

## Aviso exibido no formulário de denúncia

> Guardamos apenas o que você informar aqui, sem IP nem dados do navegador, por até 180 dias.
> O e-mail é opcional e só serviria para contato sobre esta denúncia. O acesso aos registros é
> restrito e nada é enviado ao Bradesco ou a terceiros.

A denúncia só é aceita com a caixa **"Li o aviso de privacidade"** marcada (validado no
frontend, na API e por constraint no banco).

## Retenção

| Dado | Prazo padrão | Variável |
|---|---|---|
| Validações | 90 dias | `RETENCAO_VALIDACAO_DIAS` |
| Denúncias | 180 dias | `RETENCAO_DENUNCIA_DIAS` |

Limpeza automática diária às 03:30 (`RetencaoJob`). Ao apagar uma validação, a denúncia que a
referenciava permanece, sem a referência (`ON DELETE SET NULL`).

## Controle de acesso

- Não existe rota pública para listar ou consultar denúncias ou validações (`GET /api/denuncias` → 405).
- Até existir uma área administrativa **com autenticação** (fora do escopo do MVP), os registros só
  podem ser consultados por pessoa autorizada com acesso direto ao banco (credenciais via variáveis
  de ambiente, nunca no git).
- Logs da aplicação não registram o conteúdo das consultas nem das denúncias.

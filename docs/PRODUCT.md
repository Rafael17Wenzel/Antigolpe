# Produto, escopo e regras

## Contexto confirmado pelo checkpoint
O Antigolpe acadêmico possui frontend React 19/Vite/Tailwind, backend Java 21/Spring Boot 4 com repositórios em memória, validação por cargo+token/link, denúncia simulada e recomendações de 12 cursos de quatro categorias. PostgreSQL estava apenas modelado. Endpoints históricos: `GET /api/vagas`, `GET /api/vagas/exemplos`, `POST /api/vagas/validar`, `POST /api/denuncias`. Alguns testes de frontend usaram API simulada; verificar compilação real.

## Comportamento alvo
- Um único campo de token ou link; NÃO exigir seletor de cargo.
- Token identifica automaticamente vaga e região somente após consulta backend.
- Formato ilustrativo `BRD-BR-SP-<SEGREDO_ALEATORIO>`; emissor fictício BRD; região UF; sufixo forte e imprevisível. Prefixo não autentica.
- Retornar estados CONFIRMADO, NAO_ENCONTRADO, EXPIRADO, REVOGADO, INDISPONIVEL sem revelar detalhes que permitam enumeração pública; definir respostas públicas seguras e detalhes internos de auditoria.
- Validação confirmada: mostrar cargo, região e fonte cadastrada, aviso de cautela e cursos pertinentes.
- Validação não confirmada: acolhimento, orientações de segurança, denúncia opcional e, depois, sugestões discretas de vagas elegíveis.
- Sugestões por região aproximada (quando houver fundamento e transparência) ou região escolhida pelo usuário; não coletar localização exata por padrão. Preferir seleção manual no MVP. Nenhuma recomendação deve ser baseada apenas em token regional; consultar vagas ativas/publicadas e fonte cadastrada.
- Acessibilidade e modo alto contraste inspirado no wireframe fornecido; sem filtro CSS global como único mecanismo.
- Chat simulado com visual inspirado no WhatsApp: texto encaminhado, imagem/print, prévia, extração experimental OCR, revisão humana, chamada à mesma API de validação, retorno contextual. SEM API oficial WhatsApp e SEM prometer IA multimodal real no MVP.
- Marca visual inspirada no Bradesco para apresentação acadêmica, rotulada como protótipo não oficial; uso institucional real depende de aprovação.

## Fora do escopo inicial
WhatsApp Business API, ATS/Bradesco real, SIEM real, reconhecimento de recrutador real, fraude automatizada por IA, consulta a geolocalização precisa, autenticação de candidatos, automações de denúncia externas.

## Regras de produto
- Nenhum resultado afirma 'vaga 100% autêntica'.
- Ausência de token não equivale a fraude.
- Não transformar uma falha técnica em resultado negativo.
- Não inventar vagas reais; seeds são fictícios e rotulados.
- O formulário de denúncia aceita ofertas não cadastradas; ligação com vaga/validação é opcional.
- O usuário pode recusar localização e continuar.
- Chat e site compartilham serviço e contrato de validação.

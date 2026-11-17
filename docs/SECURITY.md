# Segurança, privacidade e linguagem responsável

- A validação consulta cadastro controlado, não certifica origem de mensagens, domínio ou recrutador.
- Nunca aceitar `includes('bradesco.com.br')` como validação de URL. Se houver análise de domínio, usar parser, hostname normalizado e allowlist exata/subdomínios permitidos de forma explícita; não abrir URLs no backend.
- Sanitizar/validar entradas; limites de tamanho para texto e imagem; MIME por conteúdo, tamanho máximo e tratamento seguro de anexos; não persistir prints por padrão.
- Limitar tentativas, logs estruturados sem PII/token, tratamento consistente de erros, CORS estrito, TLS e gestão de segredos.
- Denúncias: aviso de privacidade, contato opcional, retenção limitada, acesso restrito; evitar conteúdo sensível desnecessário.
- Geolocalização: no MVP usar região escolhida. Se geolocalização aproximada por IP for acrescentada, documentar finalidade, base legal, transparência e imprecisão; jamais chamar API de GPS automaticamente.
- OCR e IA: podem alucinar; token extraído deve ser revisável; nunca deixar IA definir `CONFIRMADO`.
- Identidade institucional: rótulo 'Protótipo acadêmico — não é canal oficial do Bradesco'; remover afirmações fictícias de ATS, SIEM, certificação SSL e atendimento oficial.
- Não enviar imagens de mensagens a serviços externos sem informar e obter a autorização aplicável; definir política de retenção.

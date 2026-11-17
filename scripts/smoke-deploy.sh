#!/usr/bin/env bash
# Smoke test pós-deploy (Sprint 09). Não usa segredos e não altera nada além de registrar
# UMA validação e, se --com-denuncia, UMA denúncia de teste.
# Uso: scripts/smoke-deploy.sh https://antigolpe-api.onrender.com https://antigolpe-web.onrender.com [--com-denuncia]
set -u
API="${1:?informe a URL da API}"; WEB="${2:?informe a URL do site}"; DENUNCIA="${3:-}"
TOKEN_DEMO='BRD-BR-SP-7K2M9Q4XH3TZ8NWD'   # fictício, só confirma com DEMO_SEED=true
falhas=0
ok()   { echo "  OK    $1"; }
erro() { echo "  FALHA $1"; falhas=$((falhas+1)); }
checa() { if eval "$2"; then ok "$1"; else erro "$1"; fi; }

echo "API: $API"
checa "HTTPS na API"                  '[[ $API == https://* ]]'
checa "health UP (pode levar ~1 min se o serviço estava hibernando)" \
  'curl -fsS --max-time 120 "$API/actuator/health" | grep -q "\"UP\""'
checa "cabeçalho nosniff na API"     'curl -fsSI "$API/api/regioes" | grep -qi "x-content-type-options: nosniff"'
checa "27 UFs (banco e migrations)"  '[ "$(curl -fsS "$API/api/regioes" | grep -o "\"uf\"" | wc -l)" -eq 27 ]'
R=$(curl -sS -H 'Content-Type: application/json' -H "Origin: $WEB" -d "{\"tokenOuLink\":\"$TOKEN_DEMO\"}" "$API/api/vagas/validar")
checa "validação responde (CONFIRMADO com demo, NAO_CONFIRMADO sem)" 'echo "$R" | grep -q "\"status\":\"\(NAO_\)\?CONFIRMADO\""'
checa "resposta não devolve o token" '! echo "$R" | grep -q "$TOKEN_DEMO"'
checa "CORS libera o site"           'curl -sSI -X OPTIONS -H "Origin: $WEB" -H "Access-Control-Request-Method: POST" "$API/api/vagas/validar" | grep -qi "access-control-allow-origin: $WEB"'
checa "CORS bloqueia outra origem"   '[ "$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS -H "Origin: https://origem-nao-permitida.example" -H "Access-Control-Request-Method: POST" "$API/api/vagas/validar")" = 403 ]'
checa "actuator não expõe outros endpoints" '[ "$(curl -s -o /dev/null -w "%{http_code}" "$API/actuator/env")" = 404 ]'
if [ "$DENUNCIA" = "--com-denuncia" ]; then
  checa "denúncia registrada (201)" '[ "$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -d "{\"urlSuspeita\":\"http://smoke-test.example\",\"descricao\":\"teste automatizado de deploy\",\"aceiteAviso\":true}" "$API/api/denuncias")" = 201 ]'
fi

echo "Site: $WEB"
checa "HTTPS no site"                '[[ $WEB == https://* ]]'
checa "site responde 200"            '[ "$(curl -s -o /dev/null -w "%{http_code}" "$WEB/")" = 200 ]'
checa "CSP no site"                  'curl -fsSI "$WEB/" | grep -qi "content-security-policy"'
checa "rótulo de protótipo acadêmico" 'curl -fsS "$WEB/" | grep -qi "Protótipo Acadêmico"'
checa "arquivos do OCR servidos pelo site" '[ "$(curl -s -o /dev/null -w "%{http_code}" "$WEB/ocr/worker.min.js")" = 200 ]'

echo; [ $falhas -eq 0 ] && echo "Tudo certo." || { echo "$falhas verificação(ões) falharam."; exit 1; }

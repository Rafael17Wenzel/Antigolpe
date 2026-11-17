/**
 * Localiza um candidato a token no texto (mesmo padrão do backend: BRD + 2 a 4 blocos).
 * Isso NÃO valida nada: só o backend confirma, consultando o cadastro.
 *
 * 1ª tentativa: texto como está (hífens tipográficos curtos viram "-").
 * 2ª tentativa (comum em OCR): junta hífens cercados de espaços ("BRD - BR - MG").
 * O travessão (—) nunca é tratado como hífen, para não colar a palavra seguinte ao token.
 */
const PADRAO = /(?<![A-Z0-9])BRD(?:-[A-Z0-9]{2,40}){2,4}(?![A-Z0-9-])/i;

function procurar(texto) {
  const achado = texto.match(PADRAO);
  return achado ? achado[0].toUpperCase() : null;
}

export default function extrairToken(texto) {
  if (!texto) return null;
  const hifens = texto.replace(/[‐‑–]/g, '-');
  return procurar(hifens) ?? procurar(hifens.replace(/[ \t]*-[ \t]*/g, '-'));
}

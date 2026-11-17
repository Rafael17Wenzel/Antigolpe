// Serve o build (dist/) com os MESMOS cabeçalhos do site estático declarados no render.yaml,
// para verificar localmente que a CSP não quebra o app (inclusive o OCR).
// Uso: npm run build && node scripts/servir-com-headers.mjs [porta] [origem-da-api]
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const dist = join(raiz, 'dist');
const porta = Number(process.argv[2] || 4173);
const api = process.argv[3] || 'http://localhost:8080';

// Lê os pares name/value do bloco "headers" do serviço estático (formato fixo do render.yaml)
const yaml = readFileSync(join(raiz, '..', 'render.yaml'), 'utf8');
const bloco = yaml.slice(yaml.indexOf('    headers:'), yaml.indexOf('\ndatabases:'));
const cabecalhos = {};
for (const m of bloco.matchAll(/name:\s*(.+)\n\s*value:\s*(.+)/g)) {
  cabecalhos[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
}
// A CSP de produção libera https://*.onrender.com; localmente libera também a API local
cabecalhos['Content-Security-Policy'] = cabecalhos['Content-Security-Policy'].replace(
  'connect-src',
  `connect-src ${api}`,
);
delete cabecalhos['Strict-Transport-Security']; // só faz sentido em HTTPS

const tipos = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png',
  '.wasm': 'application/wasm', '.gz': 'application/gzip', '.json': 'application/json',
};

createServer((req, res) => {
  const caminho = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  let arquivo = join(dist, caminho);
  if (!arquivo.startsWith(dist) || !existsSync(arquivo) || statSync(arquivo).isDirectory()) {
    arquivo = join(dist, 'index.html');
  }
  res.writeHead(200, { ...cabecalhos, 'Content-Type': tipos[extname(arquivo)] || 'application/octet-stream' });
  res.end(readFileSync(arquivo));
}).listen(porta, () => {
  console.log(`dist/ em http://localhost:${porta} com os cabeçalhos do render.yaml:`);
  for (const [k, v] of Object.entries(cabecalhos)) console.log(`  ${k}: ${v}`);
});

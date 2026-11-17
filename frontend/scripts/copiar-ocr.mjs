// Copia os arquivos do OCR (tesseract.js) para public/ocr, para serem servidos
// pelo próprio site (sem CDN e sem enviar imagens a terceiros).
// Roda automaticamente antes de `npm run dev` e `npm run build`.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'public', 'ocr');
mkdirSync(destino, { recursive: true });

const pacote = (nome) => dirname(require.resolve(`${nome}/package.json`));
const tesseract = pacote('tesseract.js');
const core = pacote('tesseract.js-core');
const dados = pacote('@tesseract.js-data/eng');

const arquivos = [
  [join(tesseract, 'dist', 'worker.min.js'), 'worker.min.js'],
  [join(core, 'tesseract-core-lstm.wasm.js'), 'tesseract-core-lstm.wasm.js'],
  [join(core, 'tesseract-core-simd-lstm.wasm.js'), 'tesseract-core-simd-lstm.wasm.js'],
  [join(core, 'tesseract-core-relaxedsimd-lstm.wasm.js'), 'tesseract-core-relaxedsimd-lstm.wasm.js'],
  [join(dados, '4.0.0_best_int', 'eng.traineddata.gz'), 'eng.traineddata.gz'],
];

for (const [origem, nome] of arquivos) {
  if (!existsSync(origem)) {
    console.error(`[copiar-ocr] Arquivo não encontrado: ${origem}`);
    process.exit(1);
  }
  copyFileSync(origem, join(destino, nome));
}
console.log(`[copiar-ocr] ${arquivos.length} arquivos copiados para public/ocr`);

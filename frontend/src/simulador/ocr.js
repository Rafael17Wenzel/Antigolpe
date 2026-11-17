/**
 * OCR EXPERIMENTAL no próprio navegador (tesseract.js). A imagem não sai do
 * dispositivo e os arquivos do OCR são servidos pelo site (public/ocr).
 * O resultado pode ter erros: o token extraído é sempre revisado pela pessoa.
 */
export async function lerTextoDaImagem(arquivo, aoProgredir) {
  const { createWorker } = await import('tesseract.js');
  const base = `${import.meta.env.BASE_URL}ocr`;
  const worker = await createWorker('eng', 1, {
    workerPath: `${base}/worker.min.js`,
    workerBlobURL: false, // worker carregado do próprio site (CSP sem blob:)
    corePath: base,
    langPath: base,
    gzip: true,
    logger: (m) => {
      if (aoProgredir && m.status === 'recognizing text') aoProgredir(Math.round(m.progress * 100));
    },
  });
  try {
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-:/.?=& ',
    });
    const { data } = await worker.recognize(arquivo);
    return data.text || '';
  } finally {
    await worker.terminate();
  }
}

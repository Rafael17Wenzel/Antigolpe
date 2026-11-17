/** Limites e checagem do anexo, pelo CONTEÚDO do arquivo (não pela extensão). */
export const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB
export const TIPOS_ACEITOS = 'image/png,image/jpeg,image/webp';

const ASSINATURAS = [
  { tipo: 'PNG', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { tipo: 'JPEG', bytes: [0xff, 0xd8, 0xff] },
];

function ehWebp(b) {
  const ascii = (i, n) => String.fromCharCode(...b.slice(i, i + n));
  return b.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP';
}

/** Resolve { ok: true } ou { ok: false, mensagem }. */
export async function verificarImagem(arquivo) {
  if (!arquivo) return { ok: false, mensagem: 'Nenhum arquivo selecionado.' };
  if (arquivo.size > TAMANHO_MAXIMO) {
    return { ok: false, mensagem: 'A imagem passa de 5 MB. Envie um print menor ou cole o texto.' };
  }
  const cabecalho = new Uint8Array(await arquivo.slice(0, 12).arrayBuffer());
  const reconhecido =
    ASSINATURAS.some((a) => a.bytes.every((byte, i) => cabecalho[i] === byte)) || ehWebp(cabecalho);
  if (!reconhecido) {
    return { ok: false, mensagem: 'Formato não aceito. Use uma imagem PNG, JPEG ou WebP.' };
  }
  return { ok: true };
}

export const MODALIDADES = [
  { valor: 'PRESENCIAL', rotulo: 'Presencial' },
  { valor: 'HIBRIDA', rotulo: 'Híbrida' },
  { valor: 'REMOTA', rotulo: 'Remota' },
];

export const SITUACOES = [
  { valor: 'PUBLICADA', rotulo: 'Publicada' },
  { valor: 'RASCUNHO', rotulo: 'Rascunho' },
  { valor: 'ENCERRADA', rotulo: 'Encerrada' },
];

export const rotulo = (lista, valor) => lista.find((i) => i.valor === valor)?.rotulo ?? valor;

const FUSO = 'America/Sao_Paulo';

/** Data (AAAA-MM-DD) no horário de Brasília. */
export function dataIso(instante) {
  return new Date(instante).toLocaleDateString('sv-SE', { timeZone: FUSO });
}

export function dataHora(instante) {
  return new Date(instante).toLocaleString('pt-BR', { timeZone: FUSO, dateStyle: 'short', timeStyle: 'short' });
}

export function data(instante) {
  return new Date(instante).toLocaleDateString('pt-BR', { timeZone: FUSO });
}

/** Token em uso: o ativo mais recente; senão, o último emitido. */
export function tokenAtual(vaga) {
  const ativos = vaga.tokens.filter((t) => t.situacao === 'ATIVO');
  return ativos.at(-1) ?? vaga.tokens.at(-1) ?? null;
}

export const SITUACAO_TOKEN = {
  ATIVO: 'Ativo',
  EXPIRADO: 'Expirado',
  REVOGADO: 'Revogado',
  AGENDADO: 'Agendado',
};

export async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}

import { useCallback, useEffect, useState } from 'react';

const CHAVE = 'antigolpe:sessao-rh';

function ler() {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE);
    if (!bruto) return null;
    const sessao = JSON.parse(bruto);
    return sessao?.token && new Date(sessao.expiraEm) > new Date() ? sessao : null;
  } catch {
    return null;
  }
}

/**
 * Sessão do RH: JWT guardado só na aba (sessionStorage), descartado ao fechar a aba,
 * ao sair, ao expirar (8 h) ou quando a API responde 401.
 */
export default function useSessaoRh() {
  const [sessao, setSessao] = useState(ler);

  const entrar = useCallback((dados) => {
    try {
      window.sessionStorage.setItem(CHAVE, JSON.stringify(dados));
    } catch {
      /* armazenamento indisponível: a sessão vale só enquanto a página estiver aberta */
    }
    setSessao(dados);
  }, []);

  const sair = useCallback(() => {
    try {
      window.sessionStorage.removeItem(CHAVE);
    } catch {
      /* ignorado */
    }
    setSessao(null);
  }, []);

  // Expira sozinha no horário indicado pelo servidor
  useEffect(() => {
    if (!sessao) return undefined;
    const restante = new Date(sessao.expiraEm).getTime() - Date.now();
    const id = window.setTimeout(sair, Math.max(0, Math.min(restante, 2 ** 31 - 1)));
    return () => window.clearTimeout(id);
  }, [sessao, sair]);

  return { sessao, entrar, sair };
}

import { useCallback, useEffect, useState } from 'react';

const CHAVE = 'antigolpe:tema';

function lerTemaAtual() {
  return document.documentElement.getAttribute('data-tema') === 'alto-contraste'
    ? 'alto-contraste'
    : 'padrao';
}

/**
 * Tema visual (padrão ou alto contraste). O valor inicial é aplicado por um
 * script em index.html antes do React; aqui apenas sincronizamos e persistimos.
 */
export default function useTema() {
  const [tema, setTema] = useState(lerTemaAtual);

  useEffect(() => {
    const raiz = document.documentElement;
    if (tema === 'alto-contraste') {
      raiz.setAttribute('data-tema', 'alto-contraste');
    } else {
      raiz.removeAttribute('data-tema');
    }
    try {
      window.localStorage.setItem(CHAVE, tema);
    } catch {
      // Armazenamento indisponível (ex.: navegação privada): o tema vale só nesta sessão.
    }
  }, [tema]);

  const alternar = useCallback(() => {
    setTema((atual) => (atual === 'alto-contraste' ? 'padrao' : 'alto-contraste'));
  }, []);

  return { tema, altoContraste: tema === 'alto-contraste', alternar };
}

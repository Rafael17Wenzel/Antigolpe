import { useCallback, useEffect, useRef, useState } from 'react';
import { Briefcase, Flag, LogOut } from 'lucide-react';

import { listarCursosRh, listarRegioes } from '../api';
import DenunciasRh from './DenunciasRh';
import VagasRh from './VagasRh';

const ABAS = [
  { id: 'vagas', rotulo: 'Vagas', icone: Briefcase },
  { id: 'denuncias', rotulo: 'Denúncias', icone: Flag },
];

/**
 * Área protegida do RH. Toda chamada leva o JWT; um 401 encerra a sessão e volta ao login.
 */
export default function AreaRh({ sessao, onSair, onSessaoExpirada, onToast }) {
  const [aba, setAba] = useState('vagas');
  const [regioes, setRegioes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const tituloRef = useRef(null);
  const abasRef = useRef({});

  const chamar = useCallback(
    async (fn) => {
      try {
        return await fn(sessao.token);
      } catch (e) {
        if (e.status === 401) onSessaoExpirada();
        throw e;
      }
    },
    [sessao.token, onSessaoExpirada],
  );

  useEffect(() => {
    tituloRef.current?.focus();
    listarRegioes().then(setRegioes).catch(() => setRegioes([]));
    chamar(listarCursosRh).then(setCursos).catch(() => setCursos([]));
  }, [chamar]);

  function teclaAba(event, indice) {
    const delta = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!delta) return;
    event.preventDefault();
    const proxima = ABAS[(indice + delta + ABAS.length) % ABAS.length].id;
    setAba(proxima);
    abasRef.current[proxima]?.focus();
  }

  return (
    <section aria-labelledby="rh-titulo" className="contorno-ac rounded-xl bg-superficie p-5 shadow-xl sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primaria">Área restrita</span>
          <h2 id="rh-titulo" ref={tituloRef} tabIndex={-1} className="mt-1 text-xl font-bold text-texto outline-none">
            Gestão de vagas — RH
          </h2>
          <p className="mt-1 text-sm text-texto-suave">
            Conectado como <strong className="text-texto">{sessao.usuario}</strong>. Protótipo acadêmico — não é sistema do Bradesco.
          </p>
        </div>
        <button
          type="button"
          onClick={onSair}
          className="inline-flex min-h-alvo items-center gap-2 self-start rounded-lg border border-borda-forte px-4 text-sm font-semibold text-texto hover:bg-superficie-2"
        >
          <LogOut size={16} aria-hidden="true" />
          Sair
        </button>
      </div>

      <div role="tablist" aria-label="Seções da área do RH" className="mt-6 flex gap-1 border-b border-borda">
        {ABAS.map(({ id, rotulo, icone: Icone }, i) => (
          <button
            key={id}
            ref={(el) => (abasRef.current[id] = el)}
            id={`aba-${id}`}
            role="tab"
            type="button"
            aria-selected={aba === id}
            aria-controls={`painel-${id}`}
            tabIndex={aba === id ? 0 : -1}
            onClick={() => setAba(id)}
            onKeyDown={(e) => teclaAba(e, i)}
            className={`-mb-px inline-flex min-h-alvo items-center gap-2 border-b-2 px-4 text-sm font-semibold ${
              aba === id ? 'border-primaria text-primaria' : 'border-transparent text-texto hover:text-primaria'
            }`}
          >
            <Icone size={16} aria-hidden="true" />
            {rotulo}
          </button>
        ))}
      </div>

      <div id={`painel-${aba}`} role="tabpanel" aria-labelledby={`aba-${aba}`} className="pt-6">
        {aba === 'vagas' ? (
          <VagasRh chamar={chamar} regioes={regioes} cursos={cursos} onToast={onToast} />
        ) : (
          <DenunciasRh chamar={chamar} />
        )}
      </div>
    </section>
  );
}

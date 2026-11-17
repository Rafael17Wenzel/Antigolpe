import { useEffect, useState } from 'react';
import { Briefcase, CircleAlert, EyeOff, Info, LoaderCircle, MapPin } from 'lucide-react';

import { listarRegioes, sugerirVagas } from '../api';

const MODALIDADES = { PRESENCIAL: 'Presencial', HIBRIDA: 'Híbrida', REMOTA: 'Remota' };

/**
 * Sugestões opcionais de vagas do cadastro, exibidas depois da orientação e da
 * denúncia. A região é escolhida manualmente (sem GPS e sem usar o prefixo do
 * token). Não há links: a candidatura deve ser feita pelo site oficial.
 */
export default function RegionalSuggestions() {
  const [visivel, setVisivel] = useState(true);
  const [regioes, setRegioes] = useState([]);
  const [uf, setUf] = useState('');
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    listarRegioes().then(setRegioes).catch(() => setRegioes([]));
  }, []);

  useEffect(() => {
    if (!visivel) return undefined;
    let ativo = true;
    sugerirVagas(uf)
      .then((resposta) => ativo && (setDados(resposta), setErro(null)))
      .catch((e) => ativo && (setDados(null), setErro(e.message)))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [uf, visivel]);

  if (!visivel) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={() => {
            setCarregando(true);
            setVisivel(true);
          }}
          className="inline-flex min-h-[32px] items-center gap-1.5 text-sm font-semibold text-primaria hover:underline"
        >
          Mostrar sugestões de vagas
        </button>
      </div>
    );
  }

  return (
    <section
      id="sugestoes"
      aria-labelledby="sugestoes-titulo"
      className="contorno-ac mt-8 rounded-xl border border-borda bg-superficie-2 p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="sugestoes-titulo" className="text-lg font-bold text-texto">
            Vagas do cadastro que podem interessar (opcional)
          </h2>
          <p className="mt-1 text-sm text-texto-suave">
            Escolha uma região, se quiser. Não usamos sua localização.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisivel(false)}
          className="inline-flex min-h-[32px] shrink-0 items-center gap-1.5 text-sm font-semibold text-texto-suave hover:text-texto hover:underline"
        >
          <EyeOff size={15} aria-hidden="true" />
          Ocultar sugestões
        </button>
      </div>

      <div className="mt-4 max-w-sm">
        <label htmlFor="regiao" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-texto">
          Sua região (opcional)
        </label>
        <select
          id="regiao"
          value={uf}
          onChange={(event) => {
            setCarregando(true);
            setUf(event.target.value);
          }}
          className="min-h-alvo w-full rounded-lg border border-borda-forte bg-superficie px-3 text-sm text-texto"
        >
          <option value="">Não informar (somente vagas remotas)</option>
          {regioes.map((r) => (
            <option key={r.uf} value={r.uf}>
              {r.nome} ({r.uf})
            </option>
          ))}
        </select>
      </div>

      <div aria-live="polite" aria-busy={carregando} className="mt-4">
        {carregando && (
          <p className="flex items-center gap-2 text-sm text-texto-suave">
            <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />
            Carregando sugestões…
          </p>
        )}

        {!carregando && erro && (
          <p className="flex items-start gap-2 text-sm text-perigo-texto">
            <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            Não foi possível carregar sugestões agora. Isso não afeta a sua consulta nem a denúncia.
          </p>
        )}

        {!carregando && dados && (
          <>
            <p className="text-xs text-texto-suave">{dados.criterio}</p>

            {dados.vagas.length === 0 ? (
              <p className="mt-3 text-sm text-texto">
                Nenhuma vaga publicada no cadastro para esta escolha no momento.
              </p>
            ) : (
              <ul className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                {dados.vagas.map((v) => {
                  const modalidade = MODALIDADES[v.modalidade] || v.modalidade;
                  const lugar = [v.cidade, v.uf].filter(Boolean).join(' / ');
                  const local = lugar ? `${lugar} · ${modalidade}` : modalidade;
                  return (
                    <li key={v.id} className="rounded-lg border border-borda-forte bg-superficie p-4">
                      <p className="flex items-start gap-2 text-sm font-bold text-texto">
                        <Briefcase size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-primaria" />
                        {v.cargo}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-texto">
                        <MapPin size={14} aria-hidden="true" />
                        {local}
                      </p>
                      <p className="mt-1 text-xs text-texto-suave">Fonte: {v.fonteCadastrada}</p>
                      {v.ficticia && (
                        <p className="mt-2 inline-block rounded border border-alerta-borda bg-alerta-fundo px-2 py-0.5 text-[11px] font-semibold text-alerta-texto">
                          Vaga fictícia de demonstração
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="mt-4 flex items-start gap-1.5 text-xs text-texto">
              <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
              {dados.aviso}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

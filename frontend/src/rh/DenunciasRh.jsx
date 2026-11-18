import { useCallback, useEffect, useState } from 'react';
import { CircleAlert, LoaderCircle, RefreshCw } from 'lucide-react';

import { listarDenunciasRh } from '../api';
import { dataHora } from './util';

/** Lista de denúncias recebidas (somente leitura). */
export default function DenunciasRh({ chamar }) {
  const [denuncias, setDenuncias] = useState(null);
  const [erro, setErro] = useState(null);

  // Atualiza o estado só quando a resposta chega (nunca de forma síncrona no efeito)
  const carregar = useCallback(
    () =>
      chamar(listarDenunciasRh)
        .then((dados) => {
          setDenuncias(dados);
          setErro(null);
        })
        .catch((e) => {
          if (e.status !== 401) setErro(e.message);
        }),
    [chamar],
  );

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-texto">Denúncias recebidas</h3>
          <p className="text-xs text-texto-suave">
            Somente leitura. Tokens aparecem mascarados; denúncias são apagadas após 180 dias.
          </p>
        </div>
        <button
          type="button"
          onClick={carregar}
          className="inline-flex min-h-alvo items-center gap-1.5 rounded-lg border border-borda-forte px-3 text-xs font-semibold text-texto hover:bg-superficie-2"
        >
          <RefreshCw size={14} aria-hidden="true" /> Atualizar
        </button>
      </div>

      {erro && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-perigo-borda bg-perigo-fundo p-3 text-sm text-perigo-texto">
          <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {erro}
        </p>
      )}
      {denuncias === null && !erro && (
        <p className="flex items-center gap-2 text-sm text-texto-suave">
          <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> Carregando denúncias…
        </p>
      )}
      {denuncias?.length === 0 && <p className="text-sm text-texto-suave">Nenhuma denúncia registrada.</p>}

      {denuncias?.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-borda">
          <table className="w-full min-w-[720px] text-left text-sm text-texto">
            <caption className="sr-only">Denúncias recebidas, da mais recente para a mais antiga</caption>
            <thead className="bg-superficie-2 text-xs uppercase tracking-wide">
              <tr>
                <th scope="col" className="px-3 py-2">Protocolo</th>
                <th scope="col" className="px-3 py-2">Recebida em</th>
                <th scope="col" className="px-3 py-2">Link suspeito</th>
                <th scope="col" className="px-3 py-2">Descrição</th>
                <th scope="col" className="px-3 py-2">Contato</th>
              </tr>
            </thead>
            <tbody>
              {denuncias.map((d) => (
                <tr key={d.protocolo} className="border-t border-borda align-top">
                  <th scope="row" className="whitespace-nowrap px-3 py-3 font-mono text-xs font-semibold">{d.protocolo}</th>
                  <td className="whitespace-nowrap px-3 py-3">{dataHora(d.registradaEm)}</td>
                  <td className="max-w-[16rem] break-all px-3 py-3 font-mono text-xs">{d.urlSuspeita}</td>
                  <td className="max-w-[22rem] whitespace-pre-wrap break-words px-3 py-3">{d.descricao}</td>
                  <td className="px-3 py-3 text-xs">
                    {d.emailContato || <span className="text-texto-suave">Não informado</span>}
                    {d.ligadaAValidacao && <span className="mt-0.5 block text-texto-suave">Após uma consulta</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

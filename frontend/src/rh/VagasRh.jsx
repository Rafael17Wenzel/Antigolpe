import { useCallback, useEffect, useState } from 'react';
import { Archive, CircleAlert, Copy, LoaderCircle, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';

import { atualizarVagaRh, criarVagaRh, encerrarVagaRh, excluirVagaRh, listarVagasRh } from '../api';
import VagaFormRh from './VagaFormRh';
import { MODALIDADES, SITUACAO_TOKEN, SITUACOES, copiar, data, rotulo, tokenAtual } from './util';

const botao =
  'inline-flex min-h-alvo items-center gap-1.5 rounded-lg border border-borda-forte px-3 text-xs font-semibold text-texto hover:bg-superficie-2 disabled:opacity-60';

/** Lista de vagas com criar, editar, encerrar e excluir. O token aparece sempre. */
export default function VagasRh({ chamar, regioes, cursos, onToast }) {
  const [vagas, setVagas] = useState(null);
  const [erro, setErro] = useState(null);
  const [form, setForm] = useState(null); // null | { vaga?: VagaView }
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
  const [ocupado, setOcupado] = useState(null);
  const [aviso, setAviso] = useState(null);

  // Atualiza o estado só quando a resposta chega (nunca de forma síncrona no efeito)
  const carregar = useCallback(
    () =>
      chamar(listarVagasRh)
        .then((dados) => {
          setVagas(dados);
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

  async function salvar(dados) {
    const salva = form.vaga
      ? await chamar((t) => atualizarVagaRh(t, form.vaga.id, dados))
      : await chamar((t) => criarVagaRh(t, dados));
    const token = tokenAtual(salva);
    setAviso(
      form.vaga
        ? `Vaga "${salva.cargo}" atualizada. Token em uso: ${token?.codigo ?? '—'}`
        : `Vaga "${salva.cargo}" criada. Token gerado: ${token?.codigo}`,
    );
    setForm(null);
    await carregar();
  }

  async function acao(id, fn, mensagem) {
    setOcupado(id);
    try {
      await chamar(fn);
      setAviso(mensagem);
      setConfirmarExclusao(null);
      await carregar();
    } catch (e) {
      if (e.status !== 401) setErro(e.message);
    } finally {
      setOcupado(null);
    }
  }

  async function copiarToken(codigo) {
    const ok = await copiar(codigo);
    onToast?.(ok ? { message: 'Token copiado.', type: 'success' } : { message: 'Não foi possível copiar.', type: 'error' });
  }

  if (form) {
    return (
      <VagaFormRh
        key={form.vaga?.id ?? 'nova'}
        vaga={form.vaga}
        regioes={regioes}
        cursos={cursos}
        onSalvar={salvar}
        onCancelar={() => setForm(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-texto">Vagas cadastradas</h3>
        <div className="flex gap-2">
          <button type="button" onClick={carregar} className={botao}>
            <RefreshCw size={14} aria-hidden="true" />
            Atualizar
          </button>
          <button
            type="button"
            onClick={() => {
              setAviso(null);
              setForm({});
            }}
            className="inline-flex min-h-alvo items-center gap-2 rounded-lg bg-primaria px-4 text-sm font-bold text-primaria-sobre hover:bg-primaria-escura"
          >
            <Plus size={16} aria-hidden="true" />
            Nova vaga
          </button>
        </div>
      </div>

      <div aria-live="polite">
        {aviso && (
          <p className="rounded-lg border border-sucesso-borda bg-sucesso-fundo p-3 text-sm font-semibold text-sucesso-texto">{aviso}</p>
        )}
      </div>
      {erro && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-perigo-borda bg-perigo-fundo p-3 text-sm text-perigo-texto">
          <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {erro}
        </p>
      )}

      {vagas === null && !erro && (
        <p className="flex items-center gap-2 text-sm text-texto-suave">
          <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> Carregando vagas…
        </p>
      )}

      {vagas?.length === 0 && <p className="text-sm text-texto-suave">Nenhuma vaga cadastrada.</p>}

      {vagas?.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-borda">
          <table className="w-full min-w-[760px] text-left text-sm text-texto">
            <caption className="sr-only">Vagas cadastradas, com token em uso e ações</caption>
            <thead className="bg-superficie-2 text-xs uppercase tracking-wide">
              <tr>
                <th scope="col" className="px-3 py-2">Cargo</th>
                <th scope="col" className="px-3 py-2">Região</th>
                <th scope="col" className="px-3 py-2">Situação</th>
                <th scope="col" className="px-3 py-2">Token em uso</th>
                <th scope="col" className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vagas.map((v) => {
                const token = tokenAtual(v);
                const regiao = v.modalidade === 'REMOTA' && !v.uf
                  ? 'Remota'
                  : `${[v.cidade, v.uf].filter(Boolean).join(' / ')} · ${rotulo(MODALIDADES, v.modalidade)}`;
                return (
                  <tr key={v.id} className="border-t border-borda align-top">
                    <th scope="row" className="px-3 py-3 font-semibold">
                      {v.cargo}
                      {v.ficticia && <span className="mt-0.5 block text-xs font-normal text-texto-suave">Fictícia</span>}
                      {v.cursos.length > 0 && (
                        <span className="mt-0.5 block text-xs font-normal text-texto-suave">{v.cursos.length} curso(s)</span>
                      )}
                    </th>
                    <td className="px-3 py-3">{regiao}</td>
                    <td className="px-3 py-3">{rotulo(SITUACOES, v.situacao)}</td>
                    <td className="px-3 py-3">
                      {token ? (
                        <>
                          <code className="break-all font-mono text-xs" data-testid="token-em-uso">{token.codigo}</code>
                          <span className="block text-xs text-texto-suave">
                            {SITUACAO_TOKEN[token.situacao]} · até {data(token.validoAte)}
                          </span>
                          <button
                            type="button"
                            onClick={() => copiarToken(token.codigo)}
                            aria-label={`Copiar token da vaga ${v.cargo}`}
                            className="mt-1 inline-flex min-h-[32px] items-center gap-1 text-xs font-semibold text-primaria hover:underline"
                          >
                            <Copy size={13} aria-hidden="true" /> Copiar
                          </button>
                          {v.tokens.length > 1 && (
                            <details className="mt-1 text-xs">
                              <summary className="cursor-pointer text-texto-suave">Histórico ({v.tokens.length})</summary>
                              <ul className="mt-1 space-y-1">
                                {v.tokens.map((t) => (
                                  <li key={t.codigo}>
                                    <code className="font-mono">{t.codigo}</code> — {SITUACAO_TOKEN[t.situacao]}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </>
                      ) : (
                        <span className="text-texto-suave">Sem token</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {confirmarExclusao === v.id ? (
                        <div role="group" aria-label={`Confirmar exclusão de ${v.cargo}`} className="space-y-2">
                          <p className="text-xs font-semibold text-perigo-texto">
                            Excluir definitivamente? Os tokens deixam de existir.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              disabled={ocupado === v.id}
                              onClick={() => acao(v.id, (t) => excluirVagaRh(t, v.id), `Vaga "${v.cargo}" excluída.`)}
                              className="inline-flex min-h-alvo items-center gap-1.5 rounded-lg bg-perigo-texto px-3 text-xs font-bold text-superficie disabled:opacity-60"
                            >
                              <Trash2 size={14} aria-hidden="true" /> Confirmar exclusão
                            </button>
                            <button type="button" onClick={() => setConfirmarExclusao(null)} className={botao}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setAviso(null);
                              setForm({ vaga: v });
                            }}
                            aria-label={`Editar ${v.cargo}`}
                            className={botao}
                          >
                            <Pencil size={14} aria-hidden="true" /> Editar
                          </button>
                          <button
                            type="button"
                            disabled={v.situacao === 'ENCERRADA' || ocupado === v.id}
                            onClick={() => acao(v.id, (t) => encerrarVagaRh(t, v.id), `Vaga "${v.cargo}" encerrada.`)}
                            aria-label={`Encerrar ${v.cargo}`}
                            className={botao}
                          >
                            <Archive size={14} aria-hidden="true" /> Encerrar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmarExclusao(v.id)}
                            aria-label={`Excluir ${v.cargo}`}
                            className={`${botao} text-perigo-texto`}
                          >
                            <Trash2 size={14} aria-hidden="true" /> Excluir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

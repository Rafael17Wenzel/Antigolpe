import { useEffect, useRef, useState } from 'react';
import { CircleAlert, LoaderCircle, Save, X } from 'lucide-react';

import { MODALIDADES, SITUACOES, dataIso, tokenAtual } from './util';

const inputClass =
  'min-h-alvo w-full rounded-lg border border-borda-forte bg-superficie px-3 text-sm text-texto placeholder:text-texto-suave disabled:bg-superficie-2';
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-texto';

function inicial(vaga) {
  if (!vaga) {
    const daqui90 = new Date(Date.now() + 90 * 24 * 3600 * 1000);
    return {
      cargo: '',
      modalidade: 'PRESENCIAL',
      uf: '',
      cidade: '',
      fonteCadastrada: '',
      situacao: 'PUBLICADA',
      ficticia: true,
      tokenValidoAte: dataIso(daqui90),
      cursos: [],
    };
  }
  const token = tokenAtual(vaga);
  return {
    cargo: vaga.cargo,
    modalidade: vaga.modalidade,
    uf: vaga.uf ?? '',
    cidade: vaga.cidade ?? '',
    fonteCadastrada: vaga.fonteCadastrada,
    situacao: vaga.situacao,
    ficticia: vaga.ficticia,
    tokenValidoAte: token ? dataIso(token.validoAte) : '',
    cursos: vaga.cursos.map((c) => c.id),
  };
}

/** Formulário de criação/edição de vaga pelo RH. */
export default function VagaFormRh({ vaga, regioes, cursos, onSalvar, onCancelar }) {
  const [f, setF] = useState(() => inicial(vaga));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const tituloRef = useRef(null);
  const [hoje] = useState(() => dataIso(Date.now()));

  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  const campo = (nome) => (e) =>
    setF((atual) => ({ ...atual, [nome]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  function alternarCurso(id) {
    setF((atual) => ({
      ...atual,
      cursos: atual.cursos.includes(id) ? atual.cursos.filter((c) => c !== id) : [...atual.cursos, id],
    }));
  }

  async function enviar(event) {
    event.preventDefault();
    const faltando = [];
    if (!f.cargo.trim()) faltando.push('cargo');
    if (f.modalidade !== 'REMOTA' && !f.uf) faltando.push('UF');
    if (!f.fonteCadastrada.trim()) faltando.push('fonte');
    if (!f.tokenValidoAte) faltando.push('validade do token');
    if (faltando.length) {
      setErro(`Preencha: ${faltando.join(', ')}.`);
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar({ ...f, uf: f.uf || null, cidade: f.cidade.trim() || null });
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  const editando = Boolean(vaga);

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-labelledby="form-vaga-titulo"
      aria-busy={salvando}
      className="contorno-ac space-y-5 rounded-xl border border-borda-forte bg-superficie-2 p-5"
    >
      <h3 id="form-vaga-titulo" ref={tituloRef} tabIndex={-1} className="text-lg font-bold text-texto outline-none">
        {editando ? `Editar vaga: ${vaga.cargo}` : 'Nova vaga'}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="vaga-cargo" className={labelClass}>Cargo *</label>
          <input id="vaga-cargo" value={f.cargo} onChange={campo('cargo')} maxLength={120} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="vaga-modalidade" className={labelClass}>Modalidade *</label>
          <select id="vaga-modalidade" value={f.modalidade} onChange={campo('modalidade')} className={inputClass}>
            {MODALIDADES.map((m) => <option key={m.valor} value={m.valor}>{m.rotulo}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="vaga-uf" className={labelClass}>UF {f.modalidade === 'REMOTA' ? '(opcional)' : '*'}</label>
          <select id="vaga-uf" value={f.uf} onChange={campo('uf')} className={inputClass} aria-describedby="vaga-uf-dica">
            <option value="">{f.modalidade === 'REMOTA' ? 'Sem UF (remota)' : 'Selecione'}</option>
            {regioes.map((r) => <option key={r.uf} value={r.uf}>{r.nome} ({r.uf})</option>)}
          </select>
          <p id="vaga-uf-dica" className="mt-1 text-xs text-texto-suave">
            A UF aparece no prefixo do token. Mudar a região emite um token novo e revoga o anterior.
          </p>
        </div>
        <div>
          <label htmlFor="vaga-cidade" className={labelClass}>Cidade (opcional)</label>
          <input id="vaga-cidade" value={f.cidade} onChange={campo('cidade')} maxLength={100} className={inputClass} />
        </div>
        <div>
          <label htmlFor="vaga-situacao" className={labelClass}>Situação *</label>
          <select id="vaga-situacao" value={f.situacao} onChange={campo('situacao')} className={inputClass}>
            {SITUACOES.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="vaga-fonte" className={labelClass}>Fonte da vaga *</label>
          <input
            id="vaga-fonte"
            value={f.fonteCadastrada}
            onChange={campo('fonteCadastrada')}
            maxLength={200}
            placeholder="Onde a vaga está publicada ou quem a cadastrou"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="vaga-validade" className={labelClass}>Token válido até *</label>
          <input
            id="vaga-validade"
            type="date"
            min={hoje}
            value={f.tokenValidoAte}
            onChange={campo('tokenValidoAte')}
            aria-describedby="vaga-validade-dica"
            className={inputClass}
          />
          <p id="vaga-validade-dica" className="mt-1 text-xs text-texto-suave">Vale até 23h59 (horário de Brasília).</p>
        </div>
        <div className="flex items-end">
          <label htmlFor="vaga-ficticia" className="flex min-h-alvo cursor-pointer items-center gap-2 text-sm font-semibold text-texto">
            <input id="vaga-ficticia" type="checkbox" checked={f.ficticia} onChange={campo('ficticia')} className="h-5 w-5" />
            Vaga fictícia (demonstração)
          </label>
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Cursos recomendados (na ordem em que marcar)</legend>
        <ul className="grid gap-1 sm:grid-cols-2">
          {cursos.map((c) => {
            const posicao = f.cursos.indexOf(c.id);
            return (
              <li key={c.id}>
                <label className="flex min-h-alvo cursor-pointer items-center gap-2 rounded-lg px-2 text-sm text-texto hover:bg-superficie">
                  <input type="checkbox" checked={posicao >= 0} onChange={() => alternarCurso(c.id)} className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{c.titulo}</span>
                  {posicao >= 0 && <span className="text-xs font-bold text-primaria">{posicao + 1}º</span>}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {erro && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-perigo-borda bg-perigo-fundo p-3 text-sm text-perigo-texto">
          <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {erro}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={salvando}
          className="inline-flex min-h-alvo items-center gap-2 rounded-lg bg-primaria px-4 text-sm font-bold text-primaria-sobre hover:bg-primaria-escura disabled:opacity-60"
        >
          {salvando ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <Save size={16} aria-hidden="true" />}
          {editando ? 'Salvar alterações' : 'Criar vaga e gerar token'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="inline-flex min-h-alvo items-center gap-2 rounded-lg border border-borda-forte px-4 text-sm font-semibold text-texto hover:bg-superficie"
        >
          <X size={16} aria-hidden="true" />
          Cancelar
        </button>
      </div>
    </form>
  );
}

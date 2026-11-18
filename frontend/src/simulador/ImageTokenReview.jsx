import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, Search, X } from 'lucide-react';

/**
 * Revisão humana do token extraído (do texto ou do OCR) antes de consultar a API.
 * A pessoa pode corrigir, digitar manualmente ou cancelar. Nada é consultado sem
 * confirmação explícita.
 */
export default function ImageTokenReview({ id, candidato, origem, onConsultar, onCancelar, encerrada }) {
  const [valor, setValor] = useState(candidato || '');
  const [consultando, setConsultando] = useState(false);
  const [erro, setErro] = useState(null);
  const inputRef = useRef(null);
  const campoId = `revisao-${id}`;

  useEffect(() => {
    if (!encerrada) inputRef.current?.focus();
  }, [encerrada]);

  async function consultar(event) {
    event.preventDefault();
    if (!valor.trim()) {
      setErro('Digite o token para consultar, ou cancele.');
      inputRef.current?.focus();
      return;
    }
    setErro(null);
    setConsultando(true);
    try {
      await onConsultar(valor.trim());
    } finally {
      setConsultando(false);
    }
  }

  const titulo = candidato
    ? origem === 'ia'
      ? 'Possível token lido na imagem pela IA (Gemini):'
      : origem === 'imagem'
        ? 'Possível token lido na imagem (leitura experimental):'
        : 'Possível token encontrado no texto:'
    : 'Não identifiquei um token. Se você tiver o token, digite-o abaixo:';

  return (
    <form onSubmit={consultar} noValidate className="space-y-2">
      <label htmlFor={campoId} className="block text-sm font-semibold text-texto">
        {titulo}
      </label>
      <input
        id={campoId}
        ref={inputRef}
        value={valor}
        onChange={(event) => setValor(event.target.value)}
        disabled={encerrada || consultando}
        maxLength={2048}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={Boolean(erro)}
        aria-describedby={`${campoId}-dica${erro ? ` ${campoId}-erro` : ''}`}
        className="min-h-alvo w-full rounded-lg border border-borda-forte bg-superficie px-3 font-mono text-sm text-texto disabled:bg-superficie-2"
      />
      <p id={`${campoId}-dica`} className="text-xs text-texto-suave">
        Confira caractere por caractere e corrija se precisar. A consulta só acontece quando você confirmar.
      </p>
      {erro && (
        <p id={`${campoId}-erro`} role="alert" className="text-xs font-semibold text-perigo-texto">
          {erro}
        </p>
      )}
      {!encerrada && (
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={consultando}
            className="inline-flex min-h-alvo items-center gap-2 rounded-lg bg-primaria px-4 text-sm font-bold text-primaria-sobre hover:bg-primaria-escura disabled:opacity-60"
          >
            {consultando ? (
              <LoaderCircle size={16} aria-hidden="true" className="animate-spin" />
            ) : (
              <Search size={16} aria-hidden="true" />
            )}
            {consultando ? 'Consultando…' : 'Consultar este token'}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            disabled={consultando}
            className="inline-flex min-h-alvo items-center gap-2 rounded-lg border border-borda-forte px-4 text-sm font-semibold text-texto hover:bg-superficie-2"
          >
            <X size={16} aria-hidden="true" />
            Cancelar
          </button>
        </div>
      )}
    </form>
  );
}

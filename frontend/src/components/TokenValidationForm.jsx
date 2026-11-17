import { CircleAlert, Link2, LoaderCircle, Search } from 'lucide-react';

const inputClass =
  'w-full rounded-lg border border-borda-forte bg-superficie px-3 py-2.5 text-sm text-texto placeholder:text-texto-suave transition focus:border-primaria disabled:cursor-not-allowed disabled:bg-superficie-2';

/**
 * Campo único de token ou link. A vaga é identificada pelo backend,
 * nunca por seleção local nem pelo prefixo do token.
 */
export default function TokenValidationForm({
  value,
  onChange,
  onSubmit,
  validating,
  disabled,
  error,
  inputRef,
}) {
  const errorId = 'tokenOuLink-erro';
  const hintId = 'tokenOuLink-dica';

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-busy={validating}
      className="contorno-ac space-y-4 rounded-xl border border-borda bg-superficie-2 p-5 lg:col-span-3"
    >
      <div>
        <label
          htmlFor="tokenOuLink"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-texto"
        >
          Token ou link recebido
        </label>
        <div className="relative">
          <Link2
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-texto-suave"
          />
          <input
            id="tokenOuLink"
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled || validating}
            autoComplete="off"
            spellCheck={false}
            maxLength={2048}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${hintId} ${errorId}` : hintId}
            placeholder="Ex.: BRD-BR-SP-… ou https://…"
            className={`${inputClass} pl-9 font-mono`}
          />
        </div>
        <p id={hintId} className="mt-1 text-[11px] text-texto-suave">
          Cole o token, o link ou o trecho da mensagem. Não precisa escolher o cargo: a vaga é
          identificada pelo token no cadastro.
        </p>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-2 text-xs font-semibold text-perigo-texto"
        >
          <CircleAlert size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || validating}
        className="flex w-full items-center justify-center gap-2 min-h-alvo rounded-lg bg-primaria px-4 py-3 text-sm font-bold text-primaria-sobre shadow-md transition hover:bg-primaria-escura disabled:cursor-not-allowed disabled:opacity-60"
      >
        {validating ? (
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <Search size={18} aria-hidden="true" />
        )}
        {validating ? 'Consultando cadastro…' : 'Validar oportunidade'}
      </button>
    </form>
  );
}

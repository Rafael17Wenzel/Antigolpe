import { useState } from 'react';
import { CheckCircle2, CircleAlert, LoaderCircle, Send, ShieldAlert } from 'lucide-react';

import { registrarDenuncia } from '../api';

const inputClass =
  'w-full rounded-lg border border-borda-forte bg-superficie px-3 py-2.5 text-sm text-texto placeholder:text-texto-suave transition focus:border-primaria disabled:cursor-not-allowed disabled:bg-superficie-2';

const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-texto';

/**
 * Denúncia opcional. Aceita ofertas não cadastradas; nenhuma falha técnica
 * é apresentada como denúncia registrada.
 */
export default function ReportForm({ urlInicial = '', idValidacao, descricaoRef, onToast }) {
  const [urlSuspeita, setUrlSuspeita] = useState(urlInicial);
  const [emailContato, setEmailContato] = useState('');
  const [descricao, setDescricao] = useState('');
  const [aceite, setAceite] = useState(false);
  const [sending, setSending] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!urlSuspeita.trim() || !descricao.trim()) {
      setError('Informe o link suspeito e os detalhes da denúncia.');
      return;
    }
    if (!aceite) {
      setError('Confirme que leu o aviso de privacidade.');
      return;
    }

    setSending(true);
    setReport(null);
    setError(null);

    try {
      const resposta = await registrarDenuncia({
        urlSuspeita: urlSuspeita.trim(),
        emailContato: emailContato.trim(),
        descricao: descricao.trim(),
        idValidacao,
        aceiteAviso: aceite,
      });

      setReport(resposta);
      setDescricao('');
      onToast({ message: `Denúncia registrada: ${resposta.protocolo}`, type: 'success' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  const errorId = 'denuncia-erro';

  return (
    <div
      id="denunciar"
      className="contorno-ac rounded-xl border border-primaria bg-primaria-clara p-5"
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-escuro text-escuro-sobre">
          <ShieldAlert size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-texto">Denunciar (opcional)</h2>
          <p className="text-xs text-texto">
            Protótipo acadêmico: a denúncia não é encaminhada a nenhum sistema externo nem ao
            Bradesco.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="urlSuspeita" className={labelClass}>
            Link, token ou texto suspeito <span aria-hidden="true">*</span>
            <span className="sr-only">(obrigatório)</span>
          </label>
          <input
            id="urlSuspeita"
            value={urlSuspeita}
            onChange={(event) => setUrlSuspeita(event.target.value)}
            disabled={sending}
            required
            maxLength={2048}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(error) && !urlSuspeita.trim()}
            aria-describedby={error ? errorId : undefined}
            placeholder="https://…"
            className={`${inputClass} font-mono`}
          />
        </div>

        <div>
          <label htmlFor="emailContato" className={labelClass}>
            E-mail para contato (opcional)
          </label>
          <input
            id="emailContato"
            type="email"
            value={emailContato}
            onChange={(event) => setEmailContato(event.target.value)}
            disabled={sending}
            autoComplete="email"
            placeholder="voce@exemplo.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="descricao" className={labelClass}>
            Detalhes <span aria-hidden="true">*</span>
            <span className="sr-only">(obrigatório)</span>
          </label>
          <textarea
            id="descricao"
            ref={descricaoRef}
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            disabled={sending}
            required
            rows={3}
            maxLength={2000}
            aria-invalid={Boolean(error) && !descricao.trim()}
            aria-describedby={error ? `descricao-dica ${errorId}` : 'descricao-dica'}
            placeholder="Como você recebeu a mensagem? Pediram pagamento ou dados pessoais?"
            className={`${inputClass} resize-y`}
          />
          <p id="descricao-dica" className="mt-1 text-[11px] text-texto">
            Não inclua senhas, documentos ou dados bancários.
          </p>
        </div>

        <div className="rounded-lg border border-borda-forte bg-superficie p-3 text-xs leading-relaxed text-texto">
          <p id="aviso-privacidade">
            <strong>Aviso de privacidade:</strong> guardamos apenas o que você informar aqui, sem
            IP nem dados do navegador, por até 180 dias. O e-mail é opcional e só serviria para
            contato sobre esta denúncia. O acesso aos registros é restrito e nada é enviado ao
            Bradesco ou a terceiros.
          </p>
          <label htmlFor="aceiteAviso" className="mt-2 flex min-h-[32px] cursor-pointer items-center gap-2 font-semibold">
            <input
              id="aceiteAviso"
              type="checkbox"
              checked={aceite}
              onChange={(event) => setAceite(event.target.checked)}
              disabled={sending}
              aria-describedby="aviso-privacidade"
              aria-invalid={Boolean(error) && !aceite}
              className="h-5 w-5 shrink-0 accent-primaria"
            />
            Li o aviso de privacidade
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div aria-live="polite" className="text-xs">
            {error && (
              <p id={errorId} role="alert" className="flex items-start gap-2 font-semibold text-perigo-texto">
                <CircleAlert size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}
            {report && (
              <p className="flex items-start gap-2 text-sucesso-texto">
                <CheckCircle2 size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span>
                  {report.mensagem} Protocolo:{' '}
                  <strong className="font-mono">{report.protocolo}</strong>
                </span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={sending}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-escuro px-5 py-3 text-sm font-bold text-escuro-sobre shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? (
              <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
            ) : (
              <Send size={17} aria-hidden="true" />
            )}
            {sending ? 'Enviando…' : 'Enviar denúncia'}
          </button>
        </div>
      </form>
    </div>
  );
}

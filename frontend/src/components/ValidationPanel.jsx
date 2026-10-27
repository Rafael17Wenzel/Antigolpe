import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  FileCheck2,
  Link2,
  LoaderCircle,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  TriangleAlert,
} from 'lucide-react';

import {
  listarVagas,
  obterExemplos,
  registrarDenuncia,
  validarVaga,
} from '../api';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-bradesco-red disabled:cursor-not-allowed disabled:bg-gray-100';

const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-700';

function Spinner() {
  return <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />;
}

export default function ValidationPanel({ ref, onToast }) {
  // Dados mockados vindos do backend
  const [vagas, setVagas] = useState([]);
  const [exemplos, setExemplos] = useState(null);
  const [loadingBase, setLoadingBase] = useState(true);
  const [baseError, setBaseError] = useState(null);

  // Validação
  const [vaga, setVaga] = useState('');
  const [tokenOuLink, setTokenOuLink] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Denúncia
  const [urlSuspeita, setUrlSuspeita] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [descricao, setDescricao] = useState('');
  const [sending, setSending] = useState(false);
  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [highlightReport, setHighlightReport] = useState(false);

  const reportRef = useRef(null);
  const descricaoRef = useRef(null);

  // Busca vagas e exemplos mockados no backend
  const buscarBase = useCallback(
    () =>
      Promise.all([listarVagas(), obterExemplos()])
        .then(([listaVagas, listaExemplos]) => {
          setVagas(listaVagas);
          setExemplos(listaExemplos);
        })
        .catch((error) => setBaseError(error.message))
        .finally(() => setLoadingBase(false)),
    [],
  );

  useEffect(() => {
    buscarBase();
  }, [buscarBase]);

  function recarregarBase() {
    setLoadingBase(true);
    setBaseError(null);
    buscarBase();
  }

  const prepararDenuncia = useCallback((link) => {
    setUrlSuspeita(link);
    setReport(null);
    setReportError(null);
    setHighlightReport(true);

    requestAnimationFrame(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      descricaoRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const executarValidacao = useCallback(
    async (vagaId, valor) => {
      setValidating(true);
      setResult(null);
      setValidationError(null);
      setHighlightReport(false);

      try {
        const resposta = await validarVaga(vagaId, valor);
        setResult(resposta);

        if (resposta.valido) {
          onToast({ message: 'Token reconhecido na base fictícia.', type: 'success' });
        } else {
          onToast({
            message: 'Oferta não confirmada. Você pode denunciar o link abaixo.',
            type: 'warning',
          });
          prepararDenuncia(resposta.tokenConsultado);
        }
      } catch (error) {
        setValidationError(error.message);
      } finally {
        setValidating(false);
      }
    },
    [onToast, prepararDenuncia],
  );

  // Testes rápidos disparados pelos botões do Hero (via ref no App)
  useImperativeHandle(
    ref,
    () => ({
      runQuickTest(type) {
        const exemplo = type === 'valid' ? exemplos?.valido : exemplos?.golpe;

        if (!exemplo) {
          onToast({
            message: 'Exemplos indisponíveis: verifique se o backend está executando.',
            type: 'error',
          });
          return;
        }

        setVaga(exemplo.vaga);
        setTokenOuLink(exemplo.tokenOuLink);
        executarValidacao(exemplo.vaga, exemplo.tokenOuLink);
      },
    }),
    [exemplos, executarValidacao, onToast],
  );

  function handleValidar(event) {
    event.preventDefault();

    if (!vaga || !tokenOuLink.trim()) {
      setValidationError('Selecione a vaga e informe o token ou link.');
      return;
    }

    executarValidacao(vaga, tokenOuLink.trim());
  }

  async function handleDenunciar(event) {
    event.preventDefault();

    if (!urlSuspeita.trim() || !descricao.trim()) {
      setReportError('Informe o link suspeito e os detalhes da denúncia.');
      return;
    }

    setSending(true);
    setReport(null);
    setReportError(null);

    try {
      const resposta = await registrarDenuncia({
        urlSuspeita: urlSuspeita.trim(),
        emailContato: emailContato.trim(),
        descricao: descricao.trim(),
      });

      setReport(resposta);
      setHighlightReport(false);
      setDescricao('');
      onToast({ message: `Denúncia simulada: ${resposta.protocolo}`, type: 'success' });
    } catch (error) {
      setReportError(error.message);
    } finally {
      setSending(false);
    }
  }

  const baseIndisponivel = loadingBase || Boolean(baseError);

  return (
    <section
      id="validador"
      aria-labelledby="validador-title"
      className="hc-surface scroll-mt-28 rounded-t-xl bg-white px-5 pt-8 shadow-xl sm:px-8"
    >
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-bradesco-red">
            Verificação demonstrativa
          </span>
          <h2 id="validador-title" className="mt-1 text-xl font-bold text-gray-900">
            Validar vaga ou token
          </h2>
          <p className="hc-muted mt-1 text-sm text-gray-500">
            Selecione o cargo e informe o token ou link recebido. Se a oferta não for
            confirmada, você poderá denunciá-la logo abaixo.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800">
          <ShieldAlert size={14} />
          Base fictícia — dados mockados
        </span>
      </div>

      {baseError && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-start gap-2">
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            {baseError}
          </span>
          <button
            type="button"
            onClick={recarregarBase}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-bradesco-red px-3 py-2 text-xs font-bold text-white transition hover:bg-bradesco-darkRed"
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Formulário de validação */}
        <form
          onSubmit={handleValidar}
          noValidate
          className="hc-surface space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:col-span-3"
        >
          <div>
            <label htmlFor="vaga" className={labelClass}>
              Cargo da vaga
            </label>
            <div className="relative">
              <Briefcase
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              />
              <select
                id="vaga"
                value={vaga}
                onChange={(event) => setVaga(event.target.value)}
                disabled={baseIndisponivel || validating}
                className={`${inputClass} appearance-none pl-9 pr-9`}
              >
                <option value="">
                  {loadingBase ? 'Carregando vagas…' : 'Selecione o cargo'}
                </option>
                {vagas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.cargo}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tokenOuLink" className={labelClass}>
              Token ou link recebido
            </label>
            <div className="relative">
              <Link2
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              />
              <input
                id="tokenOuLink"
                value={tokenOuLink}
                onChange={(event) => setTokenOuLink(event.target.value)}
                disabled={baseIndisponivel || validating}
                autoComplete="off"
                spellCheck={false}
                placeholder="Ex.: BRD-0000-XXXX ou https://…"
                className={`${inputClass} pl-9 font-mono`}
              />
            </div>
          </div>

          {validationError && (
            <p role="alert" className="flex items-start gap-2 text-xs font-semibold text-red-700">
              <CircleAlert size={15} className="mt-0.5 shrink-0" />
              {validationError}
            </p>
          )}

          <button
            type="submit"
            disabled={baseIndisponivel || validating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-bradesco-red px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-bradesco-darkRed disabled:cursor-not-allowed disabled:opacity-60"
          >
            {validating ? <Spinner /> : <Search size={18} />}
            {validating ? 'Consultando base…' : 'Validar oportunidade'}
          </button>
        </form>

        {/* Resultado */}
        <div className="lg:col-span-2" aria-live="polite">
          {!result && (
            <div className="hc-surface flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
              <FileCheck2 size={36} className="mb-3 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">Nenhuma consulta ainda</p>
              <p className="hc-muted mt-1 text-xs text-gray-400">
                O resultado da validação aparecerá aqui.
              </p>
            </div>
          )}

          {result?.valido && (
            <article className="h-full rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-emerald-800">
                <BadgeCheck size={26} />
                <h3 className="text-base font-bold">Vaga reconhecida</h3>
              </div>
              <p className="text-sm leading-relaxed text-emerald-900">{result.mensagem}</p>
              <dl className="mt-4 space-y-2 border-t border-emerald-200 pt-4 text-xs text-emerald-900">
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold">Cargo</dt>
                  <dd className="text-right">{result.vaga}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold">Token</dt>
                  <dd className="break-all text-right font-mono">{result.tokenConsultado}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold">Status</dt>
                  <dd className="font-mono">{result.status}</dd>
                </div>
              </dl>
              <p className="mt-4 flex items-start gap-1.5 text-[11px] text-emerald-800">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                Mesmo assim, nunca pague taxas nem informe senhas.
              </p>
            </article>
          )}

          {result && !result.valido && (
            <article className="h-full rounded-xl border border-amber-300 bg-amber-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-amber-800">
                <TriangleAlert size={26} />
                <h3 className="text-base font-bold">Oferta não confirmada</h3>
              </div>
              <p className="text-sm leading-relaxed text-amber-900">{result.mensagem}</p>
              <dl className="mt-4 space-y-2 border-t border-amber-200 pt-4 text-xs text-amber-900">
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold">Cargo</dt>
                  <dd className="text-right">{result.vaga}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold">Consultado</dt>
                  <dd className="break-all text-right font-mono">{result.tokenConsultado}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold">Status</dt>
                  <dd className="font-mono">{result.status}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => prepararDenuncia(result.tokenConsultado)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-bradesco-red hover:underline"
              >
                <Send size={14} />
                Denunciar este link
              </button>
            </article>
          )}
        </div>
      </div>

      {/* Denúncia */}
      <div
        id="denunciar"
        ref={reportRef}
        className={`hc-surface mt-8 scroll-mt-28 rounded-xl border p-5 transition ${
          highlightReport
            ? 'border-bradesco-red bg-bradesco-lightRed ring-4 ring-red-100'
            : 'border-gray-200 bg-white'
        }`}
      >
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white">
            <ShieldAlert size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Denunciar phishing</h2>
            <p className="hc-muted text-xs text-gray-500">
              Envio simulado: a denúncia gera um protocolo fictício e não é encaminhada a
              nenhum sistema externo.
            </p>
          </div>
        </div>

        <form onSubmit={handleDenunciar} noValidate className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="urlSuspeita" className={labelClass}>
              Link ou token suspeito *
            </label>
            <input
              id="urlSuspeita"
              value={urlSuspeita}
              onChange={(event) => setUrlSuspeita(event.target.value)}
              disabled={sending}
              autoComplete="off"
              spellCheck={false}
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
              autoComplete="off"
              placeholder="voce@exemplo.com"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="descricao" className={labelClass}>
              Detalhes *
            </label>
            <textarea
              id="descricao"
              ref={descricaoRef}
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              disabled={sending}
              rows={3}
              placeholder="Como você recebeu a mensagem? Pediram pagamento ou dados pessoais?"
              className={`${inputClass} resize-y`}
            />
            <p className="hc-muted mt-1 text-[11px] text-gray-500">
              Não inclua senhas, documentos ou dados bancários.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
            <div aria-live="polite" className="text-xs">
              {reportError && (
                <p role="alert" className="flex items-start gap-2 font-semibold text-red-700">
                  <CircleAlert size={15} className="mt-0.5 shrink-0" />
                  {reportError}
                </p>
              )}
              {report && (
                <p className="flex items-start gap-2 text-emerald-800">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
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
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? <Spinner /> : <Send size={17} />}
              {sending ? 'Enviando…' : 'Enviar denúncia simulada'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

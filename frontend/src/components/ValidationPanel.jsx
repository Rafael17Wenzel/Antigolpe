import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleAlert, RefreshCw, ShieldAlert } from 'lucide-react';

import CourseRecommendations from './CourseRecommendations';
import RegionalSuggestions from './RegionalSuggestions';
import ReportForm from './ReportForm';
import TokenValidationForm from './TokenValidationForm';
import ValidationResult from './ValidationResult';
import { validarVaga } from '../api';

/**
 * Orquestra a validação: campo único -> backend identifica a vaga pelo token ->
 * resultado, cursos e (se não confirmado) denúncia opcional.
 */
export default function ValidationPanel({ onToast }) {
  const [tokenOuLink, setTokenOuLink] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [consultado, setConsultado] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [serviceError, setServiceError] = useState(null);

  const inputRef = useRef(null);
  const resultHeadingRef = useRef(null);
  const resultadoNegativoRef = useRef(null);
  const descricaoRef = useRef(null);

  const rolarParaDenuncia = useCallback(() => {
    resultadoNegativoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    descricaoRef.current?.focus({ preventScroll: true });
  }, []);

  // Positivo: foco no título do resultado, sem rolar. Negativo: rola até denúncia e cursos.
  useEffect(() => {
    if (!result) return;
    if (result.status === 'CONFIRMADO') {
      resultHeadingRef.current?.focus({ preventScroll: true });
    } else {
      rolarParaDenuncia();
    }
  }, [result, rolarParaDenuncia]);

  const executarValidacao = useCallback(
    async (valor) => {
      setValidating(true);
      setResult(null);
      setValidationError(null);
      setServiceError(null);

      try {
        const resposta = await validarVaga(valor);
        setConsultado(valor);
        setResult(resposta);

        onToast(
          resposta.status === 'CONFIRMADO'
            ? { message: 'Token encontrado no cadastro do protótipo.', type: 'success' }
            : { message: 'Oferta não confirmada. Veja as orientações abaixo.', type: 'warning' },
        );
      } catch (error) {
        // 400: problema na entrada. Demais: falha técnica, nunca resultado negativo.
        if (error.status === 400) {
          setValidationError(error.message);
          inputRef.current?.focus();
        } else {
          setServiceError(error.message);
        }
      } finally {
        setValidating(false);
      }
    },
    [onToast],
  );

  function handleValidar(event) {
    event.preventDefault();
    const valor = tokenOuLink.trim();

    if (!valor) {
      setValidationError('Informe o token ou link recebido.');
      inputRef.current?.focus();
      return;
    }

    executarValidacao(valor);
  }

  const confirmado = result?.status === 'CONFIRMADO';

  return (
    <section
      id="validador"
      aria-labelledby="validador-title"
      className="contorno-ac scroll-mt-28 rounded-t-xl bg-superficie px-5 pt-8 shadow-xl sm:px-8"
    >
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primaria">
            Verificação demonstrativa
          </span>
          <h2 id="validador-title" className="mt-1 text-xl font-bold text-texto">
            Validar vaga ou token
          </h2>
          <p className="mt-1 text-sm text-texto-suave">
            Informe o token ou link recebido. Se a oferta não for confirmada, você verá
            orientações e poderá denunciá-la.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-alerta-borda bg-alerta-fundo px-3 py-1 text-[11px] font-semibold text-alerta-texto">
          <ShieldAlert size={14} aria-hidden="true" />
          Cadastro fictício — dados de demonstração
        </span>
      </div>

      {serviceError && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 rounded-lg border border-perigo-borda bg-perigo-fundo p-4 text-sm text-perigo-texto sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-start gap-2">
            <CircleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
            {serviceError}
          </span>
          <button
            type="button"
            onClick={() => executarValidacao(tokenOuLink.trim())}
            disabled={!tokenOuLink.trim() || validating}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primaria px-3 py-2 text-xs font-bold text-primaria-sobre transition hover:bg-primaria-escura disabled:opacity-60"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <TokenValidationForm
          value={tokenOuLink}
          onChange={setTokenOuLink}
          onSubmit={handleValidar}
          validating={validating}
          error={validationError}
          inputRef={inputRef}
        />

        <div className="lg:col-span-2" aria-live="polite" data-testid="resultado">
          <ValidationResult
            result={result}
            onDenunciar={rolarParaDenuncia}
            headingRef={resultHeadingRef}
          />
        </div>
      </div>

      {/* Confirmado: cursos do cargo, sem rolagem */}
      {confirmado && (
        <CourseRecommendations
          modo="valido"
          cargo={result.vaga?.cargo}
          cursos={result.cursosRecomendados}
          onToast={onToast}
        />
      )}

      {/* Não confirmado: denúncia (esquerda) e cursos de acolhimento (direita) */}
      {result && !confirmado && (
        <div
          ref={resultadoNegativoRef}
          className="mt-8 grid scroll-mt-28 grid-cols-1 items-start gap-6 lg:grid-cols-2"
        >
          <ReportForm
            key={result.idValidacao}
            urlInicial={consultado}
            idValidacao={result.idValidacao}
            descricaoRef={descricaoRef}
            onToast={onToast}
          />

          <CourseRecommendations
            modo="invalido"
            cursos={result.cursosRecomendados}
            compact
            onToast={onToast}
          />
        </div>
      )}

      {/* Não confirmado: sugestões opcionais, depois da orientação e da denúncia */}
      {result && !confirmado && <RegionalSuggestions key={result.idValidacao} />}
    </section>
  );
}

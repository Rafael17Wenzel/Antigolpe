import { CheckCircle2, ShieldCheck, TriangleAlert } from 'lucide-react';

export default function Hero({ onQuickTest }) {
  return (
    <section
      aria-labelledby="titulo-principal"
      className="contorno-ac relative overflow-hidden bg-gradient-to-r from-heroi to-heroi-fim px-4 py-12 text-heroi-sobre sm:px-6 lg:px-8"
    >
      <ShieldCheck
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-72 w-72 opacity-10"
        strokeWidth={1}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-heroi-sobre/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck size={15} aria-hidden="true" />
            Segurança e prevenção a fraudes
          </p>

          <h1 id="titulo-principal" className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Validação de Vagas e Transparência
          </h1>

          <p className="mt-4 max-w-2xl text-base text-heroi-sobre-suave sm:text-lg">
            Recebeu uma proposta de emprego? Use este protótipo acadêmico para aprender a
            identificar sinais de fraude e consultar tokens e links em um cadastro de demonstração.
          </p>

          <p className="mt-3 text-sm font-semibold text-heroi-sobre">
            Protótipo acadêmico, não oficial. Não insira senhas, documentos ou dados bancários.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onQuickTest('valid')}
              className="flex min-h-alvo items-center gap-2 rounded-lg bg-superficie px-4 text-sm font-bold text-primaria shadow-md transition hover:bg-primaria-clara"
            >
              <CheckCircle2 size={18} aria-hidden="true" />
              Simular vaga cadastrada
            </button>

            <button
              type="button"
              onClick={() => onQuickTest('phishing')}
              className="flex min-h-alvo items-center gap-2 rounded-lg border border-heroi-sobre bg-escuro px-4 text-sm font-bold text-escuro-sobre shadow-md transition hover:opacity-90"
            >
              <TriangleAlert size={18} aria-hidden="true" />
              Simular golpe / phishing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

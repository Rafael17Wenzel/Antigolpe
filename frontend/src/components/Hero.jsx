import { ShieldCheck, CheckCircle2, TriangleAlert } from 'lucide-react';

export default function Hero({ onQuickTest }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-bradesco-red via-red-700 to-red-900 px-4 py-12 text-white sm:px-6 lg:px-8">
      <ShieldCheck
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-72 w-72 opacity-10"
        strokeWidth={1}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            <ShieldCheck size={15} />
            Segurança e prevenção a fraudes
          </span>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Validação de Vagas e Transparência
          </h1>

          <p className="mt-4 max-w-2xl text-base font-light text-red-100 sm:text-lg">
            Recebeu uma proposta de emprego? Utilize este protótipo
            acadêmico para aprender a identificar sinais de fraude e
            verificar exemplos de tokens e links.
          </p>

          <p className="mt-3 text-xs text-red-100">
            Demonstração não oficial. Não insira senhas, documentos ou
            dados bancários.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onQuickTest('valid')}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-bradesco-red shadow-md transition hover:bg-red-50 sm:text-sm"
            >
              <CheckCircle2 size={18} className="text-emerald-600" />
              Simular Vaga Válida
            </button>

            <button
              type="button"
              onClick={() => onQuickTest('phishing')}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-black sm:text-sm"
            >
              <TriangleAlert size={18} className="text-amber-400" />
              Simular Golpe / Phishing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

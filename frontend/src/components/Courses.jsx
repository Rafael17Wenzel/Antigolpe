import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Clock,
  CodeXml,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';

const CATALOGO_URL = 'https://www.ev.org.br/';

// Ícone e cor por categoria do catálogo da Escola Virtual
const categorias = {
  'Tecnologia da Informação': { icon: ShieldCheck, color: 'bg-blue-100 text-blue-700' },
  Programação: { icon: CodeXml, color: 'bg-gray-200 text-gray-800' },
  'Negócios e Inovação': { icon: Briefcase, color: 'bg-emerald-100 text-emerald-700' },
  'Desenvolvimento Pessoal e Profissional': {
    icon: GraduationCap,
    color: 'bg-red-100 text-bradesco-red',
  },
};

const categoriaPadrao = { icon: GraduationCap, color: 'bg-red-100 text-bradesco-red' };

function cabecalho(contexto) {
  const cargo = contexto?.cargo;

  switch (contexto?.modo) {
    case 'valido':
      return {
        titulo: 'Comece estudando com a gente:',
        subtitulo: `Cursos selecionados para a vaga de ${cargo}.`,
      };
    case 'invalido':
      return {
        titulo: 'Não desista: seu próximo passo começa aqui',
        subtitulo:
          'Essa oferta não foi confirmada, mas você pode se preparar para oportunidades reais com estes cursos gratuitos.',
      };
    case 'cargo':
      return {
        titulo: 'Cursos recomendados',
        subtitulo: `Sugestões educativas para a vaga de ${cargo}.`,
      };
    default:
      return {
        titulo: 'Cursos recomendados',
        subtitulo: 'Sugestões educativas para desenvolver suas habilidades.',
      };
  }
}

export default function Courses({ contexto, onToast }) {
  const { titulo, subtitulo } = cabecalho(contexto);
  const cursos = contexto?.cursos ?? [];
  const modo = contexto?.modo;

  return (
    <section
      id="cursos"
      aria-live="polite"
      className="mt-12 scroll-mt-28 border-t border-gray-200 pt-8"
    >
      <div
        className={`mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center ${
          modo === 'valido'
            ? 'hc-surface rounded-xl border border-emerald-200 bg-emerald-50 p-5'
            : modo === 'invalido'
              ? 'hc-surface rounded-xl border border-red-200 bg-bradesco-lightRed p-5'
              : ''
        }`}
      >
        <div className="flex items-start gap-3">
          {modo === 'valido' && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <BadgeCheck size={21} />
            </span>
          )}

          {modo === 'invalido' && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bradesco-red text-white">
              <HeartHandshake size={21} />
            </span>
          )}

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-bradesco-red">
              Capacitação e acolhimento
            </span>

            <h2 className="mt-1 text-xl font-bold text-gray-900">{titulo}</h2>

            <p className="hc-muted mt-1 text-sm text-gray-500">{subtitulo}</p>
          </div>
        </div>

        <a
          href={CATALOGO_URL}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-bradesco-red hover:underline"
        >
          Acessar Escola Virtual
          <ExternalLink size={14} />
        </a>
      </div>

      {cursos.length === 0 ? (
        <p className="hc-muted rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
          Sugestões de cursos indisponíveis no momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cursos.map((curso) => {
            const { icon: Icon, color } = categorias[curso.categoria] ?? categoriaPadrao;

            return (
              <article
                key={curso.id}
                className="hc-surface flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
                    >
                      <Icon size={21} />
                    </div>

                    <span className="hc-muted text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      {curso.categoria}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900">{curso.titulo}</h3>

                  <p className="hc-muted mt-2 text-xs leading-relaxed text-gray-500">
                    {curso.descricao}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <a
                    href={CATALOGO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="hc-muted flex items-center gap-1.5 text-xs text-gray-500 hover:text-bradesco-red hover:underline"
                  >
                    <Clock size={14} />
                    Consulte a carga horária
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      onToast({
                        message:
                          'Consulte o catálogo oficial para verificar os cursos disponíveis.',
                        type: 'course',
                      })
                    }
                    className="flex shrink-0 items-center gap-1 text-xs font-bold text-bradesco-red hover:underline"
                  >
                    Saiba mais
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

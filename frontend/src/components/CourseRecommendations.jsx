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
  'Tecnologia da Informação': { icon: ShieldCheck, color: 'bg-info-fundo text-info-texto' },
  Programação: { icon: CodeXml, color: 'bg-superficie-2 text-texto' },
  'Negócios e Inovação': { icon: Briefcase, color: 'bg-sucesso-fundo text-sucesso-texto' },
  'Desenvolvimento Pessoal e Profissional': {
    icon: GraduationCap,
    color: 'bg-primaria-clara text-primaria',
  },
};

const categoriaPadrao = { icon: GraduationCap, color: 'bg-primaria-clara text-primaria' };

function cabecalho(modo, cargo) {
  if (modo === 'valido') {
    return {
      titulo: 'Comece estudando com a gente:',
      subtitulo: `Cursos selecionados para a vaga de ${cargo}.`,
    };
  }

  return {
    titulo: 'Não desista: seu próximo passo começa aqui',
    subtitulo:
      'Essa oferta não foi confirmada, mas você pode se preparar para oportunidades reais com estes cursos gratuitos.',
  };
}

/**
 * Exibida somente após uma validação.
 * modo: 'valido' | 'invalido'
 * compact: layout de coluna (usado ao lado do formulário de denúncia)
 */
export default function CourseRecommendations({ modo, cargo, cursos = [], compact = false, onToast }) {
  const { titulo, subtitulo } = cabecalho(modo, cargo);

  return (
    <section
      id="cursos"
      aria-live="polite"
      className={compact ? '' : 'mt-8'}
    >
      <div
        className={`mb-6 flex flex-col items-start justify-between gap-3 ${
          compact ? '' : 'sm:flex-row sm:items-center'
        } ${
          modo === 'valido'
            ? 'contorno-ac rounded-xl border border-sucesso-borda bg-sucesso-fundo p-5'
            : 'contorno-ac rounded-xl border border-perigo-borda bg-primaria-clara p-5'
        }`}
      >
        <div className="flex items-start gap-3">
          {modo === 'valido' && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sucesso-forte text-sobre-forte">
              <BadgeCheck size={21} aria-hidden="true" />
            </span>
          )}

          {modo === 'invalido' && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primaria text-primaria-sobre">
              <HeartHandshake size={21} aria-hidden="true" />
            </span>
          )}

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primaria">
              Capacitação e acolhimento
            </span>

            <h2 className="mt-1 text-xl font-bold text-texto">{titulo}</h2>

            <p className="mt-1 text-sm text-texto-suave">{subtitulo}</p>
          </div>
        </div>

        <a
          href={CATALOGO_URL}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-[32px] shrink-0 items-center gap-1 text-sm font-bold text-primaria hover:underline"
        >
          Acessar Escola Virtual
          <ExternalLink size={14} aria-hidden="true" />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </div>

      {cursos.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-borda p-6 text-center text-sm text-texto-suave">
          Sugestões de cursos indisponíveis no momento.
        </p>
      ) : (
        <div
          className={`grid grid-cols-1 ${
            compact ? 'gap-4 sm:grid-cols-2' : 'gap-6 md:grid-cols-3'
          }`}
        >
          {cursos.map((curso) => {
            const { icon: Icon, color } = categorias[curso.categoria] ?? categoriaPadrao;

            return (
              <article
                key={curso.id}
                className="contorno-ac flex flex-col justify-between rounded-xl border border-borda bg-superficie p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
                    >
                      <Icon size={21} aria-hidden="true" />
                    </div>

                    <span className="text-right text-[10px] font-semibold uppercase tracking-wide text-texto-suave">
                      {curso.categoria}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-texto">{curso.titulo}</h3>

                  <p className="mt-2 text-xs leading-relaxed text-texto-suave">
                    {curso.descricao}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-borda pt-4">
                  <a
                    href={CATALOGO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-[32px] items-center gap-1.5 text-xs text-texto-suave hover:text-primaria hover:underline"
                  >
                    <Clock size={14} aria-hidden="true" />
                    Consulte a carga horária
                    <span className="sr-only">no catálogo (abre em nova aba)</span>
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
                    className="flex min-h-[32px] shrink-0 items-center gap-1 text-sm font-bold text-primaria hover:underline"
                  >
                    Saiba mais
                    <ArrowRight size={14} aria-hidden="true" />
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

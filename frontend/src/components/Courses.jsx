import {
  LockKeyhole,
  ShieldCheck,
  FileLock2,
  Clock,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

const courses = [
  {
    title: 'Segurança da Informação no Dia a Dia',
    description:
      'Aprenda a proteger dados pessoais, cuidar das senhas e identificar tentativas de phishing e engenharia social.',
    duration: '12h',
    icon: LockKeyhole,
    color: 'bg-red-100 text-bradesco-red',
  },
  {
    title: 'Fundamentos de Cibersegurança',
    description:
      'Conheça conceitos de redes, defesa cibernética e boas práticas de segurança digital.',
    duration: '20h',
    icon: ShieldCheck,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'LGPD e Proteção de Dados',
    description:
      'Entenda princípios da proteção de dados pessoais e os cuidados necessários em processos seletivos.',
    duration: '15h',
    icon: FileLock2,
    color: 'bg-emerald-100 text-emerald-700',
  },
];

export default function Courses({ onToast }) {
  return (
    <section
      id="cursos"
      className="mt-12 scroll-mt-28 border-t border-gray-200 pt-8"
    >
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-bradesco-red">
            Capacitação e acolhimento
          </span>

          <h2 className="mt-1 text-xl font-bold text-gray-900">
            Cursos recomendados
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Sugestões educativas para desenvolver suas habilidades.
          </p>
        </div>

        <a
          href="https://www.ev.org.br/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-bold text-bradesco-red hover:underline"
        >
          Acessar Escola Virtual
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {courses.map((course) => {
          const Icon = course.icon;

          return (
            <article
              key={course.title}
              className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${course.color}`}
                >
                  <Icon size={21} />
                </div>

                <h3 className="text-sm font-bold text-gray-900">
                  {course.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  {course.description}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={14} />
                  {course.duration} · Sugestão educativa
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onToast({
                      message:
                        'Consulte o catálogo oficial para verificar os cursos disponíveis.',
                      type: 'course',
                    })
                  }
                  className="flex items-center gap-1 text-xs font-bold text-bradesco-red hover:underline"
                >
                  Saiba mais
                  <ArrowRight size={14} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

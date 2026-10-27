import { useEffect } from 'react';
import {
  X,
  Network,
  Monitor,
  Server,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

const layers = [
  {
    title: '1. Camada Client — React',
    description:
      'Interface responsiva, seletor de cargo, formulário de validação, formulário demonstrativo de denúncia e apresentação dos resultados.',
    icon: Monitor,
    color: 'text-bradesco-red',
  },
  {
    title: '2. Camada Server — API',
    description:
      'API Spring Boot com dados mockados em memória: lista as vagas fictícias, valida o token de acordo com o cargo selecionado e registra denúncias simuladas com protocolo fictício.',
    icon: Server,
    color: 'text-gray-800',
  },
  {
    title: '3. Segurança e prevenção a fraudes',
    description:
      'Integrações futuras com sistemas autorizados de recrutamento e segurança, com registro de eventos, monitoramento e tratamento de incidentes.',
    icon: ShieldCheck,
    color: 'text-blue-700',
  },
  {
    title: '4. Conteúdo educativo',
    description:
      'Links externos para materiais de capacitação e informações sobre proteção de dados e segurança digital.',
    icon: GraduationCap,
    color: 'text-emerald-700',
  },
];

export default function ArchitectureModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="architecture-title"
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar arquitetura"
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
        >
          <X size={22} />
        </button>

        <div className="mb-6 flex items-center gap-3 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-bradesco-red text-white">
            <Network size={23} />
          </div>

          <div>
            <h2
              id="architecture-title"
              className="text-lg font-bold text-gray-900"
            >
              Arquitetura da solução
            </h2>
            <p className="text-xs text-gray-500">
              Visão conceitual do protótipo acadêmico
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {layers.map((layer) => {
            const Icon = layer.icon;

            return (
              <article
                key={layer.title}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <h3
                  className={`mb-2 flex items-center gap-2 text-sm font-bold ${layer.color}`}
                >
                  <Icon size={18} />
                  {layer.title}
                </h3>

                <p className="text-xs leading-relaxed text-gray-700">
                  {layer.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
          <strong>Estado atual:</strong> o frontend React consome uma API
          Spring Boot com dados mockados. Não há base oficial de vagas,
          integração com SIEM nem envio real de denúncias.
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-3 text-xs font-bold text-white transition hover:bg-black"
          >
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}

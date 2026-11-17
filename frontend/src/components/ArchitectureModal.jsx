import { useEffect, useRef } from 'react';
import { Database, GraduationCap, Monitor, Network, Server, ShieldCheck, X } from 'lucide-react';

const layers = [
  {
    title: '1. Cliente — React',
    description:
      'Interface responsiva e acessível: campo único de token ou link, resultado, cursos e formulário de denúncia.',
    icon: Monitor,
  },
  {
    title: '2. API — Spring Boot',
    description:
      'Identifica a vaga pelo token (busca por HMAC), aplica as regras de validação e devolve uma resposta pública que não permite enumerar tokens.',
    icon: Server,
  },
  {
    title: '3. Banco — PostgreSQL',
    description:
      'Vagas, regiões, tokens (somente o HMAC, nunca o valor em claro) e cursos, com esquema versionado por migrations Flyway.',
    icon: Database,
  },
  {
    title: '4. Segurança e privacidade',
    description:
      'Links nunca são acessados pelo servidor; mesma resposta para token desconhecido, expirado ou revogado; falha técnica nunca vira "golpe".',
    icon: ShieldCheck,
  },
  {
    title: '5. Conteúdo educativo',
    description: 'Links para o catálogo público da Escola Virtual da Fundação Bradesco.',
    icon: GraduationCap,
  },
];

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal: foco inicial no botão de fechar, foco preso dentro do diálogo,
 * Escape fecha e o foco volta para o elemento que abriu.
 */
export default function ArchitectureModal({ open, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const anterior = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focaveis = [...dialogRef.current.querySelectorAll(FOCAVEIS)];
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (event.shiftKey && document.activeElement === primeiro) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (anterior instanceof HTMLElement) anterior.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-escuro/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="architecture-title"
        aria-describedby="architecture-desc"
        className="contorno-ac relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-superficie p-6 text-texto shadow-2xl sm:p-8"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar arquitetura"
          className="absolute right-4 top-4 flex min-h-alvo min-w-[44px] items-center justify-center rounded-lg text-texto-suave transition hover:bg-superficie-2 hover:text-texto"
        >
          <X size={22} aria-hidden="true" />
        </button>

        <div className="mb-6 flex items-center gap-3 pr-12">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primaria text-primaria-sobre">
            <Network size={23} aria-hidden="true" />
          </div>
          <div>
            <h2 id="architecture-title" className="text-lg font-bold text-texto">
              Arquitetura da solução
            </h2>
            <p id="architecture-desc" className="text-xs text-texto-suave">
              Visão do protótipo acadêmico como implementado
            </p>
          </div>
        </div>

        <ul className="space-y-4">
          {layers.map((layer) => {
            const Icon = layer.icon;
            return (
              <li key={layer.title} className="rounded-lg border border-borda bg-superficie-2 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-texto">
                  <Icon size={18} aria-hidden="true" className="text-primaria" />
                  {layer.title}
                </h3>
                <p className="text-sm leading-relaxed text-texto">{layer.description}</p>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 rounded-lg border border-alerta-borda bg-alerta-fundo p-4 text-sm leading-relaxed text-alerta-texto">
          <strong>Estado atual:</strong> cadastro com vagas fictícias de demonstração. Não há
          integração com sistemas do Bradesco, ATS, SIEM ou WhatsApp, nem envio real de denúncias.
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-alvo rounded-lg bg-escuro px-5 text-sm font-bold text-escuro-sobre transition hover:opacity-90"
          >
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}

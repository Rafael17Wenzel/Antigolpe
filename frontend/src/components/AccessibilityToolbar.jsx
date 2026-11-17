import { ArrowDown, Contrast, Info } from 'lucide-react';

/**
 * Barra de acessibilidade: pular para o conteúdo, alto contraste e o aviso
 * permanente de que este é um protótipo acadêmico, não um canal oficial.
 */
export default function AccessibilityToolbar({ altoContraste, onAlternarContraste }) {
  return (
    <div className="contorno-ac bg-escuro px-4 py-2 text-xs text-escuro-sobre">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div role="group" aria-label="Acessibilidade" className="flex flex-wrap items-center gap-2">
          <a
            href="#conteudo-principal"
            className="inline-flex min-h-[32px] items-center gap-1 rounded px-2 underline-offset-2 hover:underline"
          >
            <ArrowDown size={14} aria-hidden="true" />
            Ir ao conteúdo
          </a>

          <button
            type="button"
            onClick={onAlternarContraste}
            aria-pressed={altoContraste}
            className={`inline-flex min-h-[32px] items-center gap-1.5 rounded border border-escuro-sobre-suave px-2.5 font-semibold transition ${
              altoContraste
                ? 'bg-escuro-sobre text-escuro'
                : 'hover:bg-escuro-sobre hover:text-escuro'
            }`}
          >
            <Contrast size={15} aria-hidden="true" />
            Alto contraste
          </button>
        </div>

        <p className="inline-flex items-center gap-1.5 font-semibold text-escuro-sobre">
          <Info size={14} aria-hidden="true" />
          Protótipo acadêmico — não é canal oficial do Bradesco
        </p>
      </div>
    </div>
  );
}

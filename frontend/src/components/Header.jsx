import { useState } from 'react';
import {
  Building2,
  Menu,
  X,
  Network,
  ShieldCheck,
} from 'lucide-react';

const links = [
  { href: '#validador', label: 'Validar Vaga/Token' },
  { href: '#faq', label: 'Dicas de Segurança' },
];

export default function Header({ onOpenArchitecture }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function navigateTo() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-bradesco-red bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <a
            href="#topo"
            aria-label="Ir ao início do protótipo"
            className="flex shrink-0 items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bradesco-red text-white shadow-md">
              <Building2 size={24} />
            </span>

            <span>
              <span className="block text-2xl font-extrabold leading-none tracking-tight text-bradesco-red">
                bradesco
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Segurança & Vagas
              </span>
            </span>
          </a>

          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-5 text-sm font-medium text-gray-700 lg:flex"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={navigateTo}
                className="border-b-2 border-transparent py-2 transition hover:border-bradesco-red hover:text-bradesco-red"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={onOpenArchitecture}
            className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-200 xl:flex"
          >
            <Network size={16} className="text-bradesco-red" />
            Arquitetura do Projeto
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            {mobileOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Menu móvel"
          className="space-y-1 border-t border-gray-200 bg-white px-4 py-3 lg:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={navigateTo}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-800 hover:bg-red-50 hover:text-bradesco-red"
            >
              {link.label}
            </a>
          ))}

          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenArchitecture();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-bradesco-red hover:bg-red-50"
          >
            <ShieldCheck size={17} />
            Ver Arquitetura do Projeto
          </button>
        </nav>
      )}
    </header>
  );
}

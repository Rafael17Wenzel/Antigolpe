import { useState } from 'react';
import { Building2, Menu, Network, ShieldCheck, X } from 'lucide-react';

const links = [
  { href: '#validador', label: 'Validar vaga/token' },
  { href: '#faq', label: 'Dicas de segurança' },
  { href: '#/simulador', label: 'Simulador de chat' },
];

export default function Header({ onOpenArchitecture }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="contorno-ac sticky top-0 z-40 border-b-2 border-primaria bg-superficie shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <a href="#topo" className="flex shrink-0 items-center gap-3 rounded">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primaria text-primaria-sobre shadow-md">
              <Building2 size={24} aria-hidden="true" />
            </span>

            <span>
              <span className="block text-2xl font-extrabold leading-none tracking-tight text-primaria">
                bradesco
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-texto-suave">
                Segurança &amp; Vagas · protótipo
              </span>
              <span className="sr-only"> — ir para o início</span>
            </span>
          </a>

          <nav aria-label="Navegação principal" className="hidden items-center gap-5 text-sm font-medium text-texto lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="border-b-2 border-transparent py-2 transition hover:border-primaria hover:text-primaria"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={onOpenArchitecture}
            className="hidden min-h-alvo items-center gap-2 rounded-lg border border-borda-forte bg-superficie-2 px-3 text-xs font-semibold text-texto transition hover:bg-borda xl:flex"
          >
            <Network size={16} aria-hidden="true" className="text-primaria" />
            Arquitetura do projeto
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            aria-controls="menu-movel"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex min-h-alvo min-w-[44px] items-center justify-center rounded-lg text-texto hover:bg-superficie-2 lg:hidden"
          >
            {mobileOpen ? <X size={25} aria-hidden="true" /> : <Menu size={25} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="menu-movel" aria-label="Menu móvel" className="space-y-1 border-t border-borda bg-superficie px-4 py-3 lg:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-texto hover:bg-primaria-clara hover:text-primaria"
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
            className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-primaria hover:bg-primaria-clara"
          >
            <ShieldCheck size={17} aria-hidden="true" />
            Arquitetura do projeto
          </button>
        </nav>
      )}
    </header>
  );
}

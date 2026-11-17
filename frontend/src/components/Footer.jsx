import { Building2, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="contorno-ac border-t-4 border-primaria bg-escuro text-sm text-escuro-sobre-suave">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="space-y-3">
            <p className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-primaria text-primaria-sobre">
                <Building2 size={18} aria-hidden="true" />
              </span>
              <span className="text-base font-bold tracking-tight text-escuro-sobre">Antigolpe</span>
            </p>
            <p className="leading-relaxed">
              Protótipo acadêmico de conscientização sobre segurança digital e fraudes em
              processos seletivos.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-bold uppercase tracking-wider text-escuro-sobre">Links úteis</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.ev.org.br/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline-offset-2 hover:text-escuro-sobre hover:underline"
                >
                  Escola Virtual da Fundação Bradesco
                  <ExternalLink size={12} aria-hidden="true" />
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
              </li>
              <li>
                <a href="#faq" className="underline-offset-2 hover:text-escuro-sobre hover:underline">
                  Dicas de segurança e privacidade
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 font-bold uppercase tracking-wider text-escuro-sobre">Sobre o projeto</h2>
            <p className="leading-relaxed">
              Trabalho acadêmico demonstrativo. <strong className="text-escuro-sobre">Não é canal
              oficial do Bradesco</strong> e não representa serviço de recrutamento, atendimento
              bancário ou recebimento de denúncias. Para falar com o banco, procure os canais no
              site oficial, digitando o endereço você mesmo.
            </p>
          </div>
        </div>

        <p className="mt-8 border-t border-escuro-sobre-suave/30 pt-6 text-center">
          © {new Date().getFullYear()} — Protótipo acadêmico de conscientização sobre segurança digital.
        </p>
      </div>
    </footer>
  );
}

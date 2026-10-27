import { Building2, ExternalLink } from 'lucide-react';

const supportItems = [
  ['Fone Fácil', '4002 0022'],
  ['SAC Alô Bradesco', '0800 704 8383'],
  ['Ouvidoria', '0800 727 9933'],
];

export default function Footer() {
  return (
    <footer className="border-t-4 border-bradesco-red bg-gray-900 text-xs text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-bradesco-red text-white">
                <Building2 size={18} />
              </span>

              <span className="text-base font-bold tracking-tight text-white">
                bradesco
              </span>
            </div>

            <p className="leading-relaxed text-gray-400">
              Protótipo acadêmico de conscientização sobre segurança
              digital e fraudes em processos seletivos.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-bold uppercase tracking-wider text-white">
              Atendimento
            </h2>

            <ul className="space-y-2">
              {supportItems.map(([label, value]) => (
                <li key={label}>
                  {label}: <strong className="text-gray-200">{value}</strong>
                </li>
              ))}
            </ul>

            <p className="mt-3 leading-relaxed text-gray-500">
              Contatos reproduzidos para fins demonstrativos. Confirme
              os canais vigentes no site oficial antes de utilizá-los.
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-bold uppercase tracking-wider text-white">
              Links úteis
            </h2>

            <ul className="space-y-2">
              <li>
                <a
                  href="https://banco.bradesco/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  Portal Bradesco
                  <ExternalLink size={12} />
                </a>
              </li>

              <li>
                <a
                  href="https://www.ev.org.br/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  Escola Virtual
                  <ExternalLink size={12} />
                </a>
              </li>

              <li>
                <a href="#faq" className="hover:text-white">
                  Dicas de segurança e privacidade
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 font-bold uppercase tracking-wider text-white">
              Sobre o projeto
            </h2>

            <p className="leading-relaxed text-gray-400">
              Trabalho acadêmico demonstrativo. Não representa um
              serviço oficial de recrutamento, atendimento bancário
              ou recebimento de denúncias.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 text-center leading-relaxed text-gray-500">
          © {new Date().getFullYear()} — Protótipo acadêmico de
          conscientização sobre segurança digital.
        </div>
      </div>
    </footer>
  );
}

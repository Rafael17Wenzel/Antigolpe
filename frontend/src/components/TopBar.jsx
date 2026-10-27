import { useState } from 'react';
import {
  ArrowDown,
  Contrast,
  Hand,
  LockKeyhole,
} from 'lucide-react';

export default function TopBar({ onToast, onContrast }) {
  const [agency, setAgency] = useState('');
  const [account, setAccount] = useState('');

  function handleDemoAccess(event) {
    event.preventDefault();

    onToast({
      message:
        'Acesso bancário desativado: este é um protótipo acadêmico.',
      type: 'info',
    });
  }

  return (
    <div className="bg-gray-900 px-4 py-2 text-xs text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onContrast}
            className="flex items-center gap-1 transition hover:text-red-400"
          >
            <Contrast size={15} />
            Alto Contraste
          </button>

          <span className="text-gray-600">|</span>

          <a
            href="#conteudo-principal"
            className="flex items-center gap-1 hover:underline"
          >
            <ArrowDown size={14} />
            Ir ao Conteúdo
          </a>

          <span className="hidden text-gray-600 sm:inline">|</span>

          <span className="flex items-center gap-1 text-gray-300">
            <Hand size={15} className="text-blue-400" />
            Acessibilidade
          </span>
        </div>

        <form
          onSubmit={handleDemoAccess}
          className="flex items-center gap-2"
        >
          <span className="hidden items-center gap-1 text-gray-400 lg:flex">
            <LockKeyhole size={14} className="text-emerald-400" />
            Acesso demonstrativo:
          </span>

          <input
            value={agency}
            onChange={(event) =>
              setAgency(event.target.value.replace(/\D/g, '').slice(0, 4))
            }
            inputMode="numeric"
            autoComplete="off"
            aria-label="Agência demonstrativa"
            placeholder="Agência"
            maxLength={4}
            className="w-[72px] rounded border border-gray-700 bg-gray-800 px-2 py-1 text-center text-white placeholder:text-gray-400"
          />

          <input
            value={account}
            onChange={(event) =>
              setAccount(event.target.value.slice(0, 7))
            }
            autoComplete="off"
            aria-label="Conta demonstrativa"
            placeholder="Conta"
            maxLength={7}
            className="w-20 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-center text-white placeholder:text-gray-400"
          />

          <button
            type="submit"
            className="rounded bg-bradesco-red px-3 py-1 font-bold transition hover:bg-red-700"
          >
            OK
          </button>
        </form>
      </div>
    </div>
  );
}

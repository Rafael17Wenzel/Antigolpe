import { useEffect, useRef, useState } from 'react';
import { CircleAlert, LoaderCircle, LockKeyhole, LogIn } from 'lucide-react';

import { entrarComoRh } from '../api';

const inputClass =
  'min-h-alvo w-full rounded-lg border border-borda-forte bg-superficie px-3 text-sm text-texto placeholder:text-texto-suave';
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-texto';

/** Login da área do RH (JWT). */
export default function LoginRh({ onEntrar }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const tituloRef = useRef(null);
  const usuarioRef = useRef(null);

  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  async function enviar(event) {
    event.preventDefault();
    if (!usuario.trim() || !senha) {
      setErro('Informe o usuário e a senha.');
      usuarioRef.current?.focus();
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const sessao = await entrarComoRh(usuario.trim(), senha);
      onEntrar(sessao);
    } catch (e) {
      setErro(e.message);
      setSenha('');
      usuarioRef.current?.focus();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section aria-labelledby="login-titulo" className="contorno-ac mx-auto max-w-md rounded-xl bg-superficie p-6 shadow-xl sm:p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primaria text-primaria-sobre">
        <LockKeyhole size={22} aria-hidden="true" />
      </span>
      <h2 id="login-titulo" ref={tituloRef} tabIndex={-1} className="mt-4 text-xl font-bold text-texto outline-none">
        Entrar na área do RH
      </h2>
      <p className="mt-1 text-sm text-texto-suave">
        Acesso restrito à equipe que administra as vagas. Protótipo acadêmico — não é sistema do Bradesco.
      </p>

      <form onSubmit={enviar} noValidate aria-busy={enviando} className="mt-6 space-y-4">
        <div>
          <label htmlFor="rh-usuario" className={labelClass}>Usuário</label>
          <input
            id="rh-usuario"
            ref={usuarioRef}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={100}
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? 'login-erro' : undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="rh-senha" className={labelClass}>Senha</label>
          <input
            id="rh-senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            maxLength={200}
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? 'login-erro' : undefined}
            className={inputClass}
          />
        </div>

        {erro && (
          <p id="login-erro" role="alert" className="flex items-start gap-2 rounded-lg border border-perigo-borda bg-perigo-fundo p-3 text-sm text-perigo-texto">
            <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="flex min-h-alvo w-full items-center justify-center gap-2 rounded-lg bg-primaria px-4 text-sm font-bold text-primaria-sobre hover:bg-primaria-escura disabled:opacity-60"
        >
          {enviando ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <LogIn size={16} aria-hidden="true" />}
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}

import { lazy, Suspense, useCallback, useEffect, useState } from 'react';

import AccessibilityToolbar from './components/AccessibilityToolbar';
import Header from './components/Header';
import Hero from './components/Hero';
import ValidationPanel from './components/ValidationPanel';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Toast from './components/Toast';
import useTema from './hooks/useTema';
import useSessaoRh from './hooks/useSessaoRh';

// Carregados sob demanda: o OCR (tesseract.js) e a área do RH só são baixados quando usados.
const WhatsAppSimulator = lazy(() => import('./simulador/WhatsAppSimulator'));
const LoginRh = lazy(() => import('./rh/LoginRh'));
const AreaRh = lazy(() => import('./rh/AreaRh'));

/** Rotas por hash: #/simulador, #/login, #/admin; o resto é a página inicial (âncoras). */
function rotaAtual() {
  const hash = window.location.hash;
  if (hash.startsWith('#/simulador')) return 'simulador';
  if (hash.startsWith('#/login')) return 'login';
  if (hash.startsWith('#/admin')) return 'admin';
  return 'inicio';
}

const carregando = (texto) => <p className="rounded-xl bg-superficie p-8 text-texto">{texto}</p>;

export default function App() {
  const { altoContraste, alternar } = useTema();
  const { sessao, entrar, sair } = useSessaoRh();
  const [toast, setToast] = useState(null);
  const [rota, setRota] = useState(rotaAtual);

  useEffect(() => {
    const aoMudar = () => setRota(rotaAtual());
    window.addEventListener('hashchange', aoMudar);
    return () => window.removeEventListener('hashchange', aoMudar);
  }, []);

  // Rota protegida: sem sessão, /admin vai para o login; com sessão, /login vai para /admin.
  useEffect(() => {
    if (rota === 'admin' && !sessao) window.location.replace('#/login');
    if (rota === 'login' && sessao) window.location.replace('#/admin');
  }, [rota, sessao]);

  // Voltando para uma âncora da página inicial: rola até ela após renderizar.
  useEffect(() => {
    if (rota !== 'inicio') return;
    const alvo = window.location.hash.slice(1);
    if (alvo) document.getElementById(alvo)?.scrollIntoView({ block: 'start' });
  }, [rota]);

  const showToast = useCallback((message) => setToast(message), []);
  const closeToast = useCallback(() => setToast(null), []);

  const aoEntrar = useCallback(
    (dados) => {
      entrar(dados);
      window.location.hash = '#/admin';
    },
    [entrar],
  );

  // Sair leva à página principal. A rota muda no mesmo render em que a sessão some;
  // senão a proteção de /admin (sem sessão → login) agiria antes do hashchange.
  const aoSair = useCallback(() => {
    setRota('inicio');
    sair();
    window.location.hash = '#topo';
    window.scrollTo({ top: 0 });
    setToast({ message: 'Você saiu da área do RH.', type: 'success' });
  }, [sair]);

  const aoExpirar = useCallback(() => {
    sair();
    setToast({ message: 'Sua sessão expirou. Entre novamente.', type: 'warning' });
    window.location.hash = '#/login';
  }, [sair]);

  const areaRestrita = rota === 'login' || rota === 'admin';

  let conteudo;
  if (rota === 'simulador') {
    conteudo = (
      <Suspense fallback={carregando('Carregando o simulador…')}>
        <WhatsAppSimulator onToast={showToast} />
      </Suspense>
    );
  } else if (rota === 'login') {
    conteudo = <Suspense fallback={carregando('Carregando…')}>{!sessao && <LoginRh onEntrar={aoEntrar} />}</Suspense>;
  } else if (rota === 'admin') {
    conteudo = (
      <Suspense fallback={carregando('Carregando a área do RH…')}>
        {sessao && <AreaRh sessao={sessao} onSair={aoSair} onSessaoExpirada={aoExpirar} onToast={showToast} />}
      </Suspense>
    );
  } else {
    conteudo = (
      <>
        <ValidationPanel onToast={showToast} />
        <div className="contorno-ac rounded-b-xl bg-superficie px-5 pb-8 sm:px-8">
          <FAQ />
        </div>
      </>
    );
  }

  return (
    <div id="topo" className="flex min-h-screen flex-col bg-fundo font-sans text-texto">
      <AccessibilityToolbar altoContraste={altoContraste} onAlternarContraste={alternar} />

      <Header sessao={sessao} onSair={aoSair} />

      {!areaRestrita && <Hero />}

      <main
        id="conteudo-principal"
        tabIndex={-1}
        className={`relative z-20 mx-auto mb-16 w-full max-w-7xl flex-grow scroll-mt-28 px-4 outline-none sm:px-6 lg:px-8 ${
          areaRestrita ? 'mt-10' : 'mt-[-2rem]'
        }`}
      >
        {conteudo}
      </main>

      <Footer />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';

import AccessibilityToolbar from './components/AccessibilityToolbar';
import Header from './components/Header';
import Hero from './components/Hero';
import ValidationPanel from './components/ValidationPanel';
import FAQ from './components/FAQ';
import ArchitectureModal from './components/ArchitectureModal';
import Footer from './components/Footer';
import Toast from './components/Toast';
import useTema from './hooks/useTema';

// Simulador carregado sob demanda: o OCR (tesseract.js) só é baixado ao abrir o simulador.
const WhatsAppSimulator = lazy(() => import('./simulador/WhatsAppSimulator'));

const ehSimulador = () => window.location.hash.startsWith('#/simulador');

export default function App() {
  const { altoContraste, alternar } = useTema();
  const [architectureOpen, setArchitectureOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const validationPanelRef = useRef(null);
  const [simulador, setSimulador] = useState(ehSimulador);

  useEffect(() => {
    const aoMudar = () => setSimulador(ehSimulador());
    window.addEventListener('hashchange', aoMudar);
    return () => window.removeEventListener('hashchange', aoMudar);
  }, []);

  // Voltando do simulador para uma âncora da página principal: rola até ela após renderizar.
  useEffect(() => {
    if (simulador) return;
    const alvo = window.location.hash.slice(1);
    if (alvo) document.getElementById(alvo)?.scrollIntoView({ block: 'start' });
  }, [simulador]);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const openArchitecture = useCallback(() => {
    setArchitectureOpen(true);
  }, []);

  const closeArchitecture = useCallback(() => {
    setArchitectureOpen(false);
  }, []);

  const runQuickTest = useCallback((type) => {
    if (ehSimulador()) {
      window.location.hash = '#validador';
      return;
    }
    validationPanelRef.current?.runQuickTest(type);

    document.getElementById('validador')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  return (
    <div id="topo" className="flex min-h-screen flex-col bg-fundo font-sans text-texto">
      <AccessibilityToolbar altoContraste={altoContraste} onAlternarContraste={alternar} />

      <Header onOpenArchitecture={openArchitecture} />

      <Hero onQuickTest={runQuickTest} />

      <main
        id="conteudo-principal"
        tabIndex={-1}
        className="relative z-20 mx-auto mb-16 mt-[-2rem] w-full max-w-7xl flex-grow scroll-mt-28 px-4 outline-none sm:px-6 lg:px-8"
      >
        {simulador ? (
          <Suspense fallback={<p className="rounded-xl bg-superficie p-8 text-texto">Carregando o simulador…</p>}>
            <WhatsAppSimulator onToast={showToast} />
          </Suspense>
        ) : (
          <>
            <ValidationPanel ref={validationPanelRef} onToast={showToast} />

            <div className="contorno-ac rounded-b-xl bg-superficie px-5 pb-8 sm:px-8">
              <FAQ />
            </div>
          </>
        )}
      </main>

      <Footer />

      <ArchitectureModal open={architectureOpen} onClose={closeArchitecture} />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

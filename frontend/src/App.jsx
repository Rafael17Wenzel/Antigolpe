import { useCallback, useRef, useState } from 'react';

import TopBar from './components/TopBar';
import Header from './components/Header';
import Hero from './components/Hero';
import ValidationPanel from './components/ValidationPanel';
import FAQ from './components/FAQ';
import ArchitectureModal from './components/ArchitectureModal';
import Footer from './components/Footer';
import Toast from './components/Toast';

export default function App() {
  const [highContrast, setHighContrast] = useState(false);
  const [architectureOpen, setArchitectureOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const validationPanelRef = useRef(null);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const toggleContrast = useCallback(() => {
    setHighContrast((current) => !current);

    setToast({
      message: 'Modo de contraste alterado.',
      type: 'info',
    });
  }, []);

  const openArchitecture = useCallback(() => {
    setArchitectureOpen(true);
  }, []);

  const closeArchitecture = useCallback(() => {
    setArchitectureOpen(false);
  }, []);

  const runQuickTest = useCallback((type) => {
    validationPanelRef.current?.runQuickTest(type);

    document.getElementById('validador')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  return (
    <div
      id="topo"
      className={`flex min-h-screen flex-col bg-bradesco-grayBg font-sans text-gray-800 ${
        highContrast ? 'high-contrast' : ''
      }`}
    >
      <TopBar
        onToast={showToast}
        onContrast={toggleContrast}
      />

      <Header onOpenArchitecture={openArchitecture} />

      <Hero onQuickTest={runQuickTest} />

      <main
        id="conteudo-principal"
        className="relative z-20 mx-auto mb-16 mt-[-2rem] w-full max-w-7xl flex-grow scroll-mt-28 px-4 sm:px-6 lg:px-8"
      >
        <ValidationPanel
          ref={validationPanelRef}
          onToast={showToast}
        />

        <div className="rounded-b-xl bg-white px-5 pb-8 sm:px-8">
          <FAQ />
        </div>
      </main>

      <Footer />

      <ArchitectureModal
        open={architectureOpen}
        onClose={closeArchitecture}
      />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

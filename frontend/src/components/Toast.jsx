import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleAlert, GraduationCap, LockKeyhole, Shield, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Shield,
  lock: LockKeyhole,
  course: GraduationCap,
  error: CircleAlert,
};

/**
 * Notificação breve. Some sozinha após 6 s, mas pausa enquanto está sob o mouse
 * ou com foco (WCAG 2.2.1). O conteúdo importante também aparece na página.
 */
export default function Toast({ toast, onClose }) {
  const [pausado, setPausado] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!toast || pausado) return undefined;
    timer.current = setTimeout(onClose, 6000);
    return () => clearTimeout(timer.current);
  }, [toast, onClose, pausado]);

  if (!toast) return null;

  const Icon = icons[toast.type] || CheckCircle2;

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      className="contorno-ac fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-xl border border-escuro-sobre-suave bg-escuro px-5 py-4 text-sm text-escuro-sobre shadow-2xl"
    >
      <Icon size={22} aria-hidden="true" className="shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar notificação"
        className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded text-escuro-sobre-suave hover:text-escuro-sobre"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

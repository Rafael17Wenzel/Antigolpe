import { useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Shield,
  LockKeyhole,
  GraduationCap,
  CircleAlert,
  X,
} from 'lucide-react';

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Shield,
  lock: LockKeyhole,
  course: GraduationCap,
  error: CircleAlert,
};

const colors = {
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
  lock: 'text-blue-400',
  course: 'text-amber-400',
  error: 'text-red-400',
};

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const Icon = icons[toast.type] || CheckCircle2;
  const color = colors[toast.type] || colors.success;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-xl border border-gray-700 bg-gray-900 px-5 py-4 text-sm text-white shadow-2xl"
    >
      <Icon size={22} className={`shrink-0 ${color}`} />

      <span className="flex-1">{toast.message}</span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar notificação"
        className="rounded p-1 text-gray-400 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}

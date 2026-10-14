import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const duration = toast.duration || 3500;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  const borderMap = {
    success: 'border-emerald-500/30 dark:border-emerald-500/20 bg-white dark:bg-slate-900',
    error: 'border-rose-500/30 dark:border-rose-500/20 bg-white dark:bg-slate-900',
    info: 'border-sky-500/30 dark:border-sky-500/20 bg-white dark:bg-slate-900',
  };

  const progressColorMap = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-sky-500',
  };

  return (
    <div
      className={`pointer-events-auto rounded-2xl shadow-xl border p-3.5 flex flex-col overflow-hidden transition-all transform translate-y-0 opacity-100 animate-slide-in ${borderMap[toast.type]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {iconMap[toast.type]}
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            {toast.message}
          </span>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-dismiss shrinking progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-2.5 overflow-hidden">
        <div
          className={`h-full transition-all linear ${progressColorMap[toast.type]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

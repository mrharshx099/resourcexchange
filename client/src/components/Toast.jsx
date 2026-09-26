import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10 dark:shadow-emerald-950/40'
                : isError
                ? 'bg-white/95 dark:bg-slate-900/95 border-rose-500/40 text-rose-950 dark:text-rose-100 shadow-rose-500/10 dark:shadow-rose-950/40'
                : 'bg-white/95 dark:bg-slate-900/95 border-blue-500/40 text-blue-950 dark:text-blue-100 shadow-blue-500/10 dark:shadow-blue-950/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

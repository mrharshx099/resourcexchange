import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';

export default function CompareDrawer({ onOpenCompareModal }) {
  const { compareList, removeFromCompare, clearCompare } = useAuth();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="glass-panel rounded-2xl shadow-2xl border border-emerald-500/30 p-3 sm:p-4 flex items-center justify-between gap-4 bg-white/95 dark:bg-slate-900/95 shadow-slate-900/20">
        
        {/* Left: Summary & Selected Thumbnails */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shrink-0 border border-emerald-500/30">
            <Scale className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {compareList.map((res) => (
              <div
                key={res.id}
                className="relative group shrink-0 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <img
                  src={res.image_url}
                  alt=""
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {res.title}
                </span>
                <button
                  onClick={() => removeFromCompare(res.id)}
                  className="text-slate-400 hover:text-rose-500 p-0.5 rounded-full transition-colors"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Clear comparison list"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCompareModal}
            disabled={compareList.length < 2}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              compareList.length >= 2
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-emerald-950/20 cursor-pointer active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
            }`}
          >
            <span>Compare ({compareList.length}/3)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

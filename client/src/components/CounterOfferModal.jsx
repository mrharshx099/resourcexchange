import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, MessageSquare, DollarSign, Send, AlertCircle, Sparkles, Info } from 'lucide-react';

export default function CounterOfferModal({ request, isOpen, onClose, onSuccess }) {
  const { addToast } = useAuth();
  const [counterPrice, setCounterPrice] = useState(request?.negotiated_price || request?.total_price || '');
  const [counterNotes, setCounterNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionData, setSuggestionData] = useState(null);

  if (!isOpen || !request) return null;

  const handleSuggestFairPrice = async () => {
    setIsSuggesting(true);
    setErrorMsg('');
    try {
      const res = await api.getSuggestedPrice(request.id);
      if (res && res.suggestedPrice) {
        setCounterPrice(res.suggestedPrice);
        setSuggestionData(res);
        addToast(res.isAiAligned ? `Domain-Aligned AI suggested $${res.suggestedPrice}` : `Calculated fair price of $${res.suggestedPrice}`, 'info');
      }
    } catch (err) {
      console.error('Failed to get suggested price:', err);
      // Fallback heuristic if API failed
      const listed = Number(request.total_price || 1000);
      const offer = Number(request.negotiated_price || request.total_price || 800);
      const fallbackFair = Math.round((listed * 0.4) + (listed * 0.95 * 0.3) + (offer * 0.3));
      setCounterPrice(fallbackFair);
      setSuggestionData({
        suggestedPrice: fallbackFair,
        resourcePrice: listed,
        categoryPrice: Math.round(listed * 0.95),
        seekerOffer: offer,
        explanation: 'Fair price calculated via 40% listed + 30% market median + 30% seeker offer'
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!counterPrice) {
      setErrorMsg('Please enter a counter offer price');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.counterOfferRequest(request.id, {
        counter_price: Number(counterPrice),
        counter_notes: counterNotes,
      });

      addToast(`Counter-offer of $${counterPrice} sent to ${request.seeker_name}!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit counter offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Send Counter-Offer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Propose alternate price or conditions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between mb-1">
              <span className="text-slate-500 dark:text-slate-400">Resource:</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{request.resource_title}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-500 dark:text-slate-400">Seeker's Initial Offer:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">${request.negotiated_price || request.total_price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Dates Requested:</span>
              <span className="text-slate-800 dark:text-slate-200">{request.start_date} to {request.end_date}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Proposed Counter Price ($)
              </label>

              {/* Suggest Fair Price Button */}
              <button
                type="button"
                onClick={handleSuggestFairPrice}
                disabled={isSuggesting}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-500/20 dark:to-teal-500/20 hover:bg-emerald-100 dark:hover:from-emerald-500/30 dark:hover:to-teal-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 text-[11px] font-bold transition-all active:scale-95 shadow-sm"
              >
                <Sparkles className={`w-3 h-3 ${isSuggesting ? 'animate-spin text-emerald-500' : 'text-amber-500'}`} />
                {isSuggesting ? 'Calculating...' : 'Suggest Fair Price'}
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                required
                min="1"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
              />
              {suggestionData && (
                <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                  Domain-Aligned AI Suggestion
                </span>
              )}
            </div>

            {/* Domain-Aligned AI breakdown & reasoning display */}
            {suggestionData && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-500/30 text-[11px] space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Domain-Aligned AI Suggestion
                  </span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">${suggestionData.suggestedPrice}</span>
                </div>

                {/* Model Reasoning Text */}
                {(suggestionData.reasoning || suggestionData.explanation) && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-slate-800 dark:text-emerald-100 text-xs leading-relaxed">
                    <span className="font-bold block text-[10px] text-emerald-700 dark:text-emerald-400 mb-0.5 uppercase tracking-wider">
                      {suggestionData.isAiAligned ? 'Domain-Aligned Model Reasoning' : 'Market Norms Reasoning'}
                    </span>
                    {suggestionData.reasoning || suggestionData.explanation}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] border-t border-slate-200 dark:border-slate-700/60">
                  <div className="bg-white dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="block text-slate-500 dark:text-slate-400">Listed Rate</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">${suggestionData.resourcePrice}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="block text-slate-500 dark:text-slate-400">Category Avg</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">${suggestionData.categoryPrice}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="block text-slate-500 dark:text-slate-400">Seeker Bid</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">${suggestionData.seekerOffer}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  Auto-filled as Domain-Aligned AI Suggestion. You can adjust this manually before sending.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note to Seeker (Reason / Shift Window)
            </label>
            <textarea
              rows="3"
              placeholder="e.g. We can do $1,200 if setup is completed by 3 PM..."
              value={counterNotes}
              onChange={(e) => setCounterNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Sending...' : 'Submit Counter-Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { X, Star, Check, Sparkles, AlertCircle } from 'lucide-react';

const SUGGESTED_TAGS = [
  'Spotless Sanitary',
  'Punctual Handover',
  'Mint Condition Equipment',
  'Responsive Communication',
  'Smooth Logistics',
  'Accurate Capacity',
  'Will Book Again'
];

export default function ReviewModal({ request, isOpen, onClose, onSuccess }) {
  const { addToast } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(['Spotless Sanitary', 'Punctual Handover']);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !request) return null;

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please write a brief comment describing your exchange experience');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.submitReview({
        request_id: request.id,
        rating: Number(rating),
        tags: selectedTags,
        comment: comment.trim(),
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });

      addToast('Review submitted! Thank you for strengthening the hospitality trust network.', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
              <Star className="w-5 h-5 fill-amber-500 dark:fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Rate Completed Exchange</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Share feedback with the hospitality network</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400">Resource: </span>
            <span className="font-bold text-slate-900 dark:text-white">{request.resource_title}</span>
            <span className="text-slate-500 dark:text-slate-400"> • Provider: </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{request.provider_name}</span>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 rounded-xl text-xs text-rose-700 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Interactive Star Rating */}
          <div className="text-center py-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Overall Experience Rating</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-500 drop-shadow-md'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">
              {rating === 5 && 'Outstanding Experience (5/5)'}
              {rating === 4 && 'Very Good Experience (4/5)'}
              {rating === 3 && 'Average / Met Requirements (3/5)'}
              {rating <= 2 && 'Needs Improvement'}
            </p>
          </div>

          {/* Quality Tag Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Highlight Key Strengths
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1 text-emerald-600 dark:text-emerald-400" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Feedback & Review
            </label>
            <textarea
              rows="3"
              required
              placeholder="Describe the condition of the resource, communication with the provider, and any highlights..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/20 dark:shadow-emerald-950/50 flex items-center gap-2 transition-all active:scale-95"
            >
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              {isSubmitting ? 'Posting...' : 'Submit 5★ Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

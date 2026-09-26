import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Layers, 
  PlusCircle, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin, 
  Building2, 
  Star, 
  Clock, 
  CheckCircle,
  MessageSquare,
  ArrowRight,
  Filter
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Banquet & Event Space',
  'Commercial Kitchen & Cold Storage',
  'Guest Parking & Valet Lots',
  'Refrigerated Fleet & Transport',
  'Audio, Lighting & Stage AV',
  'Banquet Furniture & Decor'
];

export default function RequirementsBoardPage({ onOpenPostReq, onBrowseToMatch }) {
  const { currentUser, addToast } = useAuth();
  
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');

  const loadRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getRequirements({
        category: selectedCat !== 'All' ? selectedCat : undefined,
      });
      setRequirements(data);
    } catch (err) {
      console.error('Failed to load requirements:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCat]);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-50/80 via-slate-50 to-emerald-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-teal-950/40">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 text-xs font-bold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Open Hospitality RFQ Exchange</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Wanted Board: Hospitality Resource Requirements
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Can't find what you need in existing listings? Broadcast your capacity, space, or equipment needs. 
            Nearby hotels, caterers, and fleet operators can review and pitch matching resources.
          </p>
        </div>

        <button
          onClick={onOpenPostReq}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-xl shadow-teal-950/20 dark:shadow-teal-950/50 transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          + Post a Requirement
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCat === cat
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Requirements Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900/60 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : requirements.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <Layers className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No open RFQs in this category</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            Be the first business to broadcast a requirement for this category!
          </p>
          <button
            onClick={onOpenPostReq}
            className="px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
          >
            Broadcast Requirement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-500/40 transition-all duration-300"
            >
              <div>
                {/* Header: Seeker & Category */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={req.seeker_avatar || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{req.seeker_name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{req.seeker_type}</span>
                    </div>
                  </div>

                  <span className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
                    {req.category}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-3 mb-1.5 leading-snug">
                  {req.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {req.description}
                </p>

                {/* Key RFQ Specifications */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Needed Dates</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{req.start_date} to {req.end_date}</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Target Capacity</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{req.capacity_needed}+ needed</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Max Budget</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">${req.max_budget}/{req.budget_type || 'day'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-3">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Target Area: {req.location}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Posted {new Date(req.created_at).toLocaleDateString()}
                </span>

                <button
                  onClick={() => {
                    addToast(`Opened matchmaking dialog for: ${req.title}`, 'info');
                    if (onBrowseToMatch) onBrowseToMatch();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Offer Matching Resource
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Users, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Send,
  Scale,
  ShieldCheck
} from 'lucide-react';

export default function ResourceCard({ resource, onSelect, onRequestClick }) {
  const { compareList, toggleCompare } = useAuth();
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  const isCompared = compareList.some((r) => r.id === resource.id);
  const matchScore = resource.matchScore || 85;

  // Determine Match Color
  const getMatchBadgeStyle = (score) => {
    if (score >= 90) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50';
    if (score >= 75) return 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-teal-950/50';
    if (score >= 60) return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-950/50';
    return 'bg-slate-500/20 text-slate-300 border-slate-500/40 shadow-slate-950/50';
  };

  return (
    <div className="group glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-sm dark:shadow-none transition-all duration-300">
      
      {/* Top Image & Overlays */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onSelect(resource)}>
        <img
          src={resource.image_url}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-300 border border-emerald-500/30 shadow-md">
          <span>{resource.category || resource.type}</span>
        </div>

        {/* Animated Circular Progress Match Ring Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <div className="glass-panel bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className="stroke-slate-800"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke={matchScore >= 90 ? '#10b981' : matchScore >= 75 ? '#14b8a6' : '#f59e0b'}
                  strokeWidth="3.5"
                  strokeDasharray="87.96"
                  strokeDashoffset={87.96 - (87.96 * matchScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-white">
                {matchScore}%
              </span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 pr-1">
              Match
            </span>
          </div>
        </div>

        {/* Location & Distance Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[180px]">{resource.location}</span>
          </div>
          {resource.distanceKm != null && (
            <span className="bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 font-semibold text-teal-300">
              {resource.distanceKm} km away
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Provider Business Header */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              {resource.provider_avatar && (
                <img src={resource.provider_avatar} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700" />
              )}
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{resource.provider_name}</span>
              {resource.provider_verified === 1 && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" title="Verified Hospitality Partner" />
              )}
            </div>
            <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-semibold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{resource.provider_rating || 4.8}</span>
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">({resource.provider_reviews_count || 12})</span>
            </div>
          </div>

          {/* Title & Description */}
          <h3 
            onClick={() => onSelect(resource)}
            className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1 mb-1.5"
          >
            {resource.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {resource.description}
          </p>

          {/* Key Specs Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              <Users className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Capacity: {resource.capacity} {resource.capacity_unit}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
              <Calendar className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
              <span>Min {resource.min_duration_hours || 2}h</span>
            </div>
          </div>

          {/* Match Score Reason Accordion */}
          {resource.highlights && resource.highlights.length > 0 && (
            <div className="mb-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-2.5">
              <div 
                onClick={() => setShowScoreDetails(!showScoreDetails)}
                className="flex items-center justify-between cursor-pointer text-xs font-semibold text-emerald-800 dark:text-emerald-300"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Why {matchScore}% Match:</span>
                </div>
                {showScoreDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>

              {showScoreDetails ? (
                <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-500/20 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 animate-in fade-in duration-150">
                  {resource.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                  {resource.scoreBreakdown && (
                    <div className="grid grid-cols-2 gap-1 pt-1.5 text-[10px] text-slate-500 dark:text-slate-400 border-t border-emerald-200 dark:border-emerald-900/50">
                      <div>Distance: {resource.scoreBreakdown.distance.score}/{resource.scoreBreakdown.distance.max} pts</div>
                      <div>Price Fit: {resource.scoreBreakdown.price.score}/{resource.scoreBreakdown.price.max} pts</div>
                      <div>Dates Match: {resource.scoreBreakdown.availability.score}/{resource.scoreBreakdown.availability.max} pts</div>
                      <div>Capacity: {resource.scoreBreakdown.capacity.score}/{resource.scoreBreakdown.capacity.max} pts</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-200/80 truncate mt-1">
                  {resource.highlights[0]}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                ${resource.price_per_day ? resource.price_per_day : (resource.price_per_hour * 8)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/ day</span>
              {resource.price_per_hour > 0 && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-2">
                  (${resource.price_per_hour}/hr)
                </span>
              )}
            </div>

            {/* Compare Checkbox */}
            <button
              onClick={() => toggleCompare(resource)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                isCompared
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Compare side by side with up to 3 resources"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'Compared' : 'Compare'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelect(resource)}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors text-center"
            >
              View Details
            </button>
            <button
              onClick={() => onRequestClick(resource)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/20 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

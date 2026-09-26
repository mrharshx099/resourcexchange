import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Check, 
  MapPin, 
  Users, 
  Star, 
  Sparkles, 
  Send, 
  Scale, 
  Clock, 
  ShieldCheck,
  FileText,
  Truck
} from 'lucide-react';

export default function CompareModal({ isOpen, onClose, onRequestResource }) {
  const { compareList, removeFromCompare } = useAuth();

  if (!isOpen || compareList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[90vh] glass-panel rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Side-by-Side Resource Comparison</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comparing {compareList.length} hospitality resources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Comparison Matrix Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-[650px]">
            {compareList.map((res) => (
              <div
                key={res.id}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/70 p-5 flex flex-col justify-between shadow-sm dark:shadow-none"
              >
                <div>
                  {/* Top Image */}
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-700">
                    <img
                      src={res.image_url}
                      alt={res.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => removeFromCompare(res.id)}
                        className="bg-slate-950/80 hover:bg-rose-900 text-slate-300 hover:text-white p-1 rounded-lg backdrop-blur-md transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                      {res.category || res.type}
                    </div>
                  </div>

                  {/* Title & Provider */}
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1 line-clamp-2">
                    {res.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{res.provider_name}</span>
                    <span className="text-amber-500 dark:text-amber-400 font-bold ml-auto flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {res.provider_rating || 4.8}★
                    </span>
                  </div>

                  {/* Comparison Metric Rows */}
                  <div className="space-y-3.5 text-xs">
                    
                    {/* Match Score */}
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
                      <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Match Score
                      </span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                        {res.matchScore || 85}%
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">Daily Rate</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        ${res.price_per_day ? res.price_per_day : (res.price_per_hour * 8)}/day
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">Hourly Rate</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {res.price_per_hour ? `$${res.price_per_hour}/hr` : 'N/A'}
                      </span>
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Capacity
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {res.capacity} {res.capacity_unit}
                      </span>
                    </div>

                    {/* Location & Distance */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Location
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]" title={res.location}>
                        {res.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">Distance</span>
                      <span className="font-semibold text-teal-600 dark:text-teal-300">
                        {res.distanceKm ? `${res.distanceKm} km` : 'Approx. 4 km'}
                      </span>
                    </div>

                    {/* Transport Support */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-indigo-500" /> Delivery
                      </span>
                      {Boolean(res.supports_transport) ? (
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                          🚚 Available ({res.transport_rate_per_km ? `$${res.transport_rate_per_km}/km` : 'Platform rate'})
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-medium">
                          Self-Pickup Only
                        </span>
                      )}
                    </div>

                    {/* Min Duration */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Min Rental
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {res.min_duration_hours || 2} Hours
                      </span>
                    </div>

                    {/* Amenities Checklist */}
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Included Features</p>
                      <div className="space-y-1.5">
                        {res.amenities && res.amenities.length > 0 ? (
                          res.amenities.slice(0, 4).map((amenity, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                              <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                              <span className="truncate">{amenity}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs italic">Standard hospitality setup</span>
                        )}
                      </div>
                    </div>

                    {/* Conditions */}
                    {res.conditions && (
                      <div className="pt-2">
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Conditions
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          "{res.conditions}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Request Button */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      onClose();
                      onRequestResource(res);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Request This Resource
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

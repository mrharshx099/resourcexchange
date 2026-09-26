import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Star, 
  Layers, 
  Calendar, 
  Award, 
  Check, 
  Repeat,
  Sparkles
} from 'lucide-react';

export default function BusinessProfilePage({ onSelectResource }) {
  const { currentUser, allBusinesses, switchBusiness } = useAuth();

  const [profile, setProfile] = useState(null);
  const [resources, setResources] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [profData, resData, revData] = await Promise.all([
        api.getProfile(currentUser.id),
        api.getProviderResources(currentUser.id),
        api.getBusinessReviews(currentUser.id),
      ]);
      setProfile(profData);
      setResources(resData);
      setReviews(revData);
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800" />
        <div className="h-48 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Profile Card Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/30 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={profile?.avatar}
              alt=""
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-emerald-500/30 shadow-2xl shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {profile?.name}
                </h1>
                {profile?.verified === 1 && (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Hospitality Partner
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                {profile?.type} • {profile?.city}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  {profile?.location}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                  {profile?.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  {profile?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Aggregate Rating Score Box */}
          <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0 text-center sm:text-right min-w-[160px]">
            <div className="flex items-center justify-center sm:justify-end gap-1.5 text-amber-500 dark:text-amber-400 font-black text-2xl">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
              <span>{profile?.rating}</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Based on {profile?.reviews_count || reviews.length} verified exchanges
            </span>
          </div>
        </div>

        {/* About Bio */}
        {profile?.about && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Company Overview</span>
            <p>{profile.about}</p>
          </div>
        )}

        {/* Operating Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Shared Resources</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{profile?.stats?.totalListings || resources.length}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Completed Exchanges</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{profile?.stats?.completedExchanges || 0}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Active Inquiries</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{profile?.stats?.pendingRequests || 0}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Fulfillment Rate</span>
            <span className="text-lg font-bold text-teal-600 dark:text-teal-300">99.4%</span>
          </div>
        </div>
      </div>

      {/* Resources Offered by this Business */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          Active Listings Offered by {profile?.name} ({resources.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div
              key={res.id}
              onClick={() => onSelectResource(res)}
              className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm cursor-pointer"
            >
              <div className="relative aspect-[16/10]">
                <img src={res.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400">
                  {res.category}
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{res.title}</h4>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">{res.capacity} {res.capacity_unit}</span>
                  <span className="font-bold text-slate-900 dark:text-white">${res.price_per_day}/day</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Peer Reviews */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500 dark:text-amber-400" />
          Hospitality Peer Testimonials & Ratings ({reviews.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={rev.seeker_avatar}
                    alt=""
                    className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.seeker_name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{rev.seeker_type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{rev.rating}.0</span>
                </div>
              </div>

              {rev.tags && rev.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {rev.tags.map((t, idx) => (
                    <span key={idx} className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

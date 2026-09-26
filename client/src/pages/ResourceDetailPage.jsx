import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  DollarSign, 
  Star, 
  Clock, 
  ShieldCheck, 
  Check, 
  Calendar as CalendarIcon, 
  FileText, 
  Sparkles, 
  Send, 
  Scale, 
  Phone, 
  Mail, 
  Building2,
  Truck
} from 'lucide-react';

export default function ResourceDetailPage({ resourceId, onBack, onRequestResource }) {
  const { currentUser, compareList, toggleCompare } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStart, setSelectedStart] = useState('2026-10-15');
  const [selectedEnd, setSelectedEnd] = useState('2026-10-15');

  useEffect(() => {
    async function loadResource() {
      setLoading(true);
      try {
        const data = await api.getResource(resourceId);
        setResource(data);
      } catch (err) {
        console.error('Failed to load resource details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (resourceId) {
      loadResource();
    }
  }, [resourceId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 w-40 bg-slate-800 rounded-xl" />
        <div className="h-96 bg-slate-900 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-900 rounded-2xl" />
          <div className="h-96 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h3 className="text-lg font-bold text-white mb-2">Resource Not Found</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold"
        >
          Return to Explore
        </button>
      </div>
    );
  }

  const isCompared = compareList.some(r => r.id === resource.id);
  const isOwner = currentUser?.id === resource.provider_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Resources</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleCompare(resource)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isCompared
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isCompared ? 'Added to Compare' : 'Compare Side-by-Side'}</span>
          </button>
        </div>
      </div>

      {/* Main Hero Media Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        <div className="lg:col-span-2 relative aspect-[16/10] bg-slate-900 overflow-hidden">
          <img
            src={resource.image_url}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30">
              {resource.category || resource.type}
            </span>
            {Boolean(resource.supports_transport) && (
              <span className="bg-indigo-950/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> 🚚 Transport Available
              </span>
            )}
          </div>
        </div>

        {/* Secondary thumbnails or showcase details */}
        <div className="hidden lg:flex flex-col gap-4">
          <div className="relative flex-1 bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <img
              src={resource.images?.[1] || resource.image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 glass-panel bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center shadow-sm dark:shadow-none">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Hospitality Partner</h4>
            <div className="flex items-center gap-3">
              <img
                src={resource.provider_avatar}
                alt=""
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-500/30"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{resource.provider_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{resource.provider_type}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {resource.provider_rating}★ ({resource.provider_reviews_count} reviews)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left details + Right sticky booking card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Details, Amenities, Calendar, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Specs */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
              <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>{resource.location}</span>
              <span>•</span>
              <span className="text-teal-600 dark:text-teal-300 font-medium">{resource.provider_city || 'New York, NY'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              {resource.title}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {resource.description}
            </p>
          </div>

          {/* Quick Specifications Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
              <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mb-1">
                <Users className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Max Capacity
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {resource.capacity} {resource.capacity_unit}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
              <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Daily Rate
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                ${resource.price_per_day ? resource.price_per_day : (resource.price_per_hour * 8)}/day
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
              <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> Min Duration
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {resource.min_duration_hours || 2} Hours
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
              <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Total Units
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {resource.quantity || 1} available
              </p>
            </div>
          </div>

          {/* Included Features & Amenities */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm dark:shadow-none">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Included Amenities & Equipment Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {resource.amenities && resource.amenities.length > 0 ? (
                resource.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">Standard hospitality setup included.</p>
              )}
            </div>
          </div>

          {/* Rental Terms and Conditions */}
          {resource.conditions && (
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm dark:shadow-none">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                Operational Terms & Requirements
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                {resource.conditions}
              </p>
            </div>
          )}

          {/* Live Availability Calendar */}
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Availability Calendar & Confirmed Bookings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dates marked in red are already locked by verified hospitality exchanges to prevent double-booking.
              </p>
            </div>

            <AvailabilityCalendar
              resource={resource}
              availabilitySlots={resource.availabilitySlots || []}
              selectedStart={selectedStart}
              selectedEnd={selectedEnd}
              onSelectDates={(s, e) => {
                setSelectedStart(s);
                setSelectedEnd(e || s);
              }}
            />
          </div>

          {/* Reviews & Ratings Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  Verified Exchange Reviews ({resource.reviews?.length || 0})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Peer ratings submitted by verified hospitality businesses following completed exchanges
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {resource.reviews && resource.reviews.length > 0 ? (
                resource.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm dark:shadow-none"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.seeker_avatar || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{rev.seeker_name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2">Verified Exchange</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {rev.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                  No public reviews for this resource yet. Be the first to exchange and leave feedback!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Booking & Inquiry Card */}
        <div className="space-y-6">
          <div className="sticky top-24 glass-panel rounded-3xl p-6 border border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 shadow-xl shadow-slate-200/50 dark:shadow-2xl space-y-5">
            
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${resource.price_per_day ? resource.price_per_day : (resource.price_per_hour * 8)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/ day</span>
              </div>
              {resource.price_per_hour > 0 && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  ${resource.price_per_hour}/hour
                </span>
              )}
            </div>

            {/* Smart Match highlights */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Algorithm Compatibility
                </span>
                <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">95% Match</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-200/80 leading-relaxed">
                Direct match for Manhattan hospitality corridor. Verified insurance and compliant health permits on file.
              </p>
            </div>

            {/* Logistics Support Card */}
            {Boolean(resource.supports_transport) && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold flex items-center gap-1">
                    🚚 Transport & Delivery Available
                  </span>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    Host delivers directly ({resource.transport_rate_per_km ? `$${resource.transport_rate_per_km}/km` : 'Platform rate'})
                  </p>
                </div>
              </div>
            )}

            {/* Selected Booking Dates Quick Pill */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Selected Date Range</span>
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-200">
                <span>{selectedStart}</span>
                <span className="text-slate-400 dark:text-slate-500">to</span>
                <span>{selectedEnd}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {isOwner ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 rounded-xl text-center text-xs text-amber-800 dark:text-amber-200">
                This is your resource listing. Manage it from your Provider Dashboard.
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={() => onRequestResource(resource)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Send Booking Request
                </button>
                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                  Instant inquiry • Provider notified immediately • Zero double-bookings
                </p>
              </div>
            )}

            {/* Provider direct contact info */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{resource.provider_phone || '+1 (212) 555-0140'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{resource.provider_email || 'operations@hospitality.com'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

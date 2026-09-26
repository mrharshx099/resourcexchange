import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  X, 
  Send, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Users, 
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Truck,
  MapPin
} from 'lucide-react';

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 4.5;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = Math.round(R * c * 10) / 10;
  return dist > 0 ? dist : 2.5;
}

export default function SendRequestModal({ resource, isOpen, onClose, onSuccess }) {
  const { currentUser, addToast } = useAuth();

  const [startDate, setStartDate] = useState('2026-10-16');
  const [endDate, setEndDate] = useState('2026-10-16');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [requestedQty, setRequestedQty] = useState(1);
  const [offerPrice, setOfferPrice] = useState('');
  const [seekerNotes, setSeekerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Transportation Add-on State
  const [needsTransport, setNeedsTransport] = useState(false);
  const [transportNotes, setTransportNotes] = useState('');
  const [logisticsEstimate, setLogisticsEstimate] = useState(null);

  const distanceKm = useMemo(() => {
    return calculateDistanceKm(
      currentUser?.lat,
      currentUser?.lng,
      resource?.lat,
      resource?.lng
    );
  }, [currentUser?.lat, currentUser?.lng, resource?.lat, resource?.lng]);

  useEffect(() => {
    if (!isOpen || !resource || !needsTransport) return;
    let isMounted = true;
    api.getLogisticsEstimate(distanceKm, resource?.id)
      .then((data) => {
        if (isMounted) setLogisticsEstimate(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to fetch logistics estimate:', err);
        const rate = resource?.transport_rate_per_km || 2.5;
        const total = Math.round((25 + distanceKm * rate) * 100) / 100;
        setLogisticsEstimate({
          distance_km: distanceKm,
          base_fee: 25,
          rate_per_km: rate,
          total_fee: total
        });
      });
    return () => {
      isMounted = false;
    };
  }, [isOpen, needsTransport, distanceKm, resource?.id, resource?.transport_rate_per_km]);

  if (!isOpen || !resource) return null;

  // Calculate pricing
  const calculateDays = () => {
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffTime = e.getTime() - s.getTime();
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      return diffDays;
    } catch {
      return 1;
    }
  };

  const days = calculateDays();
  const standardTotal = resource.pricing_unit === 'hour'
    ? (resource.price_per_hour * 8 * days * Number(requestedQty || 1))
    : (resource.price_per_day * days * Number(requestedQty || 1));

  const transportFee = (needsTransport && logisticsEstimate) ? Number(logisticsEstimate.total_fee || 0) : 0;
  const baseResourcePrice = offerPrice ? Number(offerPrice) : standardTotal;
  const finalEstimatedPrice = baseResourcePrice + transportFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('Please login or select a business account to send requests', 'error');
      return;
    }

    if (currentUser.id === resource.provider_id) {
      setErrorMsg('You cannot request your own listed resource.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        seeker_id: currentUser.id,
        resource_id: resource.id,
        requested_qty: Number(requestedQty),
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        offer_price: Number(baseResourcePrice),
        seeker_notes: seekerNotes,
        needs_transport: needsTransport ? 1 : 0,
        transport_distance_km: needsTransport ? distanceKm : 0,
        transport_fee: needsTransport ? transportFee : 0,
        transport_notes: needsTransport ? transportNotes : null,
      };

      await api.createRequest(payload);
      
      // Celebrate request submission
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#14b8a6', '#f59e0b']
      });

      addToast(`Booking request sent to ${resource.provider_name}!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Send Resource Request</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Direct peer-to-peer booking inquiry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Target Resource Summary Box */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <img
              src={resource.image_url}
              alt=""
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{resource.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Provider: {resource.provider_name}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• ${resource.price_per_day}/day</span>
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/50 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Date Range Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quantity & Negotiated Offer Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Quantity Needed
              </label>
              <input
                type="number"
                min="1"
                max={resource.quantity || 100}
                value={requestedQty}
                onChange={(e) => setRequestedQty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Custom Offer Price ($)
              </label>
              <input
                type="number"
                placeholder={`Standard: $${standardTotal}`}
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Leave blank to use standard rate</span>
            </div>
          </div>

          {/* Transportation / Logistics Toggle Section */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Need transport/delivery for this resource?
                    {Boolean(resource.supports_transport) && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        Host offers delivery
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    On-demand logistics & equipment transport dispatch
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={needsTransport}
                  onChange={(e) => setNeedsTransport(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {needsTransport && (
              <div className="pt-3 border-t border-indigo-200/60 dark:border-indigo-800/40 space-y-3 animate-in fade-in duration-150">
                {/* Distance & Rate Breakdown */}
                <div className="grid grid-cols-3 gap-2 bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimated Route</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-500" />
                      {distanceKm} km
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Logistics Rate</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ${resource.transport_rate_per_km || 2.5}/km
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Transport Fee</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs">
                      +${logisticsEstimate ? logisticsEstimate.total_fee : Math.round((25 + distanceKm * (resource.transport_rate_per_km || 2.5)) * 100) / 100}
                    </span>
                  </div>
                </div>

                {/* Transport Notes */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Logistics Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Need refrigerated van, ramp access required, gate passcode #884"
                    value={transportNotes}
                    onChange={(e) => setTransportNotes(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes for Provider */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Event Details & Special Instructions
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Hosting a private wedding reception for 200 guests. Need loading dock access by 8:00 AM..."
              value={seekerNotes}
              onChange={(e) => setSeekerNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Pricing Calculation Summary Box */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Estimated Booking Total</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                {days} {days === 1 ? 'day' : 'days'} • {requestedQty} unit(s)
                {needsTransport && ` • +$${transportFee} Delivery`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                ${finalEstimatedPrice}
              </span>
              {offerPrice && Number(offerPrice) !== standardTotal ? (
                <p className="text-[10px] text-amber-600 dark:text-amber-300">
                  Custom offer proposal (Base: ${offerPrice}{needsTransport ? ` + $${transportFee} transport` : ''})
                </p>
              ) : needsTransport ? (
                <p className="text-[10px] text-indigo-600 dark:text-indigo-300">
                  Resource: ${standardTotal} + Transport: ${transportFee}
                </p>
              ) : null}
            </div>
          </div>

          {/* Footer Submit Actions */}
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/20 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Sending...' : 'Send Request to Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

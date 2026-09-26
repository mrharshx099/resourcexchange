import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  FileText, 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Building2, 
  Sparkles, 
  Check, 
  X, 
  ArrowRight,
  Truck
} from 'lucide-react';
import ChatPanel from '../components/ChatPanel';

export default function SeekerRequestsPage({ onOpenReviewModal, onExploreMore }) {
  const { currentUser, addToast } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [chatRequest, setChatRequest] = useState(null);

  const loadSeekerRequests = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await api.getSeekerRequests(currentUser.id);
      setRequests(data);
    } catch (err) {
      console.error('Failed to load seeker requests:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadSeekerRequests();
  }, [loadSeekerRequests]);

  // Handle Seeker Accepting a Counter-Offer
  const handleAcceptCounter = async (reqId) => {
    try {
      await api.acceptRequest(reqId);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      addToast('Counter-offer accepted! Your booking is now confirmed & locked.', 'success');
      loadSeekerRequests();
    } catch (err) {
      addToast(err.message || 'Failed to accept counter offer', 'error');
    }
  };

  // Handle Seeker Cancelling / Declining
  const handleCancel = async (reqId) => {
    if (window.confirm('Are you sure you want to cancel this booking request?')) {
      try {
        await api.cancelRequest(reqId);
        addToast('Request cancelled', 'info');
        loadSeekerRequests();
      } catch (err) {
        addToast(err.message || 'Failed to cancel request', 'error');
      }
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              Seeker Hub
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">• {currentUser?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            My Booking Inquiries & Exchanges
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track status progression from inquiry to confirmed lock and review completed rentals.
          </p>
        </div>

        <button
          onClick={onExploreMore}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
        >
          <span>Find More Resources</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-200 dark:border-slate-800">
        {['all', 'pending', 'counter_offered', 'accepted', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-2 rounded-xl capitalize font-semibold transition-colors ${
              filter === f
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-900/60 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <FileText className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">No requests matching this filter</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Search our catalog of ballrooms, kitchens, vehicles, and AV gear to send your first booking inquiry.
          </p>
          <button
            onClick={onExploreMore}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Explore Hospitality Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isCounter = req.status === 'counter_offered';
            const isAccepted = req.status === 'accepted';
            const isCompleted = req.status === 'completed';
            const isRejected = req.status === 'rejected';

            // Stepper progress index (0 to 4)
            let stepIndex = 1;
            if (isCounter) stepIndex = 2;
            if (isAccepted) stepIndex = 3;
            if (isCompleted) stepIndex = 4;

            return (
              <div
                key={req.id}
                className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm space-y-6"
              >
                {/* Visual Status Progression Stepper */}
                <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center justify-between relative">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 z-0" />
                    <div 
                      className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 z-0"
                      style={{ width: `${Math.min(100, (stepIndex - 1) * 33)}%` }}
                    />

                    {/* Step 1: Requested */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        ✓
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-1.5">Submitted</span>
                    </div>

                    {/* Step 2: In Review / Counter */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                        stepIndex >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {stepIndex >= 2 ? '✓' : '2'}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1.5">
                        {isCounter ? 'Counter-Offer' : 'Host Review'}
                      </span>
                    </div>

                    {/* Step 3: Confirmed / Locked */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                        stepIndex >= 3 ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {stepIndex >= 3 ? '✓' : '3'}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1.5">Confirmed</span>
                    </div>

                    {/* Step 4: Completed & Reviewed */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                        stepIndex >= 4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {stepIndex >= 4 ? '✓' : '4'}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1.5">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Info */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  
                  {/* Left: Resource Image & Provider Details */}
                  <div className="flex items-start gap-4">
                    <img
                      src={req.resource_image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80'}
                      alt=""
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {req.resource_category || 'Hospitality Resource'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{req.resource_title || 'Untitled Resource'}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Provider: <strong className="text-slate-800 dark:text-slate-200">{req.provider_name || 'Hospitality Host'}</strong></span>
                        <span className="text-amber-500 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {req.provider_rating ?? 4.8}★
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing Box */}
                  <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0 min-w-[210px] text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Total Agreed Price</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      ${req.negotiated_price || req.total_price || 0}
                    </span>
                    {Boolean(req.needs_transport) && (
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium block">
                        (Incl. ${req.transport_fee ?? 0} transport fee)
                      </span>
                    )}
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      {req.start_date || 'N/A'} to {req.end_date || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Transportation Add-on Line Item */}
                {Boolean(req.needs_transport) && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-500/30 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-teal-900 dark:text-teal-200">
                          Logistics & Delivery Handover Included
                        </span>
                        {req.transport_notes ? (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                            "{req.transport_notes}"
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Coordinated dispatch ({req.transport_distance_km ? `${req.transport_distance_km} km route` : 'Standard delivery'})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Delivery Charge</span>
                      <span className="font-extrabold text-teal-700 dark:text-teal-300 text-xs">
                        +${req.transport_fee ?? 0}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Bar: Chat / Message Button + Status Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  {/* Message Host Button */}
                  <button
                    onClick={() => setChatRequest(req)}
                    className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Message Host</span>
                    {Boolean((req.unread_messages_count ?? 0) > 0) && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 inline-block" />
                        {req.unread_messages_count} new
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Cancel pending inquiry */}
                    {isPending && (
                      <button
                        onClick={() => handleCancel(req.id)}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                      >
                        Cancel Inquiry
                      </button>
                    )}
                  </div>
                </div>

                {/* Counter Offer Alert Box (if provider sent a counter-offer) */}
                {isCounter && (
                  <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
                    <div>
                      <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-sm">
                        <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        Provider Proposed a Counter-Offer of ${req.negotiated_price}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 italic">
                        "{req.counter_notes || 'We can accommodate your group at this adjusted rate.'}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCancel(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptCounter(req.id)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-md"
                      >
                        Accept Counter-Offer (${req.negotiated_price})
                      </button>
                    </div>
                  </div>
                )}

                {/* Completed Review Prompt */}
                {isCompleted && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Exchange Concluded Successfully
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {req.has_review > 0
                          ? 'Thank you! You have submitted a review for this exchange.'
                          : 'Please share your rating to support verified hospitality trust standards.'}
                      </p>
                    </div>

                    {req.has_review === 0 && (
                      <button
                        onClick={() => onOpenReviewModal(req)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5 shrink-0"
                      >
                        <Star className="w-3.5 h-3.5 fill-slate-950" />
                        Leave 5★ Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* In-App Chat Slide-in Drawer */}
      <ChatPanel
        request={chatRequest}
        isOpen={!!chatRequest}
        onClose={() => {
          setChatRequest(null);
          loadSeekerRequests();
        }}
        onThreadUpdated={loadSeekerRequests}
      />
    </div>
  );
}

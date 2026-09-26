import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { 
  Building2, 
  PlusCircle, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  Inbox, 
  Layers, 
  ShieldCheck, 
  Star, 
  Check, 
  AlertCircle,
  Sparkles,
  TrendingUp,
  Truck
} from 'lucide-react';
import ChatPanel from '../components/ChatPanel';

export default function ProviderDashboard({ 
  onOpenAddListing, 
  onOpenEditListing, 
  onOpenCounterOffer, 
  onNavigate,
  initialTab = 'listings' 
}) {
  const { currentUser, addToast } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab); // 'listings' | 'calendar' | 'requests'
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedCalendarResource, setSelectedCalendarResource] = useState(null);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestFilter, setRequestFilter] = useState('all'); // 'all' | 'pending' | 'accepted' | 'counter_offered' | 'completed'
  const [chatRequest, setChatRequest] = useState(null);

  const loadProviderData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [resListings, resRequests] = await Promise.all([
        api.getProviderResources(currentUser.id),
        api.getProviderRequests(currentUser.id),
      ]);
      setListings(resListings);
      setRequests(resRequests);

      // Default calendar resource to the first listing
      if (resListings.length > 0 && !selectedCalendarResource) {
        setSelectedCalendarResource(resListings[0]);
      }
    } catch (err) {
      console.error('Failed to load provider dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedCalendarResource]);

  useEffect(() => {
    loadProviderData();
  }, [loadProviderData]);

  // Load availability slots when selectedCalendarResource changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedCalendarResource) return;
      try {
        const detail = await api.getResource(selectedCalendarResource.id);
        setAvailabilitySlots(detail.availabilitySlots || []);
      } catch (err) {
        console.error('Failed to load slots:', err);
      }
    }
    loadSlots();
  }, [selectedCalendarResource]);

  // Actions on Requests
  const handleAccept = async (requestId) => {
    try {
      await api.acceptRequest(requestId);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      addToast('Booking accepted! Calendar slot is now officially locked.', 'success');
      loadProviderData();
    } catch (err) {
      addToast(err.message || 'Failed to accept request', 'error');
    }
  };

  const handleReject = async (requestId) => {
    const reason = window.prompt('Reason for declining this request (optional):', 'Resource booked for internal event');
    if (reason !== null) {
      try {
        await api.rejectRequest(requestId, reason);
        addToast('Request declined', 'info');
        loadProviderData();
      } catch (err) {
        addToast(err.message || 'Failed to reject request', 'error');
      }
    }
  };

  const handleComplete = async (requestId) => {
    if (window.confirm('Mark this exchange as completed? This will prompt the seeker to leave a verified rating.')) {
      try {
        await api.completeRequest(requestId);
        addToast('Exchange marked as completed!', 'success');
        loadProviderData();
      } catch (err) {
        addToast(err.message || 'Failed to complete request', 'error');
      }
    }
  };

  const handleDeleteListing = async (resourceId) => {
    if (window.confirm('Are you sure you want to remove this resource listing?')) {
      try {
        await api.deleteResource(resourceId);
        addToast('Listing deleted successfully', 'info');
        loadProviderData();
      } catch (err) {
        addToast(err.message || 'Failed to delete listing', 'error');
      }
    }
  };

  // Calendar Blackout actions
  const handleBlockDate = async (slotData) => {
    if (!selectedCalendarResource) return;
    try {
      await api.blockAvailability(selectedCalendarResource.id, slotData);
      addToast(`Date range blocked as ${slotData.reason}`, 'info');
      // Refresh slots
      const detail = await api.getResource(selectedCalendarResource.id);
      setAvailabilitySlots(detail.availabilitySlots || []);
    } catch (err) {
      addToast(err.message || 'Failed to block date', 'error');
    }
  };

  const handleUnblockSlot = async (slotId) => {
    if (!selectedCalendarResource) return;
    try {
      await api.unblockAvailability(selectedCalendarResource.id, slotId);
      addToast('Date block released and is now available for bookings', 'success');
      const detail = await api.getResource(selectedCalendarResource.id);
      setAvailabilitySlots(detail.availabilitySlots || []);
    } catch (err) {
      addToast(err.message || 'Failed to unblock slot', 'error');
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (requestFilter === 'all') return true;
    return req.status === requestFilter;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              Provider Portal
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">• {currentUser?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Resource Sharing & Asset Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your banquet space, kitchen capacity, fleet, and incoming booking requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('analytics')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/40 text-xs font-bold transition-all active:scale-95 shadow-sm dark:shadow-md"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Analytics & Insights</span>
          </button>

          <button
            onClick={onOpenAddListing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/20 dark:shadow-emerald-950/50 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            + List New Resource
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel bg-white/95 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Listings</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{listings.length}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <Check className="w-3 h-3" /> Live in marketplace
          </span>
        </div>

        <div className="glass-panel bg-white/95 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Requests</span>
          <p className="text-2xl font-extrabold text-amber-500 dark:text-amber-400 mt-1">{pendingCount}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Awaiting your review</span>
        </div>

        <div className="glass-panel bg-white/95 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Confirmed Bookings</span>
          <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-300 mt-1">
            {requests.filter(r => r.status === 'accepted' || r.status === 'completed').length}
          </p>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 flex items-center gap-1 mt-1 font-medium">
            <ShieldCheck className="w-3 h-3" /> Zero double-bookings
          </span>
        </div>

        <div className="glass-panel bg-white/95 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Reputation Score</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-1">
            {currentUser?.rating || 4.9} <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            {currentUser?.reviews_count || 12} Verified Reviews
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'listings'
              ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-slate-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          My Listings ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'requests'
              ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-slate-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Incoming Requests ({requests.length})
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'calendar'
              ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-slate-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Availability Calendar Manager
        </button>

        <button
          onClick={() => onNavigate && onNavigate('analytics')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all sm:ml-auto"
        >
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Analytics Dashboard →</span>
        </button>
      </div>

      {/* TAB 1: MY LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Active Resource Portfolio
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Instant pricing, capacity, and live status controls
            </span>
          </div>

          {loading ? (
            /* Loading Skeletons */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-0 flex flex-col justify-between animate-pulse">
                  <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800/80" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800/50 rounded" />
                    <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 glass-panel bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-none">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">No hospitality resources listed yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Monetize your unused banquet hall, ghost kitchen shifts, parking spaces, or AV gear by sharing with peer businesses.
                </p>
              </div>
              <button
                onClick={onOpenAddListing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/20 active:scale-95 transition-all"
              >
                + Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((res) => (
                <div
                  key={res.id}
                  className="glass-card bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm dark:shadow-none"
                >
                  <div>
                    <div className="relative aspect-[16/10]">
                      <img src={res.image_url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                        {res.category || res.type}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-xs font-bold text-white">
                        ${res.price_per_day ? res.price_per_day : (res.price_per_hour * 8)}/day
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{res.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{res.description}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          {res.capacity} {res.capacity_unit}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">Min {res.min_duration_hours || 2}h</span>
                      </div>

                      {/* Pending inquiries indicator */}
                      {res.pending_requests_count > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 rounded-xl p-2 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                          <span>{res.pending_requests_count} new inquiry waiting</span>
                          <button
                            onClick={() => setActiveTab('requests')}
                            className="font-bold underline hover:text-amber-950 dark:hover:text-white"
                          >
                            View
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedCalendarResource(res);
                        setActiveTab('calendar');
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                      title="Manage Availability Calendar"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Calendar
                    </button>
                    <button
                      onClick={() => onOpenEditListing(res)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Edit Listing"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteListing(res.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING REQUESTS HUB */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['all', 'pending', 'counter_offered', 'accepted', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRequestFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-colors ${
                    requestFilter === tab
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredRequests.length} requests
            </span>
          </div>

          {loading ? (
            /* Loading Skeletons */
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-1.5">
                        <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="w-44 h-3 bg-slate-100 dark:bg-slate-800/60 rounded" />
                      </div>
                    </div>
                    <div className="w-28 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                  <div className="h-16 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
                  <div className="flex justify-end gap-2 pt-2">
                    <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 glass-panel bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm dark:shadow-none">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
                <Inbox className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">No requests found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                {requestFilter === 'all'
                  ? 'Incoming requests and inquiries from seekers will arrive here in real time with automated calendar collision checks.'
                  : `No requests currently matching status "${requestFilter.replace('_', ' ')}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => {
                const isPending = req.status === 'pending';
                const isAccepted = req.status === 'accepted';
                const isCounter = req.status === 'counter_offered';
                const isCompleted = req.status === 'completed';
                const isRejected = req.status === 'rejected';

                return (
                  <div
                    key={req.id}
                    className="glass-card bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-none"
                  >
                    {/* Top Row: Seeker Info & Status Pill */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.seeker_avatar || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{req.seeker_name}</h4>
                            <span className="text-[11px] text-amber-500 dark:text-amber-400 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" /> {req.seeker_rating || 4.8}★
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{req.seeker_type} • {req.seeker_email}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isPending && (
                          <span className="px-3 py-1 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
                            Action Required: Pending Offer
                          </span>
                        )}
                        {isAccepted && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                            ✓ Confirmed & Calendar Locked
                          </span>
                        )}
                        {isCounter && (
                          <span className="px-3 py-1 rounded-full bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 text-xs font-bold">
                            Counter-Offer Proposed: ${req.negotiated_price}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-3 py-1 rounded-full bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 text-xs font-bold">
                            ★ Exchange Concluded
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-3 py-1 rounded-full bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 text-xs font-bold">
                            Declined
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">Target Resource</span>
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{req.resource_title}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{req.resource_category}</p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">Requested Dates & Hours</span>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{req.start_date} to {req.end_date}</p>
                        <p className="text-teal-600 dark:text-teal-400 text-[11px] mt-0.5">Time: {req.start_time || '09:00'} - {req.end_time || '18:00'}</p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">Offered Total Price</span>
                        <p className="text-base font-extrabold text-slate-900 dark:text-white">
                          ${req.negotiated_price || req.total_price}
                        </p>
                        {req.negotiated_price && req.negotiated_price !== req.total_price && (
                          <p className="text-amber-600 dark:text-amber-400 text-[10px]">Standard rate was ${req.total_price}</p>
                        )}
                      </div>
                    </div>

                    {/* Seeker Event Notes */}
                    {req.seeker_notes && (
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">Seeker Instructions:</span>
                        <p className="text-slate-700 dark:text-slate-300 italic">"{req.seeker_notes}"</p>
                      </div>
                    )}

                    {/* Counter Notes if any */}
                    {req.counter_notes && (
                      <div className="bg-teal-50 dark:bg-teal-950/30 p-3 rounded-xl border border-teal-200 dark:border-teal-500/20 text-xs">
                        <span className="text-teal-800 dark:text-teal-300 font-medium block mb-1">Your Counter-Offer Note:</span>
                        <p className="text-slate-700 dark:text-slate-300">"{req.counter_notes}"</p>
                      </div>
                    )}

                    {/* Transportation Add-on details if requested */}
                    {Boolean(req.needs_transport) && (
                      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 text-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                              Logistics / Delivery Dispatch Requested
                            </span>
                            {req.transport_notes ? (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-0.5">
                                Note: "{req.transport_notes}"
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Coordinated dispatch ({req.transport_distance_km ? `${req.transport_distance_km} km route` : 'Standard delivery'})
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Logistics Surcharge</span>
                          <span className="font-extrabold text-indigo-700 dark:text-indigo-300 text-xs">
                            +${req.transport_fee ?? 0}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons for Provider */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      {/* Message Seeker button */}
                      <button
                        onClick={() => setChatRequest(req)}
                        className="relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Message Seeker</span>
                        {Boolean((req.unread_messages_count ?? 0) > 0) && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 inline-block" />
                            {req.unread_messages_count} new
                          </span>
                        )}
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-700 hover:text-rose-700 dark:text-slate-300 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => onOpenCounterOffer(req)}
                            className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors"
                          >
                            Propose Counter-Offer
                          </button>
                          <button
                            onClick={() => handleAccept(req.id)}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/20 flex items-center gap-1.5 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Accept & Lock Booking
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <button
                          onClick={() => handleComplete(req.id)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
                        >
                          Mark Exchange as Completed
                        </button>
                      )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AVAILABILITY CALENDAR MANAGER */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel bg-white/95 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">
                Interactive Resource Calendar Manager
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a listing below to review confirmed client bookings or block dates for maintenance.
              </p>
            </div>

            {/* Listing Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Selected Listing:</span>
              <select
                value={selectedCalendarResource?.id || ''}
                onChange={(e) => {
                  const found = listings.find(l => l.id === e.target.value);
                  setSelectedCalendarResource(found || null);
                }}
                className="bg-slate-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-semibold border border-slate-200 dark:border-slate-700 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedCalendarResource ? (
            <div className="space-y-4">
              <AvailabilityCalendar
                resource={selectedCalendarResource}
                availabilitySlots={availabilitySlots}
                isProvider={true}
                onBlockDate={handleBlockDate}
                onUnblockSlot={handleUnblockSlot}
              />

              {/* Blocked Slots Table List */}
              <div className="glass-panel bg-white/95 dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Currently Blocked / Booked Slots ({availabilitySlots.length})
                </h4>

                {availabilitySlots.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No blocked slots for this resource yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {availabilitySlots.map((slot) => {
                      const isClientBooked = slot.reason === 'booked';
                      return (
                        <div key={slot.id} className="py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${isClientBooked ? 'bg-rose-500' : 'bg-amber-400'}`} />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {new Date(slot.start_time).toLocaleDateString()} to {new Date(slot.end_time).toLocaleDateString()}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 capitalize">({slot.reason})</span>
                          </div>

                          {!isClientBooked && (
                            <button
                              onClick={() => handleUnblockSlot(slot.id)}
                              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold"
                            >
                              Release Date
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No listings available to display calendar.
            </div>
          )}
        </div>
      )}

      {/* Slide-in Chat Drawer */}
      <ChatPanel
        isOpen={Boolean(chatRequest)}
        onClose={() => {
          setChatRequest(null);
          loadProviderData();
        }}
        request={chatRequest}
        currentUser={currentUser}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Repeat, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Users, 
  DollarSign, 
  Calendar, 
  Scale, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Star,
  Layers,
  UtensilsCrossed,
  Car,
  Truck,
  Speaker
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onTryDemo, onExploreCatalog, onExplore }) {
  const handleExplore = onExploreCatalog || onExplore;
  const [stats, setStats] = useState({
    totalResources: 10,
    totalBusinesses: 5,
    totalBookings: 6,
    avgMatchScore: 94.6,
    totalValueTransacted: 12850
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getStatsSummary();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats summary:', err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-20 pb-16 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            <span>Hospitality B2B Peer-to-Peer Resource Exchange</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Share Idle Hospitality Assets.<br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-300 bg-clip-text text-transparent">
              Banquet Space, Kitchens, Parking & AV.
            </span>
          </h1>

          {/* Problem-Tied Value Prop */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Stop hunting for banquet space, parking, or kitchen capacity through WhatsApp groups and phone calls — discover and book shared hospitality resources instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 dark:shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all hover:border-emerald-500"
            >
              <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Try Live Demo (1-Click)</span>
            </button>

            <button
              onClick={handleExplore}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 font-semibold text-sm transition-all"
            >
              Browse Catalog →
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> No Setup Fees
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-500 dark:text-teal-400" /> Zero Double-Booking Lock
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Verified Partners Only
            </span>
          </div>
        </div>
      </section>

      {/* Live Platform Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-gradient-to-r dark:from-slate-900/90 dark:via-slate-900 dark:to-emerald-950/40 shadow-xl transition-colors">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.totalResources}+
              </span>
              <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Hospitality Resources Listed
              </p>
              <span className="text-[11px] text-slate-500">Across NYC Metro Area</span>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-4 sm:pt-0">
              <span className="text-3xl sm:text-4xl font-black text-teal-600 dark:text-teal-300 tracking-tight">
                {stats.totalBusinesses}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400">
                Businesses Onboarded
              </p>
              <span className="text-[11px] text-slate-500">Hotels, Caterers & Venues</span>
            </div>

            <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0">
              <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {stats.totalBookings}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400">
                Successful Bookings
              </p>
              <span className="text-[11px] text-slate-500">100% Calendar Confirmed</span>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 sm:pt-0">
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {stats.avgMatchScore}%
              </span>
              <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Avg Match Precision Score
              </p>
              <span className="text-[11px] text-slate-500">Haversine Distance & Capacity</span>
            </div>

          </div>
        </div>
      </section>

      {/* Brief "How It Works" 3-Step Visual: List -> Match -> Book */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Frictionless 3-Step Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How ResourceXchange Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            From listing idle banquet hours to closing confirmed transactions in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative space-y-4 hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg">
                1
              </div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Provider</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">List Capacity</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Post unused hotel ballrooms, ghost kitchen shifts, valet garage parking, or AV equipment with live availability calendars and rates.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs text-emerald-700 dark:text-emerald-300 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Zero listing fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>One-click blackout dates</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative space-y-4 hover:border-teal-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center font-black text-lg">
                2
              </div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Algorithm</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Rule Match</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Seekers search by proximity radius, date range, capacity, and budget. Our 5-factor scoring engine ranks resources by true fit and proximity.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs text-teal-700 dark:text-teal-300 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                <span>Haversine distance calculation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                <span>Side-by-side comparison matrix</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative space-y-4 hover:border-amber-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-lg">
                3
              </div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Exchange</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Book & Transact</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Send requests, negotiate with AI-assisted fair price suggestions, automatically lock the dates to prevent double-booking, and leave reviews.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs text-amber-700 dark:text-amber-300 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Auto-collision prevention</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Verified peer review badges</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Asset Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Hospitality Asset Spectrum
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            What Can You Share & Discover?
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: 'Banquet Space', desc: 'Ballrooms, Foyers, Roof Terraces', icon: Building2 },
            { title: 'Commercial Kitchens', desc: 'Combi Ovens, Bakery Decks', icon: UtensilsCrossed },
            { title: 'Guest Parking', desc: 'Valet Lots, Garages, Coach Yards', icon: Car },
            { title: 'Refrigerated Fleet', desc: 'Sprinter Vans, Box Trucks', icon: Truck },
            { title: 'Stage AV & Sound', desc: 'Line Arrays, 4K LED Walls, Mics', icon: Speaker },
            { title: 'Banquet Furniture', desc: 'Chiavari Chairs, Round Tables', icon: Layers },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={handleExplore}
                className="glass-card rounded-2xl p-4 text-center border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all hover:scale-105 group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-slate-950 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{item.title}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/40 text-center relative overflow-hidden bg-slate-900 text-white shadow-2xl space-y-6">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Monetize or Source Shared Capacity?
            </h2>
            <p className="text-xs sm:text-base text-slate-300">
              Join leading hotels, venues, and caterers in New York. Launch in 60 seconds with instant demo credentials or register your business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 hover:brightness-110 active:scale-95 transition-all"
              >
                Create Business Account
              </button>
              <button
                onClick={onTryDemo}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold text-xs transition-all"
              >
                Launch Demo Switcher
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

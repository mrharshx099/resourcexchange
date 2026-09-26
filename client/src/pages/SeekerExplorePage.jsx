import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import ResourceMapView from '../components/ResourceMapView';
import { 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin, 
  Sparkles, 
  Layers, 
  RotateCcw,
  PlusCircle,
  Building,
  UtensilsCrossed,
  Car,
  Truck,
  Speaker,
  Armchair,
  Map,
  List
} from 'lucide-react';

const CATEGORIES = [
  { label: 'All Resources', icon: Layers, value: 'All' },
  { label: 'Banquet & Spaces', icon: Building, value: 'Banquet & Event Space' },
  { label: 'Kitchen & Storage', icon: UtensilsCrossed, value: 'Commercial Kitchen & Cold Storage' },
  { label: 'Guest Parking & Valet', icon: Car, value: 'Guest Parking & Valet Lots' },
  { label: 'Fleet & Logistics', icon: Truck, value: 'Refrigerated Fleet & Transport' },
  { label: 'AudioVisual & Stage', icon: Speaker, value: 'Audio, Lighting & Stage AV' },
  { label: 'Furniture & Decor', icon: Armchair, value: 'Banquet Furniture & Decor' },
];

export default function SeekerExplorePage({ onSelectResource, onRequestResource, onOpenPostReq }) {
  const { currentUser } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-15');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState('30');
  const [sortBy, setSortBy] = useState('match');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        searchQuery: searchQuery.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minCapacity: minCapacity ? Number(minCapacity) : undefined,
        maxPrice: maxBudget ? Number(maxBudget) : undefined,
        maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined,
        sortBy,
        seekerLat: currentUser?.lat || 40.7580,
        seekerLng: currentUser?.lng || -73.9855,
        excludeProviderId: currentUser?.id,
      };

      const data = await api.getResources(params);
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, startDate, endDate, minCapacity, maxBudget, maxDistanceKm, sortBy, currentUser]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setStartDate('2026-10-15');
    setEndDate('2026-10-15');
    setMinCapacity('');
    setMaxBudget('');
    setMaxDistanceKm('30');
    setSortBy('match');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Banner with Value Proposition */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-emerald-500/30 p-6 sm:p-10 bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/40 shadow-sm dark:shadow-none">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Rule-Based Smart Matching Engine Active</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Share Idle Hospitality Assets.<br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-300 bg-clip-text text-transparent">
              Banquet Halls, Commercial Kitchens, Parking & AV.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed max-w-2xl">
            Match with verified hotels, venues, and caterers within your operating radius. 
            Zero double-booking guarantee with verified availability calendar blocks.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 max-w-lg">
            <div className="border-l-2 border-emerald-500 pl-3">
              <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">100%</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Conflict-Free Calendar</p>
            </div>
            <div className="border-l-2 border-teal-500 pl-3">
              <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">5-Factor</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Match Algorithm</p>
            </div>
            <div className="border-l-2 border-amber-500 pl-3">
              <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Direct</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Peer Negotiations</p>
            </div>
          </div>
        </div>

        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap border transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 font-bold scale-105'
                  : 'bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shadow-sm dark:shadow-none'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-emerald-500 dark:text-emerald-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Search & Smart Filter Control Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none">
        
        {/* Primary Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Keyword Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ballrooms, ovens, vans, stage sound..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Date Picker */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-2 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                title="Needed Date"
              />
            </div>
            <span className="text-slate-400 dark:text-slate-500 text-xs">to</span>
            <div className="relative flex-1">
              <Calendar className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-2 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                title="End Date"
              />
            </div>
          </div>

          {/* Sort By Switcher */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="match">✨ Smart Match Ranked</option>
              <option value="price_asc">💰 Price: Low to High</option>
              <option value="price_desc">💵 Price: High to Low</option>
              <option value="distance">📍 Distance: Nearest</option>
              <option value="rating">⭐ Provider Rating</option>
            </select>
          </div>
        </div>

        {/* Secondary Expandable Filters */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvancedFilters ? 'Hide Fine Filters' : 'Refine Radius, Capacity & Budget'}</span>
          </button>

          {(searchQuery || minCapacity || maxBudget || selectedCategory !== 'All' || maxDistanceKm !== '30') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
            {/* Radius Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> Max Distance
                </span>
                <span className="font-bold text-teal-600 dark:text-teal-300">{maxDistanceKm} km radius</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="2"
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Min Capacity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> Minimum Capacity
                </span>
                <span className="text-slate-500 dark:text-slate-400">{minCapacity ? `${minCapacity}+ units` : 'Any'}</span>
              </div>
              <input
                type="number"
                placeholder="e.g. 150 guests / 20 vehicles"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Max Budget */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Max Budget Cap
                </span>
                <span className="text-slate-500 dark:text-slate-400">{maxBudget ? `$${maxBudget}/day` : 'No Cap'}</span>
              </div>
              <input
                type="number"
                placeholder="e.g. $1,500"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Available Shared Resources</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
                {resources.length} Found
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked by proximity to your location, requested date availability, and budget fit
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* List vs Map View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>

          {/* Cannot find what you need CTA */}
          <button
            onClick={onOpenPostReq}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post RFQ</span>
          </button>
        </div>
      </div>

      {/* Main Results: Skeletons vs Map vs Grid */}
      {loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-0 flex flex-col justify-between animate-pulse">
              <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800/60 relative">
                <div className="absolute top-3 left-3 w-24 h-5 rounded-full bg-slate-300 dark:bg-slate-700/80" />
                <div className="absolute top-3 right-3 w-16 h-6 rounded-full bg-slate-300 dark:bg-slate-700/80" />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="w-28 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="w-12 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="w-3/4 h-5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="w-full h-3 rounded bg-slate-200 dark:bg-slate-800/80" />
                <div className="w-5/6 h-3 rounded bg-slate-200 dark:bg-slate-800/80" />
                <div className="flex gap-2 pt-2">
                  <div className="w-24 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  <div className="w-20 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                  <div className="w-20 h-6 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="w-28 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matching resources in this radius</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            We couldn't find any listings matching your specific combination of date availability, capacity, and distance radius ({maxDistanceKm} km).
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              Clear & Reset Filters
            </button>
            <button
              onClick={onOpenPostReq}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              Post a Requirement (Wanted Board)
            </button>
          </div>
        </div>
      ) : viewMode === 'map' ? (
        /* Map View */
        <ResourceMapView
          resources={resources}
          seekerLat={currentUser?.lat || 40.7580}
          seekerLng={currentUser?.lng || -73.9855}
          maxDistanceKm={maxDistanceKm}
          onSelectResource={onSelectResource}
          onRequestResource={onRequestResource}
        />
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onSelect={onSelectResource}
              onRequestClick={onRequestResource}
            />
          ))}
        </div>
      )}
    </div>
  );
}

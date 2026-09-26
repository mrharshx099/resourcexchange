import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import { 
  Building2, 
  Repeat, 
  Search, 
  PlusCircle, 
  FileText, 
  LayoutDashboard, 
  Layers, 
  RotateCcw, 
  CheckCircle,
  Star,
  ChevronDown,
  Sparkles,
  Inbox,
  LogOut,
  TrendingUp,
  Home,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenPostReq, onOpenAddListing }) {
  const { 
    currentUser, 
    allBusinesses, 
    switchBusiness, 
    activeRole, 
    setActiveRole, 
    resetDemo, 
    unreadCount,
    logout
  } = useAuth();
  
  const { theme, toggleTheme, isDark } = useTheme();
  const [showBizMenu, setShowBizMenu] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (window.confirm('Reset database with fresh realistic hospitality demo listings, requests, and reviews?')) {
      setIsResetting(true);
      await resetDemo();
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl transition-colors duration-200">
      {/* Top Banner / Demo Mode Bar */}
      <div className="bg-gradient-to-r from-emerald-50 via-slate-50 to-teal-50 dark:from-emerald-950/60 dark:via-slate-900 dark:to-indigo-950/60 border-b border-emerald-500/20 px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Live Hackathon B2B Demo</span>
          <span className="hidden md:inline text-slate-500 dark:text-slate-400">| Hospitality Peer-to-Peer Resource Marketplace</span>
        </div>

        {/* Demo Quick Account Switcher */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Active Account:</span>
          <div className="relative">
            <button
              onClick={() => setShowBizMenu(!showBizMenu)}
              className="flex items-center gap-2 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs transition-colors shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="max-w-[140px] truncate">{currentUser ? currentUser.name : 'Select Account'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showBizMenu && (
              <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 z-50 py-1 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Switch Hospitality Business
                </div>
                {allBusinesses.map((biz) => {
                  const isSelected = currentUser?.id === biz.id;
                  return (
                    <button
                      key={biz.id}
                      onClick={() => {
                        switchBusiness(biz.id);
                        setShowBizMenu(false);
                      }}
                      className={`w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${
                        isSelected ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-l-2 border-emerald-500' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <img src={biz.avatar} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-100">{biz.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{biz.type} • {biz.rating}★</p>
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Reset Demo State */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-amber-300 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs transition-colors shadow-sm"
            title="Reset to fresh demo listings & requests"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActivePage('landing')}
              className="flex items-center gap-2.5 group text-left"
              title="Return to Home / Landing Page"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center transition-colors">
                  <Repeat className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 dark:from-emerald-400 dark:via-teal-300 dark:to-white bg-clip-text text-transparent">
                  Resource<span className="text-emerald-500 dark:text-emerald-400">X</span>change
                </span>
                <span className="block text-[10px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                  Hospitality Resource Network
                </span>
              </div>
            </button>

            {/* Dual Role Selector Pill */}
            <div className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-xs transition-colors">
              <button
                onClick={() => {
                  setActiveRole('seeker');
                  setActivePage('explore');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeRole === 'seeker'
                    ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Seeker View (Find & Book)
              </button>
              <button
                onClick={() => {
                  setActiveRole('provider');
                  setActivePage('provider_dashboard');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeRole === 'provider'
                    ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Provider View (List & Manage)
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActivePage('landing')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activePage === 'landing'
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>

            {activeRole === 'seeker' ? (
              <>
                <button
                  onClick={() => setActivePage('explore')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activePage === 'explore'
                      ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Explore Resources
                </button>
                <button
                  onClick={() => setActivePage('seeker_requests')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activePage === 'seeker_requests'
                      ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  My Booking Requests
                </button>
                <button
                  onClick={() => setActivePage('requirements')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activePage === 'requirements'
                      ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Wanted Board (RFQs)
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActivePage('provider_dashboard')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activePage === 'provider_dashboard'
                      ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Listings
                </button>
                <button
                  onClick={() => setActivePage('provider_requests')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activePage === 'provider_requests'
                      ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  Requests
                </button>
                <button
                  onClick={() => setActivePage('analytics')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activePage === 'analytics'
                      ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </button>
                <button
                  onClick={() => setActivePage('requirements')}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activePage === 'requirements'
                      ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  RFQs
                </button>
              </>
            )}
            
            <button
              onClick={() => setActivePage('profile')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activePage === 'profile'
                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Business Profile
            </button>
          </nav>

          {/* Action CTAs, Theme Toggle & Profile Badge */}
          <div className="flex items-center gap-2.5">
            {activeRole === 'seeker' ? (
              <button
                onClick={onOpenPostReq}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Post Requirement
              </button>
            ) : (
              <button
                onClick={onOpenAddListing}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                + List Resource
              </button>
            )}

            {/* Notification Bell (only when logged in) */}
            {currentUser && (
              <NotificationDropdown onNavigate={(page) => setActivePage(page === 'requests' ? (activeRole === 'provider' ? 'provider_requests' : 'seeker_requests') : page)} />
            )}

            {/* Sun / Moon Day/Night Toggle Button (Desktop & Tablet) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-amber-500 dark:text-amber-400 border border-slate-200 dark:border-slate-700/80 transition-all duration-300 active:scale-90 flex items-center justify-center relative shadow-sm"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme mode"
            >
              <div className="relative w-4 h-4">
                <Sun
                  className={`w-4 h-4 absolute inset-0 transform transition-all duration-300 ease-in-out ${
                    isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-amber-500'
                  }`}
                />
                <Moon
                  className={`w-4 h-4 absolute inset-0 transform transition-all duration-300 ease-in-out ${
                    isDark ? 'rotate-0 scale-100 opacity-100 text-amber-400' : '-rotate-90 scale-0 opacity-0'
                  }`}
                />
              </div>
            </button>

            {/* Current Business Avatar & Logout OR Login / Signup Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                <div 
                  onClick={() => setActivePage('profile')}
                  className="flex items-center gap-2.5 cursor-pointer group"
                  title="View Business Profile"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/40 group-hover:ring-emerald-400 transition-all"
                  />
                  <div className="hidden xl:block text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors">
                        {currentUser.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{currentUser.rating || 5.0}</span>
                      <span>• {currentUser.type}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setActivePage('login');
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800/80 dark:hover:bg-rose-950/60 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-medium"
                  title="Log out of account"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1">
                <button
                  onClick={() => setActivePage('login')}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors shadow-sm"
                >
                  Log In
                </button>
                <button
                  onClick={() => setActivePage('signup')}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold shadow-md transition-all active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center py-2 border-t border-slate-200 dark:border-slate-800 text-xs overflow-x-auto gap-2">
          {/* Mobile Sun/Moon Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-amber-500 dark:text-amber-400 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
          </button>

          <button
            onClick={() => setActiveRole(activeRole === 'seeker' ? 'provider' : 'seeker')}
            className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-1.5 rounded-lg font-medium shrink-0 border border-emerald-300 dark:border-emerald-500/30"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>{activeRole === 'seeker' ? 'Provider' : 'Seeker'}</span>
          </button>
          
          <button
            onClick={() => setActivePage('landing')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 ${activePage === 'landing' ? 'bg-slate-200 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Home
          </button>

          <button
            onClick={() => setActivePage('explore')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 ${activePage === 'explore' ? 'bg-slate-200 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Explore
          </button>
          
          <button
            onClick={() => setActivePage(activeRole === 'provider' ? 'provider_dashboard' : 'seeker_requests')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 ${activePage === 'provider_dashboard' || activePage === 'seeker_requests' ? 'bg-slate-200 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
          >
            {activeRole === 'provider' ? 'Dashboard' : 'Requests'}
          </button>

          {activeRole === 'provider' && (
            <button
              onClick={() => setActivePage('analytics')}
              className={`px-2.5 py-1.5 rounded-lg shrink-0 ${activePage === 'analytics' ? 'bg-slate-200 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Analytics
            </button>
          )}
          
          <button
            onClick={() => setActivePage('requirements')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 ${activePage === 'requirements' ? 'bg-slate-200 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
          >
            RFQs
          </button>
        </div>
      </div>
    </header>
  );
}

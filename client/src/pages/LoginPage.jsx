import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Repeat, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Building2, 
  ArrowRight, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const DEMO_BUSINESSES = [
  { id: 'biz_grand_palace', name: 'Grand Palace Hotel & Resort', role: 'Hotel & Resort', icon: '🏨' },
  { id: 'biz_spice_artistry', name: 'Spice Artistry Catering Co.', role: 'Catering & Dining', icon: '👨‍🍳' },
  { id: 'biz_azure_banquet', name: 'Azure Grand Banquet & Expo', role: 'Banquet & Venue', icon: '🏛️' },
  { id: 'biz_apex_av', name: 'Apex Stage & AudioVisual', role: 'Event Production', icon: '🎙️' },
  { id: 'biz_metro_logistics', name: 'Metro Fleet & Cold Logistics', role: 'Fleet & Logistics', icon: '🚚' },
];

export default function LoginPage({ onNavigateSignup, onSuccessLogin }) {
  const { login, loginDemo } = useAuth();

  const [email, setEmail] = useState('host@grandpalace.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoadingId, setDemoLoadingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login({ email: email.trim(), password });
      if (onSuccessLogin) onSuccessLogin();
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (bizId) => {
    setErrorMsg('');
    setDemoLoadingId(bizId);
    try {
      await loginDemo(bizId);
      if (onSuccessLogin) onSuccessLogin();
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setDemoLoadingId(null);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md">
        
        {/* Glow backdrop */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-indigo-500/20 rounded-3xl blur-xl pointer-events-none" />

        {/* Card */}
        <div className="relative glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl space-y-6 transition-colors">
          
          {/* Logo and Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 items-center justify-center mx-auto">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center transition-colors">
                <Repeat className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Log in to <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">ResourceXchange</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hospitality B2B resource-sharing marketplace
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 rounded-2xl text-xs text-rose-700 dark:text-rose-200 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Business Email
              </label>
              <input
                type="email"
                required
                placeholder="name@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : 'Log In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Don't have an account link */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
            Don't have an account?{' '}
            <button
              onClick={onNavigateSignup}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold transition-colors"
            >
              Sign up
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
              or
            </div>
          </div>

          {/* Quick Demo Login Section for Judges */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                Quick Demo Login
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">1-Click Judge Access</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_BUSINESSES.map((biz) => {
                const isTargetLoading = demoLoadingId === biz.id;
                return (
                  <button
                    key={biz.id}
                    type="button"
                    onClick={() => handleDemoLogin(biz.id)}
                    disabled={demoLoadingId != null}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/40 text-left transition-all group disabled:opacity-50 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">{biz.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors truncate">
                          {biz.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{biz.role}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400/90 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                      {isTargetLoading ? 'Logging in...' : 'Sign In →'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

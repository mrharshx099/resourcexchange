import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Repeat, 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  AlertCircle, 
  Check, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const BUSINESS_TYPES = [
  'Hotel & Resort',
  'Catering & Dining',
  'Banquet & Convention',
  'Event Production',
  'Fleet & Transport',
  'Restaurant & Ghost Kitchen'
];

export default function SignupPage({ onNavigateLogin, onSuccessSignup }) {
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [type, setType] = useState(BUSINESS_TYPES[0]);
  const [location, setLocation] = useState('Manhattan, New York');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form submit handler with inline validations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation 1: Business name
    if (!name.trim()) {
      setErrorMsg('Please enter your business name');
      return;
    }

    // Validation 2: Email format
    const emailNorm = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNorm)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    // Validation 3: Password min 6 chars
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    // Validation 4: Confirm password match
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    // Validation 5: Location
    if (!location.trim()) {
      setErrorMsg('Please enter your business city / borough location');
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        name: name.trim(),
        email: emailNorm,
        password,
        type,
        location: location.trim(),
        city: location.trim(),
      });

      if (onSuccessSignup) onSuccessSignup();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create business account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-lg">
        
        {/* Glow backdrop */}
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-emerald-500/10 to-indigo-500/20 rounded-3xl blur-xl pointer-events-none" />

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
              Create Business Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Join the hospitality peer-to-peer resource-sharing network
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
            
            {/* 1. Business Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Business / Venue Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Skyline Event Venue & Catering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* 2. Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Business Email Address
              </label>
              <input
                type="email"
                required
                placeholder="contact@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* 3. Password & 4. Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-9 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-9 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Business Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Business Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium transition-colors"
              >
                {BUSINESS_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            {/* 6. Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Location / Operational City
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Midtown Manhattan, New York"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                Used to compute proximity distance matching for nearby resources
              </span>
            </div>

            {/* Primary Signup Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account & Enter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Already have an account link */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
            Already have an account?{' '}
            <button
              onClick={onNavigateLogin}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold transition-colors"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

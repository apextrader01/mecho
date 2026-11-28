'use client';

import React, { useState } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { SHORTEDGE_SERVICES, ServiceDefinition } from '../lib/services';
import {
  X,
  Phone,
  Lock,
  Building,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles,
  Check,
  Briefcase
} from 'lucide-react';

interface VendorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export default function VendorAuthModal({ isOpen, onClose, defaultTab = 'login' }: VendorAuthModalProps) {
  const { login, registerVendor, sendOtp, verifyOtp, loginAsVendor } = useVendorAuth();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);

  // Login Mode (OTP vs Password)
  const [loginMode, setLoginMode] = useState<'otp' | 'password'>('otp');

  // OTP Login State
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpHint, setOtpHint] = useState<string | null>(null);

  // Password Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // -------------------------------------------------------------
  // MULTI-STEP VENDOR REGISTRATION WITH SERVICE SELECTION
  // -------------------------------------------------------------
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Profile & Workshop
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('100ft Road, Indiranagar, Bangalore');
  const [regRadius, setRegRadius] = useState(15);

  // Step 2: Multi-Service Selection
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'emergency-fuel',
    'roadside-puncture'
  ]);
  const [serviceFilter, setServiceFilter] = useState<'all' | 'instant' | 'rfq' | 'commerce'>('all');

  // Step 3: Rates
  const [regDayFee, setRegDayFee] = useState(200);
  const [regNightFee, setRegNightFee] = useState(350);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Toggle service selection
  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const selectAllServices = () => {
    setSelectedServices(SHORTEDGE_SERVICES.map(s => s.id));
  };

  const clearAllServices = () => {
    setSelectedServices([]);
  };

  // Step 1 Validation
  const handleNextToServices = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = regPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!regBusinessName.trim() || !regOwnerName.trim()) {
      setErrorMessage('Business name and owner name are required.');
      return;
    }

    setRegStep(2);
  };

  // Step 2 Validation
  const handleNextToRates = () => {
    setErrorMessage(null);
    if (selectedServices.length === 0) {
      setErrorMessage('Please select at least one service that your workshop or business provides.');
      return;
    }
    setRegStep(3);
  };

  // Final Registration Submission
  const handleSubmitRegistration = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await registerVendor({
        name: regOwnerName,
        phone: regPhone.replace(/[^0-9]/g, ''),
        email: regEmail || undefined,
        password: regPassword,
        businessName: regBusinessName,
        categories: selectedServices.join(','),
        address: regAddress,
        serviceRadiusKm: Number(regRadius),
        dayRunnerFee: Number(regDayFee),
        nightRunnerFee: Number(regNightFee)
      });

      if (res.success) {
        setRegStep(4);
      } else {
        setErrorMessage(res.error || 'Registration failed. Please verify your details.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Login Handlers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    const res = await sendOtp(clean);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpHint(res.otp || '1234');
      setSuccessMessage(`OTP sent to +91 ${clean.slice(-10)}! (Use: ${res.otp || '1234'})`);
    } else {
      setErrorMessage(res.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Please enter the 4-digit verification OTP');
      return;
    }

    setLoading(true);
    const res = await verifyOtp(phone, otpCode);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Invalid OTP code');
    }
  };

  // Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Invalid credentials');
    }
  };

  const filteredServices = SHORTEDGE_SERVICES.filter(s => {
    if (serviceFilter === 'all') return true;
    return s.engine === serviceFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black">
              SE
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                <span>ShortEdge Partner Portal</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {tab === 'login' ? 'Sign In' : `Register (Step ${regStep}/3)`}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {tab === 'login'
                  ? 'Access your dispatches, emergency sirens, and payout reports'
                  : 'Register your workshop, select your services, and start receiving dispatches'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Mode Tabs */}
        {regStep !== 4 && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 border-b border-slate-800/60 text-xs font-bold">
            <button
              onClick={() => { setTab('login'); setErrorMessage(null); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                tab === 'login' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Partner Sign In</span>
            </button>
            <button
              onClick={() => { setTab('register'); setRegStep(1); setErrorMessage(null); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                tab === 'register' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Join as Partner (Choose Services)</span>
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* ========================================================= */}
          {/* LOGIN TAB */}
          {/* ========================================================= */}
          {tab === 'login' && (
            <div className="space-y-4 max-w-md mx-auto">
              {/* Sub-tabs: Mobile OTP vs Password */}
              <div className="flex rounded-xl bg-slate-800/70 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLoginMode('otp')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    loginMode === 'otp' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📱 Mobile OTP
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('password')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    loginMode === 'password' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔑 Email & Password
                </button>
              </div>

              {loginMode === 'otp' ? (
                !otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Registered Partner Mobile Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="98765 43212"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black py-3 rounded-xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>{loading ? 'Sending OTP...' : 'Send Partner OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-300">
                          Enter 4-Digit OTP
                        </label>
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setOtpCode(''); }}
                          className="text-[11px] text-orange-400 font-bold hover:underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 1234"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full text-center text-2xl font-mono tracking-widest font-black py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                        autoFocus
                      />
                      {otpHint && (
                        <p className="text-[11px] text-emerald-400 text-center mt-1.5 font-mono">
                          Simulated Dev OTP: <strong>{otpHint}</strong>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 rounded-xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{loading ? 'Verifying...' : 'Verify & Open Partner Portal'}</span>
                    </button>
                  </form>
                )
              ) : (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Business Email or Phone
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="sharma.rescue@gmail.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black py-3 rounded-xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Partner Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Quick Demo Switcher */}
              <div className="pt-4 border-t border-slate-800/80">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                  Or 1-Click Demo Partner Profiles
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => { loginAsVendor('sharma.rescue@gmail.com'); onClose(); }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-slate-200"
                  >
                    <div className="font-bold flex items-center gap-1">⛽ Sharma</div>
                    <div className="text-[10px] text-slate-400">Roadside & Fuel</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { loginAsVendor('apollo.pharmacy@gmail.com'); onClose(); }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-slate-200"
                  >
                    <div className="font-bold flex items-center gap-1">💊 Apollo</div>
                    <div className="text-[10px] text-slate-400">24/7 Chemist</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* REGISTER TAB: STEP 1 - BUSINESS & CONTACT DETAILS */}
          {/* ========================================================= */}
          {tab === 'register' && regStep === 1 && (
            <form onSubmit={handleNextToServices} className="space-y-3.5">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <div className="text-xs text-orange-200/90">
                  <strong className="text-orange-300">Step 1 of 3:</strong> Enter your workshop or business information. On the next step, you will choose exactly which services you want to receive dispatches for.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Owner / Contact Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Sunil Kumar"
                      value={regOwnerName}
                      onChange={(e) => setRegOwnerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Business / Workshop Name *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Apex Auto Care & Fuel Runners"
                      value={regBusinessName}
                      onChange={(e) => setRegBusinessName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Number (10 digits) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-11 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="sunil.autocare@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Account Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Operating Hub / Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. 100ft Road, Near Sony World Signal, Koramangala, Bangalore"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-1">
                  <span>Service Dispatch Coverage Radius</span>
                  <span className="text-orange-400 font-extrabold">{regRadius} km</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="35"
                  step="1"
                  value={regRadius}
                  onChange={(e) => setRegRadius(parseInt(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>3 km (Hyperlocal)</span>
                  <span>15 km (Standard Hub)</span>
                  <span>35 km (Citywide Express)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold py-3 rounded-xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Select Services (Step 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* REGISTER TAB: STEP 2 - INTERACTIVE SERVICE SELECTION GRID */}
          {/* ========================================================= */}
          {tab === 'register' && regStep === 2 && (
            <div className="space-y-4">
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-3 flex items-start justify-between gap-3">
                <div className="text-xs text-sky-200">
                  <strong className="text-sky-300">Step 2: Choose What Services You Provide.</strong>
                  <p className="text-[11px] text-sky-300/80 mt-0.5">
                    Select all trades your team or runners handle. You will receive live sirens and RFQs for checked services.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-black border border-sky-400/30">
                    {selectedServices.length} Selected
                  </span>
                </div>
              </div>

              {/* Service Filter Chips & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1">
                  {[
                    { id: 'all', label: 'All (11)' },
                    { id: 'instant', label: '⚡ Rapid SOS' },
                    { id: 'rfq', label: '📝 Quote Bids' },
                    { id: 'commerce', label: '🛒 Subscriptions' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setServiceFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        serviceFilter === f.id
                          ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-500'
                          : 'text-slate-400 hover:text-white bg-slate-800/60'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={selectAllServices}
                    className="text-orange-400 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={clearAllServices}
                    className="text-slate-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Grid of Interactive Services */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredServices.map(service => {
                  const isSelected = selectedServices.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left select-none ${
                        isSelected
                          ? 'bg-orange-950/30 border-orange-500 ring-2 ring-orange-500/30 shadow-md'
                          : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl p-1.5 rounded-xl bg-slate-800 shrink-0">
                              {service.emoji}
                            </span>
                            <div>
                              <h4 className="font-extrabold text-xs text-white leading-tight">
                                {service.name}
                              </h4>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-orange-400">
                                {service.badge}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                              isSelected
                                ? 'bg-orange-600 border-orange-500 text-white'
                                : 'border-slate-600 bg-slate-800'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Base rate guideline:</span>
                        <span className="font-bold text-slate-300">{service.typicalFee}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRegStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextToRates}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold py-2.5 rounded-xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue with ({selectedServices.length}) Services</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* REGISTER TAB: STEP 3 - RATES & CONFIRMATION */}
          {/* ========================================================= */}
          {tab === 'register' && regStep === 3 && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-xs text-emerald-200">
                <strong className="text-emerald-300">Step 3 of 3: Set Your Default Rates & Submit.</strong>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">
                  Set standard inspection and night dispatch fees. You can customize per-order bids inside your portal.
                </p>
              </div>

              {/* Application Summary Box */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400">Workshop & Partner:</span>
                  <span className="font-extrabold text-white">{regBusinessName} ({regOwnerName})</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                  <span className="text-slate-400">Hub & Radius:</span>
                  <span className="font-bold text-slate-200">{regAddress} • {regRadius} km</span>
                </div>
                <div>
                  <span className="block text-slate-400 mb-1.5">Approved Service Capabilities ({selectedServices.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedServices.map(id => {
                      const svc = SHORTEDGE_SERVICES.find(s => s.id === id);
                      return (
                        <span
                          key={id}
                          className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/30 text-[10px] font-bold flex items-center gap-1"
                        >
                          <span>{svc?.emoji}</span>
                          <span>{svc?.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rate Sliders / Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Day Standard Visit Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    step="50"
                    value={regDayFee}
                    onChange={(e) => setRegDayFee(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-extrabold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">6:00 AM – 10:00 PM standard callout</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-2xl">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Night Rapid SOS Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="3000"
                    step="50"
                    value={regNightFee}
                    onChange={(e) => setRegNightFee(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-extrabold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">10:00 PM – 6:00 AM emergency siren</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRegStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmitRegistration}
                  className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 rounded-xl text-xs tracking-wide shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Submitting Application...' : '🚀 Submit Application & Register'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* REGISTER TAB: STEP 4 - SUCCESS & ONBOARDING CONFIRMATION */}
          {/* ========================================================= */}
          {tab === 'register' && regStep === 4 && (
            <div className="text-center py-6 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-3xl animate-bounce">
                🎉
              </div>

              <div>
                <h4 className="text-lg font-black text-white">Partner Application Submitted!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Welcome aboard, <strong className="text-white">{regBusinessName}</strong>! Your partner profile has been registered and is placed in the verification queue.
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-2xl text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">KYC Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-[10px] animate-pulse">
                    PENDING ADMIN APPROVAL
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Registered Services:</span>
                  <span className="font-extrabold text-white">{selectedServices.length} Selected Trades</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Operating City:</span>
                  <span className="font-bold text-slate-200">Bangalore ({regRadius} km Radius)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 text-sky-200 text-xs text-left max-w-md mx-auto">
                💡 <strong>Founder Tip:</strong> Since you have the Admin Command center open at <code>/admin</code>, you can approve your new partner account right now with 1 click!
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full max-w-md bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold py-3 rounded-xl text-xs tracking-wide shadow-md active:scale-95 transition-all"
                >
                  Open Partner Console
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import {
  X,
  Phone,
  Lock,
  Building,
  User,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

interface VendorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'otp' | 'password' | 'register';
}

export default function VendorAuthModal({ isOpen, onClose, defaultTab = 'otp' }: VendorAuthModalProps) {
  const { login, registerVendor, sendOtp, verifyOtp, loginAsVendor } = useVendorAuth();
  const [tab, setTab] = useState<'otp' | 'password' | 'register'>(defaultTab);

  // OTP State
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');

  // Password Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Registration State
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCategory, setRegCategory] = useState('emergency-fuel,roadside-puncture');
  const [regAddress, setRegAddress] = useState('Indiranagar 100ft Road, Bangalore');
  const [regRadius, setRegRadius] = useState(15);
  const [regDayFee, setRegDayFee] = useState(150);
  const [regNightFee, setRegNightFee] = useState(250);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
    const res = await verifyOtp(phone, otpCode, businessName || undefined);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Invalid OTP');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier || !password) {
      setErrorMessage('Please enter your business phone/email and password');
      return;
    }

    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Invalid credentials');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regOwnerName || !regBusinessName || !regPhone || !regPassword) {
      setErrorMessage('Please fill in Owner Name, Business Name, Phone, and Password');
      return;
    }

    setLoading(true);
    const res = await registerVendor({
      name: regOwnerName,
      businessName: regBusinessName,
      phone: regPhone,
      email: regEmail || undefined,
      password: regPassword,
      categories: regCategory,
      address: regAddress,
      serviceRadiusKm: regRadius,
      dayRunnerFee: regDayFee,
      nightRunnerFee: regNightFee
    });
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Vendor onboarding failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
              SE
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Partner Hub Portal
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Vendor & Runner Access</h2>
          <p className="text-xs text-orange-100 mt-0.5">
            Accept emergency dispatches, submit quotes & manage daily deliveries
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 bg-slate-950 p-1.5 border-b border-slate-800 text-xs font-bold text-slate-400">
          <button
            onClick={() => { setTab('otp'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'otp' ? 'bg-orange-600 text-white shadow-sm font-black' : 'hover:text-white'
            }`}
          >
            📱 Mobile OTP
          </button>
          <button
            onClick={() => { setTab('password'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'password' ? 'bg-orange-600 text-white shadow-sm font-black' : 'hover:text-white'
            }`}
          >
            🔑 Password
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'register' ? 'bg-orange-600 text-white shadow-sm font-black' : 'hover:text-white'
            }`}
          >
            🏪 Onboard Shop
          </button>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-3">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
              {otpHint && (
                <button
                  type="button"
                  onClick={() => setOtpCode(otpHint)}
                  className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-500"
                >
                  Auto-fill
                </button>
              )}
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: MOBILE OTP */}
          {tab === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Registered Vendor Mobile Number
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
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black py-3 rounded-2xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Sending OTP...' : 'Send Vendor OTP'}</span>
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
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Business Name <span className="text-slate-500 font-normal">(Optional for new vendors)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Metro Quick Tyre & Battery"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 rounded-2xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? 'Verifying...' : 'Verify & Open Partner Console'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PASSWORD LOGIN */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Business Phone or Email
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
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black py-3 rounded-2xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Vendor Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER NEW VENDOR */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Owner Name</label>
                  <input
                    type="text"
                    placeholder="Ramesh Sharma"
                    value={regOwnerName}
                    onChange={(e) => setRegOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    placeholder="Sharma Roadside Assist"
                    value={regBusinessName}
                    onChange={(e) => setRegBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543299"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Business Category</label>
                <select
                  value={regCategory}
                  onChange={(e) => setRegCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="emergency-fuel,roadside-puncture">⛽ Emergency Fuel & Roadside Puncture Runner</option>
                  <option value="painting-services">🎨 House Paint, Textures & Wall Finishing</option>
                  <option value="furniture-interiors">🪑 Custom Carpentry, Furniture & Modular Kitchen</option>
                  <option value="daily-subscriptions,kirana-grocery">🥛 Kirana Supermarket & Daily 20L Water/Milk</option>
                  <option value="goods-auto-booking">🚚 Mini-Truck & Goods Loading Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Operating Shop Address</label>
                <input
                  type="text"
                  placeholder="100ft Road, Near Sony World Signal, Koramangala"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Radius (km)</label>
                  <input
                    type="number"
                    value={regRadius}
                    onChange={(e) => setRegRadius(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Day Fee (₹)</label>
                  <input
                    type="number"
                    value={regDayFee}
                    onChange={(e) => setRegDayFee(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Night Fee (₹)</label>
                  <input
                    type="number"
                    value={regNightFee}
                    onChange={(e) => setRegNightFee(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black py-3 rounded-2xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Submitting Application...' : 'Register Business Partner'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Switcher Footer */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 text-center">
              Or 1-Click Demo Partner Profiles
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={async () => {
                  await loginAsVendor('sharma.rescue@gmail.com');
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-orange-600/20 border border-slate-700 hover:border-orange-500/50 text-left transition-colors"
              >
                <span className="font-black text-white block text-[11px] truncate">⛽ Sharma</span>
                <span className="text-[10px] text-slate-400 block truncate">Roadside & Fuel</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await loginAsVendor('verma.painters@gmail.com');
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-orange-600/20 border border-slate-700 hover:border-orange-500/50 text-left transition-colors"
              >
                <span className="font-black text-white block text-[11px] truncate">🎨 Verma</span>
                <span className="text-[10px] text-slate-400 block truncate">Painter Contractor</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await loginAsVendor('patel.kirana@gmail.com');
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-orange-600/20 border border-slate-700 hover:border-orange-500/50 text-left transition-colors"
              >
                <span className="font-black text-white block text-[11px] truncate">🥛 Patel</span>
                <span className="text-[10px] text-slate-400 block truncate">Kirana & Water</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

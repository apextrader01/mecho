'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Phone,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'otp' | 'password' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'otp' }: AuthModalProps) {
  const { login, register, sendOtp, verifyOtp, loginAsDemoUser, t } = useAuth();
  const [tab, setTab] = useState<'otp' | 'password' | 'register'>(defaultTab);

  // OTP State
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [otpName, setOtpName] = useState('');

  // Password Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Registration State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

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
      setSuccessMessage(`4-digit OTP sent to +91 ${clean.slice(-10)}! (Use: ${res.otp || '1234'})`);
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
    const res = await verifyOtp(phone, otpCode, otpName || undefined);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Invalid OTP. Please try again.');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier || !password) {
      setErrorMessage('Please enter your phone/email and password');
      return;
    }

    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Invalid phone/email or password');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName || !regPhone || !regPassword) {
      setErrorMessage('Please enter your Name, Phone Number, and Password');
      return;
    }

    setLoading(true);
    const res = await register({
      name: regName,
      phone: regPhone,
      email: regEmail || undefined,
      password: regPassword
    });
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Registration failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
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
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Customer Account
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Welcome to ShortEdge</h2>
          <p className="text-xs text-orange-100 mt-0.5">
            Hyperlocal dispatches, instant price comparison & subscriptions
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-bold text-slate-600">
          <button
            onClick={() => { setTab('otp'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'otp' ? 'bg-white text-orange-600 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            📱 Mobile OTP
          </button>
          <button
            onClick={() => { setTab('password'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'password' ? 'bg-white text-orange-600 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            🔑 Password
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'register' ? 'bg-white text-orange-600 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            📝 Register
          </button>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
              {otpHint && (
                <button
                  type="button"
                  onClick={() => setOtpCode(otpHint)}
                  className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700"
                >
                  Auto-fill
                </button>
              )}
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* TAB 1: MOBILE OTP LOGIN */}
          {tab === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mobile Number (India)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      We'll send an instant 4-digit verification code.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black py-3 rounded-2xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Sending OTP...' : 'Get Verification Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Enter 4-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpCode(''); }}
                        className="text-[11px] text-orange-600 font-bold hover:underline"
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
                      className="w-full text-center text-2xl font-mono tracking-widest font-black py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Name <span className="text-slate-400 font-normal">(Optional for new users)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Malhotra"
                      value={otpName}
                      onChange={(e) => setOtpName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 rounded-2xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? 'Verifying...' : 'Verify & Enter Super-App'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PASSWORD LOGIN */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="9876543210 or rahul@gmail.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black py-3 rounded-2xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: REGISTRATION */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Rao"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="ananya@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Create Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black py-3 rounded-2xl text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Customer Switcher Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              Or Instant 1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  await loginAsDemoUser('rahul.sharma@gmail.com');
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-left transition-colors"
              >
                <span className="text-xs font-black text-slate-900 block">👤 Rahul Sharma</span>
                <span className="text-[10px] text-slate-400 block truncate">rahul.sharma@gmail.com</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await loginAsDemoUser('priya.iyer@gmail.com');
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-left transition-colors"
              >
                <span className="text-xs font-black text-slate-900 block">👤 Priya Iyer</span>
                <span className="text-[10px] text-slate-400 block truncate">priya.iyer@gmail.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

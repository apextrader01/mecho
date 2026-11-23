'use client';

import React, { useState } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import {
  X,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  Power,
  Sliders,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface VendorProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function VendorProfileDrawer({ isOpen, onClose, onOpenLogin }: VendorProfileDrawerProps) {
  const {
    vendor,
    logout,
    updateSettings,
    toggleOnline,
    toggleEmergency247,
    loginAsVendor,
    t
  } = useVendorAuth();

  const [businessName, setBusinessName] = useState(vendor?.businessName || '');
  const [address, setAddress] = useState(vendor?.address || '');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(vendor?.serviceRadiusKm || 15);
  const [dayRunnerFee, setDayRunnerFee] = useState(vendor?.dayRunnerFee || 150);
  const [nightRunnerFee, setNightRunnerFee] = useState(vendor?.nightRunnerFee || 250);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const res = await updateSettings({
      businessName,
      address,
      serviceRadiusKm,
      dayRunnerFee,
      nightRunnerFee
    });

    setSaving(false);
    if (res.success) {
      setStatusMsg('Vendor settings updated successfully!');
    } else {
      setStatusMsg(res.error || 'Failed to update settings');
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-white">
          {/* Header */}
          <div className="bg-slate-950 px-6 py-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center font-black text-sm text-white">
                SE
              </span>
              <div>
                <h3 className="font-extrabold text-base tracking-tight">Partner Console Account</h3>
                <p className="text-[11px] text-slate-400">KYC & Local Dispatch Configuration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Vendor Profile Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-5 border border-slate-700 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    {vendor?.businessName?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-white tracking-tight flex items-center gap-1.5">
                      <span>{vendor?.businessName || 'Loading Partner...'}</span>
                    </h4>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                      <User className="w-3 h-3 text-orange-400" />
                      <span>{vendor?.user?.name || 'Authorized Partner'}</span>
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{vendor?.user?.phone || 'No phone'}</span>
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  vendor?.kycStatus === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {vendor?.kycStatus === 'APPROVED' ? '✓ KYC APPROVED' : 'PENDING KYC'}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Categories: <strong className="text-white">{vendor?.categories}</strong></span>
                <span>{vendor?.city}</span>
              </div>
            </div>

            {/* Quick Availability Controls */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toggleOnline(!vendor?.isOnline)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  vendor?.isOnline
                    ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Power className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-black tracking-wider">
                    {vendor?.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <span className="text-xs font-bold mt-2">
                  {vendor?.isOnline ? 'Accepting Dispatches' : 'Offline (Paused)'}
                </span>
              </button>

              <button
                onClick={() => toggleEmergency247(!vendor?.is24x7Emergency)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  vendor?.is24x7Emergency
                    ? 'bg-red-950/40 border-red-600/50 text-red-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-black tracking-wider">
                    {vendor?.is24x7Emergency ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <span className="text-xs font-bold mt-2">
                  24/7 Emergency SOS
                </span>
              </button>
            </div>

            {/* Status Feedback */}
            {statusMsg && (
              <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* Business Settings Form */}
            <form onSubmit={handleSaveSettings} className="bg-slate-800/60 rounded-3xl p-5 border border-slate-700 space-y-3">
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">
                Service Radius & Pricing Configuration
              </h5>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Shop Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Coverage (km)</label>
                  <input
                    type="number"
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Day Fee (₹)</label>
                  <input
                    type="number"
                    value={dayRunnerFee}
                    onChange={(e) => setDayRunnerFee(parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Night Fee (₹)</label>
                  <input
                    type="number"
                    value={nightRunnerFee}
                    onChange={(e) => setNightRunnerFee(parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Updating Settings...' : 'Save Configuration'}</span>
              </button>
            </form>

            {/* Switch Partner View */}
            <div>
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Switch Partner Persona
              </h5>
              <div className="space-y-2">
                {[
                  {
                    email: 'sharma.rescue@gmail.com',
                    title: '⛽ Sharma 24/7 Roadside & Fuel',
                    sub: 'Emergency Fuel & Roadside Breakdown Runner'
                  },
                  {
                    email: 'apollo.pharmacy@gmail.com',
                    title: '💊 Apollo 24/7 Night Chemist',
                    sub: 'Emergency Prescription & Medicine Delivery'
                  },
                  {
                    email: 'speed.genie@gmail.com',
                    title: '📦 SpeedGenie City Courier',
                    sub: 'Point-to-Point Pickup & Drop Delivery'
                  },
                  {
                    email: 'bangalore.trucks@gmail.com',
                    title: '🚚 Bengaluru Trucks & Goods Auto',
                    sub: 'Tata Ace & Ape Goods Transport Fleet'
                  },
                  {
                    email: 'elite.drivers@gmail.com',
                    title: '🚗 Karnataka Acting Drivers',
                    sub: 'Hourly / Night / Outstation Car Drivers'
                  },
                  {
                    email: 'verma.painters@gmail.com',
                    title: '🎨 Verma Colorcraft & Painters',
                    sub: 'Painting, Carpentry & Bodywork RFQ Bids'
                  },
                  {
                    email: 'patel.kirana@gmail.com',
                    title: '🥛 Patel Kirana & Water Agency',
                    sub: 'Kirana Grocery & Daily Subscriptions'
                  }
                ].map((p) => (
                  <button
                    key={p.email}
                    onClick={async () => {
                      await loginAsVendor(p.email);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${
                      vendor?.user?.email === p.email
                        ? 'bg-orange-600/20 border-orange-500 font-bold text-orange-300'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-black block text-white">{p.title}</span>
                      <span className="text-[10px] text-slate-400">{p.sub}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400">KYC Verified</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs shadow-sm transition-colors text-center"
            >
              Sign In with Another Account
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-2xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { VENDOR_SUPPORTED_LANGUAGES, Language } from '../lib/i18n';
import {
  Power,
  Globe,
  ShieldCheck,
  MapPin,
  ChevronDown,
  Building,
  UserPlus,
  KeyRound,
  BellRing
} from 'lucide-react';

interface VendorHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal?: () => void;
  onOpenProfileDrawer?: () => void;
}

export default function VendorHeader({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenProfileDrawer
}: VendorHeaderProps) {
  const { vendor, lang, setLang, toggleOnline, toggleEmergency247, loginAsVendor } = useVendorAuth();
  const [partnerMenuOpen, setPartnerMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLang = VENDOR_SUPPORTED_LANGUAGES.find(l => l.code === lang) || VENDOR_SUPPORTED_LANGUAGES[0];

  const demoPartners = [
    { email: 'sharma.rescue@gmail.com', label: '⛽ Sharma 24/7 Roadside & Fuel' },
    { email: 'apollo.pharmacy@gmail.com', label: '💊 Apollo 24/7 Night Chemist' },
    { email: 'speed.genie@gmail.com', label: '📦 SpeedGenie City Courier' },
    { email: 'bangalore.trucks@gmail.com', label: '🚚 Bengaluru Trucks (Tata Ace)' },
    { email: 'elite.drivers@gmail.com', label: '🚗 Karnataka Acting Drivers' },
    { email: 'verma.painters@gmail.com', label: '🎨 Verma Contractors & RFQs' },
    { email: 'patel.kirana@gmail.com', label: '🥛 Patel Kirana & Subscriptions' }
  ];

  return (
    <header className="sticky top-0 md:top-8 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Utility Bar (Partner Switcher & Fast Actions) */}
      <div className="bg-slate-950/90 px-4 sm:px-6 py-2 flex flex-wrap justify-between items-center text-xs border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400 hidden sm:inline">Active Partner:</span>

          {/* Partner Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPartnerMenuOpen(!partnerMenuOpen)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg border border-slate-700 text-xs font-bold text-white transition-all"
            >
              <span className="text-orange-400">⚡</span>
              <span className="truncate max-w-[200px] sm:max-w-xs">{vendor?.businessName || 'Select Partner Profile'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {partnerMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Switch Verified Partner Profile
                </div>
                {demoPartners.map((p) => (
                  <button
                    key={p.email}
                    onClick={() => {
                      loginAsVendor(p.email);
                      setPartnerMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      vendor?.user?.email === p.email ? 'text-orange-400 font-bold bg-slate-800/60' : 'text-slate-200'
                    }`}
                  >
                    <span>{p.label}</span>
                    {vendor?.user?.email === p.email && <span className="text-[10px] text-emerald-400 font-mono">Active</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fast Actions: Register Partner & Language */}
        <div className="flex items-center gap-2">
          {/* Prominent Partner Sign Up Button */}
          <button
            onClick={onOpenAuthModal}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-3 py-1 rounded-lg font-black text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 ring-1 ring-orange-400/30"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Join as Partner (Choose Services)</span>
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-bold transition-colors text-slate-300"
            >
              <Globe className="w-3 h-3 text-orange-400" />
              <span>{currentLang.label}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
                {VENDOR_SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 ${
                      lang === l.code ? 'text-orange-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>{l.nativeLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Partner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Partner Info */}
        <div
          onClick={onOpenProfileDrawer}
          className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform text-white">
            {vendor?.businessName?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-1.5 text-white">
                <span>{vendor?.businessName || 'Loading Partner Portal...'}</span>
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </h1>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                vendor?.kycStatus === 'APPROVED'
                  ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                  : 'bg-amber-900/60 text-amber-300 border-amber-700 animate-pulse'
              }`}>
                KYC {vendor?.kycStatus || 'APPROVED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
              <span className="truncate max-w-[280px]">{vendor?.address}</span>
              <span>• Radius: {vendor?.serviceRadiusKm} km</span>
            </p>
          </div>
        </div>

        {/* 24/7 Availability Toggles & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Settings Trigger */}
          <button
            onClick={onOpenProfileDrawer}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Building className="w-3.5 h-3.5 text-orange-400" />
            <span>Settings</span>
          </button>

          {/* Online Toggle */}
          <button
            onClick={() => toggleOnline(!vendor?.isOnline)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all active:scale-95 ${
              vendor?.isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{vendor?.isOnline ? 'Online (Active)' : 'Offline'}</span>
          </button>

          {/* 24/7 Night SOS Toggle */}
          <button
            onClick={() => toggleEmergency247(!vendor?.is24x7Emergency)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all active:scale-95 flex items-center gap-1.5 ${
              vendor?.is24x7Emergency
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-md shadow-rose-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>24/7 SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
}

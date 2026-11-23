'use client';

import React, { useState } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { VENDOR_SUPPORTED_LANGUAGES, Language } from '../lib/i18n';
import { Power, Globe, ShieldCheck, MapPin, ShieldAlert, ChevronDown, User, KeyRound, Building } from 'lucide-react';

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
  const { vendor, lang, setLang, t, toggleOnline, toggleEmergency247, loginAsVendor } = useVendorAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLang = VENDOR_SUPPORTED_LANGUAGES.find(l => l.code === lang) || VENDOR_SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg">
      {/* Top Banner: Partner Switcher & Multi-Language Selector */}
      <div className="bg-slate-950 px-4 py-1.5 flex flex-wrap justify-between items-center text-xs text-slate-400 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
          <span className="shrink-0 font-semibold">Switch Partner View:</span>
          {[
            { email: 'sharma.rescue@gmail.com', label: '⛽ Sharma (Roadside & Fuel)' },
            { email: 'apollo.pharmacy@gmail.com', label: '💊 Apollo (Pharmacy Runner)' },
            { email: 'speed.genie@gmail.com', label: '📦 SpeedGenie (Pickup & Drop)' },
            { email: 'bangalore.trucks@gmail.com', label: '🚚 Bengaluru Trucks (Tata Ace)' },
            { email: 'elite.drivers@gmail.com', label: '🚗 Karnataka Drivers (Acting Drivers)' },
            { email: 'verma.painters@gmail.com', label: '🎨 Verma (Contractor & RFQs)' },
            { email: 'patel.kirana@gmail.com', label: '🥛 Patel (Kirana & Subscriptions)' }
          ].map((p, idx) => (
            <React.Fragment key={p.email}>
              {idx > 0 && <span>•</span>}
              <button
                onClick={() => loginAsVendor(p.email)}
                className={`px-2 py-0.5 rounded font-bold whitespace-nowrap transition-colors ${
                  vendor?.user?.email === p.email ? 'bg-orange-600 text-white shadow-sm' : 'hover:text-white text-slate-300'
                }`}
              >
                {p.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Top 7+ Indian Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-bold transition-colors text-white"
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span>{currentLang.nativeLabel}</span>
            <span className="text-slate-400 font-normal">({currentLang.label})</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Select Language
              </div>
              {VENDOR_SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    lang === l.code ? 'text-orange-400 font-bold bg-slate-800/60' : 'text-slate-200'
                  }`}
                >
                  <span>{l.nativeLabel}</span>
                  <span className="text-[10px] text-slate-400">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Partner Info (Clickable to open profile drawer) */}
        <div
          onClick={onOpenProfileDrawer}
          className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            {vendor?.businessName?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                <span>{vendor?.businessName || 'Loading Partner Portal...'}</span>
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                KYC {vendor?.kycStatus || 'APPROVED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-sky-400" />
              <span className="truncate max-w-[280px]">{vendor?.address}</span>
              <span>• Radius: {vendor?.serviceRadiusKm} km</span>
            </p>
          </div>
        </div>

        {/* 24/7 Availability Toggles & Account Button */}
        <div className="flex items-center gap-2">
          {/* Account Profile Trigger */}
          {vendor ? (
            <button
              onClick={onOpenProfileDrawer}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Partner Business Settings"
            >
              <Building className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Partner Login</span>
            </button>
          )}

          {/* Online Toggle */}
          <button
            onClick={() => toggleOnline(!vendor?.isOnline)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all active:scale-95 ${
              vendor?.isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Power className={`w-4 h-4 ${vendor?.isOnline ? 'animate-pulse' : ''}`} />
            <span>{vendor?.isOnline ? t.onlineStatus : t.offlineStatus}</span>
          </button>

          {/* 24/7 Emergency Assist Badge Toggle */}
          <button
            onClick={() => toggleEmergency247(!vendor?.is24x7Emergency)}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
              vendor?.is24x7Emergency
                ? 'bg-red-600/90 text-white border-red-500'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-300" />
            <span className="hidden sm:inline">24/7 SOS</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 text-xs font-extrabold">
        {[
          { id: 'dispatches', label: t.activeDispatches, icon: '🚨' },
          { id: 'quotes', label: t.quoteRequests, icon: '📋' },
          { id: 'subscriptions', label: t.subscriptions, icon: '🥛' },
          { id: 'earnings', label: t.earnings, icon: '💰' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-400 bg-slate-800/50 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}

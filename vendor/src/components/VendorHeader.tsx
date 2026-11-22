'use client';

import React from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { Power, Globe, ShieldCheck, MapPin, Phone, ShieldAlert } from 'lucide-react';

interface VendorHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function VendorHeader({ activeTab, setActiveTab }: VendorHeaderProps) {
  const { vendor, lang, setLang, t, toggleOnline, toggleEmergency247, loginAsVendor } = useVendorAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg">
      {/* Top Banner: Quick Partner Persona Switcher & Language Switcher */}
      <div className="bg-slate-950 px-4 py-1.5 flex flex-wrap justify-between items-center text-xs text-slate-400 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span>Switch Partner View:</span>
          <button
            onClick={() => loginAsVendor('sharma.rescue@gmail.com')}
            className={`px-2 py-0.5 rounded font-bold transition-colors ${
              vendor?.user?.email === 'sharma.rescue@gmail.com' ? 'bg-orange-600 text-white' : 'hover:text-white'
            }`}
          >
            ⛽ Sharma (Roadside & Fuel)
          </button>
          <span>•</span>
          <button
            onClick={() => loginAsVendor('verma.painters@gmail.com')}
            className={`px-2 py-0.5 rounded font-bold transition-colors ${
              vendor?.user?.email === 'verma.painters@gmail.com' ? 'bg-orange-600 text-white' : 'hover:text-white'
            }`}
          >
            🎨 Verma (Paint Contractor)
          </button>
          <span>•</span>
          <button
            onClick={() => loginAsVendor('patel.kirana@gmail.com')}
            className={`px-2 py-0.5 rounded font-bold transition-colors ${
              vendor?.user?.email === 'patel.kirana@gmail.com' ? 'bg-orange-600 text-white' : 'hover:text-white'
            }`}
          >
            🥛 Patel (Kirana & Water)
          </button>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          <Globe className="w-3.5 h-3.5 text-orange-400" />
          <button
            onClick={() => setLang('hi')}
            className={`px-1.5 py-0.5 rounded text-xs font-bold ${
              lang === 'hi' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            हिंदी
          </button>
          <span>|</span>
          <button
            onClick={() => setLang('en')}
            className={`px-1.5 py-0.5 rounded text-xs font-bold ${
              lang === 'en' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Partner Info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center font-black text-xl shadow-md">
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
              <span>• Service Radius: {vendor?.serviceRadiusKm} km</span>
            </p>
          </div>
        </div>

        {/* 24/7 Availability Toggles */}
        <div className="flex items-center gap-3">
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

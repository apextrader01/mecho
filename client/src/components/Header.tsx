'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES, Language } from '../lib/i18n';
import {
  MapPin,
  Globe,
  ShieldAlert,
  ChevronDown,
  User,
  KeyRound,
  ExternalLink,
  PhoneCall,
  Sparkles,
  Smartphone,
  Monitor
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSosModal: (type: 'fuel' | 'puncture') => void;
  onOpenAuthModal?: () => void;
  onOpenProfileDrawer?: () => void;
  isMobilePreview?: boolean;
  onToggleMobilePreview?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  openSosModal,
  onOpenAuthModal,
  onOpenProfileDrawer,
  isMobilePreview,
  onToggleMobilePreview
}: HeaderProps) {
  const { user, lang, setLang, t, userCoords, loginAsDemoUser } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-8 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand & Address Pin */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white text-base shadow-md group-hover:scale-105 transition-transform">
              SE
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-lg tracking-tight">ShortEdge</span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                  Super-App
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium truncate max-w-[200px] sm:max-w-xs">
                <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                <span className="truncate">{userCoords?.address || '100ft Road, Indiranagar, Bangalore'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Nav Segments (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-bold border border-slate-200">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'explore' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ 24/7 Rapid SOS
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'quotes' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📝 Compare Quotes (RFQ)
          </button>
          <button
            onClick={() => setActiveTab('commerce')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'commerce' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛒 Kirana & Daily Subs
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'orders' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 My Active Bookings
          </button>
        </div>

        {/* Right: Partner Sign-up, Language & User Profile */}
        <div className="flex items-center gap-2">
          {/* Mobile App Mode Toggle (for Desktop Testing) */}
          {onToggleMobilePreview && (
            <button
              onClick={onToggleMobilePreview}
              title={isMobilePreview ? "Switch to Full Desktop View" : "Switch to Mobile Phone App View"}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isMobilePreview
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm ring-1 ring-purple-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {isMobilePreview ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5 text-purple-600" />}
              <span>{isMobilePreview ? 'Full Web' : '📱 Mobile App'}</span>
            </button>
          )}

          {/* Partner Onboarding Link */}
          <a
            href="/vendor"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold transition-all"
          >
            <span>🛵 Become a Partner</span>
          </a>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-orange-500" />
              <span className="hidden sm:inline">{currentLang.label}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-50">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      lang === l.code ? 'text-orange-600 font-bold bg-orange-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.nativeLabel}</span>
                    <span className="text-[10px] text-slate-400">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account Button */}
          {user ? (
            <button
              onClick={onOpenProfileDrawer}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">
                {user.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline truncate max-w-[80px]">{user.name?.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Emergency SOS Trigger Button */}
          <button
            onClick={() => openSosModal('fuel')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black shadow-md shadow-red-600/20 flex items-center gap-1.5 active:scale-95 transition-all animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
}

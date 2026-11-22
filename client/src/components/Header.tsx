'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES, Language } from '../lib/i18n';
import { MapPin, Globe, ShieldAlert, ShoppingBag, FileText, UserCheck, ChevronDown, User, KeyRound } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSosModal: (type: 'fuel' | 'puncture') => void;
  onOpenAuthModal?: () => void;
  onOpenProfileDrawer?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  openSosModal,
  onOpenAuthModal,
  onOpenProfileDrawer
}: HeaderProps) {
  const { user, lang, setLang, t, userCoords, loginAsDemoUser } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Banner: Regional 7+ Language Selector & City Indicator */}
      <div className="bg-slate-900 text-white text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">
            24/7 Hyperlocal Network: <strong className="text-white">Bangalore Hub</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Top Multi-Language Selector Dropdown (Top 7+ Indian Languages) */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-bold transition-colors"
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
                {SUPPORTED_LANGUAGES.map((l) => (
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

          {/* Quick Demo Switcher */}
          <span className="text-slate-400 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
            <span>Customer:</span>
            <button
              onClick={() => loginAsDemoUser('rahul.sharma@gmail.com')}
              className={`hover:underline ${user?.email === 'rahul.sharma@gmail.com' ? 'text-orange-400 font-bold' : ''}`}
            >
              Rahul
            </button>
            <span>/</span>
            <button
              onClick={() => loginAsDemoUser('priya.iyer@gmail.com')}
              className={`hover:underline ${user?.email === 'priya.iyer@gmail.com' ? 'text-orange-400 font-bold' : ''}`}
            >
              Priya
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 font-black text-xl tracking-tighter">
            SE
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
              {t.appName}
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                Super-App
              </span>
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-orange-500" />
              <span className="truncate max-w-[200px] sm:max-w-[320px]">{userCoords.address}</span>
            </p>
          </div>
        </div>

        {/* Desktop Quick Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'explore'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.allServices}
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'quotes'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            {t.getQuotes}
          </button>
          <button
            onClick={() => setActiveTab('commerce')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'commerce'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
            {t.commerceSubs}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-orange-500" />
            {t.activeBookings}
          </button>
        </nav>

        {/* Right Actions: Account Profile + SOS Button */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={onOpenProfileDrawer}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-sm"
              title="Open My Customer Profile"
            >
              <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black">
                {user.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline font-black">{user.name?.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-orange-200 shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          <button
            onClick={() => openSosModal('fuel')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
}

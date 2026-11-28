'use client';

import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Activity, Users, ShoppingBag, FileText, Settings, RefreshCw } from 'lucide-react';

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminHeader({ activeTab, setActiveTab }: AdminHeaderProps) {
  const { adminUser, stats, refreshStats } = useAdminAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-black text-base sm:text-lg shadow-md shadow-violet-500/20">
              SE
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm sm:text-lg tracking-tight">
                  ShortEdge Command
                </h1>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-violet-900/60 text-violet-300 border border-violet-700">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Hyperlocal Operations & City Dispatch Control
              </p>
            </div>
          </div>

          {/* Mobile Refresh Button */}
          <button
            onClick={refreshStats}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Counters */}
        <div className="flex items-center justify-between sm:justify-start gap-2 text-xs overflow-x-auto scrollbar-none">
          <div className="bg-slate-900 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-800 flex-1 sm:flex-initial text-center sm:text-left">
            <span className="text-slate-400 block text-[9px] sm:text-[10px]">Active SOS</span>
            <span className="font-black text-emerald-400 text-xs sm:text-sm">{stats?.activeDispatches || 0} Live</span>
          </div>

          <div className="bg-slate-900 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-800 flex-1 sm:flex-initial text-center sm:text-left">
            <span className="text-slate-400 block text-[9px] sm:text-[10px]">Open RFQs</span>
            <span className="font-black text-blue-400 text-xs sm:text-sm">{stats?.openRfqs || 0} Open</span>
          </div>

          <div className="bg-slate-900 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-800 flex-1 sm:flex-initial text-center sm:text-left">
            <span className="text-slate-400 block text-[9px] sm:text-[10px]">KYC Queue</span>
            <span className="font-black text-amber-400 text-xs sm:text-sm">{stats?.pendingKyc || 0} Pending</span>
          </div>

          <button
            onClick={refreshStats}
            className="hidden md:block p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Stats"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Tabs Header (Hidden on Mobile, handled by Bottom Nav) */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 items-center gap-2 overflow-x-auto text-xs font-extrabold pb-0">
        {[
          { id: 'kyc', label: 'Vendor KYC Approvals', icon: '🛡️' },
          { id: 'dispatches', label: 'Live Operations & Map', icon: '🗺️' },
          { id: 'customers', label: 'Customer Database', icon: '👥' },
          { id: 'vendors', label: 'Vendor Roster & Fleet', icon: '🏪' },
          { id: 'categories', label: 'Dynamic Category & Fees Manager', icon: '⚙️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-4 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-violet-500 text-violet-400 bg-slate-900/60 rounded-t-lg'
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

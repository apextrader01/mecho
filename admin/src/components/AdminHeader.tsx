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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-black text-lg shadow-md shadow-violet-500/20">
            SE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                <span>ShortEdge Central Command</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-violet-900/60 text-violet-300 border border-violet-700">
                  Super Admin
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Hyperlocal City Operations & Dynamic Pricing Control
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Active SOS</span>
            <span className="font-black text-emerald-400">{stats?.activeDispatches || 0} Live</span>
          </div>

          <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Open RFQs</span>
            <span className="font-black text-blue-400">{stats?.openRfqs || 0} Open</span>
          </div>

          <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">KYC Queue</span>
            <span className="font-black text-amber-400">{stats?.pendingKyc || 0} Pending</span>
          </div>

          <button
            onClick={refreshStats}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto text-xs font-extrabold pb-2 sm:pb-0">
        {[
          { id: 'kyc', label: 'Vendor KYC Approvals', icon: '🛡️' },
          { id: 'dispatches', label: 'Live Operations & Map', icon: '🗺️' },
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

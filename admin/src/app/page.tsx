'use client';

import React, { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import KycVerificationTab from '../components/KycVerificationTab';
import LiveDispatchesTab from '../components/LiveDispatchesTab';
import CategoryManagerTab from '../components/CategoryManagerTab';
import CustomerDirectoryTab from '../components/CustomerDirectoryTab';
import VendorRosterTab from '../components/VendorRosterTab';

export default function AdminHomePage() {
  const [activeTab, setActiveTab] = useState<string>('kyc');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 md:pb-8">
        {activeTab === 'kyc' && <KycVerificationTab />}
        {activeTab === 'dispatches' && <LiveDispatchesTab />}
        {activeTab === 'customers' && <CustomerDirectoryTab />}
        {activeTab === 'vendors' && <VendorRosterTab />}
        {activeTab === 'categories' && <CategoryManagerTab />}
      </main>

      {/* Real Mobile App Admin Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1 shadow-2xl flex items-center justify-around safe-bottom">
        <button
          onClick={() => setActiveTab('kyc')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'kyc' ? 'text-violet-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <span className="text-lg">🛡️</span>
          <span className="text-[10px]">KYC</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatches')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'dispatches' ? 'text-violet-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <span className="text-lg">🗺️</span>
          <span className="text-[10px]">Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'customers' ? 'text-violet-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <span className="text-lg">👥</span>
          <span className="text-[10px]">Users</span>
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'vendors' ? 'text-violet-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <span className="text-lg">🏪</span>
          <span className="text-[10px]">Fleet</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'categories' ? 'text-violet-400 font-black scale-105' : 'text-slate-400 font-medium'
          }`}
        >
          <span className="text-lg">⚙️</span>
          <span className="text-[10px]">Fees</span>
        </button>
      </nav>
    </div>
  );
}

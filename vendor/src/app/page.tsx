'use client';

import React, { useState } from 'react';
import VendorHeader from '../components/VendorHeader';
import SosDispatchesFeed from '../components/SosDispatchesFeed';
import QuoteRequestsFeed from '../components/QuoteRequestsFeed';
import SubscriptionManager from '../components/SubscriptionManager';
import EarningsSummary from '../components/EarningsSummary';
import VendorChatModal from '../components/VendorChatModal';
import VendorAuthModal from '../components/VendorAuthModal';
import VendorProfileDrawer from '../components/VendorProfileDrawer';
import VendorInstallAppBanner from '../components/VendorInstallAppBanner';

export default function VendorHomePage() {
  const [activeTab, setActiveTab] = useState<string>('dispatches');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<any>(null);

  // Vendor Account Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const handleOpenChat = (context: any) => {
    setChatContext(context);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <VendorHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenProfileDrawer={() => setProfileDrawerOpen(true)}
      />

      {/* PWA Partner Mobile App Install & Siren Alerts Banner */}
      <VendorInstallAppBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-8">
        {activeTab === 'dispatches' && (
          <SosDispatchesFeed onOpenChat={handleOpenChat} />
        )}

        {activeTab === 'quotes' && (
          <QuoteRequestsFeed onOpenChat={handleOpenChat} />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionManager />
        )}

        {activeTab === 'earnings' && (
          <EarningsSummary />
        )}
      </main>

      {/* Real Mobile App Partner Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1 shadow-2xl flex items-center justify-around safe-bottom">
        <button
          onClick={() => setActiveTab('dispatches')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'dispatches' ? 'text-red-400 font-extrabold scale-105' : 'text-slate-400 font-medium hover:text-slate-200'
          }`}
        >
          <span className="text-xl">🚨</span>
          <span className="text-[10px] tracking-tight">SOS Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'quotes' ? 'text-sky-400 font-extrabold scale-105' : 'text-slate-400 font-medium hover:text-slate-200'
          }`}
        >
          <span className="text-xl">📋</span>
          <span className="text-[10px] tracking-tight">RFQs</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'subscriptions' ? 'text-emerald-400 font-extrabold scale-105' : 'text-slate-400 font-medium hover:text-slate-200'
          }`}
        >
          <span className="text-xl">🥛</span>
          <span className="text-[10px] tracking-tight">Daily</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'earnings' ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-400 font-medium hover:text-slate-200'
          }`}
        >
          <span className="text-xl">💰</span>
          <span className="text-[10px] tracking-tight">Earnings</span>
        </button>

        <button
          onClick={() => setProfileDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all text-slate-400 font-medium hover:text-slate-200"
        >
          <span className="text-xl">⚙️</span>
          <span className="text-[10px] tracking-tight">Shop</span>
        </button>
      </nav>

      {/* Partner Onboarding / Login Modal */}
      <VendorAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Partner Business Settings Drawer */}
      <VendorProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        onOpenLogin={() => setAuthModalOpen(true)}
      />

      {/* In-App Negotiation Chat */}
      <VendorChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        context={chatContext}
      />
    </div>
  );
}

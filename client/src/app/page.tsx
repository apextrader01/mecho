'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import SosSection from '../components/SosSection';
import CategoryGrid from '../components/CategoryGrid';
import QuotesHub from '../components/QuotesHub';
import CommerceSection from '../components/CommerceSection';
import OrdersTracker from '../components/OrdersTracker';
import ChatModal from '../components/ChatModal';
import AuthModal from '../components/AuthModal';
import ProfileDrawer from '../components/ProfileDrawer';
import InstallAppBanner from '../components/InstallAppBanner';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [sosModal, setSosModal] = useState<'fuel' | 'puncture' | null>(null);

  // Customer Account & Profile Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // In-App Chat Modal Context
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<any>(null);

  const handleOpenChat = (context: any) => {
    setChatContext(context);
    setChatOpen(true);
  };

  const handleDispatchCreated = (dispatch: any) => {
    // Switch to orders tracker view so customer immediately sees their start OTP and matching status!
    setActiveTab('orders');
  };

  const handleSelectCategory = (category: any) => {
    if (category.engineType === 'ENGINE_B_QUOTE') {
      setActiveTab('quotes');
    } else if (category.engineType.startsWith('ENGINE_C')) {
      setActiveTab('commerce');
    } else {
      setSosModal('puncture');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSosModal={(type) => setSosModal(type)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenProfileDrawer={() => setProfileDrawerOpen(true)}
      />

      {/* PWA Mobile App Install & Push Notification Banner */}
      <InstallAppBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-8">
        {/* Top Sticky Quick SOS Section always accessible */}
        <SosSection
          onDispatchCreated={handleDispatchCreated}
          sosModal={sosModal}
          setSosModal={setSosModal}
        />

        {/* Dynamic View Switcher */}
        {activeTab === 'explore' && (
          <>
            <CategoryGrid
              onSelectCategory={handleSelectCategory}
              openSosModal={(type) => setSosModal(type)}
            />
            <QuotesHub onOpenChat={handleOpenChat} />
            <CommerceSection />
          </>
        )}

        {activeTab === 'quotes' && (
          <QuotesHub onOpenChat={handleOpenChat} />
        )}

        {activeTab === 'commerce' && (
          <CommerceSection />
        )}

        {activeTab === 'orders' && (
          <OrdersTracker onOpenChat={handleOpenChat} />
        )}
      </main>

      {/* Real Mobile App Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1 shadow-2xl flex items-center justify-around safe-bottom">
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'explore' ? 'text-orange-600 font-extrabold scale-105' : 'text-slate-500 font-medium hover:text-slate-700'
          }`}
        >
          <span className="text-xl">⚡</span>
          <span className="text-[10px] tracking-tight">Services</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'quotes' ? 'text-orange-600 font-extrabold scale-105' : 'text-slate-500 font-medium hover:text-slate-700'
          }`}
        >
          <span className="text-xl">📋</span>
          <span className="text-[10px] tracking-tight">Quotes</span>
        </button>

        {/* Raised Center SOS Button (App Core Feature) */}
        <button
          onClick={() => setSosModal('fuel')}
          className="-mt-5 flex flex-col items-center justify-center transition-all group"
          title="Instant 24/7 Highway Fuel & Roadside SOS"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40 ring-4 ring-white group-active:scale-95 transition-transform animate-pulse">
            <span className="text-2xl">🚨</span>
          </div>
          <span className="text-[10px] font-black text-red-600 mt-1 uppercase tracking-wider">
            SOS 24/7
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
            activeTab === 'orders' ? 'text-orange-600 font-extrabold scale-105' : 'text-slate-500 font-medium hover:text-slate-700'
          }`}
        >
          <span className="text-xl">📦</span>
          <span className="text-[10px] tracking-tight">Bookings</span>
        </button>

        <button
          onClick={() => setProfileDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all text-slate-500 font-medium hover:text-slate-700"
        >
          <span className="text-xl">👤</span>
          <span className="text-[10px] tracking-tight">Account</span>
        </button>
      </nav>

      {/* Customer Authentication & Login Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Customer Account & Profile Drawer */}
      <ProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        onOpenLogin={() => setAuthModalOpen(true)}
      />

      {/* In-App Chat & Negotiation Drawer */}
      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        context={chatContext}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import SosSection from '../components/SosSection';
import CategoryGrid from '../components/CategoryGrid';
import QuotesHub from '../components/QuotesHub';
import CommerceSection from '../components/CommerceSection';
import OrdersTracker from '../components/OrdersTracker';
import ChatModal from '../components/ChatModal';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [sosModal, setSosModal] = useState<'fuel' | 'puncture' | null>(null);

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
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
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

      {/* Floating Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
        {[
          { id: 'explore', label: 'Services', icon: '⚡' },
          { id: 'quotes', label: 'Quotes', icon: '📋' },
          { id: 'commerce', label: 'Kirana', icon: '🛒' },
          { id: 'orders', label: 'Bookings', icon: '📦' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[11px] font-bold ${
              activeTab === tab.id ? 'text-orange-600' : 'text-slate-400'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* In-App Chat & Negotiation Drawer */}
      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        context={chatContext}
      />
    </div>
  );
}

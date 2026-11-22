'use client';

import React, { useState } from 'react';
import VendorHeader from '../components/VendorHeader';
import SosDispatchesFeed from '../components/SosDispatchesFeed';
import QuoteRequestsFeed from '../components/QuoteRequestsFeed';
import SubscriptionManager from '../components/SubscriptionManager';
import EarningsSummary from '../components/EarningsSummary';
import VendorChatModal from '../components/VendorChatModal';

export default function VendorHomePage() {
  const [activeTab, setActiveTab] = useState<string>('dispatches');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<any>(null);

  const handleOpenChat = (context: any) => {
    setChatContext(context);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <VendorHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
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

      <VendorChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        context={chatContext}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import SosSection, { SosModalType } from '../components/SosSection';
import CategoryGrid from '../components/CategoryGrid';
import QuotesHub from '../components/QuotesHub';
import CommerceSection from '../components/CommerceSection';
import OrdersTracker from '../components/OrdersTracker';
import ChatModal from '../components/ChatModal';
import AuthModal from '../components/AuthModal';
import ProfileDrawer from '../components/ProfileDrawer';
import InstallAppBanner from '../components/InstallAppBanner';
import {
  FileText,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  PhoneCall,
  MapPin,
  TrendingUp
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [sosModal, setSosModal] = useState<SosModalType>(null);

  // Engine B (RFQ) Preselected State
  const [rfqPreselectedCategory, setRfqPreselectedCategory] = useState<string | null>(null);
  const [rfqPreselectedTitle, setRfqPreselectedTitle] = useState<string | null>(null);

  // Engine C (Commerce) Sub-Tab State
  const [commerceInitialSubTab, setCommerceInitialSubTab] = useState<'catalog' | 'subscriptions'>('subscriptions');
  const [triggerSubModal, setTriggerSubModal] = useState<boolean>(false);

  // Customer Account & Profile Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // Desktop Mobile Simulator View Toggle
  const [isMobilePreview, setIsMobilePreview] = useState(false);

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
    if (category.slug === 'emergency-fuel') {
      setSosModal('fuel');
    } else if (category.slug === 'roadside-puncture') {
      setSosModal('puncture');
    } else if (category.slug === 'emergency-pharmacy') {
      setSosModal('pharmacy');
    } else if (category.slug === 'local-genie' || category.slug === 'genie-pickup-drop') {
      setSosModal('genie');
    } else if (category.slug === 'goods-auto-booking') {
      setSosModal('truck');
    } else if (category.slug === 'acting-drivers') {
      setSosModal('driver');
    } else if (category.slug === 'electrician-services') {
      setSosModal('electrician');
    } else if (category.slug === 'plumbing-services') {
      setSosModal('plumber');
    } else if (category.engineType === 'ENGINE_B_QUOTE') {
      setRfqPreselectedCategory(category.slug);
      setRfqPreselectedTitle(`${category.name} - Request for Quotations`);
      setActiveTab('quotes');
    } else if (category.slug === 'kirana-grocery') {
      setCommerceInitialSubTab('catalog');
      setTriggerSubModal(false);
      setActiveTab('commerce');
    } else if (category.slug === 'daily-subscriptions') {
      setCommerceInitialSubTab('subscriptions');
      setTriggerSubModal(true);
      setActiveTab('commerce');
    } else if (category.engineType?.startsWith('ENGINE_C')) {
      setActiveTab('commerce');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col selection:bg-orange-500 selection:text-white ${isMobilePreview ? 'bg-slate-200 py-4' : 'bg-slate-50/60'}`}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSosModal={(type) => setSosModal(type as any)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenProfileDrawer={() => setProfileDrawerOpen(true)}
        isMobilePreview={isMobilePreview}
        onToggleMobilePreview={() => setIsMobilePreview(!isMobilePreview)}
      />

      {/* PWA Mobile App Install Banner (compact) */}
      <InstallAppBanner />

      <div className={isMobilePreview ? "max-w-[420px] w-full mx-auto my-4 bg-slate-50 border-[10px] border-slate-900 rounded-[50px] shadow-2xl overflow-hidden relative ring-4 ring-slate-800/20" : "flex-1 w-full"}>
        {/* Mobile Mock Notch Header */}
        {isMobilePreview && (
          <div className="bg-slate-950 text-white px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold">
            <span>9:41</span>
            <div className="w-20 h-4 bg-black rounded-full mx-auto flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-800"></span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <span>100% 🔋</span>
            </div>
          </div>
        )}

        <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-5 pb-28 md:pb-8 space-y-6 ${isMobilePreview ? "max-w-md" : "max-w-7xl"}`}>
        {/* Dynamic View Switcher */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            {/* Top Quick SOS Emergency Cards */}
            <SosSection
              onDispatchCreated={handleDispatchCreated}
              sosModal={sosModal}
              setSosModal={setSosModal}
            />

            {/* All Local Services Category Grid */}
            <CategoryGrid
              onSelectCategory={handleSelectCategory}
              openSosModal={(type) => setSosModal(type)}
            />

            {/* Clean, Non-Intrusive Engine Highlights (Urban Company style cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Quotes Teaser Card */}
              <div
                onClick={() => setActiveTab('quotes')}
                className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-5 text-white border border-indigo-800/50 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      Multi-Vendor Bidding
                    </span>
                    <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                  </div>
                  <h3 className="font-black text-lg sm:text-xl tracking-tight">
                    Get Free Contractor Quotes
                  </h3>
                  <p className="text-xs text-indigo-200/80 mt-1 line-clamp-2">
                    Compare side-by-side bids for House Painting, Custom Carpentry, Modular Kitchens & Car Denting from verified local body shops.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-800/60 flex items-center justify-between text-xs font-bold text-indigo-300 group-hover:text-white transition-colors">
                  <span>Post RFQ & Receive 3+ Quotes</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Daily Commerce Teaser Card */}
              <div
                onClick={() => setActiveTab('commerce')}
                className="bg-gradient-to-br from-emerald-950 to-slate-900 rounded-3xl p-5 text-white border border-emerald-800/50 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Doorstep Subscriptions
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
                  </div>
                  <h3 className="font-black text-lg sm:text-xl tracking-tight">
                    Daily 20L Water & Milk Delivery
                  </h3>
                  <p className="text-xs text-emerald-200/80 mt-1 line-clamp-2">
                    Automated 6:00 AM – 8:00 AM doorstep delivery of 20L mineral water cans and farm-fresh milk packets with holiday pause.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center justify-between text-xs font-bold text-emerald-300 group-hover:text-white transition-colors">
                  <span>Explore Daily Plans & Kirana</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Quotes Hub View */}
        {activeTab === 'quotes' && (
          <QuotesHub
            onOpenChat={handleOpenChat}
            targetCategorySlug={rfqPreselectedCategory}
            targetCategoryTitle={rfqPreselectedTitle}
            onClearTargetCategory={() => {
              setRfqPreselectedCategory(null);
              setRfqPreselectedTitle(null);
            }}
          />
        )}

        {/* Dedicated Commerce & Subscriptions View */}
        {activeTab === 'commerce' && (
          <CommerceSection
            initialSubTab={commerceInitialSubTab}
            triggerSubModal={triggerSubModal}
          />
        )}

        {/* Dedicated Orders & Live Tracking View */}
        {activeTab === 'orders' && (
          <OrdersTracker onOpenChat={handleOpenChat} />
        )}
      </main>

      {/* Real Mobile App Bottom Navigation Bar */}
      <nav className={`${isMobilePreview ? 'flex sticky bottom-0' : 'md:hidden fixed'} bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1 shadow-2xl items-center justify-around safe-bottom`}>
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'explore' ? 'text-orange-600 font-black scale-105' : 'text-slate-500 font-medium'
          }`}
        >
          <span className="text-lg">⚡</span>
          <span className="text-[10px]">Services</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'quotes' ? 'text-orange-600 font-black scale-105' : 'text-slate-500 font-medium'
          }`}
        >
          <span className="text-lg">📝</span>
          <span className="text-[10px]">Quotes</span>
        </button>

        {/* Central Rapid SOS Trigger */}
        <button
          onClick={() => setSosModal('fuel')}
          className="w-12 h-12 -mt-4 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-all ring-4 ring-white animate-pulse"
        >
          <span className="text-lg">🚨</span>
        </button>

        <button
          onClick={() => setActiveTab('commerce')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'commerce' ? 'text-orange-600 font-black scale-105' : 'text-slate-500 font-medium'
          }`}
        >
          <span className="text-lg">🛒</span>
          <span className="text-[10px]">Kirana</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'orders' ? 'text-orange-600 font-black scale-105' : 'text-slate-500 font-medium'
          }`}
        >
          <span className="text-lg">📦</span>
          <span className="text-[10px]">Orders</span>
        </button>
      </nav>
      </div>

      {/* Customer Modals */}
      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        context={chatContext}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <ProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        onOpenLogin={() => {
          setProfileDrawerOpen(false);
          setAuthModalOpen(true);
        }}
      />
    </div>
  );
}

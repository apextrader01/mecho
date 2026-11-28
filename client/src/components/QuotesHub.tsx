'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Star,
  Layers,
  Truck,
  ArrowRight,
  Phone,
  Shield,
  Calendar,
  Award,
  AlertCircle,
  Check,
  ExternalLink,
  ChevronRight,
  Coins,
  Lock,
  X,
  Paintbrush,
  Hammer,
  Car,
  Image as ImageIcon
} from 'lucide-react';

interface QuotesHubProps {
  onOpenChat: (context: { rfqId: string; receiverId: string; receiverName: string }) => void;
  targetCategorySlug?: string | null;
  targetCategoryTitle?: string | null;
  onClearTargetCategory?: () => void;
}

export default function QuotesHub({
  onOpenChat,
  targetCategorySlug,
  targetCategoryTitle,
  onClearTargetCategory
}: QuotesHubProps) {
  const { user, t, userCoords } = useAuth();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Escrow Booking Modal State
  const [bookingModalQuote, setBookingModalQuote] = useState<any | null>(null);
  const [startDateChoice, setStartDateChoice] = useState<'tomorrow' | 'weekend' | 'custom'>('tomorrow');
  const [bookingProcessing, setBookingProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // New RFQ Form
  const [categorySlug, setCategorySlug] = useState('painting-services');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sqft, setSqft] = useState('1650');
  const [rooms, setRooms] = useState('3BHK (3 Bedrooms + Hall + Kitchen)');
  const [preferredPaint, setPreferredPaint] = useState('Asian Paints Royale Luxury (Silk)');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (targetCategorySlug) {
      setCategorySlug(targetCategorySlug);
      setTitle(targetCategoryTitle || '');
      setShowCreateModal(true);
    }
  }, [targetCategorySlug, targetCategoryTitle]);

  const loadRfqs = async () => {
    try {
      const res = await apiRequest('/quotes/my-rfqs');
      if (res.success && res.rfqs) {
        setRfqs(res.rfqs);
        if (res.rfqs.length > 0 && !selectedRfq) {
          loadRfqDetails(res.rfqs[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRfqDetails = async (id: string) => {
    try {
      const res = await apiRequest(`/quotes/${id}`);
      if (res.success && res.rfq) {
        setSelectedRfq(res.rfq);
      }
    } catch (err) {
      console.error('Error fetching RFQ details:', err);
    }
  };

  useEffect(() => {
    loadRfqs();
  }, []);

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiRequest('/quotes/rfq', {
        method: 'POST',
        body: JSON.stringify({
          categorySlug,
          title,
          description: description || `Complete ${rooms} execution with ${preferredPaint}. Requires surface prep, primer coat, and finish.`,
          locationLat: userCoords.lat,
          locationLng: userCoords.lng,
          locationAddress: userCoords.address,
          specifications: {
            carpetAreaSqft: sqft,
            roomsCoverage: rooms,
            finishType: preferredPaint,
            preferredTimeline: 'Within 7 days'
          }
        })
      });

      if (res.success && res.rfq) {
        setShowCreateModal(false);
        if (onClearTargetCategory) onClearTargetCategory();
        setTitle('');
        setDescription('');
        await loadRfqs();
        loadRfqDetails(res.rfq.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post RFQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmEscrowBooking = async () => {
    if (!selectedRfq || !bookingModalQuote) return;
    setBookingProcessing(true);

    try {
      const res = await apiRequest(`/quotes/${selectedRfq.id}/accept/${bookingModalQuote.id}`, {
        method: 'POST'
      });

      if (res.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingModalQuote(null);
          setBookingSuccess(false);
          loadRfqDetails(selectedRfq.id);
          loadRfqs();
        }, 1800);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept quote');
    } finally {
      setBookingProcessing(false);
    }
  };

  // Helper to parse specifications
  const parseSpecs = (specs: any) => {
    if (!specs) return {};
    if (typeof specs === 'object') return specs;
    try {
      return JSON.parse(specs);
    } catch {
      return {};
    }
  };

  const currentSpecs = selectedRfq ? parseSpecs(selectedRfq.specifications) : {};

  return (
    <div className="mb-10 space-y-6">
      {/* 1. High-Impact Hero Banner & Explainer */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full backdrop-blur-sm">
              Engine B: Multi-Vendor Rate Engine
            </span>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Escrow Protection Active
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Compare Verified Contractor Quotes Side-by-Side
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Post your project specifications once. Verified local workshops and licensed contractors inspect your scope and submit itemized material + labor bids. Compare warranties, portfolios, and ratings before awarding the contract.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300 font-semibold border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Avg. 3 Itemized Quotes in 30 Mins</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Advance Protected in Escrow</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>4.8/5 Avg Verified Rating</span>
            </span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Project (Get Free Quotes)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Posted RFQ List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>My Posted Projects</span>
              <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                {rfqs.length}
              </span>
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : rfqs.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed border-slate-300 bg-white text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-800">No active projects yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Post an RFQ to get itemized quotes for Painting, Carpentry, or Bodywork.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-all"
              >
                Post First Project
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {rfqs.map(rfq => {
                const isSelected = selectedRfq?.id === rfq.id;
                const isAwarded = rfq.status === 'ACCEPTED';
                return (
                  <div
                    key={rfq.id}
                    onClick={() => loadRfqDetails(rfq.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {rfq.rfqNumber}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isAwarded
                          ? 'bg-emerald-100 text-emerald-800'
                          : rfq.quotesCount > 0
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isAwarded ? '✓ Contract Awarded' : `${rfq.quotesCount} Quote(s) Received`}
                      </span>
                    </div>

                    <h4 className="font-black text-xs text-slate-900 leading-snug line-clamp-1">
                      {rfq.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {rfq.locationAddress}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(rfq.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      <span className="text-blue-600 font-bold flex items-center gap-0.5">
                        <span>Inspect Bids</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Complete Project Workspace & Side-by-Side Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRfq ? (
            <div className="space-y-6">
              {/* 2A. Project Header & Customer Journey Stepper */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {selectedRfq.category?.name || 'Local Service'}
                    </span>
                    <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight mt-1.5">
                      {selectedRfq.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <span>📍 {selectedRfq.locationAddress}</span>
                      <span>•</span>
                      <span>ID: {selectedRfq.rfqNumber}</span>
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                    <span className="text-xs font-bold text-slate-400">Bidding Status</span>
                    <span className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {selectedRfq.quotes?.length || 0} Verified Bids Received
                    </span>
                  </div>
                </div>

                {/* Interactive Workflow Stepper */}
                <div>
                  <h5 className="font-black text-[11px] uppercase tracking-wider text-slate-400 mb-3">
                    Project Milestones & Verification Tracker
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                      <div className="flex items-center gap-1.5 font-black text-xs text-emerald-700 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>1. Scope Broadcasted</span>
                      </div>
                      <p className="text-[10px] text-emerald-800">Verified by local workshops</p>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      selectedRfq.quotes?.length > 0
                        ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <div className="flex items-center gap-1.5 font-black text-xs text-blue-700 mb-1">
                        <Coins className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>2. Quotes Received</span>
                      </div>
                      <p className="text-[10px] text-blue-800">
                        {selectedRfq.quotes?.length || 0} Itemized proposals
                      </p>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      selectedRfq.status === 'ACCEPTED'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                        <Lock className="w-4 h-4 shrink-0" />
                        <span>3. Escrow Deposit</span>
                      </div>
                      <p className="text-[10px]">
                        {selectedRfq.status === 'ACCEPTED' ? '✓ 10% Advance Held' : '10% advance on award'}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
                      <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                        <Award className="w-4 h-4 shrink-0" />
                        <span>4. Final Sign-Off</span>
                      </div>
                      <p className="text-[10px]">Pay balance after inspection</p>
                    </div>
                  </div>
                </div>

                {/* Project Scope & Specs Detail Box */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Customer Scope & Specifications</span>
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                      Verified Dimensions
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{selectedRfq.description || 'Complete residential room painting and surface prep work with premium emulsion.'}"
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Carpet Area</span>
                      <span className="font-black text-slate-900">{currentSpecs.carpetArea || currentSpecs.carpetAreaSqft || '1,650 sq.ft'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Finish Type</span>
                      <span className="font-black text-slate-900 truncate block">{currentSpecs.finishType || 'Asian Paints Royale'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Rooms Coverage</span>
                      <span className="font-black text-slate-900 truncate block">{currentSpecs.roomsCoverage || currentSpecs.rooms || '3BHK Flat'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Preferred Start</span>
                      <span className="font-black text-slate-900 truncate block">{currentSpecs.timeline || 'Within 7 Days'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2B. Rate Benchmarking & Comparison Matrix */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-base text-slate-900 tracking-tight flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Transparent Rate Comparison Matrix</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Compare itemized material vs. labor costs and contractor credentials side-by-side.
                    </p>
                  </div>

                  {/* Indiranagar Market Benchmark Pill */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3 py-1.5 flex items-center gap-2 text-xs">
                    <span className="text-amber-800 font-bold">Local Market Benchmark:</span>
                    <span className="font-black text-amber-950">₹31,000 – ₹37,500</span>
                  </div>
                </div>

                {selectedRfq.quotes?.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
                    <Clock className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
                    <div>
                      <p className="font-black text-sm text-slate-800">Your RFQ is broadcasting to nearby verified contractors</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Licensed contractors in Indiranagar are inspecting your specifications. Quotes with itemized materials and labor will appear here shortly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRfq.quotes?.map((quote: any, idx: number) => {
                      const isAwarded = quote.status === 'ACCEPTED';
                      const isBestPrice = idx === 0;

                      return (
                        <div
                          key={quote.id}
                          className={`rounded-3xl border p-5 transition-all flex flex-col justify-between relative ${
                            isAwarded
                              ? 'bg-gradient-to-b from-emerald-50/80 to-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg'
                          }`}
                        >
                          <div className="space-y-4">
                            {/* Card Header & Badges */}
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h5 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                                    <span>{quote.vendor.businessName}</span>
                                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                                  </h5>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                    <span className="flex items-center text-amber-500 font-black">
                                      <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                                      {quote.vendor.rating || 4.8}
                                    </span>
                                    <span>({quote.vendor.reviewCount || 42} reviews)</span>
                                    <span>•</span>
                                    <span className="truncate max-w-[140px]">{quote.vendor.address}</span>
                                  </div>
                                </div>

                                {/* Winner / Best Price Badge */}
                                {isAwarded ? (
                                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-sm shrink-0">
                                    ✓ Winner
                                  </span>
                                ) : isBestPrice ? (
                                  <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-full shadow-xs shrink-0">
                                    🏆 Best Price
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full shrink-0">
                                    ⭐ Top Rated
                                  </span>
                                )}
                              </div>

                              {/* Contractor Credential Tags */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                  GST Registered
                                </span>
                                <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                  Police Verified Crew
                                </span>
                                <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                                  Asian Paints Certified
                                </span>
                              </div>
                            </div>

                            {/* Itemized Price Breakdown Table */}
                            <div className="bg-slate-50 rounded-2xl p-3.5 text-xs space-y-1.5 border border-slate-200/80">
                              <div className="flex justify-between text-slate-600">
                                <span>Materials (Original Asian Paints):</span>
                                <span className="font-bold text-slate-900">₹{quote.materialCost.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span>Skilled Labor & Prep:</span>
                                <span className="font-bold text-slate-900">₹{quote.laborCost.toLocaleString('en-IN')}</span>
                              </div>
                              {quote.deliveryCost > 0 && (
                                <div className="flex justify-between text-slate-600">
                                  <span>Freight / Delivery:</span>
                                  <span className="font-bold text-slate-900">₹{quote.deliveryCost.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-slate-600">
                                <span>GST & Quality Insurance:</span>
                                <span className="font-bold text-emerald-600">{quote.taxes > 0 ? `₹${quote.taxes}` : 'Included (₹0)'}</span>
                              </div>

                              <div className="pt-2 mt-1 border-t border-slate-200 flex items-center justify-between">
                                <div>
                                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Estimate</span>
                                  <span className="text-lg font-black text-orange-600">
                                    ₹{quote.totalAmount.toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 block text-[10px] uppercase font-bold">10% Advance</span>
                                  <span className="text-xs font-black text-slate-900">
                                    ₹{Math.round(quote.totalAmount * 0.1).toLocaleString('en-IN')} (Escrow)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Contractor Proposal & Scope */}
                            <div className="space-y-1">
                              <p className="text-xs text-slate-700 leading-relaxed italic bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/60">
                                &ldquo;{quote.proposalDetails}&rdquo;
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Execution: <strong>{quote.estimatedDays} Days</strong></span>
                                </span>
                                <span className="text-emerald-700 font-bold">
                                  ✓ Free Post-Paint Floor Cleanup
                                </span>
                              </div>
                            </div>

                            {/* Mini Past Work Preview */}
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Recent Work in Indiranagar
                              </span>
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
                                <div className="bg-slate-100 rounded-xl p-2 flex items-center gap-1.5 border border-slate-200">
                                  <span className="text-base">🎨</span>
                                  <span className="truncate">Royale Silk Living Room</span>
                                </div>
                                <div className="bg-slate-100 rounded-xl p-2 flex items-center gap-1.5 border border-slate-200">
                                  <span className="text-base">✨</span>
                                  <span className="truncate">Geometric Texture Wall</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                            <div className="flex items-center gap-2">
                              {/* Direct Chat */}
                              <button
                                onClick={() =>
                                  onOpenChat({
                                    rfqId: selectedRfq.id,
                                    receiverId: quote.vendor.user?.id || quote.vendorId,
                                    receiverName: quote.vendor.businessName
                                  })
                                }
                                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                                <span>Chat</span>
                              </button>

                              {/* Direct Phone Call */}
                              <a
                                href="tel:+919876555144"
                                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center"
                                title="Call Contractor"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              </a>

                              {/* Award & Book */}
                              {!isAwarded && selectedRfq.status !== 'ACCEPTED' && (
                                <button
                                  onClick={() => setBookingModalQuote(quote)}
                                  className="flex-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                                >
                                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                  <span>Accept & Book</span>
                                </button>
                              )}
                            </div>

                            {isAwarded && (
                              <div className="p-2.5 rounded-xl bg-emerald-100/70 text-emerald-900 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Contract Awarded! Partner contacting you for site prep.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2C. ShortEdge Escrow Shield & Consumer Protection Guarantee */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <h4 className="font-black text-base tracking-tight">
                    ShortEdge Home Projects Escrow & Warranty Shield
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-200 block text-sm flex items-center gap-1">
                      <span>🛡️ 100% Escrow Safety</span>
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Your 10% advance deposit is held securely in ShortEdge Escrow. Funds are released to the contractor only after you inspect and approve milestones.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-200 block text-sm flex items-center gap-1">
                      <span>🎨 Genuine Materials Guarantee</span>
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      100% genuine barcode-sealed Asian Paints / Berger containers opened on-site in front of you. Zero dilution or counterfeit materials.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-200 block text-sm flex items-center gap-1">
                      <span>⏱️ 1-Year Quality Warranty</span>
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Includes 1-Year Anti-Peeling & Anti-Fungal warranty. If peeling or shade discrepancy occurs, ShortEdge covers free rework up to ₹10,000.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-2">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-bold text-sm text-slate-700">Select an RFQ project on the left to inspect side-by-side quotes</p>
              <p className="text-xs text-slate-400">Or post a new project to invite verified local contractors.</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: ESCROW BOOKING & WORK ORDER MODAL */}
      {/* ==================================================================== */}
      {bookingModalQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Award Contract & Deposit Escrow</h3>
                  <p className="text-xs text-slate-500">ShortEdge Consumer Protection Guarantee</p>
                </div>
              </div>
              <button
                onClick={() => setBookingModalQuote(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contractor Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Selected Contractor:</span>
                <span className="font-black text-slate-900">{bookingModalQuote.vendor.businessName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Project Amount:</span>
                <span className="font-black text-slate-900">₹{bookingModalQuote.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-emerald-700">
                <span>10% Advance Deposit (Escrow):</span>
                <span className="text-sm font-black">₹{Math.round(bookingModalQuote.totalAmount * 0.1).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Start Date Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase text-slate-700">
                Preferred Work Start Date
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStartDateChoice('tomorrow')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    startDateChoice === 'tomorrow'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setStartDateChoice('weekend')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    startDateChoice === 'weekend'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  This Weekend
                </button>
                <button
                  type="button"
                  onClick={() => setStartDateChoice('custom')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    startDateChoice === 'custom'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  Next Week
                </button>
              </div>
            </div>

            {/* Escrow Terms */}
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Your ₹{Math.round(bookingModalQuote.totalAmount * 0.1).toLocaleString('en-IN')} advance remains 100% protected in ShortEdge Escrow. The contractor does not receive this payment until you inspect and sign off on surface preparation.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBookingModalQuote(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEscrowBooking}
                disabled={bookingProcessing || bookingSuccess}
                className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {bookingSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Contract Awarded!</span>
                  </>
                ) : bookingProcessing ? (
                  <span>Securing in Escrow...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Deposit ₹{Math.round(bookingModalQuote.totalAmount * 0.1).toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: POST RFQ PROJECT MODAL */}
      {/* ==================================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  Post Request for Quotation (RFQ)
                </h3>
                <p className="text-xs text-slate-500">
                  Broadcast specifications to verified contractors in Indiranagar.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  if (onClearTargetCategory) onClearTargetCategory();
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Service Category
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="painting-services">🎨 House Painting & Wall Textures</option>
                  <option value="furniture-interiors">🪑 Custom Carpentry & Modular Interiors</option>
                  <option value="vehicle-servicing">🚗 Car Denting, Painting & Bodywork</option>
                  <option value="ac-appliance-repair">❄️ AC Service & Gas Refill</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete 3BHK Repainting with Asian Paints Royale"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Carpet Area / Size
                  </label>
                  <input
                    type="text"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    placeholder="e.g. 1,650 sq.ft."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Finish / Material Tier
                  </label>
                  <input
                    type="text"
                    value={preferredPaint}
                    onChange={(e) => setPreferredPaint(e.target.value)}
                    placeholder="e.g. Asian Paints Royale"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Rooms / Coverage Scope
                </label>
                <input
                  type="text"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="e.g. 3 Bedrooms + Living Room + Kitchen"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Detailed Scope & Special Requirements
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention surface conditions, wall dampness/putty repair, accent textures, or car dent location..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/25 active:scale-95 transition-all"
                >
                  {submitting ? 'Broadcasting to Contractors...' : 'Broadcast to Local Contractors'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

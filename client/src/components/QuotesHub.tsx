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
  ArrowRight
} from 'lucide-react';

interface QuotesHubProps {
  onOpenChat: (context: { rfqId: string; receiverId: string; receiverName: string }) => void;
}

export default function QuotesHub({ onOpenChat }: QuotesHubProps) {
  const { user, t, userCoords } = useAuth();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New RFQ Form
  const [categorySlug, setCategorySlug] = useState('painting-services');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sqft, setSqft] = useState('1200');
  const [submitting, setSubmitting] = useState(false);

  const loadRfqs = async () => {
    try {
      const res = await apiRequest('/quotes/my-rfqs');
      if (res.success && res.rfqs) {
        setRfqs(res.rfqs);
        if (res.rfqs.length > 0 && !selectedRfq) {
          // Auto select first RFQ with quotes
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
          description,
          locationLat: userCoords.lat,
          locationLng: userCoords.lng,
          locationAddress: userCoords.address,
          specifications: {
            carpetAreaSqft: sqft,
            preferredTimeline: 'Within 7 days'
          }
        })
      });

      if (res.success && res.rfq) {
        setShowCreateModal(false);
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

  const handleAcceptQuote = async (rfqId: string, quoteId: string) => {
    if (!confirm('Are you sure you want to accept this quote and award the contract?')) return;

    try {
      const res = await apiRequest(`/quotes/${rfqId}/accept/${quoteId}`, {
        method: 'POST'
      });

      if (res.success) {
        alert('Contract awarded successfully! The vendor will contact you for dispatch.');
        loadRfqDetails(rfqId);
        loadRfqs();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept quote');
    }
  };

  return (
    <div className="mb-10">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 text-white mb-6 shadow-xl shadow-blue-500/10">
        <div className="max-w-2xl">
          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
            Engine B: Multi-Vendor Rate Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
            {t.compareQuotesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            {t.compareQuotesDesc}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-blue-900 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>{t.postRfqBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: My RFQ List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
            <span>My Posted Projects</span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {rfqs.length} Total
            </span>
          </h3>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : rfqs.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No RFQs posted yet. Click "Post New Request" to invite bids!
            </div>
          ) : (
            rfqs.map(rfq => (
              <div
                key={rfq.id}
                onClick={() => loadRfqDetails(rfq.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedRfq?.id === rfq.id
                    ? 'bg-blue-50/60 border-blue-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400">
                    {rfq.rfqNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rfq.status === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rfq.quotesCount > 0
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rfq.status === 'ACCEPTED' ? 'Contract Awarded' : `${rfq.quotesCount} Quote(s) Received`}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                  {rfq.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {rfq.locationAddress}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right Col: Side-by-Side Comparison Matrix */}
        <div className="lg:col-span-2">
          {selectedRfq ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {selectedRfq.category?.name}
                  </span>
                  <h3 className="font-black text-lg text-slate-900 leading-tight">
                    {selectedRfq.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedRfq.locationAddress}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 block">RFQ ID: {selectedRfq.rfqNumber}</span>
                  <span className="text-xs text-slate-600 font-semibold">
                    {selectedRfq.quotes?.length || 0} local vendors quoted
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison Cards */}
              <div className="mt-5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Transparent Rate Comparison Matrix</span>
                </h4>

                {selectedRfq.quotes?.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                    <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2 animate-spin" />
                    Broadcasted to verified local workshops. Quotes will appear here shortly!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRfq.quotes?.map((quote: any) => {
                      const isAwarded = quote.status === 'ACCEPTED';
                      return (
                        <div
                          key={quote.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            isAwarded
                              ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          <div>
                            {/* Vendor Profile Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                                  <span>{quote.vendor.businessName}</span>
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                </h5>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                                  <span className="flex items-center text-amber-500 font-bold">
                                    <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                                    {quote.vendor.rating}
                                  </span>
                                  <span>•</span>
                                  <span>{quote.vendor.address}</span>
                                </div>
                              </div>
                              {isAwarded && (
                                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                                  Winner
                                </span>
                              )}
                            </div>

                            {/* Itemized Price Breakdown Table */}
                            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 mb-3">
                              <div className="flex justify-between text-slate-600">
                                <span>Material Cost:</span>
                                <span className="font-semibold">₹{quote.materialCost.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span>Labor / Service:</span>
                                <span className="font-semibold">₹{quote.laborCost.toLocaleString('en-IN')}</span>
                              </div>
                              {quote.deliveryCost > 0 && (
                                <div className="flex justify-between text-slate-600">
                                  <span>Delivery / Freight:</span>
                                  <span className="font-semibold">₹{quote.deliveryCost.toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-slate-600">
                                <span>GST / Taxes:</span>
                                <span className="font-semibold">₹{quote.taxes.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="pt-1.5 mt-1 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                                <span>Total Estimate:</span>
                                <span className="text-orange-600">₹{quote.totalAmount.toLocaleString('en-IN')}</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3 italic">
                              "{quote.proposalDetails}"
                            </p>

                            <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold mb-4">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Timeline: {quote.estimatedDays} Days</span>
                            </div>
                          </div>

                          {/* Action Buttons: Chat & Award */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() =>
                                onOpenChat({
                                  rfqId: selectedRfq.id,
                                  receiverId: quote.vendor.user?.id || quote.vendorId,
                                  receiverName: quote.vendor.businessName
                                })
                              }
                              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                              <span>Chat</span>
                            </button>

                            {!isAwarded && selectedRfq.status !== 'ACCEPTED' && (
                              <button
                                onClick={() => handleAcceptQuote(selectedRfq.id, quote.id)}
                                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Accept & Book</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-10 text-center border border-dashed border-slate-200 text-xs text-slate-400">
              Select an RFQ on the left to inspect side-by-side contractor quotes
            </div>
          )}
        </div>
      </div>

      {/* RFQ Creator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-extrabold text-lg text-slate-900 mb-1">
              Post Request for Quotation (RFQ)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Broadcast your specifications to all local workshops & contractors for competitive bids.
            </p>

            <form onSubmit={handleCreateRfq} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="painting-services">House Painting & Wall Textures</option>
                  <option value="furniture-interiors">Furniture & Custom Carpentry</option>
                  <option value="vehicle-servicing">Car Denting, Painting & Bodywork</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete 2BHK Repainting with Asian Paints Royale"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Carpet Area / Dimensions</label>
                <input
                  type="text"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  placeholder="e.g. 1,200 sq.ft."
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Scope & Details</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention paint finish, number of coats, surface repairs, or vehicle dent details..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all"
                >
                  {submitting ? 'Broadcasting...' : 'Broadcast to Local Vendors'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

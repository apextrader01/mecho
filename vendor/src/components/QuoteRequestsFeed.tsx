'use client';

import React, { useState, useEffect } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { vendorApiRequest } from '../lib/api';
import {
  FileText,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Sparkles
} from 'lucide-react';

interface QuoteRequestsFeedProps {
  onOpenChat: (context: { rfqId: string; receiverId: string; receiverName: string }) => void;
}

export default function QuoteRequestsFeed({ onOpenChat }: QuoteRequestsFeedProps) {
  const { vendor, t, lang } = useVendorAuth();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quote form state
  const [activeRfqId, setActiveRfqId] = useState<string | null>(null);
  const [materialCost, setMaterialCost] = useState('18500');
  const [laborCost, setLaborCost] = useState('12000');
  const [deliveryCost, setDeliveryCost] = useState('500');
  const [taxes, setTaxes] = useState('1550');
  const [estimatedDays, setEstimatedDays] = useState('6');
  const [proposalDetails, setProposalDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRfqs = async () => {
    try {
      setLoading(true);
      const res = await vendorApiRequest('/quotes/vendor-inbox');
      if (res.success && res.rfqs) {
        setRfqs(res.rfqs);
      }
    } catch (err) {
      console.error('Error fetching RFQ inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRfqs();
  }, [vendor]);

  const handleSubmitQuote = async (rfqId: string) => {
    try {
      setSubmitting(true);
      const res = await vendorApiRequest(`/quotes/${rfqId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          materialCost: parseFloat(materialCost) || 0,
          laborCost: parseFloat(laborCost) || 0,
          deliveryCost: parseFloat(deliveryCost) || 0,
          taxes: parseFloat(taxes) || 0,
          estimatedDays: parseInt(estimatedDays) || 3,
          proposalDetails: proposalDetails || 'Standard itemized proposal with warranty'
        })
      });

      if (res.success) {
        alert('Itemized quote submitted successfully! Customer has been notified via WhatsApp alert.');
        setActiveRfqId(null);
        loadRfqs();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedTotal =
    (parseFloat(materialCost) || 0) +
    (parseFloat(laborCost) || 0) +
    (parseFloat(deliveryCost) || 0) +
    (parseFloat(taxes) || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
            Quotation Requests (RFQs) in your Category ({rfqs.length})
          </h3>
          <p className="text-xs text-slate-500">
            Submit competitive, itemized quotes to win house painting, renovation, and vehicle servicing contracts
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : rfqs.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
          No new RFQs broadcasted in your categories at this time.
        </div>
      ) : (
        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <div
              key={rfq.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">
                      {rfq.title}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">#{rfq.rfqNumber}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{rfq.locationAddress} ({rfq.distanceKm} km away)</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {rfq.hasSubmittedQuote && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                      Quote Submitted
                    </span>
                  )}

                  <button
                    onClick={() =>
                      onOpenChat({
                        rfqId: rfq.id,
                        receiverId: rfq.customer?.id || rfq.customerId,
                        receiverName: rfq.customer?.name || 'Customer'
                      })
                    }
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chat / Clarify</span>
                  </button>
                </div>
              </div>

              {/* Scope & Specs */}
              <div className="my-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                <p className="font-semibold text-slate-800 mb-1">Customer Requirements:</p>
                <p className="italic">"{rfq.description}"</p>
                {rfq.specifications && (
                  <div className="mt-2 text-[11px] text-slate-500 font-mono">
                    Specs: {JSON.stringify(rfq.specifications)}
                  </div>
                )}
              </div>

              {/* Already Submitted Quote Summary */}
              {rfq.hasSubmittedQuote && rfq.myQuote && (
                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-200 text-xs space-y-1 mb-3">
                  <div className="flex justify-between font-bold text-blue-900">
                    <span>Your Submitted Quote:</span>
                    <span>₹{rfq.myQuote.totalAmount.toLocaleString('en-IN')} ({rfq.myQuote.estimatedDays} Days)</span>
                  </div>
                  <p className="text-slate-600 italic text-[11px]">"{rfq.myQuote.proposalDetails}"</p>
                </div>
              )}

              {/* Itemized Quote Form Trigger / Form */}
              {!rfq.hasSubmittedQuote && (
                <div>
                  {activeRfqId === rfq.id ? (
                    <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                        Itemized Rate Breakdown Form
                      </h5>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            {t.materialCost}
                          </label>
                          <input
                            type="number"
                            value={materialCost}
                            onChange={(e) => setMaterialCost(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            {t.laborCost}
                          </label>
                          <input
                            type="number"
                            value={laborCost}
                            onChange={(e) => setLaborCost(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            {t.deliveryCost}
                          </label>
                          <input
                            type="number"
                            value={deliveryCost}
                            onChange={(e) => setDeliveryCost(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            {t.taxes}
                          </label>
                          <input
                            type="number"
                            value={taxes}
                            onChange={(e) => setTaxes(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            {t.timelineDays}
                          </label>
                          <input
                            type="number"
                            value={estimatedDays}
                            onChange={(e) => setEstimatedDays(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            {t.proposalDetails}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Asian Paints Royale with 3yr warranty, primer coats included"
                            value={proposalDetails}
                            onChange={(e) => setProposalDetails(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-xs font-black">
                        <span>Calculated Total Amount:</span>
                        <span className="text-orange-600 text-sm">
                          ₹{calculatedTotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveRfqId(null)}
                          className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmitQuote(rfq.id)}
                          disabled={submitting}
                          className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all"
                        >
                          {submitting ? 'Submitting Quote...' : t.submitQuote}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveRfqId(rfq.id)}
                      className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all"
                    >
                      + Prepare Itemized Quote
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

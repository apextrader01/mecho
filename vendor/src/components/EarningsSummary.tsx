'use client';

import React, { useState, useEffect } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { vendorApiRequest } from '../lib/api';
import { TrendingUp, ShieldCheck, CheckCircle, IndianRupee, Layers } from 'lucide-react';

export default function EarningsSummary() {
  const { vendor, t } = useVendorAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEarnings() {
      try {
        setLoading(true);
        const res = await vendorApiRequest('/vendor/earnings');
        if (res.success && res.earnings) {
          setData(res.earnings);
        }
      } catch (err) {
        console.error('Error fetching earnings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEarnings();
  }, [vendor]);

  if (loading) {
    return <div className="h-48 bg-slate-100 rounded-3xl animate-pulse"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Settled Revenue
          </span>
          <div className="flex items-center gap-1 font-black text-2xl text-emerald-400">
            <span>₹{(data?.totalRevenue || 0).toLocaleString('en-IN')}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Directly transferred to linked bank / UPI
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Emergency SOS Dispatches
          </span>
          <div className="font-black text-2xl text-slate-900">
            ₹{(data?.dispatchEarnings || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-2 block">
            {data?.counts?.dispatches || 0} Successful Dispatches
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Contract & Store Earnings
          </span>
          <div className="font-black text-2xl text-slate-900">
            ₹{((data?.quotesEarnings || 0) + (data?.commerceEarnings || 0)).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-blue-600 font-bold mt-2 block">
            {data?.counts?.contracts || 0} RFQ Contracts Won
          </span>
        </div>
      </div>

      {/* KYC Status & Banking Settlement */}
      <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h4 className="font-black text-sm flex items-center gap-1.5 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>KYC Verification Verified by ShortEdge Super Admin</span>
          </h4>
          <p className="text-emerald-700 mt-0.5">
            Your GST/Aadhaar identity and trade license documents are approved for 24/7 instant dispatches.
          </p>
        </div>
        <span className="font-mono font-bold bg-white px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
          Settlement: T+0 UPI Instant
        </span>
      </div>
    </div>
  );
}

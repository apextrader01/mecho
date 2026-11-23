'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  MessageSquare,
  KeyRound,
  FileCheck2,
  Receipt,
  User,
  Phone,
  RefreshCw
} from 'lucide-react';

interface OrdersTrackerProps {
  onOpenChat: (context: { dispatchId: string; receiverId: string; receiverName: string }) => void;
}

export default function OrdersTracker({ onOpenChat }: OrdersTrackerProps) {
  const { user, t, lang } = useAuth();
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDispatches = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/dispatch/my');
      if (res.success && res.dispatches) {
        setDispatches(res.dispatches);
      }
    } catch (err) {
      console.error('Error fetching my dispatches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatches();
    const interval = setInterval(loadDispatches, 5000); // Poll status updates every 5s
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return { label: t.statusRequested, color: 'bg-amber-100 text-amber-800 animate-pulse' };
      case 'ACCEPTED':
      case 'ON_THE_WAY':
        return { label: t.statusAccepted, color: 'bg-blue-100 text-blue-800 animate-pulse' };
      case 'IN_PROGRESS':
        return { label: t.statusInProgress, color: 'bg-purple-100 text-purple-800 animate-pulse' };
      case 'COMPLETED':
        return { label: t.statusCompleted, color: 'bg-emerald-100 text-emerald-800' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t.activeBookings}</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
              {dispatches.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time tracking with 4-digit Start & Completion OTP verification cards
          </p>
        </div>

        <button
          onClick={loadDispatches}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading && dispatches.length === 0 ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : dispatches.length === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
          No dispatches yet. Use the top SOS buttons for fuel or roadside puncture assistance!
        </div>
      ) : (
        <div className="space-y-4">
          {dispatches.map((dispatch) => {
            const badge = getStatusBadge(dispatch.status);
            const isFuel = dispatch.category?.slug === 'emergency-fuel';

            return (
              <div
                key={dispatch.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 font-black text-xs flex items-center justify-center">
                      SOS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900">
                          {lang === 'hi' ? dispatch.category?.nameHi || dispatch.category?.name : dispatch.category?.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400">
                          #{dispatch.bookingNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📍 {dispatch.pickupAddress}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* OTP & Verification Showcase Box */}
                <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Start OTP Card */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                      <KeyRound className="w-3.5 h-3.5 text-orange-600" />
                      <span>{t.startOtpLabel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-black text-slate-900 tracking-wider">
                        {dispatch.startOtp}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        dispatch.status === 'IN_PROGRESS' || dispatch.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {dispatch.status === 'IN_PROGRESS' || dispatch.status === 'COMPLETED' ? '✓ Verified on Arrival' : 'Pending Arrival'}
                      </span>
                    </div>
                  </div>

                  {/* End OTP Card */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.endOtpLabel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-black text-slate-900 tracking-wider">
                        {dispatch.endOtp}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        dispatch.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {dispatch.status === 'COMPLETED' ? '✓ Finished & Audited' : 'Give after work'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Partner Details & In-App Chat Trigger */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {dispatch.vendor?.businessName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">
                        {dispatch.vendor ? dispatch.vendor.businessName : 'Matching with nearby online partner...'}
                      </span>
                      {dispatch.vendor && (
                        <span className="text-[10px] text-slate-400">
                          ⭐ {dispatch.vendor.rating} • {dispatch.vendor.address}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Billing Summary */}
                    <div className="text-right text-xs mr-2">
                      <span className="text-slate-400 block text-[10px]">Total Amount</span>
                      <span className="font-extrabold text-slate-900">
                        ₹{dispatch.totalAmount || dispatch.runnerServiceFee}
                      </span>
                    </div>

                    {dispatch.vendor && (
                      <button
                        onClick={() =>
                          onOpenChat({
                            dispatchId: dispatch.id,
                            receiverId: dispatch.vendor.userId || dispatch.vendorId,
                            receiverName: dispatch.vendor.businessName
                          })
                        }
                        className="py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{t.chatWithPartner}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Proof & Receipt Preview (If Completed) */}
                {dispatch.status === 'COMPLETED' && (
                  <div className="mt-4 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <span>
                        Verified Bill: Runner Fee ₹{dispatch.runnerServiceFee} + Actual Receipt ₹{dispatch.actualFuelReceiptAmount}
                      </span>
                    </div>
                    {dispatch.completionPhotoUrl ? (
                      <a
                        href={dispatch.completionPhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1"
                      >
                        <span>View Attached Pump Receipt / Work Photo</span>
                        <span>&rarr;</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">
                        Digital Audit Recorded
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

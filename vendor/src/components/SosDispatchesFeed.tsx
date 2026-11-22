'use client';

import React, { useState, useEffect } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { vendorApiRequest } from '../lib/api';
import {
  ShieldAlert,
  Fuel,
  Wrench,
  MapPin,
  Clock,
  KeyRound,
  FileCheck2,
  Camera,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Navigation
} from 'lucide-react';

interface SosDispatchesFeedProps {
  onOpenChat: (context: { dispatchId: string; receiverId: string; receiverName: string }) => void;
}

export default function SosDispatchesFeed({ onOpenChat }: SosDispatchesFeedProps) {
  const { vendor, t, lang } = useVendorAuth();
  const [nearbyDispatches, setNearbyDispatches] = useState<any[]>([]);
  const [myDispatches, setMyDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms State for Start OTP & Completion
  const [startOtpInputs, setStartOtpInputs] = useState<Record<string, string>>({});
  const [endOtpInputs, setEndOtpInputs] = useState<Record<string, string>>({});
  const [receiptAmounts, setReceiptAmounts] = useState<Record<string, string>>({});
  const [receiptFiles, setReceiptFiles] = useState<Record<string, File | null>>({});

  const loadDispatches = async () => {
    try {
      setLoading(true);
      const [nearbyRes, myRes] = await Promise.all([
        vendorApiRequest('/dispatch/vendor-feed'),
        vendorApiRequest('/dispatch/my')
      ]);

      if (nearbyRes.success) setNearbyDispatches(nearbyRes.dispatches);
      if (myRes.success) setMyDispatches(myRes.dispatches);
    } catch (err) {
      console.error('Error fetching vendor dispatches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatches();
    const interval = setInterval(loadDispatches, 5000);
    return () => clearInterval(interval);
  }, [vendor]);

  const handleAccept = async (dispatchId: string) => {
    try {
      const res = await vendorApiRequest(`/dispatch/${dispatchId}/accept`, {
        method: 'PATCH'
      });
      if (res.success) {
        alert('Dispatch accepted! Proceed to pickup location or fuel pump.');
        loadDispatches();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept dispatch');
    }
  };

  const handleVerifyStartOtp = async (dispatchId: string) => {
    const otp = startOtpInputs[dispatchId];
    if (!otp) return alert('Please enter customer 4-digit Start OTP');

    try {
      const res = await vendorApiRequest(`/dispatch/${dispatchId}/verify-start-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp, idVerified: true })
      });
      if (res.success) {
        alert('Start OTP verified! Status is now IN_PROGRESS.');
        loadDispatches();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to verify Start OTP');
    }
  };

  const handleCompleteDispatch = async (dispatchId: string) => {
    const otp = endOtpInputs[dispatchId];
    const amount = receiptAmounts[dispatchId] || '0';
    const file = receiptFiles[dispatchId];

    if (!otp) return alert('Please enter customer Completion OTP');

    try {
      const formData = new FormData();
      formData.append('otp', otp);
      formData.append('actualFuelReceiptAmount', amount);
      if (file) {
        formData.append('proofPhoto', file);
      }

      const res = await vendorApiRequest(`/dispatch/${dispatchId}/complete`, {
        method: 'POST',
        body: formData
      });

      if (res.success) {
        alert('Service completed! Payment logged and audited.');
        loadDispatches();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete dispatch');
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: INCOMING OPEN SOS ALERTS (Broadcasting within radius) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-100 text-red-600">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Live Open SOS Dispatches ({nearbyDispatches.length})
              </h3>
              <p className="text-xs text-slate-500">
                Incoming broadcast requests within your {vendor?.serviceRadiusKm} km coverage
              </p>
            </div>
          </div>
        </div>

        {nearbyDispatches.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No pending SOS requests in your area right now. Keep "Online 24/7" toggle ON to receive emergency requests!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyDispatches.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-3xl border-2 border-red-500/30 p-5 shadow-lg shadow-red-500/5 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black">
                      {d.category?.slug === 'emergency-fuel' ? <Fuel className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">
                        {d.bookingNumber}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 mt-0.5">
                        {lang === 'hi' ? d.category?.nameHi || d.category?.name : d.category?.name}
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
                    📍 {d.distanceKm} km away
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-1.5 mb-4">
                  <p className="font-semibold text-slate-800">
                    Breakdown Location: {d.pickupAddress}
                  </p>
                  {d.requestDetails?.fuelType && (
                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px]">
                        Fuel: {d.requestDetails.liters}L {d.requestDetails.fuelType}
                      </span>
                      <span>Vehicle: {d.requestDetails.vehicleModel}</span>
                    </div>
                  )}
                  {d.requestDetails?.issue && (
                    <p className="text-slate-600">Issue: {d.requestDetails.issue} ({d.requestDetails.vehicleType})</p>
                  )}
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between font-bold">
                    <span>Assured Runner Service Fee:</span>
                    <span className="text-emerald-600 font-extrabold">₹{d.runnerServiceFee}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAccept(d.id)}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black py-3 rounded-2xl shadow-md text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{t.acceptBooking} &rarr;</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: MY ASSIGNED & ACTIVE DISPATCHES */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="font-extrabold text-base text-slate-900 mb-3">
          My Active & Assigned Workflows ({myDispatches.length})
        </h3>

        {myDispatches.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No active jobs in your queue.
          </div>
        ) : (
          <div className="space-y-4">
            {myDispatches.map((d) => {
              const isAccepted = d.status === 'ACCEPTED' || d.status === 'ON_THE_WAY';
              const isInProgress = d.status === 'IN_PROGRESS';
              const isCompleted = d.status === 'COMPLETED';

              return (
                <div
                  key={d.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">
                          {d.category?.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">#{d.bookingNumber}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customer: <strong>{d.customer?.name}</strong> ({d.customer?.phone}) • 📍 {d.pickupAddress}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isInProgress
                          ? 'bg-purple-100 text-purple-800 animate-pulse'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {d.status}
                      </span>

                      <button
                        onClick={() =>
                          onOpenChat({
                            dispatchId: d.id,
                            receiverId: d.customer?.id || d.customerId,
                            receiverName: d.customer?.name || 'Customer'
                          })
                        }
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Verification & Action Workflows */}
                  <div className="mt-4">
                    {/* Stage 1: Verify Start OTP on Arrival */}
                    {isAccepted && (
                      <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <KeyRound className="w-4 h-4 text-amber-600" />
                          <h5 className="font-extrabold text-xs text-amber-900">
                            Arrival Verification: Ask customer for 4-digit Start OTP
                          </h5>
                        </div>
                        <div className="flex items-center gap-2 max-w-sm">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="e.g. 7429"
                            value={startOtpInputs[d.id] || ''}
                            onChange={(e) =>
                              setStartOtpInputs({ ...startOtpInputs, [d.id]: e.target.value })
                            }
                            className="w-32 font-mono text-center text-sm font-black tracking-widest px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleVerifyStartOtp(d.id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm"
                          >
                            Verify & Start Service
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Stage 2: In-Progress -> Finalize with Receipt & End OTP */}
                    {isInProgress && (
                      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-4 h-4 text-emerald-600" />
                          <h5 className="font-extrabold text-xs text-emerald-900">
                            Completion Audit: Pump Bill / Work Photo + End OTP
                          </h5>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {d.category?.slug === 'emergency-fuel' && (
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Actual Fuel Pump Receipt Amount (₹)
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                placeholder="e.g. 365.50"
                                value={receiptAmounts[d.id] || ''}
                                onChange={(e) =>
                                  setReceiptAmounts({ ...receiptAmounts, [d.id]: e.target.value })
                                }
                                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Customer End OTP
                            </label>
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="4-digit OTP"
                              value={endOtpInputs[d.id] || ''}
                              onChange={(e) =>
                                setEndOtpInputs({ ...endOtpInputs, [d.id]: e.target.value })
                              }
                              className="w-full font-mono text-center text-xs font-black px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Camera / Receipt Photo</span>
                              </span>
                              {receiptFiles[d.id] && (
                                <span className="text-[10px] text-emerald-600 font-bold">✓ Photo Attached</span>
                              )}
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) =>
                                setReceiptFiles({ ...receiptFiles, [d.id]: e.target.files?.[0] || null })
                              }
                              className="w-full text-[11px] file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white cursor-pointer"
                            />
                            {receiptFiles[d.id] && (
                              <p className="text-[10px] text-slate-500 mt-1 truncate">
                                📎 {receiptFiles[d.id]?.name}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCompleteDispatch(d.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Finalize Order (Mark Completed)</span>
                        </button>
                      </div>
                    )}

                    {/* Stage 3: Completed Audit Summary */}
                    {isCompleted && (
                      <div className="bg-slate-50 rounded-2xl p-3 text-xs flex justify-between items-center text-slate-600">
                        <span>
                          Settled Total: <strong>₹{d.totalAmount}</strong> (Runner: ₹{d.runnerServiceFee} + Receipt: ₹{d.actualFuelReceiptAmount})
                        </span>
                        <span className="text-emerald-600 font-bold">✓ Payment & Audit Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

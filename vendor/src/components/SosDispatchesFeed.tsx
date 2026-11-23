'use client';

import React, { useState, useEffect } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { vendorApiRequest } from '../lib/api';
import {
  ShieldAlert,
  Fuel,
  Wrench,
  Pill,
  PackageCheck,
  Truck,
  UserCheck,
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
        alert('Dispatch accepted! Proceed to pickup location or service point.');
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

    if (!otp) return alert('Please enter customer Completion End OTP');

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

  const getCategoryMeta = (slug?: string) => {
    switch (slug) {
      case 'emergency-fuel':
        return { icon: Fuel, bg: 'bg-amber-600', badge: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'roadside-puncture':
        return { icon: Wrench, bg: 'bg-red-600', badge: 'bg-red-100 text-red-900 border-red-300' };
      case 'emergency-pharmacy':
        return { icon: Pill, bg: 'bg-rose-600', badge: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'genie-pickup-drop':
        return { icon: PackageCheck, bg: 'bg-orange-600', badge: 'bg-orange-100 text-orange-900 border-orange-300' };
      case 'goods-auto-booking':
        return { icon: Truck, bg: 'bg-blue-600', badge: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'acting-drivers':
        return { icon: UserCheck, bg: 'bg-indigo-600', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      default:
        return { icon: ShieldAlert, bg: 'bg-slate-700', badge: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const renderDetails = (d: any) => {
    const details = typeof d.requestDetails === 'string' ? JSON.parse(d.requestDetails || '{}') : (d.requestDetails || {});

    if (d.category?.slug === 'emergency-fuel') {
      return (
        <div className="flex flex-wrap items-center gap-2 text-slate-700 font-bold">
          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px]">
            ⛽ {details.liters || 3}L {details.fuelType || 'PETROL'}
          </span>
          <span className="text-slate-600">🚗 {details.vehicleModel}</span>
          {details.notes && <p className="w-full text-slate-500 text-[11px] font-normal">📝 {details.notes}</p>}
        </div>
      );
    }

    if (d.category?.slug === 'roadside-puncture') {
      return (
        <div className="flex flex-wrap items-center gap-2 text-slate-700 font-bold">
          <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded text-[11px]">
            🔧 {details.issue || 'Tyre Puncture'}
          </span>
          <span className="text-slate-600">🚗 {details.vehicleType || 'Car'} - {details.vehicleModel}</span>
        </div>
      );
    }

    if (d.category?.slug === 'emergency-pharmacy') {
      return (
        <div className="space-y-1 text-slate-700">
          <div className="flex items-center gap-2">
            <span className="bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded text-[11px]">
              💊 30-Min Night Chemist
            </span>
            {details.prescriptionUploaded && (
              <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[11px]">
                ✓ Prescription Photo Attached
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-800">
            Medicines: <span className="font-normal">{details.medicines || 'Emergency Medicines'}</span>
          </p>
        </div>
      );
    }

    if (d.category?.slug === 'genie-pickup-drop') {
      return (
        <div className="space-y-1 text-slate-700 text-xs">
          <p className="font-semibold text-slate-800">
            📦 Pickup Item: <span className="font-normal">{details.itemDescription || 'Keys / Documents'}</span>
          </p>
          {d.dropAddress && (
            <p className="text-[11px] text-slate-600 font-medium">
              🏁 Drop Destination: <strong>{d.dropAddress}</strong>
            </p>
          )}
          {details.recipientPhone && (
            <p className="text-[11px] text-slate-500">
              📞 Contact: {details.recipientPhone}
            </p>
          )}
        </div>
      );
    }

    if (d.category?.slug === 'goods-auto-booking') {
      return (
        <div className="space-y-1 text-slate-700 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[11px]">
              🚚 {details.vehicleType || 'Tata Ace'}
            </span>
            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
              👥 {details.helpers || 0} Helpers
            </span>
          </div>
          <p className="font-semibold text-slate-800">
            📦 Cargo: <span className="font-normal">{details.goodsType || 'Goods Shifting'}</span>
          </p>
          {d.dropAddress && (
            <p className="text-[11px] text-slate-600">🏁 Drop Destination: {d.dropAddress}</p>
          )}
        </div>
      );
    }

    if (d.category?.slug === 'acting-drivers') {
      return (
        <div className="space-y-1 text-slate-700 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded text-[11px]">
              🚗 {details.transmission || 'Manual'} Transmission
            </span>
            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
              ⏱️ {details.tripType || 'City Hourly'}
            </span>
          </div>
          {details.carModel && (
            <p className="font-semibold text-slate-800">Vehicle: <span className="font-normal">{details.carModel}</span></p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: INCOMING OPEN SOS ALERTS */}
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
            No pending SOS requests in your area right now. Keep &quot;Online 24/7&quot; toggle ON to receive emergency requests!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyDispatches.map((d) => {
              const meta = getCategoryMeta(d.category?.slug);
              const IconComp = meta.icon;

              return (
                <div
                  key={d.id}
                  className="bg-white rounded-3xl border-2 border-red-500/30 p-5 shadow-lg shadow-red-500/5 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-2xl ${meta.bg} text-white flex items-center justify-center font-black`}>
                        <IconComp className="w-5 h-5" />
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
                      📍 {d.distanceKm || 'Nearby'} km
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-1.5 mb-4">
                    <p className="font-semibold text-slate-800">
                      📍 Pickup: {d.pickupAddress}
                    </p>
                    {renderDetails(d)}
                    <div className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-200 flex justify-between font-bold">
                      <span>Assured Runner Service Fee:</span>
                      <span className="text-emerald-600 font-extrabold text-xs">₹{d.runnerServiceFee}</span>
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
              );
            })}
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
              const meta = getCategoryMeta(d.category?.slug);
              const IconComp = meta.icon;

              return (
                <div
                  key={d.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${meta.bg} text-white flex items-center justify-center`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="font-black text-sm text-slate-900">
                          {d.category?.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">#{d.bookingNumber}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
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

                  {/* Render Request Specifics */}
                  <div className="my-3 p-3 bg-slate-50 rounded-2xl">
                    {renderDetails(d)}
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
                            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all"
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
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {d.category?.slug === 'emergency-fuel'
                                ? 'Actual Fuel Pump Receipt Amount (₹)'
                                : d.category?.slug === 'emergency-pharmacy'
                                ? 'Actual Chemist Medicine Bill Amount (₹)'
                                : 'Toll / Extra Material Charges (₹)'}
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
                                <span>Camera Shutter / Receipt Photo</span>
                              </span>
                              {receiptFiles[d.id] && (
                                <span className="text-[10px] text-emerald-600 font-bold">✓ Attached</span>
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
                          Settled Total: <strong>₹{d.totalAmount}</strong> (Runner: ₹{d.runnerServiceFee} + Receipt: ₹{d.actualFuelReceiptAmount || 0})
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

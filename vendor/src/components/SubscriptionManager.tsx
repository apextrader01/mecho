'use client';

import React, { useState, useEffect } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { vendorApiRequest } from '../lib/api';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Droplet,
  Milk,
  KeyRound,
  FileCheck2,
  Camera,
  MapPin
} from 'lucide-react';

export default function SubscriptionManager() {
  const { vendor, t } = useVendorAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryOtps, setDeliveryOtps] = useState<Record<string, string>>({});
  const [deliveryFiles, setDeliveryFiles] = useState<Record<string, File | null>>({});

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await vendorApiRequest('/commerce/subscriptions/my');
      if (res.success && res.subscriptions) {
        setSubscriptions(res.subscriptions);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [vendor]);

  const handleLogDelivery = async (subId: string) => {
    const otp = deliveryOtps[subId] || '';
    const file = deliveryFiles[subId];

    try {
      const formData = new FormData();
      formData.append('status', 'DELIVERED');
      formData.append('otp', otp);
      if (file) {
        formData.append('proofPhoto', file);
      }

      const res = await vendorApiRequest(`/commerce/subscriptions/${subId}/log`, {
        method: 'POST',
        body: formData
      });

      if (res.success) {
        alert('Daily delivery logged with customer verification OTP!');
        loadSubscriptions();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to log delivery');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
            Daily Water & Dairy Subscribers ({subscriptions.length})
          </h3>
          <p className="text-xs text-slate-500">
            Log morning deliveries with 4-digit OTP or doorstep photo proof
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
          No subscribers registered under your store yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map((sub) => {
            const isWater = sub.product?.unit?.toLowerCase().includes('can');

            return (
              <div
                key={sub.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isWater ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {isWater ? <Droplet className="w-5 h-5" /> : <Milk className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">#{sub.subNumber}</span>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          {sub.product?.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Qty: <strong>{sub.quantityPerDelivery} {sub.product?.unit}</strong> ({sub.timeSlot})
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {sub.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 text-xs mb-3 space-y-1">
                    <p className="text-slate-800 font-semibold">
                      Customer: {sub.customer?.name} ({sub.customer?.phone})
                    </p>
                    <p className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{sub.deliveryAddress}</span>
                    </p>
                  </div>
                </div>

                {/* Log Delivery Form */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Delivery OTP"
                      value={deliveryOtps[sub.id] || ''}
                      onChange={(e) =>
                        setDeliveryOtps({ ...deliveryOtps, [sub.id]: e.target.value })
                      }
                      className="w-32 font-mono text-center text-xs font-bold px-2 py-2 rounded-xl border border-slate-200"
                    />
                    <button
                      onClick={() => handleLogDelivery(sub.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Log Today's Delivery</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

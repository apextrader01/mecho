'use client';

import React, { useState, useEffect } from 'react';
import { adminApiRequest } from '../lib/api';
import { MapPin, Clock, Fuel, Wrench, ShieldAlert, CheckCircle } from 'lucide-react';

export default function LiveDispatchesTab() {
  const [liveDispatches, setLiveDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLiveFeed = async () => {
    try {
      setLoading(true);
      const res = await adminApiRequest('/admin/live-map');
      if (res.success && res.liveDispatches) {
        setLiveDispatches(res.liveDispatches);
      }
    } catch (err) {
      console.error('Failed to load live feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveFeed();
    const interval = setInterval(loadLiveFeed, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
            Citywide Live Emergency SOS & Dispatch Ops ({liveDispatches.length})
          </h3>
          <p className="text-xs text-slate-500">
            Real-time GPS tracker across Bangalore corridor (Outer Ring Road, Koramangala, Indiranagar)
          </p>
        </div>
      </div>

      {/* Simulated Live Map Visualizer */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-300">
              BANGALORE_LIVE_GPS_NETWORK • ACTIVE NODES: {liveDispatches.length}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            Polling 5000ms
          </span>
        </div>

        {/* Map Grid Canvas Simulation */}
        <div className="h-48 bg-slate-950/70 rounded-2xl border border-slate-800 p-4 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

          <div className="text-center z-10 space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-mono border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Dispatches Monitored with 4-Digit OTP Security
            </div>
            <p className="text-[11px] text-slate-400 max-w-md">
              Indiranagar (12.9784, 77.6408) • Koramangala (12.9352, 77.6245) • Electronic City Corridor
            </p>
          </div>
        </div>
      </div>

      {/* Tabular Live Feed */}
      <div className="space-y-3">
        {liveDispatches.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                {d.category?.slug === 'emergency-fuel' ? <Fuel className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">{d.category?.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">#{d.bookingNumber}</span>
                </div>
                <p className="text-slate-500 mt-0.5">
                  📍 {d.pickupAddress} • Customer: <strong>{d.customer?.name}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right">
                <span className="font-mono font-bold block text-slate-700">
                  OTP: {d.startOtp} / {d.endOtp}
                </span>
                <span className="text-[10px] text-slate-400">
                  {d.vendor ? `Partner: ${d.vendor.businessName}` : 'Assigning...'}
                </span>
              </div>

              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 animate-pulse">
                {d.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

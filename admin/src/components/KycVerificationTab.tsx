'use client';

import React, { useState, useEffect } from 'react';
import { adminApiRequest } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, CheckCircle2, XCircle, Clock, MapPin, Phone } from 'lucide-react';

export default function KycVerificationTab() {
  const { refreshStats } = useAdminAuth();
  const [vendors, setVendors] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const query = filter !== 'ALL' ? `?kycStatus=${filter}` : '';
      const res = await adminApiRequest(`/admin/vendors${query}`);
      if (res.success && res.vendors) {
        setVendors(res.vendors);
      }
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [filter]);

  const handleUpdateKyc = async (vendorId: string, status: string) => {
    try {
      const res = await adminApiRequest(`/admin/vendors/${vendorId}/kyc`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (res.success) {
        alert(`Vendor KYC successfully updated to ${status}`);
        await loadVendors();
        await refreshStats();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update KYC');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
            Vendor KYC & Commercial Verification Pipeline ({vendors.length})
          </h3>
          <p className="text-xs text-slate-500">
            Audit Trade licenses, Jerry can safety certifications, and GST registrations before approving 24/7 dispatches
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-bold">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
          No vendors found for this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {v.businessName}
                  </h4>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    v.kycStatus === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : v.kycStatus === 'PENDING'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {v.kycStatus}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>
                    Contact: <strong>{v.user?.name}</strong> • 📞 {v.user?.phone} ({v.user?.email})
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.address} • Radius: {v.serviceRadiusKm} km</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Categories: {v.categories}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                {v.kycStatus !== 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateKyc(v.id, 'APPROVED')}
                    className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve KYC</span>
                  </button>
                )}

                {v.kycStatus !== 'REJECTED' && (
                  <button
                    onClick={() => handleUpdateKyc(v.id, 'REJECTED')}
                    className="py-2 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-extrabold border border-red-200 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

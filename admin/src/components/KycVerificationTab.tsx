'use client';

import React, { useState, useEffect } from 'react';
import { adminApiRequest } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { SHORTEDGE_SERVICES } from '../lib/services';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Building,
  Sparkles,
  AlertCircle,
  Check
} from 'lucide-react';

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

  const getServiceInfo = (serviceId: string) => {
    return SHORTEDGE_SERVICES.find(s => s.id === serviceId) || {
      name: serviceId,
      emoji: '🛠️'
    };
  };

  const pendingCount = vendors.filter(v => v.kycStatus === 'PENDING').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Partner Verification & Service Capabilities
            </h3>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black animate-pulse">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit partner registration details, chosen service trades, and authorize live 24/7 dispatches
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
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st} {st === 'PENDING' && pendingCount > 0 ? `(${pendingCount})` : ''}
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
        <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-400 space-y-2">
          <Building className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-600">No partners found for this filter.</p>
          <p>New partners signing up from the Partner Portal will automatically appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map((v) => {
            const rawCategories = (v.categories || '').split(',').map((c: string) => c.trim()).filter(Boolean);

            return (
              <div
                key={v.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                  v.kycStatus === 'PENDING'
                    ? 'border-amber-400/80 ring-2 ring-amber-400/20 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                      <span>{v.businessName}</span>
                    </h4>

                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      v.kycStatus === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : v.kycStatus === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {v.kycStatus === 'APPROVED' ? '✓ Verified Partner' : v.kycStatus === 'PENDING' ? '⏳ Needs Verification' : 'Rejected'}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      Radius: {v.serviceRadiusKm} km • Day Fee: ₹{v.dayRunnerFee} • Night Fee: ₹{v.nightRunnerFee}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p>
                      Owner: <strong className="text-slate-800">{v.user?.name}</strong>
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{v.user?.phone}</span>
                    </p>
                    {v.user?.email && (
                      <p className="text-slate-500 font-mono text-[11px]">
                        {v.user.email}
                      </p>
                    )}
                    <p className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{v.address}</span>
                    </p>
                  </div>

                  {/* Registered Services Badges */}
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-500 block mb-1">
                      Authorized Capabilities ({rawCategories.length} Services):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rawCategories.map((catId: string) => {
                        const svc = getServiceInfo(catId);
                        return (
                          <span
                            key={catId}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
                          >
                            <span>{svc.emoji}</span>
                            <span>{svc.name}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  {v.kycStatus !== 'APPROVED' ? (
                    <button
                      onClick={() => handleUpdateKyc(v.id, 'APPROVED')}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Partner</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateKyc(v.id, 'REJECTED')}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-bold border border-slate-200 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  )}

                  {v.kycStatus === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateKyc(v.id, 'REJECTED')}
                      className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

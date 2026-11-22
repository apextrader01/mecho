'use client';

import React, { useState, useEffect } from 'react';
import { adminApiRequest } from '../lib/api';
import {
  Building,
  Search,
  Phone,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Power,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sliders
} from 'lucide-react';

export default function VendorRosterTab() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await adminApiRequest('/admin/vendors');
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
  }, []);

  const handleUpdateKyc = async (vendorId: string, status: string) => {
    try {
      const res = await adminApiRequest(`/admin/vendors/${vendorId}/kyc`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (res.success) {
        await loadVendors();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update KYC status');
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const term = searchTerm.toLowerCase();
    return (
      v.businessName?.toLowerCase().includes(term) ||
      v.user?.name?.toLowerCase().includes(term) ||
      v.user?.phone?.toLowerCase().includes(term) ||
      v.categories?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Vendor Roster & Fleet Directory</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                {vendors.length} Onboarded
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Coverage radius, day/night runner fees, live 24/7 status & KYC compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendor or shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 w-56 sm:w-64"
            />
          </div>

          <button
            onClick={loadVendors}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Vendors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading real-time vendor roster...
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No vendors found matching "{searchTerm}"
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Business / Shop</th>
                  <th className="px-5 py-3.5">Owner Contact</th>
                  <th className="px-5 py-3.5">Coverage & Pricing</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">KYC Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
                          {v.businessName?.charAt(0) || 'V'}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">
                            {v.businessName}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                            {v.address}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block text-xs">
                          {v.user?.name || 'Owner'}
                        </span>
                        <span className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-sky-600" />
                          <span>{v.user?.phone}</span>
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1 text-[11px]">
                        <span className="text-slate-800 font-semibold block">
                          📍 Radius: <strong>{v.serviceRadiusKm} km</strong>
                        </span>
                        <span className="text-slate-500 block font-mono text-[10px]">
                          Day: ₹{v.dayRunnerFee} • Night: ₹{v.nightRunnerFee}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          v.isOnline
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {v.isOnline ? 'Online' : 'Offline'}
                        </span>
                        {v.is24x7Emergency && (
                          <span className="text-[9px] font-black text-red-600 uppercase">
                            24/7 SOS
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          v.kycStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.kycStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {v.kycStatus}
                        </span>

                        {v.kycStatus !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateKyc(v.id, 'APPROVED')}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { adminApiRequest } from '../lib/api';
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  Fuel,
  FileText,
  ShoppingBag,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export default function CustomerDirectoryTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminApiRequest('/admin/customers');
      if (res.success && res.customers) {
        setCustomers(res.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-black">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Customer Database Directory</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800">
                {customers.length} Registered
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Real-time directory of all verified local users, dispatches & order counts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 w-56 sm:w-64"
            />
          </div>

          <button
            onClick={loadCustomers}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading real-time customer database...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No customers found matching "{searchTerm}"
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5 text-center">Language</th>
                  <th className="px-5 py-3.5 text-center">Activity Across Engines</th>
                  <th className="px-5 py-3.5 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
                          {cust.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">
                            {cust.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {cust.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-violet-600" />
                          <span>{cust.phone}</span>
                        </span>
                        {cust.email && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{cust.email}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="uppercase text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {cust.preferredLang || 'en'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[11px] font-bold" title="SOS Dispatches">
                          <Fuel className="w-3 h-3 text-red-500" />
                          <span>{cust._count?.dispatches || 0}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold" title="RFQ Quotations">
                          <FileText className="w-3 h-3 text-blue-500" />
                          <span>{cust._count?.rfqs || 0}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold" title="Subscriptions">
                          <ShoppingBag className="w-3 h-3 text-emerald-500" />
                          <span>{cust._count?.subscriptions || 0}</span>
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right text-slate-500 text-[11px]">
                      {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
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

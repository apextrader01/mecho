'use client';

import React from 'react';

export default function EcosystemSwitcher({ current = 'vendor' }: { current?: 'customer' | 'vendor' | 'admin' }) {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs px-3 sm:px-6 py-1.5 flex items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-slate-100 tracking-tight">ShortEdge Unified</span>
        <span className="text-slate-500 hidden sm:inline font-mono">| Partner Mode</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <a
          href="/"
          className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
            current === 'customer'
              ? 'bg-orange-600 text-white shadow-sm ring-1 ring-orange-400/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>📱</span>
          <span>Customer App</span>
        </a>
        <a
          href="/vendor"
          className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
            current === 'vendor'
              ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🛵</span>
          <span>Partner App</span>
        </a>
        <a
          href="/admin"
          className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
            current === 'admin'
              ? 'bg-violet-600 text-white shadow-sm ring-1 ring-violet-400/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🎛️</span>
          <span>Admin Command</span>
        </a>
      </div>
    </div>
  );
}

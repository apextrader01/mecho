'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import {
  Fuel,
  Wrench,
  Pill,
  PackageCheck,
  Truck,
  Paintbrush,
  Armchair,
  Car,
  ShoppingBag,
  CalendarDays,
  UserCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

// Icon Map
const iconMap: Record<string, any> = {
  Fuel,
  Wrench,
  Pill,
  PackageCheck,
  Truck,
  Paintbrush,
  Armchair,
  Car,
  ShoppingBag,
  CalendarSync: CalendarDays,
  UserCheck
};

interface CategoryGridProps {
  onSelectCategory: (category: any) => void;
  openSosModal: (type: 'fuel' | 'puncture') => void;
}

export default function CategoryGrid({ onSelectCategory, openSosModal }: CategoryGridProps) {
  const { lang, t } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [activeEngineFilter, setActiveEngineFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiRequest('/categories');
        if (res.success && res.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (activeEngineFilter === 'ALL') return true;
    return cat.engineType === activeEngineFilter;
  });

  const getEngineBadge = (engineType: string) => {
    switch (engineType) {
      case 'ENGINE_A_DISPATCH':
        return { label: 'Instant Dispatch (A)', bg: 'bg-red-50 text-red-600 border-red-200' };
      case 'ENGINE_B_QUOTE':
        return { label: 'Multi-Quote (B)', bg: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'ENGINE_C_COMMERCE':
      case 'ENGINE_C_SUBSCRIPTION':
      case 'ENGINE_C_APPOINTMENT':
        return { label: 'Commerce & Subs (C)', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      default:
        return { label: 'Service', bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t.allServices}</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
              15+ Hyperlocal
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Unified across 3 engines: Instant Dispatch, Multi-Quote RFQ & Daily Subscriptions
          </p>
        </div>

        {/* Engine Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Engines' },
            { id: 'ENGINE_A_DISPATCH', label: '🚨 Instant (A)' },
            { id: 'ENGINE_B_QUOTE', label: '📋 Compare Quotes (B)' },
            { id: 'ENGINE_C_SUBSCRIPTION', label: '🥛 Daily Subs (C)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveEngineFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeEngineFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredCategories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Sparkles;
            const badge = getEngineBadge(cat.engineType);

            return (
              <div
                key={cat.id}
                onClick={() => {
                  if (cat.slug === 'emergency-fuel') {
                    openSosModal('fuel');
                  } else if (cat.slug === 'roadside-puncture') {
                    openSosModal('puncture');
                  } else {
                    onSelectCategory(cat);
                  }
                }}
                className="group relative bg-white border border-slate-200 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/5 p-4 rounded-2xl cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-600 text-orange-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-orange-600 transition-colors leading-tight mb-1">
                    {lang === 'hi' ? cat.nameHi : cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="text-orange-600">
                    {cat.basePrice > 0 ? `From ₹${cat.basePrice}` : 'Free Quotes'}
                  </span>
                  <span className="flex items-center text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all">
                    Book <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  Zap,
  Droplets,
  Wind,
  Sparkles,
  Search,
  ChevronRight,
  ShieldAlert,
  Flame,
  CheckCircle2
} from 'lucide-react';

import { SosModalType } from './SosSection';

// Icon Map for all 15 services
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
  UserCheck,
  Zap,
  Droplets,
  Wind,
  Sparkles
};

// Fallback canonical 15 services if network is slow
const CANONICAL_15_SERVICES = [
  { id: '1', slug: 'emergency-fuel', name: 'Emergency Highway Fuel Delivery', nameHi: 'आपातकालीन पेट्रोल/डीजल', icon: 'Fuel', engineType: 'ENGINE_A_DISPATCH', basePrice: 150, description: '2-5 Litres emergency reach-to-pump petrol or diesel runner with safety check' },
  { id: '2', slug: 'roadside-puncture', name: '24/7 Roadside Assistance & Tyre Puncture', nameHi: '24/7 पंक्चर व रोडसाइड', icon: 'Wrench', engineType: 'ENGINE_A_DISPATCH', basePrice: 200, description: 'On-site mobile puncture repair, battery jumpstart, key lockout & towing assist' },
  { id: '3', slug: 'emergency-pharmacy', name: '24/7 Emergency Pharmacy & Night Chemist', nameHi: '24/7 आपातकालीन दवाइयाँ', icon: 'Pill', engineType: 'ENGINE_A_DISPATCH', basePrice: 60, description: 'Prescription medicines delivered in 30 mins from open late-night medical stores' },
  { id: '4', slug: 'local-genie', name: 'Local Genie (Pickup & Drop Courier)', nameHi: 'लोकल पार्सल पिकअप व ड्राप', icon: 'PackageCheck', engineType: 'ENGINE_A_DISPATCH', basePrice: 50, description: 'Point-to-point courier for documents, keys, chargers, lunch tiffins & packages' },
  { id: '5', slug: 'goods-auto-booking', name: 'Mini-Truck & Goods Auto (Tata Ace)', nameHi: 'छोटा हाथी व लोडिंग ऑटो', icon: 'Truck', engineType: 'ENGINE_A_DISPATCH', basePrice: 350, description: 'Tata Ace (Chota Hathi), Ape Auto 3-Wheeler for house shifting, cargo & furniture' },
  { id: '6', slug: 'acting-drivers', name: 'Acting Drivers on Call', nameHi: 'ड्राइवर ऑन कॉल (प्रति घंटा)', icon: 'UserCheck', engineType: 'ENGINE_A_DISPATCH', basePrice: 150, description: 'Verified drivers for personal manual/automatic cars for city, night & outstation' },
  { id: '7', slug: 'electrician-services', name: '24/7 Electrician & Power Breakdown', nameHi: '24/7 इलेक्ट्रीशियन व बिजली', icon: 'Zap', engineType: 'ENGINE_A_DISPATCH', basePrice: 149, description: 'Short circuit emergency, MCB tripping, fan/wiring replacement & outage repair' },
  { id: '8', slug: 'plumbing-services', name: 'Emergency Plumber & Leak Repair', nameHi: 'आपातकालीन प्लंबर व लीकेज', icon: 'Droplets', engineType: 'ENGINE_A_DISPATCH', basePrice: 149, description: 'Burst pipe repair, leaking taps, water pump motor fixing & drain unblocking' },
  { id: '9', slug: 'ac-appliance-repair', name: 'AC Service, Gas Refill & Appliances', nameHi: 'एसी सर्विसिंग व घरेलू उपकरण', icon: 'Wind', engineType: 'ENGINE_B_QUOTE', basePrice: 0, description: 'Split/Window AC deep foam jet cleaning, cooling gas refill & appliance repairs' },
  { id: '10', slug: 'painting-services', name: 'House Paint & Wall Textures', nameHi: 'घर की पुताई व डिस्टेंपर', icon: 'Paintbrush', engineType: 'ENGINE_B_QUOTE', basePrice: 0, description: 'Itemized bidding for 1BHK/2BHK/Villa painting, textures & waterproofing' },
  { id: '11', slug: 'furniture-interiors', name: 'Custom Carpentry & Modular Interiors', nameHi: 'कस्टम फर्नीचर व बढ़ई कार्य', icon: 'Armchair', engineType: 'ENGINE_B_QUOTE', basePrice: 0, description: 'Modular kitchen, wardrobes, wooden tables & customized interior woodcraft' },
  { id: '12', slug: 'vehicle-servicing', name: 'Car Denting, Painting & Bodywork', nameHi: 'गाड़ी डेंटिंग व पेंटिंग', icon: 'Car', engineType: 'ENGINE_B_QUOTE', basePrice: 0, description: 'Upload damage photos to get transparent itemized bids from verified body shops' },
  { id: '13', slug: 'cleaning-pest-control', name: 'Deep House Cleaning & Pest Control', nameHi: 'घर की डीप क्लीनिंग', icon: 'Sparkles', engineType: 'ENGINE_B_QUOTE', basePrice: 0, description: 'Bathroom deep disinfection, kitchen degreasing, sofa shampoo & pest control' },
  { id: '14', slug: 'kirana-grocery', name: 'Local Kirana & Supermarket Delivery', nameHi: 'नजदीकी किराना दुकान', icon: 'ShoppingBag', engineType: 'ENGINE_C_COMMERCE', basePrice: 30, description: 'Daily provisions, pulses, rice, spices & groceries delivered in 45 mins' },
  { id: '15', slug: 'daily-subscriptions', name: 'Daily Water (20L Can) & Milk Subscriptions', nameHi: 'दैनिक दूध व 20L पानी कैन', icon: 'CalendarSync', engineType: 'ENGINE_C_SUBSCRIPTION', basePrice: 0, description: 'Automated 6:00 AM – 8:00 AM doorstep delivery of 20L water cans & fresh milk' }
];

interface CategoryGridProps {
  onSelectCategory: (category: any) => void;
  openSosModal: (type: SosModalType) => void;
}

export default function CategoryGrid({ onSelectCategory, openSosModal }: CategoryGridProps) {
  const { lang, t } = useAuth();
  const [categories, setCategories] = useState<any[]>(CANONICAL_15_SERVICES);
  const [activeEngineFilter, setActiveEngineFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiRequest('/categories');
        if (res.success && res.categories && res.categories.length > 0) {
          // Deduplicate alias slugs (e.g. genie-pickup-drop vs local-genie)
          const seen = new Set<string>();
          const deduped: any[] = [];
          for (const c of res.categories) {
            const key = c.name.toLowerCase().trim();
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(c);
            }
          }
          if (deduped.length >= 10) {
            setCategories(deduped);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Filter by Engine & Search Query
  const filteredCategories = categories.filter((cat) => {
    // Engine Filter
    if (activeEngineFilter === 'INSTANT' && cat.engineType !== 'ENGINE_A_DISPATCH') return false;
    if (activeEngineFilter === 'RFQ' && cat.engineType !== 'ENGINE_B_QUOTE') return false;
    if (activeEngineFilter === 'COMMERCE' && !cat.engineType?.startsWith('ENGINE_C')) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = cat.name?.toLowerCase().includes(q);
      const matchNameHi = cat.nameHi?.toLowerCase().includes(q);
      const matchDesc = cat.description?.toLowerCase().includes(q);
      const matchSlug = cat.slug?.toLowerCase().includes(q);
      if (!matchName && !matchNameHi && !matchDesc && !matchSlug) return false;
    }

    return true;
  });

  const getEngineBadge = (engineType: string) => {
    switch (engineType) {
      case 'ENGINE_A_DISPATCH':
        return { label: '15-Min SOS', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'ENGINE_B_QUOTE':
        return { label: 'Compare Quotes', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'ENGINE_C_COMMERCE':
      case 'ENGINE_C_SUBSCRIPTION':
      case 'ENGINE_C_APPOINTMENT':
        return { label: 'Commerce & Subs', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Service', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const handleCardClick = (cat: any) => {
    if (cat.slug === 'emergency-fuel') {
      openSosModal('fuel');
    } else if (cat.slug === 'roadside-puncture') {
      openSosModal('puncture');
    } else if (cat.slug === 'emergency-pharmacy') {
      openSosModal('pharmacy');
    } else if (cat.slug === 'local-genie' || cat.slug === 'genie-pickup-drop') {
      openSosModal('genie');
    } else if (cat.slug === 'goods-auto-booking') {
      openSosModal('truck');
    } else if (cat.slug === 'acting-drivers') {
      openSosModal('driver');
    } else if (cat.slug === 'electrician-services') {
      openSosModal('electrician');
    } else if (cat.slug === 'plumbing-services') {
      openSosModal('plumber');
    } else {
      onSelectCategory(cat);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                All 15 Hyperlocal Services
              </h2>
              <span className="text-[10px] bg-gradient-to-r from-orange-600 to-amber-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm">
                Top 15 Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tap any service to dispatch instant emergency runners, receive 3+ quotes, or order daily essentials.
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (e.g. AC, Puncture, Electrician, Fuel, Driver...)"
              className="w-full text-xs pl-9 pr-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Engine Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: `🌟 All Services (${categories.length})` },
            { id: 'INSTANT', label: '🚨 24/7 Rapid SOS (8)' },
            { id: 'RFQ', label: '📋 Compare Quotes (5)' },
            { id: 'COMMERCE', label: '🛒 Daily & Subs (2)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveEngineFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                activeEngineFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 15 Services */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {filteredCategories.map((cat, idx) => {
          const IconComponent = iconMap[cat.icon] || Sparkles;
          const badge = getEngineBadge(cat.engineType);

          return (
            <div
              key={cat.slug || cat.id || idx}
              onClick={() => handleCardClick(cat)}
              className="group relative bg-white border border-slate-200 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 p-3.5 sm:p-4 rounded-3xl cursor-pointer transition-all duration-200 flex flex-col justify-between active:scale-[0.98]"
            >
              <div>
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 group-hover:bg-orange-600 text-orange-600 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors leading-snug line-clamp-2">
                  {lang === 'hi' ? cat.nameHi : cat.name}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                  {cat.description}
                </p>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-black">
                <span className="text-orange-600">
                  {cat.basePrice > 0 ? `₹${cat.basePrice}` : 'Free Bids'}
                </span>
                <span className="inline-flex items-center gap-0.5 text-slate-400 group-hover:text-orange-600 font-bold group-hover:translate-x-0.5 transition-all">
                  <span>Book</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
          <p className="text-sm font-bold text-slate-600">No services match &ldquo;{searchQuery}&rdquo;</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveEngineFilter('ALL'); }}
            className="mt-2 text-xs text-orange-600 font-black hover:underline"
          >
            Clear filters and view all 15 services
          </button>
        </div>
      )}
    </div>
  );
}

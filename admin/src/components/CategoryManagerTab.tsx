'use client';

import React, { useState, useEffect } from 'react';
import { adminApiRequest } from '../lib/api';
import { Settings, Save, CheckCircle, Sparkles } from 'lucide-react';

export default function CategoryManagerTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  // Form edit state
  const [editBasePrice, setEditBasePrice] = useState('150');
  const [editDayFee, setEditDayFee] = useState('150');
  const [editNightFee, setEditNightFee] = useState('250');
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApiRequest('/categories');
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const startEdit = (cat: any) => {
    setEditingSlug(cat.slug);
    setEditBasePrice(String(cat.basePrice || 0));
    setEditDayFee(String(cat.metadata?.dayFee || 150));
    setEditNightFee(String(cat.metadata?.nightFee || 250));
  };

  const handleSave = async (cat: any) => {
    try {
      setSaving(true);
      const updatedMetadata = {
        ...cat.metadata,
        dayFee: parseFloat(editDayFee),
        nightFee: parseFloat(editNightFee)
      };

      const res = await adminApiRequest('/categories/upsert', {
        method: 'POST',
        body: JSON.stringify({
          slug: cat.slug,
          name: cat.name,
          nameHi: cat.nameHi,
          description: cat.description,
          icon: cat.icon,
          engineType: cat.engineType,
          basePrice: parseFloat(editBasePrice),
          pricingUnit: cat.pricingUnit,
          metadata: updatedMetadata
        })
      });

      if (res.success) {
        alert(`Pricing rules updated for ${cat.name}!`);
        setEditingSlug(null);
        loadCategories();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
          Dynamic Category & Day/Night Runner Pricing Manager ({categories.length})
        </h3>
        <p className="text-xs text-slate-500">
          Configure baseline fees, night emergency multipliers (10 PM to 6 AM), and dynamic intake schemas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const isEditing = editingSlug === cat.slug;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest bg-violet-50 px-2 py-0.5 rounded-full">
                    {cat.engineType}
                  </span>
                  <h4 className="font-black text-sm text-slate-900 mt-1">
                    {cat.name} ({cat.nameHi})
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                </div>
              </div>

              {isEditing ? (
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Base Price (₹)
                      </label>
                      <input
                        type="number"
                        value={editBasePrice}
                        onChange={(e) => setEditBasePrice(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Day Fee (₹)
                      </label>
                      <input
                        type="number"
                        value={editDayFee}
                        onChange={(e) => setEditDayFee(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Night Fee (₹)
                      </label>
                      <input
                        type="number"
                        value={editNightFee}
                        onChange={(e) => setEditNightFee(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setEditingSlug(null)}
                      className="py-1.5 px-3 rounded-xl border text-xs font-bold text-slate-600 bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(cat)}
                      disabled={saving}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-violet-600 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all"
                    >
                      {saving ? 'Saving...' : 'Save Pricing'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-3 text-xs flex justify-between items-center text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pricing Configuration</span>
                    <span className="font-bold">
                      Base: ₹{cat.basePrice} | Day: ₹{cat.metadata?.dayFee || 150} | Night: ₹{cat.metadata?.nightFee || 250}
                    </span>
                  </div>
                  <button
                    onClick={() => startEdit(cat)}
                    className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Edit Fees
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

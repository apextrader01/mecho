'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import {
  ShoppingBag,
  CalendarDays,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Sparkles,
  Droplet,
  Milk,
  ArrowRight,
  ShieldCheck,
  Pause,
  Play
} from 'lucide-react';

interface CommerceSectionProps {
  initialSubTab?: 'catalog' | 'subscriptions';
  triggerSubModal?: boolean;
}

export default function CommerceSection({ initialSubTab, triggerSubModal }: CommerceSectionProps) {
  const { user, t, userCoords, lang } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'subscriptions'>(initialSubTab || 'subscriptions');
  const [products, setProducts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // New Subscription Modal State
  const [showSubModal, setShowSubModal] = useState(false);
  const [subProductId, setSubProductId] = useState('');
  const [frequency, setFrequency] = useState('DAILY');
  const [timeSlot, setTimeSlot] = useState('06:00 AM - 08:00 AM');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
    if (triggerSubModal) {
      setShowSubModal(true);
    }
  }, [initialSubTab, triggerSubModal]);

  const loadCommerceData = async () => {
    try {
      const [prodsRes, subsRes] = await Promise.all([
        apiRequest('/commerce/products'),
        apiRequest('/commerce/subscriptions/my')
      ]);

      if (prodsRes.success) setProducts(prodsRes.products);
      if (subsRes.success) setSubscriptions(subsRes.subscriptions);

      if (prodsRes.products?.length > 0 && !subProductId) {
        setSubProductId(prodsRes.products[0].id);
      }
    } catch (err) {
      console.error('Error fetching commerce data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommerceData();
  }, []);

  const addToCart = (prodId: string) => {
    setCart(prev => ({ ...prev, [prodId]: (prev[prodId] || 0) + 1 }));
  };

  const removeFromCart = (prodId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[prodId] > 1) {
        updated[prodId] -= 1;
      } else {
        delete updated[prodId];
      }
      return updated;
    });
  };

  const handleCheckout = async () => {
    const items = Object.entries(cart).map(([prodId, qty]) => {
      const prod = products.find(p => p.id === prodId)!;
      return {
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        qty,
        total: prod.price * qty
      };
    });

    if (items.length === 0) return;

    try {
      const vendorId = products.find(p => p.id === items[0].productId)?.vendorId;
      const res = await apiRequest('/commerce/orders', {
        method: 'POST',
        body: JSON.stringify({
          vendorId,
          items,
          deliveryAddress: userCoords.address,
          deliveryLat: userCoords.lat,
          deliveryLng: userCoords.lng,
          paymentMode: 'UPI'
        })
      });

      if (res.success) {
        alert(`Order placed successfully! Delivery OTP is: ${res.order.deliveryOtp}`);
        setCart({});
      }
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const chosenProd = products.find(p => p.id === subProductId);
      if (!chosenProd) return;

      const res = await apiRequest('/commerce/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          vendorId: chosenProd.vendorId,
          productId: chosenProd.id,
          frequency,
          timeSlot,
          quantityPerDelivery: quantity,
          deliveryAddress: userCoords.address,
          deliveryLat: userCoords.lat,
          deliveryLng: userCoords.lng
        })
      });

      if (res.success) {
        alert('Daily delivery subscription activated!');
        setShowSubModal(false);
        loadCommerceData();
      }
    } catch (err: any) {
      alert(err.message || 'Subscription failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubPause = async (subId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await apiRequest(`/commerce/subscriptions/${subId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.success) {
        loadCommerceData();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const cartTotal = Object.entries(cart).reduce((sum, [prodId, qty]) => {
    const p = products.find(prod => prod.id === prodId);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  return (
    <div className="mb-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white mb-6 shadow-xl shadow-emerald-500/10">
        <div className="max-w-2xl">
          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
            Engine C: Hyperlocal Commerce & Daily Recurring Deliveries
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
            {t.kiranaTitle}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            {t.kiranaDesc}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setShowSubModal(true)}
              className="bg-white text-emerald-900 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              <span>{t.subscribeNow} (20L Water / Milk)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toggle View */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('subscriptions')}
          className={`pb-1 text-sm font-extrabold flex items-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'subscriptions'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>My Daily Subscriptions ({subscriptions.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`pb-1 text-sm font-extrabold flex items-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'catalog'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Kirana Catalog & Cart ({Object.keys(cart).length})</span>
        </button>
      </div>

      {/* VIEW 1: ACTIVE SUBSCRIPTIONS */}
      {activeSubTab === 'subscriptions' && (
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <div className="p-10 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No active subscriptions. Tap "Subscribe Daily" to automate your morning 20L water cans or fresh milk!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((sub) => {
                const isWater = sub.product?.unit?.toLowerCase().includes('can');
                const isPaused = sub.status === 'PAUSED';

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            isWater ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {isWater ? <Droplet className="w-6 h-6" /> : <Milk className="w-6 h-6" />}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {sub.subNumber}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                              {lang === 'hi' ? sub.product?.nameHi || sub.product?.name : sub.product?.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {sub.vendor?.businessName}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isPaused
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800 animate-pulse'
                        }`}>
                          {sub.status}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-1 mb-4">
                        <div className="flex justify-between text-slate-600">
                          <span>Delivery Schedule:</span>
                          <span className="font-bold text-slate-900">{sub.frequency}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Morning Time Slot:</span>
                          <span className="font-bold text-slate-900">{sub.timeSlot}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Quantity per Day:</span>
                          <span className="font-bold text-slate-900">
                            {sub.quantityPerDelivery} {sub.product?.unit}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                          <span>Delivery Address:</span>
                          <span className="font-medium text-slate-800 truncate max-w-[200px]">
                            {sub.deliveryAddress}
                          </span>
                        </div>
                      </div>

                      {/* Recent Delivery Proof Log */}
                      {sub.deliveries?.length > 0 && (
                        <div className="mb-4 text-xs">
                          <span className="font-bold text-slate-700 block mb-1">
                            Latest Delivery Verification:
                          </span>
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Delivered this morning</span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded shadow-xs">
                              OTP: {sub.deliveries[0].deliveryOtp || '4821'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleSubPause(sub.id, sub.status)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                          isPaused
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {isPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Resume Delivery</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause for Vacation</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KIRANA CATALOG & CART */}
      {activeSubTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{prod.category?.name}</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      In Stock
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {lang === 'hi' ? prod.nameHi || prod.name : prod.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {prod.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-black text-base text-slate-900">₹{prod.price}</span>
                    <span className="text-xs text-slate-400"> / {prod.unit}</span>
                  </div>

                  {cart[prod.id] ? (
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-2 py-1 rounded-xl">
                      <button
                        onClick={() => removeFromCart(prod.id)}
                        className="p-1 rounded text-orange-600 hover:bg-orange-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black text-orange-700 min-w-[16px] text-center">
                        {cart[prod.id]}
                      </span>
                      <button
                        onClick={() => addToCart(prod.id)}
                        className="p-1 rounded text-orange-600 hover:bg-orange-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(prod.id)}
                      className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm h-fit">
            <h3 className="font-black text-sm text-slate-900 mb-3 flex items-center justify-between">
              <span>Checkout Cart</span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                {Object.keys(cart).length} Items
              </span>
            </h3>

            {Object.keys(cart).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                Cart is empty. Add kirana provisions or dairy milk to checkout!
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 text-xs">
                  {Object.entries(cart).map(([prodId, qty]) => {
                    const prod = products.find(p => p.id === prodId)!;
                    return (
                      <div key={prodId} className="flex justify-between items-center text-slate-700">
                        <span className="truncate max-w-[180px]">{prod.name} (x{qty})</span>
                        <span className="font-bold">₹{prod.price * qty}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Hyperlocal Delivery:</span>
                    <span>{cartTotal > 500 ? 'FREE' : '₹30'}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
                    <span>Grand Total:</span>
                    <span className="text-orange-600">
                      ₹{cartTotal + (cartTotal > 500 ? 0 : 30)}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                  📍 Delivering to: <strong>{userCoords.address}</strong>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 rounded-2xl shadow-md text-xs active:scale-95 transition-all"
                >
                  Pay via UPI / COD & Generate Delivery OTP
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Creator Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-extrabold text-lg text-slate-900 mb-1">
              Start Daily Morning Subscription
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Get factory-sealed 20L mineral water cans and fresh dairy milk delivered before 8:00 AM.
            </p>

            <form onSubmit={handleCreateSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Product</label>
                <select
                  value={subProductId}
                  onChange={(e) => setSubProductId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price} / {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="DAILY">Daily (Every Day)</option>
                    <option value="ALTERNATE_DAYS">Alternate Days</option>
                    <option value="WEEKDAYS_ONLY">Monday to Friday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time Slot</label>
                <div className="grid grid-cols-2 gap-2">
                  {['06:00 AM - 08:00 AM', '06:00 PM - 08:00 PM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                        timeSlot === slot
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all"
                >
                  {submitting ? 'Activating...' : 'Activate Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

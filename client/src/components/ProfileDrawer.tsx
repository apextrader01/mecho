'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  LogOut,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  FileText,
  Fuel,
  Edit2
} from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function ProfileDrawer({ isOpen, onClose, onOpenLogin }: ProfileDrawerProps) {
  const { user, logout, updateProfile, userCoords, setUserCoords, loginAsDemoUser, t } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(userCoords.address);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const res = await updateProfile({
      name,
      email: email || undefined
    });

    if (address !== userCoords.address) {
      setUserCoords({
        ...userCoords,
        address
      });
    }

    setSaving(false);
    if (res.success) {
      setStatusMsg('Profile updated successfully!');
      setEditing(false);
    } else {
      setStatusMsg(res.error || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center font-black text-sm">
                SE
              </span>
              <div>
                <h3 className="font-extrabold text-base tracking-tight">Customer Account</h3>
                <p className="text-[11px] text-slate-400">ShortEdge Hyperlocal Network</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* User Profile Card */}
            <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100/50 rounded-3xl p-5 border border-orange-200/60 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                    {user?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-lg text-slate-900 tracking-tight">
                        {user?.name || 'Guest User'}
                      </h4>
                      <span className="p-0.5 rounded-full bg-emerald-500 text-white">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-orange-600" />
                      <span>{user?.phone || 'No phone linked'}</span>
                    </p>
                    {user?.email && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{user.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditing(!editing);
                    setName(user?.name || '');
                    setEmail(user?.email || '');
                  }}
                  className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 shadow-sm border border-orange-200/60 text-xs font-bold transition-all"
                  title="Edit Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Verified Badge */}
              <div className="mt-4 pt-3 border-t border-orange-200/60 flex items-center justify-between text-xs">
                <span className="text-[10px] uppercase font-black tracking-widest text-orange-800 bg-orange-200/80 px-2.5 py-0.5 rounded-full">
                  Verified Local Citizen
                </span>
                <span className="text-slate-500 text-[11px] font-medium">Bangalore Hub</span>
              </div>
            </div>

            {/* Status Alert */}
            {statusMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* Edit Profile Form (If Open) */}
            {editing && (
              <form onSubmit={handleSaveProfile} className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-3">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                  Update Account Info
                </h5>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Default GPS Delivery Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Quick Live Stats */}
            <div>
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-3">
                Your Activity Across 3 Engines
              </h5>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                  <span className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-1">
                    <Fuel className="w-4 h-4" />
                  </span>
                  <span className="text-xl font-black text-slate-900 block leading-tight">
                    {user?.stats?.dispatchesCount ?? 4}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">SOS Dispatches</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-1">
                    <FileText className="w-4 h-4" />
                  </span>
                  <span className="text-xl font-black text-slate-900 block leading-tight">
                    {user?.stats?.rfqsCount ?? 1}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">RFQ Projects</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                  <span className="text-xl font-black text-slate-900 block leading-tight">
                    {user?.stats?.subsCount ?? 2}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">Subscriptions</span>
                </div>
              </div>
            </div>

            {/* Current Active Location Card */}
            <div>
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Active Hyperlocal GPS Delivery Pin
              </h5>
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-xs text-slate-900 block">
                    {userCoords.address}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Lat: {userCoords.lat.toFixed(4)}, Lng: {userCoords.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Switch Account / Demo Profiles */}
            <div>
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Switch Customer Account
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    await loginAsDemoUser('rahul.sharma@gmail.com');
                    onClose();
                  }}
                  className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                    user?.email === 'rahul.sharma@gmail.com'
                      ? 'bg-orange-50 border-orange-300 font-bold text-orange-950'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-black block">Rahul Sharma</span>
                  <span className="text-[10px] text-slate-400 block truncate">+91 98765 43210</span>
                </button>

                <button
                  onClick={async () => {
                    await loginAsDemoUser('priya.iyer@gmail.com');
                    onClose();
                  }}
                  className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                    user?.email === 'priya.iyer@gmail.com'
                      ? 'bg-orange-50 border-orange-300 font-bold text-orange-950'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-black block">Priya Iyer</span>
                  <span className="text-[10px] text-slate-400 block truncate">+91 98765 43211</span>
                </button>
              </div>
            </div>

            {/* ShortEdge Ecosystem / Mode Switcher */}
            <div>
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-2">
                ShortEdge Ecosystem Portals
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/vendor"
                  className="p-2.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 hover:bg-sky-100 transition-all flex items-center gap-2"
                >
                  <span className="text-xl">🛵</span>
                  <div>
                    <span className="font-black text-xs block">Partner App</span>
                    <span className="text-[10px] text-sky-700 block">Vendor & Runner</span>
                  </div>
                </a>

                <a
                  href="/admin"
                  className="p-2.5 rounded-2xl bg-violet-50 border border-violet-200 text-violet-900 hover:bg-violet-100 transition-all flex items-center gap-2"
                >
                  <span className="text-xl">🎛️</span>
                  <div>
                    <span className="font-black text-xs block">Admin Command</span>
                    <span className="text-[10px] text-violet-700 block">City Operations</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="flex-1 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs shadow-sm transition-colors text-center"
            >
              Sign In with Another Phone
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

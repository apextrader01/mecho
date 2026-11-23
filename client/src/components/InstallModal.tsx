'use client';

import React, { useState } from 'react';
import { Smartphone, Download, X, CheckCircle, ShieldCheck, ArrowRight, Share2, MoreVertical, Bell, Camera } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallDirect: () => void;
}

export default function InstallModal({ isOpen, onClose, deferredPrompt, onInstallDirect }: InstallModalProps) {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'apk'>('android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Install ShortEdge App</h3>
              <p className="text-orange-100 text-xs">Run as a standalone app with camera & push notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Instant Install if Browser Prompt Ready */}
        {deferredPrompt && (
          <div className="p-4 bg-orange-50/70 border-b border-orange-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-orange-950 font-medium">
              <ShieldCheck className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>One-tap native installation is ready for your browser!</span>
            </div>
            <button
              onClick={() => {
                onInstallDirect();
                onClose();
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className="flex border-b border-slate-100 text-xs font-bold text-slate-500 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'android'
                ? 'border-orange-600 text-orange-600 bg-white'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>🤖 Android (Chrome)</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ios'
                ? 'border-orange-600 text-orange-600 bg-white'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>🍎 iPhone (Safari)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'apk'
                ? 'border-orange-600 text-orange-600 bg-white'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>📦 Android APK</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-extrabold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    Open Menu in Chrome <MoreVertical className="w-4 h-4 text-slate-400" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tap the 3 dots (<span className="font-bold">⋮</span>) at the top-right corner of Google Chrome.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-extrabold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Tap &quot;Install App&quot; or &quot;Add to Home screen&quot;
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select <span className="font-bold text-orange-700">Install app</span> from the menu list. Android will immediately add the ShortEdge app icon to your phone&apos;s home screen and app launcher.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-extrabold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Launch like a Real Native App
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tap the ShortEdge icon on your home screen. It opens full screen with zero browser bars, instant camera access, and emergency sound alerts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-extrabold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    Tap the Share Button <Share2 className="w-4 h-4 text-blue-500" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    At the bottom bar of Safari on your iPhone, tap the square Share button with an upward arrow.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-extrabold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Select &quot;Add to Home Screen&quot;
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Scroll down the action sheet and tap <span className="font-bold text-slate-800">Add to Home Screen</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-extrabold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Tap &quot;Add&quot; at Top Right
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confirm by tapping <span className="font-bold text-blue-600">Add</span>. The ShortEdge app icon is instantly placed alongside WhatsApp and Instagram!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-orange-600" />
                  <span>Native Capacitor Android Build</span>
                </div>
                <p>
                  The project includes a ready-to-compile Android project located in <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">client/android</code>.
                </p>
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                  <p>• <strong>Package:</strong> in.shortedge.app</p>
                  <p>• <strong>Target SDK:</strong> Android 14 (API 34)</p>
                  <p>• <strong>Permissions:</strong> CAMERA, VIBRATE, POST_NOTIFICATIONS, ACCESS_FINE_LOCATION</p>
                </div>
              </div>

              <div className="bg-orange-50/60 p-3.5 rounded-2xl border border-orange-200 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-orange-950">GitHub Actions Auto-Build</div>
                  <div className="text-[11px] text-orange-800">Compiled .apk generated on GitHub</div>
                </div>
                <a
                  href="https://github.com/apextrader01/mecho/actions"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1 flex-shrink-0"
                >
                  <span>View APKs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Feature Badges */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-600 flex flex-col items-center gap-1">
              <Camera className="w-4 h-4 text-orange-600" />
              <span className="font-semibold">Camera Access</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-600 flex flex-col items-center gap-1">
              <Bell className="w-4 h-4 text-orange-600" />
              <span className="font-semibold">Emergency Siren</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-600 flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">4-Digit OTPs</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

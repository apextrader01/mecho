'use client';

import React, { useState, useEffect } from 'react';
import { VendorDeviceSensorService } from '../lib/deviceSensors';
import { Bell, Smartphone, X, Volume2, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function VendorInstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/vendor/sw.js', { scope: '/vendor/' })
        .then((reg) => console.log('ShortEdge Vendor PWA ServiceWorker registered:', reg.scope))
        .catch((err) => console.log('Vendor ServiceWorker registration error:', err));
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('To install Partner Console on your phone:\n1. Open browser menu (⋮ on Chrome or Share on Safari)\n2. Tap "Install App" or "Add to Home Screen".');
    }
  };

  const handleEnableAlerts = async () => {
    const granted = await VendorDeviceSensorService.requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) {
      VendorDeviceSensorService.sendDispatchNotification(
        'SE Partner Radar Active',
        'Emergency sound siren and haptic vibration enabled for incoming dispatches.'
      );
    } else {
      VendorDeviceSensorService.playSirenAlert();
      VendorDeviceSensorService.triggerVibration();
    }
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white text-xs px-4 py-2 border-b border-sky-500/20 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-600/30 text-sky-400">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </span>
          <span className="font-semibold text-slate-200">
            Runner Phone Tools: Install App & Turn On Siren Alerts
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!notifGranted ? (
            <button
              onClick={handleEnableAlerts}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all shadow-sm active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Dispatch Siren & Vibration</span>
            </button>
          ) : (
            <button
              onClick={() => {
                VendorDeviceSensorService.playSirenAlert();
                VendorDeviceSensorService.triggerVibration();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold transition-all text-[11px]"
              title="Test Siren"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Siren Active (Test 🔊)</span>
            </button>
          )}

          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-all active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>Install Partner App</span>
          </button>

          <button
            onClick={() => setShowBanner(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

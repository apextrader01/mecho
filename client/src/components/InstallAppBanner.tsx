'use client';

import React, { useState, useEffect } from 'react';
import { DeviceSensorService } from '../lib/deviceSensors';
import { Bell, Smartphone, X, Volume2, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [notifGranted, setNotifGranted] = useState(false);
  const [alertActive, setAlertActive] = useState(false);

  useEffect(() => {
    // Check Notification status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }

    // Capture PWA install prompt
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
      alert('To install this app on your phone:\n1. Tap your browser menu (⋮ on Chrome or Share on Safari)\n2. Select "Add to Home Screen" or "Install App".');
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await DeviceSensorService.requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) {
      setAlertActive(true);
      DeviceSensorService.playChime('success');
      DeviceSensorService.sendPushNotification('ShortEdge Notifications Active', {
        body: 'You will receive instant alerts for emergency dispatches, OTPs, and partner messages.'
      });
      setTimeout(() => setAlertActive(false), 4000);
    } else {
      DeviceSensorService.playChime('sos');
    }
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-amber-950 text-white text-xs px-4 py-2 border-b border-orange-500/20 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-orange-600/30 text-orange-400">
            <Smartphone className="w-4 h-4" />
          </span>
          <span className="font-semibold text-slate-200">
            Install ShortEdge App & Enable Push Alerts on your phone:
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Enable Notifications Button */}
          {!notifGranted ? (
            <button
              onClick={handleEnableNotifications}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-sm active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Allow Push & Chimes</span>
            </button>
          ) : (
            <button
              onClick={() => DeviceSensorService.playChime('sos')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold transition-all text-[11px]"
              title="Test Sound Siren"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Alerts Active (Test Sound 🔊)</span>
            </button>
          )}

          {/* Install PWA Button */}
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-all active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-orange-400" />
            <span>Install App</span>
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

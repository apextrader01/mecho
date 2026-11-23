'use client';

import React, { useState, useEffect } from 'react';
import { DeviceSensorService } from '../lib/deviceSensors';
import { Bell, Smartphone, X, CheckCircle2, Download } from 'lucide-react';
import InstallModal from './InstallModal';

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    // Check Notification status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }

    // Register Service Worker for PWA installability
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('ShortEdge PWA ServiceWorker registered:', reg.scope))
        .catch((err) => console.log('ServiceWorker registration error:', err));
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
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (err) {
        setInstallModalOpen(true);
      }
    } else {
      setInstallModalOpen(true);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await DeviceSensorService.requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) {
      DeviceSensorService.playChime('success');
      DeviceSensorService.sendPushNotification('ShortEdge Notifications Active', {
        body: 'You will receive instant alerts for emergency dispatches, OTPs, and partner messages.'
      });
    } else {
      DeviceSensorService.playChime('sos');
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-amber-950 text-white text-xs px-4 py-2 border-b border-orange-500/20 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-600/30 text-orange-400">
              <Smartphone className="w-4 h-4" />
            </span>
            <span className="font-semibold text-slate-200">
              ShortEdge Real Mobile App:
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Install to phone screen for instant camera bill scan & emergency sirens
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
                <span>Alerts Active (🔊 Test)</span>
              </button>
            )}

            {/* Install PWA / App Button */}
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition-all shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
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

      <InstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallDirect={handleInstallClick}
      />
    </>
  );
}

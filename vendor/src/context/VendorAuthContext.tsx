'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, vendorTranslations } from '../lib/i18n';
import { vendorApiRequest } from '../lib/api';

interface VendorContextType {
  vendor: any | null;
  token: string | null;
  lang: Language;
  t: typeof vendorTranslations['en'];
  setLang: (lang: Language) => void;
  loginAsVendor: (email: string) => Promise<void>;
  toggleOnline: (isOnline: boolean) => Promise<void>;
  toggleEmergency247: (is24x7Emergency: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const VendorAuthContext = createContext<VendorContextType | undefined>(undefined);

export function VendorAuthProvider({ children }: { children: React.ReactNode }) {
  const [vendor, setVendor] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [lang, setLangState] = useState<Language>('hi'); // Default Hindi for Indian vendors!

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shortedge_vendor_lang', newLang);
    }
  };

  const loginAsVendor = async (email: string) => {
    try {
      const res = await vendorApiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: email,
          password: 'Password@123'
        })
      });

      if (res.token && res.user) {
        setToken(res.token);
        localStorage.setItem('shortedge_vendor_token', res.token);
        // Load full vendor profile
        await refreshProfile();
      }
    } catch (err) {
      console.error('Vendor login error:', err);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await vendorApiRequest('/vendor/profile');
      if (res.success && res.vendor) {
        setVendor(res.vendor);
      }
    } catch (err) {
      console.error('Failed to refresh vendor profile:', err);
    }
  };

  const toggleOnline = async (isOnline: boolean) => {
    try {
      const res = await vendorApiRequest('/vendor/availability', {
        method: 'PATCH',
        body: JSON.stringify({ isOnline })
      });
      if (res.success && res.vendor) {
        setVendor(res.vendor);
      }
    } catch (err) {
      console.error('Toggle online failed:', err);
    }
  };

  const toggleEmergency247 = async (is24x7Emergency: boolean) => {
    try {
      const res = await vendorApiRequest('/vendor/availability', {
        method: 'PATCH',
        body: JSON.stringify({ is24x7Emergency })
      });
      if (res.success && res.vendor) {
        setVendor(res.vendor);
      }
    } catch (err) {
      console.error('Toggle emergency failed:', err);
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('shortedge_vendor_lang') as Language;
    if (savedLang) setLangState(savedLang);

    const savedToken = localStorage.getItem('shortedge_vendor_token');
    if (savedToken) {
      setToken(savedToken);
      refreshProfile();
    } else {
      // Default to Sharma Quick Rescue & Fuel Runner
      loginAsVendor('sharma.rescue@gmail.com');
    }
  }, []);

  const t = vendorTranslations[lang] || vendorTranslations.en;

  return (
    <VendorAuthContext.Provider
      value={{
        vendor,
        token,
        lang,
        t,
        setLang,
        loginAsVendor,
        toggleOnline,
        toggleEmergency247,
        refreshProfile
      }}
    >
      {children}
    </VendorAuthContext.Provider>
  );
}

export function useVendorAuth() {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within a VendorAuthProvider');
  }
  return context;
}

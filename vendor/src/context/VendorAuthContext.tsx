'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, vendorTranslations } from '../lib/i18n';
import { vendorApiRequest } from '../lib/api';

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  categories: string;
  description?: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
  isOnline: boolean;
  is24x7Emergency: boolean;
  kycStatus: string;
  dayRunnerFee: number;
  nightRunnerFee: number;
  perKmCharge: number;
  user?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    preferredLang: string;
  };
}

interface VendorContextType {
  vendor: VendorProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  lang: Language;
  t: any;
  setLang: (lang: Language) => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerVendor: (data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    businessName: string;
    businessType?: string;
    categories?: string;
    address?: string;
    serviceRadiusKm?: number;
    dayRunnerFee?: number;
    nightRunnerFee?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  verifyOtp: (phone: string, otp: string, businessName?: string) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (data: Partial<VendorProfile>) => Promise<{ success: boolean; error?: string }>;
  loginAsVendor: (email: string) => Promise<void>;
  logout: () => void;
  toggleOnline: (isOnline: boolean) => Promise<void>;
  toggleEmergency247: (is24x7Emergency: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const VendorAuthContext = createContext<VendorContextType | undefined>(undefined);

export function VendorAuthProvider({ children }: { children: React.ReactNode }) {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [lang, setLangState] = useState<Language>('en'); // STRICTLY DEFAULT TO ENGLISH!

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shortedge_vendor_lang_v2', newLang);
    }
  };

  const saveVendorSession = (newToken: string) => {
    setToken(newToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shortedge_vendor_token', newToken);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await vendorApiRequest('/vendor/profile');
      if (res.success && res.vendor) {
        setVendor(res.vendor);
      }
    } catch (err) {
      console.warn('Failed to refresh vendor profile:', err);
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const res = await vendorApiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });

      if (res.success && res.token && res.user) {
        saveVendorSession(res.token);
        await refreshProfile();
        return { success: true };
      }
      return { success: false, error: res.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const registerVendor = async (data: any) => {
    try {
      const res = await vendorApiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          role: 'VENDOR'
        })
      });

      if (res.success && res.token) {
        saveVendorSession(res.token);
        await refreshProfile();
        return { success: true };
      }
      return { success: false, error: res.error || 'Vendor onboarding failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Vendor onboarding failed' };
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      const res = await vendorApiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone })
      });
      if (res.success) {
        return { success: true, otp: res.otp };
      }
      return { success: false, error: res.error || 'Failed to send OTP' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (phone: string, otp: string, businessName?: string) => {
    try {
      const res = await vendorApiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp, name: businessName })
      });

      if (res.success && res.token) {
        saveVendorSession(res.token);
        await refreshProfile();
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid OTP' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid OTP' };
    }
  };

  const updateSettings = async (data: Partial<VendorProfile>) => {
    try {
      const res = await vendorApiRequest('/vendor/settings', {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      if (res.success && res.vendor) {
        setVendor(prev => prev ? { ...prev, ...res.vendor } : res.vendor);
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to update settings' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update settings' };
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
        saveVendorSession(res.token);
        await refreshProfile();
      }
    } catch (err) {
      console.error('Vendor login error:', err);
    }
  };

  const logout = () => {
    setToken(null);
    setVendor(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shortedge_vendor_token');
    }
  };

  const toggleOnline = async (isOnline: boolean) => {
    try {
      const res = await vendorApiRequest('/vendor/availability', {
        method: 'PATCH',
        body: JSON.stringify({ isOnline })
      });
      if (res.success && res.vendor) {
        setVendor(prev => prev ? { ...prev, isOnline: res.vendor.isOnline } : res.vendor);
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
        setVendor(prev => prev ? { ...prev, is24x7Emergency: res.vendor.is24x7Emergency } : res.vendor);
      }
    } catch (err) {
      console.error('Toggle emergency failed:', err);
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('shortedge_vendor_lang_v2') as Language;
    if (savedLang && vendorTranslations[savedLang]) {
      setLangState(savedLang);
    } else {
      setLangState('en'); // STRICT DEFAULT TO ENGLISH
    }

    const savedToken = localStorage.getItem('shortedge_vendor_token');
    if (savedToken) {
      setToken(savedToken);
      refreshProfile();
    } else {
      // Default to Sharma Quick Rescue for initial demo
      loginAsVendor('sharma.rescue@gmail.com');
    }
  }, []);

  const t = vendorTranslations[lang] || vendorTranslations.en;

  return (
    <VendorAuthContext.Provider
      value={{
        vendor,
        token,
        isAuthenticated: !!vendor,
        lang,
        t,
        setLang,
        login,
        registerVendor,
        sendOtp,
        verifyOtp,
        updateSettings,
        loginAsVendor,
        logout,
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

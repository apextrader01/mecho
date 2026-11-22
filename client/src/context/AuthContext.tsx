'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../lib/i18n';
import { apiRequest } from '../lib/api';

export interface UserStats {
  dispatchesCount: number;
  rfqsCount: number;
  subsCount: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  preferredLang: string;
  stats?: UserStats;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  lang: Language;
  t: any;
  setLang: (lang: Language) => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; phone: string; email?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  verifyOtp: (phone: string, otp: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { name?: string; email?: string; preferredLang?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  loginAsDemoUser: (email: string) => Promise<void>;
  logout: () => void;
  userCoords: { lat: number; lng: number; address: string };
  setUserCoords: (coords: { lat: number; lng: number; address: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [lang, setLangState] = useState<Language>('en'); // STRICTLY DEFAULT TO ENGLISH
  const [userCoords, setUserCoords] = useState({
    lat: 12.9784,
    lng: 77.6408,
    address: '100ft Road, Indiranagar, Bangalore'
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shortedge_lang_v2', newLang);
    }
  };

  const saveAuthSession = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shortedge_token', newToken);
      localStorage.setItem('shortedge_user', JSON.stringify(newUser));
    }
  };

  const refreshUser = async () => {
    try {
      const res = await apiRequest('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('shortedge_user', JSON.stringify(res.user));
        }
      }
    } catch (err) {
      console.warn('Failed to refresh user stats:', err);
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });

      if (res.success && res.token && res.user) {
        saveAuthSession(res.token, res.user);
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: res.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (data: { name: string; phone: string; email?: string; password: string }) => {
    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...data, role: 'USER' })
      });

      if (res.success && res.token && res.user) {
        saveAuthSession(res.token, res.user);
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      const res = await apiRequest('/auth/send-otp', {
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

  const verifyOtp = async (phone: string, otp: string, name?: string) => {
    try {
      const res = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp, name })
      });

      if (res.success && res.token && res.user) {
        saveAuthSession(res.token, res.user);
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid OTP' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid OTP' };
    }
  };

  const updateProfile = async (data: { name?: string; email?: string; preferredLang?: string }) => {
    try {
      const res = await apiRequest('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      if (res.success && res.user) {
        setUser(prev => prev ? { ...prev, ...res.user } : res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('shortedge_user', JSON.stringify(res.user));
        }
        return { success: true };
      }
      return { success: false, error: res.error || 'Update failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Update failed' };
    }
  };

  const loginAsDemoUser = async (email: string) => {
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: email,
          password: 'Password@123'
        })
      });

      if (res.token && res.user) {
        saveAuthSession(res.token, res.user);
        await refreshUser();
      }
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shortedge_token');
      localStorage.removeItem('shortedge_user');
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('shortedge_lang_v2') as Language;
    if (savedLang && translations[savedLang]) {
      setLangState(savedLang);
    } else {
      setLangState('en'); // STRICT DEFAULT TO ENGLISH
    }

    const savedToken = localStorage.getItem('shortedge_token');
    const savedUser = localStorage.getItem('shortedge_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
        refreshUser();
      } catch (e) {
        setUser(null);
      }
    } else {
      // Default to Rahul Sharma for initial demo state
      loginAsDemoUser('rahul.sharma@gmail.com');
    }
  }, []);

  const t = translations[lang] || translations.en;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        lang,
        t,
        setLang,
        login,
        register,
        sendOtp,
        verifyOtp,
        updateProfile,
        refreshUser,
        loginAsDemoUser,
        logout,
        userCoords,
        setUserCoords
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

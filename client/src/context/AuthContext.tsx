'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../lib/i18n';
import { apiRequest } from '../lib/api';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  preferredLang: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  lang: Language;
  t: typeof translations['en'];
  setLang: (lang: Language) => void;
  loginAsDemoUser: (email: string) => Promise<void>;
  logout: () => void;
  userCoords: { lat: number; lng: number; address: string };
  setUserCoords: (coords: { lat: number; lng: number; address: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [lang, setLangState] = useState<Language>('en');
  const [userCoords, setUserCoords] = useState({
    lat: 12.9784,
    lng: 77.6408,
    address: '100ft Road, Indiranagar, Bangalore'
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shortedge_lang', newLang);
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
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('shortedge_token', res.token);
        localStorage.setItem('shortedge_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shortedge_token');
    localStorage.removeItem('shortedge_user');
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('shortedge_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
      setLangState(savedLang);
    }

    const savedToken = localStorage.getItem('shortedge_token');
    const savedUser = localStorage.getItem('shortedge_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    } else {
      // Auto login as default seeded customer Rahul Sharma
      loginAsDemoUser('rahul.sharma@gmail.com');
    }
  }, []);

  const t = translations[lang] || translations.en;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        lang,
        t,
        setLang,
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

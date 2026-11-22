'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApiRequest } from '../lib/api';

interface AdminContextType {
  adminUser: any | null;
  token: string | null;
  stats: any | null;
  refreshStats: () => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<any | null>(null);

  const loginAsAdmin = async () => {
    try {
      const res = await adminApiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'admin@shortedge.in',
          password: 'Password@123'
        })
      });

      if (res.token && res.user) {
        setToken(res.token);
        setAdminUser(res.user);
        localStorage.setItem('shortedge_admin_token', res.token);
        await refreshStats();
      }
    } catch (err) {
      console.error('Admin auto-login error:', err);
    }
  };

  const refreshStats = async () => {
    try {
      const res = await adminApiRequest('/admin/dashboard-stats');
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('shortedge_admin_token');
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('shortedge_admin_token');
    if (savedToken) {
      setToken(savedToken);
      refreshStats();
    } else {
      loginAsAdmin();
    }
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        stats,
        refreshStats,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

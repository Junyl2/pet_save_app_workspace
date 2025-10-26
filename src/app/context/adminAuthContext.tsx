'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Admin {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (adminData: Admin, token: string, redirectTo?: string) => void;
  logout: (redirectTo?: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export const AdminAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const storedAdmin = localStorage.getItem('admin');
      const token = localStorage.getItem('adminToken');
      if (storedAdmin && token) setAdmin(JSON.parse(storedAdmin));
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [hydrated]);

  const login = (adminData: Admin, token: string, redirectTo?: string) => {
    localStorage.setItem('admin', JSON.stringify(adminData));
    localStorage.setItem('adminToken', token);
    setAdmin(adminData);
    if (redirectTo) router.replace(redirectTo);
  };

  const logout = (redirectTo = '/admin/login') => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
    setAdmin(null);
    router.replace(redirectTo);
  };

  if (!hydrated) return null;

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
};

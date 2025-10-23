'use client';

import React, { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSideBar from '@/app/components/sections/AdminSideBar/AdminSideBar';

type LayoutProps = {
  children: React.ReactNode;
};

/** Map sidebar keys to routes */
const KEY_TO_ROUTE: Record<string, string> = {
  'orders-shipping': '/admin/pages/orders',
  'cancel-return-exchange': '/admin/pages/returns',
  'tax-invoices': '/admin/pages/tax-invoices',
  'accounts-permissions': '/admin/pages/accounts',
  'animal-categories': '/admin/pages/animal-categories',
  products: '/admin/pages/products',
  'referral-codes': '/admin/pages/referrals',
  support: '/admin/pages/support',
};

/** Determine active key from path */
function resolveActiveKey(pathname: string): string {
  if (pathname.includes('orders')) return 'orders-shipping';
  if (pathname.includes('returns')) return 'cancel-return-exchange';
  if (pathname.includes('tax-invoices')) return 'tax-invoices';
  if (pathname.includes('accounts')) return 'accounts-permissions';
  if (pathname.includes('animal-categories')) return 'animal-categories';
  if (pathname.includes('products')) return 'products';
  if (pathname.includes('referrals')) return 'referral-codes';
  if (pathname.includes('support')) return 'support';
  return 'orders-shipping';
}

export default function AdminPagesLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeKey = useMemo(() => resolveActiveKey(pathname || ''), [pathname]);

  const handleNavigate = useCallback(
    (key: string) => {
      const to = KEY_TO_ROUTE[key];
      if (to) router.push(to);
    },
    [router]
  );

  const handleLogout = useCallback(() => {
    router.push('/logout');
  }, [router]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '337px 1fr',
        minHeight: '100vh',
        background: '#fafafa',
      }}
    >
      <AdminSideBar
        activeKey={activeKey}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        adminName="관리자님"
      />
      <main
        style={{
          padding: '24px 32px',
          overflowY: 'auto',
          background: '#fff',
        }}
      >
        {children}
      </main>
    </div>
  );
}

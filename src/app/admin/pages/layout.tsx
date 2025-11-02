'use client';

import React, { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSideBar from '@/app/components/sections/AdminSideBar/AdminSideBar';

type LayoutProps = {
  children: React.ReactNode;
};

/** Derive activeKey based on current route */
function resolveActiveKey(pathname: string): string {
  if (pathname.includes('/admin/pages/order-delivery-management'))
    return 'order-delivery-management/waiting-payment';

  if (
    pathname.includes(
      '/admin/pages/cancellation-refund-exchange/cancellation-list'
    )
  )
    return 'cancellation-refund-exchange/cancellation-list';

  if (
    pathname.includes(
      '/admin/pages/cancellation-refund-exchange/return-exchange-list'
    )
  )
    return 'cancellation-refund-exchange/return-exchange-list/return-request';

  if (pathname.includes('/admin/pages/cancellation-refund-exchange/return'))
    return 'cancel-return-exchange';

  if (pathname.includes('/admin/pages/tax-invoice-list'))
    return 'tax-invoice-list';
  if (pathname.includes('/admin/pages/account-permission-management'))
    return 'account-permission-management/general-member';
  if (pathname.includes('/admin/pages/animal-category-management'))
    return 'animal-category-management';
  if (pathname.includes('/admin/pages/product-management'))
    return 'product-management';
  if (pathname.includes('/admin/pages/referrals')) return 'referral-codes';
  if (pathname.includes('/admin/pages/support')) return 'support';

  // Default
  return 'order-delivery-management/waiting-payment';
}

export default function AdminPagesLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activeKey = useMemo(() => resolveActiveKey(pathname || ''), [pathname]);

  const handleLogout = () => {
    router.push('/logout');
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '337px 1fr',
        minHeight: '100vh',
        background: '#fafafa',
      }}
    >
      <AdminSideBar activeKey={activeKey} /* onLogout={handleLogout} */ />
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

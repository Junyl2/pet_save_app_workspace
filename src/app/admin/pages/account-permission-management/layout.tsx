'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import OrderDatePicker from '@/app/components/admin/ui/OrderDatePicker/OrderDatePicker';
import styles from './layout.module.css';
import AccounTopBar from '@/app/components/admin/sections/AccontTopBar/AccounTopBar';
import {
  OrderFilterProvider,
  useOrderFilter,
} from '@/app/context/orderFilterContext';

function FilterResetHandler({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resetFilters } = useOrderFilter();
  const prevMainPageRef = useRef<string | null>(null);

  useEffect(() => {
    const mainPages = [
      '/admin/pages/account-permission-management/general-member',
      '/admin/pages/account-permission-management/business-member',
      '/admin/pages/account-permission-management/business-registration-confirmation',
    ];

    const currentMainPage = mainPages.find(
      (page) => pathname === page || pathname.startsWith(page + '/')
    );

    if (currentMainPage) {
      if (
        prevMainPageRef.current &&
        prevMainPageRef.current !== currentMainPage
      ) {
        resetFilters();
      }
      prevMainPageRef.current = currentMainPage;
    }
  }, [pathname, resetFilters]);

  return <>{children}</>;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <FilterResetHandler>
      <div className={styles.container}>
        {/*       <OrderTopBarClient /> */}
        <AccounTopBar />
        <div className={styles.content}>
          <div className={styles.datePicker}>
            <OrderDatePicker />
          </div>

          {children}
        </div>
      </div>
    </FilterResetHandler>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OrderFilterProvider>
      <LayoutContent>{children}</LayoutContent>
    </OrderFilterProvider>
  );
}

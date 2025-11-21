'use client';

import React from 'react';
import OrderDatePicker from '@/app/components/admin/ui/OrderDatePicker/OrderDatePicker';
import styles from './layout.module.css';
import TaxTopBar from '@/app/components/admin/sections/TaxTopBar/TaxTopBar';
import { OrderFilterProvider } from '@/app/context/orderFilterContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OrderFilterProvider>
      <div className={styles.container}>
        {/*       <OrderTopBarClient /> */}
        <TaxTopBar />
        <div className={styles.content}>
          <div className={styles.datePicker}>
            <OrderDatePicker />
          </div>

          {children}
        </div>
      </div>
    </OrderFilterProvider>
  );
}

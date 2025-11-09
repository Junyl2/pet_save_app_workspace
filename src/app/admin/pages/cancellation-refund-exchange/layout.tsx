'use client';

import React from 'react';
/* import OrderTopBarClient from './OrderTopBarClient'; */
import OrderDatePicker from '@/app/components/admin/ui/OrderDatePicker/OrderDatePicker';
import styles from '../order-delivery-management/layout.module.css';
import RefundTopBar from '@/app/components/admin/sections/RefundTopBar/RefundTopBar';
import { OrderFilterProvider } from '@/app/context/orderFilterContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OrderFilterProvider>
      <div className={styles.container}>
        {/*       <OrderTopBarClient /> */}
        <RefundTopBar />
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

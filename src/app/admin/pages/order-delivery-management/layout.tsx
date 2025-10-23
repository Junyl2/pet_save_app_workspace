import React from 'react';
import OrderTopBarClient from './OrderTopBarClient';
import OrderDatePicker from '@/app/components/admin/ui/OrderDatePicker/OrderDatePicker';
import styles from './layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <OrderTopBarClient />
      <div className={styles.content}>
        <div className={styles.datePicker}>
          <OrderDatePicker />
        </div>

        {children}
      </div>
    </div>
  );
}

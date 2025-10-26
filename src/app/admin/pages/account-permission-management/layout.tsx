import React from 'react';
import OrderDatePicker from '@/app/components/admin/ui/OrderDatePicker/OrderDatePicker';
import styles from './layout.module.css';
import AccounTopBar from '@/app/components/admin/sections/AccontTopBar/AccounTopBar';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/context/adminAuthContext';
import styles from './AdminLandingPage.module.css';

export default function AdminLandingPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAdminAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isLoggedIn) {
      router.replace('/admin/pages/order-delivery-management/waiting-payment');
    } else {
      router.replace('/admin/login');
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (!navigator.onLine) {
      router.push('/admin/offline');
    }

    const handleOnline = () => {
      window.location.reload();
    };

    const handleOffline = () => {
      router.push('/admin/offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.loader}></div>
      <p className={styles.text}>Connecting...</p>
    </div>
  );
}

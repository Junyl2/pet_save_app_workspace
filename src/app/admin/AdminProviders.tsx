'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthProvider } from '@/app/context/adminAuthContext';

interface AdminProvidersProps {
  children: React.ReactNode;
}

export default function AdminProviders({ children }: AdminProvidersProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!navigator.onLine) {
      router.push('/admin/offline');
    }

    const handleOnline = () => {
      /*    window.location.reload(); */
      router.back();
    };

    /*  if (navigator.onLine) {
      router.back();
    }
 */
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

  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}

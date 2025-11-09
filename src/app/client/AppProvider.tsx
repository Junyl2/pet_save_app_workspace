'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { ReduxProvider } from '@/app/components/providers/ReduxProvider';
import { AuthProvider } from '@/app/context/authContext';
import { UserProvider } from '@/app/context/userContext';
import { FavoritesProvider } from '@/app/context/FavoritesContext';
import { CartProvider } from '@/app/context/cartContext';
import ClientWrapper from './ClientWrapper';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { ErrorBoundaryWrapper } from '../components/providers/ErrorBoundaryWrapper';

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!navigator.onLine) {
      router.push('/client/offline');
    }

    const handleOnline = () => {
      if (pathname.includes('/client/offline')) {
        router.back();
      } else {
        window.location.reload();
      }
    };

    /*  if (navigator.onLine) {
      router.back();
    } */

    const handleOffline = () => {
      router.push('/client/offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router, pathname]);

  return (
    <ErrorBoundaryWrapper>
      <ReduxProvider>
        <AuthProvider>
          <UserProvider>
            <ClientWrapper BottomBar={<BottomBar />}>
              <FavoritesProvider>
                <CartProvider>{children}</CartProvider>
              </FavoritesProvider>
            </ClientWrapper>
          </UserProvider>
        </AuthProvider>

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
              width: '100%',
              textAlign: 'center',
              marginBottom: '100px',
            },
            error: {
              style: { background: '#2F6F5E', color: '#fff' },
              iconTheme: { primary: '#2F6F5E', secondary: '#fff' },
            },
            success: { style: { background: '#48bb78', color: '#fff' } },
          }}
        />
      </ReduxProvider>
    </ErrorBoundaryWrapper>
  );
}

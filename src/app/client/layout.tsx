import type { Metadata } from 'next';
import './globals.css';
import ClientWrapper from './ClientWrapper';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { FavoritesProvider } from '../context/FavoritesContext';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '../context/cartContext';
import { UserProvider } from '../context/userContext';
import { AuthProvider } from '../context/authContext';
import '../utils/auth-debug';

export const metadata: Metadata = {
  title: 'Pet Save App',
  description: 'Mobile-first app layout',
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthProvider>
        <UserProvider>
          <ClientWrapper BottomBar={<BottomBar />}>
            <FavoritesProvider>
              <CartProvider>{children}</CartProvider>
            </FavoritesProvider>
          </ClientWrapper>
        </UserProvider>
      </AuthProvider>

      {/* Global toast container */}
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
    </>
  );
}

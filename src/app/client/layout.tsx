import type { Metadata } from 'next';
import './globals.css';
import ClientWrapper from './ClientWrapper';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { FavoritesProvider } from '../context/FavoritesContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Pet Save App',
  description: 'Mobile-first app layout',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ClientWrapper BottomBar={<BottomBar />}>
          <FavoritesProvider>{children}</FavoritesProvider>
        </ClientWrapper>

        {/* Global toast container */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            // Default style
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
            // Error specific
            error: {
              style: {
                background: '#2F6F5E',
                color: '#fff',
              },
              iconTheme: {
                primary: '#2F6F5E',
                secondary: '#fff',
              },
            },
            // Success specific
            success: {
              style: {
                background: '#48bb78',
                color: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

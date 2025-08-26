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
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              fontSize: '0.9rem',
            },
          }}
        />
      </body>
    </html>
  );
}

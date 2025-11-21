import type { Metadata } from 'next';
import './globals.css';
import AppProvider from './AppProvider';

export const metadata: Metadata = {
  title: 'Pet Save App',
  description: 'Mobile-first app layout',
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProvider>{children}</AppProvider>;
}

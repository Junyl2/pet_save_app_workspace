import { ReactNode } from 'react';
import AdminProviders from './AdminProviders';
import AdminWrapper from './AdminWrapper';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProviders>
      <AdminWrapper>{children}</AdminWrapper>
    </AdminProviders>
  );
}

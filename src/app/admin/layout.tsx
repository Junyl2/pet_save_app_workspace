import { ReactNode } from 'react';
import './admin.module.css';
import AdminProviders from './AdminProviders';
import AdminWrapper from './AdminWrapper';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AdminProviders>
          <AdminWrapper>{children}</AdminWrapper>
        </AdminProviders>
      </body>
    </html>
  );
}

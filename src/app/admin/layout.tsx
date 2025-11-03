import { ReactNode } from 'react';
import AdminProviders from './AdminProviders';
import AdminWrapper from './AdminWrapper';
import styles from './admin.module.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className={styles.adminLayout}>
        <AdminProviders>
          <AdminWrapper>{children}</AdminWrapper>
        </AdminProviders>
      </body>
    </html>
  );
}

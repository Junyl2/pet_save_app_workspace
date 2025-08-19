import type { Metadata } from 'next';
import './globals.css';
import ClientWrapper from './ClientWrapper';

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
    <html lang="en">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}

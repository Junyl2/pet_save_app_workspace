/* import type { Metadata } from 'next'; */
import { ReactNode } from 'react';
import './admin.module.css';
/* export const metadata: Metadata = {
  title: 'Pet Save | Pet Food & Supplies Online',
  description:
    'Shop premium dog food, cat food, and pet supplies at Pet Save. Get everything your furry friend needs — healthy meals, treats, toys, and more — delivered to your door.',
  keywords: [
    'pet shop',
    'dog food',
    'cat food',
    'pet supplies',
    'online pet store',
    'pet accessories',
    'pet treats',
    'dog toys',
    'cat toys',
  ],
  openGraph: {
    title: 'Pet Save | Pet Food & Supplies Online',
    description:
      'Discover healthy pet food, treats, toys, and supplies at Pet Save. Easy online shopping for everything your pets need.',
    url: '/',
    siteName: 'Pet Save',
    type: 'website',
  },
}; */

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

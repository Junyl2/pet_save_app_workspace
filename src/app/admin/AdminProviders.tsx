'use client';
import { AdminAuthProvider } from '@/app/context/adminAuthContext';

export default function AdminProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}

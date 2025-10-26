'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/context/adminAuthContext';

export default function AdminLandingPage() {
  const router = useRouter();
  const { admin, loading } = useAdminAuth();

  useEffect(() => {
    if (loading) return; // Wait until auth is loaded

    if (admin) {
      //  Admin logged in → go to dashboard
      router.replace('/admin/pages/order-delivery-management');
    } else {
      //  Not logged in → go to login page
      router.replace('/admin/login');
    }
  }, [admin, loading, router]);

  // Optional loading placeholder to avoid flicker
  return <p>Loading...</p>;
}

/*

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/app/api/admin/utils/session'; // example helper

export default async function AdminLandingPage() {
  const admin = await getAdminSession();

  if (admin) {
    redirect('/admin/pages/order-delivery-management');
  } else {
    redirect('/admin/pages/login');
  }
}

*/

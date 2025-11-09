'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReferrerCodeManagementPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/pages/referrer-code-management/payment-details');
  }, [router]);

  return null;
}


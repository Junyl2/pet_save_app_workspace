'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/userContext';
import { PAGE_URLS } from '@/app/utils/page_url';

export default function StoreInfoPage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect to ChangeSellerProfile with the current user's storeId
    if (user?.storeId) {
      router.push(`${PAGE_URLS.SELLER_STORE_INFO}?storeId=${user.storeId}`);
    } else {
      // If no storeId, redirect back to my page
      router.push(PAGE_URLS.MYPAGE);
    }
  }, [user?.storeId, router]);

  return (
    <div style={{ padding: 16, textAlign: 'center' }}>리다이렉트 중...</div>
  );
}

/* 'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import OrderTopBar, {
  TabKey,
} from '@/app/components/admin/sections/OrderTopBar/OrderTopBar';

const tabKeyToSlug: Record<TabKey, string> = {
  'waiting-payment': 'waiting-payment',
  paid: 'payment-completed',
  preparing: 'product-preparation',
  'shipping-pickup': 'delivery-pickup-progress',
  received: 'receipt-complete',
};

const slugToTabKey: Record<string, TabKey> = {
  'waiting-payment': 'waiting-payment',
  'payment-completed': 'paid',
  'product-preparation': 'preparing',
  'delivery-pickup-progress': 'shipping-pickup',
  'receipt-complete': 'received',
};

export default function OrderTopBarClient() {
  const router = useRouter();
  const pathname = usePathname();

  const segment = React.useMemo(() => {
    const parts = (pathname || '').split('/').filter(Boolean);
    const idx = parts.indexOf('order-delivery-management');
    return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : 'waiting-payment';
  }, [pathname]);

  const active: TabKey = slugToTabKey[segment] ?? 'waiting-payment';

  return (
    <OrderTopBar
      active={active}
      onChange={(key) =>
        router.replace(
          `/admin/pages/order-delivery-management/${tabKeyToSlug[key]}`
        )
      }
    />
  );
}
 */

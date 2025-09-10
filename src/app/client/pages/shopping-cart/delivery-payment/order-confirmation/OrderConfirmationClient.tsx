'use client';

import { useEffect, useState } from 'react';
import OrderConfirmation from '@/app/components/pages/shopping-cart/DeliveryPaymentPage/OrderConfirmation/OrderConfirmation';

type Mode = 'delivery' | 'pickup';

type Props = {
  mode: Mode;
  orderNo: number | string;
  itemCount: number;
  amount: number;
  paymentLabel: string;
  date: Date;
};

export default function OrderConfirmationClient(initial: Props) {
  const [data, setData] = useState<Props>(initial);

  useEffect(() => {
    // If any critical field looks empty/zero, try sessionStorage fallback
    const missing =
      !initial.paymentLabel ||
      !initial.orderNo ||
      initial.itemCount === 0 ||
      initial.amount === 0;

    if (missing) {
      try {
        const raw = sessionStorage.getItem('orderConfirmation');
        if (raw) {
          const parsed = JSON.parse(raw);
          setData((prev) => ({
            ...prev,
            mode: parsed.mode === 'pickup' ? ('pickup' as const) : 'delivery',
            orderNo: parsed.orderNo ?? prev.orderNo,
            itemCount: Number(parsed.itemCount ?? prev.itemCount),
            amount: Number(parsed.amount ?? prev.amount),
            paymentLabel: parsed.paymentLabel ?? prev.paymentLabel,
            date: new Date(parsed.date ?? prev.date),
          }));
        }
      } catch {}
    }
  }, [initial]);

  return <OrderConfirmation {...data} />;
}

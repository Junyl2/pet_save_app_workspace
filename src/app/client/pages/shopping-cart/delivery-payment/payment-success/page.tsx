'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentService } from '@/app/api/services/admin/paymentService/paymentService';
import { PAGE_URLS } from '@/app/utils/page_url';
import styles from './PaymentSuccess.module.css';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('결제 처리 중입니다...');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setMessage('잘못된 접근입니다.');
      return;
    }

    (async () => {
      try {
        const { data, error } = await paymentService.handlePaymentSuccess(
          paymentKey,
          orderId,
          Number(amount)
        );
        if (error || !data?.success) throw new Error(data?.resultMsg ?? error);
        setMessage('결제가 성공적으로 완료되었습니다.');
        // Optionally redirect after delay
        setTimeout(() => router.push(PAGE_URLS.ORDER_CONFIRMATION), 1500);
      } catch (err) {
        console.error('결제 성공 처리 오류:', err);
        setMessage('결제 성공 후 처리 중 오류가 발생했습니다.');
      }
    })();
  }, [router, searchParams]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>결제 완료</h1>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

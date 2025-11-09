'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { paymentService } from '@/app/api/services/admin/paymentService/paymentService';
import styles from './PaymentFail.module.css';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('결제 실패를 처리 중입니다...');

  useEffect(() => {
    const code = searchParams.get('code');
    const failMsg = searchParams.get('message');
    const orderId = searchParams.get('orderId');

    if (!code || !failMsg || !orderId) {
      setMessage('잘못된 접근입니다.');
      return;
    }

    (async () => {
      try {
        const { data, error } = await paymentService.handlePaymentFail(
          code,
          failMsg,
          orderId
        );
        if (error || !data?.success)
          throw new Error(data?.resultMsg ?? error ?? '');
        setMessage('결제가 실패했습니다. 다시 시도해주세요.');
      } catch (err) {
        console.error('결제 실패 처리 오류:', err);
        setMessage('결제 실패 후 처리 중 오류가 발생했습니다.');
      }
    })();
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>결제 실패</h1>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import styles from './PaymentFail.module.css';
import toast from 'react-hot-toast';

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>결제에 실패했습니다.</h2>
      <p className={styles.message}>
        {message
          ? `사유: ${decodeURIComponent(message)}`
          : '결제가 정상적으로 완료되지 않았습니다.'}
      </p>
      {code && <p className={styles.code}>에러 코드: {code}</p>}
      {orderId && <p className={styles.orderId}>주문번호: {orderId}</p>}

      <button
        className={styles.retryButton}
        onClick={() =>
          router.push('/client/pages/shopping-cart/delivery-payment')
        }
      >
        다시 결제하기
      </button>
      <button
        className={styles.homeButton}
        onClick={() => router.push('/client/pages/homepage')}
      >
        홈으로 이동
      </button>
    </div>
  );
}

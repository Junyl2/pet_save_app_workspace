'use client';

import { useRouter } from 'next/navigation';
import { PAGE_URLS } from '@/app/utils/page_url';
import styles from '../DeliveryPayment.module.css';

interface PayButtonProps {
  totalDue: number;
  canPay: boolean;
  handlePay?: () => void;
}

export default function PayButton({
  totalDue,
  canPay,
  handlePay,
}: PayButtonProps) {
  const router = useRouter();

  const onPayClick = () => {
    // run your payment logic first if needed
    if (handlePay) {
      handlePay();
    }
    // then navigate
    router.push(PAGE_URLS.ORDER_CONFIRMATION);
  };

  return (
    <button
      className={`${styles.payButton} ${
        !canPay ? styles.payButtonDisabled : ''
      }`}
      disabled={!canPay}
      onClick={onPayClick}
    >
      총 {totalDue.toLocaleString()}원 결제하기
    </button>
  );
}

'use client';

import styles from './OrderConfirmation.module.css';
import Image from 'next/image';

type Mode = 'delivery' | 'pickup';

export interface OrderConfirmationProps {
  mode: Mode;
  orderNo: number | string;
  itemCount: number;
  amount: number;
  paymentLabel: string;
  date: Date; // e.g., new Date(2025, 7, 6) for 8/6
}

function formatKoreanShortDate(d: Date) {
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${mm}/${dd}(${weekday})`;
}

export default function OrderConfirmation({
  mode,
  orderNo,
  itemCount,
  amount,
  paymentLabel,
  date,
}: OrderConfirmationProps) {
  const dateStr = formatKoreanShortDate(date);

  return (
    <div className={styles.confirmation}>
      <div className={styles.noteIcon}>
        <Image
          src="/images/icons/order-check.svg"
          alt="Note Icon"
          height={60}
          width={60}
          className="object-contain"
        />
      </div>

      <h2 className={styles.confirmationTitle}>주문이 완료되었습니다.</h2>

      <p className={styles.confirmationSub}>
        {mode === 'delivery' ? (
          <>
            <span className={styles.date}>{dateStr}</span>에 배송됩니다.
          </>
        ) : (
          <>
            <span>{dateStr}</span>까지 픽업해주세요.
          </>
        )}
      </p>

      <div className={styles.orderNumber}>
        <span className={styles.orderLabel}>주문번호</span>
        <span className={styles.orderBalue}>{orderNo}</span>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.confirmationRow}>
        <span className={styles.label}>상품</span>
        <span className={styles.value}>총 {itemCount}건</span>
      </div>

      <div className={styles.confirmationRow}>
        <span className={styles.label}>결제 금액</span>
        <span className={styles.value}>{amount.toLocaleString()}원</span>
      </div>

      <div className={styles.confirmationRow}>
        <span className={styles.label}>결제 방법</span>
        <span className={styles.value}>{paymentLabel}</span>
      </div>
    </div>
  );
}

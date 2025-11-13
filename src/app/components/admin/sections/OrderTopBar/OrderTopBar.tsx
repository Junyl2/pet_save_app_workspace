'use client';

import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import styles from './OrderTopBar.module.css';

const slugToTabKey = {
  'waiting-payment': '결제대기중',
  'payment-completed': '결제완료',
  'product-preparation': '상품 준비중',
  'delivery-pickup-progress': '배송·픽업중',
  'receipt-complete': '수령완료',
};

export default function OrderTopBar() {
  const router = useRouter();
  const pathname = usePathname();

  const activeSlug =
    Object.keys(slugToTabKey).find((slug) => pathname.includes(slug)) ||
    'waiting-payment';

  return (
    <header className={styles.wrap}>
      <h1 className={styles.title}>주문 및 배송관리</h1>

      <nav className={styles.tabRow} aria-label="Order status tabs">
        {Object.entries(slugToTabKey).map(([slug, label]) => (
          <button
            key={slug}
            type="button"
            className={clsx(
              styles.tab,
              activeSlug === slug ? styles.active : styles.inactive
            )}
            onClick={() =>
              router.push(`/admin/pages/order-delivery-management/${slug}`)
            }
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}

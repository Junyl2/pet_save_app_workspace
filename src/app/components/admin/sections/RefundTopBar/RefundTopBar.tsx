'use client';

import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import styles from './RefundTopBar.module.css';

const slugToTabKey = {
  'return-request': '반품신청',
  'exchange-request': '교환신청',
};

export default function RefundTopBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isCancellationList = pathname.startsWith(
    '/admin/pages/cancellation-refund-exchange/cancellation-list'
  );

  const activeSlug =
    Object.keys(slugToTabKey).find((slug) => pathname.includes(slug)) ||
    'waiting-payment';

  return (
    <header className={styles.wrap}>
      {isCancellationList ? (
        <h1>주문 취소 리스트</h1>
      ) : (
        <h1 className={styles.title}>주문 반품/교환 리스트</h1>
      )}

      {!isCancellationList && (
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
                router.push(
                  `/admin/pages/cancellation-refund-exchange/return-exchange-list/${slug}`
                )
              }
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './OrderTopBar.module.css';

export type TabKey =
  | 'waiting-payment'
  | 'paid'
  | 'preparing'
  | 'shipping-pickup'
  | 'received';

type Tab = {
  key: TabKey;
  label: string;
};

const TABS: Tab[] = [
  { key: 'waiting-payment', label: '결제대기중' },
  { key: 'paid', label: '결제완료' },
  { key: 'preparing', label: '상품 준비중' },
  { key: 'shipping-pickup', label: '배송·픽업중' },
  { key: 'received', label: '수령완료' },
];

export type OrderTopBarProps = {
  /** Page title (default from Figma) */
  title?: string;
  /** Active tab key */
  active?: TabKey;
  /** Fired when a tab is selected */
  onChange?: (key: TabKey) => void;
  /** Optional className passthrough */
  className?: string;
};

export default function OrderTopBar({
  title = '주문 및 배송관리',
  active = 'waiting-payment',
  onChange,
  className,
}: OrderTopBarProps) {
  return (
    <header className={clsx(styles.wrap, className)}>
      <h1 className={styles.title}>{title}</h1>

      <nav
        className={styles.tabRow}
        aria-label="Order status tabs"
        role="tablist"
      >
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={clsx(
                styles.tab,
                isActive ? styles.active : styles.inactive
              )}
              onClick={() => onChange?.(t.key)}
              type="button"
            >
              {t.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

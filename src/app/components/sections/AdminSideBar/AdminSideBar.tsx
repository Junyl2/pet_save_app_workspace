'use client';

import React, { useState, useEffect } from 'react';
import styles from './AdminSideBar.module.css';
import clsx from 'clsx';
import { FiChevronDown, FiLogOut } from 'react-icons/fi';

type MenuItem = {
  key: string;
  label: string;
};

export type AdminSideBarProps = {
  activeKey?: string;
  onNavigate?: (key: string) => void;
  className?: string;
  adminName?: string;
  onLogout?: () => void;
};

const MENU: MenuItem[] = [
  { key: 'orders-shipping', label: '주문 및 배송관리' },
  { key: 'cancel-return-exchange', label: '주문 취소·반품/교환' }, // only dropdown
  { key: 'tax-invoices', label: '세금 계산서 리스트' },
  { key: 'accounts-permissions', label: '계정/권한 관리' },
  { key: 'animal-categories', label: '동물 카테고리 관리' },
  { key: 'products', label: '상품 관리' },
  { key: 'referral-codes', label: '추천인 코드 관리' },
  { key: 'support', label: '고객센터' },
];

const CANCEL_CHILDREN: MenuItem[] = [
  { key: 'cancel-return-exchange/cancellations', label: '주문 취소' },
  { key: 'cancel-return-exchange/returns', label: '반품' },
  { key: 'cancel-return-exchange/exchanges', label: '교환' },
];

export default function AdminSideBar({
  activeKey = 'orders-shipping',
  onNavigate,
  className,
  adminName = '관리자님',
  onLogout,
}: AdminSideBarProps) {
  const [open, setOpen] = useState(false);
  const isCancelChildActive = activeKey.startsWith('cancel-return-exchange/');

  useEffect(() => {
    if (isCancelChildActive) setOpen(true);
  }, [isCancelChildActive]);

  return (
    <aside className={clsx(styles.wrap, className)} aria-label="Admin sidebar">
      {/* Logo */}
      <div className={styles.logoBlock} aria-label="Brand">
        <MiniLogo />
      </div>

      {/* Greeting */}
      <div className={styles.greetingCard}>
        <div className={styles.greetingRow}>
          <div className={styles.greetingText}>{adminName}, 반갑습니다</div>
          <button
            className={styles.logoutBtn}
            onClick={onLogout}
            aria-label="로그아웃"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </div>

      {/* Menu */}
      <nav className={styles.menu} aria-label="Primary">
        {MENU.map((m) => {
          const isActive = activeKey === m.key || isCancelChildActive;

          if (m.key === 'cancel-return-exchange') {
            return (
              <div key={m.key} className={styles.group}>
                <button
                  type="button"
                  className={clsx(
                    styles.menuItem,
                    isActive && styles.menuItemActive
                  )}
                  onClick={() => setOpen((v) => !v)}
                >
                  <span className={styles.menuLabel}>{m.label}</span>
                  <div>
                    <FiChevronDown
                      className={clsx(
                        styles.dropdownIcon,
                        open && styles.dropdownOpen
                      )}
                    />
                  </div>
                </button>

                {open && (
                  <div className={styles.submenu}>
                    {CANCEL_CHILDREN.map((child) => (
                      <button
                        key={child.key}
                        type="button"
                        className={clsx(
                          styles.submenuItem,
                          activeKey === child.key && styles.submenuItemActive
                        )}
                        onClick={() => onNavigate?.(child.key)}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={m.key}
              type="button"
              className={clsx(
                styles.menuItem,
                isActive && activeKey === m.key && styles.menuItemActive
              )}
              onClick={() => onNavigate?.(m.key)}
            >
              {m.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/** Simplified logo */
function MiniLogo() {
  return (
    <svg
      className={styles.logoSvg}
      viewBox="0 0 80 50"
      role="img"
      aria-label="Logo"
    >
      <path
        d="M50 10c6 0 12 6 12 12s-6 12-12 12-12-6-12-12 6-12 12-12z"
        fill="#B5DB58"
      />
      <rect x="60" y="5" width="12" height="22" rx="4" fill="#B5DB58" />
      <rect x="6" y="24" width="18" height="24" rx="4" fill="#66BFA7" />
      <path d="M22 28c5 0 9 4 9 9s-4 9-9 9" fill="#66BFA7" />
      <circle cx="69" cy="18" r="3" fill="#66BFA7" />
    </svg>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import styles from './AdminSideBar.module.css';
import clsx from 'clsx';
import { FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  {
    key: 'order-delivery-management/waiting-payment',
    label: '주문 및 배송관리',
  },
  { key: 'cancel-return-exchange', label: '주문 취소·반품/교환' },
  { key: 'tax-invoice-list', label: '세금 계산서 리스트' },
  {
    key: 'account-permission-management/general-member',
    label: '계정/권한 관리',
  },
  { key: 'animal-category-management', label: '동물 카테고리 관리' },
  { key: 'product-management', label: '상품 관리' },
  { key: 'referrer-code-management', label: '추천인 코드 관리' },
  { key: 'customer-service-center', label: '고객센터' },
];

const CANCEL_CHILDREN: MenuItem[] = [
  {
    key: 'cancellation-refund-exchange/cancellation-list',
    label: '취소 리스트',
  },
  {
    key: 'cancellation-refund-exchange/return-exchange-list/return-request',
    label: '반품/교환 리스트',
  },
];

// Default page to navigate to when clicking the parent row
const CANCEL_DEFAULT_KEY = CANCEL_CHILDREN[0].key;

export default function AdminSideBar({
  activeKey = 'orders-shipping',
  onNavigate,
  className,
  adminName = '관리자님',
  onLogout,
}: AdminSideBarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isCancelChildActive = activeKey.startsWith(
    'cancellation-refund-exchange/'
  );

  useEffect(() => {
    if (isCancelChildActive) setOpen(true);
  }, [isCancelChildActive]);

  const handleNavigate = (key: string) => {
    onNavigate?.(key);
    router.push(`/admin/pages/${key}`);

    // 👇 Close dropdown when navigating to any non-cancel menu
    if (!key.startsWith('cancellation-refund-exchange')) {
      setOpen(false);
    }
  };

  return (
    <aside className={clsx(styles.wrap, className)} aria-label="Admin sidebar">
      {/* Logo */}
      <div className={styles.logoBlock} aria-label="Brand">
        <Image
          src="/images/logo/pet-saves.png"
          alt="PetSave"
          width={75}
          height={50}
        />
      </div>

      {/* Greeting */}
      <div className={styles.greetingCard}>
        <div className={styles.greetingRow}>
          <div className={styles.greetingText}>{adminName}, 반갑습니다</div>
          <button
            className={styles.logoutBtn}
            onClick={onLogout}
            aria-label="로그아웃"
            type="button"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </div>

      {/* Menu */}
      <nav className={styles.menu} aria-label="Primary">
        {MENU.map((m) => {
          const isActive =
            activeKey === m.key ||
            (m.key === 'cancel-return-exchange' && isCancelChildActive);

          if (m.key === 'cancel-return-exchange') {
            return (
              <div key={m.key} className={styles.group}>
                {/* Parent row */}
                <button
                  type="button"
                  className={clsx(
                    styles.menuItem,
                    isActive && styles.menuItemActive
                  )}
                  onClick={() => {
                    // When parent clicked, open + navigate to default child
                    setOpen(true);
                    handleNavigate(CANCEL_DEFAULT_KEY);
                  }}
                  aria-expanded={open}
                  aria-controls="cancel-submenu"
                >
                  <span className={styles.menuLabel}>{m.label}</span>

                  {/* Dropdown toggle */}
                  <span
                    role="button"
                    tabIndex={0}
                    className={styles.chevronBtn}
                    aria-label={open ? '하위 메뉴 접기' : '하위 메뉴 펼치기'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen((v) => !v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen((v) => !v);
                      }
                    }}
                  >
                    <FiChevronDown
                      className={clsx(
                        styles.dropdownIcon,
                        open && styles.dropdownOpen
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                {/* Child submenu */}
                {open && (
                  <div
                    id="cancel-submenu"
                    className={styles.submenu}
                    role="group"
                    aria-label="주문 취소·반품/교환 하위 메뉴"
                  >
                    {CANCEL_CHILDREN.map((child) => (
                      <button
                        key={child.key}
                        type="button"
                        className={clsx(
                          styles.submenuItem,
                          activeKey === child.key && styles.submenuItemActive
                        )}
                        onClick={() => handleNavigate(child.key)}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Regular menu item
          return (
            <button
              key={m.key}
              type="button"
              className={clsx(
                styles.menuItem,
                activeKey === m.key && styles.menuItemActive
              )}
              onClick={() => handleNavigate(m.key)}
            >
              {m.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

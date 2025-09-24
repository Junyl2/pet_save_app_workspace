'use client';

import React from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { useUser } from '@/app/context/userContext';
import { FaChevronLeft } from 'react-icons/fa';

export default function BusinessInformationPage() {
  const router = useRouter();
  const { user } = useUser();

  // Redirect approved users directly to business information page
  React.useEffect(() => {
    if (user?.businessApprovalStatus === 'APPROVED') {
      router.push(
        '/client/seller/pages/my-page/business-information/seller-business-information'
      );
    }
  }, [user, router]);

  // Get status items for display (only for non-approved users)
  const getStatusItems = () => {
    const items = [
      {
        label: '사업자등록',
        status: '작성중',
        route:
          '/client/seller/pages/my-page/business-information/business-info-form',
        isActive: !user || user.businessApprovalStatus === null,
      },
      {
        label: '사업자등록',
        status: '승인 대기',
        route:
          '/client/seller/pages/my-page/business-information/business-info-form',
        isActive: user?.businessApprovalStatus === 'PENDING',
      },
      {
        label: '사업자등록',
        status: '반려',
        route:
          '/client/seller/pages/my-page/business-information/business-info-form',
        isActive: user?.businessApprovalStatus === 'REJECTED',
      },
    ];

    return items;
  };

  const handleItemClick = (route: string, status: string) => {
    console.log('🖱️ Clicking on status:', status, 'routing to:', route);
    console.log('👤 Current user status:', user?.businessApprovalStatus);
    router.push(route);
  };

  return (
    <>
      <ProductHeader />
      <main className={styles.wrapper}>
        <ul className={styles.list}>
          {getStatusItems().map((item, index) => (
            <li
              key={index}
              className={`${styles.item} ${
                item.isActive ? styles.activeItem : ''
              }`}
              onClick={() => handleItemClick(item.route, item.status)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.itemContent}>
                <div className={styles.itemText}>
                  <span className={styles.label}>{item.label}</span>
                  <span className={styles.status}>[{item.status}]</span>
                </div>
                <div className={styles.chevron}>
                  <FaChevronLeft
                    className={styles.chevronIcon}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <BottomBar />
    </>
  );
}

'use client';

import React, { useEffect } from 'react';
import styles from './page.module.css';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { FaChevronLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/userContext';
import { useAppSelector, useAppDispatch } from '@/app/redux/hooks';
import { fetchUserInfo } from '@/app/redux/slices/cache/userSlice';

export default function SellerRegistrationPage() {
  const router = useRouter();
  const { user } = useUser();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.user);
  const storeId = userInfo?.storeId || user?.storeId;
  const businessApprovalStatus =
    userInfo?.businessApprovalStatus || user?.businessApprovalStatus;

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [dispatch]);

  // Get status text based on businessApprovalStatus and storeId
  const getStatusText = (): string => {
    if (!businessApprovalStatus) {
      return '작성중';
    }

    switch (businessApprovalStatus) {
      case 'PENDING':
        return '승인 대기';
      case 'APPROVED':
        // If approved and has storeId, it's fully registered
        if (storeId) {
          return '등록 완료';
        }
        // If approved but no storeId yet, admin approval is complete
        return '관리자 승인 완료';
      case 'REJECTED':
        return '반려';
      default:
        return '작성중';
    }
  };

  const statusText = getStatusText();

  const handleItemClick = () => {
    router.push(
      `/client/seller/pages/my-page/business-information/seller-registration/register-status?status=${encodeURIComponent(
        statusText
      )}`
    );
  };

  return (
    <>
      <ProductHeader />
      <main className={styles.wrapper}>
        <ul className={styles.list}>
          <li
            className={styles.item}
            onClick={handleItemClick}
            role="button"
            tabIndex={0}
          >
            <div className={styles.itemContent}>
              <div className={styles.itemText}>
                <span className={styles.label}>사업자 등록하기</span>
                <span className={styles.status}>[{statusText}]</span>
              </div>
              <div className={styles.chevron}>
                <FaChevronLeft
                  className={styles.chevronIcon}
                  aria-hidden="true"
                />
              </div>
            </div>
          </li>
        </ul>
      </main>
      <BottomBar />
    </>
  );
}

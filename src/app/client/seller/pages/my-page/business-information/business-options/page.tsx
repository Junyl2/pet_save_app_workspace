'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { FaChevronLeft } from 'react-icons/fa';
import { useUser } from '@/app/context/userContext';
import { useAppSelector, useAppDispatch } from '@/app/redux/hooks';
import { fetchUserInfo } from '@/app/redux/slices/cache/userSlice';
import { PAGE_URLS } from '@/app/utils/page_url';
import styles from './page.module.css';

export default function BusinessOptionsPage() {
  const router = useRouter();
  const { user } = useUser();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.user);
  const storeId = userInfo?.storeId || user?.storeId;

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [dispatch]);

  const handleRegisterClick = () => {
    router.push(
      '/client/seller/pages/my-page/business-information/seller-registration'
    );
  };

  const handleViewProfileClick = () => {
    if (storeId) {
      router.push(`${PAGE_URLS.SELLER_STORE_INFO}?storeId=${storeId}`);
    } else {
      // Fallback if storeId is not available
      router.push(PAGE_URLS.SELLER_STORE_INFO);
    }
  };

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        <div className={styles.menuContainer}>
          <button className={styles.menuItem} onClick={handleRegisterClick}>
            <span className={styles.label}>사업자 등록하기</span>
            <FaChevronLeft className={styles.chevron} />
          </button>
          {/* Only show "View Business Profile" if business is approved (has storeId) */}
          {storeId && (
            <button
              className={styles.menuItem}
              onClick={handleViewProfileClick}
            >
              <span className={styles.label}>사업자 프로필 보기</span>
              <FaChevronLeft className={styles.chevron} />
            </button>
          )}
        </div>
      </div>
      <BottomBar />
    </>
  );
}

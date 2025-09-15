'use client';

import React, { useEffect, useMemo } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { useUser } from '@/app/context/userContext';
import { FaChevronLeft } from 'react-icons/fa';

type UserLike = {
  role?: string | null;
  shopId?: number | string | null;
  seller?: { shopId?: number | string | null } | null;
};

function isUserLike(value: unknown): value is UserLike {
  return typeof value === 'object' && value !== null;
}

function toNumOrNull(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

export default function BusinessInformationPage() {
  const router = useRouter();
  const { user } = useUser();

  // Get shopId from user or localStorage
  const derivedShopId = useMemo(() => {
    const fromUser = isUserLike(user)
      ? user.shopId ?? user.seller?.shopId ?? null
      : null;

    let fromStorage: number | null = null;
    if (typeof window !== 'undefined') {
      const lsSeller = Number(window.localStorage.getItem('sellerId'));
      const lsShop = Number(window.localStorage.getItem('shopId'));
      const pick = Number.isFinite(lsSeller)
        ? lsSeller
        : Number.isFinite(lsShop)
        ? lsShop
        : NaN;
      fromStorage = Number.isFinite(pick) ? pick : null;
    }

    const u = toNumOrNull(fromUser);
    return u ?? fromStorage;
  }, [user]);

  // 🔗 Route to registration status page
  const goRegister = () =>
    router.push(
      '/client/seller/pages/my-page/business-information/seller-registration'
    );

  // 🔗 Route to profile page based on shopId or fallback
  const goProfile = () => {
    const role =
      isUserLike(user) && typeof user.role === 'string'
        ? user.role.toLowerCase()
        : '';

    if (role !== 'seller') {
      router.push(
        '/client/seller/pages/my-page/business-information/seller-registration'
      );
      return;
    }

    if (Number.isFinite(Number(derivedShopId))) {
      router.push(
        `/client/seller/pages/change-profile?shopId=${derivedShopId}`
      );
      return;
    }

    router.push('/client/seller/pages/change-profile');
  };

  // keep shopId in localStorage for change-profile page
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      Number.isFinite(Number(derivedShopId))
    ) {
      window.localStorage.setItem('shopId', String(derivedShopId));
      window.localStorage.setItem('sellerId', String(derivedShopId));
    }
  }, [derivedShopId]);

  return (
    <>
      <ProductHeader />
      <main className={styles.wrapper}>
        <ul className={styles.list}>
          <li
            className={styles.item1}
            onClick={goRegister}
            role="button"
            tabIndex={0}
          >
            <div className={styles.greenBorder}>
              <span className={styles.label}>사업자 등록하기</span>
              <FaChevronLeft className={styles.chevron} aria-hidden="true" />
            </div>
          </li>

          <li
            className={styles.item2}
            onClick={goProfile}
            role="button"
            tabIndex={0}
          >
            <div className={styles.redBorder}>
              <span className={styles.label}>사업자 프로필 보기</span>
              <FaChevronLeft className={styles.chevron} aria-hidden="true" />
            </div>
          </li>
        </ul>
      </main>
      <BottomBar />
    </>
  );
}

'use client';

import React from 'react';
import styles from './page.module.css';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const REGISTRATION_STEPS = [
  { label: '사업자 등록하기', status: '작성중' },
  { label: '사업자 등록하기', status: '승인 대기' },
  { label: '사업자 등록하기', status: '관리자 승인 완료' },
  { label: '사업자 등록하기', status: 'PG 등록 요청됨' },
  { label: '사업자 등록하기', status: '등록 완료' },
  { label: '사업자 등록하기', status: '반려' },
];

export default function SellerRegistrationPage() {
  const router = useRouter();
  const go = (status: string) =>
    router.push(
      `/client/seller/pages/my-page/business-information/seller-registration/register-status?status=${encodeURIComponent(
        status
      )}`
    );

  return (
    <>
      <ProductHeader />
      <main className={styles.wrapper}>
        <ul className={styles.list}>
          {REGISTRATION_STEPS.map((s, i) => (
            <li
              key={i}
              className={styles.item}
              onClick={() => go(s.status)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.textWrap}>
                <span className={styles.label}>{s.label}</span>
                <span className={styles.status}>[{s.status}]</span>
              </div>
              <FaChevronRight className={styles.chevron} />
            </li>
          ))}
        </ul>
      </main>
      <BottomBar />
    </>
  );
}

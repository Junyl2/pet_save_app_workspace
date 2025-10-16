'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import styles from './page.module.css';

interface MockRefundItem {
  id: string;
  image: string;
  title: string;
  option: string;
  buyer: string;
  tags: Array<{ label: string; tone: 'red' | 'green' | 'purple' | 'gray' }>;
  actions?: Array<{ label: string; tone: 'green' | 'red' }>;
}

const mockRefunds: MockRefundItem[] = [
  {
    id: 'refund-1',
    image: '/images/products/dogfood.png',
    title: '6free 강아지 사료 치킨 레시피, 6kg',
    option: '옵션: 6kg/2개',
    buyer: '구매자: puplover',
    tags: [
      { label: '반품', tone: 'red' },
      { label: '대기중', tone: 'gray' },
    ],
    actions: [
      { label: '승인', tone: 'green' },
      { label: '반려', tone: 'red' },
    ],
  },
  {
    id: 'refund-2',
    image: '/images/products/cat-snacks.png',
    title: '펫사랑 유기농 강아지 간식, 200g',
    option: '옵션: 200g/2개',
    buyer: '구매자: catmit',
    tags: [
      { label: '교환', tone: 'purple' },
      { label: '처리완료', tone: 'green' },
    ],
    actions: [
      { label: '승인', tone: 'green' },
      { label: '반려', tone: 'red' },
    ],
  },
  {
    id: 'refund-3',
    image: '/images/products/reptomin.png',
    title: '올바른 선택 고양이 모래, 5kg',
    option: '옵션: 5kg/1개',
    buyer: '구매자: catmit',
    tags: [
      { label: '교환', tone: 'purple' },
      { label: '대기중', tone: 'gray' },
    ],
    actions: [
      { label: '승인', tone: 'green' },
      { label: '반려', tone: 'red' },
    ],
  },
];

export default function RefundRequestPage() {
  const pathname = usePathname();

  return (
    <>
      <TopBar />
      <div className={styles.pageContainer}>
        {/* Top Tab Header */}
        <div className={styles.topTabHeader}>
          <div>
            <Link
              href="/client/seller/pages/seller-product-list"
              className={`${styles.tabLink} ${
                pathname === '/client/seller/pages/seller-product-list'
                  ? styles.tabLinkActive
                  : styles.tabLinkInactive
              }`}
            >
              상품 리스트
            </Link>
          </div>
          <div>
            <Link
              href="/client/seller/pages/seller-product-list/refund-request"
              className={`${styles.tabLink} ${
                pathname ===
                '/client/seller/pages/seller-product-list/refund-request'
                  ? styles.tabLinkActive
                  : styles.tabLinkInactive
              }`}
            >
              반품/교환 요청
            </Link>
          </div>
        </div>

        <div className={styles.contentWrapper}>
          {/* Filters: 전체 / 반품 / 교환 / 상태 태그 */}
          <div className={styles.filterContainer}>
            {['전체', '반품', '교환'].map((label, idx) => {
              const isActive = idx === 0;
              return (
                <div
                  key={label}
                  className={`${styles.filterButton} ${
                    isActive
                      ? styles.filterButtonActive
                      : styles.filterButtonInactive
                  }`}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {/* Cards */}
          <div className={styles.cardsContainer}>
            {mockRefunds.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardImageContainer}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={90}
                    height={90}
                    className={styles.cardImage}
                  />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.tagsContainer}>
                    {item.tags.map((t) => (
                      <span
                        key={`${item.id}-${t.label}`}
                        className={`${styles.tag} ${
                          styles[
                            `tag${
                              t.tone.charAt(0).toUpperCase() + t.tone.slice(1)
                            }`
                          ]
                        }`}
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <div className={styles.cardText}>{item.title}</div>
                  <div className={styles.cardText}>{item.option}</div>
                  <div className={styles.cardText}>{item.buyer}</div>
                </div>

                <div className={styles.cardActionsContainer}>
                  <div className={styles.detailButton}>상세보기</div>
                  {item.actions?.map((a) => (
                    <div
                      key={`${item.id}-${a.label}`}
                      className={`${styles.actionButton} ${
                        styles[
                          `actionButton${
                            a.tone.charAt(0).toUpperCase() + a.tone.slice(1)
                          }`
                        ]
                      }`}
                    >
                      {a.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomBar />
    </>
  );
}

'use client';

import React, { useMemo, useEffect, useState } from 'react';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { IoChevronDownOutline } from 'react-icons/io5';

const slugToTabKey = {
  'set-payment-policy': '지급 정책 설정',
  'payment-details': '지급 내역',
};

interface ReferrerData {
  id: string;
  storeName: string;
  totalMembers: number;
  totalPoints: number;
  status: '정상' | '일시정지';
}

const PAGE_SIZE = 10;

export default function DocumentListPage() {
  const [selectedOption, setSelectedOption] = useState('전체');
  const [open, setOpen] = useState(false);

  const { page, setPage } = usePageParam(1);
  const router = useRouter();
  const pathname = usePathname();

  const activeSlug =
    Object.keys(slugToTabKey).find((slug) => pathname.includes(slug)) ||
    'payment-details';

  const mockData: ReferrerData[] = [
    {
      id: '1',
      storeName: 'ㅇㅇ 동물병원',
      totalMembers: 80,
      totalPoints: 80000,
      status: '정상',
    },
    {
      id: '2',
      storeName: 'ㅇㅇ 동물병원',
      totalMembers: 12,
      totalPoints: 12000,
      status: '정상',
    },
    {
      id: '3',
      storeName: 'ㅇㅇ 동물병원',
      totalMembers: 80,
      totalPoints: 80000,
      status: '정상',
    },
    {
      id: '4',
      storeName: 'ㅇㅇ 동물병원',
      totalMembers: 12,
      totalPoints: 12000,
      status: '일시정지',
    },
    {
      id: '5',
      storeName: 'ㅇㅇ 동물병원',
      totalMembers: 80,
      totalPoints: 80000,
      status: '정상',
    },
    {
      id: '6',
      storeName: 'ㅇㅇ 동물병원',
      totalMembers: 12,
      totalPoints: 12000,
      status: '일시정지',
    },
    {
      id: '7',
      storeName: 'ㅇㅇ 동물병원',
      totalMembers: 80,
      totalPoints: 80000,
      status: '정상',
    },
    {
      id: '8',
      storeName: 'ㅇㅇ 동물병원',
      totalMembers: 12,
      totalPoints: 12000,
      status: '정상',
    },
    {
      id: '9',
      storeName: 'ㅇㅇ 동물병원',
      totalMembers: 80,
      totalPoints: 80000,
      status: '정상',
    },
    {
      id: '10',
      storeName: 'ㅇㅇ 동물병원',
      totalMembers: 12,
      totalPoints: 12000,
      status: '일시정지',
    },
  ];

  const pagedData = useMemo(
    () => mockData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page]
  );
  const totalPages = Math.ceil(mockData.length / PAGE_SIZE);

  return (
    <>
      <header className={styles.wrap}>
        <h1 className={styles.title}>추천인 코드 관리</h1>
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
                router.push(`/admin/pages/referrer-code-management/${slug}`)
              }
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className={styles.topHeader}>
        <div className={styles.dropdownWrapper}>
          <div className={styles.dropdownHeader}>
            <span>{selectedOption}</span>
            <IoChevronDownOutline className={styles.dropdownIcon} />
          </div>
          {open && (
            <div className={styles.dropdownList}>
              {['전체', '판매중', '품절'].map((option) => (
                <div key={option} className={styles.dropdownItem}>
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.searchWrap}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="검색어를 입력하세요"
          />
          <button type="button" className={styles.searchBtn}>
            검색
          </button>
        </div>
      </div>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>판매자</div>
          <div>총 가입자</div>
          <div>총 지급액</div>
          <div>상태</div>
          <div></div>
        </div>

        {/* Data Rows */}
        {pagedData.map((item) => (
          <div key={item.id} className={styles.row}>
            <div>{item.storeName}</div>
            <div>{item.totalMembers}명</div>
            <div>{item.totalPoints.toLocaleString('ko-KR')}P</div>
            <div>{item.status}</div>
            <div className={styles.actions}>
              <button className={styles.pauseBtn}>지급 일시중지</button>
              <button className={styles.resumeBtn}>지급재개</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}
        >
          <div style={{ width: 320 }}>
            <OrderPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </>
  );
}

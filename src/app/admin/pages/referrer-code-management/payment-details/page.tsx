'use client';

import React, { useState, useCallback, useEffect } from 'react';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { IoChevronDownOutline } from 'react-icons/io5';
import { ReferralManagementService } from '@/app/api/services/admin/referralManangementService/referralManagementService';
import type { StorePointPaymentStatus } from '@/app/api/services/admin/referralManangementService/referralManagement';

const slugToTabKey = {
  'set-payment-policy': '지급 정책 설정',
  'payment-details': '지급 내역',
};

interface ReferrerData {
  storeId: string;
  businessName: string;
  totalSubscribers: number;
  totalPointPayments: number;
  status: '정상' | '일시정지';
  isPaused: boolean;
}

const PAGE_SIZE = 10;

export default function DocumentListPage(): React.ReactElement {
  const [selectedOption, setSelectedOption] = useState('전체');
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [data, setData] = useState<ReferrerData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { page, setPage } = usePageParam(1);
  const router = useRouter();
  const pathname = usePathname();

  const activeSlug =
    Object.keys(slugToTabKey).find((slug) => pathname.includes(slug)) ||
    'payment-details';

  /** Calculate isPaused from pausedAt and reactivatedAt fields in response */
  const getIsPaused = useCallback((item: StorePointPaymentStatus): boolean => {
    // If pausedAt is not null and reactivatedAt is null, it's paused
    return item.pausedAt !== null && item.reactivatedAt === null;
  }, []);

  /** Determine status based on pause state */
  const getStatus = useCallback(
    (item: StorePointPaymentStatus): '정상' | '일시정지' => {
      const isPaused = getIsPaused(item);
      return isPaused ? '일시정지' : '정상';
    },
    [getIsPaused]
  );

  /** Fetch store point payments */
  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params: {
        keyword?: string;
        isPaused?: boolean;
        page: number;
        size: number;
        sortBy:
          | 'createdAt'
          | 'updatedAt'
          | 'businessName'
          | 'totalSubscribers'
          | 'totalAwardedPoints';
        direction: 'asc' | 'desc';
      } = {
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      };

      if (searchKeyword.trim()) {
        params.keyword = searchKeyword.trim();
      }

      // Filter by pause status
      if (selectedOption === '일시정지') {
        params.isPaused = true;
      } else if (selectedOption === '정상') {
        params.isPaused = false;
      }

      const { data: response, error } =
        await ReferralManagementService.searchStorePointPayments(params);

      if (error || !response?.data) {
        console.error('[PaymentDetailsPage] Fetch failed:', error);
        setData([]);
        setTotalPages(1);
        return;
      }

      const mapped: ReferrerData[] = response.data.content.map((item) => {
        const isPaused = getIsPaused(item);
        return {
          storeId: item.storeId,
          businessName: item.businessName,
          totalSubscribers: item.totalSubscribers,
          totalPointPayments: item.totalPointPayments,
          status: getStatus(item),
          isPaused,
        };
      });

      setData(mapped);
      setTotalPages(response.data.pageInfo.totalPages || 1);
    } catch (err) {
      console.error('[PaymentDetailsPage] Fetch error:', err);
      setData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, searchKeyword, selectedOption, getStatus, getIsPaused]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  /** Handle pause action */
  const handlePause = useCallback(
    async (
      storeId: string,
      e?: React.MouseEvent<HTMLButtonElement>
    ): Promise<void> => {
      e?.preventDefault();
      e?.stopPropagation();

      const reason = prompt('일시정지 사유를 입력하세요:');
      if (!reason || !reason.trim()) {
        return;
      }

      try {
        const { data, error } =
          await ReferralManagementService.pauseStorePointPayments(storeId, {
            reason: reason.trim(),
          });

        if (error || !data?.success) {
          console.error('[PaymentDetailsPage] Pause failed:', error);
          alert('일시정지에 실패했습니다.');
          return;
        }

        alert('일시정지되었습니다.');
        // Wait a moment for backend to process, then refetch
        setTimeout(() => {
          void fetchData();
        }, 500);
      } catch (err) {
        console.error('[PaymentDetailsPage] Pause error:', err);
        alert('일시정지에 실패했습니다.');
      }
    },
    [fetchData]
  );

  /** Handle reactivate action */
  const handleReactivate = useCallback(
    async (
      storeId: string,
      e?: React.MouseEvent<HTMLButtonElement>
    ): Promise<void> => {
      e?.preventDefault();
      e?.stopPropagation();

      if (!confirm('지급을 재개하시겠습니까?')) {
        return;
      }

      try {
        const { data, error } =
          await ReferralManagementService.reactivateStorePointPayments(storeId);

        if (error || !data?.success) {
          console.error('[PaymentDetailsPage] Reactivate failed:', error);
          alert('재개에 실패했습니다.');
          return;
        }

        alert('재개되었습니다.');
        // Wait a moment for backend to process, then refetch
        setTimeout(() => {
          void fetchData();
        }, 500);
      } catch (err) {
        console.error('[PaymentDetailsPage] Reactivate error:', err);
        alert('재개에 실패했습니다.');
      }
    },
    [fetchData]
  );

  /** Handle search */
  const handleSearch = useCallback(() => {
    setSearchKeyword(keyword);
    setPage(1);
  }, [keyword, setPage]);

  /** Toggle dropdown visibility */
  const toggleDropdown = useCallback(() => setOpen((prev) => !prev), []);

  /** Select filter option */
  const handleSelectOption = useCallback(
    (option: string): void => {
      setSelectedOption(option);
      setOpen(false);
      setPage(1);
    },
    [setPage]
  );

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 className={styles.title}>추천인 코드 관리</h1>
        <div>로딩 중...</div>
      </div>
    );
  }

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
        {/* Dropdown */}
        <div className={styles.dropdownWrapper}>
          <div
            className={styles.dropdownHeader}
            onClick={toggleDropdown}
            role="button"
            tabIndex={0}
          >
            <span>{selectedOption}</span>
            <IoChevronDownOutline className={styles.dropdownIcon} />
          </div>
          {open && (
            <div className={styles.dropdownList}>
              {['전체', '정상', '일시정지'].map((option) => (
                <div
                  key={option}
                  className={styles.dropdownItem}
                  onClick={() => handleSelectOption(option)}
                  role="button"
                  tabIndex={0}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form
          className={styles.searchWrap}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <input
            type="text"
            className={styles.searchInput}
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>
            검색
          </button>
        </form>
      </div>

      {/* Table */}
      <div className={styles.container}>
        <div className={styles.header}>
          <div>판매자</div>
          <div>총 가입자</div>
          <div>총 지급액</div>
          <div>상태</div>
          <div />
        </div>

        {data.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            데이터가 없습니다.
          </div>
        ) : (
          data.map((item) => (
            <div key={item.storeId} className={styles.row}>
              <div>{item.businessName}</div>
              <div>{item.totalSubscribers}명</div>
              <div>{item.totalPointPayments.toLocaleString('ko-KR')}P</div>
              <div
                style={{
                  color: item.status === '정상' ? '#009329' : '#EA080C',
                }}
              >
                {item.status}
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.pauseBtn}
                  onClick={(e) => handlePause(item.storeId, e)}
                >
                  지급 일시중지
                </button>
                <button
                  type="button"
                  className={styles.resumeBtn}
                  onClick={(e) => handleReactivate(item.storeId, e)}
                >
                  지급재개
                </button>
              </div>
            </div>
          ))
        )}
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

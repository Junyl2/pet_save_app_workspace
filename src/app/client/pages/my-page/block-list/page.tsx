'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import styles from './BlockListPage.module.css';

import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import Loading from '@/app/components/ui/Loading/Loading';

import { BlockService } from '@/app/api/services/client/memberService/block/blockService';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { ReportService } from '@/app/api/services/client/memberService/report/reportService';

import { BlockedStore } from '@/app/api/types/member/block/block';

const PAGE_SIZE = 10;

export default function BlockListPage() {
  const [memberId, setMemberId] = useState<string | null>(null);

  // Infinite scroll state
  const [accumulatedBlocks, setAccumulatedBlocks] = useState<BlockedStore[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Unblock processing UI
  const [processingStoreId, setProcessingStoreId] = useState<string | null>(
    null
  );

  // Reports
  const [myReportCount, setMyReportCount] = useState(0);
  const [receivedReportCount] = useState(0);

  /* -------------------------------------------------------
     Fetch Member ID
  ------------------------------------------------------- */
  useEffect(() => {
    const loadMemberId = async () => {
      try {
        const res = await MemberService.getMyInfo();
        if (res.error || !res.data?.data?.memberId) {
          toast.error('회원 정보를 가져오는 데 실패했습니다.');
          setLoadingInitial(false);
          return;
        }
        setMemberId(res.data.data.memberId);
      } catch (err) {
        console.error('[BlockListPage] loadMemberId error:', err);
        toast.error('회원 정보를 불러오는 중 오류가 발생했습니다.');
        setLoadingInitial(false);
      }
    };

    loadMemberId();
  }, []);

  /* -------------------------------------------------------
     Load Report Stats
  ------------------------------------------------------- */
  useEffect(() => {
    const loadReportStats = async () => {
      try {
        const res = await ReportService.getMyReports({ page: 0, size: 1 });
        if (!res.error && res.data?.data?.pageInfo) {
          setMyReportCount(res.data.data.pageInfo.totalElements);
        }
      } catch {
        console.error('Failed to load report stats');
      }
    };

    if (memberId) loadReportStats();
  }, [memberId]);

  /* -------------------------------------------------------
     Infinite Scroll - Fetch Blocked Stores
  ------------------------------------------------------- */
  const loadBlockedStores = useCallback(
    async (page: number) => {
      if (!memberId) return;

      if (page === 0) {
        setAccumulatedBlocks([]);
        setHasMore(true);
      }

      setIsLoadingMore(true);

      try {
        const res = await BlockService.getMyBlockedStores({
          page,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc',
        });

        if (res.error || !res.data?.data) {
          toast.error('차단한 가게를 불러오는 데 실패했습니다.');
          return;
        }

        const { content, pageInfo } = res.data.data;

        setAccumulatedBlocks((prev) =>
          page === 0 ? content : [...prev, ...content]
        );

        setHasMore(pageInfo.hasNext);
      } catch (err) {
        console.error('[BlockListPage] loadBlockedStores error:', err);
        toast.error('차단 가게 목록을 가져오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoadingMore(false);
        setLoadingInitial(false);
      }
    },
    [memberId]
  );

  /* -------------------------------------------------------
     Trigger next page on scroll
  ------------------------------------------------------- */
  useEffect(() => {
    if (!memberId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadBlockedStores(nextPage);
        }
      },
      { threshold: 0.25 }
    );

    const target = observerRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [currentPage, hasMore, isLoadingMore, loadBlockedStores, memberId]);

  /* -------------------------------------------------------
     Initial page load
  ------------------------------------------------------- */
  useEffect(() => {
    if (memberId) {
      setCurrentPage(0);
      loadBlockedStores(0);
    }
  }, [memberId, loadBlockedStores]);

  /* -------------------------------------------------------
     Unblock
  ------------------------------------------------------- */
  const handleUnblock = async (storeId: string, storeName: string) => {
    setProcessingStoreId(storeId);

    try {
      const res = await BlockService.toggleBlockStore(storeId);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      const isUnblocked =
        res.data?.resultMsg?.includes('해제') ||
        res.data?.resultMsg?.toLowerCase().includes('unblock');

      if (isUnblocked) {
        toast.success(`${storeName} 차단을 해제했습니다.`);

        const updated = accumulatedBlocks.filter(
          (store) => store.storeId !== storeId
        );
        setAccumulatedBlocks(updated);

        if (updated.length === 0) {
          loadBlockedStores(0);
        }
      } else {
        toast.success(`${storeName} 차단되었습니다.`);
        loadBlockedStores(0);
      }
    } catch (err) {
      console.error('[BlockListPage] unblock error:', err);
      toast.error('차단 해제 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessingStoreId(null);
    }
  };

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  if (loadingInitial) return <Loading />;

  return (
    <>
      <ProductHeader />

      <div className={styles.container}>
        {/* ---------------- REPORT SECTION ---------------- */}
        <div className={styles.reportStatsContainer}>
          <p className={styles.label}>신고 관리</p>

          <div className={styles.reportStatsInner}>
            <div className={styles.statsRow}>
              <span className={styles.statsLabel}>내가 신고한 횟수</span>
              <span className={styles.statsReported}>{myReportCount}회</span>
            </div>

            <div className={styles.statsDivider} />

            <div className={styles.statsRow}>
              <span className={styles.statsLabel}>신고 받은 횟수</span>
              <span className={styles.statsReceived}>
                {receivedReportCount}회
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- EMPTY STATES ---------------- */}
        {!memberId ? (
          <EmptyState message="로그인이 필요합니다." />
        ) : accumulatedBlocks.length === 0 ? (
          <EmptyState message="차단한 가게가 없습니다." />
        ) : (
          <div>
            <div className={styles.blockedHeader}>
              <span className={styles.blockedLabel}>차단된 가게</span>
              <span className={styles.blockedCount}>
                {accumulatedBlocks.length}개
              </span>
            </div>

            <ul className={styles.list}>
              {accumulatedBlocks.map((store) => (
                <li key={store.blockId} className={styles.listItem}>
                  <div className={styles.avatarWrap}>
                    <Image
                      src={
                        store.storeProfileImageUrl ||
                        '/images/default-store.png'
                      }
                      alt={store.storeName}
                      width={55}
                      height={55}
                      className={styles.avatar}
                    />
                  </div>

                  <div className={styles.infoWrap}>
                    <p className={styles.storeName}>{store.storeName}</p>
                    <p className={styles.phone}>
                      {store.storePhoneNumber || '전화번호 없음'}
                    </p>
                    <p className={styles.address}>
                      {store.storeAddress || '주소 정보 없음'}
                    </p>
                  </div>

                  <button
                    className={styles.unblockBtn}
                    disabled={processingStoreId === store.storeId}
                    onClick={() =>
                      handleUnblock(store.storeId, store.storeName)
                    }
                  >
                    {processingStoreId === store.storeId
                      ? '해제 중...'
                      : '차단해제'}
                  </button>
                </li>
              ))}
            </ul>

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div
                ref={observerRef}
                style={{ height: '20px', width: '100%' }}
              />
            )}

            {/* Loading more indicator */}
            {isLoadingMore && (
              <p className={styles.loadingMore}>불러오는 중...</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------
   EMPTY STATE COMPONENT
------------------------------------------------------- */
function EmptyState({ message }: { message: string }) {
  return (
    <div className={styles.emptyState}>
      <IllustrationEmpty />
      <p>{message}</p>
    </div>
  );
}

/* -------------------------------------------------------
   ILLUSTRATION COMPONENT
------------------------------------------------------- */
function IllustrationEmpty() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 300"
      width="180"
      height="180"
    >
      <circle cx="200" cy="150" r="120" fill="#E8F8F4" />
      <path
        d="M120 170c20-40 60-70 80-70s60 30 80 70"
        stroke="#66BFA7"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="160" cy="130" r="6" fill="#66BFA7" />
      <circle cx="240" cy="130" r="6" fill="#66BFA7" />
      <path
        d="M160 195c15 10 65 10 80 0"
        stroke="#66BFA7"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

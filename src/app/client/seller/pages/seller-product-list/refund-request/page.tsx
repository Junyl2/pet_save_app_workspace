'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import styles from './page.module.css';
import { returnExchangeService } from '@/app/api/services/client/return-exchange/returnExchangeService';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { ReturnExchangeDrawer } from './drawer/ReturnExchangeDrawer';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';

interface PaginatedReturnExchange {
  content: Array<{
    returnRequestId: string;
    orderNumber: string;
    requester: {
      memberId: string;
      name: string;
      profileImageUrl: string | null;
    };
    storeName: string;
    storeProfileImageUrl: string | null;
    type: string;
    reason: string;
    status: string;
    collectionMethod: string;
    items: Array<{
      product: {
        productName: string;
        productThumbnail: string | null;
        salePrice: number;
        discountedPrice: number;
      };
    }>;
  }>;
}

function hasContentArray(data: unknown): data is PaginatedReturnExchange {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as Record<string, unknown>).content)
  );
}

//  Status translation helper
function getKoreanStatus(status: string): string {
  switch (status) {
    case 'REQUESTED':
      return '대기중';
    case 'APPROVED':
      return '승인됨';
    case 'REJECTED':
      return '반려됨';
    case 'WAITING_FOR_RETURN':
      return '반품 대기중';
    case 'RETURNED':
      return '반품 완료';
    case 'EXCHANGED':
      return '교환 완료';
    default:
      return status;
  }
}

export default function RefundRequestPage() {
  const pathname = usePathname();
  const [activeFilter, setActiveFilter] = useState<'전체' | '반품' | '교환'>(
    '전체'
  );
  const [requests, setRequests] = useState<PaginatedReturnExchange['content']>(
    []
  );
  const [selectedRequest, setSelectedRequest] = useState<
    PaginatedReturnExchange['content'][number] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const memberResponse = await MemberService.getMyInfo();
        if (memberResponse.error || !memberResponse.data)
          throw new Error('회원 정보를 가져올 수 없습니다.');

        const storeId = memberResponse.data.data.storeId ?? '';
        if (!storeId) throw new Error('스토어 ID를 찾을 수 없습니다.');

        const res = await returnExchangeService.getByStore(storeId, {
          page: 0,
          size: 20,
          sortBy: 'createdAt',
          direction: 'desc',
        });

        if (res.error || !res.data)
          throw new Error('반품/교환 요청을 불러올 수 없습니다.');

        const apiData: unknown = res.data.data;
        if (!hasContentArray(apiData))
          throw new Error('예상치 못한 응답 형식입니다.');

        setRequests(apiData.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터 불러오기 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusUpdate = async (
    requestId: string,
    status: 'APPROVED' | 'REJECTED'
  ): Promise<void> => {
    try {
      await returnExchangeService.updateStatus(requestId, { status });
      setRequests((prev) =>
        prev.map((r) =>
          r.returnRequestId === requestId ? { ...r, status } : r
        )
      );
      setToast(status === 'APPROVED' ? '승인되었습니다.' : '반려되었습니다.');
    } catch {
      setToast('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const filteredRequests = useMemo(() => {
    if (activeFilter === '전체') return requests;
    return requests.filter((r) =>
      activeFilter === '반품' ? r.type === 'RETURN' : r.type === 'EXCHANGE'
    );
  }, [activeFilter, requests]);

  if (loading)
    return (
      <>
        <TopBar />
        <div className={styles.pageContainer}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            불러오는 중...
          </div>
        </div>
        <BottomBar />
      </>
    );

  if (error)
    return (
      <>
        <TopBar />
        <div className={styles.pageContainer}>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            {error}
          </div>
        </div>
        <BottomBar />
      </>
    );

  return (
    <>
      <TopBar />
      <div className={styles.pageContainer}>
        {/* Tabs */}
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
          {/* Filter Buttons */}
          <div className={styles.filterContainer}>
            {(['전체', '반품', '교환'] as const).map((label) => (
              <div
                key={label}
                className={`${styles.filterButton} ${
                  activeFilter === label
                    ? styles.filterButtonActive
                    : styles.filterButtonInactive
                }`}
                onClick={() => setActiveFilter(label)}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Cards */}
          <div className={styles.cardsContainer}>
            {filteredRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                요청이 없습니다.
              </div>
            ) : (
              filteredRequests.map((item) => {
                const product = item.items?.[0]?.product;
                const thumbnail =
                  product?.productThumbnail || '/images/products/dogfood.png';
                const exchangeOption = '옵션: 교환 옵션 (임시 표시)';

                const koreanStatus = getKoreanStatus(item.status);

                return (
                  <div key={item.returnRequestId} className={styles.card}>
                    <div className={styles.cardImageContainer}>
                      <img
                        src={thumbnail}
                        alt={product?.productName || '상품 이미지'}
                        className={styles.cardImage}
                      />
                    </div>

                    <div className={styles.cardContent}>
                      <div className={styles.tagsContainer}>
                        <span
                          className={`${styles.tag} ${
                            item.type === 'RETURN'
                              ? styles.tagRed
                              : styles.tagPurple
                          }`}
                        >
                          {item.type === 'RETURN' ? '반품' : '교환'}
                        </span>
                        <span
                          className={`${styles.tag} ${
                            item.status === 'APPROVED'
                              ? styles.tagGreen
                              : item.status === 'REJECTED'
                              ? styles.tagRed
                              : styles.tagGray
                          }`}
                        >
                          {koreanStatus}
                        </span>
                      </div>
                      <div className={styles.cardText}>
                        {product?.productName}
                      </div>
                      <div className={styles.cardText}>{exchangeOption}</div>
                      <div className={styles.cardText}>
                        구매자: {item.requester?.name}
                      </div>
                    </div>

                    <div className={styles.cardActionsContainer}>
                      <div
                        className={styles.detailButton}
                        onClick={() => setSelectedRequest(item)}
                      >
                        상세보기
                      </div>
                      <div className={styles.actionButtons}>
                        <div
                          className={`${styles.actionButton} ${styles.actionButtonGreen}`}
                          onClick={() =>
                            handleStatusUpdate(item.returnRequestId, 'APPROVED')
                          }
                        >
                          승인
                        </div>
                        <div
                          className={`${styles.actionButton} ${styles.actionButtonRed}`}
                          onClick={() =>
                            handleStatusUpdate(item.returnRequestId, 'REJECTED')
                          }
                        >
                          반려
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <ReturnExchangeDrawer
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        requestData={selectedRequest}
        onStatusUpdate={(id, status) => {
          setRequests((prev) =>
            prev.map((r) => (r.returnRequestId === id ? { ...r, status } : r))
          );
          setToast(
            status === 'APPROVED' ? '승인되었습니다.' : '반려되었습니다.'
          );
        }}
      />

      {toast && <ToastMessage message={toast} onClose={() => setToast(null)} />}

      <BottomBar />
    </>
  );
}

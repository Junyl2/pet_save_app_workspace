'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { returnExchangeService } from '@/app/api/services/client/return-exchange/returnExchangeService';
import { BaseApiResponse } from '@/app/api/types/member/return-exchange/returnExchange';
import { useOrderFilter } from '@/app/context/orderFilterContext';

interface ReturnRequestRow {
  orderNumber: string;
  orderDate: string;
  requesterName: string;
  phoneNumber: string;
  productName: string;
  returnDate: string;
  typeLabel: string;
}

interface ReturnExchangeResponse {
  content: ApiReturnRequest[];
  pageInfo: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

interface ApiReturnRequest {
  returnRequestId: string;
  orderNumber: string;
  requester: {
    memberId: string;
    name: string;
    profileImageUrl?: string;
    phoneNumber?: string | null;
  };
  storeName: string;
  storeProfileImageUrl?: string | null;
  type: 'RETURN' | 'EXCHANGE';
  reason: string;
  exchangeOption?: string | null;
  status: string;
  collectionMethod: string;
  items: {
    product: {
      productId: string;
      productName: string;
      productThumbnail?: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE = 10;

export default function ReturnRequestPage() {
  const { page, setPage } = usePageParam(1);
  const [requests, setRequests] = useState<ReturnRequestRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const { filters, filterTrigger } = useOrderFilter();

  const fetchReturnRequests = useCallback(async (): Promise<void> => {
    setLoading(true);

    try {
      const params: {
        page: number;
        size: number;
        sortBy: 'createdAt';
        direction: 'desc';
        type: 'RETURN';
        dateStart?: string;
        dateEnd?: string;
      } = {
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
        type: 'RETURN',
      };

      if (filters.dateStart) params.dateStart = filters.dateStart;
      if (filters.dateEnd) params.dateEnd = filters.dateEnd;

      const { data } = await returnExchangeService.getAll(params);

      const res = data as unknown as BaseApiResponse<ReturnExchangeResponse>;
      const result = res.data;

      const mapped: ReturnRequestRow[] =
        result.content
          ?.filter((r) => r.type === 'RETURN')
          .map((r) => ({
            orderNumber: r.orderNumber ?? '-',
            orderDate: new Date(r.updatedAt).toLocaleString('ko-KR', {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
            requesterName: r.requester.name ?? '-',

            // FIX: Normalize phone number safely
            phoneNumber:
              r.requester.phoneNumber && r.requester.phoneNumber.trim() !== ''
                ? r.requester.phoneNumber
                : '-',

            productName: r.items?.[0]?.product?.productName ?? '-',
            returnDate: new Date(r.createdAt).toLocaleString('ko-KR', {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
            typeLabel: r.type === 'RETURN' ? '반품' : '교환',
          })) ?? [];

      setRequests(mapped);
      setTotalPages(result.pageInfo?.totalPages ?? 1);
    } catch (err) {
      console.error('Failed to fetch return requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters.dateStart, filters.dateEnd]);

  useEffect(() => {
    if (filterTrigger > 0 && page !== 1) {
      setPage(1);
    }
  }, [filterTrigger, page, setPage]);

  useEffect(() => {
    void fetchReturnRequests();
  }, [fetchReturnRequests]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>주문번호</div>
          <div>주문일시</div>
          <div>주문자</div>
          <div>연락처</div>
          <div>상품명</div>
          <div>상품 반품일시</div>
          <div>반품/교환</div>
        </div>

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && requests.length === 0 && (
          <div className={styles.empty}>반품 요청이 없습니다.</div>
        )}

        {!loading &&
          requests.map((req) => (
            <div key={req.orderNumber} className={styles.row}>
              <div>{req.orderNumber}</div>
              <div>{req.orderDate}</div>
              <div>{req.requesterName}</div>
              <div>{req.phoneNumber}</div>
              <div>{req.productName}</div>
              <div>{req.returnDate}</div>
              <div>{req.typeLabel}</div>
            </div>
          ))}
      </div>

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

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { returnExchangeService } from '@/app/api/services/client/return-exchange/returnExchangeService';
import { BaseApiResponse } from '@/app/api/types/member/return-exchange/returnExchange';
import { useOrderFilter } from '@/app/context/orderFilterContext';

interface ExchangeRequestRow {
  orderNumber: string;
  orderDate: string;
  requesterName: string;
  requesterContact: string;
  productName: string;
  exchangeDate: string;
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

export default function ExchangeRequestPage() {
  const { page, setPage } = usePageParam(1);
  const [requests, setRequests] = useState<ExchangeRequestRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const { filters, filterTrigger } = useOrderFilter();

  const fetchExchangeRequests = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params: {
        page: number;
        size: number;
        sortBy: 'createdAt';
        direction: 'desc';
        type: 'EXCHANGE';
        dateStart?: string;
        dateEnd?: string;
      } = {
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
        type: 'EXCHANGE',
      };

      if (filters.dateStart) {
        params.dateStart = filters.dateStart;
      }
      if (filters.dateEnd) {
        params.dateEnd = filters.dateEnd;
      }

      const { data } = await returnExchangeService.getAll(params);

      const res = data as unknown as BaseApiResponse<ReturnExchangeResponse>;
      const result = res.data;

      const mapped: ExchangeRequestRow[] =
        result.content
          ?.filter((r) => r.type === 'EXCHANGE')
          .map((r) => ({
            orderNumber: r.orderNumber ?? '-',
            orderDate: new Date(r.updatedAt).toLocaleString('ko-KR', {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
            requesterName: r.requester.name ?? '-',
            requesterContact: '-', // not provided in payload
            productName: r.items?.[0]?.product?.productName ?? '-',
            exchangeDate: new Date(r.createdAt).toLocaleString('ko-KR', {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
            typeLabel: r.type === 'EXCHANGE' ? '교환' : '반품',
          })) ?? [];

      setRequests(mapped);
      setTotalPages(result.pageInfo?.totalPages ?? 1);
      } catch (err) {
        console.error('Failed to fetch exchange requests:', err);
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
    void fetchExchangeRequests();
  }, [fetchExchangeRequests]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>주문번호</div>
          <div>주문일시</div>
          <div>주문자</div>
          <div>연락처</div>
          <div>상품명</div>
          <div>상품 교환일시</div>
          <div>반품/교환</div>
        </div>

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && requests.length === 0 && (
          <div className={styles.empty}>교환 요청이 없습니다.</div>
        )}

        {!loading &&
          requests.map((req) => (
            <div key={req.orderNumber} className={styles.row}>
              <div>{req.orderNumber}</div>
              <div>{req.orderDate}</div>
              <div>{req.requesterName}</div>
              <div>{req.requesterContact}</div>
              <div>{req.productName}</div>
              <div>{req.exchangeDate}</div>
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

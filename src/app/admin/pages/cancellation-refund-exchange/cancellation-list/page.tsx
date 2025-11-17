'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './CancellationList.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { OrderCancelService } from '@/app/api/services/admin/orderCancelService/orderCancelService';
import { AdminCancelledOrderItem } from '@/app/api/services/admin/orderCancelService/orderCancel';
import { useOrderFilter } from '@/app/context/orderFilterContext';

type Order = {
  id: string;
  orderedAt: string;
  buyer: string;
  contact: string;
  productName: string;
  canceledAt: string;
  cancelReason: string;
};

const PAGE_SIZE = 10;

const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return '-';
  }
};

const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export default function CancellationListPage() {
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const { filters, filterTrigger } = useOrderFilter();

  const fetchCancelledOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params: {
        page: number;
        size: number;
        keyword?: string;
        dateStart?: string;
        dateEnd?: string;
        shippingOption?: 'DELIVERY' | 'PICKUP';
      } = {
        page: page - 1,
        size: PAGE_SIZE,
      };

      if (filters.dateStart) {
        params.dateStart = filters.dateStart;
      }
      if (filters.dateEnd) {
        params.dateEnd = filters.dateEnd;
      }
      if (filters.keyword) {
        params.keyword = filters.keyword;
      }
      if (filters.shippingOption) {
        params.shippingOption = filters.shippingOption;
      }

      const response = await OrderCancelService.getCancelledOrders(params);

      if (response.error || !response.data?.success) {
        console.error(
          'Failed to fetch cancelled orders:',
          response.error || response.data?.resultMsg
        );
        setOrders([]);
        setTotalPages(1);
        return;
      }

      const data = response.data.data;
      const content: AdminCancelledOrderItem[] = data?.content ?? [];
      const total = data?.pageInfo?.totalPages ?? 1;

      const mappedOrders: Order[] = content.map((item) => ({
        id: item.orderItemId,
        orderedAt: formatDateTime(item.orderedAt),
        buyer: item.customer.name,
        contact: formatPhoneNumber(item.customer.phone),
        productName: item.productName,
        canceledAt: formatDateTime(item.cancelledAt),
        cancelReason: item.cancellationReason || '-',
      }));

      setOrders(mappedOrders);
      setTotalPages(total);
    } catch (error) {
      console.error('Error fetching cancelled orders:', error);
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    filters.dateStart,
    filters.dateEnd,
    filters.keyword,
    filters.shippingOption,
  ]);

  useEffect(() => {
    if (filterTrigger > 0 && page !== 1) {
      setPage(1);
    }
  }, [filterTrigger, page, setPage]);

  useEffect(() => {
    void fetchCancelledOrders();
  }, [fetchCancelledOrders]);

  const currentPage = Math.min(page, totalPages);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>주문번호</div>
          <div>주문일시</div>
          <div>주문자</div>
          <div>연락처</div>
          <div>상품명</div>
          <div>주문 취소일시</div>
          <div>취소 이유</div>
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            취소된 주문이 없습니다.
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className={styles.row}>
              <div>{order.id}</div>
              <div>{order.orderedAt}</div>
              <div>{order.buyer}</div>
              <div>{order.contact}</div>
              <div>{order.productName}</div>
              <div>{order.canceledAt}</div>
              <div>{order.cancelReason}</div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div
          style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}
        >
          <div style={{ width: 320 }}>
            <OrderPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </>
  );
}

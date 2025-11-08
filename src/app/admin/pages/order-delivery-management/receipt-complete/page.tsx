'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './ReceiptComplete.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import {
  AdminSearchOrdersResponse,
  AdminSearchOrdersData,
} from '@/app/api/types/member/order/order';

interface OrderRow {
  orderItemId: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerContact: string;
  productName: string;
  option: string;
  trackingNumber: string;
  completedAt: string;
  shippingOption: 'DELIVERY' | 'PICKUP';
}

const PAGE_SIZE = 10;

export default function ReceiptCompletePage(): React.ReactElement {
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  /** Fetch COMPLETED orders from admin v2 endpoint */
  const fetchOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await orderService.searchOrdersV2({
        status: ['COMPLETED'],
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      });

      if (error || !data?.success) {
        console.error('[ReceiptCompletePage] Fetch failed:', error);
        setOrders([]);
        return;
      }

      const result = data as AdminSearchOrdersResponse;
      const content: AdminSearchOrdersData[] = result.data?.content ?? [];

      // Map each item into the table row
      const mapped: OrderRow[] = content.map((item) => ({
        orderItemId: item.orderItemId,
        orderNumber: item.orderNumber,
        createdAt: item.createdAt,
        customerName: item.customer.name ?? '-',
        customerContact: item.customer.phone ?? '-',
        productName: item.productName ?? '-',
        option: item.shippingOption === 'DELIVERY' ? '배송' : '픽업',
        trackingNumber: item.delivery?.trackingNumber ?? '-',
        completedAt:
          item.status === 'COMPLETED' ? item.createdAt.split('T')[0] : '-',
        shippingOption: item.shippingOption,
      }));

      setOrders(mapped);
      setTotalPages(result.data?.pageInfo?.totalPages ?? 1);
    } catch (err) {
      console.error('[ReceiptCompletePage] Fetch error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  /** Placeholder actions */
  const handleCancel = (id: string): void => {
    console.log('취소:', id);
  };

  const handleReview = (id: string): void => {
    console.log('후기 보기:', id);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>주문번호</div>
          <div>주문일시</div>
          <div>주문자</div>
          <div>연락처</div>
          <div>상품명</div>
          <div>옵션</div>
          <div>운송장번호</div>
          <div>수령 완료일</div>
          <div />
        </div>

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && orders.length === 0 && (
          <div className={styles.empty}>완료된 주문이 없습니다.</div>
        )}

        {!loading &&
          orders.map((order) => {
            const reviewEnabled = order.shippingOption === 'DELIVERY';
            return (
              <div
                key={`${order.orderItemId}-${order.orderNumber}-${order.trackingNumber}`}
                className={styles.row}
              >
                <div>{order.orderNumber}</div>
                <div>{order.createdAt}</div>
                <div>{order.customerName}</div>
                <div>{order.customerContact}</div>
                <div>{order.productName}</div>
                <div>{order.option}</div>
                <div>{order.trackingNumber}</div>
                <div>{order.completedAt}</div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => handleCancel(order.orderItemId)}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className={`${styles.reviewBtn} ${
                      !reviewEnabled ? styles.disabled : ''
                    }`}
                    onClick={() =>
                      reviewEnabled && handleReview(order.orderItemId)
                    }
                    disabled={!reviewEnabled}
                    aria-disabled={!reviewEnabled}
                    title={
                      reviewEnabled ? '후기 보기' : '픽업 주문은 후기 작성 불가'
                    }
                  >
                    후기 보기
                  </button>
                </div>
              </div>
            );
          })}
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

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './DeliveryPickup.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { orderStatusService } from '@/app/api/services/admin/orderStatusService/orderStatusService';
import {
  AdminSearchOrdersResponse,
  AdminSearchOrdersData,
  AdminSearchOrdersParams,
} from '@/app/api/types/member/order/order';
import { useOrderFilter } from '@/app/context/orderFilterContext';
import { ConfirmationModal } from '@/app/components/admin/ui/ConfirmationModal/ConfirmationModal';
import { useToast } from '@/app/components/admin/hooks/useToast';
import { ToastContainer } from '@/app/components/admin/ui/ToastContainer/ToastContainer';

interface OrderRow {
  orderItemId: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerContact: string;
  productName: string;
  option: string;
  trackingNumber: string;
  status: string; // DELIVERY_STARTED or READY_FOR_PICKUP
}

const PAGE_SIZE = 10;

export default function DeliveryPickupPage(): React.ReactElement {
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [orderItemToComplete, setOrderItemToComplete] = useState<string | null>(
    null
  );
  const { toast, showSuccess, showError, hideToast } = useToast();

  const { filters, filterTrigger } = useOrderFilter();

  /** Fetch both READY_FOR_PICKUP and DELIVERY_STARTED from /v2/orders */
  const fetchOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params: AdminSearchOrdersParams = {
        status: ['READY_FOR_PICKUP', 'DELIVERY_STARTED'],
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
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

      const { data, error } = await orderService.searchOrdersV2(params);

      if (error || !data?.success) {
        console.error('[DeliveryPickupPage] Fetch failed:', error);
        setOrders([]);
        return;
      }

      const result = data as AdminSearchOrdersResponse;
      const content: AdminSearchOrdersData[] = result.data?.content ?? [];

      // Map each order item into a row
      const mapped: OrderRow[] = content.map((item) => ({
        orderItemId: item.orderItemId,
        orderNumber: item.orderNumber,
        createdAt: item.createdAt,
        customerName: item.customer.name ?? '-',
        customerContact: item.customer.phone ?? '-',
        productName: item.productName ?? '-',
        option: item.shippingOption === 'DELIVERY' ? '배송' : '픽업',
        trackingNumber: item.delivery?.trackingNumber ?? '-',
        status: item.status ?? '-',
      }));

      setOrders(mapped);
      setTotalPages(result.data?.pageInfo?.totalPages ?? 1);
    } catch (err) {
      console.error('[DeliveryPickupPage] Fetch error:', err);
      setOrders([]);
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
    void fetchOrders();
  }, [fetchOrders]);

  /** Mark order item as completed */
  const handleCompleteClick = (orderItemId: string): void => {
    setOrderItemToComplete(orderItemId);
    setCompleteConfirmOpen(true);
  };

  const handleComplete = async (): Promise<void> => {
    if (!orderItemToComplete) return;
    setCompleteConfirmOpen(false);

    try {
      const { data, error } = await orderStatusService.markOrderItemAsCompleted(
        orderItemToComplete
      );

      if (error || !data?.success) {
        showError('처리 실패: ' + (data?.resultMsg || '오류가 발생했습니다.'));
        console.error('[DeliveryPickupPage] Complete failed:', error);
        return;
      }

      showSuccess('상품이 성공적으로 수령 완료 처리되었습니다.');
      await fetchOrders();
    } catch (err) {
      console.error('[DeliveryPickupPage] Completion error:', err);
      showError('수령 완료 처리 중 오류가 발생했습니다.');
    } finally {
      setOrderItemToComplete(null);
    }
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
          <div />
        </div>

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && orders.length === 0 && (
          <div className={styles.empty}>
            배송 또는 픽업 대기 중인 주문이 없습니다.
          </div>
        )}

        {!loading &&
          orders.map((order) => (
            <div
              key={`${order.orderItemId}-${order.orderNumber}-${order.status}`}
              className={styles.row}
            >
              <div>{order.orderNumber}</div>
              <div>{order.createdAt}</div>
              <div>{order.customerName}</div>
              <div>{order.customerContact}</div>
              <div>{order.productName}</div>
              <div>{order.option}</div>
              <div className={styles.trackingCell}>
                <span className={styles.trackingText}>
                  {order.trackingNumber}
                </span>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.completeBtn}
                  onClick={() => handleCompleteClick(order.orderItemId)}
                >
                  수령 완료
                </button>
              </div>
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

      <ConfirmationModal
        open={completeConfirmOpen}
        onClose={() => {
          setCompleteConfirmOpen(false);
          setOrderItemToComplete(null);
        }}
        onConfirm={handleComplete}
        message="이 상품의 수령(배송 완료)을 처리하시겠습니까?"
        confirmText="처리"
        cancelText="취소"
      />

      <ToastContainer toast={toast} onClose={hideToast} />
    </>
  );
}

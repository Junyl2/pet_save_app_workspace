'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './ReceiptComplete.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { useRouter } from 'next/navigation';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { orderStatusService } from '@/app/api/services/admin/orderStatusService/orderStatusService';
import {
  AdminSearchOrdersResponse,
  AdminSearchOrdersData,
  AdminSearchOrdersParams,
} from '@/app/api/types/member/order/order';
import { useOrderFilter } from '@/app/context/orderFilterContext';
import { InputModal } from '@/app/components/admin/ui/InputModal/InputModal';
import { useToast } from '@/app/components/admin/hooks/useToast';
import { ToastContainer } from '@/app/components/admin/ui/ToastContainer/ToastContainer';

interface OrderRow {
  orderItemId: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerContact: string;
  productId: string;
  productName: string;
  option: string;
  trackingNumber: string;
  completedAt: string;
  shippingOption: 'DELIVERY' | 'PICKUP';
}

const PAGE_SIZE = 10;

export default function ReceiptCompletePage(): React.ReactElement {
  const router = useRouter();
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReasonOpen, setCancelReasonOpen] = useState(false);
  const [orderItemToCancel, setOrderItemToCancel] = useState<string | null>(
    null
  );
  const { toast, showSuccess, showError, hideToast } = useToast();

  const { filters, filterTrigger } = useOrderFilter();

  /** Fetch COMPLETED orders from admin v2 endpoint */
  const fetchOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params: AdminSearchOrdersParams = {
        status: ['COMPLETED'],
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
        console.error('[ReceiptCompletePage] Fetch failed:', error);
        setOrders([]);
        return;
      }

      const result = data as AdminSearchOrdersResponse;
      const content: AdminSearchOrdersData[] = result.data?.content ?? [];

      const mapped: OrderRow[] = content.map((item) => ({
        orderItemId: item.orderItemId,
        orderNumber: item.orderNumber,
        createdAt: item.createdAt,
        customerName: item.customer.name ?? '-',
        customerContact: item.customer.phone ?? '-',
        productId: item.productId,
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

  /** Cancel order item */
  const handleCancelClick = (orderItemId: string): void => {
    setOrderItemToCancel(orderItemId);
    setCancelReasonOpen(true);
  };

  const handleCancel = async (cancelReason: string): Promise<void> => {
    if (!orderItemToCancel || !cancelReason.trim()) {
      showError('취소 사유가 입력되지 않았습니다.');
      return;
    }
    setCancelReasonOpen(false);
    setIsCancelling(true);

    try {
      const { data, error } = await orderStatusService.cancelOrderItem(
        orderItemToCancel,
        cancelReason.trim()
      );

      if (error || !data) {
        console.error('[Cancel Error]', error);
        showError('주문 취소 중 오류가 발생했습니다.');
        return;
      }

      showSuccess('주문이 성공적으로 취소되었습니다.');
      await fetchOrders();
    } catch (err) {
      console.error('[handleCancel] Error:', err);
      showError('주문 취소 실패');
    } finally {
      setIsCancelling(false);
      setOrderItemToCancel(null);
    }
  };

  const handleReview = (productId: string): void => {
    window.open(`/customer-reviews?productId=${productId}`, '_blank');
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
                    onClick={() => handleCancelClick(order.orderItemId)}
                    disabled={isCancelling}
                  >
                    {isCancelling ? '취소 중...' : '취소'}
                  </button>
                  <button
                    type="button"
                    className={`${styles.reviewBtn} ${
                      !reviewEnabled ? styles.disabled : ''
                    }`}
                    onClick={() =>
                      reviewEnabled && handleReview(order.productId)
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

      <InputModal
        open={cancelReasonOpen}
        onClose={() => {
          setCancelReasonOpen(false);
          setOrderItemToCancel(null);
        }}
        onConfirm={handleCancel}
        title="취소 사유 입력"
        message="취소 사유를 입력하세요 (예: 단순 변심):"
        placeholder="취소 사유를 입력하세요"
        confirmText="취소"
        cancelText="돌아가기"
        inputType="textarea"
      />

      <ToastContainer toast={toast} onClose={hideToast} />
    </>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './PaymentCompleted.module.css';
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
import { InputModal } from '@/app/components/admin/ui/InputModal/InputModal';
import { useToast } from '@/app/components/admin/hooks/useToast';
import { ToastContainer } from '@/app/components/admin/ui/ToastContainer/ToastContainer';

interface OrderRow {
  orderItemId: string;
  orderId: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerContact: string;
  totalAmount: number;
  paymentMethod: string;
}

const KRW = (n: number): string =>
  new Intl.NumberFormat('ko-KR').format(n) + '원';

const PAGE_SIZE = 10;

export default function PaymentCompletedPage(): React.ReactElement {
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancelReasonOpen, setCancelReasonOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [startConfirmOpen, setStartConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderItemToCancel, setOrderItemToCancel] = useState<string | null>(
    null
  );
  const [orderItemToStart, setOrderItemToStart] = useState<string | null>(null);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const { filters, filterTrigger } = useOrderFilter();

  /** Fetch all PAID orders from /v2/orders */
  const fetchOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params: AdminSearchOrdersParams = {
        status: ['PAID'],
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

      const { data, error } = await orderService.searchOrdersV2(params);

      if (error || !data?.success) {
        console.error('[PaymentCompletedPage] Fetch failed:', error);
        setOrders([]);
        return;
      }

      const result = data as AdminSearchOrdersResponse;
      const content: AdminSearchOrdersData[] = result.data?.content ?? [];

      // Each order item = one row
      const mapped: OrderRow[] = content.map((item) => ({
        orderItemId: item.orderItemId,
        orderId: item.orderId,
        orderNumber: item.orderNumber,
        createdAt: item.createdAt,
        customerName: item.customer.name ?? '-',
        customerContact: item.customer.phone ?? '-',
        totalAmount: item.totalAmount ?? 0,
        paymentMethod: item.paymentMethod ?? '-',
      }));

      setOrders(mapped);
      setTotalPages(result.data?.pageInfo?.totalPages ?? 1);
    } catch (err) {
      console.error('[PaymentCompletedPage] Order fetch error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters.dateStart, filters.dateEnd, filters.keyword]);

  useEffect(() => {
    if (filterTrigger > 0 && page !== 1) {
      setPage(1);
    }
  }, [filterTrigger, page, setPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /** Cancel an order item */
  const handleCancelClick = (orderItemId: string): void => {
    if (!orderItemId) {
      showError('유효하지 않은 상품 ID입니다.');
      return;
    }
    setOrderItemToCancel(orderItemId);
    setCancelReasonOpen(true);
  };

  const handleCancelReasonSubmit = (reason: string): void => {
    setCancelReason(reason);
    setCancelReasonOpen(false);
    setCancelConfirmOpen(true);
  };

  const handleCancel = async (): Promise<void> => {
    if (!orderItemToCancel || !cancelReason) return;
    setCancelConfirmOpen(false);

    setOrders((prev) => prev.filter((o) => o.orderItemId !== orderItemToCancel));

    try {
      const { data, error } = await orderStatusService.cancelOrderItem(
        orderItemToCancel,
        cancelReason
      );

      if (error || !data?.success) {
        showError('상품 취소 실패: ' + (data?.resultMsg || '오류가 발생했습니다.'));
        console.error('[PaymentCompletedPage] Cancel failed:', error);
        await fetchOrders();
        return;
      }

      showSuccess('상품이 성공적으로 취소되었습니다.');
      await fetchOrders();
    } catch (err) {
      console.error('[PaymentCompletedPage] Cancel error:', err);
      showError('주문 상품 취소 중 오류가 발생했습니다.');
      await fetchOrders();
    } finally {
      setOrderItemToCancel(null);
      setCancelReason('');
    }
  };

  /** Start preparing an order item */
  const handleStartClick = (orderItemId: string): void => {
    if (!orderItemId) {
      showError('유효하지 않은 상품 ID입니다.');
      return;
    }
    setOrderItemToStart(orderItemId);
    setStartConfirmOpen(true);
  };

  const handleStart = async (): Promise<void> => {
    if (!orderItemToStart) return;
    setStartConfirmOpen(false);

    setOrders((prev) => prev.filter((o) => o.orderItemId !== orderItemToStart));

    try {
      const { data, error } = await orderStatusService.markOrderItemAsPreparing(
        orderItemToStart
      );

      if (error || !data?.success) {
        showError(
          '준비 상태 변경 실패: ' + (data?.resultMsg || '오류가 발생했습니다.')
        );
        console.error('[PaymentCompletedPage] Prepare failed:', error);
        await fetchOrders();
        return;
      }

      showSuccess('상품 준비 상태가 시작되었습니다.');
      await fetchOrders();
    } catch (err) {
      console.error('[PaymentCompletedPage] Prepare error:', err);
      showError('상품 준비 중 오류가 발생했습니다.');
      await fetchOrders();
    } finally {
      setOrderItemToStart(null);
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
          <div>상품 가격</div>
          <div>결제 수단</div>
          <div />
        </div>

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && orders.length === 0 && (
          <div className={styles.empty}>결제 완료된 주문이 없습니다.</div>
        )}

        {!loading &&
          orders.map((order) => (
            <div key={order.orderItemId} className={styles.row}>
              <div>{order.orderNumber}</div>
              <div>{order.createdAt}</div>
              <div>{order.customerName}</div>
              <div>{order.customerContact}</div>
              <div>{KRW(order.totalAmount)}</div>
              <div>{order.paymentMethod}</div>
              <div className={styles.actions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => handleCancelClick(order.orderItemId)}
                >
                  취소
                </button>
                <button
                  className={styles.startBtn}
                  onClick={() => handleStartClick(order.orderItemId)}
                >
                  상품 준비 시작
                </button>
              </div>
            </div>
          ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationWrap}>
          <OrderPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <InputModal
        open={cancelReasonOpen}
        onClose={() => {
          setCancelReasonOpen(false);
          setOrderItemToCancel(null);
        }}
        onConfirm={handleCancelReasonSubmit}
        title="취소 사유 입력"
        message="취소 사유를 입력하세요:"
        placeholder="취소 사유를 입력하세요"
        confirmText="다음"
        cancelText="취소"
        inputType="textarea"
      />

      <ConfirmationModal
        open={cancelConfirmOpen}
        onClose={() => {
          setCancelConfirmOpen(false);
          setOrderItemToCancel(null);
          setCancelReason('');
        }}
        onConfirm={handleCancel}
        message="정말로 이 상품을 취소하시겠습니까?"
        confirmText="취소"
        cancelText="돌아가기"
      />

      <ConfirmationModal
        open={startConfirmOpen}
        onClose={() => {
          setStartConfirmOpen(false);
          setOrderItemToStart(null);
        }}
        onConfirm={handleStart}
        message="이 상품의 준비를 시작하시겠습니까?"
        confirmText="시작"
        cancelText="취소"
      />

      <ToastContainer toast={toast} onClose={hideToast} />
    </>
  );
}

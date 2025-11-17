'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './WaitingPayment.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { paymentService } from '@/app/api/services/admin/paymentService/paymentService';
import {
  AdminSearchOrdersResponse,
  AdminSearchOrdersData,
  AdminCancelOrderItemsResponse,
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

export default function WaitingPaymentPage(): React.ReactElement {
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancelReasonOpen, setCancelReasonOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderItemToCancel, setOrderItemToCancel] = useState<string | null>(
    null
  );
  const [orderIdToConfirm, setOrderIdToConfirm] = useState<string | null>(null);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const { filters, filterTrigger } = useOrderFilter();

  /** Fetch orders */
  const fetchOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params: AdminSearchOrdersParams = {
        status: ['PENDING_PAYMENT'],
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
        console.error('Fetch failed:', error);
        setOrders([]);
        return;
      }

      const result = data as AdminSearchOrdersResponse;
      const content: AdminSearchOrdersData[] = result.data?.content ?? [];

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
      console.error('Fetch orders error:', err);
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
    void fetchOrders();
  }, [fetchOrders]);

  /** Cancel a specific order item */
  const handleCancelItemClick = (orderItemId: string): void => {
    setOrderItemToCancel(orderItemId);
    setCancelReasonOpen(true);
  };

  const handleCancelReasonSubmit = (reason: string): void => {
    setCancelReason(reason);
    setCancelReasonOpen(false);
    setCancelConfirmOpen(true);
  };

  const handleCancelItem = async (): Promise<void> => {
    if (!orderItemToCancel || !cancelReason) return;
    setCancelConfirmOpen(false);

    try {
      const { data, error } = await orderService.cancelOrderItemsByAdmin(
        [orderItemToCancel],
        cancelReason
      );
      const res = data as AdminCancelOrderItemsResponse | null;

      if (error || !res?.success) {
        showError('상품 취소 실패: ' + (res?.resultMsg || '오류가 발생했습니다.'));
        console.error('Cancel failed:', error);
        return;
      }

      showSuccess('상품이 성공적으로 취소되었습니다.');
      await fetchOrders();
    } catch (err) {
      console.error('Cancel error:', err);
      showError('주문 상품 취소 중 오류가 발생했습니다.');
    } finally {
      setOrderItemToCancel(null);
      setCancelReason('');
    }
  };

  /** Confirm payment manually */
  const handleConfirmPaymentClick = (orderId: string): void => {
    setOrderIdToConfirm(orderId);
    setPaymentConfirmOpen(true);
  };

  const handleConfirmPayment = async (): Promise<void> => {
    if (!orderIdToConfirm) return;
    setPaymentConfirmOpen(false);

    try {
      const { data, error } = await paymentService.confirmFullPayment(
        orderIdToConfirm
      );

      if (error || !data?.success) {
        showError('입금 확인 실패: ' + (data?.resultMsg || '오류가 발생했습니다.'));
        console.error('Confirm failed:', error);
        return;
      }

      showSuccess('입금이 성공적으로 확인되었습니다.');
      await fetchOrders();
    } catch (err) {
      console.error('Confirm payment error:', err);
      showError('입금 확인 중 오류가 발생했습니다.');
    } finally {
      setOrderIdToConfirm(null);
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

        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : !orders.length ? (
          <div className={styles.empty}>대기 중 결제 주문이 없습니다.</div>
        ) : (
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
                  onClick={() => handleCancelItemClick(order.orderItemId)}
                >
                  상품 취소
                </button>
                <button
                  className={styles.startBtn}
                  onClick={() => handleConfirmPaymentClick(order.orderId)}
                >
                  입금 확인 처리
                </button>
              </div>
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
        onConfirm={handleCancelItem}
        message="이 상품을 취소하시겠습니까?"
        confirmText="취소"
        cancelText="돌아가기"
      />

      <ConfirmationModal
        open={paymentConfirmOpen}
        onClose={() => {
          setPaymentConfirmOpen(false);
          setOrderIdToConfirm(null);
        }}
        onConfirm={handleConfirmPayment}
        message="이 주문의 입금을 확인하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
      />

      <ToastContainer toast={toast} onClose={hideToast} />
    </>
  );
}

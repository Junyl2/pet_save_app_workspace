'use client';

import React, { useEffect, useState } from 'react';
import styles from './WaitingPayment.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { paymentService } from '@/app/api/services/admin/paymentService/paymentService';
import {
  SearchOrdersData,
  AdminCancelOrderItemsResponse,
} from '@/app/api/types/member/order/order';

interface OrderRow {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerContact: string;
  totalAmount: number;
  paymentMethod: string;
  orderItemIds: string[];
}

const KRW = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';
const PAGE_SIZE = 10;

export default function WaitingPaymentPage() {
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch pending payment orders
  const fetchOrders = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await orderService.searchOrders({
        generalStatus: 'PENDING_PAYMENT',
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      });

      if (error || !data?.success) {
        console.error('Fetch failed:', error);
        setOrders([]);
        return;
      }

      const result = data.data as SearchOrdersData;
      const mapped: OrderRow[] =
        result.content?.map((o) => ({
          orderId: o.orderId,
          orderNumber: o.orderNumber,
          createdAt: o.createdAt,
          customerName: o.customerName ?? '-',
          customerContact: o.customerContact ?? '-',
          totalAmount: o.totalAmount ?? 0,
          paymentMethod: o.paymentMethod ?? '-',
          orderItemIds:
            o.storeOrders
              ?.flatMap(
                (store) => store.items?.map((item) => item.orderItemId) ?? []
              )
              .filter((id): id is string => typeof id === 'string') ?? [],
        })) ?? [];

      setOrders(mapped);
      setTotalPages(result.pageInfo?.totalPages ?? 1);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  // Cancel specific order items (Admin API)
  const handleCancelItems = async (orderItemIds: string[]): Promise<void> => {
    if (!orderItemIds || orderItemIds.length === 0) {
      alert('취소할 주문 상품이 없습니다.');
      return;
    }

    const reason = prompt('취소 사유를 입력하세요:');
    if (!reason) return;

    if (!confirm('정말로 이 주문의 모든 상품을 취소하시겠습니까?')) return;

    try {
      const { data, error } = await orderService.cancelOrderItemsByAdmin(
        orderItemIds,
        reason
      );

      const res = data as AdminCancelOrderItemsResponse | null;

      if (error || !res?.success) {
        alert('상품 취소 실패: ' + (res?.resultMsg || '오류가 발생했습니다.'));
        console.error('Cancel failed:', error);
        return;
      }

      alert('선택한 주문 상품이 성공적으로 취소되었습니다.');
      await fetchOrders(); // Refresh list without page reload
    } catch (err) {
      console.error('Cancel error:', err);
      alert('주문 상품 취소 중 오류가 발생했습니다.');
    }
  };

  // Confirm payment manually (Admin API)
  const handleConfirmPayment = async (orderId: string): Promise<void> => {
    if (!confirm('이 주문의 입금을 확인하시겠습니까?')) return;

    try {
      const { data, error } = await paymentService.confirmFullPayment(orderId);

      if (error || !data?.success) {
        alert('입금 확인 실패: ' + (data?.resultMsg || '오류가 발생했습니다.'));
        console.error('Confirm failed:', error);
        return;
      }

      alert('입금이 성공적으로 확인되었습니다.');
      await fetchOrders(); // Refresh list without page reload
    } catch (err) {
      console.error('Confirm payment error:', err);
      alert('입금 확인 중 오류가 발생했습니다.');
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
          <div className={styles.empty}>대기 중 결제 주문이 없습니다.</div>
        )}

        {!loading &&
          orders.map((order) => (
            <div key={order.orderNumber} className={styles.row}>
              <div>{order.orderNumber}</div>
              <div>{order.createdAt}</div>
              <div>{order.customerName}</div>
              <div>{order.customerContact}</div>
              <div>{KRW(order.totalAmount)}</div>
              <div>{order.paymentMethod}</div>
              <div className={styles.actions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => handleCancelItems(order.orderItemIds)}
                >
                  상품 취소
                </button>
                <button
                  className={styles.startBtn}
                  onClick={() => handleConfirmPayment(order.orderId)}
                >
                  입금 확인 처리
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
    </>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './PaymentCompleted.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { orderStatusService } from '@/app/api/services/admin/orderStatusService/orderStatusService';
import { SearchOrdersData } from '@/app/api/types/member/order/order';

interface OrderRow {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerContact: string;
  totalAmount: number;
  paymentMethod: string;
  orderItemId: string;
}

const KRW = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';
const PAGE_SIZE = 10;

export default function PaymentCompletedPage() {
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await orderService.searchOrders({
        generalStatus: 'PAID',
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
        result.content
          ?.flatMap(
            (o) =>
              o.storeOrders?.flatMap(
                (store) =>
                  store.items
                    ?.filter((item) => !!item.orderItemId)
                    .map((item) => ({
                      orderNumber: o.orderNumber,
                      createdAt: o.createdAt,
                      customerName: o.customerName ?? '-',
                      customerContact: o.customerContact ?? '-',
                      totalAmount: item.totalAmount ?? 0,
                      paymentMethod: o.paymentMethod ?? '-',
                      orderItemId: item.orderItemId!,
                    })) ?? []
              ) ?? []
          )
          .filter((row): row is OrderRow => !!row.orderItemId) ?? [];

      setOrders(mapped);
      setTotalPages(result.pageInfo?.totalPages ?? 1);
    } catch (err) {
      console.error('Order fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = async (orderItemId: string): Promise<void> => {
    if (!orderItemId) {
      alert('유효하지 않은 상품 ID입니다.');
      return;
    }

    const reason = prompt('취소 사유를 입력하세요:');
    if (!reason) return;
    if (!confirm('정말로 이 상품을 취소하시겠습니까?')) return;

    try {
      const { data, error } = await orderStatusService.cancelOrderItem(
        orderItemId,
        reason
      );

      if (error || !data?.success) {
        alert('상품 취소 실패: ' + (data?.resultMsg || '오류가 발생했습니다.'));
        console.error('Cancel failed:', error);
        return;
      }

      alert('상품이 성공적으로 취소되었습니다.');
      await fetchOrders(); // Refresh list without reloading
    } catch (err) {
      console.error('Cancel error:', err);
      alert('주문 상품 취소 중 오류가 발생했습니다.');
    }
  };

  const handleStart = async (orderItemId: string): Promise<void> => {
    if (!orderItemId) {
      alert('유효하지 않은 상품 ID입니다.');
      return;
    }

    if (!confirm('이 상품의 준비를 시작하시겠습니까?')) return;

    try {
      const { data, error } = await orderStatusService.markOrderItemAsPreparing(
        orderItemId
      );

      if (error || !data?.success) {
        alert(
          '준비 상태 변경 실패: ' + (data?.resultMsg || '오류가 발생했습니다.')
        );
        console.error('Prepare failed:', error);
        return;
      }

      alert('상품 준비 상태가 시작되었습니다.');
      await fetchOrders(); // Update list dynamically
    } catch (err) {
      console.error('Prepare error:', err);
      alert('상품 준비 중 오류가 발생했습니다.');
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
                  onClick={() => handleCancel(order.orderItemId)}
                >
                  취소
                </button>
                <button
                  className={styles.startBtn}
                  onClick={() => handleStart(order.orderItemId)}
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
    </>
  );
}

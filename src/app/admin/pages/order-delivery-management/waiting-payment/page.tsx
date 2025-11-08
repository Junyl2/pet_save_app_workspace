'use client';

import React, { useEffect, useState } from 'react';
import styles from './WaitingPayment.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { paymentService } from '@/app/api/services/admin/paymentService/paymentService';
import {
  AdminSearchOrdersResponse,
  AdminSearchOrdersData,
  AdminCancelOrderItemsResponse,
} from '@/app/api/types/member/order/order';

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

  const fetchOrders = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await orderService.searchOrdersV2({
        status: ['PENDING_PAYMENT'],
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

      const result = data as AdminSearchOrdersResponse;
      const content: AdminSearchOrdersData[] = result.data?.content ?? [];

      // Each item = 1 row (no grouping)
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
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleCancelItem = async (orderItemId: string): Promise<void> => {
    const reason = prompt('취소 사유를 입력하세요:');
    if (!reason) return;
    if (!confirm('이 상품을 취소하시겠습니까?')) return;

    try {
      const { data, error } = await orderService.cancelOrderItemsByAdmin(
        [orderItemId],
        reason
      );
      const res = data as AdminCancelOrderItemsResponse | null;

      if (error || !res?.success) {
        alert('상품 취소 실패: ' + (res?.resultMsg || '오류가 발생했습니다.'));
        console.error('Cancel failed:', error);
        return;
      }

      alert('상품이 성공적으로 취소되었습니다.');
      await fetchOrders();
    } catch (err) {
      console.error('Cancel error:', err);
      alert('주문 상품 취소 중 오류가 발생했습니다.');
    }
  };

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
      await fetchOrders();
    } catch (err) {
      console.error('Confirm payment error:', err);
      alert('입금 확인 중 오류가 발생했습니다.');
    }
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      { className: styles.container },
      React.createElement(
        'div',
        { className: styles.header },
        React.createElement('div', null, '주문번호'),
        React.createElement('div', null, '주문일시'),
        React.createElement('div', null, '주문자'),
        React.createElement('div', null, '연락처'),
        React.createElement('div', null, '상품 가격'),
        React.createElement('div', null, '결제 수단'),
        React.createElement('div', null)
      ),
      loading
        ? React.createElement(
            'div',
            { className: styles.loading },
            '불러오는 중...'
          )
        : !orders.length
        ? React.createElement(
            'div',
            { className: styles.empty },
            '대기 중 결제 주문이 없습니다.'
          )
        : orders.map((order) =>
            React.createElement(
              'div',
              { key: order.orderItemId, className: styles.row },
              React.createElement('div', null, order.orderNumber),
              React.createElement('div', null, order.createdAt),
              React.createElement('div', null, order.customerName),
              React.createElement('div', null, order.customerContact),
              React.createElement('div', null, KRW(order.totalAmount)),
              React.createElement('div', null, order.paymentMethod),
              React.createElement(
                'div',
                { className: styles.actions },
                React.createElement(
                  'button',
                  {
                    className: styles.cancelBtn,
                    onClick: () => handleCancelItem(order.orderItemId),
                  },
                  '상품 취소'
                ),
                React.createElement(
                  'button',
                  {
                    className: styles.startBtn,
                    onClick: () => handleConfirmPayment(order.orderId),
                  },
                  '입금 확인 처리'
                )
              )
            )
          )
    ),
    totalPages > 1
      ? React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'center',
              marginTop: 16,
            },
          },
          React.createElement(
            'div',
            { style: { width: 320 } },
            React.createElement(OrderPagination, {
              currentPage: page,
              totalPages,
              onPageChange: setPage,
            })
          )
        )
      : null
  );
}

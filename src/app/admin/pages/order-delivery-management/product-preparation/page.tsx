'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './ProductPreperation.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { orderStatusService } from '@/app/api/services/admin/orderStatusService/orderStatusService';
import {
  AdminSearchOrdersResponse,
  AdminSearchOrdersData,
  AdminSearchOrdersParams,
} from '@/app/api/types/member/order/order';
import { useRouter } from 'next/navigation';
import { useOrderFilter } from '@/app/context/orderFilterContext';

interface OrderRow {
  orderItemId: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerContact: string;
  productName: string;
  receiveMethod: '배송' | '픽업';
}

const PAGE_SIZE = 10;

export default function ProductPreperationPage(): React.ReactElement {
  const router = useRouter();
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const { filters, filterTrigger } = useOrderFilter();

  /** Fetch PREPARING items using /v2/orders */
  const fetchOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params: AdminSearchOrdersParams = {
        status: ['PREPARING'],
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
        console.error('[ProductPreperationPage] Fetch failed:', error);
        setOrders([]);
        return;
      }

      const result = data as AdminSearchOrdersResponse;
      const content: AdminSearchOrdersData[] = result.data?.content ?? [];

      // Each item = one row
      const mapped: OrderRow[] = content.map((item) => ({
        orderItemId: item.orderItemId,
        orderNumber: item.orderNumber,
        createdAt: item.createdAt,
        customerName: item.customer.name ?? '-',
        customerContact: item.customer.phone ?? '-',
        productName: item.productName ?? '-',
        receiveMethod: item.shippingOption === 'DELIVERY' ? '배송' : '픽업',
      }));

      setOrders(mapped);
      setTotalPages(result.data?.pageInfo?.totalPages ?? 1);
    } catch (err) {
      console.error('[ProductPreperationPage] Fetch error:', err);
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
    filterTrigger,
  ]);

  useEffect(() => {
    if (filterTrigger > 0 && page !== 1) {
      setPage(1);
    }
  }, [filterTrigger, page, setPage]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  /** Cancel an order item */
  const handleCancel = async (orderItemId: string): Promise<void> => {
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
        console.error('[ProductPreperationPage] Cancel failed:', error);
        return;
      }

      alert('상품이 성공적으로 취소되었습니다.');
      await fetchOrders();
    } catch (err) {
      console.error('[ProductPreperationPage] Cancel error:', err);
      alert('상품 취소 중 오류가 발생했습니다.');
    }
  };

  /** Start delivery or pickup */
  const handleProcess = async (
    orderItemId: string,
    receiveMethod: '배송' | '픽업'
  ): Promise<void> => {
    if (receiveMethod === '배송') {
      const trackingNumber = prompt('운송장 번호를 입력하세요:');
      if (!trackingNumber || !trackingNumber.trim()) {
        alert('운송장 번호는 필수 입력 항목입니다.');
        return;
      }
      if (!confirm('이 상품의 배송을 시작하시겠습니까?')) return;

      try {
        const { data, error } = await orderStatusService.beginDelivery(
          orderItemId,
          trackingNumber.trim()
        );

        if (error || !data?.success) {
          alert(
            '배송 시작 실패: ' + (data?.resultMsg || '오류가 발생했습니다.')
          );
          console.error(
            '[ProductPreperationPage] Delivery start failed:',
            error
          );
          return;
        }

        alert('배송이 성공적으로 시작되었습니다.');
        await fetchOrders();
      } catch (err) {
        console.error('[ProductPreperationPage] Delivery error:', err);
        alert('배송 처리 중 오류가 발생했습니다.');
      }
    } else {
      if (!confirm('이 상품의 픽업을 시작하시겠습니까?')) return;

      try {
        const { data, error } = await orderStatusService.beginPickup(
          orderItemId
        );

        if (error || !data?.success) {
          alert(
            '픽업 시작 실패: ' + (data?.resultMsg || '오류가 발생했습니다.')
          );
          console.error('[ProductPreperationPage] Pickup start failed:', error);
          return;
        }

        alert('픽업이 성공적으로 시작되었습니다.');
        await fetchOrders();
      } catch (err) {
        console.error('[ProductPreperationPage] Pickup error:', err);
        alert('픽업 처리 중 오류가 발생했습니다.');
      }
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
          <div>수령 방법</div>
          <div />
        </div>

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && orders.length === 0 && (
          <div className={styles.empty}>상품 준비 중인 주문이 없습니다.</div>
        )}

        {!loading &&
          orders.map((order) => (
            <div
              key={`${order.orderNumber}-${order.orderItemId}`}
              className={styles.row}
              onClick={() =>
                router.push(
                  `/admin/pages/order-delivery-management/product-preparation/order-details/${order.orderNumber}`
                )
              }
              style={{ cursor: 'pointer' }}
            >
              <div>{order.orderNumber}</div>
              <div>{order.createdAt}</div>
              <div>{order.customerName}</div>
              <div>{order.customerContact}</div>
              <div>{order.productName}</div>
              <div>{order.receiveMethod}</div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel(order.orderItemId);
                  }}
                >
                  취소
                </button>
                <button
                  type="button"
                  className={styles.startBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProcess(order.orderItemId, order.receiveMethod);
                  }}
                >
                  {order.receiveMethod === '배송'
                    ? '배송 처리 시작'
                    : '픽업 처리 시작'}
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

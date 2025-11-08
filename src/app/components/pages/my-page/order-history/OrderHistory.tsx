'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import styles from './OrderHistory.module.css';
import FilterBar from '../../../sections/FilterBar/FilterBar';
import OrderHistoryItem from './order-history-item/OrderHistoryItem';
import OrderHistorySkeleton from '../../../ui/SkeletonLoading/OrderHistorySkeleton';
import ClientPagination from '@/app/components/admin/ui/ClientPagination/ClientPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import {
  fetchOrderHistory,
  revalidateOrderHistoryInBackground,
  checkStaleStatus,
  createOrderHistoryCacheKey,
} from '@/app/redux/slices/cache/orderSlice';
import { OrderItemResponse } from '@/app/api/types/member/order/orderDetails';
import { OrderItem } from '@/app/components/types/order';

const PAGE_SIZE = 10;

export default function OrderHistory() {
  const dispatch = useAppDispatch();
  const { orderHistoryCache, loading, error } = useAppSelector(
    (state) => state.orders
  );

  const { page, setPage } = usePageParam(1);
  const [selectedPeriod, setSelectedPeriod] = useState('3개월');
  const [selectedStatus, setSelectedStatus] = useState('전체보기');

  /** Create cache key based on current page */
  const cacheKey = useMemo(
    () =>
      createOrderHistoryCacheKey({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      }),
    [page]
  );

  /** Current cached data for this page */
  const cachedData = orderHistoryCache[cacheKey];
  const orders = useMemo<OrderItemResponse[]>(
    () => cachedData?.data?.data?.content || [],
    [cachedData]
  );

  /** Fetch on mount + when page changes */
  useEffect(() => {
    dispatch(
      fetchOrderHistory({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      })
    );
  }, [dispatch, page]);

  /** Background revalidation */
  useEffect(() => {
    if (cachedData) {
      const now = Date.now();
      const cacheAge = now - cachedData.timestamp;
      if (cacheAge >= 10_000)
        dispatch(
          revalidateOrderHistoryInBackground({
            page: page - 1,
            size: PAGE_SIZE,
            sortBy: 'createdAt',
            direction: 'desc',
          })
        );
    }
  }, [cachedData, dispatch, page]);

  /** Check stale status on cache change */
  useEffect(() => {
    dispatch(checkStaleStatus());
  }, [dispatch, cachedData]);

  /** Map to UI type */
  const convertToOrderItem = (
    orderItem: OrderItemResponse
  ): OrderItem & { orderId: string } => ({
    product: {
      id: parseInt(orderItem.productId.split('-')[0], 16),
      name: orderItem.productName,
      price: orderItem.price,
      discountPrice:
        orderItem.appliedDiscountAmount > 0
          ? orderItem.price - orderItem.appliedDiscountAmount
          : undefined,
      brand: orderItem.storeName,
      image: orderItem.productImageUrl,
      deliveryType:
        orderItem.shippingOption === 'DELIVERY' ? 'delivery' : 'pickup',
    },
    quantity: orderItem.quantity,
    orderId: orderItem.orderId,
  });

  /** Backend → readable Korean status */
  const getStatusDisplayText = (status: string): string => {
    const map: Record<string, string> = {
      PENDING_PAYMENT: '결제 대기',
      PAID: '결제 완료',
      PREPARING: '상품 준비중',
      READY_FOR_PICKUP: '픽업 준비완료',
      DELIVERY_STARTED: '배송중',
      COMPLETED: '배송 완료',
      CANCELLED: '주문 취소',
      RETURNED: '반품',
      EXCHANGED: '교환 완료',
    };
    return map[status] || status;
  };

  /** Extract date (yyyy.mm.dd) from orderNumber */
  const formatDate = (orderNumber: string): string => {
    const match = orderNumber.match(/ORD-(\d{6})-/);
    if (match) {
      const d = match[1];
      return `20${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4, 6)}`;
    }
    return new Date().toLocaleDateString('ko-KR').replace(/\s/g, '');
  };

  /** Filters */
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (selectedStatus !== '전체보기') {
      result = result.filter(
        (o) => getStatusDisplayText(o.status) === selectedStatus
      );
    }

    if (selectedPeriod !== '전체보기') {
      const months =
        selectedPeriod === '1개월'
          ? 1
          : selectedPeriod === '3개월'
          ? 3
          : selectedPeriod === '6개월'
          ? 6
          : 12;

      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setMonth(now.getMonth() - months);

      result = result.filter((o) => {
        const match = o.orderNumber.match(/ORD-(\d{6})-/);
        if (!match) return true;
        const date = match[1];
        const orderDate = new Date(
          `20${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4, 6)}`
        );
        return orderDate >= cutoff;
      });
    }

    return result;
  }, [orders, selectedStatus, selectedPeriod]);

  /** Pagination info */
  const totalPages =
    cachedData?.data?.data?.pageInfo?.totalPages ??
    Math.ceil(filteredOrders.length / PAGE_SIZE);

  /** Loading state */
  if (loading && !cachedData) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <FilterBar
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
          <div className={styles.list}>
            <OrderHistorySkeleton count={5} />
          </div>
        </div>
      </div>
    );
  }

  /** Error state */
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <FilterBar
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
          <div className={styles.error}>오류: {error}</div>
        </div>
      </div>
    );
  }

  /** Main render */
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <FilterBar
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <div className={styles.list}>
          {filteredOrders.length === 0 ? (
            <div className={styles.emptyContainer}>
              <Image
                src="/images/products/noresult.png"
                alt="No orders"
                width={100}
                height={100}
                className={styles.emptyImage}
              />
              <p className={styles.emptyText}>주문 내역이 없습니다.</p>
            </div>
          ) : (
            filteredOrders.map((orderItem) => (
              <OrderHistoryItem
                key={orderItem.orderItemId}
                orderItemId={orderItem.orderItemId}
                orderNumber={orderItem.orderNumber}
                status={getStatusDisplayText(orderItem.status)}
                date={formatDate(orderItem.orderNumber)}
                item={convertToOrderItem(orderItem)}
              />
            ))
          )}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <div style={{ width: 320 }}>
              <ClientPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

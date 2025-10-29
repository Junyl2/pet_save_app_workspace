'use client';
import React, { useEffect, useState, useMemo } from 'react';
import FilterBar from '../../../sections/FilterBar/FilterBar';
import Image from 'next/image';
import styles from './OrderHistory.module.css';
import OrderHistoryItem from './order-history-item/OrderHistoryItem';
import OrderHistorySkeleton from '../../../ui/SkeletonLoading/OrderHistorySkeleton';
import { OrderItemResponse } from '@/app/api/types/member/order/orderDetails';
import { OrderItem } from '@/app/components/types/order';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import {
  fetchOrderHistory,
  revalidateOrderHistoryInBackground,
  checkStaleStatus,
} from '@/app/redux/slices/cache/orderSlice';

// Must match FilterBar display statuses
const ALLOWED_DISPLAY_STATUSES = [
  '상품 준비중',
  '배송중',
  '배송 완료',
  '픽업중',
  '픽업 완료',
  '배송완료',
];

export default function OrderHistory() {
  const dispatch = useAppDispatch();
  const { orderHistoryCache, loading, error } = useAppSelector(
    (state) => state.orders
  );

  const cachedData = orderHistoryCache['default'];

  // Wrap orders in useMemo to ensure stable reference
  const orders = useMemo<OrderItemResponse[]>(
    () => cachedData?.data?.data?.content || [],
    [cachedData]
  );

  const [selectedPeriod, setSelectedPeriod] = useState('3개월');
  const [selectedStatus, setSelectedStatus] = useState('전체보기');

  // Fetch order history on mount
  useEffect(() => {
    dispatch(fetchOrderHistory());
  }, [dispatch]);

  // Background revalidation every 10s
  useEffect(() => {
    if (cachedData) {
      const now = Date.now();
      const cacheAge = now - cachedData.timestamp;
      if (cacheAge >= 10_000) {
        dispatch(revalidateOrderHistoryInBackground());
      }
    }
  }, [cachedData, dispatch]);

  // Check stale cache
  useEffect(() => {
    dispatch(checkStaleStatus());
  }, [dispatch, cachedData]);

  const convertToOrderItem = (orderItem: OrderItemResponse): OrderItem => ({
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
  });

  const getStatusDisplayText = (status: string): string => {
    const map: Record<string, string> = {
      PENDING_PAYMENT: '결제 대기',
      PAID: '결제 완료',
      PREPARING: '상품 준비중',
      READY_FOR_PICKUP: '픽업 준비완료',
      DELIVERY_STARTED: '배송중',
      DELIVERED: '배송 완료',
      PICKUP_IN_PROGRESS: '픽업중',
      PICKUP_COMPLETED: '픽업 완료',
      COMPLETED: '배송완료',
      CANCELLED: '주문 취소',
      RETURNED: '반품',
      REFUNDED: '환불 완료',
    };
    return map[status] || status;
  };

  const formatDate = (orderNumber: string): string => {
    const match = orderNumber.match(/ORD-(\d{6})-/);
    if (match) {
      const dateStr = match[1];
      const year = '20' + dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const day = dateStr.substring(4, 6);
      return `${year}.${month}.${day}`;
    }
    return new Date()
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\s/g, '');
  };

  // Filtered orders (memoized)
  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) =>
      ALLOWED_DISPLAY_STATUSES.includes(getStatusDisplayText(o.status))
    );

    if (selectedStatus !== '전체보기') {
      result = result.filter((o) => {
        const displayStatus = getStatusDisplayText(o.status);
        if (selectedStatus === '배송 완료') {
          return displayStatus === '배송 완료' || displayStatus === '주문 완료';
        }
        if (selectedStatus === '주문 완료') {
          return displayStatus === '주문 완료' || displayStatus === '배송 완료';
        }
        return displayStatus === selectedStatus;
      });
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
          `20${date.substring(0, 2)}-${date.substring(2, 4)}-${date.substring(
            4,
            6
          )}`
        );
        return orderDate >= cutoff;
      });
    }

    return result;
  }, [orders, selectedStatus, selectedPeriod]);

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
                orderId={orderItem.orderId}
                orderNumber={orderItem.orderNumber}
                status={getStatusDisplayText(orderItem.status)}
                date={formatDate(orderItem.orderNumber)}
                item={convertToOrderItem(orderItem)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

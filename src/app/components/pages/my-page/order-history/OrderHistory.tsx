'use client';
import React, { useEffect } from 'react';

import FilterBar from '../../../sections/FilterBar/FilterBar';
import styles from './OrderHistory.module.css';
import OrderHistoryItem from './order-history-item/OrderHistoryItem';
import OrderHistorySkeleton from '../../../ui/SkeletonLoading/OrderHistorySkeleton';
import { OrderItemResponse } from '@/app/api/types/member/order/orderDetails';
import { OrderItem } from '@/app/components/types/order';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { fetchOrderHistory } from '@/app/redux/slices/cache/orderSlice';

export default function OrderHistory() {
  const dispatch = useAppDispatch();

  // Redux state
  const { orderHistoryCache, loading, error } = useAppSelector(
    (state) => state.orders
  );

  // Get cached order history data
  const cachedData = orderHistoryCache['default']; // Default cache key for no params
  const orders = cachedData?.data?.data?.content || [];

  // Fetch order history using Redux
  useEffect(() => {
    console.log('Dispatching fetchOrderHistory with default params');
    dispatch(fetchOrderHistory());
  }, [dispatch]);

  // Convert API order item data to format expected by OrderHistoryItem
  const convertToOrderItem = (orderItem: OrderItemResponse): OrderItem => {
    return {
      product: {
        id: parseInt(orderItem.productId.split('-')[0], 16), // Convert UUID to number for compatibility
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
    };
  };

  // Convert order status to Korean display text
  const getStatusDisplayText = (status: string): string => {
    const statusMap: Record<string, string> = {
      PENDING_PAYMENT: '결제 대기',
      PAID: '결제 완료',
      PREPARING: '배송 준비중',
      READY_FOR_PICKUP: '픽업 준비완료',
      DELIVERY_STARTED: '배송중',
      DELIVERED: '배송 완료',
      PICKUP_COMPLETED: '픽업 완료',
      COMPLETED: '주문 완료',
      CANCELLED: '주문 취소',
      RETURNED: '반품',
      REFUNDED: '환불 완료',
    };

    return statusMap[status] || status;
  };

  // Format date to Korean format (using order number date since API doesn't provide creation date)
  const formatDate = (orderNumber: string): string => {
    // Extract date from order number format: ORD-251014-XXXX
    const dateMatch = orderNumber.match(/ORD-(\d{6})-/);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const year = '20' + dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const day = dateStr.substring(4, 6);
      return `${year}.${month}.${day}`;
    }
    // Fallback to current date if parsing fails
    return new Date()
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\./g, '.')
      .replace(/\s/g, '');
  };

  // Show loading only if we don't have cached data and are loading
  const shouldShowLoading = loading && !cachedData;
  if (shouldShowLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <FilterBar />
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
          <FilterBar />
          <div className={styles.error}>오류: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <FilterBar />

        <div className={styles.list}>
          {orders.length === 0 ? (
            <div className={styles.empty}>주문 내역이 없습니다.</div>
          ) : (
            orders.map((orderItem) => (
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

'use client';
import React from 'react';

import FilterBar from '../../../sections/FilterBar/FilterBar';
import styles from './OrderHistory.module.css';
import OrderHistoryItem from './order-history-item/OrderHistoryItem';
import { mockOrders } from '@/app/components/data/mockOrders';

export default function OrderHistory() {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <FilterBar />

        <div className={styles.list}>
          {mockOrders.map((order) => (
            <OrderHistoryItem
              key={order.orderNumber}
              orderId={order.orderNumber}
              orderNumber={order.orderNumber}
              status={order.status}
              date={order.date}
              item={order.item}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import styles from './DeliveryPickup.module.css';

type Order = {
  id: string; // 주문번호
  orderedAt: string; // 주문일시
  buyer: string; // 주문자
  contact: string; // 연락처
  productName: string; // 상품명
  option: string; // 옵션
  trackingNumber: string; // 운송장번호
};

const orders: Order[] = [
  {
    id: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    buyer: '홍길동',
    contact: '010-0000-0000',
    productName: '상품명 / 옵션',
    option: '배송',
    trackingNumber: 'CJ / 12345678910',
  },
];

export default function DeliveryPickupPage() {
  const handleComplete = (id: string) => console.log('수령 완료:', id);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>주문번호</div>
        <div>주문일시</div>
        <div>주문자</div>
        <div>연락처</div>
        <div>상품명</div>
        <div>옵션</div>
        <div>운송장번호</div>
      </div>

      {orders.map((order) => (
        <div key={order.id} className={styles.row}>
          <div>{order.id}</div>
          <div>{order.orderedAt}</div>
          <div>{order.buyer}</div>
          <div>{order.contact}</div>
          <div>{order.productName}</div>
          <div>{order.option}</div>
          <div className={styles.trackingCell}>
            <span className={styles.trackingText}>{order.trackingNumber}</span>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.completeBtn}
              onClick={() => handleComplete(order.id)}
            >
              수령 완료
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import React from 'react';
import styles from './ProductPreperation.module.css';

type Order = {
  id: string;
  orderedAt: string;
  buyer: string;
  contact: string;
  product: string;
  receiveMethod: string;
};

const orders: Order[] = [
  {
    id: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    buyer: '홍길동',
    contact: '010-0000-0000',
    product: '상품명 / 옵션',
    receiveMethod: '배송',
  },
  {
    id: '20250401-011',
    orderedAt: '2025-04-01 12:10',
    buyer: '김철수',
    contact: '010-1234-5678',
    product: '사과 3kg / 박스',
    receiveMethod: '픽업',
  },
  {
    id: '20250401-012',
    orderedAt: '2025-04-01 13:05',
    buyer: '이영희',
    contact: '010-9876-5432',
    product: '딸기 1kg / 냉장',
    receiveMethod: '배송',
  },
  {
    id: '20250401-013',
    orderedAt: '2025-04-01 14:22',
    buyer: '박민수',
    contact: '010-2222-3333',
    product: '바나나 / 묶음',
    receiveMethod: '배송',
  },
];

export default function ProductPreperationPage() {
  const handleCancel = (id: string) => console.log('취소:', id);
  const handleStartDelivery = (id: string) =>
    console.log('배송 처리 시작:', id);

  return (
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

      {orders.map((order) => (
        <div key={order.id} className={styles.row}>
          <div>{order.id}</div>
          <div>{order.orderedAt}</div>
          <div>{order.buyer}</div>
          <div>{order.contact}</div>
          <div>{order.product}</div>
          <div>{order.receiveMethod}</div>
          <div className={styles.actions}>
            <button
              className={styles.cancelBtn}
              onClick={() => handleCancel(order.id)}
            >
              취소
            </button>
            <button
              className={styles.startBtn}
              onClick={() => handleStartDelivery(order.id)}
            >
              배송 처리 시작
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

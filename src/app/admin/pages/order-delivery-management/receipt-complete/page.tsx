'use client';

import React from 'react';
import styles from './ReceiptComplete.module.css';

type Order = {
  id: string;
  orderedAt: string;
  buyer: string;
  contact: string;
  productName: string;
  option: string;
  method: '배송' | '픽업';
  trackingNumber?: string;
  completedAt: string;
};

const orders: Order[] = [
  //  available for review (배송 → 후기 보기 enabled)
  {
    id: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    buyer: '홍길동',
    contact: '010-0000-0000',
    productName: '상품명',
    option: '옵션',
    method: '배송',
    trackingNumber: 'CJ / 12345678910',
    completedAt: '2025-04-15',
  },
  //  not available for review (픽업 → 후기 보기 disabled, no 운송장번호)
  {
    id: '20250401-011',
    orderedAt: '2025-04-01 11:32',
    buyer: '홍길동',
    contact: '010-0000-0000',
    productName: '상품명',
    option: '옵션',
    method: '픽업',
    completedAt: '2025-04-15',
  },
];

export default function ReceiptCompletePage() {
  const handleCancel = (id: string) => console.log('취소:', id);
  const handleReview = (id: string) => console.log('후기 보기:', id);

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
        <div>수령 완료일</div>
        <div />
      </div>

      {orders.map((o) => {
        const reviewEnabled = o.method === '배송';
        return (
          <div key={o.id} className={styles.row}>
            <div>{o.id}</div>
            <div>{o.orderedAt}</div>
            <div>{o.buyer}</div>
            <div>{o.contact}</div>
            <div>{o.productName}</div>
            <div>{o.option}</div>
            <div>{o.trackingNumber ?? '—'}</div>
            <div>{o.completedAt}</div>
            <div className={styles.actions}>
              <button
                className={styles.cancelBtn}
                onClick={() => handleCancel(o.id)}
              >
                취소
              </button>
              <button
                className={`${styles.reviewBtn} ${
                  !reviewEnabled ? styles.disabled : ''
                }`}
                onClick={() => reviewEnabled && handleReview(o.id)}
                disabled={!reviewEnabled}
                aria-disabled={!reviewEnabled}
                title={
                  reviewEnabled ? '후기 보기' : '픽업 주문은 후기 작성 불가'
                }
              >
                후기 보기
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

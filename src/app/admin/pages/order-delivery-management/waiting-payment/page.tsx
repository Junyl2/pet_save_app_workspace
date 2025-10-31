'use client';

import React, { useMemo } from 'react';
import styles from './WaitingPayment.module.css';

import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';

type Order = {
  id: string;
  orderedAt: string;
  buyer: string;
  contact: string;
  price: number;
  paymentMethod: string;
};

const KRW = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';
const PAGE_SIZE = 10;

const orders: Order[] = [
  {
    id: '20250401-001',
    orderedAt: '2025-04-01 11:32',
    buyer: '홍길동',
    contact: '010-0000-0000',
    price: 1000,
    paymentMethod: '무통장 입금',
  },
  {
    id: '20250401-002',
    orderedAt: '2025-04-01 11:41',
    buyer: '김철수',
    contact: '010-1234-5678',
    price: 24500,
    paymentMethod: '무통장 입금',
  },
  {
    id: '20250401-003',
    orderedAt: '2025-04-01 12:02',
    buyer: '이영희',
    contact: '010-1111-2222',
    price: 8900,
    paymentMethod: '신용카드',
  },
  {
    id: '20250401-004',
    orderedAt: '2025-04-01 12:35',
    buyer: '박민수',
    contact: '010-2222-3333',
    price: 15600,
    paymentMethod: '무통장 입금',
  },
  {
    id: '20250401-005',
    orderedAt: '2025-04-01 13:03',
    buyer: '최지우',
    contact: '010-3333-4444',
    price: 5800,
    paymentMethod: '간편결제',
  },
  {
    id: '20250401-006',
    orderedAt: '2025-04-01 13:48',
    buyer: '정우성',
    contact: '010-4444-5555',
    price: 32000,
    paymentMethod: '무통장 입금',
  },
  {
    id: '20250401-007',
    orderedAt: '2025-04-01 14:11',
    buyer: '김하나',
    contact: '010-5555-6666',
    price: 6700,
    paymentMethod: '신용카드',
  },
  {
    id: '20250401-008',
    orderedAt: '2025-04-01 14:45',
    buyer: '이도연',
    contact: '010-6666-7777',
    price: 10200,
    paymentMethod: '무통장 입금',
  },
  {
    id: '20250401-009',
    orderedAt: '2025-04-01 15:15',
    buyer: '오지훈',
    contact: '010-7777-8888',
    price: 21200,
    paymentMethod: '간편결제',
  },
  {
    id: '20250401-010',
    orderedAt: '2025-04-01 15:45',
    buyer: '윤서진',
    contact: '010-8888-9999',
    price: 15000,
    paymentMethod: '신용카드',
  },
  {
    id: '20250401-011',
    orderedAt: '2025-04-01 16:10',
    buyer: '강지훈',
    contact: '010-9999-0000',
    price: 27500,
    paymentMethod: '무통장 입금',
  },
  {
    id: '20250401-012',
    orderedAt: '2025-04-01 16:33',
    buyer: '김예린',
    contact: '010-0001-2222',
    price: 9300,
    paymentMethod: '신용카드',
  },
  {
    id: '20250401-013',
    orderedAt: '2025-04-01 16:59',
    buyer: '이재훈',
    contact: '010-1231-5555',
    price: 18300,
    paymentMethod: '무통장 입금',
  },
  {
    id: '20250401-014',
    orderedAt: '2025-04-01 17:22',
    buyer: '정수빈',
    contact: '010-2232-6666',
    price: 12800,
    paymentMethod: '간편결제',
  },
  {
    id: '20250401-015',
    orderedAt: '2025-04-01 17:47',
    buyer: '최준호',
    contact: '010-9988-8877',
    price: 22100,
    paymentMethod: '신용카드',
  },
];

export default function WaitingPaymentPage() {
  const { page, setPage } = usePageParam(1);

  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  const handleCancel = (id: string) => console.log('취소:', id);
  const handleStart = (id: string) => console.log('상품 준비 시작:', id);

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

        {pagedOrders.map((order) => (
          <div key={order.id} className={styles.row}>
            <div>{order.id}</div>
            <div>{order.orderedAt}</div>
            <div>{order.buyer}</div>
            <div>{order.contact}</div>
            <div>{KRW(order.price)}</div>
            <div>{order.paymentMethod}</div>
            <div className={styles.actions}>
              <button
                className={styles.cancelBtn}
                onClick={() => handleCancel(order.id)}
              >
                취소
              </button>
              <button
                className={styles.startBtn}
                onClick={() => handleStart(order.id)}
              >
                상품 준비 시작
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* only show when data > 10 */}
      {total > PAGE_SIZE && (
        <div
          style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}
        >
          <div style={{ width: 320 }}>
            <OrderPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useMemo } from 'react';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';

type Order = {
  orderNumber: string;
  orderedAt: string;
  customer: string;
  documentType: string;
  issueNumber: string;
  amount: string;
  status: string;
};

const PAGE_SIZE = 10;

const orders: Order[] = [
  {
    orderNumber: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    customer: '홍길동',
    documentType: 'Income Deduction (Personal)',
    issueNumber: '010-0000-0000',
    amount: '50,000 KRW',
    status: 'Issued',
  },
  {
    orderNumber: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    customer: '홍길동',
    documentType: 'Expense Proof (Business)',
    issueNumber: '010-0000-0000',
    amount: '50,000 KRW',
    status: 'Pending',
  },
  {
    orderNumber: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    customer: '홍길동',
    documentType: 'Tax Invoice',
    issueNumber: '010-0000-0000',
    amount: '50,000 KRW',
    status: 'Pending',
  },
  {
    orderNumber: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    customer: '홍길동',
    documentType: 'Expense Proof (Business)',
    issueNumber: '010-0000-0000',
    amount: '50,000 KRW',
    status: 'Pending',
  },
  {
    orderNumber: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    customer: '홍길동',
    documentType: 'Tax Invoice',
    issueNumber: '010-0000-0000',
    amount: '50,000 KRW',
    status: 'Pending',
  },
  {
    orderNumber: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    customer: '홍길동',
    documentType: 'Tax Invoice',
    issueNumber: '010-0000-0000',
    amount: '50,000 KRW',
    status: 'Pending',
  },
  {
    orderNumber: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    customer: '홍길동',
    documentType: 'Tax Invoice',
    issueNumber: '010-0000-0000',
    amount: '50,000 KRW',
    status: 'Pending',
  },
  {
    orderNumber: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    customer: '홍길동',
    documentType: 'Income Deduction (Personal)',
    issueNumber: '010-0000-0000',
    amount: '50,000 KRW',
    status: 'Registered',
  },
  {
    orderNumber: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    customer: '홍길동',
    documentType: 'Income Deduction (Personal)',
    issueNumber: '010-0000-0000',
    amount: '50,000 KRW',
    status: 'Registered',
  },
  {
    orderNumber: '20250401-010',
    orderedAt: '2025-04-01 11:32',
    customer: '홍길동',
    documentType: 'Income Deduction (Personal)',
    issueNumber: '010-0000-0000',
    amount: '50,000 KRW',
    status: 'Registered',
  },
  {
    orderNumber: '20250401-020',
    orderedAt: '2025-04-01 12:01',
    customer: '김철수',
    documentType: 'Tax Invoice',
    issueNumber: '010-1234-5678',
    amount: '75,000 KRW',
    status: 'Issued',
  },
  {
    orderNumber: '20250401-021',
    orderedAt: '2025-04-01 12:45',
    customer: '이영희',
    documentType: 'Expense Proof (Business)',
    issueNumber: '010-1111-2222',
    amount: '120,000 KRW',
    status: 'Pending',
  },
  {
    orderNumber: '20250401-022',
    orderedAt: '2025-04-01 13:10',
    customer: '박민수',
    documentType: 'Tax Invoice',
    issueNumber: '010-2222-3333',
    amount: '30,000 KRW',
    status: 'Pending',
  },
  {
    orderNumber: '20250401-023',
    orderedAt: '2025-04-01 13:47',
    customer: '최지우',
    documentType: 'Income Deduction (Personal)',
    issueNumber: '010-3333-4444',
    amount: '60,000 KRW',
    status: 'Registered',
  },
  {
    orderNumber: '20250401-024',
    orderedAt: '2025-04-01 14:18',
    customer: '정우성',
    documentType: 'Expense Proof (Business)',
    issueNumber: '010-4444-5555',
    amount: '90,000 KRW',
    status: 'Pending',
  },
];

export default function DocumentListPage() {
  const { page, setPage } = usePageParam(1);

  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>Order Number</div>
          <div>Order Date & Time</div>
          <div>Customer</div>
          <div>Document Type</div>
          <div>Issue Number</div>
          <div>Amount</div>
          <div>Status</div>
        </div>

        {pagedOrders.map((order, idx) => (
          <div
            key={`${order.orderNumber}-${(currentPage - 1) * PAGE_SIZE + idx}`}
            className={styles.row}
          >
            <div>{order.orderNumber}</div>
            <div>{order.orderedAt}</div>
            <div>{order.customer}</div>
            <div>{order.documentType}</div>
            <div>{order.issueNumber}</div>
            <div>{order.amount}</div>
            <div>{order.status}</div>
          </div>
        ))}
      </div>

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

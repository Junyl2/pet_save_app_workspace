'use client';

import React, { useEffect, useState } from 'react';
import styles from './PaymentCompleted.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { SearchOrdersData } from '@/app/api/types/member/order/order';

interface OrderRow {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerContact: string;
  totalAmount: number;
  paymentMethod: string;
}

const KRW = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';
const PAGE_SIZE = 10;

export default function PaymentCompletedPage() {
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await orderService.searchOrders({
          generalStatus: 'PAID',
          page: page - 1,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc',
        });

        if (error || !data?.success) {
          console.error('Fetch failed:', error);
          setOrders([]);
          return;
        }

        const result = data.data as SearchOrdersData;

        const mapped: OrderRow[] =
          result.content?.map((o) => ({
            orderNumber: o.orderNumber,
            createdAt: o.createdAt,
            customerName: o.customerName ?? '-',
            customerContact: o.customerContact ?? '-',
            totalAmount: o.totalAmount ?? 0,
            paymentMethod: o.paymentMethod ?? '-',
          })) ?? [];

        setOrders(mapped);
        setTotalPages(result.pageInfo?.totalPages ?? 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

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

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && orders.length === 0 && (
          <div className={styles.empty}>결제 완료된 주문이 없습니다.</div>
        )}

        {!loading &&
          orders.map((order) => (
            <div key={order.orderNumber} className={styles.row}>
              <div>{order.orderNumber}</div>
              <div>{order.createdAt}</div>
              <div>{order.customerName}</div>
              <div>{order.customerContact}</div>
              <div>{KRW(order.totalAmount)}</div>
              <div>{order.paymentMethod}</div>
              <div className={styles.actions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => handleCancel(order.orderNumber)}
                >
                  취소
                </button>
                <button
                  className={styles.startBtn}
                  onClick={() => handleStart(order.orderNumber)}
                >
                  상품 준비 시작
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

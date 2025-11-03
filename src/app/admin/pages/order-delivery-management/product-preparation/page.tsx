'use client';

import React, { useEffect, useState } from 'react';
import styles from './ProductPreperation.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { SearchOrdersData } from '@/app/api/types/member/order/order';

interface OrderRow {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerContact: string;
  productName: string;
  receiveMethod: string;
}

const PAGE_SIZE = 10;

export default function ProductPreperationPage() {
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await orderService.searchOrders({
          generalStatus: 'PREPARING',
          page: page - 1, // API uses 0-based index
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
          result.content?.flatMap((o) =>
            o.storeOrders?.flatMap((store: any) =>
              (store.items ?? []).map((item: any) => ({
                orderNumber: o.orderNumber,
                createdAt: o.createdAt,
                customerName: o.customerName ?? '-',
                customerContact: o.customerContact ?? '-',
                productName: item.productName ?? '-',
                receiveMethod:
                  store.shippingOption === 'DELIVERY' ? '배송' : '픽업',
              }))
            )
          ) ?? [];

        setOrders(mapped);
        setTotalPages(result.pageInfo?.totalPages ?? 1);
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders(); // prevents eslint "no-floating-promises"
  }, [page]);

  const handleCancel = (id: string) => console.log('취소:', id);
  const handleStartDelivery = (id: string) =>
    console.log('배송 처리 시작:', id);

  return (
    <>
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

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && orders.length === 0 && (
          <div className={styles.empty}>상품 준비 중인 주문이 없습니다.</div>
        )}

        {!loading &&
          orders.map((order) => (
            <div
              key={`${order.orderNumber}-${order.productName}`}
              className={styles.row}
            >
              <div>{order.orderNumber}</div>
              <div>{order.createdAt}</div>
              <div>{order.customerName}</div>
              <div>{order.customerContact}</div>
              <div>{order.productName}</div>
              <div>{order.receiveMethod}</div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => handleCancel(order.orderNumber)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className={styles.startBtn}
                  onClick={() => handleStartDelivery(order.orderNumber)}
                >
                  배송 처리 시작
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

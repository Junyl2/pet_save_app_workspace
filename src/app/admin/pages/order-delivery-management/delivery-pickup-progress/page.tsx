'use client';

import React, { useEffect, useState } from 'react';
import styles from './DeliveryPickup.module.css';
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
  option: string;
  trackingNumber: string;
  status: string; // Added to include DELIVERY_STARTED / READY_FOR_PICKUP
}

const PAGE_SIZE = 10;

export default function DeliveryPickupPage() {
  const { page, setPage } = usePageParam(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Fetch both READY_FOR_PICKUP and DELIVERY_STARTED
        const [pickupRes, deliveryRes] = await Promise.all([
          orderService.searchOrders({
            generalStatus: 'READY_FOR_PICKUP',
            page: page - 1,
            size: PAGE_SIZE,
            sortBy: 'createdAt',
            direction: 'desc',
          }),
          orderService.searchOrders({
            generalStatus: 'DELIVERY_STARTED',
            page: page - 1,
            size: PAGE_SIZE,
            sortBy: 'createdAt',
            direction: 'desc',
          }),
        ]);

        const pickupData = pickupRes.data?.data as SearchOrdersData | undefined;
        const deliveryData = deliveryRes.data?.data as
          | SearchOrdersData
          | undefined;

        const allOrders = [
          ...(pickupData?.content ?? []),
          ...(deliveryData?.content ?? []),
        ];

        const mapped: OrderRow[] = allOrders.flatMap((o) =>
          o.storeOrders?.flatMap((store: any) =>
            (store.items ?? []).map((item: any) => ({
              orderNumber: o.orderNumber,
              createdAt: o.createdAt,
              customerName: o.customerName ?? '-',
              customerContact: o.customerContact ?? '-',
              productName: item.productName ?? '-',
              option: o.generalStatus === 'DELIVERY_STARTED' ? '배송' : '픽업',
              /*   trackingNumber: item.deliveryId ? `CJ / ${item.deliveryId}` : '-', */
              status: o.generalStatus,
            }))
          )
        );

        setOrders(mapped);
        const maxPage =
          Math.max(
            pickupData?.pageInfo?.totalPages ?? 1,
            deliveryData?.pageInfo?.totalPages ?? 1
          ) || 1;
        setTotalPages(maxPage);
      } catch (err: unknown) {
        console.error('Error fetching delivery/pickup orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, [page]);

  const handleComplete = (id: string) => console.log('수령 완료:', id);

  return (
    <>
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

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && orders.length === 0 && (
          <div className={styles.empty}>
            배송 또는 픽업 대기 중인 주문이 없습니다.
          </div>
        )}

        {!loading &&
          orders.map((order) => (
            <div
              key={`${order.orderNumber}-${order.productName}-${order.status}`}
              className={styles.row}
            >
              <div>{order.orderNumber}</div>
              <div>{order.createdAt}</div>
              <div>{order.customerName}</div>
              <div>{order.customerContact}</div>
              <div>{order.productName}</div>
              <div>{order.option}</div>
              <div className={styles.trackingCell}>
                <span className={styles.trackingText}>
                  {order.trackingNumber}
                </span>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.completeBtn}
                  onClick={() => handleComplete(order.orderNumber)}
                >
                  수령 완료
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

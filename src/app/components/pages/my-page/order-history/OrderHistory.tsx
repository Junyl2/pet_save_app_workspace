'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import styles from './OrderHistory.module.css';
import FilterBar from '../../../sections/FilterBar/FilterBar';
import OrderHistoryItem from './order-history-item/OrderHistoryItem';
import OrderHistorySkeleton from '../../../ui/SkeletonLoading/OrderHistorySkeleton';
import ClientPagination from '@/app/components/admin/ui/ClientPagination/ClientPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import {
  fetchOrderHistory,
  revalidateOrderHistoryInBackground,
  checkStaleStatus,
  createOrderHistoryCacheKey,
} from '@/app/redux/slices/cache/orderSlice';
import {
  OrderItemResponse,
  OrderStatus,
} from '@/app/api/types/member/order/orderDetails';
import { OrderItem } from '@/app/components/types/order';

const PAGE_SIZE = 10;

const backendStatusMap: Record<string, OrderStatus | 'EXCHANGED'> = {
  '결제 대기': 'PENDING_PAYMENT',
  '결제 완료': 'PAID',
  '상품 준비중': 'PREPARING',
  '픽업 준비완료': 'READY_FOR_PICKUP',
  배송중: 'DELIVERY_STARTED',
  '배송 완료': 'COMPLETED',
  '주문 취소': 'CANCELLED',
  반품: 'RETURNED',
  '교환 완료': 'EXCHANGED',
};

const getDateRange = (period: string) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const monthsAgo = (m: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - m);
    return d.toISOString().split('T')[0];
  };
  switch (period) {
    case '1개월':
      return { dateStart: monthsAgo(1), dateEnd: today };
    case '3개월':
      return { dateStart: monthsAgo(3), dateEnd: today };
    case '6개월':
      return { dateStart: monthsAgo(6), dateEnd: today };
    case '1년':
      return { dateStart: monthsAgo(12), dateEnd: today };
    default:
      return {};
  }
};

export default function OrderHistory() {
  const dispatch = useAppDispatch();
  const { orderHistoryCache, loading, error } = useAppSelector(
    (state) => state.orders
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { page, setPage } = usePageParam(1);

  // Initialize filters from URL params or use defaults
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    return searchParams.get('period') || '3개월';
  });
  const [selectedStatus, setSelectedStatus] = useState(() => {
    return searchParams.get('status') || '전체보기';
  });

  /** Update URL params when filters change */
  const updateUrlParams = (period: string, status: string, pageNum: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('period', period);
    params.set('status', status);
    params.set('page', pageNum.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  /** Handle period change */
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setPage(1);
    updateUrlParams(period, selectedStatus, 1);
  };

  /** Handle status change */
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
    updateUrlParams(selectedPeriod, status, 1);
  };

  /** Update URL when page changes */
  useEffect(() => {
    updateUrlParams(selectedPeriod, selectedStatus, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /** Sync state with URL params when URL changes (e.g., when coming back from order detail) */
  useEffect(() => {
    const urlPeriod = searchParams.get('period');
    const urlStatus = searchParams.get('status');
    if (urlPeriod && urlPeriod !== selectedPeriod) {
      setSelectedPeriod(urlPeriod);
    }
    if (urlStatus && urlStatus !== selectedStatus) {
      setSelectedStatus(urlStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { dateStart, dateEnd } = getDateRange(selectedPeriod);
  const statusParam: OrderStatus | undefined =
    selectedStatus !== '전체보기'
      ? (backendStatusMap[selectedStatus] as OrderStatus | undefined)
      : undefined;

  const queryParams = useMemo(
    () => ({
      status: statusParam,
      dateStart,
      dateEnd,
      onlyReviewable: false,
      page: Math.max(0, page - 1), // Ensure page is never negative
      size: PAGE_SIZE,
      sortBy: 'createdAt' as const,
      direction: 'desc' as const,
    }),
    [statusParam, dateStart, dateEnd, page]
  );

  /** Create cache key based on current filters and page */
  const cacheKey = useMemo(
    () => createOrderHistoryCacheKey(queryParams),
    [queryParams]
  );

  /** Current cached data for this page */
  const cachedData = orderHistoryCache[cacheKey];
  const orders = useMemo<OrderItemResponse[]>(
    () => cachedData?.data?.data?.content || [],
    [cachedData]
  );

  /** Fetch on mount + when filters or page changes */
  useEffect(() => {
    dispatch(fetchOrderHistory(queryParams));
  }, [dispatch, queryParams, page]);

  /** Background revalidation */
  useEffect(() => {
    if (cachedData) {
      const now = Date.now();
      const cacheAge = now - cachedData.timestamp;
      if (cacheAge >= 10_000) {
        dispatch(revalidateOrderHistoryInBackground(queryParams));
      }
    }
  }, [cachedData, dispatch, queryParams]);

  /** Check stale status on cache change */
  useEffect(() => {
    dispatch(checkStaleStatus());
  }, [dispatch, cachedData]);

  /** Map to UI type */
  const convertToOrderItem = (
    orderItem: OrderItemResponse
  ): OrderItem & { orderId: string } => ({
    product: {
      id: parseInt(orderItem.productId.split('-')[0], 16),
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
    orderId: orderItem.orderId,
  });

  /** Backend → readable Korean status */
  const getStatusDisplayText = (status: string): string => {
    const map: Record<string, string> = {
      PENDING_PAYMENT: '결제 대기',
      PAID: '결제 완료',
      PREPARING: '상품 준비중',
      READY_FOR_PICKUP: '픽업 준비완료',
      DELIVERY_STARTED: '배송중',
      COMPLETED: '배송 완료',
      CANCELLED: '주문 취소',
      RETURNED: '반품',
      EXCHANGED: '교환 완료',
    };
    return map[status] || status;
  };

  /** Extract date (yyyy.mm.dd) from orderNumber */
  const formatDate = (orderNumber: string): string => {
    const match = orderNumber.match(/ORD-(\d{6})-/);
    if (match) {
      const d = match[1];
      return `20${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4, 6)}`;
    }
    return new Date().toLocaleDateString('ko-KR').replace(/\s/g, '');
  };

  /** Pagination info */
  const totalPages = cachedData?.data?.data?.pageInfo?.totalPages ?? 0;

  /** Loading state */
  if (loading && !cachedData) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <FilterBar
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
          />
          <div className={styles.list}>
            <OrderHistorySkeleton count={5} />
          </div>
        </div>
      </div>
    );
  }

  /** Error state */
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <FilterBar
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
          />
          <div className={styles.error}>오류: {error}</div>
        </div>
      </div>
    );
  }

  /** Main render */
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <FilterBar
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
        />

        <div className={styles.list}>
          {orders.length === 0 ? (
            <div className={styles.emptyContainer}>
              <Image
                src="/images/products/noresult.png"
                alt="No orders"
                width={100}
                height={100}
                className={styles.emptyImage}
              />
              <p className={styles.emptyText}>주문 내역이 없습니다.</p>
            </div>
          ) : (
            orders.map((orderItem) => (
              <OrderHistoryItem
                key={orderItem.orderItemId}
                orderItemId={orderItem.orderItemId}
                orderNumber={orderItem.orderNumber}
                status={getStatusDisplayText(orderItem.status)}
                date={formatDate(orderItem.orderNumber)}
                item={convertToOrderItem(orderItem)}
              />
            ))
          )}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <div style={{ width: 320 }}>
              <ClientPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

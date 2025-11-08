'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DateRange from '@/app/components/ui/DateRange/DateRange';
import styles from './OrderDetail.module.css';
import { PAGE_URLS } from '@/app/utils/page_url';
import { ExchangeReturnModal } from '../exchange-return-modal/ExchangeReturnModal';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { fetchOrderDetails } from '@/app/redux/slices/cache/orderSlice';
import { orderDetailsService } from '@/app/api/services/client/memberService/order/oderDetailsService';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';

/**
 * Displays detailed order information for a single orderItemId.
 * Fetches the parent orderId via /orders/items/{orderItemId}.
 */
export default function OrderDetail() {
  const params = useParams();
  const orderItemId = params?.orderItemId as string;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { orderDetailsCache, loading, error } = useAppSelector(
    (state) => state.orders
  );

  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [isExchangeRefundOpen, setIsExchangeRefundOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  /**
   * Step 1 — Resolve parent orderId using backend endpoint /orders/items/{orderItemId}.
   * Then fetch full order details and cache them.
   */
  useEffect(() => {
    if (!orderItemId) return;

    (async () => {
      try {
        const { data, error } =
          await orderDetailsService.getOrderDetailsByItemId(orderItemId);
        if (error || !data?.data?.content?.length) {
          setToast({ message: 'Order information not found.' });
          return;
        }

        const parentOrderId = data.data.content[0].orderId;
        setResolvedOrderId(parentOrderId);
        dispatch(fetchOrderDetails(parentOrderId));
      } catch {
        setToast({ message: 'Error fetching order details.' });
      }
    })();
  }, [orderItemId, dispatch]);

  /**
   * Step 2 — Access cached order details from Redux once fetched.
   */
  const cachedData = resolvedOrderId
    ? orderDetailsCache[resolvedOrderId]
    : undefined;
  const orderItems = cachedData?.orderItems ?? [];

  // --- Loading / Error states ---
  if (loading && !cachedData)
    return (
      <div className={styles.container}>
        <p>Loading order details...</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.container}>
        <p>Error: {error}</p>
      </div>
    );

  if (orderItems.length === 0)
    return (
      <div className={styles.container}>
        <p>No order information found.</p>
      </div>
    );

  // --- Utility formatters ---
  const formatDate = (orderNumber: string): string => {
    const match = orderNumber.match(/ORD-(\d{6})-/);
    if (match) {
      const d = match[1];
      return `20${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4, 6)}`;
    }
    return new Date().toLocaleDateString('ko-KR').replace(/\s/g, '');
  };

  const formatPrice = (price: number): string => price.toLocaleString('ko-KR');

  const getStatusText = (s: string): string => {
    const map: Record<string, string> = {
      PENDING_PAYMENT: '결제 대기',
      PAID: '결제 완료',
      PREPARING: '배송 준비중',
      READY_FOR_PICKUP: '픽업 준비완료',
      DELIVERY_STARTED: '배송중',
      DELIVERED: '배송 완료',
      PICKUP_COMPLETED: '픽업 완료',
      COMPLETED: '주문 완료',
      CANCELLED: '주문 취소',
      RETURNED: '반품',
      REFUNDED: '환불 완료',
    };
    return map[s] || s;
  };

  const getStatusClass = (s: string): string => {
    switch (s) {
      case 'CANCELLED':
      case 'RETURNED':
      case 'REFUNDED':
        return styles.statusRed;
      case 'DELIVERED':
      case 'PICKUP_COMPLETED':
      case 'COMPLETED':
        return styles.statusGreen;
      case 'PAID':
      case 'DELIVERY_STARTED':
      case 'PREPARING':
        return styles.statusBlue;
      default:
        return '';
    }
  };

  // --- Derived order info ---
  const mainOrderItem = orderItems[0];
  const orderNumber = mainOrderItem.orderNumber;
  const date = formatDate(orderNumber);
  const subtotal = orderItems.reduce((s, i) => s + i.subtotal, 0);
  const totalDiscount = orderItems.reduce(
    (s, i) => s + i.appliedDiscountAmount,
    0
  );
  const deliveryFee = mainOrderItem.deliveryFee ?? 0;
  const total =
    subtotal +
    (mainOrderItem.shippingOption === 'DELIVERY' ? deliveryFee : 0) -
    totalDiscount;
  const paymentMethod = mainOrderItem.paymentMethod;
  const status = mainOrderItem.status;

  /**
   * Navigate to order tracking page.
   */
  const handleTrackDelivery = (): void => {
    if (resolvedOrderId) router.push(PAGE_URLS.ORDER_TRACKING(resolvedOrderId));
  };

  /**
   * Delete order history.
   */
  const handleConfirmDelete = async (): Promise<void> => {
    if (!resolvedOrderId) return;
    try {
      setIsDeleting(true);
      const response = await orderDetailsService.deleteOrderHistory(
        resolvedOrderId
      );
      if (response.error) {
        setToast({ message: `Delete failed: ${response.error}` });
      } else {
        setToast({ message: 'Order history deleted.' });
        setTimeout(() => router.push(PAGE_URLS.MYPAGE), 1200);
      }
    } catch {
      setToast({ message: 'Error deleting order history.' });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  /**
   * Submit order cancellation request.
   */
  const handleSubmitCancel = async (): Promise<void> => {
    if (!resolvedOrderId) return;
    if (!selectedReason && !customReason) {
      setToast({
        message: 'Please select or enter a reason for cancellation.',
      });
      return;
    }
    try {
      setIsCancelling(true);
      const reason = customReason || selectedReason;
      const res = await orderService.cancelOrderByCustomer(
        resolvedOrderId,
        reason
      );
      if (res.error) {
        setToast({ message: `Cancellation failed: ${res.error}` });
      } else {
        setToast({ message: 'Order has been cancelled.' });
        await dispatch(fetchOrderDetails(resolvedOrderId));
        setIsCancelModalOpen(false);
      }
    } catch {
      setToast({ message: 'Error while cancelling order.' });
    } finally {
      setIsCancelling(false);
    }
  };

  const allCompleted = orderItems.every((i) => i.status === 'COMPLETED');

  // --- UI Rendering ---
  return (
    <div className={styles.container}>
      {/* Header & Payment Info */}
      <div className={styles.content}>
        <div className={styles.orderHeader}>
          <DateRange start={date} end={date} />
          <p className={styles.orderNumber}>주문번호 {orderNumber}</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>결제 정보</h3>
          <div className={styles.priceList}>
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>상품 가격</span>
              <span className={styles.priceValue}>
                {formatPrice(subtotal)}원
              </span>
            </div>
            {totalDiscount > 0 && (
              <div className={styles.priceItem}>
                <span className={styles.priceLabel}>포인트 사용</span>
                <span className={styles.priceValue}>
                  -{formatPrice(totalDiscount)}원
                </span>
              </div>
            )}
            {mainOrderItem.shippingOption === 'DELIVERY' && (
              <div className={styles.priceItem}>
                <span className={styles.priceLabel}>배송비</span>
                <span className={styles.priceValue}>
                  {formatPrice(deliveryFee)}원
                </span>
              </div>
            )}
            <div className={`${styles.priceItem} ${styles.paymentMethod}`}>
              <span className={styles.priceLabel}>
                {paymentMethod} / 일시불
              </span>
              <span className={styles.priceValue}>{formatPrice(total)}원</span>
            </div>
            <div className={styles.totalPrice}>
              <span className={styles.totalLabel}>총 결제금액</span>
              <span className={styles.totalValue}>{formatPrice(total)}원</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items */}
      <div className={styles.itemsSection}>
        <h3 className={`${styles.sectionTitle} ${getStatusClass(status)}`}>
          {getStatusText(status)}
        </h3>
        {orderItems.map((item) => (
          <div key={item.orderItemId} className={styles.orderItem}>
            <div className={styles.itemContent}>
              <img
                src={item.productImageUrl}
                alt={item.productName}
                className={styles.itemImage}
              />
              <div className={styles.itemDetails}>
                <h4 className={styles.itemName}>{item.productName}</h4>
                <p className={styles.storeName}>{item.storeName}</p>
                <div className={styles.itemPricing}>
                  {item.appliedDiscountAmount > 0 && (
                    <span className={styles.originalPrice}>
                      {formatPrice(item.price)}원
                    </span>
                  )}
                  <span className={styles.itemPrice}>
                    {formatPrice(item.totalAmount)}원
                  </span>
                  <span className={styles.itemQuantity}>{item.quantity}개</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className={styles.actionsSection}>
        <div className={styles.additionalActions}>
          {allCompleted && (
            <button
              className={styles.actionButton}
              onClick={() => router.push(PAGE_URLS.REVIEWS)}
            >
              리뷰 쓰기
            </button>
          )}
          <button className={styles.actionButton}>문의하기</button>
          <button
            className={styles.actionButton}
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '주문내역 삭제'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <ToastMessage message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Exchange / Return Modal */}
      <ExchangeReturnModal
        open={isExchangeRefundOpen}
        onClose={() => setIsExchangeRefundOpen(false)}
        orderId={resolvedOrderId ?? ''}
        product={{
          id: Number(mainOrderItem.productId),
          orderItemId: mainOrderItem.orderItemId,
          name: mainOrderItem.productName,
          price: mainOrderItem.price,
          discountPrice:
            mainOrderItem.appliedDiscountAmount > 0
              ? mainOrderItem.price - mainOrderItem.appliedDiscountAmount
              : undefined,
          brand: mainOrderItem.storeName,
          image: mainOrderItem.productImageUrl,
          deliveryType:
            mainOrderItem.shippingOption === 'DELIVERY' ? 'delivery' : 'pickup',
        }}
        onSelect={(choice) => console.log('User selected:', choice)}
      />
    </div>
  );
}

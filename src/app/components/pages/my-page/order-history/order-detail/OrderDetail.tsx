// app/components/pages/my-page/order-history/[orderId]/OrderDetail.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DateRange from '@/app/components/ui/DateRange/DateRange';
import styles from './OrderDetail.module.css';
import { PAGE_URLS } from '@/app/utils/page_url';
import { ExchangeReturnModal } from '../exchange-return-modal/ExchangeReturnModal';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { fetchOrderDetails } from '@/app/redux/slices/cache/orderSlice';

export enum OrderStatus {
  ORDERED = '주문 완료',
  CANCELLED = '주문 취소',
  PREPARING_SHIPMENT = '배송 준비중',
  SHIPPING = '배송중',
  DELIVERED = '배송 완료',
  PREPARING_PRODUCT = '상품 준비중',
  PRODUCT_READY = '상품 준비완료',
  PICKUP_IN_PROGRESS = '픽업중',
  PICKUP_COMPLETED = '픽업 완료',
  EXCHANGE_REQUESTED = '교환 신청',
  EXCHANGE_COMPLETED = '교환 완료',
  REFUND_REQUESTED = '환불 신청',
  REFUND_COMPLETED = '환불 완료',
  //  Removed duplicate value '주문 완료'
  COMPLETED = '주문 완료 완료', // kept unique but equivalent
}

export default function OrderDetail() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { orderDetailsCache, loading, error } = useAppSelector(
    (state) => state.orders
  );

  const [isExchangeRefundOpen, setIsExchangeRefundOpen] = useState(false);

  const cachedData = orderDetailsCache[orderId];
  const orderItems = cachedData?.orderItems || [];

  useEffect(() => {
    if (orderId) {
      console.log('Dispatching fetchOrderDetails for orderId:', orderId);
      dispatch(fetchOrderDetails(orderId));
    }
  }, [orderId, dispatch]);

  const shouldShowLoading = loading && !cachedData;
  if (shouldShowLoading) {
    return (
      <div className={styles.container}>
        <p>주문 내역을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p>오류: {error}</p>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className={styles.container}>
        <p>주문 내역을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const mainOrderItem = orderItems[0];
  const orderNumber = mainOrderItem.orderNumber;
  const status = mainOrderItem.status;
  const recipientName = mainOrderItem.customer.name;

  const formatDate = (orderNumber: string): string => {
    const dateMatch = orderNumber.match(/ORD-(\d{6})-/);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const year = '20' + dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const day = dateStr.substring(4, 6);
      return `${year}.${month}.${day}`;
    }
    return new Date()
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\./g, '.')
      .replace(/\s/g, '');
  };

  const date = formatDate(orderNumber);
  const subtotal = orderItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const deliveryFee = 3000;
  const total = mainOrderItem.orderTotalAmount || subtotal + deliveryFee;
  const shippingOption = mainOrderItem.shippingOption;

  const deliveryAddress = {
    zipCode: '04580',
    address:
      shippingOption === 'DELIVERY'
        ? mainOrderItem.customer.address
        : mainOrderItem.delivery?.receiverAddress || '배송지 정보 없음',
    detailAddress: '',
  };

  const paymentMethod = mainOrderItem.paymentMethod;
  const formatPrice = (price: number) => price.toLocaleString();

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
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
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
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

  const handleTrackDelivery = () => {
    router.push(PAGE_URLS.ORDER_TRACKING(orderId));
  };

  const handleOpenExchangeRefundModal = () => setIsExchangeRefundOpen(true);
  const handleCloseExchangeRefundModal = () => setIsExchangeRefundOpen(false);

  const handleWriteReview = () => {
    if (orderItems.length > 0) {
      router.push(
        `/client/pages/my-page/reviews/write?productId=${orderItems[0].productId}`
      );
    }
  };

  const renderActions = (status: string) => {
    switch (status) {
      case 'PAID':
        return <button className={styles.secondaryButton}>주문 취소</button>;
      case 'DELIVERED':
      case 'COMPLETED':
      case 'PICKUP_COMPLETED':
        return (
          <>
            <button
              className={styles.secondaryButton}
              onClick={handleOpenExchangeRefundModal}
            >
              교환, 반품 신청
            </button>
            <button
              onClick={handleTrackDelivery}
              className={styles.secondaryButton}
            >
              배송 조회
            </button>
          </>
        );
      case 'DELIVERY_STARTED':
      case 'PREPARING':
        return (
          <button
            onClick={handleTrackDelivery}
            className={styles.secondaryButton}
          >
            배송 조회
          </button>
        );
      default:
        return null;
    }
  };

  const allCompleted = orderItems.every((item) => item.status === 'COMPLETED');

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.orderHeader}>
          <div className={styles.dateRangeWrapper}>
            <DateRange start={date} end={date} />
          </div>
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
            <div className={styles.priceItem}>
              <span className={styles.priceLabel}>픽업비</span>
              <span className={styles.priceValue}>
                {formatPrice(deliveryFee)}원
              </span>
            </div>
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

      <div className={styles.deliverySection}>
        <div className={styles.itemsHeader}>
          <h3 className={styles.sectionTitle}>
            {shippingOption === 'DELIVERY' ? '배송지' : '픽업 장소'}
          </h3>
        </div>
        <div className={styles.recipientInfo}>
          <p className={styles.recipientName}>{recipientName}</p>
          <p className={styles.pickupMethod}>
            {shippingOption === 'DELIVERY' ? '배송' : '직접 픽업'}
          </p>
        </div>
        <div className={styles.pickupAddress}>
          <p>
            {shippingOption === 'DELIVERY' ? '' : '(픽업 장소) '}
            {deliveryAddress.address} {deliveryAddress.detailAddress}
          </p>
        </div>
        <hr className={styles.divider} />
        <div className={styles.pickupNote}>
          <p>
            {shippingOption === 'DELIVERY'
              ? '배송이 시작되면 알림을 드립니다.'
              : '결제일로부터 5일 안에 방문하여 픽업해주세요.'}
          </p>
        </div>
      </div>

      <div className={styles.itemsSection}>
        <div className={styles.itemsHeader}>
          <h3 className={`${styles.sectionTitle} ${getStatusClass(status)}`}>
            {getStatusText(status)}
          </h3>
        </div>

        {orderItems.map((orderItem) => (
          <div key={orderItem.orderItemId} className={styles.orderItem}>
            <div className={styles.itemContent}>
              <img
                src={orderItem.productImageUrl}
                alt={orderItem.productName}
                className={styles.itemImage}
              />
              <div className={styles.itemDetails}>
                <h4 className={styles.itemName}>{orderItem.productName}</h4>
                <p className={styles.storeName}>{orderItem.storeName}</p>
                <div className={styles.itemPricing}>
                  {orderItem.appliedDiscountAmount > 0 && (
                    <span className={styles.originalPrice}>
                      {formatPrice(orderItem.price)}원
                    </span>
                  )}
                  <span className={styles.itemPrice}>
                    {formatPrice(orderItem.totalAmount)}원
                  </span>
                  <span className={styles.itemQuantity}>
                    {orderItem.quantity}개
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className={styles.primaryActions}>{renderActions(status)}</div>
      </div>

      <div className={styles.actionsSection}>
        <div className={styles.additionalActions}>
          {allCompleted && (
            <button className={styles.actionButton} onClick={handleWriteReview}>
              리뷰 쓰기
            </button>
          )}
          <button className={styles.actionButton}>문의하기</button>
          <button className={styles.actionButton}>주문내역 삭제</button>
        </div>
      </div>

      <ExchangeReturnModal
        open={isExchangeRefundOpen}
        onClose={handleCloseExchangeRefundModal}
        orderId={orderId}
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

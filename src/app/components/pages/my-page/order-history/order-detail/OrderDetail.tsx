// app/components/pages/my-page/order-history/[orderId]/OrderDetail.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DateRange from '@/app/components/ui/DateRange/DateRange';
import styles from './OrderDetail.module.css';
import { mockOrders } from '@/app/components/data/mockOrders';
import { useRouter } from 'next/navigation';
import { PAGE_URLS } from '@/app/utils/page_url';
import { ExchangeRefundModal } from '../exchange-refund-modal/ExchangeRefundModal';

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
}

export default function OrderDetail() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const router = useRouter();

  // Order Exchange/Refund Modal
  const [isExchangeRefundOpen, setIsExchangeRefundOpen] = useState(false);

  // ✅ Find order from shared mockOrders
  const order = mockOrders.find((o) => o.orderNumber === orderId);
  const recipientName = order?.recipientName || '홍길동';

  useEffect(() => {
    if (orderId) {
      console.log('OrderDetail loaded for orderId:', orderId, order);
    }
  }, [orderId, order]);

  if (!order) {
    return (
      <div className={styles.container}>
        <p>주문 내역을 찾을 수 없습니다.</p>
      </div>
    );
  }

  // Extract order data
  const { orderNumber, date, status, item } = order;

  // For demo: calculate mock price values
  const subtotal = item.product.discountPrice ?? item.product.price;
  const deliveryFee = 3000;
  const total = subtotal * item.quantity + deliveryFee;

  const deliveryAddress = {
    zipCode: '04580',
    address: '서울특별시 중구 양화대교 407 5층',
    detailAddress: '',
  };

  const formatPrice = (price: number) => price.toLocaleString();

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      [OrderStatus.ORDERED]: '주문 완료',
      [OrderStatus.CANCELLED]: '주문 취소',
      [OrderStatus.PREPARING_SHIPMENT]: '배송 준비중',
      [OrderStatus.SHIPPING]: '배송중',
      [OrderStatus.DELIVERED]: '배송 완료',
      [OrderStatus.PREPARING_PRODUCT]: '상품 준비중',
      [OrderStatus.PRODUCT_READY]: '상품 준비완료',
      [OrderStatus.PICKUP_IN_PROGRESS]: '픽업중',
      [OrderStatus.PICKUP_COMPLETED]: '픽업 완료',
      [OrderStatus.EXCHANGE_REQUESTED]: '교환 신청',
      [OrderStatus.EXCHANGE_COMPLETED]: '교환 완료',
      [OrderStatus.REFUND_REQUESTED]: '환불 신청',
      [OrderStatus.REFUND_COMPLETED]: '환불 완료',
    };
    return statusMap[status] || status;
  };

  // ✅ Add status color mapping
  const getStatusClass = (status: string) => {
    switch (status) {
      case OrderStatus.CANCELLED:
      case OrderStatus.EXCHANGE_REQUESTED:
      case OrderStatus.EXCHANGE_COMPLETED:
      case OrderStatus.REFUND_REQUESTED:
      case OrderStatus.REFUND_COMPLETED:
        return styles.statusRed;

      case OrderStatus.DELIVERED:
      case OrderStatus.PICKUP_COMPLETED:
        return styles.statusGreen;

      case OrderStatus.ORDERED:
      case OrderStatus.SHIPPING:
      case OrderStatus.PREPARING_SHIPMENT:
        return styles.statusBlue;

      default:
        return '';
    }
  };

  const handleTrackDelivery = () => {
    router.push(PAGE_URLS.ORDER_TRACKING(orderId));
  };

  const handleOpenExchangeRefundModal = () => {
    setIsExchangeRefundOpen(true);
  };

  const handleCloseExchangeRefundModal = () => {
    setIsExchangeRefundOpen(false);
  };

  const renderActions = (status: string) => {
    switch (status) {
      case OrderStatus.ORDERED:
        return <button className={styles.secondaryButton}>주문 취소</button>;

      case OrderStatus.DELIVERED:
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

      case OrderStatus.PICKUP_COMPLETED:
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

      case OrderStatus.SHIPPING:
      case OrderStatus.PREPARING_SHIPMENT:
      case OrderStatus.CANCELLED:
      case OrderStatus.REFUND_COMPLETED:

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Order Date */}
        <div className={styles.orderHeader}>
          <div className={styles.dateRangeWrapper}>
            <DateRange start={date} end={date} />
          </div>
          <p className={styles.orderNumber}>주문번호 {orderNumber}</p>
        </div>

        {/* Order Summary */}
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
              <span className={styles.priceLabel}>토스뱅크카드 / 일시불</span>
              <span className={styles.priceValue}>{formatPrice(total)}원</span>
            </div>

            <div className={styles.totalPrice}>
              <span className={styles.totalLabel}>총 결제금액</span>
              <span className={styles.totalValue}>{formatPrice(total)}원</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className={styles.deliverySection}>
        <div className={styles.itemsHeader}>
          <h3 className={styles.sectionTitle}>배송지</h3>
        </div>

        <div className={styles.recipientInfo}>
          <p className={styles.recipientName}>{recipientName}</p>
          <p className={styles.pickupMethod}>직접 픽업</p>
        </div>

        <div className={styles.pickupAddress}>
          <p>
            (픽업 장소) {deliveryAddress.address}{' '}
            {deliveryAddress.detailAddress}
          </p>
        </div>

        <hr className={styles.divider} />

        <div className={styles.pickupNote}>
          <p>결제일로부터 5일 안에 방문하여 픽업해주세요.</p>
        </div>
      </div>

      {/* Order Items */}
      <div className={styles.itemsSection}>
        <div className={styles.itemsHeader}>
          <h3 className={`${styles.sectionTitle} ${getStatusClass(status)}`}>
            {getStatusText(status)}
          </h3>
        </div>

        <div key={item.product.id} className={styles.orderItem}>
          <div className={styles.itemContent}>
            <img
              src={item.product.image}
              alt={item.product.name}
              className={styles.itemImage}
            />
            <div className={styles.itemDetails}>
              <h4 className={styles.itemName}>{item.product.name}</h4>
              <div className={styles.itemPricing}>
                {item.product.discountPrice && (
                  <span className={styles.originalPrice}>
                    {formatPrice(item.product.price)}원
                  </span>
                )}
                <span className={styles.itemPrice}>
                  {formatPrice(
                    item.product.discountPrice ?? item.product.price
                  )}
                  원
                </span>
                <span className={styles.itemQuantity}>{item.quantity}개</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Conditional Actions */}
        <div className={styles.primaryActions}>{renderActions(status)}</div>
      </div>

      {/* Extra Actions */}
      <div className={styles.actionsSection}>
        <div className={styles.additionalActions}>
          <button className={styles.actionButton}>리뷰 쓰기</button>
          <button className={styles.actionButton}>문의하기</button>
          <button className={styles.actionButton}>주문내역 삭제</button>
        </div>
      </div>

      {/* ✅ Exchange/Refund Modal */}
      <ExchangeRefundModal
        open={isExchangeRefundOpen}
        onClose={handleCloseExchangeRefundModal}
        orderId={orderId}
        product={item.product} // ✅ passing full product
        onSelect={(choice) => {
          console.log('User selected:', choice);
          if (choice === 'exchange') {
            router.push(`/exchange/${orderId}`);
          } else {
            router.push(`/refund/${orderId}`);
          }
        }}
      />
    </div>
  );
}

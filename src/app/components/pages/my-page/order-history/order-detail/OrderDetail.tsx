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
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';

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
  COMPLETED = '주문 완료 완료',
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const cachedData = orderDetailsCache[orderId];
  const orderItems = cachedData?.orderItems || [];

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
  }, [orderId, dispatch]);

  useEffect(() => {
    document.body.style.overflow = isDeleteModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDeleteModalOpen]);

  if (loading && !cachedData) {
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
  const shippingOption = mainOrderItem.shippingOption;
  const deliveryFee = mainOrderItem.deliveryFee ?? 0;

  const formatDate = (orderNumber: string): string => {
    const match = orderNumber.match(/ORD-(\d{6})-/);
    if (match) {
      const [_, yymmdd] = match;
      return `20${yymmdd.substring(0, 2)}.${yymmdd.substring(
        2,
        4
      )}.${yymmdd.substring(4, 6)}`;
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
  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiscount = orderItems.reduce(
    (sum, item) => sum + item.appliedDiscountAmount,
    0
  );
  const total =
    subtotal +
    (shippingOption === 'DELIVERY' ? deliveryFee : 0) -
    totalDiscount;

  const deliveryAddress = {
    address:
      shippingOption === 'DELIVERY'
        ? mainOrderItem.customer.address
        : mainOrderItem.delivery?.receiverAddress || '배송지 정보 없음',
  };

  const paymentMethod = mainOrderItem.paymentMethod;
  const formatPrice = (price: number) => price.toLocaleString();

  const getStatusText = (status: string): string => {
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
    return map[status] || status;
  };

  const getStatusClass = (status: string): string => {
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

  const handleTrackDelivery = () =>
    router.push(PAGE_URLS.ORDER_TRACKING(orderId));
  const handleOpenExchangeRefundModal = () => setIsExchangeRefundOpen(true);
  const handleCloseExchangeRefundModal = () => setIsExchangeRefundOpen(false);

  const handleWriteReview = () => {
    if (orderItems.length > 0) {
      router.push(
        `/client/pages/my-page/reviews/write?productId=${orderItems[0].productId}`
      );
    }
  };

  const handleDeleteClick = () => setIsDeleteModalOpen(true);

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await orderDetailsService.deleteOrderHistory(orderId);
      if (response.error) {
        setToast({ message: `삭제 실패: ${response.error}` });
      } else {
        setToast({ message: '주문 내역이 삭제되었습니다.' });
        setTimeout(() => router.push(PAGE_URLS.MYPAGE), 1200);
      }
    } catch {
      setToast({ message: '삭제 중 오류가 발생했습니다.' });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCancelDelete = () => setIsDeleteModalOpen(false);

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

  const allCompleted = orderItems.every((i) => i.status === 'COMPLETED');

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

            {/* 포인트 사용 추가 */}
            {totalDiscount > 0 && (
              <div className={styles.priceItem}>
                <span className={styles.priceLabel}>포인트 사용</span>
                <span className={styles.priceValue}>
                  -{formatPrice(totalDiscount)}원
                </span>
              </div>
            )}

            {shippingOption === 'DELIVERY' && (
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
      <div className={styles.deliverySection}>
        <div className={styles.itemsHeader}>
          <h3 className={styles.sectionTitle}>
            {shippingOption === 'DELIVERY' ? '배송지' : '픽업 장소'}
          </h3>
        </div>

        {shippingOption === 'DELIVERY' ? (
          <>
            <div className={styles.recipientInfo}>
              <p className={styles.recipientName}>
                {mainOrderItem.delivery?.receiverName ?? '수령인 정보 없음'}
              </p>
              <p className={styles.pickupMethod}>
                {mainOrderItem.delivery?.receiverPhone ?? '연락처 정보 없음'}
              </p>
            </div>

            <div className={styles.pickupAddress}>
              <p>
                {mainOrderItem.delivery?.receiverAddress ?? '주소 정보 없음'}
              </p>
            </div>

            <hr className={styles.divider} />

            <div className={styles.pickupNote}>
              <p className={styles.deliveryNoteText}>
                <span className={styles.request}>배송요청사항:</span>
                {mainOrderItem.delivery?.deliveryNotes
                  ? mainOrderItem.delivery.deliveryNotes
                  : '요청사항이 없습니다.'}
              </p>
              <p className={styles.deliveryNoteText}>
                <span className={styles.request}>현재 상태:</span>
                {mainOrderItem.delivery?.currentStatus ?? '상태 정보 없음'}
              </p>
            </div>
          </>
        ) : (
          <div className={styles.pickupAddress}>
            <p>{mainOrderItem.storeAddress}</p>
            <p>{mainOrderItem.storePhoneNumber}</p>
          </div>
        )}
      </div>

      <div className={styles.itemsSection}>
        <div className={styles.itemsHeader}>
          <h3 className={`${styles.sectionTitle} ${getStatusClass(status)}`}>
            {getStatusText(status)}
          </h3>
        </div>

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
          <button
            className={styles.actionButton}
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '주문내역 삭제'}
          </button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>주문 내역을 삭제하시겠습니까?</h3>
            <p>삭제 후에는 복구할 수 없습니다.</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <ToastMessage message={toast.message} onClose={() => setToast(null)} />
      )}

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

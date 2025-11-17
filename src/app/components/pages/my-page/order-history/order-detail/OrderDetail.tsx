'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DateRange from '@/app/components/ui/DateRange/DateRange';
import styles from './OrderDetail.module.css';
import { PAGE_URLS } from '@/app/utils/page_url';
import { ExchangeReturnModal } from '../exchange-return-modal/ExchangeReturnModal';
import CancelOrderModal from './cancel-order-modal/CancelOrderModal';
import { DeleteModal } from '@/app/components/ui/modal/DeleteModal/DeleteModal';
import { orderDetailsService } from '@/app/api/services/client/memberService/order/oderDetailsService';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
import { OrderItemResponse } from '@/app/api/types/member/order/orderDetails';
import Loading from '@/app/components/ui/Loading/Loading';
import { ReviewService } from '@/app/api/services/client/memberService/review/reviewService';

/**
 * Displays detailed order information for a single orderItemId.
 * Uses GET /orders/items/{orderItemId} endpoint directly.
 */
export default function OrderDetail() {
  const params = useParams();
  const orderItemId = params?.orderItemId as string;
  const router = useRouter();

  const [orderItem, setOrderItem] = useState<OrderItemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [isExchangeRefundOpen, setIsExchangeRefundOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingReview, setCheckingReview] = useState(false);

  /**
   * Store order history URL when component mounts (for navigation after delete)
   * The URL should already be stored by OrderHistoryItem when navigating from order history
   * This effect ensures we have a fallback if needed
   */
  useEffect(() => {
    // Check if we already have a stored URL (set by OrderHistoryItem)
    const storedUrl = sessionStorage.getItem('orderHistoryReturnUrl');

    if (storedUrl) {
      // We already have a stored URL, keep it (don't overwrite)
      return;
    }

    // Fallback: Try to get from referrer if available
    const referrer = document.referrer;
    if (
      referrer &&
      referrer.includes('/order-history') &&
      !referrer.includes('/items/')
    ) {
      // Extract just the pathname and search params from referrer
      try {
        const referrerUrl = new URL(referrer);
        const orderHistoryUrl = `${referrerUrl.pathname}${referrerUrl.search}`;
        sessionStorage.setItem('orderHistoryReturnUrl', orderHistoryUrl);
      } catch {
        // If URL parsing fails, use the full referrer
        sessionStorage.setItem('orderHistoryReturnUrl', referrer);
      }
    } else {
      // No stored URL and no valid referrer, use base URL as fallback
      sessionStorage.setItem('orderHistoryReturnUrl', PAGE_URLS.ORDER_HISTORY);
    }
  }, []);

  /**
   * Fetch order details by orderItemId using GET /orders/items/{orderItemId}
   */
  useEffect(() => {
    if (!orderItemId) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } =
          await orderDetailsService.getOrderDetailsByItemId(orderItemId);

        if (fetchError || !data?.data) {
          setError(fetchError || 'Order information not found.');
          setToast({ message: 'Order information not found.' });
          return;
        }

        setOrderItem(data.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error fetching order details.';
        setError(errorMessage);
        setToast({ message: errorMessage });
      } finally {
        setLoading(false);
      }
    })();
  }, [orderItemId]);

  /**
   * Check if user has already reviewed this product
   */
  useEffect(() => {
    if (!orderItem?.productId) return;

    (async () => {
      try {
        setCheckingReview(true);
        const response = await ReviewService.getMyReviews({
          page: 0,
          size: 100, // Get enough reviews to check
        });

        if (response.data?.content) {
          const hasReview = response.data.content.some(
            (review) => review.product.productId === orderItem.productId
          );
          setHasReviewed(hasReview);
        }
      } catch (err) {
        // Silently fail - if we can't check, allow the button to be enabled
        console.error('Error checking review status:', err);
      } finally {
        setCheckingReview(false);
      }
    })();
  }, [orderItem?.productId]);

  // --- Loading / Error states ---
  if (loading) return <Loading />;

  if (error || !orderItem)
    return (
      <div className={styles.container}>
        <p>Error: {error || 'No order information found.'}</p>
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
  const orderNumber = orderItem.orderNumber;
  const date = formatDate(orderNumber);
  const subtotal = orderItem.subtotal;
  const totalDiscount = orderItem.appliedDiscountAmount;
  const deliveryFee = orderItem.deliveryFee ?? 0;
  const total =
    subtotal +
    (orderItem.shippingOption === 'DELIVERY' ? deliveryFee : 0) -
    totalDiscount;
  const paymentMethod = orderItem.paymentMethod;
  const status = orderItem.status;
  const recipientName = orderItem.customer.name;
  const shippingOption = orderItem.shippingOption;
  const deliveryAddress = {
    address:
      shippingOption === 'DELIVERY'
        ? orderItem.customer.address
        : orderItem.delivery?.receiverAddress ||
          orderItem.storeAddress ||
          '배송지 정보 없음',
  };

  /**
   * Navigate to order tracking page.
   */
  const handleTrackDelivery = (): void => {
    if (orderItem.orderId) {
      router.push(
        `${PAGE_URLS.ORDER_TRACKING(
          orderItem.orderId
        )}?orderItemId=${encodeURIComponent(orderItem.orderItemId)}`
      );
    }
  };

  /**
   * Open exchange/refund modal.
   */
  const handleOpenExchangeRefundModal = (): void => {
    setIsExchangeRefundOpen(true);
  };

  /**
   * Close exchange/refund modal.
   */
  const handleCloseExchangeRefundModal = (): void => {
    setIsExchangeRefundOpen(false);
  };

  /**
   * Navigate to write review page.
   */
  const handleWriteReview = (): void => {
    router.push(
      `/client/pages/my-page/reviews/write?productId=${orderItem.productId}`
    );
  };

  /**
   * Delete order history.
   * DELETE /api/pet-save/order-histories/orders/{orderId}
   */
  const handleConfirmDelete = async (): Promise<void> => {
    if (!orderItem?.orderId) {
      setToast({ message: '주문 ID를 찾을 수 없습니다.' });
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Deleting order history with orderId:', orderItem.orderId);

      const response = await orderDetailsService.deleteOrderHistory(
        orderItem.orderId
      );

      console.log('Delete response:', response);

      // 204 No Content is a successful response
      if (response.status === 204) {
        // Show success toast message for 204
        setToast({ message: '주문 내역이 삭제되었습니다.' });

        // Navigate back to order history page with query parameters preserved and force refresh
        setTimeout(() => {
          // Get the stored order history URL from sessionStorage
          // This was stored when the user first navigated from order history to order detail
          const storedOrderHistoryUrl = sessionStorage.getItem(
            'orderHistoryReturnUrl'
          );

          if (storedOrderHistoryUrl) {
            // Use the stored URL which includes query parameters
            window.location.href = storedOrderHistoryUrl;
          } else {
            // Fallback: navigate to base order history URL
            window.location.href = PAGE_URLS.ORDER_HISTORY;
          }
        }, 1200);
        return; 
      }

      // Check if there's an error in the response
      if (response.error) {
        // Extract the actual error message from the API response
        const errorMessage = response.error.includes(':')
          ? response.error.split(':').slice(1).join(':').trim()
          : response.error;
        setToast({
          message: errorMessage || '주문 내역 삭제에 실패했습니다.',
        });
        return;
      }

      // Check if the response data indicates success
      if (response.data) {
        if (response.data.success) {
          setToast({ message: '주문 내역이 삭제되었습니다.' });
          setTimeout(() => router.push(PAGE_URLS.MYPAGE), 1200);
        } else {
          // API returned success: false with an error message
          const errorMsg =
            response.data.resultMsg || '주문 내역 삭제에 실패했습니다.';
          setToast({ message: errorMsg });
        }
      } else {
        setToast({ message: '주문 내역 삭제에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '주문 내역 삭제 중 오류가 발생했습니다.';
      setToast({ message: errorMessage });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  /**
   * Submit order cancellation request.
   */
  const handleConfirmCancel = async (reason: string): Promise<void> => {
    if (!orderItem.orderId) return;
    try {
      setIsCancelling(true);
      const res = await orderService.cancelOrderByCustomer(
        orderItem.orderId,
        reason
      );
      if (res.error) {
        // Extract the actual error message from the API response
        const errorMessage = res.error.includes(':')
          ? res.error.split(':').slice(1).join(':').trim()
          : res.error;
        setToast({ message: errorMessage || '주문 취소에 실패했습니다.' });
        throw new Error(res.error);
      } else {
        setToast({ message: '주문이 취소되었습니다.' });
        // Refetch order details after cancellation
        const { data } = await orderDetailsService.getOrderDetailsByItemId(
          orderItemId
        );
        if (data?.data) {
          setOrderItem(data.data);
        }
      }
    } catch (error) {
      // Error message already shown in toast above
      throw error;
    } finally {
      setIsCancelling(false);
    }
  };

  /**
   * Render conditional action buttons based on order status.
   */
  const renderActions = (orderStatus: string): React.ReactNode => {
    // Normalize status for comparison (trim whitespace and convert to uppercase)
    const normalizedStatus = orderStatus?.trim().toUpperCase();

    switch (normalizedStatus) {
      case 'PAID':
        return (
          <button
            className={styles.secondaryButton}
            onClick={() => setIsCancelModalOpen(true)}
          >
            주문 취소
          </button>
        );

      case 'DELIVERED':
      case 'COMPLETED':
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
        return (
          <button
            onClick={handleTrackDelivery}
            className={styles.secondaryButton}
          >
            배송 조회
          </button>
        );

      case 'PREPARING':
        return (
          <button
            onClick={handleTrackDelivery}
            className={styles.secondaryButton}
          >
            배송 조회
          </button>
        );

      case 'CANCELLED':
      case 'REFUNDED':
      default:
        return null;
    }
  };

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

      {/* Delivery Info */}
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
            {deliveryAddress.address}
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

      {/* Ordered Items */}
      <div className={styles.itemsSection}>
        <div className={styles.itemsHeader}>
          <h3 className={`${styles.sectionTitle} ${getStatusClass(status)}`}>
            {getStatusText(status)}
          </h3>
        </div>

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

        {/* Conditional Actions */}
        <div className={styles.primaryActions}>{renderActions(status)}</div>
      </div>

      {/* Extra Actions */}
      <div className={styles.actionsSection}>
        <div className={styles.additionalActions}>
          <button
            className={styles.actionButton}
            onClick={handleWriteReview}
            disabled={hasReviewed || checkingReview}
            style={{
              opacity: hasReviewed || checkingReview ? 0.6 : 1,
              cursor: hasReviewed || checkingReview ? 'not-allowed' : 'pointer',
            }}
          >
            {hasReviewed ? '리뷰 작성 완료' : '리뷰 쓰기'}
          </button>
          <button
            className={styles.actionButton}
            onClick={() =>
              router.push(`/contact-product?productId=${orderItem.productId}`)
            }
          >
            문의하기
          </button>
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
        onClose={handleCloseExchangeRefundModal}
        orderId={orderItem.orderId}
        product={{
          id: Number(orderItem.productId),
          orderItemId: orderItem.orderItemId,
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
        }}
        onSelect={(choice) => {
          console.log('User selected:', choice);
          if (choice === 'exchange') {
            router.push(
              `${PAGE_URLS.ORDER_EXCHANGE(
                orderItem.orderId
              )}?orderItemId=${encodeURIComponent(orderItem.orderItemId)}`
            );
          } else {
            router.push(
              `${PAGE_URLS.ORDER_RETURN(
                orderItem.orderId
              )}?orderItemId=${encodeURIComponent(orderItem.orderItemId)}`
            );
          }
        }}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        show={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isSubmitting={isCancelling}
      />

      {/* Delete Order History Modal */}
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        modalTitle="주문 내역을 삭제하시겠습니까?"
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}

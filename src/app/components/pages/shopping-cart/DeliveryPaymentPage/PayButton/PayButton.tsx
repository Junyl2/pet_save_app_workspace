'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import styles from '../DeliveryPayment.module.css';
import { PAGE_URLS } from '@/app/utils/page_url';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import {
  CheckoutRequest,
  DirectOrderRequest,
} from '@/app/api/types/member/order/order';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
import { StoreService } from '@/app/api/services/client/storeService/storeService';

interface PayButtonProps {
  totalDue: number;
  canPay: boolean;
  orderItems: Array<{
    product: {
      id: number;
      name: string;
      price: number;
      discountPrice?: number | null;
      brand?: string;
      image?: string;
      cartItemId?: string;
    };
    quantity: number;
  }>;
  deliveryOption: 'delivery' | 'pickup' | null;
  usePoints: number;
  paymentMethod: {
    payCategory: 'quick' | 'card' | 'bank' | null;
    quickBrand: 'toss' | 'kakao' | 'naver' | null;
  };
  deliveryAddress?: string | null;
  requestNote?: string;
  customRequest?: string;
}

interface OrderResponseData {
  orderNo?: string | number;
}

export default function PayButton({
  totalDue,
  canPay,
  orderItems,
  deliveryOption,
  usePoints,
  paymentMethod,
  deliveryAddress,
  requestNote,
  customRequest,
}: PayButtonProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    isVisible: boolean;
  }>({
    message: '',
    isVisible: false,
  });
  const hasShownToastRef = useRef(false);

  const showToast = (message: string) => {
    setToastMessage({ message, isVisible: true });
    hasShownToastRef.current = true;
  };

  const hideToast = () => {
    setToastMessage((prev) => ({ ...prev, isVisible: false }));
    hasShownToastRef.current = false;
  };

  const onPayClick = async (): Promise<void> => {
    if (!canPay || !deliveryOption) return;

    const shippingOption =
      deliveryOption === 'delivery' ? 'DELIVERY' : 'PICKUP';

    // Validate delivery address when shipping option is DELIVERY
    if (shippingOption === 'DELIVERY' && !deliveryAddress?.trim()) {
      showToast('배송 선택 시 배송 주소는 필수입니다.');
      return;
    }

    hasShownToastRef.current = false;
    setIsProcessing(true);

    try {
      const hasCartId = orderItems.some((item) =>
        Boolean(item.product.cartItemId)
      );

      const method =
        paymentMethod.payCategory === 'bank'
          ? 'BANK'
          : paymentMethod.payCategory === 'card'
          ? 'CARD'
          : 'EASY_PAY';

      let orderResponse: Awaited<
        ReturnType<
          | typeof orderService.checkoutCart
          | typeof orderService.createDirectOrder
        >
      >;

      if (hasCartId) {
        const cartItemIds = orderItems
          .map((it) => it.product.cartItemId)
          .filter((id): id is string => Boolean(id));

        const payload: CheckoutRequest = {
          cartItemIds,
          shippingOption,
          deliveryAddress:
            deliveryOption === 'delivery' ? deliveryAddress || '' : undefined,
          deliveryNote:
            requestNote === 'custom'
              ? customRequest || ''
              : requestNote
              ? (() => {
                  switch (requestNote) {
                    case 'guard':
                      return '부재시 경비실에 맡겨주세요.';
                    case 'front':
                      return '집앞에 놔주세요.';
                    case 'locker':
                      return '택배함에 놔주세요.';
                    case 'call':
                      return '배송 전에 꼭 연락주세요.';
                    default:
                      return '';
                  }
                })()
              : '',
          usePointsAmount: usePoints,
          paymentDetails: { method },
        };

        orderResponse = await orderService.checkoutCart(payload);
      } else {
        const payload: DirectOrderRequest = {
          productId: orderItems[0].product.id.toString(),
          quantity: orderItems[0].quantity,
          shippingOption,
          ...(shippingOption === 'DELIVERY' && {
            deliveryAddress: deliveryAddress || '',
          }),
          usePointsAmount: usePoints,
          paymentDetails: { method },
        };

        orderResponse = await orderService.createDirectOrder(payload);
      }

      if (!orderResponse.data?.success) {
        const errorMessage = orderResponse.data?.resultMsg || '주문 생성 실패';
        showToast(errorMessage);
        throw new Error(errorMessage);
      }

      const orderData = orderResponse.data?.data as
        | OrderResponseData
        | undefined;
      const orderNo = orderData?.orderNo ?? `ORDER-${Date.now()}`;

      // Manual bank transfer: go directly to confirmation
      if (method === 'BANK') {
        // Try to get storeId from orderItems to fetch bank account info
        const firstProduct = orderItems[0]?.product as
          | { storeId?: string }
          | undefined;
        const storeId = firstProduct?.storeId;

        let bankAccountInfo: {
          bankName?: string;
          accountNumber?: string;
          depositorName?: string;
        } = {};

        // Fetch store bank account info if storeId is available
        if (storeId) {
          try {
            console.log(
              '🔄 Fetching store bank account info for storeId:',
              storeId
            );
            const storeResponse = await StoreService.getStoreSummary(storeId);

            if (storeResponse.data?.data) {
              const storeData = storeResponse.data.data;
              bankAccountInfo = {
                bankName: storeData.bankName,
                accountNumber: storeData.accountNumber,
                depositorName: storeData.depositorName,
              };
              console.log(
                '✅ Store bank account info fetched:',
                bankAccountInfo
              );
            }
          } catch (error) {
            console.error('❌ Error fetching store bank account info:', error);
            // Continue without bank info - OrderConfirmationClient will try to fetch it
          }
        }

        sessionStorage.setItem(
          'orderConfirmation',
          JSON.stringify({
            mode: deliveryOption,
            orderNo,
            itemCount: orderItems.length,
            amount: totalDue,
            paymentLabel: '무통장입금',
            date: new Date().toISOString(),
            ...bankAccountInfo,
          })
        );
        router.push(PAGE_URLS.ORDER_CONFIRMATION);
        return;
      }

      // TossPayments redirect flow
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      );

      const tossOrderId = `ORDER-${Date.now()}`;
      const orderName =
        orderItems.length > 1
          ? `${orderItems[0].product.name} 외 ${orderItems.length - 1}건`
          : orderItems[0].product.name;

      await tossPayments.requestPayment('카드', {
        amount: totalDue,
        orderId: tossOrderId,
        orderName,
        customerName: '홍길동',
        successUrl: `${window.location.origin}/client/pages/shopping-cart/delivery-payment/payment-success`,
        failUrl: `${window.location.origin}/client/pages/shopping-cart/delivery-payment/payment-fail`,
      });
    } catch (err: unknown) {
      const message = (err as Error)?.message ?? '';
      if (!message.includes('취소') && !message.includes('canceled')) {
        console.error('결제 요청 실패:', err);
        // Show toast for API errors if not already shown
        if (!hasShownToastRef.current) {
          showToast(message || '결제 요청 중 오류가 발생했습니다.');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button
        className={`${styles.payButton} ${
          !canPay ? styles.payButtonDisabled : ''
        }`}
        disabled={!canPay || isProcessing}
        onClick={onPayClick}
      >
        {isProcessing
          ? '결제 처리 중...'
          : `총 ${totalDue.toLocaleString()}원 결제하기`}
      </button>
      {toastMessage.isVisible && (
        <ToastMessage
          message={toastMessage.message}
          onClose={hideToast}
          duration={3000}
        />
      )}
    </>
  );
}

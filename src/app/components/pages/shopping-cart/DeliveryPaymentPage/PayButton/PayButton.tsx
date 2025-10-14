'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PAGE_URLS } from '@/app/utils/page_url';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import { cartService } from '@/app/api/services/client/cartService/cartService';
import {
  CheckoutRequest,
  DirectOrderRequest,
} from '@/app/api/types/member/order/order';
import styles from '../DeliveryPayment.module.css';
import toast from 'react-hot-toast';

interface PayButtonProps {
  totalDue: number;
  canPay: boolean;
  handlePay?: () => void;
  orderItems: Array<{
    product: {
      id: number;
      name: string;
      price: number;
      discountPrice?: number | null;
      brand?: string;
      image?: string;
    };
    quantity: number;
  }>;
  deliveryOption: 'delivery' | 'pickup' | null;
  usePoints: number;
  paymentMethod: {
    payCategory: 'quick' | 'card' | 'bank' | null;
    quickBrand: 'toss' | 'kakao' | 'naver' | null;
  };
}

export default function PayButton({
  totalDue,
  canPay,
  handlePay,
  orderItems,
  deliveryOption,
  usePoints,
  paymentMethod,
}: PayButtonProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const onPayClick = async () => {
    if (!canPay || !deliveryOption) return;

    setIsProcessing(true);
    try {
      // Get checkout items from localStorage
      const storedCheckoutItems = localStorage.getItem('checkoutItems');
      const isDirectPurchase =
        localStorage.getItem('isDirectPurchase') === 'true';

      if (!storedCheckoutItems) {
        toast.error('주문할 상품 정보를 찾을 수 없습니다');
        return;
      }

      const checkoutItems = JSON.parse(storedCheckoutItems);

      if (isDirectPurchase) {
        // Handle direct purchase (Buy Now)
        const directOrderItem = checkoutItems[0];
        if (!directOrderItem || !directOrderItem.productId) {
          toast.error('직접 구매 상품 정보를 찾을 수 없습니다');
          return;
        }

        // Create direct order request
        const directOrderRequest: DirectOrderRequest = {
          productId: directOrderItem.productId,
          quantity: directOrderItem.quantity,
          shippingOption: deliveryOption === 'delivery' ? 'DELIVERY' : 'PICKUP',
          deliveryAddress:
            deliveryOption === 'delivery'
              ? '서울시 강남구 테헤란로 123'
              : undefined,
          usePointsAmount: usePoints,
          paymentDetails: {
            method: paymentMethod.payCategory === 'card' ? 'CARD' : 'BANK',
            bankName: '국민은행',
            depositorName: '홍길동',
            receiptType: 'TAX_INVOICE',
            issuanceType: 'TAX_INVOICE_ISSUANCE',
            issueNumber: '1234567',
            businessNumber: '123-45-67890',
            businessName: '주식회사 잉키',
            representativeName: '홍길동',
            businessAddress: '서울시 강남구 테헤란로 123',
            businessType: '서비스업',
            businessCategory: '소프트웨어 개발',
            businessEmail: 'business@petsave.com',
          },
        };

        // Call the direct order API
        const response = await orderService.createDirectOrder(
          directOrderRequest
        );

        if (!response.error && response.data?.success) {
          toast.success('주문이 생성되었습니다. 결제 페이지로 이동합니다.', {
            style: { background: '#66bfa7' },
            iconTheme: { primary: '#66bfa7', secondary: '#fff' },
          });

          // Clear checkout items and direct purchase flag from localStorage
          localStorage.removeItem('checkoutItems');
          localStorage.removeItem('isDirectPurchase');

          // Run the original payment logic if provided
          if (handlePay) {
            handlePay();
          } else {
            // Navigate to order confirmation
            router.push(PAGE_URLS.ORDER_CONFIRMATION);
          }
        } else {
          const errorMessage =
            response.data?.resultMsg || response.error || '알 수 없는 오류';
          toast.error('주문 생성 실패: ' + errorMessage);
        }
      } else {
        // Handle cart checkout
        const cartItemIds = checkoutItems
          .map((item: any) => item.product.cartItemId)
          .filter((id: string) => id !== undefined);

        if (cartItemIds.length === 0) {
          toast.error('주문할 상품을 찾을 수 없습니다');
          return;
        }

        // Create checkout request
        const checkoutRequest: CheckoutRequest = {
          cartItemIds,
          shippingOption: deliveryOption === 'delivery' ? 'DELIVERY' : 'PICKUP',
          deliveryAddress:
            deliveryOption === 'delivery'
              ? '서울시 강남구 테헤란로 123'
              : undefined,
          usePointsAmount: usePoints,
          paymentDetails: {
            method: paymentMethod.payCategory === 'card' ? 'CARD' : 'BANK',
            bankName: '국민은행',
            depositorName: '홍길동',
            receiptType: 'TAX_INVOICE',
            issuanceType: 'TAX_INVOICE_ISSUANCE',
            issueNumber: '1234567',
            businessNumber: '123-45-67890',
            businessName: '주식회사 잉키',
            representativeName: '홍길동',
            businessAddress: '서울시 강남구 테헤란로 123',
            businessType: '서비스업',
            businessCategory: '소프트웨어 개발',
            businessEmail: 'business@petsave.com',
          },
        };

        // Call the checkout API
        const response = await orderService.checkoutCart(checkoutRequest);

        if (!response.error && response.data?.success) {
          // Clear cart items from the server after successful checkout
          try {
            await cartService.batchDeleteCartItems(cartItemIds);
            console.log('Cart items cleared after successful checkout');
          } catch (cartError) {
            console.error('Failed to clear cart items:', cartError);
            // Don't fail the entire process if cart clearing fails
          }

          toast.success('주문이 생성되었습니다. 결제 페이지로 이동합니다.', {
            style: { background: '#66bfa7' },
            iconTheme: { primary: '#66bfa7', secondary: '#fff' },
          });

          // Clear checkout items from localStorage
          localStorage.removeItem('checkoutItems');

          // Run the original payment logic if provided
          if (handlePay) {
            handlePay();
          } else {
            // Navigate to order confirmation
            router.push(PAGE_URLS.ORDER_CONFIRMATION);
          }
        } else {
          const errorMessage =
            response.data?.resultMsg || response.error || '알 수 없는 오류';
          toast.error('주문 생성 실패: ' + errorMessage);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('네트워크 오류로 주문 생성 실패');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      className={`${styles.payButton} ${
        !canPay ? styles.payButtonDisabled : ''
      }`}
      disabled={!canPay || isProcessing}
      onClick={onPayClick}
    >
      {isProcessing
        ? '주문 처리 중...'
        : `총 ${totalDue.toLocaleString()}원 결제하기`}
    </button>
  );
}

'use client';

import React, { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

import Steps from '@/app/components/ui/steps/Steps';
import { REFUND_STEPS } from '@/app/components/constants/refund';
import { ProductSelectionStep } from './return-steps/product-selection-step';
import { ReasonSelectionStep } from './return-steps/reason-selection-step';
import { ReturnMethodStep } from './return-steps/return-method-step';
import { ReturnConfirmationStep } from './return-steps/return-confirmation-step';
import { CompletionScreen } from './return-steps/completion-screen';
import styles from './ReturnPage.module.css';

import { Product } from '@/app/components/types/order';
import { returnExchangeService } from '@/app/api/services/client/return-exchange/returnExchangeService';
import { CreateReturnExchangeRequest } from '@/app/api/types/member/return-exchange/returnExchange';

export default function ReturnPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params?.orderId as string;

  // Hooks must always execute
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [subReason, setSubReason] = useState('');
  const [detailReason, setDetailReason] = useState('');
  const [returnMethod, setReturnMethod] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // Parse product info from query
  const hasProduct = !!searchParams.get('orderItemId');
  const productFromQuery: Product | null = hasProduct
    ? {
        id: Number(searchParams.get('productId')) || 0,
        orderItemId: searchParams.get('orderItemId') || '',
        name: searchParams.get('name') || '',
        price: Number(searchParams.get('price')) || 0,
        discountPrice: searchParams.get('discountPrice')
          ? Number(searchParams.get('discountPrice'))
          : undefined,
        brand: searchParams.get('brand') || '',
        image: searchParams.get('image') || '',
        deliveryType:
          (searchParams.get('deliveryType') as 'pickup' | 'delivery') ||
          'delivery',
      }
    : null;

  const products: Product[] = productFromQuery ? [productFromQuery] : [];
  const isDeliveryOrder = productFromQuery?.deliveryType === 'delivery';

  // Early return AFTER all hooks
  if (!orderId || !productFromQuery) {
    return (
      <div className={styles.container}>
        <p>
          주문 정보를 찾을 수 없습니다. 주문번호 또는 상품 정보를 확인해주세요.
        </p>
      </div>
    );
  }

  // ───────────────────────────────
  // Handlers
  // ───────────────────────────────
  const handleProductSelect = (id: number): void => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (): void => {
    setSelectedItems(
      selectedItems.length === products.length ? [] : products.map((p) => p.id)
    );
  };

  const handleReasonChange = (
    reason: string,
    sub?: string,
    detail?: string
  ): void => {
    setSelectedReason(reason);
    if (sub !== undefined) setSubReason(sub);
    if (detail !== undefined) setDetailReason(detail);
  };

  const handleMethodChange = (method: string): void => {
    setReturnMethod(method);
  };

  const handleNext = async (): Promise<void> => {
    if (currentStep === 0 && selectedItems.length === 0) {
      toast.error('반품할 상품을 선택해주세요.');
      return;
    }
    if (currentStep === 1 && !selectedReason) {
      toast.error('반품 사유를 선택해주세요.');
      return;
    }
    if (currentStep === 2 && !returnMethod) {
      toast.error('반품 방식을 선택해주세요.');
      return;
    }

    if (currentStep === REFUND_STEPS.length - 1) {
      try {
        toast.loading('반품 요청을 전송 중입니다...');

        const orderItemIds = products
          .filter((p) => selectedItems.includes(p.id))
          .map((p) => p.orderItemId)
          .filter(
            (id): id is string => typeof id === 'string' && id.length > 0
          );

        const payload: CreateReturnExchangeRequest = {
          type: 'RETURN',
          reason: detailReason
            ? `${selectedReason} - ${detailReason}`
            : selectedReason,
          orderItemIds,
          collectionMethod: isDeliveryOrder
            ? 'COURIER_PICKUP'
            : 'CUSTOMER_RETURN',
        };

        const res = await returnExchangeService.create(payload);
        toast.dismiss();

        if (res?.data?.success) {
          toast.success('반품 요청이 성공적으로 전송되었습니다.');
          setIsCompleted(true);
        } else {
          toast.error(
            res?.data?.resultMsg || '반품 요청 중 오류가 발생했습니다.'
          );
        }
      } catch (err) {
        toast.dismiss();
        toast.error('서버 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('반품 요청 실패:', err);
      }
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  // ───────────────────────────────
  // Render
  // ───────────────────────────────
  if (isCompleted) {
    return (
      <CompletionScreen isDeliveryOrder={isDeliveryOrder} orderId={orderId} />
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.section} ${styles['section--steps']}`}>
        <Steps
          steps={[...REFUND_STEPS]}
          currentStepIndex={currentStep}
          numbered
        />
      </div>

      {currentStep === 0 && (
        <ProductSelectionStep
          products={products}
          selectedItems={selectedItems}
          onProductSelect={handleProductSelect}
          onSelectAll={handleSelectAll}
        />
      )}

      {currentStep === 1 && (
        <ReasonSelectionStep
          products={products}
          selectedItems={selectedItems}
          selectedReason={selectedReason}
          subReason={subReason}
          detailReason={detailReason}
          onReasonChange={handleReasonChange}
        />
      )}

      {currentStep === 2 && (
        <ReturnMethodStep
          isDeliveryOrder={isDeliveryOrder}
          returnMethod={returnMethod}
          onMethodChange={handleMethodChange}
        />
      )}

      {currentStep === 3 && (
        <ReturnConfirmationStep
          selectedProducts={products.filter((p) =>
            selectedItems.includes(p.id)
          )}
          isDeliveryOrder={isDeliveryOrder}
        />
      )}

      <div className={styles.buttonContainer}>
        <button
          className={styles.nextButton}
          onClick={handleNext}
          disabled={
            (currentStep === 0 && selectedItems.length === 0) ||
            (currentStep === 1 && !selectedReason) ||
            (currentStep === 2 && !returnMethod)
          }
        >
          {currentStep === REFUND_STEPS.length - 1 ? '반품신청' : '다음'}
        </button>
      </div>
    </div>
  );
}

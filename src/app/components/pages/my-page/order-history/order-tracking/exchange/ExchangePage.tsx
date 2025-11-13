'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

import { Product } from '@/app/components/types/order';
import { ProductSelectionPage } from './exchange-steps/ProductSelectionPage';
import { ExchangeForm, ExchangeFormData } from './exchange-steps/ExchangeForm';
import { SuccessScreen } from './exchange-steps/SuccessScreen';
import { returnExchangeService } from '@/app/api/services/client/return-exchange/returnExchangeService';
import { CreateReturnExchangeRequest } from '@/app/api/types/member/return-exchange/returnExchange';
import styles from './ExchangePage.module.css';

type ExchangeStep = 'product-selection' | 'exchange-form' | 'success';

export default function ExchangePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params?.orderId as string;

  const [currentStep, setCurrentStep] =
    useState<ExchangeStep>('product-selection');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  //  Read product data from query (sent by ExchangeRefundModal)
  const productFromQuery: Product | null = searchParams.get('orderItemId')
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

  //  Error handling if no product or orderId
  if (!orderId || !productFromQuery) {
    return (
      <div className={styles.container}>
        <p>
          주문 정보를 찾을 수 없습니다. 주문번호 또는 상품 정보를 확인해주세요.
        </p>
      </div>
    );
  }

  const orderProducts: Product[] = [productFromQuery];

  // ───────────────────────────────
  // Handlers
  // ───────────────────────────────

  const handleProductSelection = (products: Product[]) => {
    setSelectedProducts(products);
    setCurrentProductIndex(0);
    setCurrentStep('exchange-form');
  };

  /** Handles Exchange Form Submission and calls POST API */
  const handleFormSubmit = async (data: ExchangeFormData) => {
    const currentProduct = selectedProducts[currentProductIndex];
    if (!currentProduct?.orderItemId) {
      toast.error('주문 상품 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      toast.loading('교환 요청을 전송 중입니다...');

      const payload: CreateReturnExchangeRequest = {
        type: 'EXCHANGE',
        reason: data.selectedReason,
        orderItemIds: [currentProduct.orderItemId],
        collectionMethod:
          currentProduct.deliveryType === 'pickup'
            ? 'CUSTOMER_RETURN'
            : 'COURIER_PICKUP',
        exchangeOption: data.selectedOption || '',
      };

      const res = await returnExchangeService.create(payload);
      toast.dismiss();

      const apiRes = res.data;
      if (apiRes && apiRes.success) {
        toast.success(
          apiRes.resultMsg || '교환 요청이 성공적으로 전송되었습니다.'
        );

        if (currentProductIndex < selectedProducts.length - 1) {
          setCurrentProductIndex((prev) => prev + 1);
        } else {
          setCurrentStep('success');
        }
      } else {
        toast.error(apiRes?.resultMsg || '교환 요청 중 오류가 발생했습니다.');
      }
    } catch (err) {
      toast.dismiss();
      toast.error('서버 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('교환 요청 실패:', err);
    }
  };

  const handleBackFromForm = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex((prev) => prev - 1);
    } else {
      setCurrentStep('product-selection');
    }
  };

  const handleBackFromSuccess = () => {
    setCurrentStep('product-selection');
    setSelectedProducts([]);
    setCurrentProductIndex(0);
  };

  // ───────────────────────────────
  // Render Steps
  // ───────────────────────────────

  switch (currentStep) {
    case 'product-selection':
      return (
        <ProductSelectionPage
          products={orderProducts}
          onNext={handleProductSelection}
        />
      );

    case 'exchange-form':
      return (
        <ExchangeForm
          product={selectedProducts[currentProductIndex]}
          onSubmit={handleFormSubmit}
          onBack={handleBackFromForm}
        />
      );

    case 'success':
      return (
        <SuccessScreen
          orderId={orderId}
          product={selectedProducts[0]}
          onBack={handleBackFromSuccess}
        />
      );

    default:
      return null;
  }
}

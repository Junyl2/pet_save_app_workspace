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

        reason:
          data.selectedReason === 'OTHER'
            ? data.customReason || ''
            : data.selectedReason,

        orderItemIds: [currentProduct.orderItemId],

        collectionMethod:
          currentProduct.deliveryType === 'pickup'
            ? 'CUSTOMER_RETURN'
            : 'COURIER_PICKUP',

        exchangeOption:
          data.selectedOption === '기타 요청'
            ? data.customReasonOption || ''
            : data.selectedOption,
      };

      const res = await returnExchangeService.create(payload);
      toast.dismiss();
      if (res.error) {
        const cleanMessage = res.error.replace(/^(\d{3}:\s*)/, '');
        toast.error(cleanMessage);
        return;
      }
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

        return;
      }

      toast.error(apiRes?.resultMsg || '교환 요청 중 오류가 발생했습니다.');
    } catch (err: any) {
      toast.dismiss();

      // Axios Error → backend response exists
      if (err?.response?.data) {
        const backendMessage =
          err.response.data.resultMsg ||
          err.response.data.message ||
          JSON.stringify(err.response.data);

        toast.error(backendMessage);
        console.error('Backend Error:', err.response.data);
        return;
      }

      if (err?.message) {
        toast.error(err.message);
        console.error('Axios Error:', err);
        return;
      }

      // Fallback
      toast.error(
        '이 상품은 반품이 불가능합니다. 반품 요청 상태가 이미 처리되었습니다'
      );
      console.error('Unknown Error:', err);
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

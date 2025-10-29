'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Product } from '@/app/components/types/order';
import { ProductSelectionStep } from './ProductSelectionStep';
import { ExchangeReasonStep } from './ExchangeReasonStep';
import { CollectionInfoStep } from './CollectionInfoStep';
import { SubmitButtonStep } from './SubmitButtonStep';
import styles from './ExchangeForm.module.css';

interface ExchangeFormProps {
  product: Product;
  onSubmit: (data: ExchangeFormData) => void;
  onBack: () => void;
}

export interface ExchangeFormData {
  selectedOption: string;
  selectedReason: string;
  productSelected: boolean;
}

/** 교환 옵션 */
const EXCHANGE_OPTIONS: string[] = [
  '교환 옵션을 선택해주세요',
  '같은 상품으로 교환',
  '다른 사이즈나 용량으로 교환',
  '다른 맛 또는 종류로 교환',
  '다른 색상 또는 디자인으로 교환',
  '다른 상품으로 교환',
  '기타 요청',
];

/** 교환 사유 */
const EXCHANGE_REASONS: string[] = [
  '교환 사유를 선택해주세요',
  '상품에 하자가 있음',
  '잘못된 상품이 배송됨',
  '포장이 훼손되어 교환을 원합니다.',
  '유통기한이 임박하거나 지남 (교환 요청)',
  '제품 설명과 달라 교환 요청드립니다.',
  '사이즈/용량이 맞지 않아 교환 원합니다.',
  '색상/디자인이 달라 교환을 요청합니다.',
  '기타 사유 (10자 이상 입력 필수)',
];

export function ExchangeForm({ product, onSubmit }: ExchangeFormProps) {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [productSelected, setProductSelected] = useState(true);

  const handleSubmit = () => {
    //  Validation before calling API
    if (!productSelected) {
      toast.error('교환할 상품을 선택해주세요.');
      return;
    }

    if (!selectedOption || selectedOption === EXCHANGE_OPTIONS[0]) {
      toast.error('교환 옵션을 선택해주세요.');
      return;
    }

    if (!selectedReason || selectedReason === EXCHANGE_REASONS[0]) {
      toast.error('교환 사유를 선택해주세요.');
      return;
    }

    if (selectedReason.trim().length < 10) {
      toast.error('사유는 10자 이상 입력해주세요.');
      return;
    }

    //  Pass valid data to parent (ExchangePage)
    onSubmit({
      selectedOption,
      selectedReason,
      productSelected,
    });
  };

  const isSubmitDisabled =
    !productSelected || !selectedOption || !selectedReason;

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>교환품 선택해 주세요</h1>

        <ProductSelectionStep
          product={product}
          isSelected={productSelected}
          onSelectionChange={setProductSelected}
        />

        {/* 교환 옵션 선택 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>교환 옵션 선택</h3>
          <div className={styles.selectWrapper}>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className={styles.select}
            >
              {EXCHANGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 교환 사유 선택 */}
        <div className={styles.section}>
          <ExchangeReasonStep
            selectedReason={selectedReason}
            onReasonChange={setSelectedReason}
            reasons={EXCHANGE_REASONS}
          />
        </div>
      </div>

      <div className={styles.section}>
        <CollectionInfoStep product={product} />
      </div>

      <SubmitButtonStep onSubmit={handleSubmit} disabled={isSubmitDisabled} />
    </div>
  );
}

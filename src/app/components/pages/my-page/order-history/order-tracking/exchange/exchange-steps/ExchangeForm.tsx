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
  customReasonOption?: string; // option custom input
  customReason?: string; // reason custom input
}

/** 교환 옵션 */
const EXCHANGE_OPTIONS: string[] = [
  '교환 옵션을 선택해주세요',
  '같은 상품으로 교환',
  '다른 사이즈나 용량으로 교환',
  '다른 맛 또는 종류로 교환',
  '다른 색상 또는 디자인으로 교환',
  '다른 상품으로 교환',
  '기타 요청', // CUSTOM trigger for option
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
  '기타 사유 (10자 이상 입력 필수)', // CUSTOM trigger for reason
];

export function ExchangeForm({ product, onSubmit, onBack }: ExchangeFormProps) {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [productSelected, setProductSelected] = useState(true);

  const [customReasonOption, setCustomReasonOption] = useState(''); // textarea for "기타 요청"
  const [customReason, setCustomReason] = useState(''); // textarea for "기타 사유"

  const isOptionCustom = selectedOption === '기타 요청';
  const isReasonCustom = selectedReason === '기타 사유 (10자 이상 입력 필수)';

  const handleSubmit = () => {
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

    if (isReasonCustom && customReason.trim().length < 10) {
      toast.error('기타 사유는 10자 이상 입력해주세요.');
      return;
    }

    // pass data to parent
    onSubmit({
      selectedOption,
      selectedReason: isReasonCustom ? 'OTHER' : selectedReason,
      productSelected,
      customReasonOption: isOptionCustom ? customReasonOption : undefined,
      customReason: isReasonCustom ? customReason : undefined,
    });
  };

  const isSubmitDisabled =
    !productSelected || !selectedOption || !selectedReason;

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>교환품 선택해 주세요</h1>

        {/* 상품 선택 */}
        <div className={styles.productSelection}>
          <ProductSelectionStep
            product={product}
            isSelected={productSelected}
            onSelectionChange={setProductSelected}
          />
        </div>

        {/* 교환 옵션 */}
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

          {/* ⭐ Custom textarea appears below 옵션 input */}
          {isOptionCustom && (
            <textarea
              className={styles.customReasonInput}
              placeholder="기타 옵션 요청 내용을 입력해주세요."
              value={customReasonOption}
              onChange={(e) => setCustomReasonOption(e.target.value)}
            />
          )}
        </div>

        <div className={styles.divider}></div>

        {/* 교환 사유 */}
        <div className={styles.section}>
          <ExchangeReasonStep
            selectedReason={selectedReason}
            onReasonChange={setSelectedReason}
            reasons={EXCHANGE_REASONS}
          />

          {isReasonCustom && (
            <textarea
              className={styles.customReasonInput}
              placeholder="기타 사유를 입력해주세요. (10자 이상)"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </div>

        <div className={styles.divider}></div>
      </div>

      <div className={styles.collectInfo}>
        <CollectionInfoStep product={product} />
      </div>

      <SubmitButtonStep onSubmit={handleSubmit} disabled={isSubmitDisabled} />
    </div>
  );
}

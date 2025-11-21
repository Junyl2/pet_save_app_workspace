'use client';

import React from 'react';
import { REFUND_REASONS } from '@/app/components/constants/refund';
import { Product } from '@/app/components/types/order';
import styles from './reason-selection-step.module.css';

interface ReasonSelectionStepProps {
  products: Product[];
  selectedItems: number[];
  selectedReason: string;
  subReason?: string;
  detailReason?: string;
  onReasonChange: (reason: string, sub?: string, detail?: string) => void;
}

export const ReasonSelectionStep: React.FC<ReasonSelectionStepProps> = ({
  products,
  selectedItems,
  selectedReason,
  subReason,
  detailReason,
  onReasonChange,
}) => {
  // Direct numeric comparison for consistency with Product.id: number
  const selectedProducts = React.useMemo(
    () => products.filter((p) => selectedItems.includes(p.id)),
    [products, selectedItems]
  );

  const formatPrice = (price: number): string => price.toLocaleString('ko-KR');

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h2 className={styles.stepTitle}>반품 사유를 알려주세요</h2>
      </div>

      {selectedProducts.map((product) => (
        <div key={product.id} className={styles.productSection}>
          <div className={styles.productInfo}>
            <div className={styles.productContent}>
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className={styles.productImage}
              />
              <div className={styles.productDetails}>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.priceContainer}>
                  {product.discountPrice && (
                    <span className={styles.originalPrice}>
                      {formatPrice(product.discountPrice)}원
                    </span>
                  )}
                  <span className={styles.currentPrice}>
                    {formatPrice(product.price)}원
                  </span>
                </div>
                <p className={styles.brand}>{product.brand}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {Object.entries(REFUND_REASONS).map(([category, reasons]) => (
        <div key={category} className={styles.reasonCategorySection}>
          <h3 className={styles.categoryTitle}>{category}</h3>
          {reasons.map((reason) => (
            <label key={reason} className={styles.reasonOption}>
              <input
                type="radio"
                name="refundReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) =>
                  onReasonChange(e.target.value, subReason, detailReason)
                }
                className={styles.radio}
              />
              {reason}
            </label>
          ))}
        </div>
      ))}

      <div className={styles.detailReasonSection}>
        <h3 className={styles.sectionTitle}>상세 문의</h3>
        <textarea
          className={styles.textarea}
          placeholder="우려한 상품과 다른 상품이 배송되었어요
           (최소 10자 이상 입력해주세요.)"
          value={detailReason || ''}
          onChange={(e) =>
            onReasonChange(selectedReason, subReason, e.target.value)
          }
        />
      </div>
    </div>
  );
};

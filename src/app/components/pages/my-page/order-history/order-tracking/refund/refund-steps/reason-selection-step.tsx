"use client";

import { REFUND_REASONS } from "@/app/components/constants/refund";
import styles from "./reason-selection-step.module.css";

interface Product {
  id: string;
  image: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
}

interface ReasonSelectionStepProps {
  products: Product[];
  selectedItems: string[];
  selectedReason: string;
  subReason?: string;
  detailReason?: string;
  onReasonChange: (reason: string, sub?: string, detail?: string) => void;
}

// Utility function to format price
const formatPrice = (price: number): string => {
  return price.toLocaleString();
};

export function ReasonSelectionStep({
  products,
  selectedItems,
  selectedReason,
  subReason,
  detailReason,
  onReasonChange,
}: ReasonSelectionStepProps) {
  // Filter to show only selected products
  const selectedProducts = products.filter((product) =>
    selectedItems.includes(product.id)
  );

  return (
    <div className={styles.container}>
      {/* Title Section */}
      <div className={styles.titleSection}>
        <h2 className={styles.stepTitle}>반품 사유를 알려주세요</h2>
      </div>

      {/* Selected Products Section */}
      {selectedProducts.map((product) => (
        <div key={product.id} className={styles.productSection}>
          <div className={styles.productInfo}>
            <div className={styles.productContent}>
              <img
                src={product.image}
                alt={product.name}
                className={styles.productImage}
              />
              <div className={styles.productDetails}>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.priceContainer}>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>
                      {formatPrice(product.originalPrice)}원
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

      {/* Refund Reasons Sections */}
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

      {/* Detail Reason Section */}
      <div className={styles.detailReasonSection}>
        <h3 className={styles.sectionTitle}>상세 문의</h3>
        <textarea
          className={styles.textarea}
          placeholder="우려한 상품과 다른 상품이 배송되었어요"
          value={detailReason || ""}
          onChange={(e) =>
            onReasonChange(selectedReason, subReason, e.target.value)
          }
        />
      </div>
    </div>
  );
}
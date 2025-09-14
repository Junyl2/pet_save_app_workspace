"use client";
import { Product } from "@/app/components/types/order";
import ProductSection from "@/app/components/sections/ProductSection/ProductSection";
import styles from "../ExchangePage.module.css";

interface ProductSelectionStepProps {
  product: Product;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
}

export function ProductSelectionStep({
  product,
  isSelected,
  onSelectionChange,
}: ProductSelectionStepProps) {
  return (
    <ProductSection
      leftContent={
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectionChange(e.target.checked)}
          className={styles.checkbox}
        />
      }
      mainContent={
        <div className={styles.productInfo}>
          <div className={styles.productContent}>
            <img
              src={product.image}
              alt={product.name}
              className={styles.productImage}
            />
            <div className={styles.productDetails}>
              <h3 className={styles.productName}>{product.name}</h3>
              <div className={styles.productPricing}>
                <span className={styles.originalPrice}>
                  {product.price.toLocaleString()}원
                </span>
                {product.discountPrice && (
                  <span className={styles.discountPrice}>
                    {product.discountPrice.toLocaleString()}원
                  </span>
                )}
              </div>
              <p className={styles.productBrand}>{product.brand}</p>
            </div>
          </div>
        </div>
      }
    />
  );
}

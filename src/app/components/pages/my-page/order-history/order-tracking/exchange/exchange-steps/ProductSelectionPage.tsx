"use client";
import { useState } from "react";
import { Product } from "@/app/components/types/order";
import ProductSection from "@/app/components/sections/ProductSection/ProductSection";

import styles from "./ProductSelectionPage.module.css";

interface ProductSelectionPageProps {
  products: Product[];
  onNext: (selectedProducts: Product[]) => void;
}

export function ProductSelectionPage({
  products,
  onNext,
}: ProductSelectionPageProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(
    new Set()
  );
  const allSelected = selectedProductIds.size === products.length;

  const handleProductSelect = (productId: number) => {
    const newSelection = new Set(selectedProductIds);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProductIds(newSelection);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedProductIds(new Set()); // uncheck all
    } else {
      setSelectedProductIds(new Set(products.map((p) => p.id))); // check all
    }
  };

  const handleNext = () => {
    const selectedProducts = products.filter((product) =>
      selectedProductIds.has(product.id)
    );
    onNext(selectedProducts);
  };

  const isNextDisabled = selectedProductIds.size === 0;

  return (
    <div className={styles.container}>
      <section className={`${styles.sectionTitle} ${styles.fullBleed}`}>
        <h1 className={styles.title}>교환할 상품을 선택해 주세요</h1>
      </section>
      <div className={`${styles.content} ${styles.fullBleed}`}>
        {/* Select All Checkbox */}
        <div className={styles.selectAll}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            className={styles.checkbox}
          />
          <span className={styles.selectAllLabel}>전체선택</span>
          <span className={styles.selectAllCount}>
            ({selectedProductIds.size}/{products.length})
          </span>
        </div>

        <div className={styles.productList}>
          {products.map((product) => (
            <ProductSection
              className={styles.productSection}
              key={product.id}
              leftContent={
                <label>
                  <input
                    type="checkbox"
                    checked={selectedProductIds.has(product.id)}
                    onChange={() => handleProductSelect(product.id)}
                    className={styles.checkbox}
                  />
                </label>
              }
              mainContent={
                <div className={styles.productInfo}>
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className={styles.productImage}
                  />
                  <div className={styles.productDetails}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.priceContainer}>
                      {product.discountPrice && (
                        <span className={styles.originalPrice}>
                          {product.discountPrice.toLocaleString()}원
                        </span>
                      )}
                      <span className={styles.currentPrice}>
                        {product.price.toLocaleString()}원
                      </span>
                    </div>
                    <span className={styles.brand}>{product.brand}</span>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      </div>

      <div className={styles.nextContainer}>
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className={styles.nextButton}
        >
          다음
        </button>
      </div>
    </div>
  );
}

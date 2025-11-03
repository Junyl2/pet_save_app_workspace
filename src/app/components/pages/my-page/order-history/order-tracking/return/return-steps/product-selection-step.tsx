'use client';

import { Product } from '@/app/components/types/order';
import ProductSection from '@/app/components/sections/ProductSection/ProductSection';
import styles from '../ReturnPage.module.css';

interface ProductSelectionStepProps {
  products: Product[];
  selectedItems: number[];
  onProductSelect: (id: number) => void;
  onSelectAll: () => void;
}

export function ProductSelectionStep({
  products,
  selectedItems,
  onProductSelect,
  onSelectAll,
}: ProductSelectionStepProps) {
  const allSelected = selectedItems.length === products.length;

  return (
    <div className={styles.section}>
      <ProductSection
        leftContent={
          <label className={styles.selectAllContainer}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className={styles.checkbox}
            />
          </label>
        }
        mainContent={
          <div className={styles.selectAllText}>
            전체선택 ({selectedItems.length}/{products.length})
          </div>
        }
      />

      {products.map((product) => (
        <ProductSection
          key={product.id}
          leftContent={
            <label>
              <input
                type="checkbox"
                checked={selectedItems.includes(product.id)}
                onChange={() => onProductSelect(product.id)}
                className={styles.checkbox}
              />
            </label>
          }
          mainContent={
            <div className={styles.productInfo}>
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
  );
}

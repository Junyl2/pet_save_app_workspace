"use client";

import { FaHeart } from "react-icons/fa";
import { ProductCard, Product } from "./ProductCard";
import styles from "./ProductGrid.module.css";
import { useRouter } from "next/navigation";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
}

export function ProductGrid({
  products,
  isLoading = false,
  onAddToCart,
  onToggleFavorite,
}: ProductGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!products || products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.productGrid}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className={styles.loadingGrid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={styles.loadingSkeleton}>
          <div className={styles.skeletonImage}></div>
          <div className={`${styles.skeletonText} ${styles.medium}`}></div>
          <div className={`${styles.skeletonText} ${styles.short}`}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  const router = useRouter();

  const handleExplore = () => {
    router.push("/products");
  };

  return (
    <div className={styles.emptyState}>
      <FaHeart className={styles.emptyIcon} />
      <h2 className={styles.emptyTitle}>찜한 상품이 없어요</h2>
      <p className={styles.emptyMessage}>
        마음에 드는 상품을 찜해보세요.
        <br />
        찜한 상품들을 한 번에 확인할 수 있어요.
      </p>
      <button className={styles.exploreButton} onClick={handleExplore}>
        상품 둘러보기
      </button>
    </div>
  );
}

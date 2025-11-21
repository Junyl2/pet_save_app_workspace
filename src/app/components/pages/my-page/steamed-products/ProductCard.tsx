'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';
import styles from './ProductCard.module.css';
import { useProductCartQuantity } from '@/app/components/hooks/use-product-cart-quantity';

export interface Product {
  id: string;
  name: string;
  image: string;
  originalPrice?: number;
  salePrice: number;
  isFavorited?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { getProductQuantity } = useProductCartQuantity();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      onAddToCart(product);
    } finally {
      // Add small delay for better UX
      setTimeout(() => setIsLoading(false), 300);
    }
  };
  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite(product.id);
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  const handleCartIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const quantity = getProductQuantity(product.id);

  return (
    <div className={styles.productCard}>
      <div className={styles.productImageContainer}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.productImage}
        />
        <div className={styles.icons}>
          <button className={styles.iconBtn} onClick={handleCartIconClick}>
            {quantity > 0 ? (
              <div className={styles.quantityBadge}>
                <span className={styles.quantityText}>{quantity}</span>
              </div>
            ) : (
              <Image
                src="/images/products/search-cart.svg"
                alt="Cart Icon"
                width={24}
                height={24}
                className="object-contain"
              />
            )}
          </button>
        </div>
      </div>
      <div className={styles.productDetails}>
        <button
          className={styles.favoriteButton}
          onClick={handleToggleFavorite}
          aria-label={product.isFavorited ? '찜 해제' : '찜하기'}
        >
          <FaHeart
            className={`${styles.heartIcon} ${
              product.isFavorited ? '' : styles.unfavorited
            }`}
          />
        </button>
        <h3
          className={`${styles.productName} ${
            isExpanded ? styles.expanded : ''
          }`}
          onClick={toggleExpand}
        >
          {product.name}
        </h3>

        <div className={styles.priceContainer}>
          {product.originalPrice && (
            <span className={styles.originalPrice}>
              {formatPrice(product.originalPrice)}원
            </span>
          )}
          <span className={styles.salePrice}>
            {formatPrice(product.salePrice)}원
          </span>
        </div>

        <button
          className={styles.addToCartButton}
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? '담는 중...' : '장바구니 담기'}
        </button>
      </div>
    </div>
  );
}

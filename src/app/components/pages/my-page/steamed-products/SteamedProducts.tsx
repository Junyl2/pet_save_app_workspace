'use client';

import { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Product } from './ProductCard';
import { ProductGrid } from './ProductGrid';
import { AddToCartModal } from './AddToCartModal';
import { SuccessMessage } from './SuccessMessage';
import styles from './SteamedProducts.module.css';

// Mock data - in a real app, this would come from an API
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '탐사 6free 강아지 사료 15kg',
    image: '/images/products/dog-snack2.png',
    originalPrice: 30000,
    salePrice: 24000,
    isFavorited: true,
  },
  {
    id: '2',
    name: '강아지 시그니처 유기농 건식사료 2kg',
    image: '/images/products/dog-snack.png',
    originalPrice: 60000,
    salePrice: 36000,
    isFavorited: true,
  },
  {
    id: '3',
    name: '멜드펫파 무염 수제 츄르 강아지 간식',
    image: '/images/products/dogfood.png',
    originalPrice: 30000,
    salePrice: 24000,
    isFavorited: true,
  },
  {
    id: '4',
    name: '강아지 사용한 부분만 씻는 드라이 샴푸',
    image: '/images/products/dog-snack.png',
    originalPrice: 60000,
    salePrice: 36000,
    isFavorited: true,
  },
  {
    id: '5',
    name: '탐사 6free 강아지 사료 7kg',
    image: '/images/products/dog-snack.png',
    originalPrice: 30000,
    salePrice: 24000,
    isFavorited: true,
  },
  {
    id: '6',
    name: '탐사 6free 강아지 사료 3kg',
    image: '/images/products/dogfood.png',
    originalPrice: 60000,
    salePrice: 36000,
    isFavorited: true,
  },
];

export function SteamedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Success message states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Simulate loading products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProducts(MOCK_PRODUCTS);
        setError(null);
      } catch {
        setError('찜한 상품을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleToggleFavorite = (productId: string) => {
    setProducts(
      (prevProducts) =>
        prevProducts
          .map((product) =>
            product.id === productId
              ? { ...product, isFavorited: !product.isFavorited }
              : product
          )
          .filter((product) => product.isFavorited) // Remove unfavorited items from wishlist
    );

    setSuccessMessage('상품이 찜목록에서 제거되었습니다.');
    setShowSuccessMessage(true);
  };

  const handleModalAddToCart = async (product: Product, quantity: number) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSuccessMessage(`총 ${quantity}개의 상품이 장바구니에 담겼습니다.`);
    setShowSuccessMessage(true);
  };

  const handleModalPurchase = async (
    product: Product,
    quantity: number,
    shippingOption: string
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real app, this would navigate to checkout
    console.log('Proceeding to purchase:', {
      product,
      quantity,
      shippingOption,
    });
  };

  const handleRetry = () => {
    setError(null);
    // Trigger reload
    window.location.reload();
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>찜한 상품</h1>
          <p className={styles.pageSubtitle}>마음에 드는 상품들을 모아보세요</p>
        </div>

        <div className={styles.errorContainer}>
          <FaExclamationTriangle className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>오류가 발생했습니다</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryButton} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Products Section */}
      <div className={styles.productsSection}>
        <ProductGrid
          products={products}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleModalAddToCart}
        onPurchase={handleModalPurchase}
      />

      {/* Success Message */}
      <SuccessMessage
        isVisible={showSuccessMessage}
        message={successMessage}
        actionText="이동"
        actionRoute="/shopping-cart"
        onHide={() => setShowSuccessMessage(false)}
        duration={4000}
      />
    </div>
  );
}

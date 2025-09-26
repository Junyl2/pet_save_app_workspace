'use client';

import { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Product } from './ProductCard';
import { ProductGrid } from './ProductGrid';
import { AddToCartModal } from './AddToCartModal';
import { SuccessMessage } from './SuccessMessage';
import { useFavorites } from '@/app/context/FavoritesContext';
import { WishlistItem } from '@/app/api/types/my-page/wishlist';
import styles from './SteamedProducts.module.css';

// Using real API data from wishlist service

export function SteamedProducts() {
  const {
    wishlistItems,
    isLoading: favoritesLoading,
    error: favoritesError,
    toggleFavorite,
    loadWishlist,
  } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Success message states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load wishlist on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);

        // Load wishlist from API
        await loadWishlist();
      } catch (err) {
        console.error('Error loading wishlist:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [loadWishlist]); // Include loadWishlist dependency

  // Convert wishlist items to Product format when wishlistItems change
  useEffect(() => {
    let convertedProducts: Product[] = [];

    if (wishlistItems.length > 0) {
      // Use real wishlist data from API
      convertedProducts = wishlistItems.map((item: WishlistItem) => ({
        id: item.productId,
        name: item.productName,
        image: item.productThumbnail,
        originalPrice: item.salePrice,
        salePrice: item.discountedPrice,
        isFavorited: true, // All items in wishlist are favorited
      }));
    } else {
      // If no wishlist items from API, show empty state
      convertedProducts = [];
    }

    console.log('Setting products from wishlist:', convertedProducts);
    setProducts(convertedProducts);
    setError(null);
  }, [wishlistItems]); // Only depend on wishlistItems from API

  // Update error state when favorites context has an error
  useEffect(() => {
    if (favoritesError) {
      setError(favoritesError);
    }
  }, [favoritesError]);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleToggleFavorite = async (productId: string) => {
    try {
      await toggleFavorite(productId);
      // The FavoritesContext will handle updating the wishlistItems
      // which will automatically update the products via useEffect
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('찜목록 업데이트에 실패했습니다.');
    }
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
          isLoading={isLoading || favoritesLoading}
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

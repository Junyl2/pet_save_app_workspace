'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './ProductActions.module.css';
import { ProductDrawer } from '@/app/components/ui/drawer/ProductDrawer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/userContext';
import { PAGE_URLS } from '@/app/utils/page_url';

interface ProductActionsProps {
  productId: string | number;
  productName: string;
  productPrice: number | string;
  productImage?: string | null;
  storeId?: string;
  onAddToCart: (quantity: number, productName: string) => void;
  onPurchase: (quantity: number, productName: string) => void;
}

export const ProductActions = ({
  productId,
  productName,
  productPrice,
  productImage,
  storeId,
  onAddToCart,
  onPurchase,
}: ProductActionsProps) => {
  const router = useRouter();
  const { user } = useUser();
  const [showDrawer, setShowDrawer] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [drawerMode, setDrawerMode] = useState<'buy' | 'cart'>('buy');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // Store the handler from ProductDrawer
  const addToCartHandlerRef = useRef<(() => Promise<void>) | null>(null);

  // Check if this is the user's own product
  const isOwnProduct = !!(
    user?.role === 'seller' &&
    user?.storeId &&
    storeId &&
    user.storeId === storeId
  );

  const [activeProduct, setActiveProduct] = useState<{
    id: string;
    name: string;
    price: number;
    storeId?: string;
  } | null>(null);

  const openDrawer = (
    id: string | number,
    name: string,
    price: number | string,
    mode: 'buy' | 'cart'
  ) => {
    const normalizedId = String(id);
    const normalizedPrice =
      typeof price === 'string' ? parseFloat(price) || 0 : price;

    setActiveProduct({
      id: normalizedId,
      name,
      price: normalizedPrice,
      storeId,
    });
    setQuantity(1);
    setDrawerMode(mode);
    setShowDrawer(true);
  };

  const handleAddToCartClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (isAddingToCart) {
      return;
    }

    // If drawer is open and handler is ready, call it immediately
    if (showDrawer && drawerMode === 'cart') {
      // Wait a tiny bit if handler isn't ready yet (shouldn't happen with useLayoutEffect, but safety check)
      if (!addToCartHandlerRef.current) {
        // Handler should be ready immediately, but if not, wait one frame
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (!addToCartHandlerRef.current) {
          // Still not ready, just return (shouldn't happen)
          return;
        }
      }

      setIsAddingToCart(true);
      try {
        await addToCartHandlerRef.current();
      } catch (error) {
        console.error('Failed to add to cart:', error);
      } finally {
        setIsAddingToCart(false);
      }
    } else {
      // Otherwise, open the drawer
      openDrawer(productId, productName, productPrice, 'cart');
    }
  };

  // Callback to receive handler from ProductDrawer
  const handleAddToCartReady = useCallback((handler: () => Promise<void>) => {
    addToCartHandlerRef.current = handler;
  }, []);

  // Clear handler when drawer closes
  useEffect(() => {
    if (!showDrawer) {
      addToCartHandlerRef.current = null;
    }
  }, [showDrawer]);

  // Handle direct purchase (buy now) - no drawer, direct to checkout
  const handlePurchase = useCallback(() => {
    // Normalize product price
    const normalizedPrice =
      typeof productPrice === 'string'
        ? parseFloat(productPrice) || 0
        : productPrice;
    const normalizedId = String(productId);

    // Default values for direct purchase
    const defaultQuantity = 1;
    const defaultDeliveryOption = 'delivery'; // '배송' -> 'delivery'

    try {
      // Use actual product image if available, otherwise use a fallback
      // Match the fallback used in CartItemList for consistency
      const productImageUrl = productImage || '/placeholder.png';

      // Create order data (same structure as handleBuyNow in ProductDrawer)
      const orderData = [
        {
          product: {
            id: normalizedId,
            name: productName,
            price: normalizedPrice,
            discountPrice: null,
            brand: 'Pet Save',
            image: productImageUrl,
          },
          quantity: defaultQuantity,
          isDirectPurchase: true,
          productId: normalizedId,
        },
      ];

      // Save to localStorage (same as ProductDrawer handleBuyNow)
      localStorage.setItem('checkoutItems', JSON.stringify(orderData));
      localStorage.setItem('selectedDeliveryOption', defaultDeliveryOption);
      localStorage.setItem('isDirectPurchase', 'true');

      // Call onPurchase callback
      onPurchase?.(defaultQuantity, productName);

      // Navigate to delivery payment page
      router.push(PAGE_URLS.DELIVERY_PAYMENT);
    } catch (err) {
      console.error('Failed to process purchase:', err);
    }
  }, [productId, productName, productPrice, productImage, onPurchase, router]);

  return (
    <div className={styles.actionsContainer}>
      {/* Bottom Actions */}
      <div className={styles.actions}>
        {!showDrawer && (
          <button
            className={styles.messageButton}
            onClick={() =>
              router.push(
                `/contact-product?productId=${productId}&storeId=${storeId}`
              )
            }
          >
            <Image
              src="/images/icons/bottom-bar/message.svg"
              alt="Message Icon"
              height={20}
              width={20}
            />
          </button>
        )}

        <button
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleAddToCartClick(e);
          }}
          className={styles.addToCart}
          disabled={isOwnProduct || isAddingToCart}
        >
          {isOwnProduct
            ? '본인 상품은 장바구니에 담을 수 없습니다'
            : isAddingToCart
            ? '장바구니에 담는 중...'
            : '장바구니 담기'}
        </button>

        <button
          onClick={handlePurchase}
          className={styles.purchaseButton}
          disabled={isOwnProduct}
        >
          {isOwnProduct ? '본인 상품은 구매할 수 없습니다' : '구매하기'}
        </button>
      </div>

      {/* Drawer Component */}
      <ProductDrawer
        show={showDrawer}
        product={activeProduct}
        quantity={quantity}
        setQuantity={setQuantity}
        onClose={() => {
          setShowDrawer(false);
          setIsAddingToCart(false);
        }}
        onAddToCart={onAddToCart}
        mode={drawerMode}
        onAddToCartReady={handleAddToCartReady}
      />
    </div>
  );
};

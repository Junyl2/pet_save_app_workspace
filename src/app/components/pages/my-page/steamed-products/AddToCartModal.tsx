'use client';

import { useState, useEffect } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import { BaseModal } from '@/app/components/ui/modal/BaseModal';
import { Product } from './ProductCard';
import styles from './AddToCartModal.module.css';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
import { useRouter } from 'next/navigation';
import { cartService } from '@/app/api/services/client/cartService/cartService';
import { useUser } from '@/app/context/userContext';

interface AddToCartModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    shippingOption: string
  ) => void;
  onPurchase: (
    product: Product,
    quantity: number,
    shippingOption: string
  ) => void;
}

const shippingOptions = [
  { value: 'delivery', label: '배송' },
  { value: 'pickup', label: '픽업' },
];

export function AddToCartModal({
  isOpen,
  product,
  onClose,
  onAddToCart,
  onPurchase,
}: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [shippingOption, setShippingOption] = useState('delivery');
  const [isShippingExpanded, setIsShippingExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setShippingOption('delivery');
      setIsShippingExpanded(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!product) return null;

  // Check if user is trying to add their own product to cart
  const isOwnProduct = Boolean(
    user?.role === 'seller' &&
      user?.storeId &&
      (product as { storeId?: string }).storeId === user.storeId
  );

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const calculateTotal = () => product.salePrice * quantity;

  const handleAddToCart = async () => {
    if (!product) return;

    setIsLoading(true);
    try {
      // Call the real API
      const response = await cartService.addToCart(product.id, quantity);

      if (response.data?.success) {
        // Also call the local handler for UI updates
        await onAddToCart(product, quantity, shippingOption);
        onClose();
        setShowToast(true);
      } else if (
        response.error === 'Authentication required' ||
        response.error === 'No refresh token available'
      ) {
        // Don't show error toast - user is being redirected to login
        onClose();
      } else {
        // Handle other errors silently or show custom toast if needed
        console.error('Add to cart failed:', response.error);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Don't show error toast for authentication errors - user is being redirected
      if (
        error instanceof Error &&
        (error.message.includes('No refresh token available') ||
          error.message.includes('401') ||
          error.message.includes('Unauthorized'))
      ) {
        onClose();
      } else {
        console.error('Network error during add to cart:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      await onPurchase(product, quantity, shippingOption);
      onClose();
    } catch (error) {
      console.error('Failed to purchase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number): string => price.toLocaleString();

  const getSelectedShippingLabel = () => {
    const selected = shippingOptions.find(
      (opt) => opt.value === shippingOption
    );
    return selected?.label || '배송';
  };

  return (
    <>
      <BaseModal
        open={isOpen}
        onClose={onClose}
        className={styles.modalContent}
      >
        <div className={styles.contentContainer}>
          {/* Quantity Section */}
          <div className={styles.quantitySection}>
            <div className={styles.quantityRow}>
              <span className={styles.quantityLabel}>수량선택</span>
              <div className={styles.quantityControls}>
                <button
                  className={styles.quantityButton}
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="수량 감소"
                >
                  −
                </button>
                <span className={styles.quantityDisplay}>{quantity}</span>
                <button
                  className={styles.quantityButton}
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 99}
                  aria-label="수량 증가"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>총 수량 {quantity}개</span>
            <span className={styles.summaryValue}>
              총 금액 {formatPrice(calculateTotal())}원
            </span>
          </div>

          {/* Shipping Section */}
          <div className={styles.shippingSection}>
            <div
              className={styles.shippingHeader}
              onClick={() => setIsShippingExpanded(!isShippingExpanded)}
            >
              <span className={styles.shippingLabel}>
                배송 옵션 선택{' '}
                {!isShippingExpanded && `(${getSelectedShippingLabel()})`}
              </span>
              <FaChevronDown
                className={`${styles.dropdownArrow} ${
                  isShippingExpanded ? styles.expanded : ''
                }`}
              />
            </div>

            <div
              className={`${styles.shippingOptions} ${
                isShippingExpanded ? styles.expanded : ''
              }`}
            >
              {shippingOptions.map((option) => (
                <div
                  key={option.value}
                  className={styles.shippingOption}
                  onClick={() => setShippingOption(option.value)}
                >
                  <div
                    className={`${styles.shippingCheckbox} ${
                      shippingOption === option.value ? styles.checked : ''
                    }`}
                  >
                    <FaCheck className={styles.checkIcon} />
                  </div>
                  <span className={styles.optionLabel}>{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionButton} ${styles.addToCartButton}`}
            onClick={handleAddToCart}
            disabled={isLoading || isOwnProduct}
          >
            {isLoading
              ? '담는 중...'
              : isOwnProduct
              ? '본인 상품은 담을 수 없습니다'
              : '장바구니 담기'}
          </button>
          <button
            className={`${styles.actionButton} ${styles.purchaseButton}`}
            onClick={handlePurchase}
            disabled={isLoading || isOwnProduct}
          >
            {isLoading
              ? '구매 중...'
              : isOwnProduct
              ? '본인 상품은 구매할 수 없습니다'
              : '구매하기'}
          </button>
        </div>
      </BaseModal>

      {/* Toast shows after add-to-cart */}
      {showToast && (
        <ToastMessage
          message={`총 ${quantity}개의 상품이 장바구니에 담겼습니다.`}
          actionLabel="이동"
          onAction={() => {
            setShowToast(false);
            router.push('/shopping-cart');
          }}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}

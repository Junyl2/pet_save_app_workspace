'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FiPlus, FiMinus, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import styles from './ProductDrawer.module.css';
import { cartService } from '@/app/api/services/client/cartService/cartService';
import { useCart } from '@/app/context/cartContext';
import { PAGE_URLS } from '@/app/utils/page_url';
import { dispatchCartUpdate } from '@/app/components/hooks/use-cart-quantity';
import toast from 'react-hot-toast';

interface SimpleProduct {
  id: string;
  name: string;
  price: number;
  storeId?: string;
}

export interface ProductDrawerProps {
  show: boolean;
  product: SimpleProduct | null;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  onAddToCart?: (quantity: number, productName: string) => void;
  onPurchase?: (quantity: number, productName: string) => void;
  mode?: 'buy' | 'cart';
  onAddToCartReady?: (handler: () => Promise<void>) => void;
}

type DeliveryOption = '배송' | '픽업';

export const ProductDrawer = ({
  show,
  product,
  quantity,
  setQuantity,
  onClose,
  onAddToCart,
  onPurchase,
  mode = 'buy',
  onAddToCartReady,
}: ProductDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('배송');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  // Track if we should allow closing (set to false during validation/loading)
  const allowCloseRef = useRef(true);
  // Track if handler is currently processing to prevent multiple calls
  const isProcessingRef = useRef(false);
  // Use ref to store handler and avoid infinite loops
  const handlerRef = useRef<(() => Promise<void>) | null>(null);

  // Reset allowClose and processing flag when drawer closes
  useEffect(() => {
    if (!show) {
      allowCloseRef.current = true;
      isProcessingRef.current = false;
      setLoading(false);
    }
  }, [show]);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if we're in the middle of an operation
      if (!allowCloseRef.current || loading) {
        return;
      }

      const target = event.target as HTMLElement;

      // First check if click is on the action buttons container (prevent closing)
      const actionsContainer = target.closest('[class*="actionsContainer"]');
      if (actionsContainer) {
        // Don't close when clicking action buttons - let button handlers manage it
        return;
      }

      // Check if click is on any button or inside a button (prevent closing when clicking buttons)
      if (
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('[role="button"]')
      ) {
        return;
      }

      // Check if click is inside the drawer
      if (drawerRef.current && !drawerRef.current.contains(target) && show) {
        onClose();
      }
    };

    if (show) {
      // Use a delay to avoid closing immediately when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 300);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [show, onClose, loading]);

  // Define add to cart handler with useCallback
  const handleAddToCart = useCallback(async () => {
    // Prevent multiple simultaneous calls - check and set immediately
    if (isProcessingRef.current || loading) {
      return;
    }

    if (!product) {
      return;
    }

    // Validate quantity
    if (quantity < 1) {
      toast.error('수량을 선택해주세요');
      allowCloseRef.current = true;
      return;
    }

    // Close dropdown if it's open (default delivery option is already selected)
    if (dropdownOpen) {
      setDropdownOpen(false);
    }

    // Delivery option defaults to '배송', so it's always available
    // No need to validate since it has a default value

    // Prevent closing during operation and mark as processing IMMEDIATELY
    // Set these flags BEFORE any async operations to prevent race conditions
    isProcessingRef.current = true;
    allowCloseRef.current = false;
    setLoading(true);

    try {
      const res = await cartService.addToCart(product.id, quantity);

      if (!res.error && res.data?.success) {
        // Convert string ID to number if necessary for type safety
        const numericId = Number(product.id);
        const cartProduct = {
          ...product,
          id: isNaN(numericId) ? product.id : numericId,
        } as unknown as {
          id: number;
          name: string;
          price: number;
          storeId?: string;
        };

        addToCart(cartProduct, quantity);
        dispatchCartUpdate();
        onAddToCart?.(quantity, product.name);

        // Show success toast matching CartModal.tsx format
        toast.success(`${product.name} 장바구니에 담겼습니다`, {
          style: { background: '#66bfa7' },
          iconTheme: { primary: '#66bfa7', secondary: '#fff' },
        });

        // Close drawer after success
        isProcessingRef.current = false;
        allowCloseRef.current = true;
        setLoading(false);
        onClose();
      } else if (
        res.error === 'Authentication required' ||
        res.error === 'No refresh token available'
      ) {
        // Reset flags before closing
        isProcessingRef.current = false;
        allowCloseRef.current = true;
        setLoading(false);
        onClose();
      } else {
        toast.error('장바구니 추가 실패: ' + (res.error || '알 수 없는 오류'));
        // Reset flags but keep drawer open on error so user can retry
        isProcessingRef.current = false;
        allowCloseRef.current = true;
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('네트워크 오류로 장바구니 추가 실패');
      // Reset flags but keep drawer open on error so user can retry
      isProcessingRef.current = false;
      allowCloseRef.current = true;
      setLoading(false);
    }
  }, [
    product,
    quantity,
    addToCart,
    onAddToCart,
    onClose,
    dropdownOpen,
    loading,
  ]);

  // Update handler ref immediately when handler changes (not in useEffect)
  // This ensures handlerRef is always up-to-date when we expose it
  handlerRef.current = handleAddToCart;

  // Store onAddToCartReady in ref to avoid dependency issues
  const onAddToCartReadyRef = useRef(onAddToCartReady);

  // Update ref when callback changes
  useEffect(() => {
    onAddToCartReadyRef.current = onAddToCartReady;
  }, [onAddToCartReady]);

  // Create a stable wrapper function that always calls the latest handler via ref
  const wrappedHandler = useMemo(() => {
    return async () => {
      if (handlerRef.current) {
        await handlerRef.current();
      }
    };
  }, []); // Empty deps - function is stable and always calls latest handlerRef.current

  // Expose handler immediately when drawer opens in cart mode using useLayoutEffect
  // This runs synchronously before paint, ensuring handler is ready immediately
  useLayoutEffect(() => {
    if (show && mode === 'cart' && product && onAddToCartReadyRef.current) {
      // Expose handler immediately - handlerRef.current is already set synchronously above
      // wrappedHandler is stable and always calls the latest handlerRef.current
      onAddToCartReadyRef.current(wrappedHandler);
    }
  }, [show, mode, product, wrappedHandler]);

  // Also expose handler when quantity changes while drawer is open
  // This ensures the handler always has the latest quantity
  useEffect(() => {
    if (show && mode === 'cart' && product && onAddToCartReadyRef.current) {
      // Re-expose handler when quantity changes to ensure latest state
      onAddToCartReadyRef.current(wrappedHandler);
    }
  }, [show, mode, product, quantity, wrappedHandler]);

  if (!show || !product) return null;

  const totalPrice = product.price * quantity;

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      const orderData = [
        {
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            discountPrice: null,
            brand: 'Pet Save',
            image: '/images/products/dog-snack.png',
          },
          quantity,
          isDirectPurchase: true,
          productId: product.id,
        },
      ];

      localStorage.setItem('checkoutItems', JSON.stringify(orderData));
      localStorage.setItem(
        'selectedDeliveryOption',
        deliveryOption === '배송' ? 'delivery' : 'pickup'
      );
      localStorage.setItem('isDirectPurchase', 'true');
      onPurchase?.(quantity, product.name);
      onClose();
      router.push(PAGE_URLS.DELIVERY_PAYMENT);
    } catch (err) {
      console.error(err);
      toast.error('주문 페이지로 이동 중 오류가 발생했습니다');
      setLoading(false);
    }
  };

  return (
    <div ref={drawerRef} className={styles.productDetails}>
      <div className={styles.cartWrapper}>
        <div className={styles.quantitySelector}>
          <span>수량 선택</span>
          <div className={styles.controls}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className={styles.iconBtn}
              disabled={loading}
            >
              <FiMinus size={18} />
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className={styles.iconBtn}
              disabled={loading}
            >
              <FiPlus size={18} />
            </button>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.summary}>
          <p>총 수량 {quantity}개</p>
          <p>
            <span className={styles.priceSpan}>총 금액</span>
            <strong>{totalPrice.toLocaleString()}원</strong>
          </p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.deliveryOption}>
          <button
            className={styles.dropdownBtn}
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            disabled={loading}
          >
            배송 옵션 선택
            {dropdownOpen ? (
              <FiChevronUp size={18} className={styles.chevronIcon} />
            ) : (
              <FiChevronDown size={18} className={styles.chevronIcon} />
            )}
          </button>

          {dropdownOpen && (
            <div className={styles.dropdownList}>
              {(['배송', '픽업'] as DeliveryOption[]).map((option) => (
                <label
                  key={option}
                  className={styles.dropdownItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeliveryOption(option);
                    setDropdownOpen(false);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={deliveryOption === option}
                    onChange={() => {
                      setDeliveryOption(option);
                      setDropdownOpen(false);
                    }}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxLabel}>{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {mode === 'buy' && (
          <div className={styles.addBtnWrapper}>
            <button
              className={styles.addBtn}
              onClick={handleBuyNow}
              disabled={loading}
            >
              {loading ? '구매 중...' : '바로 구매'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

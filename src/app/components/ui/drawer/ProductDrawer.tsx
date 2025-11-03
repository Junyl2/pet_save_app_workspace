'use client';

import { useEffect, useRef, useState } from 'react';
import { FiPlus, FiMinus, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import styles from './ProductDrawer.module.css';
import { cartService } from '@/app/api/services/client/cartService/cartService';
import toast from 'react-hot-toast';
import { useCart } from '@/app/context/cartContext';
import { useUser } from '@/app/context/userContext';
import { PAGE_URLS } from '@/app/utils/page_url';

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
}: ProductDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('배송');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { addToCart } = useCart();
  const { user } = useUser();
  const router = useRouter();

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (show) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose]);

  if (!show || !product) return null;

  const isOwnProduct =
    user?.role === 'seller' &&
    user?.storeId &&
    product.storeId === user.storeId;

  const totalPrice = product.price * quantity;

  const handleAddToCart = async () => {
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
        onAddToCart?.(quantity, product.name);
        toast.success(`${product.name} 장바구니에 담겼습니다`, {
          style: { background: '#66bfa7' },
          iconTheme: { primary: '#66bfa7', secondary: '#fff' },
        });
        onClose();
      } else if (
        res.error === 'Authentication required' ||
        res.error === 'No refresh token available'
      ) {
        onClose();
      } else {
        toast.error('장바구니 추가 실패: ' + (res.error || '알 수 없는 오류'));
      }
    } catch (err) {
      console.error(err);
      toast.error('네트워크 오류로 장바구니 추가 실패');
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
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

        {mode === 'buy' && (
          <>
            <div className={styles.deliveryOption}>
              <button
                className={styles.dropdownBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
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
                    <label key={option} className={styles.dropdownItem}>
                      <input
                        type="checkbox"
                        checked={deliveryOption === option}
                        onChange={() => setDeliveryOption(option)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxLabel}>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.divider}></div>
          </>
        )}

        <div className={styles.addBtnWrapper}>
          {mode === 'buy' ? (
            <button
              className={styles.addBtn}
              onClick={handleBuyNow}
              disabled={loading || !!isOwnProduct}
            >
              {loading
                ? '구매 중...'
                : isOwnProduct
                ? '본인 상품은 구매할 수 없습니다'
                : '바로 구매'}
            </button>
          ) : (
            <button
              className={styles.addBtn}
              onClick={handleAddToCart}
              disabled={loading || !!isOwnProduct}
            >
              {loading
                ? '담는 중...'
                : isOwnProduct
                ? '본인 상품은 구매할 수 없습니다'
                : '장바구니 담기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

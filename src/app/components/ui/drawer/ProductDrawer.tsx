'use client';
import { useEffect, useRef, useState } from 'react';
import { FiPlus, FiMinus, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import styles from './ProductDrawer.module.css';
import { cartService } from '@/app/api/services/cart-service/cartService';

interface ProductDrawerProps {
  show: boolean;
  product: { id: number; name: string; price: string | number } | null;
  quantity: number;
  setQuantity: (q: number) => void;
  onClose: () => void;
  onAddToCart?: (quantity: number, productName: string) => void;
}

export const ProductDrawer = ({
  show,
  product,
  quantity,
  setQuantity,
  onClose,
  onAddToCart,
}: ProductDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'배송' | '픽업'>('배송');
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const rawPrice =
    typeof product.price === 'number'
      ? product.price
      : typeof product.price === 'string'
      ? parseFloat(product.price.replace(/[^\d.]/g, '')) || 0
      : 0;

  const totalPrice = rawPrice * quantity;

  const handleAddToCart = async () => {
    setLoading(true);
    const res = await cartService.addToCart(product.id, quantity);
    setLoading(false);

    if (!res.error && res.data?.success) {
      onAddToCart?.(quantity, product.name);
      onClose();
    } else {
      alert('장바구니 추가 실패: ' + res.error);
    }
  };

  return (
    <div ref={drawerRef} className={styles.productDetails}>
      <div className={styles.cartWrapper}>
        {/* Quantity Selector */}
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

        {/* Summary */}
        <div className={styles.summary}>
          <p>총 수량 {quantity}개</p>
          <p>
            <span className={styles.priceSpan}>총 금액</span>
            <strong>{totalPrice.toLocaleString()}원</strong>
          </p>
        </div>

        <div className={styles.divider}></div>

        {/* Delivery Option */}
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
              {['배송', '픽업'].map((option) => (
                <label key={option} className={styles.dropdownItem}>
                  <input
                    type="checkbox"
                    checked={deliveryOption === option}
                    onChange={() =>
                      setDeliveryOption(option as '배송' | '픽업')
                    }
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxLabel}>{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className={styles.divider}></div>

        {/* Add to Cart Button */}
        <div className={styles.addBtnWrapper}>
          <button
            className={styles.addBtn}
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? '담는 중...' : '장바구니 담기'}
          </button>
        </div>
      </div>
    </div>
  );
};

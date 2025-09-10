'use client';

import { useEffect, useState } from 'react';
import { BaseModal } from '../BaseModal';
import styles from './CartModal.module.css';
import { FiPlus, FiMinus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '@/app/context/cartContext';
import { Product } from '@/app/api/types/products/products';

interface CartModalProps {
  open: boolean;
  onClose: () => void;
  product: Product; // pass the full product object
}

export const CartModal = ({ open, onClose, product }: CartModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Reset quantity whenever modal opens or product changes
  useEffect(() => {
    if (open) setQuantity(1);
  }, [open, product?.id]);

  const handleIncrease = () => setQuantity((q) => q + 1);
  const handleDecrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const basePrice = product.discountPrice ?? product.price;
  const unitPrice =
    typeof basePrice === 'string' ? Number(basePrice) : basePrice;
  const totalPrice = unitPrice * quantity;

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);

    toast.success(`${product.name} 장바구니에 담겼습니다`, {
      style: { background: '#66bfa7' },
      iconTheme: { primary: '#66bfa7', secondary: '#fff' },
    });

    handleClose();
  };

  return (
    <BaseModal open={open} onClose={handleClose} title="">
      <div className={styles.container}>
        <div className={styles.cartWrapper}>
          {/* 수량 선택 */}
          <div className={styles.quantitySelector}>
            <span>수량 선택</span>
            <div className={styles.controls}>
              <button
                onClick={handleDecrease}
                className={styles.iconBtn}
                aria-label="decrease"
              >
                <FiMinus size={18} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={handleIncrease}
                className={styles.iconBtn}
                aria-label="increase"
              >
                <FiPlus size={18} />
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          {/* 총 수량 & 총 금액 */}
          <div className={styles.summary}>
            <p>총 수량 {quantity}개</p>
            <p>
              <span className={styles.priceSpan}>총 금액</span>
              <strong>{totalPrice.toLocaleString('ko-KR')}원</strong>
            </p>
          </div>
        </div>

        {/* 장바구니 담기 버튼 */}
        <button className={styles.addBtn} onClick={handleAddToCart}>
          장바구니 담기
        </button>
      </div>
    </BaseModal>
  );
};

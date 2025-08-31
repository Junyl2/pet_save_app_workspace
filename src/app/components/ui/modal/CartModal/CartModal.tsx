'use client';

import { useState } from 'react';
import { BaseModal } from '../BaseModal';
import styles from './CartModal.module.css';
import { FiPlus, FiMinus } from 'react-icons/fi';
import toast from 'react-hot-toast';
interface CartModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  productPrice: number;
}

export const CartModal = ({
  open,
  onClose,
  productName,
  productPrice,
}: CartModalProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => setQuantity((q) => q + 1);
  const handleDecrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const totalPrice = productPrice * quantity;

  // Reset quantity whenever modal closes
  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  const handleAddToCart = () => {
    toast.success(`${productName} 장바구니에 담겼습니다`, {
      style: {
        background: '#66bfa7',
      },
      iconTheme: {
        primary: '#66bfa7',
        secondary: '#fff',
      },
    });
    handleClose(); // reset + close
  };

  return (
    <BaseModal open={open} onClose={handleClose} title={''}>
      <div className={styles.container}>
        <div className={styles.cartWrapper}>
          <div className={styles.quantitySelector}>
            <span>수량 선택</span>
            <div className={styles.controls}>
              <button onClick={handleDecrease} className={styles.iconBtn}>
                <FiMinus size={18} />
              </button>
              <span>{quantity}</span>
              <button onClick={handleIncrease} className={styles.iconBtn}>
                <FiPlus size={18} />
              </button>
            </div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.summary}>
            <div>
              <p>총 수량 {quantity}개</p>
            </div>
            <div>
              <p>
                <span className={styles.priceSpan}>총 금액</span>
                <strong>{totalPrice.toLocaleString('ko-KR')}원</strong>
              </p>
            </div>
          </div>
        </div>
        <button className={styles.addBtn} onClick={handleAddToCart}>
          장바구니 담기
        </button>
      </div>
    </BaseModal>
  );
};

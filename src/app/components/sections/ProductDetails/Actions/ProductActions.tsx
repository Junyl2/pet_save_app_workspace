'use client';
import Image from 'next/image';
import styles from './ProductActions.module.css';

interface ProductActionsProps {
  onCartOpen: () => void;
}

export const ProductActions = ({ onCartOpen }: ProductActionsProps) => {
  return (
    <div className={styles.actions}>
      <button className={styles.messageButton}>
        <Image
          src="/images/icons/bottom-bar/message.svg"
          alt="Message Icon"
          height={20}
          width={20}
        />
      </button>

      <button onClick={onCartOpen} className={styles.addToCart}>
        장바구니 담기
      </button>

      <button className={styles.purchaseButton}>구매하기</button>
    </div>
  );
};

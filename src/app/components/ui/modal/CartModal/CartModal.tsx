'use client';

import { useState } from 'react';
import { BaseModal } from '../BaseModal';
import styles from './CartModal.module.css';
import { FiPlus, FiMinus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '@/app/context/cartContext';
import { cartService } from '@/app/api/services/client/cartService/cartService';
import { useUser } from '@/app/context/userContext';

interface CartModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  productPrice: number;
  productId?: string;
  storeId?: string;
}

export const CartModal = ({
  open,
  onClose,
  productName,
  productPrice,
  productId,
  storeId,
}: CartModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { user } = useUser();

  const handleIncrease = () => setQuantity((q) => q + 1);
  const handleDecrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const totalPrice = productPrice * quantity;

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  // Check if user is trying to add their own product to cart
  const isOwnProduct =
    user?.role === 'seller' && user?.storeId && storeId === user.storeId;

  const handleAddToCart = async () => {
    if (!productId) {
      toast.error('상품 정보가 없습니다');
      return;
    }

    setIsLoading(true);
    try {
      // Call the real API
      const response = await cartService.addToCart(productId, quantity);

      if (response.data?.success) {
        // Also call the local handler for UI updates
        type AddToCartProduct = Parameters<typeof addToCart>[0];
        const tempProduct = {
          id: Date.now(), // temporary id
          name: productName,
          price: productPrice,
        } as AddToCartProduct;
        addToCart(tempProduct, quantity);

        toast.success(`${productName} 장바구니에 담겼습니다`, {
          style: { background: '#66bfa7' },
          iconTheme: { primary: '#66bfa7', secondary: '#fff' },
        });

        handleClose();
      } else {
        toast.error(
          '장바구니 추가 실패: ' + (response.error || '알 수 없는 오류')
        );
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('네트워크 오류로 장바구니 추가 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal open={open} onClose={handleClose} title="">
      <div className={styles.container}>
        <div className={styles.cartWrapper}>
          {/* 수량 선택 */}
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
        <button
          className={styles.addBtn}
          onClick={handleAddToCart}
          disabled={isLoading || !!isOwnProduct}
        >
          {isLoading
            ? '담는 중...'
            : isOwnProduct
            ? '본인 상품은 담을 수 없습니다'
            : '장바구니 담기'}
        </button>
      </div>
    </BaseModal>
  );
};

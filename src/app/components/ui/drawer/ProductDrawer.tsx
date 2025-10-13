'use client';

import { useEffect, useRef, useState } from 'react';
import { FiPlus, FiMinus, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import styles from './ProductDrawer.module.css';
import { cartService } from '@/app/api/services/client/cartService/cartService';
import { orderService } from '@/app/api/services/client/memberService/order/orderService';
import {
  DirectOrderRequest,
  ShippingOption,
} from '@/app/api/types/member/order/order';
import toast from 'react-hot-toast';
import { useCart } from '@/app/context/cartContext';
import { useUser } from '@/app/context/userContext';
import { PAGE_URLS } from '@/app/utils/page_url';

interface SimpleProduct {
  id: string | number;
  name: string;
  price: string | number;
  storeId?: string;
}

interface ProductDrawerProps {
  show: boolean;
  product: SimpleProduct | null;
  quantity: number;
  setQuantity: (q: number) => void;
  onClose: () => void;
  onAddToCart?: (quantity: number, productName: string) => void;
}

type DeliveryOption = '배송' | '픽업';

// Convert Korean delivery option to API shipping option
const convertDeliveryOption = (option: DeliveryOption): ShippingOption => {
  return option === '배송' ? 'DELIVERY' : 'PICKUP';
};

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
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('배송');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { addToCart } = useCart(); // context
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

  // Check if user is trying to add their own product to cart
  const isOwnProduct =
    user?.role === 'seller' &&
    user?.storeId &&
    product.storeId === user.storeId;

  const rawPrice =
    typeof product.price === 'number'
      ? product.price
      : typeof product.price === 'string'
      ? parseFloat(product.price.replace(/[^\d.]/g, '')) || 0
      : 0;

  const totalPrice = rawPrice * quantity;

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      // Call the real API
      const res = await cartService.addToCart(String(product.id), quantity);

      if (!res.error && res.data?.success) {
        // Also call the local handler for UI updates
        addToCart(product as Parameters<typeof addToCart>[0], quantity);
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
        // Don't show error toast - user is being redirected to login
        onClose();
      } else {
        toast.error('장바구니 추가 실패: ' + (res.error || '알 수 없는 오류'));
      }
    } catch (err) {
      console.error(err);
      // Don't show error toast for authentication errors - user is being redirected
      if (
        err instanceof Error &&
        (err.message.includes('No refresh token available') ||
          err.message.includes('401') ||
          err.message.includes('Unauthorized'))
      ) {
        onClose();
      } else {
        toast.error('네트워크 오류로 장바구니 추가 실패');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      // Create direct order request
      const directOrderRequest: DirectOrderRequest = {
        productId: String(product.id),
        quantity,
        shippingOption: convertDeliveryOption(deliveryOption),
        deliveryAddress:
          deliveryOption === '배송' ? '서울시 강남구 테헤란로 123' : undefined, // Hardcoded for now
        usePointsAmount: 0, // Hardcoded for now as mentioned in requirements
        paymentDetails: {
          method: 'BANK',
          bankName: '국민은행',
          depositorName: '홍길동',
          receiptType: 'TAX_INVOICE',
          issuanceType: 'TAX_INVOICE_ISSUANCE',
          issueNumber: '1234567',
          businessNumber: '123-45-67890',
          businessName: '주식회사 잉키',
          representativeName: '홍길동',
          businessAddress: '서울시 강남구 테헤란로 123',
          businessType: '서비스업',
          businessCategory: '소프트웨어 개발',
          businessEmail: 'business@petsave.com',
        },
      };

      // Call the direct order API
      const res = await orderService.createDirectOrder(directOrderRequest);

      if (!res.error && res.data?.success) {
        // Prepare order data for delivery payment page
        const orderData = [
          {
            product: {
              id:
                typeof product.id === 'number'
                  ? product.id
                  : parseInt(String(product.id)),
              name: product.name,
              price: rawPrice,
              discountPrice: null,
              brand: 'Pet Save',
              image: '/images/products/dog-snack.png', // Default image
            },
            quantity,
          },
        ];

        // Store order data in localStorage for delivery payment page
        localStorage.setItem('checkoutItems', JSON.stringify(orderData));

        // Store delivery option for the payment page
        localStorage.setItem(
          'selectedDeliveryOption',
          deliveryOption === '배송' ? 'delivery' : 'pickup'
        );

        toast.success('주문이 생성되었습니다. 결제 페이지로 이동합니다.', {
          style: { background: '#66bfa7' },
          iconTheme: { primary: '#66bfa7', secondary: '#fff' },
        });

        onClose();

        // Navigate to delivery payment page
        router.push(PAGE_URLS.DELIVERY_PAYMENT);
      } else if (
        res.error === 'Authentication required' ||
        res.error === 'No refresh token available'
      ) {
        // Don't show error toast - user is being redirected to login
        onClose();
      } else {
        // Handle API response errors (like product not available)
        const errorMessage =
          res.data?.resultMsg || res.error || '알 수 없는 오류';
        toast.error('주문 생성 실패: ' + errorMessage);
      }
    } catch (err) {
      console.error(err);
      // Don't show error toast for authentication errors - user is being redirected
      if (
        err instanceof Error &&
        (err.message.includes('No refresh token available') ||
          err.message.includes('401') ||
          err.message.includes('Unauthorized'))
      ) {
        onClose();
      } else {
        toast.error('네트워크 오류로 주문 생성 실패');
      }
    } finally {
      setLoading(false);
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

        {/* Buy Now Button */}
        <div className={styles.addBtnWrapper}>
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
        </div>
      </div>
    </div>
  );
};

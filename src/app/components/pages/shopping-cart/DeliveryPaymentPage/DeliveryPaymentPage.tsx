'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DeliveryPayment.module.css';

import CartSummary from './CartSummary/CartSummary';
import CartItemList from './CartItemList/CartItemList';
import DeliveryOptions from './DevlieryOptions/DeliveryOptions';
import AddressBlock from './AddressBlock/AddressBlock';
import DeliveryRequests from './DeliveryRequests/DeliveryRequests';
import PointsDiscount from './PointsDiscount/PointsDiscount';
import PaymentSummary from './PaymentSummary/PaymentSummary';
import PaymentMethod from './PaymentMethod/PaymentMethod';
import Agreements from './Agreements/Agreements';
import PayButton from './PayButton/PayButton';
/* import OrderConfirmation from './OrderConfirmation/OrderConfirmation'; */
import { PAGE_URLS } from '@/app/utils/page_url';

export type Product = {
  id: number;
  name: string;
  price: number;
  discountPrice?: number | null;
  brand?: string;
  image?: string;
};

export type OrderItem = {
  product: Product;
  quantity: number;
};

const SHIPPING_FEE = 3000;
const POINTS_AVAILABLE = 440;
const POINTS_BALANCE = 445;

// Fixed confirmation date: 8/6 (수)
const CONFIRM_DATE = new Date(2025, 7, 6); // months are 0-indexed; 7 = August

export default function DeliveryPaymentPage() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const [deliveryOption, setDeliveryOption] = useState<
    'delivery' | 'pickup' | null
  >(null);

  const [requestNote, setRequestNote] = useState('');
  const [customRequest, setCustomRequest] = useState('');
  const [usePoints, setUsePoints] = useState(0);

  const [payCategory, setPayCategory] = useState<
    'quick' | 'card' | 'bank' | null
  >('quick');
  const [quickBrand, setQuickBrand] = useState<
    'toss' | 'kakao' | 'naver' | null
  >('toss');

  const [agreeOrderInfo, setAgreeOrderInfo] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeFinal, setAgreeFinal] = useState(false);

  /*   // Show confirmation after payment
  const [paid, setPaid] = useState(false); */

  useEffect(() => {
    const saved = localStorage.getItem('checkoutItems');
    if (saved) setOrderItems(JSON.parse(saved));
  }, []);

  const { itemCount, subtotal, discountAmount } = useMemo(() => {
    const count = orderItems.reduce((n, it) => n + it.quantity, 0);
    const sub = orderItems.reduce(
      (acc, { product, quantity }) =>
        acc + (product.discountPrice ?? product.price) * quantity,
      0
    );
    const discount = orderItems.reduce((acc, { product, quantity }) => {
      const d =
        product.discountPrice != null
          ? product.price - product.discountPrice
          : 0;
      return acc + d * quantity;
    }, 0);
    return { itemCount: count, subtotal: sub, discountAmount: discount };
  }, [orderItems]);

  const maxPointUsable = Math.max(
    0,
    Math.min(POINTS_AVAILABLE, Math.floor(subtotal))
  );

  useEffect(() => {
    if (usePoints > maxPointUsable) setUsePoints(maxPointUsable);
  }, [maxPointUsable, usePoints]);

  if (orderItems.length === 0) {
    return <p className={styles.empty}>선택한 주문 상품이 없습니다.</p>;
  }

  const totalDue = Math.max(0, subtotal - usePoints) + SHIPPING_FEE;
  const canPay =
    !!payCategory &&
    (payCategory !== 'quick' || !!quickBrand) &&
    !!deliveryOption;
  /*   &&
    agreeOrderInfo &&
    agreePrivacy &&
    agreeFinal;
 */
  const paymentLabel =
    payCategory === 'quick'
      ? quickBrand === 'toss'
        ? '토스페이먼츠 간편결제'
        : quickBrand === 'kakao'
        ? '카카오페이'
        : '네이버페이'
      : payCategory === 'card'
      ? '신용/체크카드'
      : '계좌이체';

  const handlePay = () => {
    if (!canPay || !deliveryOption) return;

    const payload = {
      mode: String(deliveryOption),
      orderNo: String(1582),
      itemCount,
      amount: Math.round(totalDue),
      paymentLabel: String(paymentLabel),
      date: CONFIRM_DATE.toISOString(),
    };

    // Fallback store (survives navigation within the same tab)
    try {
      sessionStorage.setItem('orderConfirmation', JSON.stringify(payload));
    } catch {}

    const params = new URLSearchParams({
      mode: payload.mode,
      orderNo: payload.orderNo,
      itemCount: String(payload.itemCount),
      amount: String(payload.amount),
      paymentLabel: payload.paymentLabel,
      date: payload.date,
    });

    // Optional: clear cart AFTER we stored confirmation data
    localStorage.removeItem('checkoutItems');

    router.push(`${PAGE_URLS.ORDER_CONFIRMATION}?${params.toString()}`);
  };

  // Otherwise show the regular checkout flow
  return (
    <div className={styles.container}>
      <CartSummary
        itemCount={itemCount}
        isOpen={isOpen}
        toggleOpen={() => setIsOpen(!isOpen)}
      />
      {isOpen && <CartItemList orderItems={orderItems} />}

      <div className={styles.divider}></div>

      <DeliveryOptions
        deliveryOption={deliveryOption}
        setDeliveryOption={setDeliveryOption}
      />

      <div className={styles.divider}></div>

      <AddressBlock />

      {deliveryOption === 'delivery' && (
        <>
          <DeliveryRequests
            requestNote={requestNote}
            setRequestNote={setRequestNote}
            customRequest={customRequest}
            setCustomRequest={setCustomRequest}
          />
          <div className={styles.divider}></div>
        </>
      )}

      <div className={styles.divider}></div>

      <PointsDiscount
        usePoints={usePoints}
        setUsePoints={setUsePoints}
        maxPointUsable={maxPointUsable}
        pointsAvailable={POINTS_AVAILABLE}
        pointsBalance={POINTS_BALANCE}
      />

      <div className={styles.divider}></div>

      <PaymentSummary
        subtotal={subtotal}
        discountAmount={discountAmount}
        usePoints={usePoints}
        totalDue={totalDue}
        shippingFee={SHIPPING_FEE}
      />

      <div className={styles.divider}></div>

      <PaymentMethod
        payCategory={payCategory}
        setPayCategory={setPayCategory}
        quickBrand={quickBrand}
        setQuickBrand={setQuickBrand}
      />

      <div className={styles.divider}></div>

      <Agreements
        agreeOrderInfo={agreeOrderInfo}
        setAgreeOrderInfo={setAgreeOrderInfo}
        agreePrivacy={agreePrivacy}
        setAgreePrivacy={setAgreePrivacy}
        agreeFinal={agreeFinal}
        setAgreeFinal={setAgreeFinal}
        canPay={canPay}
      />

      <PayButton totalDue={totalDue} canPay={canPay} handlePay={handlePay} />
    </div>
  );
}

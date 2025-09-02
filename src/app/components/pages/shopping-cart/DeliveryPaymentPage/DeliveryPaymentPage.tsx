'use client';

import { useEffect, useMemo, useState } from 'react';
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

export default function DeliveryPaymentPage() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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
  >('kakao');

  const [agreeOrderInfo, setAgreeOrderInfo] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeFinal, setAgreeFinal] = useState(false);

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
    agreeOrderInfo &&
    agreePrivacy &&
    agreeFinal;

  const handlePay = () => {
    if (!canPay) return;
    alert(
      `[결제 시뮬레이션]\n방식: ${payCategory}${
        payCategory === 'quick' ? ` (${quickBrand})` : ''
      }\n결제 금액: ${totalDue.toLocaleString()}원`
    );
  };

  return (
    <div className={styles.container}>
      <CartSummary
        itemCount={itemCount}
        isOpen={isOpen}
        toggleOpen={() => setIsOpen(!isOpen)}
      />
      {isOpen && <CartItemList orderItems={orderItems} />}

      <DeliveryOptions
        deliveryOption={deliveryOption}
        setDeliveryOption={setDeliveryOption}
      />
      <AddressBlock />

      <DeliveryRequests
        requestNote={requestNote}
        setRequestNote={setRequestNote}
        customRequest={customRequest}
        setCustomRequest={setCustomRequest}
      />

      <PointsDiscount
        usePoints={usePoints}
        setUsePoints={setUsePoints}
        maxPointUsable={maxPointUsable}
        pointsAvailable={POINTS_AVAILABLE}
        pointsBalance={POINTS_BALANCE}
      />

      <PaymentSummary
        subtotal={subtotal}
        discountAmount={discountAmount}
        usePoints={usePoints}
        totalDue={totalDue}
        shippingFee={SHIPPING_FEE}
      />

      <PaymentMethod
        payCategory={payCategory}
        setPayCategory={setPayCategory}
        quickBrand={quickBrand}
        setQuickBrand={setQuickBrand}
      />

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

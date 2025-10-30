'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
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
import { PAGE_URLS } from '@/app/utils/page_url';
import { AppDispatch } from '@/app/redux/store';
import { fetchPointsStats } from '@/app/redux/slices/cache/pointsSlice';

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
const CONFIRM_DATE = new Date(2025, 7, 6); // August 6

export default function DeliveryPaymentPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [deliveryOption, setDeliveryOption] = useState<
    'delivery' | 'pickup' | null
  >(null);

  const [requestNote, setRequestNote] = useState('');
  const [customRequest, setCustomRequest] = useState('');
  const [usePoints, setUsePoints] = useState(0);

  const [availablePoints, setAvailablePoints] = useState(0);
  const [balancePoints, setBalancePoints] = useState(0);

  const [payCategory, setPayCategory] = useState<
    'quick' | 'card' | 'bank' | null
  >('quick');
  const [quickBrand, setQuickBrand] = useState<
    'toss' | 'kakao' | 'naver' | null
  >('toss');

  const [agreeOrderInfo, setAgreeOrderInfo] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeFinal, setAgreeFinal] = useState(false);

  // Load cart + delivery option
  useEffect(() => {
    const saved = localStorage.getItem('checkoutItems');
    if (saved) setOrderItems(JSON.parse(saved));

    const storedDeliveryOption = localStorage.getItem('selectedDeliveryOption');
    if (storedDeliveryOption) {
      setDeliveryOption(storedDeliveryOption as 'delivery' | 'pickup');
      localStorage.removeItem('selectedDeliveryOption');
    }
  }, []);

  // Fetch real points
  useEffect(() => {
    const loadPoints = async () => {
      try {
        const result = await dispatch(fetchPointsStats());
        if (fetchPointsStats.fulfilled.match(result)) {
          const data = result.payload?.data?.data?.data;
          const totalUsablePoints = data?.totalUsablePoints ?? 0;
          setAvailablePoints(totalUsablePoints);
          setBalancePoints(totalUsablePoints); // same unless you track other logic
        }
      } catch (err) {
        console.error('Failed to load points:', err);
      }
    };
    loadPoints();
  }, [dispatch]);

  // Derived totals
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
    Math.min(availablePoints, Math.floor(subtotal))
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

    localStorage.removeItem('checkoutItems');
    router.push(`${PAGE_URLS.ORDER_CONFIRMATION}?${params.toString()}`);
  };

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
        pointsAvailable={availablePoints}
        pointsBalance={balancePoints}
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

      <PayButton
        totalDue={totalDue}
        canPay={canPay}
        handlePay={handlePay}
        orderItems={orderItems}
        deliveryOption={deliveryOption}
        usePoints={usePoints}
        paymentMethod={{
          payCategory,
          quickBrand,
        }}
      />
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import OrderConfirmation from '@/app/components/pages/shopping-cart/DeliveryPaymentPage/OrderConfirmation/OrderConfirmation';
import { StoreService } from '@/app/api/services/client/storeService/storeService';

type Mode = 'delivery' | 'pickup';

type Props = {
  mode: Mode;
  orderNo: number | string;
  itemCount: number;
  amount: number;
  paymentLabel: string;
  date: Date;
  bankName?: string;
  accountNumber?: string;
  depositorName?: string;
};

export default function OrderConfirmationClient(initial: Props) {
  const [data, setData] = useState<Props>(initial);
  const [bankInfo, setBankInfo] = useState<{
    bankName?: string;
    accountNumber?: string;
    depositorName?: string;
  }>({
    bankName: initial.bankName,
    accountNumber: initial.accountNumber,
    depositorName: initial.depositorName,
  });
  const [isFetchingBankInfo, setIsFetchingBankInfo] = useState(false);
  const [bankInfoError, setBankInfoError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // If any critical field looks empty/zero, try sessionStorage fallback
    const missing =
      !initial.paymentLabel ||
      !initial.orderNo ||
      initial.itemCount === 0 ||
      initial.amount === 0;

    if (missing) {
      try {
        const raw = sessionStorage.getItem('orderConfirmation');
        if (raw) {
          const parsed = JSON.parse(raw);
          const loadedBankInfo = {
            bankName: parsed.bankName,
            accountNumber: parsed.accountNumber,
            depositorName: parsed.depositorName,
          };

          setData((prev) => ({
            ...prev,
            mode: parsed.mode === 'pickup' ? ('pickup' as const) : 'delivery',
            orderNo: parsed.orderNo ?? prev.orderNo,
            itemCount: Number(parsed.itemCount ?? prev.itemCount),
            amount: Number(parsed.amount ?? prev.amount),
            paymentLabel: parsed.paymentLabel ?? prev.paymentLabel,
            date: new Date(parsed.date ?? prev.date),
            bankName: loadedBankInfo.bankName,
            accountNumber: loadedBankInfo.accountNumber,
            depositorName: loadedBankInfo.depositorName,
          }));

          setBankInfo(loadedBankInfo);

          // If bank info was loaded from sessionStorage, mark as fetched
          if (loadedBankInfo.bankName && loadedBankInfo.accountNumber) {
            hasFetchedRef.current = true;
          }
        }
      } catch {}
    }
  }, [initial]);

  // Fetch store bank account info if BANK payment and bank info is missing
  useEffect(() => {
    const fetchBankInfo = async () => {
      // Wait a bit to ensure first useEffect has completed
      await new Promise((resolve) => setTimeout(resolve, 200));

      const paymentLabel = data.paymentLabel || initial.paymentLabel;
      const isBankPayment = paymentLabel === '무통장입금';

      // Check if we already have bank info or have already attempted to fetch
      const currentBankInfo = bankInfo;
      const hasBankInfo = !!(
        currentBankInfo.bankName && currentBankInfo.accountNumber
      );

      // Only fetch if BANK payment and bank info is not available and we haven't fetched yet
      if (!isBankPayment || hasBankInfo || hasFetchedRef.current) {
        console.log('⏭️ Skipping bank info fetch:', {
          isBankPayment,
          hasBankInfo,
          hasFetched: hasFetchedRef.current,
          paymentLabel,
          currentBankInfo,
        });
        return;
      }

      hasFetchedRef.current = true;
      setIsFetchingBankInfo(true);
      setBankInfoError(null);
      console.log('🔄 Starting to fetch bank account info...');

      try {
        // Try to get storeId from checkoutItems in localStorage
        const checkoutItems = localStorage.getItem('checkoutItems');
        console.log('📦 checkoutItems exists:', !!checkoutItems);

        if (!checkoutItems) {
          console.warn('⚠️ No checkoutItems found in localStorage');
          setBankInfoError('주문 정보를 찾을 수 없습니다.');
          setIsFetchingBankInfo(false);
          return;
        }

        const items = JSON.parse(checkoutItems);
        console.log('📦 Parsed items:', items.length, 'items');
        console.log(
          '📦 First item structure:',
          JSON.stringify(items[0], null, 2)
        );

        // Get storeId from first product if available
        const firstProduct = items[0]?.product;
        const storeId = firstProduct?.storeId;

        console.log('🏪 storeId from product:', storeId);
        console.log(
          '🏪 First product keys:',
          firstProduct ? Object.keys(firstProduct) : 'no product'
        );

        if (!storeId) {
          console.warn(
            '⚠️ No storeId found in product. Available keys:',
            firstProduct ? Object.keys(firstProduct) : 'no product'
          );
          setBankInfoError('상점 정보를 찾을 수 없습니다.');
          setIsFetchingBankInfo(false);
          return;
        }

        console.log(
          '🔄 Fetching store bank account info for storeId:',
          storeId
        );
        const response = await StoreService.getStoreSummary(storeId);

        console.log('📥 Store response:', response);

        if (response.error) {
          console.error('❌ Store service error:', response.error);
          setBankInfoError('계좌 정보를 불러오는데 실패했습니다.');
          setIsFetchingBankInfo(false);
          return;
        }

        if (response.data?.data) {
          const storeData = response.data.data;
          const bankData = {
            bankName: storeData.bankName || undefined,
            accountNumber: storeData.accountNumber || undefined,
            depositorName: storeData.depositorName || undefined,
          };

          console.log('✅ Store bank account info fetched:', bankData);

          if (bankData.bankName && bankData.accountNumber) {
            setBankInfo(bankData);
            setBankInfoError(null);

            // Update sessionStorage with bank info
            try {
              const existing = sessionStorage.getItem('orderConfirmation');
              if (existing) {
                const parsed = JSON.parse(existing);
                sessionStorage.setItem(
                  'orderConfirmation',
                  JSON.stringify({
                    ...parsed,
                    ...bankData,
                  })
                );
              }
            } catch (err) {
              console.error('❌ Error updating sessionStorage:', err);
            }
          } else {
            console.warn('⚠️ Bank account info incomplete:', bankData);
            setBankInfoError('계좌 정보가 등록되지 않았습니다.');
          }
        } else {
          console.warn(
            '⚠️ No store data in response. Response structure:',
            response
          );
          setBankInfoError('상점 정보를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('❌ Error fetching store bank account info:', error);
        setBankInfoError('계좌 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsFetchingBankInfo(false);
      }
    };

    fetchBankInfo();
    // Only depend on paymentLabel to avoid infinite loops
  }, [data.paymentLabel, initial.paymentLabel, bankInfo]);

  return <OrderConfirmation {...data} />;
}

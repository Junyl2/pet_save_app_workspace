'use client';

import styles from '../DeliveryPayment.module.css';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DeliveryAddressService } from '@/app/api/services/client/memberService/member-information/deliveryAddressService';
import type { DeliveryAddress } from '@/app/api/types/member/member-information/member-information';

interface AddressBlockProps {
  onAddressSelect?: (address: string | null) => void;
}

export default function AddressBlock({ onAddressSelect }: AddressBlockProps) {
  const router = useRouter();
  const [defaultAddress, setDefaultAddress] = useState<DeliveryAddress | null>(
    null
  );

  useEffect(() => {
    const fetchDefaultAddress = async (): Promise<void> => {
      try {
        const response = await DeliveryAddressService.getDeliveryAddresses();
        if (response?.data?.success && Array.isArray(response.data.data)) {
          const addresses = response.data.data as DeliveryAddress[];
          const foundDefault = addresses.find((addr) => addr.default) || null;
          setDefaultAddress(foundDefault);

          // Send formatted address to parent component
          onAddressSelect?.(
            foundDefault
              ? `${foundDefault.roadAddress || ''} ${
                  foundDefault.detailedAddress || ''
                }`.trim()
              : null
          );
        } else {
          setDefaultAddress(null);
          onAddressSelect?.(null);
        }
      } catch {
        setDefaultAddress(null);
        onAddressSelect?.(null);
      }
    };

    fetchDefaultAddress();
  }, [onAddressSelect]);

  const addressText = defaultAddress
    ? `${defaultAddress.roadAddress || ''} ${
        defaultAddress.detailedAddress || ''
      }`.trim()
    : '';

  return (
    <section className={styles.card}>
      <h3 className={styles.sectionSubTitle}>배송지 정보</h3>
      <div className={styles.addressBlock}>
        <div>
          <p className={styles.addrName}>
            {defaultAddress?.addressTitle || '배송지를 선택해주세요'}
          </p>

          {defaultAddress && (
            <>
              <p className={styles.addrReceiver}>
                {defaultAddress.receiverName || '수령인 정보 없음'}
              </p>
              <p className={styles.addrPhone}>
                {defaultAddress.receiverPhone || '연락처 정보 없음'}
              </p>
            </>
          )}

          <p className={styles.addrText}>
            {addressText || '배송지를 선택해주세요'}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              '/client/pages/shopping-cart/delivery-payment/address-list'
            )
          }
          className={styles.secondaryBtn}
        >
          배송지 변경
        </button>
      </div>
    </section>
  );
}

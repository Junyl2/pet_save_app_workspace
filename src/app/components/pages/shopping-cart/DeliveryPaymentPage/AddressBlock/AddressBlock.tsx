'use client';
import styles from '../DeliveryPayment.module.css';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DeliveryAddressService } from '@/app/api/services/client/memberService/member-information/deliveryAddressService';

export default function AddressBlock() {
  const router = useRouter();
  const [addressText, setAddressText] = useState('');

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await DeliveryAddressService.getDeliveryAddresses();
        if (response?.data?.success && Array.isArray(response.data.data)) {
          const addresses = response.data.data;
          const defaultAddress = addresses.find((addr) => addr.default);
          const useAddress =
            defaultAddress ||
            addresses.find((a) => a.roadAddress && a.detailedAddress);
          if (useAddress) {
            setAddressText(
              `${useAddress.roadAddress} ${useAddress.detailedAddress}`.trim()
            );
          } else {
            setAddressText('');
          }
        } else {
          setAddressText('');
        }
      } catch {
        setAddressText('');
      }
    };
    fetchAddress();
  }, []);

  return (
    <section className={styles.card}>
      <h3 className={styles.sectionSubTitle}>배송지 정보</h3>
      <div className={styles.addressBlock}>
        <div>
          <p className={styles.addrName}>펫세이브 (temporary)</p>
          <p className={styles.addrPhone}>010-1234-4567 (temporary)</p>
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

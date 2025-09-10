import styles from '../DeliveryPayment.module.css';
import { useRouter } from 'next/navigation';

export default function AddressBlock() {
  const router = useRouter();

  return (
    <section className={styles.card}>
      <h3 className={styles.sectionSubTitle}>배송지 정보</h3>
      <div className={styles.addressBlock}>
        <div>
          <p className={styles.addrName}>펫세이브</p>
          <p className={styles.addrPhone}>010-1234-4567</p>
          <p className={styles.addrText}>서울특별시 중구 양심대로 407 5층</p>
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

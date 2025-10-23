import { OrderItem } from '@/app/components/types/order';
import Image from 'next/image';
import styles from './OrderHistoryItem.module.css';
import { FiChevronRight } from 'react-icons/fi'; // ← added
import { useRouter } from 'next/navigation';
import { PAGE_URLS } from '@/app/utils/page_url';

interface OrderHistoryItemProps {
  orderId: string;
  orderNumber: string;
  status: string; // e.g. "배송중", "픽업 완료"
  date: string; // e.g. "2025.07.28"
  item: OrderItem;
}

export default function OrderHistoryItem({
  orderId,
  orderNumber,
  status,
  date,
  item,
}: OrderHistoryItemProps) {
  const { product, quantity } = item;
  const router = useRouter();

  const handleDetailClick = (orderId: string) => {
    router.push(PAGE_URLS.ORDER_DETAILS(orderId));
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.status}>{status}</span>
        <button
          className={styles.detailButton}
          onClick={() => handleDetailClick(orderId)}
        >
          상세보기 <FiChevronRight className={styles.icon} />
        </button>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.imageWrapper}>
          <Image
            src={product.image ?? '/placeholder.png'}
            alt={product.name}
            width={80}
            height={80}
            className={styles.image}
          />
        </div>

        <div className={styles.details}>
          <p className={styles.orderNumber}>주문번호: {orderNumber}</p>
          <p className={styles.name}>{product.name}</p>
          {product.brand && <p className={styles.brand}>{product.brand}</p>}
          <p className={styles.price}>
            {(product.discountPrice ?? product.price).toLocaleString()}원 ·{' '}
            {quantity}개
          </p>
          <p className={styles.date}>{date}</p>
        </div>
      </div>
    </div>
  );
}

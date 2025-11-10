'use client';

import { OrderItem } from '@/app/components/types/order';
import Image from 'next/image';
import styles from './OrderHistoryItem.module.css';
import { FiChevronRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { PAGE_URLS } from '@/app/utils/page_url';

interface OrderHistoryItemProps {
  orderItemId: string;
  orderNumber: string;
  status: string;
  date: string;
  item: OrderItem & { orderId?: string };
}

export default function OrderHistoryItem({
  orderItemId,
  orderNumber,
  status,
  date,
  item,
}: OrderHistoryItemProps) {
  const { product, quantity } = item;
  const router = useRouter();

  const handleDetailClick = (): void => {
    // Navigate to order detail - when user goes back, router.back() will return to this page
    // with the same URL params since they're already in the URL
    router.push(PAGE_URLS.ORDER_DETAILS(orderItemId));
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.status}>{status}</span>
        <button className={styles.detailButton} onClick={handleDetailClick}>
          상세보기 <FiChevronRight className={styles.icon} />
        </button>
      </div>

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

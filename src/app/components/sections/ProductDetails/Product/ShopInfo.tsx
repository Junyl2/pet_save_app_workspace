'use client';

import Image from 'next/image';
import styles from './ShopInfo.module.css';
import { useFavorites } from '@/app/context/FavoritesContext';
import { useRouter } from 'next/navigation';

interface ShopInfoProps {
  shopName?: string;
  shopLocation?: string;
  shopImage?: string;
  productId: number;
  sellerId?: number;
}

export const ShopInfo = ({
  shopName,
  shopLocation,
  shopImage,
  productId,
  sellerId = 1,
}: ShopInfoProps) => {
  const { toggleFavorite, isFavorited } = useFavorites();
  const isProductFavorited = isFavorited(productId.toString());
  const router = useRouter();

  const handleShopClick = () => {
    router.push(`/seller-details/${sellerId}`);
  };

  return (
    <div className={styles.shopHeader}>
      <div
        className={styles.shopDetails}
        onClick={handleShopClick}
        style={{ cursor: 'pointer' }}
      >
        {shopImage && (
          <Image
            src={shopImage}
            alt={shopName || '판매처'}
            width={50}
            height={50}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
        <div className={styles.shopInfo}>
          <h2 className={styles.hospital}>
            <strong>{shopName || '판매처 없음'}</strong>
          </h2>
          <p className={styles.location}>{shopLocation}</p>
        </div>
      </div>

      <button
        onClick={async () => await toggleFavorite(productId.toString())}
        className={styles.favoriteWrapper}
      >
        <Image
          src={
            isProductFavorited
              ? '/images/products/heart-active.png'
              : '/images/products/heart-default.png'
          }
          alt="Heart Icon"
          width={24}
          height={22}
        />
      </button>
    </div>
  );
};

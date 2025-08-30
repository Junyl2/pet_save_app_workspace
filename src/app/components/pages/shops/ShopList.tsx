'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { shopService } from '@/app/api/services/shops/shopService';
import { Shop } from '@/app/api/types/shops/shops';
import styles from './ShopList.module.css';
import { FaPhone } from 'react-icons/fa6';
import { ContactDrawer } from '../../ui/drawer/ContactDrawer/ContactDrawer';
import TopBar from '../../sections/TopBar/TopBar';
import SearchState from '../../ui/SearchResult/SearchState';
import ProductSkeleton from '../../ui/SkeletonLoading/ProductSkeleton/ProductSkeleton';

export default function ShopList() {
  const [shops] = useState<Shop[]>(shopService.getAll());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShopPhone, setSelectedShopPhone] = useState<string | null>(
    null
  );
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const router = useRouter();

  const filteredShops = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return shops;

    return shops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(term) ||
        shop.location.toLowerCase().includes(term)
    );
  }, [shops, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSearchSubmitted(true);
  };

  const handlePhoneClick = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    setSelectedShopPhone(phone);
  };

  const handleCloseDrawer = () => setSelectedShopPhone(null);
  const handleCardClick = (shopId: number) =>
    router.push(`/seller-details/${shopId}`);

  const isEmptySearch = !searchTerm.trim() && searchSubmitted;
  const noMatches = !!searchTerm.trim() && filteredShops.length === 0;

  if (!shops) return <ProductSkeleton count={5} />;

  return (
    <>
      <TopBar onSearch={handleSearch} />

      <div className={styles.container}>
        {isEmptySearch ? (
          <SearchState
            imageSrc="/images/products/noresult.png"
            altText="검색어 입력 필요"
            message="검색어를 입력해주세요."
          />
        ) : noMatches ? (
          <SearchState
            imageSrc="/images/products/noresult.png"
            altText="검색된 상점 없음"
            message="검색된 상점이 없습니다."
          />
        ) : (
          <div className={styles.list}>
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className={styles.shopCard}
                onClick={() => handleCardClick(shop.id)}
              >
                <button
                  className={styles.phoneButton}
                  onClick={(e) => handlePhoneClick(e, shop.phoneNumber)}
                >
                  <FaPhone size={22} color="#66BFA7" className={styles.phone} />
                </button>

                <Image
                  src={shop.image}
                  alt={shop.name}
                  width={80}
                  height={80}
                  className={styles.shopImage}
                />
                <div className={styles.shopInfo}>
                  <h3 className={styles.shopName}>{shop.name}</h3>
                  <p className={styles.shopLocation}>{shop.location}</p>
                  <p className={styles.shopDistance}>{shop.distance}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedShopPhone && <ContactDrawer onClose={handleCloseDrawer} />}
      </div>
    </>
  );
}

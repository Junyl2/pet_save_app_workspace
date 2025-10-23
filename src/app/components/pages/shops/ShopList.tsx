'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AddressService } from '@/app/api/services/client/addressService/addressService';
import { NearbyStoreInfo } from '@/app/api/types/stores/nearby';
import styles from './ShopList.module.css';
import { FaPhone } from 'react-icons/fa6';
import { ContactDrawer } from '../../ui/drawer/ContactDrawer/ContactDrawer';
import TopBar from '../../sections/TopBar/TopBar';
import SearchState from '../../ui/SearchResult/SearchState';
import NearbySkeleton from '../../ui/SkeletonLoading/NearbySkeleton/NearbySkeleton';
import SellerPanel from '../../seller-components/SellerPanel/SellerPanel';
import businessDefaultProfile from '@/app/constats/businessDefaultProfile';

// Optional fields that sometimes exist on store objects
type NearbyStoreWithOptional = NearbyStoreInfo &
  Partial<{
    businessPhone: string;
    phone: string;
    contactNumber: string;
    businessProfileImage: string;
  }>;

type AddressSearchResponse = {
  stores: NearbyStoreInfo[];
};

function isAddressSearchResponse(data: unknown): data is AddressSearchResponse {
  if (typeof data !== 'object' || data === null) return false;
  const stores = (data as { stores?: unknown }).stores;
  return Array.isArray(stores);
}

export default function ShopList() {
  const [stores, setStores] = useState<NearbyStoreInfo[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShopPhone, setSelectedShopPhone] = useState<string | null>(
    null
  );

  // Only keep active state hooks
  const [locationError, setLocationError] = useState<string | null>(null);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState<string | null>(
    null
  );

  const [imageErrorByStore, setImageErrorByStore] = useState<
    Record<string, boolean>
  >({});
  const router = useRouter();

  // ---------- Helpers ----------
  const getFallbackPhone = (store: NearbyStoreWithOptional) =>
    store.businessPhone ||
    store.phone ||
    store.contactNumber ||
    store.businessEmail ||
    '02-1234-5678';

  const getStoreImageSrc = (store: NearbyStoreWithOptional) => {
    const fallback = businessDefaultProfile.image;
    if (imageErrorByStore[store.storeId]) return fallback;
    const src = store.businessProfileImage ?? fallback;
    return typeof src === 'string' && src.trim() ? src : fallback;
  };

  const handleImageError = useCallback((storeId: string) => {
    setImageErrorByStore((prev) => ({ ...prev, [storeId]: true }));
  }, []);

  const formatDistance = (km?: number) =>
    typeof km === 'number' && !Number.isNaN(km)
      ? `${km.toFixed(1)}km`
      : '거리 정보 없음';

  // ---------- Address search ----------
  const handleAddressSearch = async (addressKeyword: string) => {
    if (!addressKeyword.trim()) {
      setAddressSearchError('주소를 입력해주세요.');
      return;
    }

    console.log('🔍 Starting address search:', addressKeyword);
    setAddressSearchLoading(true);
    setAddressSearchError(null);
    setStores([]);
    setHasSearched(true);

    try {
      const result = await AddressService.searchAddressAndNearbyStores(
        addressKeyword,
        10,
        0,
        20
      );

      if (result.error) {
        console.error('❌ Address search failed:', result.error);
        setAddressSearchError(result.error);
      } else if (isAddressSearchResponse(result.data)) {
        console.log('✅ Address search successful:', result.data);
        setStores(result.data.stores);
        setSearchTerm('');
      } else {
        setAddressSearchError('예상치 못한 응답 형식입니다.');
      }
    } catch (error) {
      console.error('💥 Address search error:', error);
      setAddressSearchError('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setAddressSearchLoading(false);
    }
  };

  // ---------- On mount ----------
  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.geolocation) {
      console.log('📍 Geolocation is not supported by this browser');
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
  }, []);

  // ---------- Filtering ----------
  const filteredStores = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return stores;
    return stores.filter(
      (store) =>
        store.businessName?.toLowerCase().includes(term) ||
        store.roadAddress?.toLowerCase().includes(term)
    );
  }, [stores, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) void handleAddressSearch(term);
  };

  const handlePhoneClick = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    setSelectedShopPhone(phone);
  };

  const handleCloseDrawer = () => setSelectedShopPhone(null);
  const handleCardClick = (storeId: string) =>
    router.push(`/seller-details/${storeId}`);

  const isEmptySearch = !hasSearched && !searchTerm.trim();
  const noMatches = hasSearched && filteredStores.length === 0;
  const isLoading = addressSearchLoading;

  return (
    <>
      <TopBar onSearch={handleSearch} />

      {(locationError || addressSearchError) && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            margin: '10px',
            textAlign: 'center',
          }}
        >
          <p
            style={{ margin: '0 0 10px 0', color: '#721c24', fontSize: '14px' }}
          >
            ❌ {locationError || addressSearchError}
          </p>
        </div>
      )}

      {isLoading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <NearbySkeleton count={3} />
        </div>
      )}

      <div className={styles.container}>
        {filteredStores.length > 0 ? (
          <div className={styles.list}>
            {filteredStores.map((store) => {
              const s = store as NearbyStoreWithOptional;
              const phone = getFallbackPhone(s);
              const imgSrc = getStoreImageSrc(s);
              return (
                <div
                  key={store.storeId}
                  className={styles.shopCard}
                  onClick={() => handleCardClick(store.storeId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      handleCardClick(store.storeId);
                  }}
                >
                  <button
                    className={styles.phoneButton}
                    onClick={(e) => handlePhoneClick(e, phone)}
                    aria-label="연락처 보기"
                    type="button"
                  >
                    <FaPhone size={22} className={styles.phone} />
                  </button>

                  <Image
                    src={imgSrc}
                    alt={store.businessName || '상점 이미지'}
                    width={95}
                    height={95}
                    className={styles.shopImage}
                    onError={() => handleImageError(store.storeId)}
                  />

                  <div className={styles.shopInfo}>
                    <h3 className={styles.shopName}>{store.businessName}</h3>
                    <p className={styles.shopLocation}>{store.roadAddress}</p>
                    <p className={styles.shopDistance}>
                      {formatDistance(store.distanceKm)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : isEmptySearch ? (
          <SearchState
            imageSrc="/images/products/noresult.png"
            altText="주소 검색 필요"
            message="주소를 검색하거나 현재 위치 버튼을 눌러주세요."
          />
        ) : noMatches ? (
          <SearchState
            imageSrc="/images/products/noresult.png"
            altText="검색된 상점 없음"
            message="검색된 상점이 없습니다."
          />
        ) : null}

        <SellerPanel />
        {selectedShopPhone && <ContactDrawer onClose={handleCloseDrawer} />}
      </div>
    </>
  );
}

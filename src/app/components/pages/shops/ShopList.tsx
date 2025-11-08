'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { StoreService } from '@/app/api/services/client/storeService/storeService';
import { NearbyStoreInfo } from '@/app/api/types/stores/nearby';
import styles from './ShopList.module.css';
import { FaPhone } from 'react-icons/fa6';
import { ContactDrawer } from '../../ui/drawer/ContactDrawer/ContactDrawer';
import TopBar from '../../sections/TopBar/TopBar';
import SearchState from '../../ui/SearchResult/SearchState';
import NearbySkeleton from '../../ui/SkeletonLoading/NearbySkeleton/NearbySkeleton';
import SellerPanel from '../../seller-components/SellerPanel/SellerPanel';
import businessDefaultProfile from '@/app/constats/businessDefaultProfile';

type NearbyStoreWithOptional = NearbyStoreInfo &
  Partial<{
    businessPhone: string;
    phone: string;
    contactNumber: string;
    businessProfileImage: string;
  }>;

export default function ShopList() {
  const [stores, setStores] = useState<NearbyStoreInfo[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShopPhone, setSelectedShopPhone] = useState<string | null>(
    null
  );
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState<string | null>(
    null
  );
  const [imageErrorByStore, setImageErrorByStore] = useState<
    Record<string, boolean>
  >({});
  const router = useRouter();

  // Load location data & refetch automatically when locationChanged
  useEffect(() => {
    const loadSelectedLocation = () => {
      const savedLocation = localStorage.getItem('selectedLocation');
      const savedLat = localStorage.getItem('selectedLocationLat');
      const savedLong = localStorage.getItem('selectedLocationLong');

      if (savedLocation) setSelectedLocation(savedLocation);
      if (savedLat && savedLong) {
        const newLat = parseFloat(savedLat);
        const newLong = parseFloat(savedLong);
        setLatitude(newLat);
        setLongitude(newLong);
      }
    };

    loadSelectedLocation();

    // whenever TopBar updates location, trigger reload
    window.addEventListener('locationChanged', loadSelectedLocation);

    return () => {
      window.removeEventListener('locationChanged', loadSelectedLocation);
    };
  }, []);

  // Automatically fetch nearby stores when location updates (send lat/long saved from localStorage)
  useEffect(() => {
    if (latitude == null || longitude == null) return;

    const fetchNearbyStores = async () => {
      setAddressSearchLoading(true);
      setAddressSearchError(null);

      try {
        const response = await StoreService.searchNearbyStores({
          keyword: '',
          lat: latitude,
          long: longitude,
          radius: 10,
          page: 0,
          size: 20,
        });

        if (response.error) {
          setAddressSearchError(response.error);
          setStores([]);
        } else if (response.data?.data?.content?.length) {
          setStores(response.data.data.content);
          setHasSearched(true);
          setAddressSearchError(null);
        } else {
          setStores([]);
          setHasSearched(true);
          setAddressSearchError('현재 위치 주변 상점이 없습니다.');
        }
      } catch (error) {
        console.error('Error fetching nearby stores:', error);
        setAddressSearchError('현재 위치 주변 상점을 불러오지 못했습니다.');
      } finally {
        setAddressSearchLoading(false);
      }
    };

    fetchNearbyStores();
  }, [latitude, longitude]);

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

  // Search nearby stores by keyword and coordinates (using localStorage lat/long)
  const handleAddressSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      setAddressSearchError('주소를 입력해주세요.');
      return;
    }

    setAddressSearchLoading(true);
    setAddressSearchError(null);
    setStores([]);
    setHasSearched(true);

    try {
      // Always read fresh lat/long from localStorage to ensure latest location from TopBar
      const savedLat = localStorage.getItem('selectedLocationLat');
      const savedLong = localStorage.getItem('selectedLocationLong');
      const lat = savedLat ? parseFloat(savedLat) : latitude;
      const long = savedLong ? parseFloat(savedLong) : longitude;

      if (lat == null || long == null) {
        setAddressSearchError('위치 정보가 없습니다.');
        return;
      }

      const response = await StoreService.searchNearbyStores({
        keyword,
        lat,
        long,
        radius: 10,
        page: 0,
        size: 20,
      });

      if (response.error) {
        setAddressSearchError(response.error);
      } else if (response.data?.data?.content?.length) {
        setStores(response.data.data.content);
        setAddressSearchError(null);
      } else {
        setStores([]);
        setAddressSearchError(null);
      }
    } catch (error) {
      setAddressSearchError('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setAddressSearchLoading(false);
    }
  };

  // Initialize geolocation availability
  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.geolocation) {
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
  }, []);

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
          <p style={{ margin: 0, color: '#721c24', fontSize: '14px' }}>
            {locationError || addressSearchError}
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
        ) : addressSearchLoading ? null : hasSearched ? (
          <SearchState
            imageSrc="/images/products/noresult.png"
            altText="검색된 상점 없음"
            message="선택한 위치에 매장이 없습니다."
          />
        ) : (
          <SearchState
            imageSrc="/images/products/noresult.png"
            altText="주소 검색 필요"
            message="주소를 검색하거나 현재 위치 버튼을 눌러주세요."
          />
        )}

        <SellerPanel />
        {selectedShopPhone && <ContactDrawer onClose={handleCloseDrawer} />}
      </div>
    </>
  );
}

'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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

const PAGE_SIZE = 20;

export default function ShopList() {
  const [stores, setStores] = useState<NearbyStoreInfo[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
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

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState<string>('');
  const observerTarget = useRef<HTMLDivElement | null>(null);
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

    window.addEventListener('locationChanged', loadSelectedLocation);
    return () => {
      window.removeEventListener('locationChanged', loadSelectedLocation);
    };
  }, []);

  // Load page function for infinite scroll
  const loadPage = useCallback(
    async (
      page: number,
      keyword: string,
      lat: number,
      long: number,
      isInitialLoad: boolean = false
    ) => {
      if (isLoadingMore && page > 0) return;

      if (isInitialLoad) {
        setAddressSearchLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setAddressSearchError(null);

      try {
        const response = await StoreService.searchNearbyStores({
          keyword,
          lat,
          long,
          radius: 10,
          page,
          size: PAGE_SIZE,
        });

        if (response.error) {
          setAddressSearchError(response.error);
          if (isInitialLoad) {
            setStores([]);
          }
          setHasMore(false);
        } else if (response.data?.data?.content?.length) {
          const newStores = response.data.data.content;
          if (page === 0) {
            setStores(newStores);
          } else {
            setStores((prev) => [...prev, ...newStores]);
          }
          setHasMore(response.data.data.pageInfo?.hasNext ?? false);
          if (isInitialLoad) {
            setHasSearched(true);
            setAddressSearchError(null);
          }
        } else {
          if (isInitialLoad) {
            setStores([]);
            setHasSearched(true);
            setAddressSearchError('현재 위치 주변 상점이 없습니다.');
          }
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching nearby stores:', error);
        if (isInitialLoad) {
          setAddressSearchError('현재 위치 주변 상점을 불러오지 못했습니다.');
        }
        setHasMore(false);
      } finally {
        setAddressSearchLoading(false);
        setIsLoadingMore(false);
      }
    },
    [isLoadingMore]
  );

  // Automatically fetch nearby stores when location updates
  useEffect(() => {
    if (latitude == null || longitude == null) return;

    setCurrentPage(0);
    setStores([]);
    setHasMore(true);
    setCurrentKeyword('');
    void loadPage(0, '', latitude, longitude, true);
  }, [latitude, longitude]); // Don't include loadPage to avoid re-fetching

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

  // Search nearby stores by keyword
  const handleAddressSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      setAddressSearchError('주소를 입력해주세요.');
      return;
    }

    setAddressSearchError(null);
    setStores([]);
    setHasSearched(true);
    setCurrentPage(0);
    setHasMore(true);
    setCurrentKeyword(keyword);

    try {
      const savedLat = localStorage.getItem('selectedLocationLat');
      const savedLong = localStorage.getItem('selectedLocationLong');
      const lat = savedLat ? parseFloat(savedLat) : latitude;
      const long = savedLong ? parseFloat(savedLong) : longitude;

      if (lat == null || long == null) {
        setAddressSearchError('위치 정보가 없습니다.');
        return;
      }

      void loadPage(0, keyword, lat, long, true);
    } catch (error) {
      setAddressSearchError('주소 검색 중 오류가 발생했습니다.');
    }
  };

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

  // Infinite scroll observer
  useEffect(() => {
    if (
      !hasMore ||
      isLoadingMore ||
      addressSearchLoading ||
      latitude == null ||
      longitude == null
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !addressSearchLoading
        ) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          const savedLat = localStorage.getItem('selectedLocationLat');
          const savedLong = localStorage.getItem('selectedLocationLong');
          const lat = savedLat ? parseFloat(savedLat) : latitude;
          const long = savedLong ? parseFloat(savedLong) : longitude;

          if (lat != null && long != null) {
            void loadPage(nextPage, currentKeyword, lat, long, false);
          }
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [
    hasMore,
    isLoadingMore,
    addressSearchLoading,
    currentPage,
    currentKeyword,
    latitude,
    longitude,
    loadPage,
  ]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) void handleAddressSearch(term);
  };

  const handlePhoneClick = (e: React.MouseEvent, storeId: string) => {
    e.stopPropagation();
    setSelectedStoreId(storeId);
  };

  const handleCloseDrawer = () => setSelectedStoreId(null);

  const handleCardClick = (storeId: string) =>
    router.push(`/seller-details/${storeId}`);

  const isEmptySearch = !hasSearched && !searchTerm.trim();
  const noMatches = hasSearched && filteredStores.length === 0;
  const isLoading = addressSearchLoading;

  return (
    <>
      <TopBar onSearch={handleSearch} />

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
                    onClick={(e) => handlePhoneClick(e, store.storeId)}
                    aria-label="연락처 보기"
                    type="button"
                  >
                    <FaPhone size={22} className={styles.phone} />
                  </button>

                  <img
                    src={imgSrc}
                    alt={store.businessName || '상점 이미지'}
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

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div
                ref={observerTarget}
                style={{ height: '20px', width: '100%' }}
              />
            )}

            {/* Loading indicator for loading more */}
            {isLoadingMore && (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <NearbySkeleton count={2} />
              </div>
            )}
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
        {selectedStoreId && (
          <ContactDrawer
            storeId={selectedStoreId}
            onClose={handleCloseDrawer}
          />
        )}
      </div>
    </>
  );
}

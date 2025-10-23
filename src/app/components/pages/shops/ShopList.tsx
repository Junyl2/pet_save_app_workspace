'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  StoreService,
  LocationCoordinates,
} from '@/app/api/services/client/storeService/storeService';
import { AddressService } from '@/app/api/services/client/addressService/addressService';
import { NearbyStoreInfo } from '@/app/api/types/stores/nearby';
import styles from './ShopList.module.css';
import { FaPhone } from 'react-icons/fa6';
import { ContactDrawer } from '../../ui/drawer/ContactDrawer/ContactDrawer';
import TopBar from '../../sections/TopBar/TopBar';
import SearchState from '../../ui/SearchResult/SearchState';
import ProductSkeleton from '../../ui/SkeletonLoading/ProductSkeleton/ProductSkeleton';
import SellerPanel from '../../seller-components/SellerPanel/SellerPanel';

export default function ShopList() {
  const [stores, setStores] = useState<NearbyStoreInfo[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShopPhone, setSelectedShopPhone] = useState<string | null>(
    null
  );
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<LocationCoordinates | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState<string | null>(
    null
  );
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);

  const router = useRouter();

  // Function to get current location and search nearby stores
  const handleCurrentLocationSearch = async () => {
    console.log('🔘 Button clicked! Starting location search...');
    setLocationLoading(true);
    setLocationError(null);
    setStores([]);
    setSearchedAddress(null);
    setHasSearched(true);

    try {
      console.log('📍 Testing basic geolocation...');
      if (!navigator.geolocation) {
        setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
        return;
      }

      console.log('📍 Requesting location...');

      // Get current location
      const locationResult = await StoreService.getCurrentLocation();

      if (locationResult.error) {
        console.error('❌ Location access failed:', locationResult.error);
        let errorMessage: string;

        switch (locationResult.error) {
          case 'PERMISSION_DENIED':
            errorMessage =
              '위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
            break;
          case 'POSITION_UNAVAILABLE':
            errorMessage =
              '위치 정보를 가져올 수 없습니다. GPS가 활성화되어 있는지 확인해주세요.';
            break;
          case 'TIMEOUT':
            errorMessage =
              '위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.';
            break;
          case 'UNKNOWN_ERROR':
            errorMessage = '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';
            break;
          default:
            errorMessage = '위치 정보를 가져오는 중 오류가 발생했습니다.';
        }

        setLocationError(errorMessage);
        return;
      }

      if (!locationResult.data) {
        console.error('❌ No location data received');
        setLocationError('위치 정보를 가져올 수 없습니다.');
        return;
      }

      // Set the current location
      setCurrentLocation(locationResult.data);
      console.log('✅ Current location obtained:', locationResult.data);

      // Now search for nearby stores
      const result = await StoreService.searchNearbyStoresWithCurrentLocation({
        radius: 10, // 10km radius
        page: 0,
        size: 20,
      });

      if (result.error) {
        console.error('❌ Nearby stores search failed:', result.error);
        setLocationError(result.error);
      } else if (result.data) {
        console.log('✅ Nearby stores found:', result.data);
        setStores(result.data.data?.content || []);
      }
    } catch (error) {
      console.error('💥 Current location search error:', error);
      setLocationError('현재 위치를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Function to search address and get nearby stores
  const handleAddressSearch = async (addressKeyword: string) => {
    if (!addressKeyword.trim()) {
      setAddressSearchError('주소를 입력해주세요.');
      return;
    }

    console.log('🔍 Starting address search:', addressKeyword);
    setAddressSearchLoading(true);
    setAddressSearchError(null);
    setStores([]);
    setSearchedAddress(null);
    setCurrentLocation(null);
    setLocationError(null);
    setHasSearched(true);

    try {
      const result = await AddressService.searchAddressAndNearbyStores(
        addressKeyword,
        10, // 10km radius
        0, // page
        20 // size
      );

      if (result.error) {
        console.error('❌ Address search failed:', result.error);
        setAddressSearchError(result.error);
      } else if (result.data) {
        console.log('✅ Address search successful:', result.data);
        setSearchedAddress(result.data.address);
        setCurrentLocation(result.data.coordinates);
        setStores(result.data.stores);
        // Clear the search term after successful address search to show all stores
        setSearchTerm('');
        console.log('🔍 Stores set after address search:', {
          storesCount: result.data.stores.length,
          searchedAddress: result.data.address,
          searchTermCleared: true,
        });
      }
    } catch (error) {
      console.error('💥 Address search error:', error);
      setAddressSearchError('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setAddressSearchLoading(false);
    }
  };

  // Check if geolocation is supported when component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log('📍 Geolocation is not supported by this browser');
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
  }, []);

  const filteredStores = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    console.log('🔍 Filtering stores:', {
      term,
      searchedAddress,
      storesLength: stores.length,
      hasSearched,
      addressSearchLoading,
    });

    // If no search term, show all stores
    if (!term) {
      console.log('🔍 No search term, returning all stores');
      return stores;
    }

    // Filter stores based on the search term
    const filtered = stores.filter(
      (store) =>
        store.businessName?.toLowerCase().includes(term) ||
        store.roadAddress?.toLowerCase().includes(term)
    );

    console.log('🔍 Filtered stores by search term:', {
      originalCount: stores.length,
      filteredCount: filtered.length,
      term,
    });

    return filtered;
  }, [stores, searchTerm]);

  const handleSearch = (term: string) => {
    console.log('🔍 handleSearch called with term:', term);
    setSearchTerm(term);
    setSearchSubmitted(true);
    // Trigger address search when user searches
    if (term.trim()) {
      handleAddressSearch(term);
    }
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
  const isLoading = loading || locationLoading || addressSearchLoading;

  // Debug logging
  console.log('🔍 ShopList render state:', {
    hasSearched,
    searchTerm,
    storesLength: stores.length,
    filteredStoresLength: filteredStores.length,
    isEmptySearch,
    noMatches,
    isLoading,
  });

  return (
    <>
      <TopBar onSearch={handleSearch} />

      {/* Error Banners */}
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

      {/* Loading State */}
      {isLoading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <ProductSkeleton count={3} />
        </div>
      )}

      <button
        className={styles.currentBtn}
        onClick={handleCurrentLocationSearch}
        disabled={locationLoading}
        style={{
          cursor: locationLoading ? 'not-allowed' : 'pointer',
          opacity: locationLoading ? 0.6 : 1,
          backgroundColor: '#66bfa7',
          color: 'white',
          padding: '12px 20px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          margin: '10px 0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
        }}
      >
        <Image
          src="/images/icons/mage_location.png"
          alt="Location Icon"
          height={16}
          width={16}
          style={{ objectFit: 'contain' }}
        />
        {locationLoading ? '위치 검색 중...' : '현재위치로 찾기'}
      </button>

      <div className={styles.container}>
        {/* Always show store cards if we have stores */}
        {filteredStores.length > 0 ? (
          <div className={styles.list}>
            {filteredStores.map((store) => (
              <div
                key={store.storeId}
                className={styles.shopCard}
                onClick={() => handleCardClick(store.storeId)}
              >
                <button
                  className={styles.phoneButton}
                  onClick={(e) =>
                    handlePhoneClick(e, store.businessEmail || '02-1234-5678')
                  }
                >
                  <FaPhone size={22} color="#66BFA7" className={styles.phone} />
                </button>

                <Image
                  src="/images/shops/shop1.png"
                  alt={store.businessName}
                  width={80}
                  height={80}
                  className={styles.shopImage}
                />
                <div className={styles.shopInfo}>
                  <h3 className={styles.shopName}>{store.businessName}</h3>
                  <p className={styles.shopLocation}>{store.roadAddress}</p>
                  <p className={styles.shopDistance}>
                    {store.distanceKm
                      ? `${store.distanceKm.toFixed(1)}km`
                      : '거리 정보 없음'}
                  </p>
                </div>
              </div>
            ))}
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

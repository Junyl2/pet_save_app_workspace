'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { shopService } from '@/app/api/services/shops/shopService';
import { Shop } from '@/app/api/types/shops/shops';
import {
  StoreService,
  LocationCoordinates,
} from '@/app/api/services/client/storeService/storeService';
import styles from './ShopList.module.css';
import { FaPhone } from 'react-icons/fa6';
import { ContactDrawer } from '../../ui/drawer/ContactDrawer/ContactDrawer';
import TopBar from '../../sections/TopBar/TopBar';
import SearchState from '../../ui/SearchResult/SearchState';
import ProductSkeleton from '../../ui/SkeletonLoading/ProductSkeleton/ProductSkeleton';
import SellerPanel from '../../seller-components/SellerPanel/SellerPanel';

export default function ShopList() {
  const [shops, setShops] = useState<Shop[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShopPhone, setSelectedShopPhone] = useState<string | null>(
    null
  );
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<LocationCoordinates | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  // Interface for nearby store data from API
  interface NearbyStore {
    storeId: string;
    storeName: string;
    roadAddress: string;
    businessName: string;
    distance?: number;
  }

  const [nearbyStores, setNearbyStores] = useState<NearbyStore[] | null>(null);

  const router = useRouter();

  // Function to get current location and search nearby stores
  const handleCurrentLocationSearch = async () => {
    console.log('🔘 Button clicked! Starting location search...');
    setLocationLoading(true);
    setLocationError(null);
    setNearbyStores(null);

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
        setNearbyStores(result.data.data?.content || []);
      }
    } catch (error) {
      console.error('💥 Current location search error:', error);
      setLocationError('현재 위치를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      // Simulate async fetch (if shopService.getAll is sync, wrap it in Promise.resolve)
      const data = await Promise.resolve(shopService.getAll());
      setShops(data);
      setLoading(false);
    };

    fetchShops();
  }, []);

  // Check if geolocation is supported when component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log('📍 Geolocation is not supported by this browser');
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
  }, []);

  const filteredShops = useMemo(() => {
    // If we have nearby stores from location search, show them instead of mock data
    if (nearbyStores && nearbyStores.length > 0) {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return nearbyStores;

      return nearbyStores.filter(
        (store: NearbyStore) =>
          store.storeName?.toLowerCase().includes(term) ||
          store.roadAddress?.toLowerCase().includes(term) ||
          store.businessName?.toLowerCase().includes(term)
      );
    }

    // Fallback to original mock data
    if (!shops) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return shops;

    return shops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(term) ||
        shop.location.toLowerCase().includes(term)
    );
  }, [shops, searchTerm, nearbyStores]);

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

  if (loading) return <ProductSkeleton count={5} />;

  return (
    <>
      <TopBar onSearch={handleSearch} />

      {/* Location Error Banner - Only show if there's an error */}
      {locationError && (
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
            ❌ {locationError}
          </p>
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
        {/* Location Status */}
        {(currentLocation || locationError || nearbyStores) && (
          <div style={{ padding: '10px', textAlign: 'center' }}>
            {currentLocation && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  fontSize: '14px',
                }}
              >
                📍 현재 위치: {currentLocation.lat.toFixed(6)},{' '}
                {currentLocation.long.toFixed(6)}
              </div>
            )}

            {locationError && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  fontSize: '14px',
                }}
              >
                ❌ {locationError}
              </div>
            )}

            {nearbyStores && nearbyStores.length > 0 && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#d1ecf1',
                  color: '#0c5460',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  fontSize: '14px',
                }}
              >
                ✅ 주변 상점 {nearbyStores.length}개 발견
              </div>
            )}
          </div>
        )}

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
            {filteredShops.map((shop) => {
              // Handle both mock data and real API data
              const isApiData = nearbyStores && nearbyStores.length > 0;
              const shopId = isApiData
                ? (shop as NearbyStore).storeId
                : (shop as Shop).id;
              const shopName = isApiData
                ? (shop as NearbyStore).storeName
                : (shop as Shop).name;
              const shopLocation = isApiData
                ? (shop as NearbyStore).roadAddress
                : (shop as Shop).location;
              const shopDistance = isApiData
                ? `${(shop as NearbyStore).distance?.toFixed(1)}km`
                : (shop as Shop).distance;
              const shopImage = isApiData
                ? '/images/shops/shop1.png'
                : (shop as Shop).image; // Default image for API data
              const shopPhone = isApiData
                ? '02-1234-5678'
                : (shop as Shop).phoneNumber; // Default phone for API data

              return (
                <div
                  key={isApiData ? shopId : shopId}
                  className={styles.shopCard}
                  onClick={() => handleCardClick(Number(shopId))}
                >
                  <button
                    className={styles.phoneButton}
                    onClick={(e) => handlePhoneClick(e, shopPhone)}
                  >
                    <FaPhone
                      size={22}
                      color="#66BFA7"
                      className={styles.phone}
                    />
                  </button>

                  <Image
                    src={shopImage}
                    alt={shopName}
                    width={80}
                    height={80}
                    className={styles.shopImage}
                  />
                  <div className={styles.shopInfo}>
                    <h3 className={styles.shopName}>{shopName}</h3>
                    <p className={styles.shopLocation}>{shopLocation}</p>
                    <p className={styles.shopDistance}>{shopDistance}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <SellerPanel />

        {selectedShopPhone && <ContactDrawer onClose={handleCloseDrawer} />}
      </div>
    </>
  );
}

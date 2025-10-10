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
  const [nearbyStores, setNearbyStores] = useState<any[] | null>(null);

  const router = useRouter();

  // Function to get current location and search nearby stores
  const handleCurrentLocationSearch = async () => {
    setLocationLoading(true);
    setLocationError(null);
    setNearbyStores(null);

    try {
      console.log('📍 Getting current location and searching nearby stores...');

      // First, try to get current location
      const locationResult = await StoreService.getCurrentLocation();

      if (locationResult.error) {
        console.error('❌ Location access failed:', locationResult.error);
        setLocationError(locationResult.error);
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

  // Check location permission status when component mounts
  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          console.log('📍 Geolocation is not supported by this browser');
          setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
          return;
        }

        // Check if we already have permission by trying to get current position
        // This will trigger the permission dialog if not already granted
        console.log('📍 Checking location permission...');
        const locationResult = await StoreService.getCurrentLocation();

        if (locationResult.data) {
          console.log(
            '✅ Location permission already granted, coordinates:',
            locationResult.data
          );
          setCurrentLocation(locationResult.data);
        } else if (locationResult.error === 'PERMISSION_DENIED') {
          console.log('📍 Location permission denied by user');
          setLocationError(
            '위치 접근 권한이 필요합니다. "현재위치로 찾기" 버튼을 클릭하여 권한을 허용해주세요.'
          );
        } else {
          console.log('📍 Location error:', locationResult.error);
          setLocationError('위치 정보를 가져올 수 없습니다.');
        }
      } catch (error) {
        console.error('💥 Location permission check error:', error);
        setLocationError('위치 서비스 확인 중 오류가 발생했습니다.');
      }
    };

    checkLocationPermission();
  }, []);

  const filteredShops = useMemo(() => {
    // If we have nearby stores from location search, show them instead of mock data
    if (nearbyStores && nearbyStores.length > 0) {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return nearbyStores;

      return nearbyStores.filter(
        (store: any) =>
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

      {/* Location Permission Request Banner */}
      {!currentLocation && !locationLoading && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            margin: '10px',
            textAlign: 'center',
          }}
        >
          <p
            style={{ margin: '0 0 10px 0', color: '#1976d2', fontSize: '14px' }}
          >
            📍 주변 상점을 찾기 위해 위치 접근 권한이 필요합니다
          </p>
          <button
            onClick={handleCurrentLocationSearch}
            disabled={locationLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: locationLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            {locationLoading ? '위치 검색 중...' : '위치 권한 허용하기'}
          </button>
        </div>
      )}

      <button
        className={styles.currentBtn}
        onClick={handleCurrentLocationSearch}
        disabled={locationLoading}
      >
        <Image
          src="/images/icons/mage_location.png"
          alt="Location Icon"
          height={16}
          width={16}
          className="object-contain"
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
            {filteredShops.map((shop, index) => {
              // Handle both mock data and real API data
              const isApiData = nearbyStores && nearbyStores.length > 0;
              const shopId = isApiData
                ? (shop as any).storeId
                : (shop as Shop).id;
              const shopName = isApiData
                ? (shop as any).storeName
                : (shop as Shop).name;
              const shopLocation = isApiData
                ? (shop as any).roadAddress
                : (shop as Shop).location;
              const shopDistance = isApiData
                ? `${(shop as any).distance?.toFixed(1)}km`
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
                  onClick={() => handleCardClick(shopId)}
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

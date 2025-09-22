'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { shopService } from '@/app/api/services/shops/shopService';
import { Shop } from '@/app/api/types/shops/shops';
import { StoreService } from '@/app/api/services/client/storeService/storeService';
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
  const [testingAPI, setTestingAPI] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);

  const router = useRouter();

  // Test function for nearby stores API
  const testNearbyStoresAPI = async () => {
    setTestingAPI(true);
    setApiTestResult(null);

    try {
      console.log('🧪 Testing nearby stores API...');
      const response = await StoreService.testNearbyStoresAPI();

      if (response.error) {
        console.error('❌ API Test Failed:', response.error);
        setApiTestResult(`❌ API Test Failed: ${response.error}`);
      } else {
        console.log('✅ API Test Successful:', response.data);
        const storeCount = response.data?.data?.totalElements || 0;
        setApiTestResult(
          `✅ API Test Successful! Found ${storeCount} stores nearby.`
        );
      }
    } catch (error) {
      console.error('💥 API Test Error:', error);
      setApiTestResult(`💥 API Test Error: ${error}`);
    } finally {
      setTestingAPI(false);
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

  const filteredShops = useMemo(() => {
    if (!shops) return [];
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

  if (loading) return <ProductSkeleton count={5} />;

  return (
    <>
      <TopBar onSearch={handleSearch} />

      {/*   <button className={styles.currentBtn}>
        <Image
          src="/images/icons/mage_location.png"
          alt="Location Icon"
          height={16}
          width={16}
          className="object-contain"
        />
        현재위치로 찾기
      </button> */}

      <div className={styles.container}>
        {/* API Test Button */}
        <div style={{ padding: '10px', textAlign: 'center' }}>
          <button
            onClick={testNearbyStoresAPI}
            disabled={testingAPI}
            style={{
              padding: '10px 20px',
              backgroundColor: testingAPI ? '#ccc' : '#66bfa7',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: testingAPI ? 'not-allowed' : 'pointer',
              marginBottom: '10px',
            }}
          >
            {testingAPI ? 'Testing API...' : 'Test Nearby Stores API'}
          </button>
          {apiTestResult && (
            <div
              style={{
                padding: '10px',
                backgroundColor: apiTestResult.includes('✅')
                  ? '#d4edda'
                  : '#f8d7da',
                color: apiTestResult.includes('✅') ? '#155724' : '#721c24',
                borderRadius: '5px',
                marginTop: '10px',
                fontSize: '14px',
              }}
            >
              {apiTestResult}
            </div>
          )}
        </div>

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
        <SellerPanel />

        {selectedShopPhone && <ContactDrawer onClose={handleCloseDrawer} />}
      </div>
    </>
  );
}

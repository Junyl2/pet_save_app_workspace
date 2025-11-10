'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

import styles from './styles.module.css';
import { AddressService } from '@/app/api/services/client/addressService/addressService';
import { AddressSearchResult } from '@/app/api/types/address/addressSearch';

/* type Location = {
  id: number;
  name: string;
  district: string;
  city: string;
  province: string;
};
 */
export default function LocationPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressSearchResult[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);

  // Fetch initial popular locations on page load
  useEffect(() => {
    const fetchInitialLocations = async () => {
      setIsLoading(true);
      try {
        // Search for popular areas in Seoul to show initial suggestions
        const response = await AddressService.searchAddressByKeyword(
          '서울',
          1,
          15
        );

        if (response.data?.documents) {
          setAddresses(response.data.documents);
        } else if (response.error) {
          console.error('Error fetching initial locations:', response.error);
          toast.error('주소를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('Error fetching initial locations:', error);
        toast.error('주소를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialLocations();
  }, []);

  // Search addresses by keyword with request throttling
  const searchAddresses = useCallback(
    async (keyword: string) => {
      const now = Date.now();
      const timeSinceLastSearch = now - lastSearchTime;

      // Throttle requests - minimum 1 second between requests
      if (timeSinceLastSearch < 1000) {
        console.log('⏱️ Request throttled - too soon since last search');
        return;
      }

      if (!keyword.trim()) {
        // If search is empty, show initial locations
        const response = await AddressService.searchAddressByKeyword(
          '서울',
          1,
          15
        );
        if (response.data?.documents) {
          setAddresses(response.data.documents);
        }
        return;
      }

      setIsSearching(true);
      setLastSearchTime(now);

      try {
        console.log('🔍 Searching addresses for:', keyword);
        const response = await AddressService.searchAddressByKeyword(
          keyword.trim(),
          1,
          15
        );

        if (response.data?.documents) {
          setAddresses(response.data.documents);
          console.log(
            '✅ Address search successful:',
            response.data.documents.length,
            'results'
          );
        } else if (response.error) {
          console.error('❌ Error searching addresses:', response.error);
          toast.error('주소 검색에 실패했습니다.');
        }
      } catch (error) {
        console.error('💥 Error searching addresses:', error);
        toast.error('주소 검색에 실패했습니다.');
      } finally {
        setIsSearching(false);
      }
    },
    [lastSearchTime]
  );

  // Handle search input change with improved debouncing
  useEffect(() => {
    // Skip search if already searching, if search term is too short, or if loading
    if (isSearching || isLoading || search.trim().length < 2) {
      return;
    }

    const timeoutId = setTimeout(() => {
      searchAddresses(search);
    }, 500); // Increased to 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [search, searchAddresses, isSearching, isLoading]);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Create a simple address object for current location without API call
      const currentLocationAddress: AddressSearchResult = {
        address_name: `현재 위치 (${latitude.toFixed(4)}, ${longitude.toFixed(
          4
        )})`,
        y: latitude.toString(),
        x: longitude.toString(),
        address_type: 'ROAD',
        address: {
          address_name: `현재 위치 (${latitude.toFixed(4)}, ${longitude.toFixed(
            4
          )})`,
          region_1depth_name: '',
          region_2depth_name: '',
          region_3depth_name: '',
          region_3depth_h_name: '',
          h_code: '',
          b_code: '',
          mountain_yn: '',
          main_address_no: '',
          sub_address_no: '',
          x: longitude.toString(),
          y: latitude.toString(),
        },
        road_address: {
          address_name: `현재 위치 (${latitude.toFixed(4)}, ${longitude.toFixed(
            4
          )})`,
          region_1depth_name: '',
          region_2depth_name: '',
          region_3depth_name: '',
          road_name: '',
          underground_yn: '',
          main_building_no: '',
          sub_building_no: '',
          building_name: '',
          zone_no: '',
          x: longitude.toString(),
          y: latitude.toString(),
        },
      };

      // Store the current location coordinates in localStorage
      localStorage.setItem('selectedLocationLat', latitude.toString());
      localStorage.setItem('selectedLocationLong', longitude.toString());
      localStorage.setItem('selectedLocation', '현재 위치');

      // Dispatch custom event to notify TopBar of location change
      window.dispatchEvent(new CustomEvent('locationChanged'));

      setAddresses([currentLocationAddress]);
      setSearch('');
      toast.success('현재 위치를 찾았습니다.');

      // Navigate back to homepage after a short delay
      setTimeout(() => {
        router.push('/client/pages/homepage');
      }, 1000);
    } catch (error) {
      console.error('Error getting current location:', error);
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('위치 접근 권한이 거부되었습니다.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('위치 정보를 사용할 수 없습니다.');
            break;
          case error.TIMEOUT:
            toast.error('위치 정보 요청이 시간 초과되었습니다.');
            break;
          default:
            toast.error('위치 정보를 가져올 수 없습니다.');
        }
      } else {
        toast.error('현재 위치를 찾을 수 없습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Handle address selection
  const handleAddressSelect = useCallback(
    (address: AddressSearchResult) => {
      // Console log the latitude and longitude
      const lat = parseFloat(address.y);
      const long = parseFloat(address.x);
      console.log('📍 Selected address coordinates:', {
        address: address.address_name,
        roadAddress: address.road_address?.address_name,
        latitude: lat,
        longitude: long,
        lat: lat,
        long: long,
      });

      // Format address for display (first 2 parts)
      const addressParts =
        address.road_address?.address_name?.split(' ') ||
        address.address_name?.split(' ') ||
        [];
      const formattedAddress = addressParts.slice(0, 2).join(' ');

      // Store selected address and coordinates in localStorage
      localStorage.setItem('selectedLocation', formattedAddress);
      localStorage.setItem('selectedLocationLat', lat.toString());
      localStorage.setItem('selectedLocationLong', long.toString());

      // Dispatch custom event to notify TopBar of location change
      window.dispatchEvent(new CustomEvent('locationChanged'));

      // Navigate back to homepage
      router.back();
    },
    [router]
  );

  return (
    <>
      <div className={styles.headerWrapper}>
        {/* Back button */}
        <div className={styles.header}>
          <button
            className={styles.backBtn}
            onClick={() => router.push('/client/pages/homepage')}
          >
            <FaChevronLeft className={styles.backIcon} />
          </button>
        </div>

        {/* Search input with icon */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              placeholder="동명(읍, 면)으로 검색해 주세요"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <CiSearch className={styles.searchIcon} />
          </div>
          <button
            className={styles.currentBtn}
            onClick={getCurrentLocation}
            disabled={isLoading}
          >
            <Image
              src="/images/icons/mage_location.png"
              alt="Location Icon"
              height={16}
              width={16}
              className="object-contain"
            />
            현재위치로 찾기
          </button>
        </div>
      </div>

      <div className={styles.container}>
        {/* Locations list */}
        <ul className={styles.locationList}>
          {isLoading && (
            <li className={styles.loadingItem}>주소를 불러오는 중...</li>
          )}
          {isSearching && !isLoading && (
            <li className={styles.loadingItem}>검색 중...</li>
          )}
          {!isLoading &&
            !isSearching &&
            addresses.map((address, index) => (
              <li
                key={`${
                  address.road_address?.address_name || address.address_name
                }-${index}`}
                className={styles.locationItem}
                onClick={() => handleAddressSelect(address)}
              >
                <div className={styles.addressItem}>
                  <strong>
                    {address.road_address?.address_name || address.address_name}
                  </strong>
                  {address.road_address?.zone_no && (
                    <span className={styles.zipCode}>
                      ({address.road_address.zone_no})
                    </span>
                  )}
                </div>
                {address.road_address?.region_1depth_name &&
                  address.road_address?.region_2depth_name && (
                    <div className={styles.addressDetail}>
                      {address.road_address.region_1depth_name}{' '}
                      {address.road_address.region_2depth_name}
                      {address.road_address.region_3depth_name &&
                        ` ${address.road_address.region_3depth_name}`}
                    </div>
                  )}
              </li>
            ))}
          {!isLoading && !isSearching && addresses.length === 0 && (
            <li className={styles.noResults}>검색 결과가 없습니다.</li>
          )}
        </ul>
      </div>
    </>
  );
}

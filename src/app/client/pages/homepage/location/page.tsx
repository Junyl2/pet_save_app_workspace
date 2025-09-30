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

  // Search addresses by keyword
  const searchAddresses = useCallback(async (keyword: string) => {
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
    try {
      const response = await AddressService.searchAddressByKeyword(
        keyword.trim(),
        1,
        15
      );

      if (response.data?.documents) {
        setAddresses(response.data.documents);
      } else if (response.error) {
        console.error('Error searching addresses:', response.error);
        toast.error('주소 검색에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      toast.error('주소 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchAddresses(search);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [search, searchAddresses]);

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

      // Search for address using coordinates
      const response = await AddressService.searchZipCodeByCoordinates(
        longitude,
        latitude
      );

      if (response.data?.documents && response.data.documents.length > 0) {
        const currentAddress = response.data.documents[0];
        // Convert ZipCodeSearchResult to AddressSearchResult format
        const convertedAddress: AddressSearchResult = {
          address_name:
            currentAddress.road_address?.address_name ||
            currentAddress.address?.address_name ||
            '',
          y: currentAddress.road_address?.y || currentAddress.address?.y || '',
          x: currentAddress.road_address?.x || currentAddress.address?.x || '',
          address_type: 'ROAD',
          address: currentAddress.address || {
            address_name: '',
            region_1depth_name: '',
            region_2depth_name: '',
            region_3depth_name: '',
            region_3depth_h_name: '',
            h_code: '',
            b_code: '',
            mountain_yn: '',
            main_address_no: '',
            sub_address_no: '',
            x: '',
            y: '',
          },
          road_address: currentAddress.road_address || {
            address_name: '',
            region_1depth_name: '',
            region_2depth_name: '',
            region_3depth_name: '',
            road_name: '',
            underground_yn: '',
            main_building_no: '',
            sub_building_no: '',
            building_name: '',
            zone_no: '',
            x: '',
            y: '',
          },
        };
        setAddresses([convertedAddress]);
        setSearch('');
        toast.success('현재 위치를 찾았습니다.');
      } else if (response.error) {
        console.error('Error getting current location:', response.error);
        toast.error('현재 위치를 찾을 수 없습니다.');
      }
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
  }, []);

  // Handle address selection
  const handleAddressSelect = useCallback(
    (address: AddressSearchResult) => {
      // Format address for display (first 2 parts)
      const addressParts =
        address.road_address?.address_name?.split(' ') ||
        address.address_name?.split(' ') ||
        [];
      const formattedAddress = addressParts.slice(0, 2).join(' ');

      // Store selected address in localStorage
      localStorage.setItem('selectedLocation', formattedAddress);

      // Dispatch custom event to notify TopBar of location change
      window.dispatchEvent(new CustomEvent('locationChanged'));

      // Navigate back to homepage
      router.push('/client/pages/homepage');
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
              placeholder="Bonvolu serĉi la saman nomon (urbeto, vilaĝo)"
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
            {isLoading ? '위치 찾는 중...' : '현재위치로 찾기'}
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

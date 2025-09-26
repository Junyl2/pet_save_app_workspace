'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { CiSearch, CiClock2 } from 'react-icons/ci';
import { FaChevronDown, FaChevronLeft } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import styles from './TopBar.module.css';
import { TopIcons } from '../../ui/TopIcons/TopIcons';
import { PAGE_URLS } from '@/app/utils/page_url';
import { useUser } from '@/app/context/userContext';
import { SearchHistoryService } from '@/app/api/services/client/searchHistoryService/searchHistoryService';
import { SearchHistoryItem } from '@/app/api/types/searchHistory/searchHistory';

type TopBarProps = {
  onSearch?: (term: string) => void;
};

export default function TopBar({ onSearch }: TopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const isLoggedIn = !!user;

  const router = useRouter();
  const pathname = usePathname();

  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  /** Format address to show only first 2 parts */
  const formatAddress = useCallback((address: string): string => {
    if (!address) return '';
    const parts = address.split(' ');
    return parts.slice(0, 2).join(' ');
  }, []);

  /** Load selected location from localStorage */
  const loadSelectedLocation = useCallback(() => {
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }
  }, []);

  /** Determine storage key based on path */
  const getStorageKey = useCallback(() => {
    return pathname === '/shops'
      ? 'searchHistoryShops'
      : 'searchHistoryProducts';
  }, [pathname]);

  /** Load history from API */
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        setLoadingHistory(true);
        console.log('Loading search history from API...');

        // First check if there's any search history at all
        console.log('Checking search history count...');
        const countResponse =
          await SearchHistoryService.getSearchHistoryCount();
        console.log('Search history count response:', countResponse);

        // Try getRecentSearches first
        let response = await SearchHistoryService.getRecentSearches();
        console.log('Search history API response (recent):', response);

        // If recent searches doesn't work, try the main getSearchHistory method
        if (
          response.error ||
          !response.data?.data ||
          response.data.data.length === 0
        ) {
          console.log('Trying main getSearchHistory method...');
          const mainResponse = await SearchHistoryService.getSearchHistory({
            page: 0,
            size: 10,
            sortBy: 'searchedAt',
            direction: 'desc',
          });
          console.log('Main search history response:', mainResponse);

          if (!mainResponse.error && mainResponse.data?.data) {
            response = mainResponse;
          }
        }

        // If recent searches is empty, try distinct keywords
        if (
          !response.error &&
          (!response.data?.data || response.data.data.length === 0)
        ) {
          console.log('Recent searches empty, trying distinct keywords...');
          const keywordsResponse =
            await SearchHistoryService.getDistinctKeywords();
          console.log('Keywords API response:', keywordsResponse);

          if (!keywordsResponse.error && keywordsResponse.data?.data) {
            // Convert keywords to search history format
            const keywords = Array.isArray(keywordsResponse.data.data)
              ? keywordsResponse.data.data
              : [];
            const mockHistory = keywords.map((keyword, index) => ({
              id: `keyword-${index}`,
              keyword: keyword,
              searchedAt: new Date().toISOString(),
            }));
            console.log('Converted keywords to history:', mockHistory);
            setHistory(mockHistory);
            return;
          }
        }

        if (response.error) {
          console.error('Failed to load search history:', response.error);
          // Fallback to localStorage if API fails
          const stored = localStorage.getItem(getStorageKey());
          if (stored) setHistory(JSON.parse(stored));
        } else {
          // Extract the actual data array from the API response
          console.log('Full response.data structure:', response.data);
          console.log('response.data.data:', response.data?.data);
          console.log('response.data.data type:', typeof response.data?.data);
          console.log(
            'response.data.data isArray:',
            Array.isArray(response.data?.data)
          );

          const historyData = response.data?.data || response.data || [];
          console.log('Extracted history data:', historyData);
          console.log('History data length:', historyData.length);

          setHistory(Array.isArray(historyData) ? historyData : []);
        }
      } catch (error) {
        console.error('Error loading search history:', error);
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem(getStorageKey());
        if (stored) setHistory(JSON.parse(stored));
      } finally {
        setLoadingHistory(false);
      }
    };

    loadSearchHistory();
  }, [getStorageKey]);

  /** Load selected location on component mount */
  useEffect(() => {
    loadSelectedLocation();
  }, [loadSelectedLocation]);

  /** Listen for storage changes to update selected location */
  useEffect(() => {
    const handleStorageChange = () => {
      loadSelectedLocation();
    };

    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom location change events from the same tab
    window.addEventListener('locationChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('locationChanged', handleStorageChange);
    };
  }, [loadSelectedLocation]);

  /** Save search term - API handles this automatically on search submission */
  const saveHistory = useCallback((term: string) => {
    if (!term) return;
    // API automatically saves search history on submission
    // We just need to refresh the local state
    const loadSearchHistory = async () => {
      try {
        const response = await SearchHistoryService.getRecentSearches();
        if (!response.error) {
          // Extract the actual data array from the API response
          const historyData = response.data?.data || response.data || [];
          setHistory(Array.isArray(historyData) ? historyData : []);
        }
      } catch (error) {
        console.error('Error refreshing search history:', error);
      }
    };
    loadSearchHistory();
  }, []);

  /** Submit search */
  const submitSearch = useCallback(() => {
    const term = inputValue.trim();
    if (!term) {
      toast.error('검색어를 입력해주세요.');
      return;
    }

    saveHistory(term);

    if (onSearch) {
      onSearch(term);
    } else {
      const searchPath =
        pathname === '/shops'
          ? `/shops/search?query=${encodeURIComponent(term)}`
          : `/client/pages/products/search?query=${encodeURIComponent(term)}`;
      router.push(searchPath);
    }

    setInputValue('');
    inputRef.current?.blur();
    setShowHistory(false);
  }, [inputValue, pathname, router, onSearch, saveHistory]);

  const handleBack = () => {
    // If we're on a search page, go back to homepage
    if (pathname.startsWith('/products/search')) {
      router.push('/client/pages/homepage');
    } else {
      router.back();
    }
  };

  /** Handle Enter safely for Korean/Japanese IME */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submitSearch();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch();
  };

  /** Select from history */
  const handleSelectHistory = (term: string) => {
    setInputValue(term);
    if (onSearch) onSearch(term);
    else {
      const searchPath = `/client/pages/products/search?query=${encodeURIComponent(
        term
      )}`;
      router.push(searchPath);
    }
    inputRef.current?.blur();
    setShowHistory(false);
  };

  /** Delete one item */
  const handleDeleteItem = async (keyword: string) => {
    try {
      const response = await SearchHistoryService.deleteKeyword(keyword);
      if (response.error) {
        console.error('Failed to delete keyword:', response.error);
        toast.error('검색어 삭제에 실패했습니다.');
      } else {
        // Refresh the history list
        const refreshResponse = await SearchHistoryService.getRecentSearches();
        if (!refreshResponse.error) {
          // Extract the actual data array from the API response
          const historyData =
            refreshResponse.data?.data || refreshResponse.data || [];
          setHistory(Array.isArray(historyData) ? historyData : []);
        }
      }
    } catch (error) {
      console.error('Error deleting keyword:', error);
      toast.error('검색어 삭제 중 오류가 발생했습니다.');
    }
  };

  /** Delete all */
  const handleClearAll = async () => {
    try {
      const response = await SearchHistoryService.clearSearchHistory();
      if (response.error) {
        console.error('Failed to clear search history:', response.error);
        toast.error('검색 기록 삭제에 실패했습니다.');
      } else {
        setHistory([]);
        toast.success('검색 기록이 삭제되었습니다.');
      }
    } catch (error) {
      console.error('Error clearing search history:', error);
      toast.error('검색 기록 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleFocus = () => {
    console.log('Search input focused, showing history dropdown');
    console.log('Current history:', history);
    console.log(
      'History length:',
      Array.isArray(history) ? history.length : 'Not an array'
    );
    console.log('Loading history:', loadingHistory);
    setShowHistory(true);
  };
  const handleBlur = () => setTimeout(() => setShowHistory(false), 200);

  const isShoplist = pathname.startsWith('/shops');

  return (
    <header
      className={
        pathname === '/shops'
          ? styles.shopTopBar
          : pathname === '/shopping-cart'
          ? styles.shoppingCartTopbar
          : styles.topbar
      }
    >
      <div className={styles.inner}>
        {/* Logo / Back / Location */}
        <div className={styles.logoWrapper}>
          {pathname === '/client/pages/homepage' ? (
            isLoggedIn ? (
              <div
                className={styles.userLocation}
                onClick={() => router.push('/client/pages/homepage/location')}
              >
                <span>{selectedLocation || '내 위치 선택'}</span>
                <FaChevronDown className={styles.dropdownIcon} />
              </div>
            ) : (
              <Image
                src="/images/logo/pet-saves.png"
                alt="Pet Save Logo"
                width={60}
                height={40}
                className="object-contain"
              />
            )
          ) : (
            <button
              onClick={handleBack}
              className={styles.backButton}
              aria-label="뒤로 가기"
            >
              <FaChevronLeft className={styles.backIcon} />
            </button>
          )}
        </div>

        <TopIcons />
      </div>

      {/* Search */}

      {pathname !== PAGE_URLS.SHOPPING_CART &&
        pathname !== PAGE_URLS.ORDER_CONFIRMATION && (
          <div className={styles.searchWrapper}>
            <form onSubmit={handleSubmit} className={styles.searchForm}>
              <button
                type="submit"
                aria-label="검색"
                className={styles.searchButton}
              >
                <CiSearch className={styles.searchIcon} />
              </button>
              <input
                ref={inputRef}
                type="search"
                placeholder={
                  pathname === '/shops'
                    ? '동명(읍, 면)으로 검색해주세요'
                    : '검색어를 입력해 주세요'
                }
                className={styles.searchInput}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                enterKeyHint="search"
              />
            </form>

            {showHistory && (
              <div
                className={
                  pathname === '/shops'
                    ? styles.shopHistoryDropdown
                    : styles.historyDropdown
                }
              >
                <div className={styles.historyHeader}>
                  <span className={styles.historyTitle}>최근 검색어</span>
                  <button
                    type="button"
                    className={styles.clearAllBtn}
                    onClick={handleClearAll}
                  >
                    전체 삭제
                  </button>
                </div>

                {loadingHistory ? (
                  <div className={styles.historyItem}>
                    <div className={styles.historyContent}>
                      <span>검색 기록을 불러오는 중...</span>
                    </div>
                  </div>
                ) : history.length > 0 ? (
                  history.map((item) => (
                    <div key={item.id} className={styles.historyItem}>
                      <div
                        className={styles.historyContent}
                        onClick={() => handleSelectHistory(item.keyword)}
                      >
                        <div className={styles.historyLeft}>
                          <CiClock2 className={styles.historyIcon} />
                          <span className={styles.historyTerm}>
                            {item.keyword}
                          </span>
                        </div>

                        <div className={styles.historyRight}>
                          <span className={styles.historyTime}>
                            {new Date(item.searchedAt).toLocaleDateString(
                              'ko-KR'
                            )}
                          </span>
                          <button
                            type="button"
                            className={styles.historyDelete}
                            onClick={() => handleDeleteItem(item.keyword)}
                          >
                            <IoClose />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.historyItem}>
                    <div className={styles.historyContent}>
                      <span>최근 검색 기록이 없습니다.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {isShoplist && (
              <button className={styles.currentBtn}>
                <Image
                  src="/images/icons/mage_location.png"
                  alt="Location Icon"
                  height={16}
                  width={16}
                  className="object-contain"
                />
                현재위치로 찾기
              </button>
            )}
          </div>
        )}
    </header>
  );
}

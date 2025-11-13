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
import { AddressService } from '@/app/api/services/client/addressService/addressService';

type TopBarProps = {
  onSearch?: (term: string) => void;
};

export default function TopBar({ onSearch }: TopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const isLoggedIn = !!user;

  const router = useRouter();
  const pathname = usePathname();

  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [locationLoaded, setLocationLoaded] = useState<boolean>(false);
  const [shopKeywords, setShopKeywords] = useState<string[]>([]);

  /** Helpers */
  const isShoplist = pathname.startsWith('/shops');
  const isHomepage = pathname.startsWith('/client/pages/homepage');

  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null;

  const normalizeHistory = useCallback((raw: unknown): SearchHistoryItem[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((item: unknown, index: number): SearchHistoryItem => {
      if (typeof item === 'string') {
        return {
          id: `keyword-${index}`,
          keyword: item,
          searchedAt: new Date().toISOString(),
        };
      }
      if (isRecord(item)) {
        const id = typeof item.id === 'string' ? item.id : `item-${index}`;
        const keyword = typeof item.keyword === 'string' ? item.keyword : '';
        const searchedAt =
          typeof item.searchedAt === 'string'
            ? item.searchedAt
            : new Date().toISOString();
        return { id, keyword, searchedAt };
      }
      return {
        id: `item-${index}`,
        keyword: '',
        searchedAt: new Date().toISOString(),
      };
    });
  }, []);

  const formatAddress = useCallback((address: string): string => {
    if (!address) return '';
    const parts = address.split(' ');
    return parts.slice(0, 2).join(' ');
  }, []);

  const loadSelectedLocation = useCallback(() => {
    const savedLocation = localStorage.getItem('selectedLocation');
    const savedLat = localStorage.getItem('selectedLocationLat');
    const savedLong = localStorage.getItem('selectedLocationLong');

    if (savedLocation) {
      setSelectedLocation(savedLocation);
      if (savedLat && savedLong) {
        console.log('📍 coords', {
          address: savedLocation,
          latitude: parseFloat(savedLat),
          longitude: parseFloat(savedLong),
        });
      }
    }
    setLocationLoaded(true);
  }, []);

  const getStorageKey = useCallback(() => {
    return pathname === '/shops'
      ? 'searchHistoryShops'
      : 'searchHistoryProducts';
  }, [pathname]);

  /** Load history */
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        setLoadingHistory(true);
        if (pathname === '/shops' || !isLoggedIn) {
          setHistory([]);
          return;
        }

        await SearchHistoryService.getSearchHistoryCount();
        let response = await SearchHistoryService.getRecentSearches();

        if (
          response.error ||
          !response.data?.data ||
          !Array.isArray(response.data.data) ||
          response.data.data.length === 0
        ) {
          const mainResponse = await SearchHistoryService.getSearchHistory({
            page: 0,
            size: 10,
            sortBy: 'searchedAt',
            direction: 'desc',
          });
          if (!mainResponse.error && mainResponse.data?.data) {
            response = mainResponse;
          }
        }

        if (
          !response.error &&
          (!response.data?.data ||
            !Array.isArray(response.data.data) ||
            response.data.data.length === 0)
        ) {
          const keywordsResponse =
            await SearchHistoryService.getDistinctKeywords();

          if (!keywordsResponse.error && keywordsResponse.data?.data) {
            const keywords = Array.isArray(keywordsResponse.data.data)
              ? keywordsResponse.data.data
              : [];
            const mockHistory: SearchHistoryItem[] = keywords.map(
              (keyword, index) => ({
                id: `keyword-${index}`,
                keyword,
                searchedAt: new Date().toISOString(),
              })
            );
            setHistory(mockHistory);
            return;
          }
        }

        if (response.error) {
          console.error('Failed to load search history:', response.error);
          const stored = localStorage.getItem(getStorageKey());
          if (stored) setHistory(normalizeHistory(JSON.parse(stored)));
        } else {
          const rawData = response.data?.data || response.data || [];
          setHistory(normalizeHistory(rawData));
        }
      } catch (error) {
        console.error('Error loading search history:', error);
        const stored = localStorage.getItem(getStorageKey());
        if (stored) setHistory(normalizeHistory(JSON.parse(stored)));
      } finally {
        setLoadingHistory(false);
      }
    };

    loadSearchHistory();
  }, [getStorageKey, isLoggedIn, pathname, normalizeHistory]);

  useEffect(() => {
    if (isShoplist) {
      const stored = localStorage.getItem('shopSearchKeywords');
      setShopKeywords(stored ? JSON.parse(stored) : []);
    }
  }, [isShoplist, showHistory]);

  // Listen for search history deletion events from WrongTermSearchHistory
  useEffect(() => {
    const handleSearchHistoryDeleted = (e: CustomEvent) => {
      const keyword = e.detail?.keyword;
      if (keyword) {
        // Refresh history to reflect deletion
        const loadSearchHistory = async () => {
          try {
            if (pathname === '/shops' || !isLoggedIn) {
              return;
            }
            const refreshResponse = await SearchHistoryService.getRecentSearches();
            if (!refreshResponse.error) {
              const raw = refreshResponse.data?.data || refreshResponse.data || [];
              setHistory(normalizeHistory(raw));
            }
          } catch (error) {
            console.error('Error refreshing search history:', error);
          }
        };
        loadSearchHistory();
      }
    };

    const handleSearchHistoryCleared = () => {
      // Refresh history to reflect clearing
      const loadSearchHistory = async () => {
        try {
          if (pathname === '/shops' || !isLoggedIn) {
            setHistory([]);
            return;
          }
          const refreshResponse = await SearchHistoryService.getRecentSearches();
          if (!refreshResponse.error) {
            const raw = refreshResponse.data?.data || refreshResponse.data || [];
            setHistory(normalizeHistory(raw));
          } else {
            setHistory([]);
          }
        } catch (error) {
          console.error('Error refreshing search history:', error);
          setHistory([]);
        }
      };
      loadSearchHistory();
    };

    window.addEventListener('searchHistoryDeleted', handleSearchHistoryDeleted as EventListener);
    window.addEventListener('searchHistoryCleared', handleSearchHistoryCleared);

    return () => {
      window.removeEventListener('searchHistoryDeleted', handleSearchHistoryDeleted as EventListener);
      window.removeEventListener('searchHistoryCleared', handleSearchHistoryCleared);
    };
  }, [isLoggedIn, pathname, normalizeHistory]);

  useEffect(() => {
    loadSelectedLocation();
  }, [loadSelectedLocation]);

  useEffect(() => {
    if (showHistory) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showHistory]);

  useEffect(() => {
    const handleStorageChange = () => {
      loadSelectedLocation();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('locationChanged', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('locationChanged', handleStorageChange);
    };
  }, [loadSelectedLocation]);

  /** Save history */
  const saveHistory = useCallback(
    (term: string) => {
      if (!term?.trim()) return;
      if (!isLoggedIn || pathname === '/shops') return;

      (async () => {
        try {
          const addRes = await SearchHistoryService.addCurrentUserSearch(term);
          if (addRes.error) {
            console.error(
              '[TopBar] Failed to add search history:',
              addRes.error
            );
            return;
          }

          const refresh = await SearchHistoryService.getRecentSearches();
          if (!refresh.error) {
            const raw = refresh.data?.data || refresh.data || [];
            setHistory(normalizeHistory(raw));
          } else {
            console.error('[TopBar] Failed to refresh history:', refresh.error);
          }
        } catch (err) {
          console.error('[TopBar] Error saving search history:', err);
        }
      })();
    },
    [isLoggedIn, pathname, normalizeHistory]
  );

  /** Submit search */
  const submitSearch = useCallback(async () => {
    const term = inputValue.trim();

    if (pathname === '/shops') {
      const stored = localStorage.getItem('shopSearchKeywords');
      const keywords = stored ? JSON.parse(stored) : [];
      const updated = [
        term,
        ...keywords.filter((k: string) => k !== term),
      ].slice(0, 10);
      localStorage.setItem('shopSearchKeywords', JSON.stringify(updated));
      setShopKeywords(updated);
    }

    if (!term) {
      toast.error('검색어를 입력해주세요.', { id: 'empty-search-toast' });
      return;
    }

    if (pathname === '/shops') {
      try {
        const response = await AddressService.searchAddressByKeywordAlternative(
          {
            keyword: term,
            currentPage: 1,
            countPerPage: 10,
          }
        );

        if (response.error) {
          console.error('[TopBar] Address search failed:', response.error);
        } else {
          console.log('[TopBar] Address search success (POST):', response.data);
        }
      } catch (error) {
        console.error('[TopBar] Address search POST error:', error);
      }
    } else {
      saveHistory(term);
    }

    if (isShoplist) {
      const stored = localStorage.getItem('shopSearchKeywords');
      const keywords = stored ? JSON.parse(stored) : [];
      const updated = [
        term,
        ...keywords.filter((k: string) => k !== term),
      ].slice(0, 10);
      localStorage.setItem('shopSearchKeywords', JSON.stringify(updated));
    }

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
  }, [inputValue, pathname, router, onSearch, saveHistory, isShoplist]);

  const handleBack = () => {
    if (pathname.startsWith('/products/search')) {
      router.push('/client/pages/homepage');
    } else {
      router.back();
    }
  };

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

  const handleDeleteItem = async (
    e: React.MouseEvent<HTMLButtonElement>,
    keyword: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Also delete from WrongTermSearchHistory
    const wrongTermStorageKey = 'wrongTermSearchHistory';
    const wrongTermStored = localStorage.getItem(wrongTermStorageKey);
    if (wrongTermStored) {
      try {
        const parsed = JSON.parse(wrongTermStored);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (item: any) => item.keyword !== keyword
          );
          localStorage.setItem(wrongTermStorageKey, JSON.stringify(filtered));
          // Dispatch event to notify WrongTermSearchHistory component
          window.dispatchEvent(new Event('wrongTermHistoryUpdated'));
        }
      } catch (error) {
        console.error('Failed to update wrongTermSearchHistory:', error);
      }
    }

    try {
      const response = await SearchHistoryService.deleteKeyword(keyword);
      if (response.error) {
        console.error('Failed to delete keyword:', response.error);
        toast.error('검색어 삭제에 실패했습니다.');
      } else {
        const refreshResponse = await SearchHistoryService.getRecentSearches();
        if (!refreshResponse.error) {
          const raw = refreshResponse.data?.data || refreshResponse.data || [];
          setHistory(normalizeHistory(raw));
        }
      }
    } catch (error) {
      console.error('Error deleting keyword:', error);
      toast.error('검색어 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleClearAll = async () => {
    // Also clear WrongTermSearchHistory
    const wrongTermStorageKey = 'wrongTermSearchHistory';
    localStorage.removeItem(wrongTermStorageKey);
    // Dispatch event to notify WrongTermSearchHistory component
    window.dispatchEvent(new Event('wrongTermHistoryUpdated'));

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

  const handleFocus = () => setShowHistory(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if the new focus target is within the dropdown
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (
      dropdownRef.current &&
      relatedTarget &&
      dropdownRef.current.contains(relatedTarget)
    ) {
      return; // Don't close if clicking inside dropdown
    }
    setTimeout(() => setShowHistory(false), 200);
  };

  return (
    <header
      className={
        pathname === '/shops'
          ? styles.shopTopBar
          : pathname === '/shopping-cart'
          ? styles.shoppingCartTopbar
          : pathname === '/client/seller/pages/seller-product-list'
          ? styles.sellerTopBar
          : pathname ===
            '/client/seller/pages/seller-product-list/refund-request'
          ? styles.sellerTopBar
          : styles.topbar
      }
    >
      <div className={styles.inner}>
        <div className={styles.logoWrapper}>
          {pathname === '/client/pages/homepage' ||
          pathname === '/shops' ||
          pathname ===
            '/client/seller/pages/seller-product-list/refund-request' ||
          pathname === '/client/seller/pages/seller-product-list' ? (
            isLoggedIn ? (
              <div
                className={styles.userLocation}
                onClick={() => router.push('/client/pages/homepage/location')}
              >
                <span>
                  {formatAddress(selectedLocation) ||
                    (locationLoaded ? '내 위치 선택' : '로딩 중...')}
                </span>
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
        pathname !== PAGE_URLS.ORDER_CONFIRMATION &&
        pathname !==
          '/client/seller/pages/seller-product-list/refund-request' &&
        pathname !== '/client/seller/pages/seller-product-list' && (
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
                ref={dropdownRef}
                aria-hidden="true"
                className={styles.historyDropdown}
              >
                <div className={styles.historyHeader}>
                  <span className={styles.historyTitle}>최근 검색어</span>
                  <button
                    type="button"
                    className={styles.clearAllBtn}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      e.stopPropagation();
                    }}
                    onClick={() => {
                      if (isShoplist) {
                        localStorage.removeItem('shopSearchKeywords');
                        setShopKeywords([]);
                      } else {
                        handleClearAll();
                      }
                    }}
                  >
                    전체 삭제
                  </button>
                </div>

                {(isShoplist ? shopKeywords.length > 0 : history.length > 0) ? (
                  (isShoplist ? shopKeywords : history).map(
                    (item: any, idx: number) => {
                      const keyword = isShoplist ? item : item.keyword;
                      const searchedAt = !isShoplist ? item.searchedAt : null;
                      return (
                        <div
                          key={`history-${idx}`}
                          className={styles.historyItem}
                          onClick={() => handleSelectHistory(keyword)}
                        >
                          <div className={styles.historyContent}>
                            <div className={styles.historyLeft}>
                              <CiClock2 className={styles.historyIcon} />
                              <span className={styles.historyTerm}>
                                {keyword}
                              </span>
                            </div>
                            <div className={styles.historyRight}>
                              {!isShoplist && searchedAt && (
                                <span className={styles.historyTime}>
                                  {new Date(searchedAt).toLocaleDateString(
                                    'ko-KR'
                                  )}
                                </span>
                              )}
                              <button
                                type="button"
                                className={styles.historyDelete}
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Prevent input blur
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isShoplist) {
                                    setShopKeywords((prev) =>
                                      prev.filter((k) => k !== keyword)
                                    );
                                    localStorage.setItem(
                                      'shopSearchKeywords',
                                      JSON.stringify(
                                        shopKeywords.filter(
                                          (k) => k !== keyword
                                        )
                                      )
                                    );
                                  } else {
                                    handleDeleteItem(e, keyword);
                                  }
                                }}
                              >
                                <IoClose />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
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
              <button
                className={styles.currentBtn}
                onClick={async () => {
                  if (!navigator.geolocation) {
                    toast.error(
                      '이 브라우저에서는 위치 서비스를 지원하지 않습니다.'
                    );
                    return;
                  }

                  toast.loading('현재 위치를 불러오는 중...', {
                    id: 'getLocation',
                  });

                  try {
                    const position = await new Promise<GeolocationPosition>(
                      (resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                          resolve,
                          reject,
                          {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 300000,
                          }
                        );
                      }
                    );

                    const { latitude, longitude } = position.coords;

                    localStorage.setItem('selectedLocation', '현재 위치');
                    localStorage.setItem(
                      'selectedLocationLat',
                      latitude.toString()
                    );
                    localStorage.setItem(
                      'selectedLocationLong',
                      longitude.toString()
                    );

                    window.dispatchEvent(new CustomEvent('locationChanged'));
                    toast.success('현재 위치를 업데이트했습니다.', {
                      id: 'getLocation',
                    });
                  } catch (error) {
                    toast.dismiss('getLocation');

                    if (error instanceof GeolocationPositionError) {
                      switch (error.code) {
                        case error.PERMISSION_DENIED:
                          toast.error('위치 접근이 거부되었습니다.');
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
                  }
                }}
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
            )}
          </div>
        )}
    </header>
  );
}

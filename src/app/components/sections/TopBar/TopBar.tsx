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

type SearchHistoryItem = {
  id: number;
  term: string;
  time: string;
};

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

  /** Load history from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) setHistory(JSON.parse(stored));
    else setHistory([]);
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

  /** Save search term */
  const saveHistory = useCallback(
    (term: string) => {
      if (!term) return;
      const now = new Date();
      const hours = now.getHours() % 12 || 12;
      const formatted = `${hours}.${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      const newHistory = [
        { id: Date.now(), term, time: formatted },
        ...history.filter((h) => h.term !== term),
      ].slice(0, 10);

      setHistory(newHistory);
      localStorage.setItem(getStorageKey(), JSON.stringify(newHistory));
    },
    [history, getStorageKey]
  );

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
  const handleDeleteItem = (id: number) => {
    const newHistory = history.filter((h) => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem(getStorageKey(), JSON.stringify(newHistory));
  };

  /** Delete all */
  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem(getStorageKey());
  };

  const handleFocus = () => setShowHistory(true);
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
              onClick={() => router.back()}
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

            {showHistory && history.length > 0 && (
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

                {history.map((item) => (
                  <div key={item.id} className={styles.historyItem}>
                    <div
                      className={styles.historyContent}
                      onClick={() => handleSelectHistory(item.term)}
                    >
                      <div className={styles.historyLeft}>
                        <CiClock2 className={styles.historyIcon} />
                        <span className={styles.historyTerm}>{item.term}</span>
                      </div>

                      <div className={styles.historyRight}>
                        <span className={styles.historyTime}>{item.time}</span>
                        <button
                          type="button"
                          className={styles.historyDelete}
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <IoClose />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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

'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { CiSearch } from 'react-icons/ci';
import { FaChevronDown, FaHome } from 'react-icons/fa';
import { CiClock2 } from 'react-icons/ci';
import { FaChevronLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

import { IoClose } from 'react-icons/io5';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import styles from './TopBar.module.css';

type SearchHistoryItem = {
  id: number;
  term: string;
  time: string; // formatted string
};

export default function TopBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoggedIn = true;
  const router = useRouter();
  const pathname = usePathname();

  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  /** Load history from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem('searchHistory');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  /** Save search term */
  const saveHistory = (term: string) => {
    if (!term) return;
    const now = new Date();

    // Convert to 12-hour format like "7.20"
    let hours = now.getHours() % 12;
    if (hours === 0) hours = 12; // 0 becomes 12

    const formatted = `${hours}.${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const newHistory = [
      { id: Date.now(), term, time: formatted },
      ...history.filter((h) => h.term !== term),
    ].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  /** Submit search */

  const submitSearch = useCallback(() => {
    const term = inputValue.trim();

    if (!term) {
      toast.error('검색어를 입력해주세요.');
      return;
    }

    saveHistory(term);
    router.push(
      `/client/pages/products/search?query=${encodeURIComponent(term)}`
    );

    setInputValue('');
    inputRef.current?.blur();
    setShowHistory(false);
  }, [inputValue, history, router]);

  /** Handle Enter safely for Korean/Japanese IME */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // @ts-ignore
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submitSearch();
    }
  };

  /** Form submit */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch();
  };

  /** Clear input */
  const handleClear = () => {
    setInputValue('');
    inputRef.current?.blur();
    setShowHistory(false);
  };

  /** Select from history */
  const handleSelectHistory = (term: string) => {
    setInputValue(term);
    router.push(
      `/client/pages/products/search?query=${encodeURIComponent(term)}`
    );
    inputRef.current?.blur();
    setShowHistory(false);
  };

  /** Delete one item */
  const handleDeleteItem = (id: number) => {
    const newHistory = history.filter((h) => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  /** Delete all */
  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleFocus = () => setShowHistory(true);
  const handleBlur = () => {
    setTimeout(() => setShowHistory(false), 200);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.inner}>
        <div className={styles.logoWrapper}>
          {pathname === '/client/pages/homepage' ? (
            isLoggedIn ? (
              <div
                className={styles.userLocation}
                onClick={() => router.push('/client/pages/homepage/location')}
              >
                <span>신림동</span>
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

        <div className={styles.icons}>
          {/* Show Home icon only if not on homepage */}
          {pathname !== '/client/pages/homepage' && (
            <button
              className={styles.iconBtn}
              onClick={() => router.push('/client/pages/homepage')}
              aria-label="홈으로 이동"
            >
              <Image
                src="/images/icons/bottom-bar/home-active.png"
                alt="Notification"
                width={27}
                height={30}
                className={styles.logo}
              />
            </button>
          )}

          <button className={styles.iconBtn}>
            <Image
              src="/images/icons/Bell.svg"
              alt="Notification"
              width={27}
              height={30}
              className={styles.logo}
            />
          </button>
          <button className={styles.iconBtn}>
            <Image
              src="/images/icons/Cart.png"
              alt="Cart"
              width={27}
              height={30}
              className="object-contain"
            />
          </button>
        </div>
      </div>

      {/* Search */}
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
            placeholder="검색어를 입력해 주세요"
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
          <div className={styles.historyDropdown}>
            {/* Header row */}
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

            {/* Items */}
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
      </div>
    </header>
  );
}

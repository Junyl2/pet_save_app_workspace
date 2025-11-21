'use client';

import { useEffect, useState } from 'react';
import { CiClock2 } from 'react-icons/ci';
import { useUser } from '@/app/context/userContext';
import { SearchHistoryService } from '@/app/api/services/client/searchHistoryService/searchHistoryService';
import styles from './WrongTermSearchHistory.module.css';

interface WrongTermItem {
  keyword: string;
  searchedAt: string;
}

const STORAGE_KEY = 'wrongTermSearchHistory';

export default function WrongTermSearchHistory() {
  const { user } = useUser();
  const isLoggedIn = !!user;
  const [history, setHistory] = useState<WrongTermItem[]>([]);

  const loadHistory = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Sort by most recent first
        const sorted = parsed.sort(
          (a: WrongTermItem, b: WrongTermItem) =>
            new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime()
        );
        setHistory(sorted);
      } catch {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();

    // Listen for storage changes (when new wrong terms are added)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadHistory();
      }
    };

    // Also listen for custom event (for same-tab updates)
    const handleCustomStorageChange = () => {
      loadHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(
      'wrongTermHistoryUpdated',
      handleCustomStorageChange
    );

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'wrongTermHistoryUpdated',
        handleCustomStorageChange
      );
    };
  }, []);

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}.${day.toString().padStart(2, '0')}`;
  };

  const handleDeleteItem = async (keyword: string) => {
    const updated = history.filter((item) => item.keyword !== keyword);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Also delete from TopBar search history
    if (isLoggedIn) {
      try {
        await SearchHistoryService.deleteKeyword(keyword);
      } catch (error) {
        console.error('Failed to delete keyword from search history:', error);
      }
    } else {
      // Delete from localStorage fallback
      const storageKey = 'searchHistoryProducts';
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(
              (item: any) =>
                (typeof item === 'string' ? item : item.keyword) !== keyword
            );
            localStorage.setItem(storageKey, JSON.stringify(filtered));
          }
        } catch (error) {
          console.error('Failed to update localStorage search history:', error);
        }
      }
    }

    // Dispatch event to notify TopBar to refresh
    window.dispatchEvent(
      new CustomEvent('searchHistoryDeleted', { detail: { keyword } })
    );
  };

  const handleDeleteAll = async () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);

    // Also clear TopBar search history
    if (isLoggedIn) {
      try {
        await SearchHistoryService.clearSearchHistory();
      } catch (error) {
        console.error('Failed to clear search history:', error);
      }
    } else {
      // Clear from localStorage fallback
      const storageKey = 'searchHistoryProducts';
      localStorage.removeItem(storageKey);
    }

    // Dispatch event to notify TopBar to refresh
    window.dispatchEvent(new CustomEvent('searchHistoryCleared'));
  };

  const handleItemClick = (keyword: string) => {
    // Navigate to search with this keyword
    window.location.href = `/client/pages/products/search?query=${encodeURIComponent(
      keyword
    )}`;
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>최근 검색어</span>
        <button className={styles.deleteAllBtn} onClick={handleDeleteAll}>
          전체 삭제
        </button>
      </div>
      <div className={styles.list}>
        {history.map((item, index) => (
          <div key={`${item.keyword}-${index}`} className={styles.item}>
            <div
              className={styles.itemContent}
              onClick={() => handleItemClick(item.keyword)}
            >
              <div className={styles.leftSection}>
                <CiClock2 className={styles.clockIcon} />
                <span className={styles.keyword}>{item.keyword}</span>
              </div>
              <div className={styles.rightSection}>
                <span className={styles.date}>
                  {formatDate(item.searchedAt)}
                </span>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.keyword);
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.75 3.75L11.25 11.25M11.25 3.75L3.75 11.25"
                      stroke="rgba(0, 0, 0, 0.5)"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

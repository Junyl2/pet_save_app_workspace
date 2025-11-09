'use client';

import React, { useMemo } from 'react';
import styles from './ClientPagination.module.css';

interface ClientPaginationProps {
  currentPage: number; // 1-based
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination showing up to 5 pages at a time.
 * Example:
 * 1 2 3 4 5 ... Next
 * When current page > 3, center around it like:
 * Prev ... 3 4 5 6 7 ... Next
 */
export default function ClientPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ClientPaginationProps) {
  const visiblePages = useMemo(() => {
    const maxVisible = 3;
    const pages: (number | 'dots')[] = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisible - 1);

      // Always show first page
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('dots');
      }

      // Visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Show trailing dots if not reaching the end
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('dots');
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <nav className={styles.container} aria-label="페이지네이션">
      <button
        type="button"
        className={`${styles.link} ${!canPrev ? styles.disabled : ''}`}
        onClick={() => canPrev && onPageChange(currentPage - 1)}
        disabled={!canPrev}
        aria-disabled={!canPrev}
        aria-label="이전 페이지"
      >
        이전
      </button>

      {visiblePages.map((p, idx) =>
        p === 'dots' ? (
          <span key={`dots-${idx}`} className={styles.dots}>
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`${styles.page} ${
              p === currentPage ? styles.active : ''
            }`}
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            aria-label={`페이지 ${p}`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className={`${styles.link} ${!canNext ? styles.disabled : ''}`}
        onClick={() => canNext && onPageChange(currentPage + 1)}
        disabled={!canNext}
        aria-disabled={!canNext}
        aria-label="다음 페이지"
      >
        다음
      </button>
    </nav>
  );
}

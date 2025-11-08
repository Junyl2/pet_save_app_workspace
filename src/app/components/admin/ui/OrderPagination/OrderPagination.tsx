'use client';

import React from 'react';
import styles from './OrderPagination.module.css';

type OrderPaginationProps = {
  currentPage: number; // 1-based
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function OrderPagination({
  currentPage,
  totalPages,
  onPageChange,
}: OrderPaginationProps): React.ReactElement | null {
  if (totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const maxVisible = 8;

  const getVisiblePages = (): (number | string)[] => {
    if (totalPages <= maxVisible)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | string)[] = [];
    const start = Math.max(1, currentPage - 3);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className={styles.container} aria-label="주문 목록 페이지네이션">
      <button
        type="button"
        className={`${styles.link} ${!canPrev ? styles.disabled : ''}`}
        onClick={() => canPrev && onPageChange(currentPage - 1)}
        disabled={!canPrev}
        aria-disabled={!canPrev}
        aria-label="이전 페이지"
      >
        &lt; PREV
      </button>

      {visiblePages.map((p, i) =>
        typeof p === 'number' ? (
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
        ) : (
          <span key={`ellipsis-${i}`} className={styles.ellipsis}>
            {p}
          </span>
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
        NEXT &gt;
      </button>
    </nav>
  );
}

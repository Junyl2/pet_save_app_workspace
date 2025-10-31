'use client';

import React from 'react';
import styles from './OrderPagination.module.css';

type OrderPaginationProps = {
  currentPage: number; // 1-based
  totalPages: number; // e.g., 4
  onPageChange: (page: number) => void;
};

export default function OrderPagination({
  currentPage,
  totalPages,
  onPageChange,
}: OrderPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

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

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`${styles.page} ${p === currentPage ? styles.active : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={p === currentPage ? 'page' : undefined}
          aria-label={`페이지 ${p}`}
        >
          {p}
        </button>
      ))}

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

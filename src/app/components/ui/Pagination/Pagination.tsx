'use client';

import { useState } from 'react';
import styles from './Pagination.module.css';

export interface PaginationInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface PaginationProps {
  pageInfo: PaginationInfo;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  pageInfo,
  onPageChange,
  className,
}: PaginationProps) => {
  const { totalPages, currentPage, hasNext, hasPrevious } = pageInfo;

  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    console.log('Pagination: handlePageChange called with page:', page);
    onPageChange(page);
  };

  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(0, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        className={`${styles.pageButton} ${
          i === currentPage ? styles.activePage : ''
        }`}
        onClick={() => handlePageChange(i)}
      >
        {i + 1}
      </button>
    );
  }

  return (
    <div className={`${styles.pagination} ${className || ''}`}>
      <button
        className={`${styles.pageButton} ${styles.navButton}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrevious}
      >
        이전
      </button>
      {startPage > 0 && (
        <>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(0)}
          >
            1
          </button>
          {startPage > 1 && <span className={styles.ellipsis}>...</span>}
        </>
      )}
      {pages}
      {endPage < totalPages - 1 && (
        <>
          {endPage < totalPages - 2 && (
            <span className={styles.ellipsis}>...</span>
          )}
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(totalPages - 1)}
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        className={`${styles.pageButton} ${styles.navButton}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNext}
      >
        다음
      </button>
    </div>
  );
};

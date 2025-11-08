'use client';

import React from 'react';
import styles from './Pagination.module.css';
import { usePathname } from 'next/navigation';

export interface PaginationInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number; // zero-based
  pageSize: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface PaginationProps {
  pageInfo: PaginationInfo;
  onPageChange: (page: number) => void; // expects zero-based page
  className?: string;
}

export const Pagination = ({
  pageInfo,
  onPageChange,
  className,
}: PaginationProps) => {
  const { totalPages, currentPage, hasNext, hasPrevious } = pageInfo;
  const pathname = usePathname();

  const isProductListPage = pathname.startsWith(
    '/client/seller/pages/seller-product-list'
  );

  // Skip rendering if only one page
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number): void => {
    if (page >= 0 && page < totalPages) onPageChange(page);
  };

  const maxVisible = 5;
  const pages: React.ReactNode[] = [];

  let startPage = Math.max(
    0,
    Math.min(currentPage - Math.floor(maxVisible / 2), totalPages - maxVisible)
  );
  let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

  // Adjust range for small totals
  if (totalPages <= maxVisible) {
    startPage = 0;
    endPage = totalPages - 1;
  }

  // Add leading pages (1 ... )
  if (startPage > 0) {
    pages.push(
      <button
        key={0}
        className={styles.pageButton}
        onClick={() => handlePageChange(0)}
      >
        1
      </button>
    );
    if (startPage > 1) {
      pages.push(
        <span key="dots-start" className={styles.ellipsis}>
          ...
        </span>
      );
    }
  }

  // Add visible pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        className={`${styles.pageButton} ${
          i === currentPage ? styles.activePage : ''
        }`}
        onClick={() => handlePageChange(i)}
        aria-current={i === currentPage ? 'page' : undefined}
      >
        {i + 1}
      </button>
    );
  }

  // Add trailing pages (... last)
  if (endPage < totalPages - 1) {
    if (endPage < totalPages - 2) {
      pages.push(
        <span key="dots-end" className={styles.ellipsis}>
          ...
        </span>
      );
    }
    pages.push(
      <button
        key={totalPages - 1}
        className={styles.pageButton}
        onClick={() => handlePageChange(totalPages - 1)}
      >
        {totalPages}
      </button>
    );
  }

  return (
    <div
      className={`${styles.pagination} ${
        isProductListPage ? styles.productListPage : ''
      } ${className || ''}`}
    >
      {/* Prev */}
      <button
        className={`${styles.pageButton} ${styles.navButton}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrevious}
      >
        이전
      </button>

      {pages}

      {/* Next */}
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

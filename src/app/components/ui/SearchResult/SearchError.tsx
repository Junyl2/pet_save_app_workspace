'use client';

import Image from 'next/image';
import { Product } from '@/app/api/types/products/products';
import styles from './SearchProductGrid.module.css';

interface SearchErrorProps {
  loading: boolean;
  error: string | null;
  searchTerm: string;
  searchSubmitted: boolean;
  filteredProducts: Product[];
  catalogReady: boolean;
  allProducts: Product[];
}

export default function SearchError({
  loading,
  error,
  searchTerm,
  searchSubmitted,
  filteredProducts,
  catalogReady,
  allProducts,
}: SearchErrorProps) {
  const isEmptySearch = !searchTerm.trim() && searchSubmitted;
  const noMatches = !!searchTerm.trim() && filteredProducts.length === 0;

  const normalizedTerm = searchTerm.trim().toLowerCase();
  const matchesAnyCatalog = (() => {
    if (!normalizedTerm) return false;
    if (!catalogReady || allProducts.length === 0) return false;

    // 🔑 strip numbers/symbols so "강아지123" still matches "강아지"
    const cleanTerm = normalizedTerm.replace(/[^가-힣a-zA-Z]/g, '');
    return allProducts.some((p) =>
      (p.name || '').toLowerCase().includes(cleanTerm)
    );
  })();

  if (loading) {
    return (
      <section className={styles.mainContainer}>
        <p>로딩중...</p>
      </section>
    );
  }

  if (error) {
    return <p className={styles.emptyText}>에러: {error}</p>;
  }

  if (isEmptySearch) {
    return (
      <div className={styles.emptyContainer}>
        <div>
          <Image
            src="/images/products/noresult.png"
            alt="검색어 입력 필요"
            height={100}
            width={100}
            className="object-contain"
          />
          <p className={styles.emptyText}>검색어를 입력해주세요.</p>
        </div>
      </div>
    );
  }

  if (noMatches) {
    const isWrongTerm =
      catalogReady && allProducts.length > 0 && !matchesAnyCatalog;

    return (
      <div className={styles.emptyContainer}>
        <div>
          <Image
            src={
              isWrongTerm
                ? '/images/products/noresult-wrong-term.svg'
                : '/images/products/noresult.png'
            }
            alt="검색된 상품 없음"
            height={100}
            width={100}
            className="object-contain"
          />
          <p className={styles.emptyText}>검색된 상품이 없습니다.</p>
        </div>
      </div>
    );
  }

  return null; // No errors, products exist → nothing to show
}

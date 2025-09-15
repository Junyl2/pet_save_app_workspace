'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import styles from './styles.module.css';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';

type ProductStatus = '판매중' | '판매완료';

interface SellerProductItem {
  id: string;
  name: string;
  imageSrc: string;
  originalPrice: number;
  salePrice: number;
  status: ProductStatus;
}

const allProducts: SellerProductItem[] = [
  {
    id: 'p1',
    name: '상품탐사 6free 강아지 사료 치킨 레시피, 6kg, 1개',
    imageSrc: '/images/products/dogfood.png',
    originalPrice: 30000,
    salePrice: 24000,
    status: '판매중',
  },
  {
    id: 'p2',
    name: '상품탐사 6free 고양이 사료 연어 레시피, 2kg, 1개',
    imageSrc: '/images/products/dog-snack.png',
    originalPrice: 25000,
    salePrice: 20000,
    status: '판매중',
  },
  {
    id: 'p3',
    name: '펫사랑 유기농 강아지 간식, 200g, 1개',
    imageSrc: '/images/products/dog-snack2.png',
    originalPrice: 15000,
    salePrice: 12000,
    status: '판매중',
  },
  {
    id: 'p4',
    name: '올바른 선택 고양이 모래, 5kg, 1개',
    imageSrc: '/images/products/dog-snack2.png',
    originalPrice: 10000,
    salePrice: 8000,
    status: '판매중',
  },
  {
    id: 'p5',
    name: '상품탐사 6free 강아지 사료 소고기 레시피, 6kg, 1개',
    imageSrc: '/images/products/dog-snack.png',
    originalPrice: 30000,
    salePrice: 24000,
    status: '판매중',
  },
  {
    id: 'p6',
    name: '판매 완료 샘플 상품',
    imageSrc: '/images/products/dog-snack2.png',
    originalPrice: 12000,
    salePrice: 9000,
    status: '판매완료',
  },
];

function formatPrice(value: number) {
  return value.toLocaleString('ko-KR');
}

export default function SellerProductListPage() {
  const [filter, setFilter] = useState<ProductStatus>('판매중');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(
    null
  );
  const [products, setProducts] = useState(allProducts);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.status === filter),
    [products, filter]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown-container]')) {
        setStatusDropdownOpen(null);
      }
    };

    if (statusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [statusDropdownOpen]);

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteModalOpen(null);
  };

  return (
    <>
      <ProductHeader />

      <div className={styles.pageWrap}>
        <div className={styles.summaryRow}>
          <span className={styles.lengthLabel}>
            총 상품수 {filteredProducts.length}개
          </span>
          <div className={styles.filterControl}>
            <button
              className={styles.filterButton}
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
            >
              <span className={styles.filterButtonText}>{filter}</span>
              <FaChevronDown className={styles.smallChevron} />
            </button>
            {dropdownOpen && (
              <div className={styles.dropdown} role="listbox">
                {(['판매중', '판매완료'] as ProductStatus[]).map((option) => (
                  <button
                    key={option}
                    role="option"
                    aria-selected={option === filter}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setFilter(option);
                      setDropdownOpen(false);
                    }}
                  >
                    <span
                      className={
                        option === '판매완료' ? styles.dimText : undefined
                      }
                    >
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <main className={styles.listWrap}>
          {filteredProducts.map((p) => (
            <article key={p.id} className={styles.card}>
              <div className={styles.thumbWrap}>
                <Image
                  src={p.imageSrc}
                  alt={p.name}
                  width={90}
                  height={90}
                  className={styles.thumb}
                />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.title}>{p.name}</h3>
                <div className={styles.priceRow}>
                  <span className={styles.originalPrice}>
                    {formatPrice(p.originalPrice)}원
                  </span>
                  <span className={styles.salePrice}>
                    {formatPrice(p.salePrice)}원
                  </span>
                </div>
                <div
                  className={styles.statusPillContainer}
                  data-dropdown-container
                >
                  <button
                    className={styles.statusPill}
                    onClick={() => {
                      setStatusDropdownOpen(
                        statusDropdownOpen === p.id ? null : p.id
                      );
                    }}
                  >
                    <span
                      className={
                        p.status === '판매완료' ? styles.dimText : undefined
                      }
                    >
                      {p.status}
                    </span>
                    <FaChevronDown className={styles.downIcon} />
                  </button>

                  {statusDropdownOpen === p.id && (
                    <div className={styles.statusDropdown}>
                      <button
                        className={styles.statusDropdownItem}
                        onClick={() => {
                          console.log('Change status to 판매중 for:', p.id);
                          setStatusDropdownOpen(null);
                        }}
                      >
                        판매중
                      </button>
                      <button
                        className={styles.statusDropdownItem}
                        onClick={() => {
                          console.log('Change status to 판매완료 for:', p.id);
                          setStatusDropdownOpen(null);
                        }}
                      >
                        <span className={styles.dimText}>판매완료</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* X Delete Button */}
              <button
                className={styles.deleteBtn}
                onClick={() => setDeleteModalOpen(p.id)}
                aria-label="Delete product"
              >
                <FaTimes size={14} />
              </button>

              {/* Delete Modal */}
              {deleteModalOpen === p.id && (
                <div className={styles.modalBackdrop}>
                  <div className={styles.modal}>
                    <p>정말 이 상품을 삭제하시겠습니까?</p>
                    <div className={styles.modalActions}>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className={styles.confirmBtn}
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setDeleteModalOpen(null)}
                        className={styles.cancelBtn}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </main>
      </div>

      <BottomBar />
    </>
  );
}

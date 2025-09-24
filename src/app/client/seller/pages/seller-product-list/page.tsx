'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import styles from './styles.module.css';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { SellerProductListService } from '@/app/api/services/client/productService/sellerProductListService';
import {
  StoreProduct,
  RegistrationStatus,
} from '@/app/api/types/products/productList';
import { MemberService } from '@/app/api/services/client/memberService/memberService';

type ProductStatus = '판매중' | '판매완료';

// Helper function to convert API registration status to display status
const getDisplayStatus = (
  registrationStatus: RegistrationStatus
): ProductStatus => {
  return registrationStatus === 'ONSALE' ? '판매중' : '판매완료';
};

// Helper function to get default image if none provided
const getDefaultImage = (images?: string[]): string => {
  const imageUrl =
    images && images.length > 0 ? images[0] : '/images/products/dogfood.png';
  console.log('[SellerProductListPage] Images:', images, 'Selected:', imageUrl);
  return imageUrl;
};

function formatPrice(value: number) {
  return value.toLocaleString('ko-KR');
}

export default function SellerProductListPage() {
  const [filter, setFilter] = useState<ProductStatus>('판매중');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(
    null
  );
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [storeId, setStoreId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(
      (p) => getDisplayStatus(p.registrationStatus) === filter
    );
    console.log('[SellerProductListPage] Filtered products:', filtered);
    console.log('[SellerProductListPage] Current filter:', filter);
    return filtered;
  }, [products, filter]);

  // Fetch products for the current seller's store
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get member information to get storeId
        const memberResponse = await MemberService.getMyInfo();
        if (memberResponse.error || !memberResponse.data) {
          throw new Error('회원 정보를 가져올 수 없습니다.');
        }

        const memberData = memberResponse.data.data;
        console.log('[SellerProductListPage] Member data:', memberData);
        console.log(
          '[SellerProductListPage] StoreId:',
          memberData.storeId,
          'type:',
          typeof memberData.storeId
        );

        if (!memberData.storeId) {
          throw new Error(
            '스토어 정보를 찾을 수 없습니다. 판매자 계정인지 확인해주세요.'
          );
        }

        setStoreId(memberData.storeId);

        // Then fetch products for this store
        const productsResponse =
          await SellerProductListService.getProductsByStoreId({
            storeId: memberData.storeId,
            page: currentPage,
            size: 20,
            sortBy: 'createdAt',
            direction: 'desc',
          });

        if (productsResponse.error || !productsResponse.data) {
          throw new Error('상품 목록을 가져올 수 없습니다.');
        }

        const productsData = productsResponse.data.data;
        console.log(
          '[SellerProductListPage] Products response data:',
          productsData
        );
        console.log(
          '[SellerProductListPage] Products content:',
          productsData.content
        );
        console.log(
          '[SellerProductListPage] Number of products:',
          productsData.content?.length || 0
        );

        setProducts(productsData.content);
        setTotalPages(productsData.totalPages);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(
          err instanceof Error
            ? err.message
            : '데이터를 불러오는 중 오류가 발생했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

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

  const handleDelete = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.productId !== productId));
    setDeleteModalOpen(null);
  };

  if (loading) {
    return (
      <>
        <ProductHeader />
        <div className={styles.pageWrap}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            상품 목록을 불러오는 중...
          </div>
        </div>
        <BottomBar />
      </>
    );
  }

  if (error) {
    return (
      <>
        <ProductHeader />
        <div className={styles.pageWrap}>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            {error}
          </div>
        </div>
        <BottomBar />
      </>
    );
  }

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
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              등록된 상품이 없습니다.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const displayStatus = getDisplayStatus(p.registrationStatus);
              console.log('[SellerProductListPage] Rendering product:', p);
              return (
                <article key={p.productId} className={styles.card}>
                  <div className={styles.thumbWrap}>
                    <Image
                      src={getDefaultImage(p.images)}
                      alt={p.productName}
                      width={90}
                      height={90}
                      className={styles.thumb}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.title}>{p.productName}</h3>
                    <div className={styles.priceRow}>
                      <span className={styles.originalPrice}>
                        {formatPrice(p.salePrice)}원
                      </span>
                      {p.discountedPrice &&
                        p.discountedPrice !== p.salePrice && (
                          <span className={styles.salePrice}>
                            {formatPrice(p.discountedPrice)}원
                          </span>
                        )}
                    </div>
                    <div
                      className={styles.statusPillContainer}
                      data-dropdown-container
                    >
                      <button
                        className={styles.statusPill}
                        onClick={() => {
                          setStatusDropdownOpen(
                            statusDropdownOpen === p.productId
                              ? null
                              : p.productId
                          );
                        }}
                      >
                        <span
                          className={
                            displayStatus === '판매완료'
                              ? styles.dimText
                              : undefined
                          }
                        >
                          {displayStatus}
                        </span>
                        <FaChevronDown className={styles.downIcon} />
                      </button>

                      {statusDropdownOpen === p.productId && (
                        <div className={styles.statusDropdown}>
                          <button
                            className={styles.statusDropdownItem}
                            onClick={() => {
                              console.log(
                                'Change status to 판매중 for:',
                                p.productId
                              );
                              setStatusDropdownOpen(null);
                            }}
                          >
                            판매중
                          </button>
                          <button
                            className={styles.statusDropdownItem}
                            onClick={() => {
                              console.log(
                                'Change status to 판매완료 for:',
                                p.productId
                              );
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
                    onClick={() => setDeleteModalOpen(p.productId)}
                    aria-label="Delete product"
                  >
                    <FaTimes size={14} />
                  </button>

                  {/* Delete Modal */}
                  {deleteModalOpen === p.productId && (
                    <div className={styles.modalBackdrop}>
                      <div className={styles.modal}>
                        <p>정말 이 상품을 삭제하시겠습니까?</p>
                        <div className={styles.modalActions}>
                          <button
                            onClick={() => handleDelete(p.productId)}
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
              );
            })
          )}
        </main>
      </div>

      <BottomBar />
    </>
  );
}

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import styles from './styles.module.css';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';
import { SellerProductListService } from '@/app/api/services/client/productService/sellerProductListService';
import { ProductService } from '@/app/api/services/client/productService/productService';
import {
  StoreProduct,
  RegistrationStatus,
  PageInfo,
} from '@/app/api/types/products/productList';
import { Pagination } from '@/app/components/ui/Pagination/Pagination';
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
  const pathname = usePathname();
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
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

  const updateProductStatusLocally = (
    productId: string,
    nextStatus: RegistrationStatus
  ) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.productId === productId
          ? { ...prod, registrationStatus: nextStatus }
          : prod
      )
    );
  };

  const handleChangeStatus = async (
    productId: string,
    target: ProductStatus
  ) => {
    try {
      if (target === '판매완료') {
        const res = await ProductService.markSoldOut(productId);
        if (res.error) {
          setError('상품을 판매완료로 변경하지 못했습니다.');
          return;
        }
        updateProductStatusLocally(productId, 'SOLD_OUT');
      } else {
        const res = await ProductService.markOnSale(productId);
        if (res.error) {
          setError('상품을 판매중으로 변경하지 못했습니다.');
          return;
        }
        updateProductStatusLocally(productId, 'ONSALE');
      }
    } catch (e) {
      setError('상태 변경 중 오류가 발생했습니다.');
    } finally {
      setStatusDropdownOpen(null);
    }
  };

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

        // Then fetch products for this store
        const productsResponse =
          await SellerProductListService.getProductsByStoreId({
            storeId: memberData.storeId,
            page: currentPage,
            size: 10,
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
        setPageInfo(productsData.pageInfo);
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

  const handlePageChange = (page: number) => {
    console.log('[SellerProductListPage] Page change requested:', page);
    setCurrentPage(page);
  };

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

  const handleDelete = async (productId: string) => {
    try {
      console.log('[SellerProductListPage] Deleting product:', productId);

      const response = await ProductService.deleteProduct(productId);

      if (response.error) {
        console.error(
          '[SellerProductListPage] Failed to delete product:',
          response.error
        );

        // Check if it's a 500 error and provide more specific message
        if (response.error.includes('500')) {
          setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError('상품 삭제에 실패했습니다. 다시 시도해주세요.');
        }
        return;
      }

      console.log('[SellerProductListPage] Product deleted successfully');

      // Remove the product from the local state
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
      setDeleteModalOpen(null);
    } catch (err) {
      console.error('[SellerProductListPage] Error deleting product:', err);
      setError('상품 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <>
        <TopBar />
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
        <TopBar />
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
      <TopBar />

      <div className={styles.pageWrap}>
        {/* Top Tab Header (상품 리스트 / 반품/교환 요청) */}
        <div
          /*    style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 48,
            padding: '0 16px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            boxSizing: 'border-box',
          }} */
          className={styles.topBarLabel}
        >
          <div>
            <Link
              href="/client/seller/pages/seller-product-list"
              style={{
                color:
                  pathname === '/client/seller/pages/seller-product-list'
                    ? 'rgb(102, 191, 167)'
                    : 'rgba(0,0,0,0.6)',
                fontSize: 14,
                lineHeight: '16px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              상품 리스트
            </Link>
          </div>
          <div>
            <Link
              href="/client/seller/pages/seller-product-list/refund-request"
              style={{
                color:
                  pathname ===
                  '/client/seller/pages/seller-product-list/refund-request'
                    ? 'rgb(102, 191, 167)'
                    : 'rgba(0,0,0,0.6)',
                fontSize: 14,
                lineHeight: '16px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              반품/교환 요청
            </Link>
          </div>
        </div>

        <div className={styles.summaryRow}>
          <span className={styles.lengthLabel}>
            총 상품수 {pageInfo?.totalElements || filteredProducts.length}개
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
                            onClick={() =>
                              handleChangeStatus(p.productId, '판매중')
                            }
                          >
                            판매중
                          </button>
                          <button
                            className={styles.statusDropdownItem}
                            onClick={() =>
                              handleChangeStatus(p.productId, '판매완료')
                            }
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

        {/* Pagination */}
        {pageInfo && pageInfo.totalElements > 10 && (
          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      <BottomBar />
    </>
  );
}

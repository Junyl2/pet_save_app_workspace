'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IoChevronDownOutline } from 'react-icons/io5';
import styles from './ProductManagement.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { ProductService } from '@/app/api/services/client/productService/productService';
import {
  ProductSearchResponse,
  Product,
} from '@/app/api/types/products/products';

interface ProductRow {
  productId: string;
  thumbnail?: string | null;
  storeName: string;
  productName: string;
  salePrice: number;
  quantity: number;
  registrationStatus: '판매중' | '품절';
}

const PAGE_SIZE = 5;

export default function ProductManagementPage() {
  const router = useRouter();
  const { page, setPage } = usePageParam(1);

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOption, setSelectedOption] = useState('전체');
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    setOpen(false);
    setPage(1);
  };

  const openEdit = (product: ProductRow) => {
    const query = new URLSearchParams({
      image: product.thumbnail ?? '',
      type: product.storeName,
      situation: product.registrationStatus,
    }).toString();

    router.push(
      `/admin/pages/animal-category-management/edit-category/${product.productId}?${query}`
    );
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let statusFilter: 'ONSALE' | 'SOLD_OUT' | undefined;
      if (selectedOption === '판매중') statusFilter = 'ONSALE';
      else if (selectedOption === '품절') statusFilter = 'SOLD_OUT';

      const { data, error } = await ProductService.searchProducts({
        keyword: keyword.trim() || undefined,
        registrationStatus: statusFilter,
        page: page - 1,
        size: PAGE_SIZE,
      });

      if (!error && data?.data?.content) {
        const response = data as ProductSearchResponse;
        const mapped: ProductRow[] = response.data.content.map(
          (item: Product) => ({
            productId: item.productId ?? '',
            thumbnail: item.thumbnail ?? null,
            storeName: item.store?.name ?? '알 수 없음',
            productName: item.productName ?? '-',
            salePrice: item.salePrice ?? 0,
            quantity: item.quantity ? Number(item.quantity) : 0,
            registrationStatus:
              item.registrationStatus === 'ONSALE' ? '판매중' : '품절',
          })
        );

        setProducts(mapped);
        setTotalPages(response.data.pageInfo.totalPages);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('[ProductManagementPage] Fetch failed:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedOption, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  const noDataMessage =
    selectedOption === '품절'
      ? '품절 상품이 없습니다.'
      : selectedOption === '판매중'
      ? '판매중인 상품이 없습니다.'
      : '상품이 없습니다.';

  const getStatusColor = (status: '판매중' | '품절') =>
    status === '판매중' ? '#009329' : '#EA080C';

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>상품 리스트</h1>
      </div>

      <div className={styles.wrapper}>
        {/* Top controls: dropdown + search */}
        <div className={styles.topHeader}>
          <div className={styles.dropdownWrapper}>
            <div
              className={styles.dropdownHeader}
              onClick={() => setOpen((prev) => !prev)}
            >
              <span>{selectedOption}</span>
              <IoChevronDownOutline className={styles.dropdownIcon} />
            </div>
            {open && (
              <div className={styles.dropdownList}>
                {['전체', '판매중', '품절'].map((option) => (
                  <div
                    key={option}
                    className={styles.dropdownItem}
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.searchWrap}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="검색어를 입력하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              type="button"
              className={styles.searchBtn}
              onClick={handleSearch}
            >
              검색
            </button>
          </div>
        </div>

        {/* Table header */}
        <div className={styles.headerRow}>
          <div className={styles.col}></div>
          <div className={styles.col}>업체명</div>
          <div className={styles.col}>상품명</div>
          <div className={styles.col}>가격</div>
          <div className={styles.col}>재고</div>
          <div className={styles.col}>상태</div>
          <div className={styles.col}></div>
        </div>

        {/* Data rows */}
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : products.length > 0 ? (
          products.map((product) => (
            <div key={product.productId} className={styles.dataRow}>
              <div className={`${styles.col} ${styles.image}`}>
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    fill
                    alt={product.productName}
                    className={styles.thumb}
                  />
                ) : (
                  <div className={styles.placeholder}></div>
                )}
              </div>
              <div className={styles.col}>{product.storeName}</div>
              <div className={styles.col}>{product.productName}</div>
              <div className={styles.col}>
                {product.salePrice.toLocaleString()}원
              </div>
              <div className={styles.col}>{product.quantity}개</div>
              <div
                className={styles.col}
                style={{ color: getStatusColor(product.registrationStatus) }}
              >
                {product.registrationStatus}
              </div>
              <div className={styles.actions}>
                <button className={styles.hideBtn}>삭제</button>
                <button
                  className={styles.editBtn}
                  tabIndex={0}
                  onClick={() => openEdit(product)}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') && openEdit(product)
                  }
                >
                  수정
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>{noDataMessage}</div>
        )}

        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <OrderPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </>
  );
}

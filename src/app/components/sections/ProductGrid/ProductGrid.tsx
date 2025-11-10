'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './ProductGrid.module.css';
import { useFavorites } from '@/app/context/FavoritesContext';
import { Product } from '@/app/api/types/products/products';
import ProductSkeleton from '../../ui/SkeletonLoading/ProductSkeleton/ProductSkeleton';
import { CartModal } from '../../ui/modal/CartModal/CartModal';
import { Pagination } from '../../ui/Pagination';
import { formatAddressForDisplay } from '@/app/utils/address-utils';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import {
  fetchProducts,
  revalidateProductsInBackground,
  invalidateCacheForLocationChange,
  ProductCacheKey,
} from '@/app/redux/slices/cache/productSlice';
import { useStoreDetails } from '../../hooks/use-store-details';
import { useLocationState } from '../../hooks/use-location-state';
import { BlockService } from '@/app/api/services/client/memberService/block/blockService';

interface ProductGridProps {
  products?: Product[];
  categoryName?: string;
  searchTerm?: string;
  storeId?: string;
  currentPage?: number;
  sortBy?: ProductCacheKey['sortBy'];
  direction?: ProductCacheKey['direction'];
  onPageChange?: (page: number) => void;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductGrid = ({
  products: initialProducts,
  categoryName,
  searchTerm = '',
  storeId,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange,
  onProductClick,
  onAddToCart,
  sortBy = 'createdAt',
  direction = 'desc',
}: ProductGridProps) => {
  const { toggleFavorite, isFavorited } = useFavorites();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const searchParams = useSearchParams();
  const { isLocationAvailable } = useLocationState();
  const { storeDetails, fetchStoreDetails, getStoreDetails, isLoading } =
    useStoreDetails();

  const { cache, loading, backgroundLoading, isStale } = useAppSelector(
    (state) => state.products
  );

  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [isStoreBlocked, setIsStoreBlocked] = useState<boolean | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const formatExpirationDate = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}.${month}.${day}까지`;
    } catch (error) {
      return '';
    }
  };

  /** 🔍 Check if store is blocked */
  useEffect(() => {
    const checkBlockStatus = async () => {
      if (!storeId) {
        setIsStoreBlocked(false);
        return;
      }
      try {
        const res = await BlockService.checkIfStoreBlocked(storeId);
        const blocked =
          res.data?.data?.isBlocked === true ||
          res.data?.resultMsg?.toLowerCase().includes('blocked');
        setIsStoreBlocked(!!blocked);
      } catch (err) {
        console.error('[ProductGrid] Failed to check block status', err);
        setIsStoreBlocked(false);
      }
    };
    checkBlockStatus();
  }, [storeId]);

  /** Cache key per combination */
  const getCacheKey = (): string =>
    `${storeId || 'general'}_${
      categoryName || 'all'
    }_${searchTerm}_${currentPage}_${sortBy || 'createdAt'}_${
      direction || 'desc'
    }`;

  const currentCacheKey = getCacheKey();
  const cachedData = cache[currentCacheKey];
  const products = useMemo(
    () => cachedData?.products || initialProducts || [],
    [cachedData?.products, initialProducts]
  );

  const pageInfo = cachedData?.pageInfo || {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  };

  /** Reset image errors when products change */
  useEffect(() => {
    setImageErrors({});
  }, [products]);

  /** Sync external page with state */
  useEffect(() => {
    if (
      externalCurrentPage !== undefined &&
      externalCurrentPage !== currentPage
    ) {
      setCurrentPage(externalCurrentPage);
    }
  }, [externalCurrentPage, currentPage]);

  /** Fetch products if not initial */
  useEffect(() => {
    if (initialProducts || isStoreBlocked) return;

    const key: ProductCacheKey = {
      categoryName,
      searchTerm,
      storeId,
      page: currentPage,
      sortBy,
      direction,
    };

    dispatch(fetchProducts(key));
  }, [
    categoryName,
    searchTerm,
    storeId,
    currentPage,
    initialProducts,
    sortBy,
    direction,
    dispatch,
    isStoreBlocked,
  ]);

  /** Reset when category/search/sort changes */
  useEffect(() => {
    if (initialProducts || externalOnPageChange) return;
    setCurrentPage(0);
  }, [
    categoryName,
    searchTerm,
    storeId,
    sortBy,
    direction,
    initialProducts,
    externalOnPageChange,
  ]);

  /** Handle location change invalidation */
  useEffect(() => {
    const handleLocationChange = () => {
      dispatch(invalidateCacheForLocationChange());
      if (isLocationAvailable && products.length) {
        const uniqueStoreIds = new Set(
          products
            .map((p) => (p.storeId || p.store?.storeId)?.toString())
            .filter((id): id is string => Boolean(id))
        );
        uniqueStoreIds.forEach((id) => fetchStoreDetails(id));
      }
    };
    window.addEventListener('locationChanged', handleLocationChange);
    return () =>
      window.removeEventListener('locationChanged', handleLocationChange);
  }, [dispatch, products, fetchStoreDetails, isLocationAvailable]);

  /** Background revalidation */
  useEffect(() => {
    if (isStale && !loading && !backgroundLoading && !isStoreBlocked) {
      const params: ProductCacheKey = {
        categoryName,
        searchTerm,
        storeId,
        page: currentPage,
        sortBy,
        direction,
      };
      dispatch(revalidateProductsInBackground(params));
    }
  }, [
    isStale,
    loading,
    backgroundLoading,
    categoryName,
    searchTerm,
    storeId,
    currentPage,
    sortBy,
    direction,
    dispatch,
    isStoreBlocked,
  ]);

  /** Fetch store details if available */
  useEffect(() => {
    if (!isLocationAvailable || !products.length) return;
    const uniqueIds = new Set(
      products
        .map((p) => (p.storeId || p.store?.storeId)?.toString())
        .filter((id): id is string => Boolean(id))
    );
    uniqueIds.forEach((id) => {
      if (!storeDetails[id] && !isLoading(id)) fetchStoreDetails(id);
    });
  }, [
    products,
    storeDetails,
    fetchStoreDetails,
    isLoading,
    isLocationAvailable,
  ]);

  /** Pagination handler */
  const handlePageChange = (page: number) => {
    if (externalOnPageChange) externalOnPageChange(page);
    else setCurrentPage(page);
  };

  /** 🚫 Hide everything if blocked */
  if (storeId && isStoreBlocked === null) {
    return <ProductSkeleton count={5} />;
  }

  if (storeId && isStoreBlocked === true) {
    return (
      <div className={styles.emptyContainer}>
        <Image
          src="/images/products/blocked.png"
          alt="Blocked store"
          width={90}
          height={90}
          className={styles.emptyImage}
        />
        <p className={styles.emptyText}>
          이 매장은 차단되어 있어 상품을 표시할 수 없습니다.
        </p>
      </div>
    );
  }

  /** Show skeleton when fetching */
  const shouldShowLoading = loading && !cachedData && !initialProducts;
  if (shouldShowLoading) return <ProductSkeleton count={5} />;

  if (products.length === 0)
    return (
      <div className={styles.emptyContainer}>
        <Image
          src="/images/products/noresult.png"
          alt="No results"
          width={90}
          height={90}
          className={styles.emptyImage}
        />
        <p className={styles.emptyText}>
          {storeId
            ? '이 매장에는 상품이 없습니다.'
            : '해당 카테고리에 등록된 상품이 없습니다.'}
        </p>
      </div>
    );

  return (
    <div className={styles.mainContainer}>
      <div className={styles.grid}>
        {products.map((product) => {
          const productId = product.productId ?? product.id;
          if (!productId) return null;

          const productIdStr = String(productId);
          const isFav = isFavorited(productIdStr);
          const productStoreId =
            (product.storeId ?? product.store?.storeId)?.toString() || '';
          const details = productStoreId
            ? getStoreDetails(productStoreId)
            : null;

          return (
            <div
              key={productIdStr}
              className={styles.card}
              onClick={() =>
                onProductClick
                  ? onProductClick(product)
                  : router.push(`/client/pages/products/${productIdStr}`)
              }
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={
                    imageErrors[productIdStr]
                      ? '/images/products/product-fallback.svg'
                      : product.thumbnail ||
                        product.image ||
                        (product as Product & { images?: string[] })
                          .images?.[0] ||
                        '/images/products/product-fallback.svg'
                  }
                  alt={product.name || product.productName || 'Product'}
                  width={120}
                  height={120}
                  className={styles.image}
                  unoptimized
                  onError={() => handleImageError(productIdStr)}
                />
              </div>
              <div className={styles.content}>
                <div className={styles.header}>
                  <h3 className={styles.name}>
                    {product.name || product.productName}
                  </h3>
                  <div className={styles.icons}>
                    <button
                      className={styles.iconBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart?.(product);
                        setSelectedProduct(product);
                        setCartOpen(true);
                      }}
                    >
                      <Image
                        src="/images/icons/Cart.png"
                        alt="Cart Icon"
                        width={24}
                        height={22}
                      />
                    </button>
                    <button
                      className={styles.iconBtn}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await toggleFavorite(productIdStr);
                      }}
                    >
                      <Image
                        src={
                          isFav
                            ? '/images/products/heart-active.png'
                            : '/images/products/heart-default.png'
                        }
                        alt="Heart Icon"
                        width={24}
                        height={22}
                      />
                    </button>
                  </div>
                </div>
                <p className={styles.price}>
                  {(() => {
                    const high =
                      product.salePrice ||
                      product.price ||
                      product.originalPrice ||
                      product.regularPrice ||
                      product.productPrice;
                    const low =
                      product.discountedPrice || product.discountPrice;

                    if (high && low && high !== low) {
                      return (
                        <>
                          <span className={styles.original}>
                            {high.toLocaleString('ko-KR')}원
                          </span>
                          <span className={styles.discount}>
                            {low.toLocaleString('ko-KR')}원
                          </span>
                        </>
                      );
                    }
                    const show = low || high || 0;
                    return `${show.toLocaleString('ko-KR')}원`;
                  })()}
                </p>
                {(() => {
                  const expirationDate =
                    product.expiryDate ||
                    product.expirationDate ||
                    product.expiration;
                  const formattedDate = formatExpirationDate(expirationDate);
                  return formattedDate ? (
                    <p className={styles.expiration}>{formattedDate}</p>
                  ) : null;
                })()}
                <p className={styles.info}>
                  {formatAddressForDisplay(product.store?.address || '')}
                  <br />
                  {details?.distanceKm
                    ? `${details.distanceKm.toFixed(1)}km`
                    : product.distance || '∞km'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {pageInfo.totalPages > 1 && (
        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
      )}

      {selectedProduct && (
        <CartModal
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          productName={
            selectedProduct.name || selectedProduct.productName || 'Product'
          }
          productPrice={
            selectedProduct.discountedPrice ||
            selectedProduct.discountPrice ||
            selectedProduct.price ||
            0
          }
          productId={String(selectedProduct.productId ?? selectedProduct.id)}
          storeId={String(
            selectedProduct.storeId ?? selectedProduct.store?.storeId ?? ''
          )}
        />
      )}
    </div>
  );
};

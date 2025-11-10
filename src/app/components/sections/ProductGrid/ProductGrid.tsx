'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './ProductGrid.module.css';
import { useFavorites } from '@/app/context/FavoritesContext';
import { Product } from '@/app/api/types/products/products';
import ProductSkeleton from '../../ui/SkeletonLoading/ProductSkeleton/ProductSkeleton';
import { CartModal } from '../../ui/modal/CartModal/CartModal';
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
import { MemberService } from '@/app/api/services/client/memberService/memberService';

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
  onProductClick,
  onAddToCart,
  sortBy = 'createdAt',
  direction = 'desc',
}: ProductGridProps) => {
  const { toggleFavorite, isFavorited } = useFavorites();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLocationAvailable } = useLocationState();
  const { storeDetails, fetchStoreDetails, getStoreDetails, isLoading } =
    useStoreDetails();

  const { cache, loading, backgroundLoading, isStale } = useAppSelector(
    (state) => state.products
  );

  const [accumulatedProducts, setAccumulatedProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [isStoreBlocked, setIsStoreBlocked] = useState<boolean | null>(null);
  const [blockedStoreIds, setBlockedStoreIds] = useState<Set<string>>(
    new Set()
  );
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const cacheRef = useRef(cache);
  const previousProductsRef = useRef<string>('');
  const lastLoadParamsRef = useRef<string>('');
  const loadPageRef = useRef<((page: number) => Promise<void>) | null>(null);

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

  /** 🔍 Check if store is blocked (for seller-details page) */
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

  /** 🔍 Fetch blocked stores list (for homepage) */
  useEffect(() => {
    const fetchBlockedStores = async () => {
      // Only fetch on homepage (when storeId is not provided)
      if (storeId) return;

      try {
        const memberRes = await MemberService.getMyInfo();
        if (memberRes.error || !memberRes.data?.data?.memberId) {
          return;
        }

        const memberId = memberRes.data.data.memberId;

        // Fetch all blocked stores (with pagination if needed)
        const blockedRes = await BlockService.getBlocksByMember(memberId, {
          page: 0,
          size: 1000, // Get all blocked stores
          sortBy: 'createdAt',
          direction: 'desc',
        });

        if (blockedRes.error || !blockedRes.data?.data?.content) {
          return;
        }

        const blockedStoreIdSet = new Set(
          blockedRes.data.data.content.map((block) => block.storeId)
        );
        setBlockedStoreIds(blockedStoreIdSet);
      } catch (err) {
        console.error('[ProductGrid] Failed to fetch blocked stores', err);
      }
    };
    fetchBlockedStores();
  }, [storeId]);

  /** Cache key per combination */
  const getCacheKey = useCallback(
    (page: number): string => {
      const normalizedCategory = categoryName?.trim() || 'all';
      return `${
        storeId || 'general'
      }_${normalizedCategory}_${searchTerm}_${page}_${sortBy || 'createdAt'}_${
        direction || 'desc'
      }`;
    },
    [storeId, categoryName, searchTerm, sortBy, direction]
  );

  const products = useMemo(() => {
    let productList: Product[];
    if (initialProducts && currentPage === 0) {
      productList = initialProducts;
    } else {
      productList = accumulatedProducts;
    }

    // Filter out products from blocked stores (only on homepage)
    if (!storeId && blockedStoreIds.size > 0) {
      return productList.filter((product) => {
        const productStoreId = (
          product.storeId ?? product.store?.storeId
        )?.toString();
        return !productStoreId || !blockedStoreIds.has(productStoreId);
      });
    }

    return productList;
  }, [
    accumulatedProducts,
    initialProducts,
    currentPage,
    storeId,
    blockedStoreIds,
  ]);

  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  /** Reset image errors when products change */
  useEffect(() => {
    const currentProductsKey = products
      .map((p) => String(p.productId ?? p.id ?? ''))
      .join(',');

    if (previousProductsRef.current !== currentProductsKey) {
      previousProductsRef.current = currentProductsKey;
      setImageErrors({});
    }
  }, [products]);

  /** Load products for a specific page */
  const loadPage = useCallback(
    async (page: number) => {
      if (isStoreBlocked || isLoadingMore) return;

      const key: ProductCacheKey = {
        categoryName,
        searchTerm,
        storeId,
        page,
        sortBy,
        direction,
      };

      const cacheKey = getCacheKey(page);
      const cached = cacheRef.current[cacheKey];

      if (cached && cached.products.length > 0) {
        if (page === 0) {
          setAccumulatedProducts(cached.products);
        } else {
          setAccumulatedProducts((prev) => [...prev, ...cached.products]);
        }
        setHasMore(cached.pageInfo.hasNext || false);
        setHasLoadedOnce(true);
        return;
      }

      setIsLoadingMore(true);
      try {
        const result = await dispatch(fetchProducts(key)).unwrap();

        if (result && result.data) {
          const pageProducts = result.data.products;
          const pageInfo = result.data.pageInfo;

          if (page === 0) {
            setAccumulatedProducts(pageProducts);
          } else {
            setAccumulatedProducts((prev) => [...prev, ...pageProducts]);
          }
          setHasMore(pageInfo.hasNext || false);
          setHasLoadedOnce(true);
        } else {
          const updatedCache = cacheRef.current[cacheKey];
          if (updatedCache) {
            if (page === 0) {
              setAccumulatedProducts(updatedCache.products);
            } else {
              setAccumulatedProducts((prev) => [
                ...prev,
                ...updatedCache.products,
              ]);
            }
            setHasMore(updatedCache.pageInfo.hasNext || false);
            setHasLoadedOnce(true);
          }
        }
      } catch (error) {
        console.error('[ProductGrid] Failed to load page:', error);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [
      categoryName,
      searchTerm,
      storeId,
      sortBy,
      direction,
      dispatch,
      isStoreBlocked,
      isLoadingMore,
      getCacheKey,
    ]
  );

  /** Update loadPage ref when it changes */
  useEffect(() => {
    loadPageRef.current = loadPage;
  }, [loadPage]);

  /** Load initial page */
  useEffect(() => {
    if (initialProducts) {
      setAccumulatedProducts(initialProducts);
      setCurrentPage(0);
      setHasMore(true);
      setHasLoadedOnce(true);
      const normalizedCategory = categoryName?.trim() || 'all';
      lastLoadParamsRef.current = `initial_${
        storeId || 'general'
      }_${normalizedCategory}_${searchTerm}_${sortBy}_${direction}`;
      return;
    }

    // Wait for block status to be determined
    if (isStoreBlocked === null) return;
    if (isStoreBlocked === true) return;

    // Normalize categoryName: empty string becomes undefined, then 'all' for cache key
    const normalizedCategory = categoryName?.trim() || 'all';

    // Create a stable key for the current load parameters
    const paramsKey = `${
      storeId || 'general'
    }_${normalizedCategory}_${searchTerm}_${sortBy}_${direction}`;

    // Only load if parameters actually changed
    if (lastLoadParamsRef.current === paramsKey) {
      return;
    }

    lastLoadParamsRef.current = paramsKey;
    setCurrentPage(0);
    setAccumulatedProducts([]);
    setHasMore(true);
    setHasLoadedOnce(false);

    // Use ref to call loadPage to avoid dependency issues, fallback to direct call
    const loadFn = loadPageRef.current || loadPage;
    loadFn(0);
  }, [
    categoryName,
    searchTerm,
    storeId,
    sortBy,
    direction,
    initialProducts,
    isStoreBlocked,
    loadPage,
  ]);

  /** Load more when scrolling to bottom */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !loading
        ) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadPage(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loading, currentPage, loadPage]);

  /** Handle location change invalidation */
  useEffect(() => {
    const handleLocationChange = () => {
      dispatch(invalidateCacheForLocationChange());
      setAccumulatedProducts([]);
      setCurrentPage(0);
      setHasMore(true);
      if (isLocationAvailable && products.length) {
        const uniqueStoreIds = new Set(
          products
            .map((p) => (p.storeId || p.store?.storeId)?.toString())
            .filter((id): id is string => Boolean(id))
        );
        uniqueStoreIds.forEach((id) => fetchStoreDetails(id));
      }
      if (!initialProducts && !isStoreBlocked) {
        loadPage(0);
      }
    };
    window.addEventListener('locationChanged', handleLocationChange);
    return () =>
      window.removeEventListener('locationChanged', handleLocationChange);
  }, [
    dispatch,
    products,
    fetchStoreDetails,
    isLocationAvailable,
    initialProducts,
    isStoreBlocked,
    loadPage,
  ]);

  /** Background revalidation */
  useEffect(() => {
    if (isStale && !loading && !backgroundLoading && !isStoreBlocked) {
      const params: ProductCacheKey = {
        categoryName,
        searchTerm,
        storeId,
        page: 0,
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

  /** Show skeleton only when fetching initial data (first load, no products yet) */
  const hasProducts =
    accumulatedProducts.length > 0 ||
    (initialProducts && initialProducts.length > 0);

  // Check if we have products after filtering
  const hasFilteredProducts = products.length > 0;

  if (hasFilteredProducts) {
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

        {hasMore && (
          <div ref={observerTarget} style={{ height: '20px', width: '100%' }} />
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
  }

  const shouldShowLoading =
    accumulatedProducts.length === 0 &&
    !hasLoadedOnce &&
    currentPage === 0 &&
    !isStoreBlocked &&
    (loading || isLoadingMore);

  if (shouldShowLoading) return <ProductSkeleton count={5} />;

  if (products.length === 0 && !loading && !isLoadingMore)
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

  return null;
};

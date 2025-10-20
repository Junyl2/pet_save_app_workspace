'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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

interface ProductGridProps {
  products?: Product[];
  category?: string;
  searchTerm?: string;
  storeId?: string;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductGrid = ({
  products: initialProducts,
  category,
  searchTerm = '',
  storeId,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange,
  onProductClick,
  onAddToCart,
}: ProductGridProps) => {
  const { toggleFavorite, isFavorited } = useFavorites();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Store details hook
  const {
    storeDetails,
    fetchStoreDetails,
    getStoreDetails,
    isLoading: isStoreLoading,
  } = useStoreDetails();

  // Redux state
  const { cache, loading, backgroundLoading, isStale } = useAppSelector(
    (state) => state.products
  );

  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  // Get current cache key
  const getCurrentCacheKey = (): string => {
    return `${storeId || 'general'}_${category || 'all'}_${
      searchTerm || ''
    }_${currentPage}`;
  };

  // Get current products and page info from cache
  const currentCacheKeyString = getCurrentCacheKey();
  const cachedData = cache[currentCacheKeyString];
  const products = useMemo(() => {
    return cachedData?.products || initialProducts || [];
  }, [cachedData?.products, initialProducts]);
  const pageInfo = cachedData?.pageInfo || {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    first: true,
    last: false,
    hasNext: false,
    hasPrevious: false,
  };

  // Sync external currentPage with internal state
  useEffect(() => {
    if (
      externalCurrentPage !== undefined &&
      externalCurrentPage !== currentPage
    ) {
      setCurrentPage(externalCurrentPage);
    }
  }, [externalCurrentPage, currentPage]);

  // Fetch products using Redux
  useEffect(() => {
    if (initialProducts) return;

    const cacheKeyParams: ProductCacheKey = {
      category,
      searchTerm,
      storeId,
      page: currentPage,
    };

    console.log('Dispatching fetchProducts with params:', cacheKeyParams);
    dispatch(fetchProducts(cacheKeyParams));
  }, [category, searchTerm, storeId, currentPage, initialProducts, dispatch]);

  // Reset pagination when category or search term changes (but not when currentPage changes)
  // Only reset if we're not using external pagination control
  useEffect(() => {
    if (initialProducts || externalOnPageChange) return;
    console.log('Category or search term changed, resetting to page 0');
    setCurrentPage(0);
  }, [category, searchTerm, storeId, initialProducts, externalOnPageChange]);

  // Debug useEffect to track currentPage changes
  useEffect(() => {
    console.log('currentPage changed to:', currentPage);
  }, [currentPage]);

  // Listen for location changes and invalidate cache
  useEffect(() => {
    const handleLocationChange = () => {
      console.log('📍 Location changed, invalidating product cache');
      dispatch(invalidateCacheForLocationChange());
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () =>
      window.removeEventListener('locationChanged', handleLocationChange);
  }, [dispatch]);

  // Background revalidation when data becomes stale
  useEffect(() => {
    if (isStale && !loading && !backgroundLoading) {
      console.log('🔄 Data is stale, starting background revalidation');
      const cacheKeyParams: ProductCacheKey = {
        category,
        searchTerm,
        storeId,
        page: currentPage,
      };
      dispatch(revalidateProductsInBackground(cacheKeyParams));
    }
  }, [
    isStale,
    loading,
    backgroundLoading,
    category,
    searchTerm,
    storeId,
    currentPage,
    dispatch,
  ]);

  // Fetch store details for all products
  useEffect(() => {
    if (products.length === 0) return;

    console.log('🔄 Fetching store details for products:', products.length);

    // Get unique store IDs from products
    const uniqueStoreIds = new Set<string>();

    products.forEach((product) => {
      const productStoreId = product.storeId || product.store?.storeId;
      if (productStoreId) {
        uniqueStoreIds.add(String(productStoreId));
      }
    });

    // Fetch store details for each unique store ID
    uniqueStoreIds.forEach((storeId) => {
      if (!storeDetails[storeId] && !isStoreLoading(storeId)) {
        console.log('🔍 Fetching details for storeId:', storeId);
        fetchStoreDetails(storeId);
      }
    });
  }, [products, fetchStoreDetails, storeDetails, isStoreLoading]);

  const handlePageChange = (page: number) => {
    console.log('ProductGrid: handlePageChange called with page:', page);
    if (externalOnPageChange) {
      externalOnPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  // Show loading only if we don't have cached data and are loading
  const shouldShowLoading = loading && !cachedData && !initialProducts;
  if (shouldShowLoading) return <ProductSkeleton count={5} />;

  // Show background loading indicator if data is being revalidated
  const showBackgroundLoading = backgroundLoading && cachedData;

  if (products.length === 0)
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>
          {storeId ? '이 스토어의 상품이 없습니다.' : '검색 결과가 없습니다.'}
        </p>
      </div>
    );

  return (
    <div className={styles.mainContainer}>
      {/* Background loading indicator */}
      {showBackgroundLoading && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000,
          }}
        >
          🔄 업데이트 중...
        </div>
      )}
      <div className={styles.grid}>
        {products.map((product) => {
          // Add safety check for product.id (API uses productId)
          const productId = product?.productId || product?.id;
          if (!product || !productId) {
            console.warn('Product missing id:', product);
            return null;
          }

          const isProductFavorited = isFavorited(productId.toString());

          // Get store details for this product
          const productStoreId = product.storeId || product.store?.storeId;
          const storeDetails = productStoreId
            ? getStoreDetails(String(productStoreId))
            : null;

          return (
            <div
              key={productId}
              className={styles.card}
              onClick={() => {
                if (onProductClick) {
                  onProductClick(product);
                } else {
                  router.push(`/client/pages/products/${productId}`);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={
                    product.thumbnail ||
                    product.image ||
                    (product as Product & { images?: string[] }).images?.[0] ||
                    '/placeholder.png'
                  }
                  alt={product.name || product.productName || 'Product'}
                  width={120}
                  height={120}
                  className={styles.image}
                  unoptimized={(
                    product.thumbnail ||
                    product.image ||
                    (product as Product & { images?: string[] }).images?.[0] ||
                    ''
                  ).includes('211.107.13.167')}
                />
              </div>
              <div className={styles.content}>
                <div className={styles.header}>
                  <h3 className={styles.name}>
                    {product.name || product.productName || 'Unnamed Product'}
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
                        src={'/images/icons/Cart.png'}
                        alt="Cart Icon"
                        width={24}
                        height={22}
                        className="object-contain"
                      />
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await toggleFavorite(productId.toString());
                      }}
                      className={styles.iconBtn}
                    >
                      <Image
                        src={
                          isProductFavorited
                            ? '/images/products/heart-active.png'
                            : '/images/products/heart-default.png'
                        }
                        alt="Heart Icon"
                        width={24}
                        height={22}
                        className="object-contain"
                      />
                    </button>
                  </div>
                </div>
                <p className={styles.detail}>
                  {/*   {product.weight || product.productWeight || 'N/A'} */}
                </p>
                <p className={styles.price}>
                  {(() => {
                    // For your API: salePrice is the higher price, discountedPrice is the lower price
                    const higherPrice =
                      product.salePrice ||
                      product.price ||
                      product.originalPrice ||
                      product.regularPrice ||
                      product.productPrice;
                    const lowerPrice =
                      product.discountedPrice || product.discountPrice;

                    // If we have both prices and they're different, show both with strike-through
                    if (
                      higherPrice &&
                      lowerPrice &&
                      higherPrice !== lowerPrice
                    ) {
                      return (
                        <>
                          <span className={styles.original}>
                            {higherPrice.toLocaleString('ko-KR')}원
                          </span>
                          <span className={styles.discount}>
                            {lowerPrice.toLocaleString('ko-KR')}원
                          </span>
                        </>
                      );
                    }
                    // If we only have one price, show it
                    else if (higherPrice || lowerPrice) {
                      const priceToShow = higherPrice || lowerPrice || 0;
                      return `${priceToShow.toLocaleString('ko-KR')}원`;
                    }
                    // Fallback
                    else {
                      return '0원';
                    }
                  })()}
                </p>
                <p className={styles.info}>
                  {product.expiryDate
                    ? new Date(product.expiryDate).toLocaleDateString('ko-KR') +
                      '까지'
                    : product.expiration || 'N/A'}{' '}
                  <br />
                  {formatAddressForDisplay(product.store?.address || '')} <br />
                  {/* Show distanceKm from store details if available, otherwise fallback to existing distance */}
                  {storeDetails?.distanceKm !== null &&
                  storeDetails?.distanceKm !== undefined
                    ? `${storeDetails.distanceKm.toFixed(1)}km`
                    : product.distance || product.storeDistance || 'N/A'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination - show if there are multiple pages */}
      {pageInfo.totalPages > 1 && (
        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
      )}

      {/* cart modal */}
      {selectedProduct && (
        <CartModal
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          productName={
            selectedProduct.name || selectedProduct.productName || 'Product'
          }
          productPrice={(() => {
            // Use the lower price (discounted price) for cart
            const lowerPrice =
              selectedProduct.discountedPrice || selectedProduct.discountPrice;
            const higherPrice =
              selectedProduct.salePrice ||
              selectedProduct.price ||
              selectedProduct.originalPrice ||
              selectedProduct.regularPrice ||
              selectedProduct.productPrice;
            return lowerPrice || higherPrice || 0;
          })()}
          productId={String(selectedProduct.productId || selectedProduct.id)}
          storeId={String(
            selectedProduct.storeId || selectedProduct.store?.storeId
          )}
        />
      )}
    </div>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './ProductGrid.module.css';
import { useFavorites } from '@/app/context/FavoritesContext';
import { Product, ProductPageInfo } from '@/app/api/types/products/products';
import { ProductService } from '@/app/api/services/client/productService/productService';
import { SellerProductListService } from '@/app/api/services/client/productService/sellerProductListService';
import ProductSkeleton from '../../ui/SkeletonLoading/ProductSkeleton/ProductSkeleton';
import { CartModal } from '../../ui/modal/CartModal/CartModal';
import { Pagination } from '../../ui/Pagination';
import { formatAddressForDisplay } from '@/app/utils/address-utils';

interface ProductGridProps {
  products?: Product[];
  category?: string;
  searchTerm?: string;
  storeId?: string;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductGrid = ({
  products: initialProducts,
  category,
  searchTerm = '',
  storeId,
  onProductClick,
  onAddToCart,
}: ProductGridProps) => {
  const { toggleFavorite, isFavorited } = useFavorites();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInfo, setPageInfo] = useState<ProductPageInfo>({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    first: true,
    last: false,
    hasNext: false,
    hasPrevious: false,
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (initialProducts) return;

    let isMounted = true;

    const fetchProducts = async () => {
      console.log('fetchProducts called with currentPage:', currentPage);
      setLoading(true);
      try {
        let res;

        if (storeId) {
          // Use store-specific API when storeId is provided
          const storeParams = {
            storeId,
            keyword: searchTerm.trim() || undefined,
            categoryName: category || undefined,
            registrationStatus: 'ONSALE' as const,
            page: currentPage,
            size: 10,
            sortBy: 'createdAt' as const,
            direction: 'desc' as const,
          };

          console.log('Store API call params:', storeParams);
          res = await SellerProductListService.getProductsByStoreId(
            storeParams
          );
        } else {
          // Use general product search API
          const searchParams = {
            keyword: searchTerm.trim() || undefined,
            categoryName: category || undefined,
            registrationStatus: 'ONSALE' as const,
            page: currentPage,
            size: 10,
            sortBy: 'createdAt' as const,
            direction: 'desc' as const,
          };

          console.log('General API call params:', searchParams);
          res = await ProductService.searchProducts(searchParams);
        }

        if (!isMounted) return;

        if (res.error) {
          console.error('Failed to fetch products:', res.error);
          setProducts([]);
        } else {
          const filtered = res.data?.data?.content || [];

          // Update pagination info - API returns pagination in pageInfo object
          const apiPageInfo = res.data?.data?.pageInfo;
          const totalPages = apiPageInfo?.totalPages || 0;
          const totalElements = apiPageInfo?.totalElements || 0;

          setPageInfo(
            apiPageInfo || {
              totalElements: 0,
              totalPages: 0,
              currentPage: 0,
              pageSize: 10,
              first: true,
              last: false,
              hasNext: false,
              hasPrevious: false,
            }
          );

          // Debug pagination info
          console.log('Pagination Debug:', {
            storeId,
            totalPages,
            totalElements,
            currentPage,
            contentLength: filtered.length,
            pageInfo: apiPageInfo,
            fullApiResponse: res.data?.data,
          });

          // Debug: Log the first product to see the actual API structure
          if (filtered.length > 0) {
            const firstProduct = filtered[0] as Product & {
              thumbnail?: string;
              image?: string;
              images?: string[];
              price?: number;
              originalPrice?: number;
              discountPrice?: number;
              discountedPrice?: number;
              salePrice?: number;
              productPrice?: number;
              regularPrice?: number;
            };
            console.log('First product from API:', firstProduct);
            console.log('Product keys:', Object.keys(firstProduct));
            console.log('Image fields:', {
              thumbnail: firstProduct.thumbnail,
              image: firstProduct.image,
              images: firstProduct.images,
            });
            console.log('Price fields:', {
              price: firstProduct.price,
              originalPrice: firstProduct.originalPrice,
              discountPrice: firstProduct.discountPrice,
              discountedPrice: firstProduct.discountedPrice,
              salePrice: firstProduct.salePrice,
              productPrice: firstProduct.productPrice,
              regularPrice: firstProduct.regularPrice,
            });
          }

          // No need to filter by storeId when using store-specific API
          // The API already returns only products for that store

          console.log('Setting products:', filtered.length, 'products');
          console.log('First product ID:', filtered[0]?.productId);
          setProducts(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        if (!isMounted) return;
        setProducts([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [category, searchTerm, storeId, initialProducts, currentPage]);

  // Reset pagination when category or search term changes (but not when currentPage changes)
  useEffect(() => {
    if (initialProducts) return;
    console.log('Category or search term changed, resetting to page 0');
    setCurrentPage(0);
  }, [category, searchTerm, storeId, initialProducts]);

  // Debug useEffect to track currentPage changes
  useEffect(() => {
    console.log('currentPage changed to:', currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    console.log('ProductGrid: handlePageChange called with page:', page);
    setCurrentPage(page);
  };

  if (loading) return <ProductSkeleton count={5} />;

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
      <div className={styles.grid}>
        {products.map((product) => {
          // Add safety check for product.id (API uses productId)
          const productId = product?.productId || product?.id;
          if (!product || !productId) {
            console.warn('Product missing id:', product);
            return null;
          }

          const isProductFavorited = isFavorited(productId.toString());

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
                {(() => {
                  // Check for thumbnail first, then image, then first image from images array
                  const productWithImages = product as Product & {
                    images?: string[];
                  };
                  const imageUrl =
                    product.thumbnail ||
                    product.image ||
                    (productWithImages.images &&
                    productWithImages.images.length > 0
                      ? productWithImages.images[0]
                      : null);

                  return imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name || product.productName || 'Product'}
                      width={120}
                      height={120}
                      className={styles.image}
                      unoptimized={imageUrl.includes('211.107.13.167')}
                      onError={(e) => {
                        console.warn('Image failed to load:', imageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>No Image</span>
                    </div>
                  );
                })()}
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
                  {product.distance || product.storeDistance || 'N/A'}
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

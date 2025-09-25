'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './ProductGrid.module.css';
import { useFavorites } from '@/app/context/FavoritesContext';
import { Product } from '@/app/api/types/products/products';
import { ProductService } from '@/app/api/services/client/productService/productService';
import ProductSkeleton from '../../ui/SkeletonLoading/ProductSkeleton/ProductSkeleton';
import { CartModal } from '../../ui/modal/CartModal/CartModal';

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
  const { favorites, toggleFavorite, isFavorited } = useFavorites();

  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (initialProducts) return;

    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const searchParams = {
          keyword: searchTerm.trim() || undefined,
          categoryName: category || undefined,
          registrationStatus: 'ONSALE' as const,
          page: 0,
          size: 50,
          sortBy: 'createdAt' as const,
          direction: 'desc' as const,
        };

        const res = await ProductService.searchProducts(searchParams);
        if (!isMounted) return;

        if (res.error) {
          console.error('Failed to fetch products:', res.error);
          setProducts([]);
        } else {
          let filtered = res.data?.data?.content || [];

          // Debug: Log the first product to see the actual API structure
          if (filtered.length > 0) {
            console.log('First product from API:', filtered[0]);
            console.log('Product keys:', Object.keys(filtered[0]));
            console.log('Price fields:', {
              price: filtered[0].price,
              originalPrice: filtered[0].originalPrice,
              discountPrice: filtered[0].discountPrice,
              discountedPrice: filtered[0].discountedPrice,
              salePrice: filtered[0].salePrice,
              productPrice: filtered[0].productPrice,
              regularPrice: filtered[0].regularPrice,
            });
          }

          // Filter by storeId if provided
          if (storeId) {
            filtered = filtered.filter(
              (p) => p.storeId === storeId || p.store?.storeId === storeId
            );
          }

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
  }, [category, searchTerm, storeId, initialProducts]);

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
          const productId = product?.id || product?.productId;
          if (!product || !productId) {
            console.warn('Product missing id:', product);
            return null;
          }

          const isProductFavorited = isFavorited(productId.toString());

          return (
            <div
              key={productId}
              className={styles.card}
              onClick={() => onProductClick?.(product)}
              style={{ cursor: onProductClick ? 'pointer' : 'default' }}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={
                    product.image ||
                    product.thumbnail ||
                    '/images/products/placeholder.png'
                  }
                  alt={product.name || product.productName || 'Product'}
                  width={120}
                  height={120}
                  className={styles.image}
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
                  {product.weight || product.productWeight || 'N/A'},{' '}
                  {product.quantity || product.productQuantity || 'N/A'}
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
                  {product.store?.name || product.location || 'N/A'} <br />
                  {product.distance || product.storeDistance || 'N/A'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

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
        />
      )}
    </div>
  );
};

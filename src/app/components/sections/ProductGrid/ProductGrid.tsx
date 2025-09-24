'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './ProductGrid.module.css';
import { useFavorites } from '@/app/context/FavoritesContext';
import { Product } from '@/app/api/types/products/products';
import { productService } from '@/app/api/services/product-service/productService';
import ProductSkeleton from '../../ui/SkeletonLoading/ProductSkeleton/ProductSkeleton';
import { CartModal } from '../../ui/modal/CartModal/CartModal';

interface ProductGridProps {
  products?: Product[];
  category?: string;
  searchTerm?: string;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductGrid = ({
  products: initialProducts,
  category,
  searchTerm = '',
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
        const res = await productService.getAll();
        if (!isMounted) return;

        let filtered = res.data || [];

        if (category) {
          filtered = filtered.filter((p) => p.category === category);
        }

        if (searchTerm.trim()) {
          filtered = filtered.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setProducts(filtered);
      } catch {
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
  }, [category, searchTerm, initialProducts]);

  if (loading) return <ProductSkeleton count={5} />;

  if (products.length === 0)
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>검색 결과가 없습니다.</p>
      </div>
    );

  return (
    <div className={styles.mainContainer}>
      <div className={styles.grid}>
        {products.map((product) => {
          const isProductFavorited = isFavorited(product.id);

          return (
            <div
              key={product.id}
              className={styles.card}
              onClick={() => onProductClick?.(product)}
              style={{ cursor: onProductClick ? 'pointer' : 'default' }}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={product.image ?? '/images/products/placeholder.png'}
                  alt={product.name}
                  width={120}
                  height={120}
                  className={styles.image}
                />
              </div>
              <div className={styles.content}>
                <div className={styles.header}>
                  <h3 className={styles.name}>{product.name}</h3>
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
                        await toggleFavorite(product.id);
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
                  {product.weight}, {product.quantity}
                </p>
                <p className={styles.price}>
                  {product.discountPrice ? (
                    <>
                      <span className={styles.original}>
                        {product.price.toLocaleString('ko-KR')}원
                      </span>
                      <span className={styles.discount}>
                        {product.discountPrice.toLocaleString('ko-KR')}원
                      </span>
                    </>
                  ) : (
                    `${product.price.toLocaleString('ko-KR')}원`
                  )}
                </p>
                <p className={styles.info}>
                  {product.expiration} <br />
                  {product.location} <br />
                  {product.distance}
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
          productName={selectedProduct.name}
          productPrice={selectedProduct.discountPrice ?? selectedProduct.price}
        />
      )}
    </div>
  );
};

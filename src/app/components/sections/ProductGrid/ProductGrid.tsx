'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './ProductGrid.module.css';
import { useFavorites } from '@/app/context/FavoritesContext';
import { Product } from '@/app/api/types/products/products';
import { productService } from '@/app/api/services/product-service/productService';
import { CartModal } from '../../ui/modal/CartModal/CartModal';
import ProductSkeleton from './ProductSkeleton';

interface ProductGridProps {
  category: string;
  searchTerm?: string;
}

export default function ProductGrid({
  category,
  searchTerm = '',
}: ProductGridProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true); // show skeleton immediately
      setProducts([]);

      try {
        const res = await productService.getAll();
        if (!isMounted) return;

        let filtered = res.data || [];
        filtered = filtered.filter((p) => p.category === category);

        if (searchTerm.trim()) {
          filtered = filtered.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setProducts(filtered);
      } catch {
        if (!isMounted) return;
        setProducts([]); // ignore errors
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [category, searchTerm]);

  const handleProductClick = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  const handleCartClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setCartOpen(true);
  };

  return (
    <section className={styles.mainContainer}>
      <div className={styles.grid}>
        {loading ? (
          <ProductSkeleton count={5} />
        ) : products.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p className={styles.emptyText}>검색 결과가 없습니다.</p>
          </div>
        ) : (
          products.map((product) => {
            const isFavorited = favorites.includes(product.id);

            return (
              <div
                key={product.id}
                className={styles.card}
                onClick={() => handleProductClick(product)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={product.image}
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
                        onClick={(e) => handleCartClick(e, product)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className={styles.iconBtn}
                      >
                        <Image
                          src={
                            isFavorited
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
                        <span className={styles.original}>{product.price}</span>
                        <span className={styles.discount}>
                          {product.discountPrice}
                        </span>
                      </>
                    ) : (
                      product.price
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
          })
        )}
      </div>

      {/* Cart Modal */}
      {selectedProduct && (
        <CartModal
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          productName={selectedProduct.name}
          productPrice={Number(
            (selectedProduct.discountPrice || selectedProduct.price)
              .toString()
              .replace(/,/g, '')
              .replace('원', '')
          )}
        />
      )}
    </section>
  );
}

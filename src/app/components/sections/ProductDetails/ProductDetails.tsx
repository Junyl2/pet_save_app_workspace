'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductHeader } from './Header/ProductHeader';
import { ProductImage } from './Product/ProductImage';
import { ProductInfo } from './Product/ProductInfo';
import { ShopInfo } from './Product/ShopInfo';
import { UsageInstructions } from './Usage/UsageInstructions';
import { ProductActions } from './Actions/ProductActions';
import { CustomerReview } from './Review/CustomerReview';
import { CartModal } from '../../ui/modal/CartModal/CartModal';
import { useFavorites } from '@/app/context/FavoritesContext';
import { productService } from '@/app/api/services/product-service/productService';
import { Product } from '@/app/api/types/products/products';
import styles from './ProductDetails.module.css';

export default function ProductDetails() {
  const params = useParams();
  const productId = Number(params.id);
  const { favorites, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productService.getById(productId);
        if (res.error) setError(res.error);
        else setProduct(res.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) return <p className={styles.message}>로딩 중...</p>;
  if (error) return <p className={styles.message}>에러: {error}</p>;
  if (!product)
    return <p className={styles.message}>상품을 찾을 수 없습니다.</p>;

  return (
    <section className={styles.container}>
      <ProductHeader />
      <ProductImage src={product.image} alt={product.name} />
      <ShopInfo
        shopName={product.shopName}
        shopLocation={product.shopLocation || product.location}
        shopImage={product.shopImage}
        productId={product.id}
      />
      <ProductInfo
        name={product.name}
        expiration={product.expiration}
        price={product.price}
        discountPrice={product.discountPrice}
        details={product.details}
      />
      <UsageInstructions />
      <CustomerReview productId={product.id} />
      <ProductActions onCartOpen={() => setCartOpen(true)} />
      {/* Cart Modal */}
      {cartOpen && (
        <CartModal
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          productName={product.name}
          productPrice={Number(
            (product.discountPrice || product.price)
              .replace(/,/g, '')
              .replace('원', '')
          )}
        />
      )}
    </section>
  );
}

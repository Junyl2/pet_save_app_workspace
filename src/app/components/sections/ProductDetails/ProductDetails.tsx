'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductHeader } from './Header/ProductHeader';
import { ProductImage } from './Product/ProductImage';
import { ProductInfo } from './Product/ProductInfo';
import { ShopInfo } from './Product/ShopInfo';
import { UsageInstructions } from './Usage/UsageInstructions';
import { ProductActions } from './Actions/ProductActions';
import { PreviewReview } from './Review/PreviewReview';
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

  const parsePrice = (price: string | number | undefined): number => {
    if (!price) return 0;
    if (typeof price === 'number') return price;
    return parseFloat(price.replace(/[^\d.]/g, '')) || 0;
  };

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
      <PreviewReview productId={product.id} />
      <ProductActions
        productId={product.id}
        productName={product.name}
        productPrice={product.discountPrice || product.price}
        onAddToCart={(quantity, name) => {
          //open cart modal and handle add
          setCartOpen(true);
          console.log('Added to cart:', quantity, name);
        }}
        onPurchase={(quantity, name) => {
          //  direct purchase flow
          console.log('Purchasing:', quantity, name);
        }}
      />
    </section>
  );
}

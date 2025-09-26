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
/* import { useFavorites } from '@/app/context/FavoritesContext'; */
import { productService } from '@/app/api/services/product-service/productService';
import { Product } from '@/app/api/types/products/products';
import Loading from '../../ui/Loading/Loading';
import styles from './ProductDetails.module.css';

export default function ProductDetails() {
  const { id } = useParams();
  const productId = Number(id);
  /*  const { toggleFavorite } = useFavorites(); */

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  /*  const [cartOpen, setCartOpen] = useState(false); */

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    productService.getById(productId).then((res) => {
      if (!isMounted) return;
      if (!res.error) setProduct(res.data);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) return <Loading />;

  if (!product)
    return <p className={styles.error}>상품을 불러올 수 없습니다.</p>;

  return (
    <section className={styles.container}>
      <ProductHeader />
      <ProductImage src={product.image || ''} alt={product.name || ''} />
      <ShopInfo
        shopName={product.shopName || ''}
        shopLocation={product.shopLocation || product.location || ''}
        shopImage={product.shopImage || ''}
        productId={product.id?.toString() || ''}
      />
      <ProductInfo
        name={product.name || ''}
        expiration={product.expiration || ''}
        price={product.price || 0}
        discountPrice={product.discountPrice || 0}
        details={product.details || []}
      />
      <UsageInstructions />
      <PreviewReview productId={product.id?.toString() || ''} />
      <ProductActions
        productId={product.id?.toString() || ''}
        productName={product.name || ''}
        productPrice={product.discountPrice || product.price || 0}
        onAddToCart={(quantity, name) => {
          /*    setCartOpen(true); */
          console.log('Added to cart:', quantity, name);
        }}
        onPurchase={(quantity, name) => {
          console.log('Purchasing:', quantity, name);
        }}
      />
    </section>
  );
}

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
import { ProductService } from '@/app/api/services/client/productService/productService';
import { ProductSummary } from '@/app/api/types/products/productSummary';
import Loading from '../../ui/Loading/Loading';
import styles from './ProductDetails.module.css';

export default function ProductDetails() {
  const { id } = useParams();
  const productId = Number(id);
  /*  const { toggleFavorite } = useFavorites(); */

  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [loading, setLoading] = useState(true);
  /*  const [cartOpen, setCartOpen] = useState(false); */

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    ProductService.getProductSummary(productId.toString()).then((res) => {
      if (!isMounted) return;
      if (!res.error && res.data) setProduct(res.data.data);
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
      <ProductImage
        src={product.thumbnail || ''}
        alt={product.productName || ''}
        product={product}
      />
      <ShopInfo
        shopName={product.store.name || ''}
        shopLocation={product.store.address || ''}
        shopImage={product.store.profileUrl || ''}
        productId={product.productId || ''}
      />
      <ProductInfo
        name={product.productName || ''}
        expiration={product.expiryDate || ''}
        price={product.salePrice || 0}
        discountPrice={product.discountedPrice || 0}
        details={product.description ? [product.description] : []}
      />
      <UsageInstructions />
      <PreviewReview productId={product.productId || ''} />
      <ProductActions
        productId={product.productId || ''}
        productName={product.productName || ''}
        productPrice={product.discountedPrice || product.salePrice || 0}
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

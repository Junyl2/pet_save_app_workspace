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
import { ProductService } from '@/app/api/services/client/productService/productService';
import Loading from '../../ui/Loading/Loading';
import styles from './ProductDetails.module.css';

// ✅ import the correct types
import {
  ProductDetails as TProductDetails,
  ProductDetailsResponse,
} from '@/app/api/types/products/productSummary';

export default function ProductDetails() {
  //  read the correct param key from your route folder name:
  // If your folder is /products/[productId], use productId below.
  const params = useParams<{ productId: string }>();
  const productId = params?.productId; // keep as string

  const [product, setProduct] = useState<TProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!productId) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[ProductDetails] fetching /details for', productId);

        const res = await ProductService.getProductDetails(productId);
        console.log('[ProductDetails] details response:', res);

        if (res.error) {
          if (!isMounted) return;
          setError(res.error);
          return;
        }

        const data = (res.data as ProductDetailsResponse | undefined)?.data;
        if (!data) {
          if (!isMounted) return;
          setError('Empty response from /products/{id}/details');
          return;
        }

        if (isMounted) setProduct(data);
      } catch (e: unknown) {
        console.error('[ProductDetails] error:', e);
        if (isMounted)
          setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (!productId)
    return <p className={styles.error}>잘못된 경로입니다. (productId 누락)</p>;
  if (loading) return <Loading />;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!product)
    return <p className={styles.error}>상품을 불러올 수 없습니다.</p>;

  // 🔎 additional debug:
  console.log('[ProductDetails] productId:', product.productId);
  console.log('[ProductDetails] images:', product.images);

  return (
    <section className={styles.container}>
      <ProductHeader />

      {/* Pass the full ProductDetails (has images[]) */}
      <ProductImage product={product} />

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
          console.log('Added to cart:', quantity, name);
        }}
        onPurchase={(quantity, name) => {
          console.log('Purchasing:', quantity, name);
        }}
      />
    </section>
  );
}

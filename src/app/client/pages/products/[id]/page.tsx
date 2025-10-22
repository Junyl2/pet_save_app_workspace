'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { ProductImage } from '@/app/components/sections/ProductDetails/Product/ProductImage';
import { ProductInfo } from '@/app/components/sections/ProductDetails/Product/ProductInfo';
import { ShopInfo } from '@/app/components/sections/ProductDetails/Product/ShopInfo';
import { UsageInstructions } from '@/app/components/sections/ProductDetails/Usage/UsageInstructions';
import { ProductActions } from '@/app/components/sections/ProductDetails/Actions/ProductActions';
import { PreviewReview } from '@/app/components/sections/ProductDetails/Review/PreviewReview';
import { ProductService } from '@/app/api/services/client/productService/productService';
import Loading from '@/app/components/ui/Loading/Loading';
import styles from '@/app/components/sections/ProductDetails/ProductDetails.module.css';

import {
  ProductDetails as TProductDetails,
  ProductDetailsResponse,
} from '@/app/api/types/products/productSummary';

export default function ProductDetailPage() {
  // Route folder is [...]/products/[id] so the key is "id"
  const params = useParams() as Record<string, string | undefined>;
  const productId = params.productId ?? params.id; // robust to [productId] or [id]

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

        console.log('[ProductDetailPage] fetching details for', productId);
        const response = await ProductService.getProductDetails(productId);

        console.log('[ProductDetailPage] raw details response:', response);
        if (!isMounted) return;

        if (response.error) {
          setError(response.error || '상품을 불러올 수 없습니다.');
          return;
        }

        const data = (response.data as ProductDetailsResponse | undefined)
          ?.data;
        if (!data) {
          setError('상품 정보를 찾을 수 없습니다.');
          return;
        }

        console.log('[ProductDetailPage] images from /details:', data.images);
        setProduct(data);
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to fetch product details:', err);
        setError('상품을 불러오는 중 오류가 발생했습니다.');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (!productId) {
    return (
      <p className={styles.error}>잘못된 경로입니다. (productId/id 누락)</p>
    );
  }
  if (loading) return <Loading />;
  if (error || !product) {
    return (
      <p className={styles.error}>{error || '상품을 불러올 수 없습니다.'}</p>
    );
  }

  return (
    <section className={styles.container}>
      <ProductHeader />

      {/*  Pass full ProductDetails to get images[] */}
      <ProductImage product={product} />

      <ShopInfo
        shopName={product.store.name}
        shopLocation={product.store.address}
        shopImage={product.store.profileUrl || undefined}
        productId={product.productId}
        storeId={product.store.storeId}
      />

      <ProductInfo
        name={product.productName}
        expiration={product.expiryDate}
        price={product.salePrice}
        discountPrice={product.discountedPrice}
        details={product.description ? [product.description] : []}
        category={product.category}
        quantity={product.quantity}
        averageRating={product.averageRating}
        totalReviews={product.totalReviews}
      />

      <UsageInstructions />
      <PreviewReview productId={product.productId} />

      <ProductActions
        productId={product.productId}
        productName={product.productName}
        productPrice={product.discountedPrice || product.salePrice}
        storeId={product.store.storeId}
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

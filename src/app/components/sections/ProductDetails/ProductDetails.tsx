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
import { ProductSummary } from '@/app/api/types/products/productSummary';
import Loading from '@/app/components/ui/Loading/Loading';
import styles from '@/app/components/sections/ProductDetails/ProductDetails.module.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = id as string;

  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchProduct = async () => {
      try {
        const response = await ProductService.getProductSummary(productId);

        if (!isMounted) return;

        if (response.error) {
          setError('상품을 불러올 수 없습니다.');
        } else if (response.data?.data) {
          setProduct(response.data.data);
        } else {
          setError('상품 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to fetch product:', err);
        setError('상품을 불러오는 중 오류가 발생했습니다.');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) return <Loading />;

  if (error || !product) {
    return (
      <p className={styles.error}>{error || '상품을 불러올 수 없습니다.'}</p>
    );
  }

  return (
    <section className={styles.container}>
      <ProductHeader />
      <ProductImage
        src={product.thumbnail || ''}
        alt={product.productName}
        product={product}
      />
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

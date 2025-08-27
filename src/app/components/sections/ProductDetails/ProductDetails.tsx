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
  const { id } = useParams();
  const productId = Number(id);
  const { toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    productService.getById(productId).then((res) => {
      if (!isMounted) return;
      if (!res.error) setProduct(res.data);
    });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Render nothing until product is ready
  if (!product) return null;

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
          setCartOpen(true);
          console.log('Added to cart:', quantity, name);
        }}
        onPurchase={(quantity, name) => {
          console.log('Purchasing:', quantity, name);
        }}
      />
    </section>
  );
}

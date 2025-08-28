'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import CategoryNav from '@/app/components/sections/TopBar/CategoryNav/CategoryNav';
import { ProductGrid } from '@/app/components/sections/ProductGrid/ProductGrid';
import { productService } from '@/app/api/services/product-service/productService';
import { Product } from '@/app/api/types/products/products';
import styles from './styles.module.css';

export default function HomePage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('강아지');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryNav, setShowCategoryNav] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className={styles.homeContainer}>
      <TopBar />

      {showCategoryNav && (
        <CategoryNav onSelectCategory={setSelectedCategory} />
      )}

      <ProductGrid
        category={selectedCategory}
        searchTerm={searchTerm}
        onProductClick={(product) => router.push(`/products/${product.id}`)}
        onAddToCart={(product) => setSelectedProduct(product)}
      />
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import CategoryNav from '@/app/components/sections/TopBar/CategoryNav/CategoryNav';
import { ProductGrid } from '@/app/components/sections/ProductGrid/ProductGrid';
import styles from './styles.module.css';

export default function HomePage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('강아지');

  return (
    <div className={styles.homeContainer}>
      <TopBar />

      <CategoryNav
        onSelectCategory={setSelectedCategory}
        categories={['강아지', '고양이', '햄스터', '새', '고슴도치']}
      />

      <div className={styles.mainContent}>
        <ProductGrid
          category={selectedCategory}
          searchTerm=""
          onProductClick={(product) => router.push(`/products/${product.id}`)}
          onAddToCart={() => {}}
        />
      </div>
    </div>
  );
}

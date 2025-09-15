'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import CategoryNav from '@/app/components/sections/TopBar/CategoryNav/CategoryNav';
import { ProductGrid } from '@/app/components/sections/ProductGrid/ProductGrid';
import { useUser } from '@/app/context/userContext';
import SellerPanel from '@/app/components/seller-components/SellerPanel/SellerPanel';
import styles from './styles.module.css';

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser(); // get user from context
  const [selectedCategory, setSelectedCategory] = useState('강아지');

  const isSeller = user?.role === 'seller';

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

      {/* Seller Panel */}
      {isSeller && <SellerPanel />}
    </div>
  );
}

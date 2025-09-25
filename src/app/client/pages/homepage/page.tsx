'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import CategoryNav from '@/app/components/sections/TopBar/CategoryNav/CategoryNav';
import { ProductGrid } from '@/app/components/sections/ProductGrid/ProductGrid';
import { useUser } from '@/app/context/userContext';
import SellerPanel from '@/app/components/seller-components/SellerPanel/SellerPanel';
import styles from './styles.module.css';

export default function HomePage() {
  const router = useRouter();
  const { user, refreshUserData } = useUser(); // get user from context
  const [selectedCategory, setSelectedCategory] = useState('강아지');

  const isApprovedSeller =
    user?.role === 'seller' && user?.businessApprovalStatus === 'APPROVED';

  // Refresh user data when component mounts to get latest business status
  useEffect(() => {
    console.log('🔄 HomePage mounted, refreshing user data...');
    refreshUserData();
  }, []); // Empty dependency array - only run once on mount

  // Debug logging
  console.log('🏠 HomePage - User State:');
  console.log('  - User:', user);
  console.log('  - Role:', user?.role);
  console.log('  - Business Status:', user?.businessApprovalStatus);
  console.log('  - Is Approved Seller:', isApprovedSeller);

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
          onProductClick={(product) => {
            const productId = product.productId || product.id;
            if (productId) {
              router.push(`/client/pages/products/${productId}`);
            } else {
              console.error('Product missing ID:', product);
            }
          }}
          onAddToCart={() => {}}
        />
      </div>

      {/* Seller Panel */}
      {isApprovedSeller && <SellerPanel />}
    </div>
  );
}

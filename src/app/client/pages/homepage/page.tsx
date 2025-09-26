'use client';
import { useState, useEffect, useRef } from 'react';
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
  const hasRefreshed = useRef(false);

  const isApprovedSeller =
    user?.role === 'seller' && user?.businessApprovalStatus === 'APPROVED';

  // Refresh user data when component mounts to get latest business status
  useEffect(() => {
    if (hasRefreshed.current) return; // guard to ensure "run once"
    hasRefreshed.current = true;

    console.log('🔄 HomePage mounted, refreshing user data...');
    refreshUserData();
  }, [refreshUserData]); // Include refreshUserData but guard prevents infinite loop

  // Debug logging
  console.log('🏠 HomePage - User State:');
  console.log('  - User:', user);
  console.log('  - Role:', user?.role);
  console.log('  - Business Status:', user?.businessApprovalStatus);
  console.log('  - Is Approved Seller:', isApprovedSeller);

  return (
    <div className={styles.homeContainer}>
      <TopBar />

      <CategoryNav onSelectCategory={setSelectedCategory} />

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

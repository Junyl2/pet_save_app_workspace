'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import CategoryNav from '@/app/components/sections/TopBar/CategoryNav/CategoryNav';
import { ProductGrid } from '@/app/components/sections/ProductGrid/ProductGrid';
import { useUser } from '@/app/context/userContext';
import SellerPanel from '@/app/components/seller-components/SellerPanel/SellerPanel';
import styles from './styles.module.css';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUserData } = useUser(); // get user from context

  // Get current page and category from URL parameters
  const currentPage = parseInt(searchParams.get('page') || '0', 10);
  const urlCategory = searchParams.get('category') || '강아지';

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const hasRefreshed = useRef(false);

  const isApprovedSeller = user?.role === 'seller' && !!user?.storeId;

  // Sync URL category with state
  useEffect(() => {
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory, selectedCategory]);

  // Refresh user data when component mounts to get latest business status
  useEffect(() => {
    if (hasRefreshed.current) return; // guard to ensure "run once"
    hasRefreshed.current = true;

    console.log('🔄 HomePage mounted, refreshing user data...');
    refreshUserData();
  }, [refreshUserData]); // Include refreshUserData but guard prevents infinite loop

  // Handle page change by updating URL
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 0) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/client/pages/homepage${newUrl}`);
  };

  // Handle category change by updating URL
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === '강아지') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    // Reset to page 0 when changing category
    params.delete('page');
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/client/pages/homepage${newUrl}`);
  };

  // Debug logging
  console.log('🏠 HomePage - User State:');
  console.log('  - User:', user);
  console.log('  - Role:', user?.role);
  console.log('  - Business Status:', user?.businessApprovalStatus);
  console.log('  - Is Approved Seller:', isApprovedSeller);
  console.log('  - Current Page from URL:', currentPage);

  return (
    <div className={styles.homeContainer}>
      <TopBar />

      <CategoryNav
        onSelectCategory={handleCategoryChange}
        currentCategory={selectedCategory}
      />

      <div className={styles.mainContent}>
        <ProductGrid
          category={selectedCategory}
          searchTerm=""
          currentPage={currentPage}
          onPageChange={handlePageChange}
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

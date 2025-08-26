'use client';
import { useState } from 'react';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import CategoryNav from '@/app/components/sections/TopBar/CategoryNav/CategoryNav';
import ProductGrid from '@/app/components/sections/ProductGrid/ProductGrid';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('강아지');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryNav, setShowCategoryNav] = useState(true);

  /*   const handleSearch = (term: string) => {
    setSearchTerm(term);
    setShowCategoryNav(term.trim() === '');
  }; */

  return (
    <div>
      <TopBar />

      {showCategoryNav && (
        <CategoryNav onSelectCategory={setSelectedCategory} />
      )}

      <ProductGrid category={selectedCategory} searchTerm={searchTerm} />
    </div>
  );
}

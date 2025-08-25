'use client';
import { useState } from 'react';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import CategoryNav from '@/app/components/sections/TopBar/CategoryNav/CategoryNav';
import ProductGrid from '@/app/components/sections/ProductGrid/ProductGrid';
export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('강아지');

  return (
    <div>
      <TopBar />

      {/* Category nav passes the selected category back */}
      <CategoryNav onSelectCategory={setSelectedCategory} />

      {/* Product grid receives the category prop */}
      <ProductGrid category={selectedCategory} />
    </div>
  );
}

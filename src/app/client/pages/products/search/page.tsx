'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import SearchProductGrid from '@/app/components/sections/SearchProductGrid/SearchProductGrid';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import styles from './styles.module.css';
export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  // Called when user submits search in TopBar
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <main className={styles.container}>
      <TopBar onSearch={handleSearch} />
      <div className={styles.divider}></div>
      <SearchProductGrid searchTerm={query} />
    </main>
  );
}

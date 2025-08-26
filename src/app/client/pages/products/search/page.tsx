'use client';

import { useSearchParams } from 'next/navigation';
import SearchProductGrid from '@/app/components/sections/SearchProductGrid/SearchProductGrid';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import styles from './styles.module.css';
export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  return (
    <main className={styles.container}>
      <TopBar />
      <div className={styles.divider}></div>
      <SearchProductGrid searchTerm={query} />
    </main>
  );
}

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import SearchProductGrid from '@/app/components/sections/SearchProductGrid/SearchProductGrid';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import styles from './styles.module.css';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('query') || '';

  const handleSearch = (term: string) => {
    router.push(`/products/search?query=${encodeURIComponent(term)}`);
  };

  return (
    <main className={styles.container}>
      <TopBar onSearch={handleSearch} />
      <SearchProductGrid searchTerm={query} />
    </main>
  );
}

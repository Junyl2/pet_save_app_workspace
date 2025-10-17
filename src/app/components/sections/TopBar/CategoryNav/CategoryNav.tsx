'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import styles from './CategoryNav.module.css';
import { CategoryService } from '@/app/api/services/client/categoryService/categoryService';
import { Category } from '@/app/api/types/category/category';

// Simple cache to prevent duplicate API calls
let categoriesCache: Category[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

type CategoryNavProps = {
  onSelectCategory: (category: string) => void;
  currentCategory?: string;
};

export default function CategoryNav({
  onSelectCategory,
  currentCategory,
}: CategoryNavProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [active, setActive] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Properly typed refs array
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Sync currentCategory prop with active state
  useEffect(() => {
    if (currentCategory && currentCategory !== active) {
      setActive(currentCategory);
    }
  }, [currentCategory, active]);

  // Fetch categories from API - only run once on mount
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const now = Date.now();
        if (categoriesCache && now - cacheTimestamp < CACHE_DURATION) {
          if (!isMounted) return;
          setCategories(categoriesCache);
          setLoading(false);

          // Set first category as active if available and no currentCategory is set
          if (categoriesCache.length > 0 && !currentCategory) {
            const firstCategory = categoriesCache[0].categoryName;
            setActive(firstCategory);
            onSelectCategory(firstCategory);
          }
          return;
        }

        const response = await CategoryService.getAllCategories({
          size: 50, // Get more categories
          sortBy: 'displayOrder',
          direction: 'asc',
        });

        if (!isMounted) return;

        if (response.error) {
          // Handle 429 errors with retry
          if (response.error.includes('429') && retryCount < 2) {
            console.log(`Retrying category fetch (attempt ${retryCount + 1})`);
            setTimeout(() => {
              if (isMounted) {
                fetchCategories(retryCount + 1);
              }
            }, 1000 * (retryCount + 1)); // Exponential backoff
            return;
          }

          setError(response.error);
          console.error('Failed to fetch categories:', response.error);
        } else if (response.data?.data?.content) {
          const fetchedCategories = response.data.data.content;

          // Update cache
          categoriesCache = fetchedCategories;
          cacheTimestamp = now;

          setCategories(fetchedCategories);

          // Set first category as active if available and no currentCategory is set
          if (fetchedCategories.length > 0 && !currentCategory) {
            const firstCategory = fetchedCategories[0].categoryName;
            setActive(firstCategory);
            onSelectCategory(firstCategory); // Notify parent component
          }
        }
      } catch (err) {
        if (!isMounted) return;

        // Handle 429 errors with retry
        if (
          err instanceof Error &&
          err.message.includes('429') &&
          retryCount < 2
        ) {
          console.log(`Retrying category fetch (attempt ${retryCount + 1})`);
          setTimeout(() => {
            if (isMounted) {
              fetchCategories(retryCount + 1);
            }
          }, 1000 * (retryCount + 1)); // Exponential backoff
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch categories';
        setError(errorMessage);
        console.error('Category fetch error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  const handleSelect = (cat: string, index: number) => {
    setActive(cat);
    onSelectCategory(cat);

    // Scroll the clicked button into view
    const button = buttonRefs.current[index];
    if (button) {
      button.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  const isSellerDetails = pathname.startsWith('/client/pages/seller-details');

  // Show loading state
  if (loading) {
    return (
      <div className={isSellerDetails ? styles.sellerNav : styles.wrapper}>
        <div
          className={
            isSellerDetails ? styles.sellerContainer : styles.container
          }
        >
          <button
            type="button"
            className={styles.filter}
            onClick={() => router.push('/filter')}
          >
            <Image
              src="/images/icons/Filter.svg"
              alt="Filter Icon"
              width={24}
              height={24}
            />
          </button>
          <div className={styles.loading}>Loading categories...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={isSellerDetails ? styles.sellerNav : styles.wrapper}>
        <div
          className={
            isSellerDetails ? styles.sellerContainer : styles.container
          }
        >
          <button
            type="button"
            className={styles.filter}
            onClick={() => router.push('/filter')}
          >
            <Image
              src="/images/icons/Filter.svg"
              alt="Filter Icon"
              width={24}
              height={24}
            />
          </button>
          <div className={styles.error}>Failed to load categories</div>
        </div>
      </div>
    );
  }

  return (
    <div className={isSellerDetails ? styles.sellerNav : styles.wrapper}>
      <div
        className={isSellerDetails ? styles.sellerContainer : styles.container}
      >
        {/* Filter Icon → navigates to /filter */}
        <button
          type="button"
          className={styles.filter}
          onClick={() => router.push('/filter')}
        >
          <Image
            src="/images/icons/Filter.svg"
            alt="Filter Icon"
            width={24}
            height={24}
          />
        </button>

        {/* Category buttons */}
        {categories.map((category, idx) => (
          <button
            key={category.categoryId}
            type="button"
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            onClick={() => handleSelect(category.categoryName, idx)}
            className={`${styles.item} ${
              active === category.categoryName ? styles.active : ''
            }`}
          >
            {category.categoryName}
          </button>
        ))}
      </div>
    </div>
  );
}

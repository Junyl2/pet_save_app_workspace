'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from './CategoryNav.module.css';
import { CategoryService } from '@/app/api/services/client/categoryService/categoryService';
import { Category } from '@/app/api/types/category/category';
import CategorySkeleton from '@/app/components/ui/SkeletonLoading/CategorySkeleton/CategorySkeleton';

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
  const searchParams = useSearchParams();

  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const onSelectCategoryRef = useRef(onSelectCategory);
  const currentCategoryRef = useRef(currentCategory);

  useEffect(() => {
    onSelectCategoryRef.current = onSelectCategory;
    currentCategoryRef.current = currentCategory;
  }, [onSelectCategory, currentCategory]);

  useEffect(() => {
    if (currentCategory && currentCategory !== active) {
      setActive(currentCategory);
    }
  }, [currentCategory, active]);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);

        const now = Date.now();
        if (categoriesCache && now - cacheTimestamp < CACHE_DURATION) {
          if (!isMounted) return;
          setCategories(categoriesCache);
          setLoading(false);

          if (categoriesCache.length > 0 && !currentCategoryRef.current) {
            const firstCategory = categoriesCache[0].categoryName;
            setActive(firstCategory);
            onSelectCategoryRef.current(firstCategory);
          }
          return;
        }

        const response = await CategoryService.getAllCategories({
          size: 50,
          sortBy: 'displayOrder',
          direction: 'asc',
        });

        if (!isMounted) return;

        if (response.error) {
          if (response.error.includes('429') && retryCount < 2) {
            console.log(`Retrying category fetch (attempt ${retryCount + 1})`);
            setTimeout(() => {
              if (isMounted) fetchCategories(retryCount + 1);
            }, 1000 * (retryCount + 1));
            return;
          }
          setError(response.error);
        } else if (response.data?.data?.content) {
          const fetched = response.data.data.content;
          categoriesCache = fetched;
          cacheTimestamp = now;
          setCategories(fetched);

          if (fetched.length > 0 && !currentCategoryRef.current) {
            const firstCategory = fetched[0].categoryName;
            setActive(firstCategory);
            onSelectCategoryRef.current(firstCategory);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to fetch categories';
        setError(errorMsg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelect = (cat: string, index: number) => {
    setActive(cat);
    onSelectCategory(cat);
    const button = buttonRefs.current[index];
    if (button) {
      button.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  const handleOpenFilter = () => {
    const currentParams = searchParams.toString();
    router.push(`/filter${currentParams ? `?${currentParams}` : ''}`);
  };

  const isSellerDetails = pathname.startsWith('/client/pages/seller-details');

  if (loading) return <CategorySkeleton />;

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
            onClick={handleOpenFilter}
          >
            <Image
              src="/images/icons/Filter.svg"
              alt="Filter Icon"
              width={28}
              height={28}
              className={styles.filterIcon}
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
        <button
          type="button"
          className={styles.filter}
          onClick={handleOpenFilter}
        >
          <Image
            src="/images/icons/Filter.svg"
            alt="Filter Icon"
            width={24}
            height={24}
          />
        </button>

        {/* Category Buttons */}
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

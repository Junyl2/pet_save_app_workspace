'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import styles from './CategoryNav.module.css';
import { CategoryService } from '@/app/api/services/client/categoryService/categoryService';
import { Category } from '@/app/api/types/category/category';

type CategoryNavProps = {
  onSelectCategory: (category: string) => void;
};

export default function CategoryNav({ onSelectCategory }: CategoryNavProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [active, setActive] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Properly typed refs array
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await CategoryService.getAllCategories({
          size: 50, // Get more categories
          sortBy: 'displayOrder',
          direction: 'asc',
        });

        if (response.error) {
          setError(response.error);
          console.error('Failed to fetch categories:', response.error);
        } else if (response.data?.data?.content) {
          const fetchedCategories = response.data.data.content;
          setCategories(fetchedCategories);

          // Set first category as active if available
          if (fetchedCategories.length > 0) {
            const firstCategory = fetchedCategories[0].categoryName;
            setActive(firstCategory);
            onSelectCategory(firstCategory); // Notify parent component
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch categories';
        setError(errorMessage);
        console.error('Category fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

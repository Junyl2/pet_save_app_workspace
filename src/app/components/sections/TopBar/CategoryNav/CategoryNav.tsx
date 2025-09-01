'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import styles from './CategoryNav.module.css';

const categories = ['강아지', '고양이', '햄스터', '새', '고슴도치'];

type CategoryNavProps = {
  categories: string[];
  onSelectCategory: (category: string) => void;
};

export default function CategoryNav({ onSelectCategory }: CategoryNavProps) {
  const [active, setActive] = useState(categories[0]);
  const router = useRouter();
  const pathname = usePathname();

  // Properly typed refs array
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

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

  const isSellerDetails = pathname.startsWith('/seller-details');

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
        {categories.map((cat, idx) => (
          <button
            key={cat}
            type="button"
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            onClick={() => handleSelect(cat, idx)}
            className={`${styles.item} ${active === cat ? styles.active : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

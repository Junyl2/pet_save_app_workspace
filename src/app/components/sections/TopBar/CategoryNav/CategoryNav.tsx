'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './CategoryNav.module.css';

const categories = ['강아지', '고양이', '햄스터', '새', '고슴도치'];

type CategoryNavProps = {
  onSelectCategory: (category: string) => void;
};

export default function CategoryNav({ onSelectCategory }: CategoryNavProps) {
  const [active, setActive] = useState(categories[0]);
  const router = useRouter();

  const handleSelect = (cat: string) => {
    setActive(cat);
    onSelectCategory(cat); // notify parent
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Filter Icon → navigates to /filter */}
        <button
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
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={`${styles.item} ${active === cat ? styles.active : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

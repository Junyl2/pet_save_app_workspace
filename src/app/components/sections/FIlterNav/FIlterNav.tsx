'use client';

import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaChevronLeft } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './FilterNav.module.css';
import { Category } from '@/app/api/types/category/category';
import { CategoryService } from '@/app/api/services/client/categoryService/categoryService';
import { ProductSearchParams } from '@/app/api/types/products/products';

interface FilterParams {
  categoryName?: string;
  sortBy?: ProductSearchParams['sortBy'];
  direction?: ProductSearchParams['direction'];
  registrationStatus?: 'ONSALE' | 'SOLD_OUT';
}

export default function FilterNav() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await CategoryService.getAllCategories({
        size: 50,
        sortBy: 'displayOrder',
        direction: 'asc',
      });
      if (res.data?.data?.content) {
        setCategories(res.data.data.content);
      } else {
        console.error('Failed to load categories:', res.error);
      }
    };
    fetchCategories();
  }, []);

  const toggleDropdown = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const HOMEPAGE_PATH = '/client/pages/homepage';

  const navigateToHomepage = (params: FilterParams) => {
    const query = new URLSearchParams(searchParams.toString());

    if (params.categoryName) query.set('categoryName', params.categoryName);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.direction) query.set('direction', params.direction);
    if (params.registrationStatus)
      query.set('registrationStatus', params.registrationStatus);

    query.set('page', '0');
    router.push(`${HOMEPAGE_PATH}?${query.toString()}`);
  };

  const handleSelectCategory = (categoryName: string) => {
    navigateToHomepage({ categoryName });
  };

  const handleSelectSort = (
    sortBy: ProductSearchParams['sortBy'],
    direction: ProductSearchParams['direction']
  ) => {
    navigateToHomepage({ sortBy, direction });
  };

  const navItems = [
    {
      id: 1,
      label: '동물',
      dropdown: categories.map((c) => c.categoryName),
      hasImages: true,
    },
    { id: 2, label: '상품등록', dropdown: ['최신순', '오래된순'] },
    { id: 3, label: '가격', dropdown: ['낮은 가격순', '높은 가격순'] },
    { id: 4, label: '유통기한', dropdown: ['최신순', '오래된순'] },
  ];

  const sortMap: Record<
    string,
    {
      sortBy: ProductSearchParams['sortBy'];
      direction: ProductSearchParams['direction'];
    }
  > = {
    최신순: { sortBy: 'expiryDate', direction: 'desc' },
    오래된순: { sortBy: 'expiryDate', direction: 'asc' },
    '낮은 가격순': { sortBy: 'salePrice', direction: 'asc' },
    '높은 가격순': { sortBy: 'salePrice', direction: 'desc' },
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.sideNav}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <FaChevronLeft className={styles.backIcon} />
          </button>
        </div>

        {navItems.map((item) => (
          <div key={item.id} className={styles.navItem}>
            <button
              className={styles.navButton}
              onClick={() => toggleDropdown(item.id)}
            >
              {item.label}
              {openId === item.id ? (
                <FaChevronUp className={styles.icon} />
              ) : (
                <FaChevronDown className={styles.icon} />
              )}
            </button>

            {openId === item.id && (
              <ul
                className={`${styles.dropdown} ${
                  item.hasImages ? styles.gridDropdown : ''
                }`}
              >
                {item.dropdown.map((subItem, idx) => (
                  <li
                    key={idx}
                    className={`${styles.dropdownItem} ${
                      item.hasImages ? styles.imageItem : ''
                    }`}
                    onClick={() => {
                      if (item.id === 1) {
                        handleSelectCategory(subItem);
                      } else if (sortMap[subItem]) {
                        const { sortBy, direction } = sortMap[subItem];
                        handleSelectSort(sortBy, direction);
                      }
                    }}
                  >
                    {item.hasImages && (
                      <Image
                        src={
                          categories[idx]?.image
                            ? categories[idx].image!
                            : '/images/animals/default.png'
                        }
                        alt={subItem}
                        width={47}
                        height={47}
                        className="object-contain"
                      />
                    )}
                    <span className={styles.animalLabel}>{subItem}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

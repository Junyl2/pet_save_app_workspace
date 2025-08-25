'use client';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaChevronLeft } from 'react-icons/fa';
import Image from 'next/image';
import styles from './FilterNav.module.css';

type NavItem = {
  id: number;
  label: string;
  dropdown: string[];
  hasImages?: boolean;
};

const navItems: NavItem[] = [
  {
    id: 1,
    label: '동물',
    dropdown: [
      '강아지',
      '고양이',
      '새',
      '햄스터',
      '고슴도치',
      '도마뱀',
      '거북이',
      '물고기',
    ],
    hasImages: true,
  },
  { id: 2, label: '상품등록', dropdown: ['최신순', '오래된순'] },
  { id: 3, label: '가격', dropdown: ['낮은 가격순', '높은 가격순'] },
  { id: 4, label: '유통기한', dropdown: ['최신순', '오래된순'] },
];

type FilterNavProps = {
  onClose: () => void;
};

export default function FilterNav({ onClose }: FilterNavProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleDropdown = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.sideNav}>
        {/* Back button */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onClose}>
            <FaChevronLeft className={styles.backIcon} />
          </button>
        </div>

        {/* Menu items */}
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
                  >
                    {item.hasImages && (
                      <Image
                        src={`/images/animals/${subItem}.png`}
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

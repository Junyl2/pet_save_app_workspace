'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import styles from './BottomBar.module.css';
import { PAGE_URLS } from '@/app/utils/page_url';
import { useUser } from '@/app/context/userContext';

type BottomItem = {
  name: string;
  label: string;
  path: string;
};

export default function BottomBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hovered, setHovered] = useState<string | null>(null);

  const { user } = useUser();
  const isLoggedIn = !!user;
  const isSeller = user?.role === 'seller';

  // Helper to normalize paths (ignore trailing slashes)
  const normalizePath = (path: string) =>
    path.endsWith('/') ? path.slice(0, -1) : path;

  // Helper to strip query string for active state comparison
  const stripQuery = (path: string) => path.split('?')[0];

  const currentPath = normalizePath(pathname);
  const isOnHomepage = currentPath === normalizePath(PAGE_URLS.HOME);

  // Build home path - preserve categoryName if already on homepage
  const getHomePath = () => {
    if (isOnHomepage) {
      const categoryName = searchParams.get('categoryName');
      if (categoryName) {
        const params = new URLSearchParams(searchParams.toString());
        return `${PAGE_URLS.HOME}?${params.toString()}`;
      }
    }
    return PAGE_URLS.HOME;
  };

  // Build items
  const items: BottomItem[] = [
    { name: 'home', label: '홈', path: getHomePath() },
    { name: 'bag', label: '주변가게', path: PAGE_URLS.SHOPS || '/shops' },
  ];

  // Always include "문의하기"
  const intendedContactPath = isSeller
    ? '/client/seller/pages/seller-inquiry-details'
    : PAGE_URLS.CONTACT || '/contact';

  const contactPath = isLoggedIn
    ? intendedContactPath
    : `${PAGE_URLS.LOGIN}?next=${encodeURIComponent(intendedContactPath)}`;

  items.push({
    name: 'message',
    label: '문의하기',
    path: contactPath,
  });

  // Always include My page (routes differ based on state/role)
  items.push({
    name: 'user',
    label: '마이',
    path: isLoggedIn
      ? isSeller
        ? PAGE_URLS.SELLER_MYPAGE
        : PAGE_URLS.MYPAGE || '/'
      : PAGE_URLS.LOGIN,
  });

  return (
    <nav className={styles.bottomBar}>
      <ul className={styles.list}>
        {items.map((item) => {
          const itemPath = normalizePath(stripQuery(item.path));
          const isActive = currentPath === itemPath;
          const showActive = isActive || hovered === item.name;

          const imgSrc = `/images/icons/bottom-bar/${item.name}-${
            showActive ? 'active' : 'default'
          }.png`;

          return (
            <li
              key={item.name}
              className={`${styles.item} ${isActive ? styles.active : ''}`}
              onMouseEnter={() => setHovered(item.name)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link href={item.path} className={styles.link}>
                <Image
                  src={imgSrc}
                  alt={item.label}
                  width={24}
                  height={24}
                  priority={isActive}
                  className={styles.icon}
                />
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

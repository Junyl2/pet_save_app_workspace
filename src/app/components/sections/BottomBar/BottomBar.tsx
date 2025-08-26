'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './BottomBar.module.css';
import { PAGE_URLS } from '@/app/utils/page_url';

type BottomItem = {
  name: string;
  label: string;
  path: string;
};

export default function BottomBar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  const isLoggedIn = false; // TODO: replace with real auth

  const items: BottomItem[] = [
    { name: 'home', label: '홈', path: PAGE_URLS.HOME },
    { name: 'bag', label: '주변가게', path: PAGE_URLS.SHOPS || '/shops' },
    {
      name: 'message',
      label: '문의하기',
      path: PAGE_URLS.CONTACT || '/contact',
    },
    {
      name: 'user',
      label: '마이',
      path: isLoggedIn ? PAGE_URLS.MYPAGE || '/' : PAGE_URLS.LOGIN,
    },
  ];

  const normalizePath = (path: string) =>
    path.endsWith('/') ? path.slice(0, -1) : path;

  const currentPath = normalizePath(pathname);

  return (
    <nav className={styles.bottomBar}>
      <ul className={styles.list}>
        {items.map((item) => {
          const itemPath = normalizePath(item.path);
          const isActive = currentPath === itemPath;
          /* item.name === 'home'
              ? currentPath.startsWith('/client')
              : currentPath === itemPath; */

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

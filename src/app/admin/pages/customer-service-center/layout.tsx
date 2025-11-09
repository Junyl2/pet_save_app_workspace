'use client';
import React, { useEffect, useRef } from 'react';
import OrderDatePicker from '@/app/components/admin/ui/OrderDatePicker/OrderDatePicker';
import styles from './layout.module.css';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  OrderFilterProvider,
  useOrderFilter,
} from '@/app/context/orderFilterContext';

const slugToTabKey = {
  announcement: '공지사항',
  'customer-inquiry': '고객 문의',
};

function FilterResetHandler({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resetFilters } = useOrderFilter();
  const prevMainPageRef = useRef<string | null>(null);

  useEffect(() => {
    const mainPages = [
      '/admin/pages/customer-service-center/announcement',
      '/admin/pages/customer-service-center/customer-inquiry',
    ];

    const currentMainPage = mainPages.find(
      (page) => pathname === page || pathname.startsWith(page + '/')
    );

    if (currentMainPage) {
      if (
        prevMainPageRef.current &&
        prevMainPageRef.current !== currentMainPage
      ) {
        resetFilters();
      }
      prevMainPageRef.current = currentMainPage;
    }
  }, [pathname, resetFilters]);

  return <>{children}</>;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const activeSlug =
    Object.keys(slugToTabKey).find((slug) => pathname.includes(slug)) ||
    'customer-inquiry';

  const isWriteNotice = pathname.includes(
    'admin/pages/customer-service-center/announcement/write'
  );

  const isInquiryPages =
    pathname.includes(
      'admin/pages/customer-service-center/customer-inquiry/waiting-reply'
    ) ||
    pathname.includes(
      'admin/pages/customer-service-center/customer-inquiry/answer-completed'
    );

  const shouldShowDatePicker = !isWriteNotice && !isInquiryPages;

  return (
    <FilterResetHandler>
      <div className={styles.container}>
        <header className={styles.wrap}>
          <h1 className={styles.title}>고객센터</h1>
          <nav className={styles.tabRow} aria-label="Order status tabs">
            {Object.entries(slugToTabKey).map(([slug, label]) => (
              <button
                key={slug}
                type="button"
                className={clsx(
                  styles.tab,
                  activeSlug === slug ? styles.active : styles.inactive
                )}
                onClick={() =>
                  router.push(`/admin/pages/customer-service-center/${slug}`)
                }
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        <div className={styles.content}>
          {shouldShowDatePicker && (
            <div className={styles.datePicker}>
              <OrderDatePicker />
            </div>
          )}
          {children}
        </div>
      </div>
    </FilterResetHandler>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OrderFilterProvider>
      <LayoutContent>{children}</LayoutContent>
    </OrderFilterProvider>
  );
}

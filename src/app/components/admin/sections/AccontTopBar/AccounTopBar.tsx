'use client';

import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import styles from './AccountTopBar.module.css';

const slugToTabKey = {
  'general-member': '일반 회원',
  'business-member': '사업자 회원',
  'confirm-business-registration': '사업자등록 확인',
};

export default function AccounTopBar() {
  const router = useRouter();
  const pathname = usePathname();

  const activeSlug =
    Object.keys(slugToTabKey).find((slug) => pathname.includes(slug)) ||
    'waiting-payment';

  const isGeneralMember = pathname.startsWith(
    '/admin/pages/account-permission-management/general-member/regular-member'
  );

  return (
    <>
      {!isGeneralMember && (
        <header className={styles.wrap}>
          <h1 className={styles.title}>회원 리스트</h1>

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
                  router.push(
                    `/admin/pages/account-permission-management/${slug}`
                  )
                }
              >
                {label}
              </button>
            ))}
          </nav>
        </header>
      )}
    </>
  );
}

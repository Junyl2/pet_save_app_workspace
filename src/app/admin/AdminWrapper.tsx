'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Loading from '@/app/components/ui/loading-screen/Loading';

export default function AdminWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const MIN_LOADING_TIME = 2000;

  const includedPages = ['/admin/pages'];
  const showWrapper =
    includedPages.some((page) => pathname.startsWith(page)) ||
    pathname === '/admin' ||
    pathname === '/admin/login';

  // Hydration
  useEffect(() => setHydrated(true), []);

  // Show loading once per session
  useEffect(() => {
    if (!hydrated) return;
    const hasLoaded = sessionStorage.getItem('adminHasShownLoading');
    if (!hasLoaded && showWrapper) {
      setLoading(true);
      const start = Date.now();
      (async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 0));
          const elapsed = Date.now() - start;
          const remaining = MIN_LOADING_TIME - elapsed;
          setTimeout(
            () => {
              setLoading(false);
              sessionStorage.setItem('adminHasShownLoading', 'true');
            },
            remaining > 0 ? remaining : 0
          );
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
      })();
    }
  }, [hydrated, showWrapper]);

  const exitAnimation = { opacity: 0, x: -500 }; // Always apply slide effect

  if (!hydrated) return null;

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="admin-loading"
          initial={{ opacity: 1, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={exitAnimation}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <Loading />
        </motion.div>
      ) : (
        <main className="admin-container">{children}</main>
      )}
    </AnimatePresence>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '../components/ui/loading-screen/Loading';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false); // track client hydration
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const MIN_LOADING_TIME = 3000;

  // Mark hydration complete
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Detect desktop on client only
  useEffect(() => {
    if (!hydrated) return;

    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1025);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, [hydrated]);

  // Show loading only on first session load
  useEffect(() => {
    if (!hydrated) return;

    const hasLoaded = sessionStorage.getItem('hasShownLoading');

    if (!hasLoaded) {
      setLoading(true);

      const startTime = Date.now();

      async function initApp() {
        try {
          // simulate initialization if needed
          await new Promise((resolve) => setTimeout(resolve, 0));

          const elapsed = Date.now() - startTime;
          const remainingTime = MIN_LOADING_TIME - elapsed;

          setTimeout(
            () => {
              setLoading(false);
              sessionStorage.setItem('hasShownLoading', 'true');
            },
            remainingTime > 0 ? remainingTime : 0
          );
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      }

      initApp();
    }
  }, [hydrated]);

  // Exit animation
  const exitAnimation = isDesktop ? {} : { opacity: 0, x: -500 };

  // Don't render anything until client hydration to avoid SSR mismatch
  if (!hydrated) return null;

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={exitAnimation}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <Loading />
        </motion.div>
      ) : (
        <main className="app-container">
          <div className="app-content">{children}</div>
        </main>
      )}
    </AnimatePresence>
  );
}

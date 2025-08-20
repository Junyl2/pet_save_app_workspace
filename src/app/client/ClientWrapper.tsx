'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '../components/ui/loading-screen/Loading';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const MIN_LOADING_TIME = 3000;

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1025);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    const startTime = Date.now();

    async function initApp() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 0));

        const elapsed = Date.now() - startTime;
        const remainingTime = MIN_LOADING_TIME - elapsed;

        if (remainingTime > 0) {
          setTimeout(() => setLoading(false), remainingTime);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }

    initApp();
  }, []);

  const exitAnimation = isDesktop ? '' : { opacity: 0, x: -500 };

  return (
    <AnimatePresence>
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

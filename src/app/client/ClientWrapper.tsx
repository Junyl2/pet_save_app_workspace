'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useUser } from '@/app/context/userContext';
import { ReportService } from '@/app/api/services/client/memberService/report/reportService';
import WarningModal from '@/app/components/ui/modal/WarningModal/WraningModal';
import Loading from '../components/ui/loading-screen/Loading';

export default function ClientWrapper({
  children,
  BottomBar,
}: {
  children: React.ReactNode;
  BottomBar?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const MIN_LOADING_TIME = 3000;

  // Prevent modal twice (strict mode)
  const reportCheckDoneRef = useRef(false);

  const includedPages = [
    '/client/pages/homepage',
    '/shops',
    '/contact-us',
    '/my-page',
  ];

  const showBottomBar =
    BottomBar &&
    includedPages.some(
      (page) => pathname === page || pathname.startsWith(page + '/')
    );

  // Hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Desktop check
  useEffect(() => {
    if (!hydrated) return;

    const handleResize = () => setIsDesktop(window.innerWidth >= 1025);
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hydrated]);

  // First-time loading
  useEffect(() => {
    if (!hydrated) return;

    const hasLoaded = sessionStorage.getItem('hasShownLoading');
    if (!hasLoaded) {
      setLoading(true);
      const start = Date.now();

      const init = async () => {
        await new Promise((r) => setTimeout(r, 0));
        const elapsed = Date.now() - start;
        const remaining = MIN_LOADING_TIME - elapsed;

        setTimeout(
          () => {
            setLoading(false);
            sessionStorage.setItem('hasShownLoading', 'true');
          },
          remaining > 0 ? remaining : 0
        );
      };

      void init();
    }
  }, [hydrated]);

  // Show warning modal based on member/me data
  useEffect(() => {
    if (!user?.memberId) return;
    if (reportCheckDoneRef.current) return;

    // only show if backend says yes
    if (!user.hasRecentReports) return;

    const alreadyShown = sessionStorage.getItem('warning_shown');
    if (alreadyShown) return;

    reportCheckDoneRef.current = true;
    setShowWarning(true);
  }, [user?.memberId, user?.hasRecentReports]);

  const handleWarningClose = async () => {
    setShowWarning(false);
    sessionStorage.setItem('warning_shown', 'true');

    try {
      await ReportService.markReportsAsRead();
    } catch (err) {
      console.error('Mark-as-read failed:', err);
    }
  };

  const exitAnimation = isDesktop ? {} : { opacity: 0, x: -500 };

  if (!hydrated) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={exitAnimation}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <Loading />
          </motion.div>
        ) : (
          <main className="app-container">
            <div className="app-content">{children}</div>

            {showBottomBar && (
              <div className="bottom-bar-container">{BottomBar}</div>
            )}
          </main>
        )}
      </AnimatePresence>

      <WarningModal open={showWarning} onClose={handleWarningClose} />
    </>
  );
}

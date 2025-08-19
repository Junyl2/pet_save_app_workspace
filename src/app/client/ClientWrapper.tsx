'use client';
import { useEffect, useState } from 'react';
import Loading from '../components/ui/loading-screen/Loading';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const MIN_LOADING_TIME = 3000; // minimum 1 second

  useEffect(() => {
    const startTime = Date.now();

    async function initApp() {
      try {
        // this is where the real initialization logic
        // Example: fetch initial data, check auth, etc.
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
        setLoading(false); // fallback if initialization fails
      }
    }

    initApp();
  }, []);

  if (loading) return <Loading />;

  return (
    <main className="app-container">
      <div className="app-content">{children}</div>
    </main>
  );
}

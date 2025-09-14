'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'white',
        padding: '20px',
        textAlign: 'center' as const,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <div
          style={{
            fontSize: '120px',
            fontWeight: 'bold',
            background:
              'linear-gradient(135deg, #007FFF 0%, #00E5FF 50%, #7C4DFF 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '20px',
            lineHeight: '1',
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '15px',
            color: 'black',
          }}
        >
          Oops! Page Not Found
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'black',
            marginBottom: '30px',
            lineHeight: 1.6,
          }}
        >
          The page you&apos;re looking for seems to have wandered off into the
          digital wilderness.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            href="/client/pages/homepage"
            style={{
              display: 'inline-block',
              background: '#007FFF',
              color: 'white',
              padding: '12px 22px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🏠 Back to Home
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: 'inline-block',
              background: 'transparent',
              color: '#007FFF',
              padding: '12px 22px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px',
              border: '2px solid #007FFF',
              cursor: 'pointer',
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

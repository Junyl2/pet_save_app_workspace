'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = { children: ReactNode; className?: string };

export default function Portal({ children, className }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  if (!elRef.current) {
    elRef.current = document.createElement('div');
    if (className) elRef.current.className = className;
    // Avoid ever relying on React to manage this node's parent;
    // we append once and only remove it if it still belongs to body.
    elRef.current.setAttribute('data-portal', 'true');
  }

  useEffect(() => {
    const el = elRef.current!;
    document.body.appendChild(el);
    setMounted(true);

    return () => {
      // StrictMode runs this twice in dev; guard so removeChild doesn’t throw.
      if (el.parentNode === document.body) {
        document.body.removeChild(el);
      }
    };
  }, []);

  if (!mounted) return null;
  return createPortal(children, elRef.current!);
}

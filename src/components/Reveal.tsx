'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * Editorial scroll-reveal wrapper.
 * - Always renders visible on SSR and in Fivora visual editor preview (no hidden targets,
 *   no hydration mismatch).
 * - On live storefronts, gently animates below-the-fold sections into view once while
 *   respecting prefers-reduced-motion and guaranteeing visibility with a safety fallback.
 */
export function Reveal({ children, className = '', delayMs = 0 }: RevealProps) {
  const isEditorPreview = useIsEditorPreview();
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<'visible' | 'pending'>('visible');

  useEffect(() => {
    if (isEditorPreview || typeof window === 'undefined') {
      setState('visible');
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setState('visible');
      return;
    }

    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      setState('visible');
      return;
    }

    setState('pending');

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState('visible');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    observer.observe(el);
    const safetyTimer = window.setTimeout(() => setState('visible'), 1800);

    return () => {
      observer.disconnect();
      window.clearTimeout(safetyTimer);
    };
  }, [isEditorPreview]);

  return (
    <div
      ref={ref}
      className={`lux-reveal ${className}`.trim()}
      data-reveal-state={isEditorPreview ? 'visible' : state}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';

export type RevealVariant = 'fade-up' | 'mask-reveal' | 'slide-left' | 'soft-scale';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  variant?: RevealVariant;
}

/**
 * Editorial scroll-reveal wrapper supporting distinct motion variants.
 * - Always renders visible on SSR and inside the Fivora visual editor preview.
 * - Respects prefers-reduced-motion and guarantees visibility via a safety fallback timer.
 */
export function Reveal({
  children,
  className = '',
  delayMs = 0,
  variant = 'fade-up',
}: RevealProps) {
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
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 },
    );

    observer.observe(el);
    const safetyTimer = window.setTimeout(() => setState('visible'), 1600);

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
      data-reveal-variant={variant}
      style={delayMs > 0 && !isEditorPreview ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}

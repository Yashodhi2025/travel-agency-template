'use client';

import { useEffect, useState } from 'react';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { withBasePath } from '@/lib/utils';

const INTRO_SEEN_KEY = 'ceylon_odyssey_intro_seen_v2';

/**
 * Brief, skippable, one-time-per-session modern cinematic intro curtain.
 * - Never renders on SSR (prevents hydration mismatches and keeps first HTML paint visible).
 * - Disabled in Fivora editor preview mode and when prefers-reduced-motion is enabled.
 */
export function OpeningCurtain() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const [phase, setPhase] = useState<'idle' | 'active' | 'fading'>('idle');

  const common = contentObject(contentObject(siteData?.content).common);
  const title = contentText(common.websiteTitle) || 'CEYLON ODYSSEY';
  const tagline = contentText(common.tagline) || 'Bespoke Island Journeys';
  const logoUrl = contentText(common.logoUrl) || '/images/brand-logo.svg';

  useEffect(() => {
    if (isEditorPreview || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
      if (window.sessionStorage.getItem(INTRO_SEEN_KEY) === '1') return;
      window.sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      return;
    }

    setPhase('active');
    const fadeTimer = window.setTimeout(() => setPhase('fading'), 850);
    const doneTimer = window.setTimeout(() => setPhase('idle'), 1300);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [isEditorPreview]);

  if (phase === 'idle') return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#101820] text-[#F5F5F5] transition-opacity duration-500"
      style={{ opacity: phase === 'fading' ? 0 : 1, pointerEvents: phase === 'fading' ? 'none' : 'auto' }}
    >
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <img
          src={withBasePath(logoUrl)}
          alt={title}
          data-preview-static="opening-curtain-logo"
          className="h-14 w-14 rounded-2xl object-contain"
        />
        <p
          data-preview-static="opening-curtain-title"
          className="font-display m-0 text-2xl font-extrabold uppercase tracking-[0.24em] text-[#F5F5F5] sm:text-3xl"
        >
          {title}
        </p>
        <p
          data-preview-static="opening-curtain-tagline"
          className="m-0 text-xs font-semibold uppercase tracking-[0.28em] text-[#FF783D]"
        >
          {tagline}
        </p>
        <button
          type="button"
          data-preview-static="opening-curtain-skip"
          onClick={() => setPhase('idle')}
          className="mt-4 rounded-full border border-white/25 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5F5F5]/85 transition hover:border-[#FF783D] hover:text-[#FF783D]"
        >
          Enter
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { isPreviewValidation, useSiteData, type SiteData } from '@deneb-ui/ui';

function isStaticValidationSiteData(siteData: SiteData | null | undefined): boolean {
  if (!siteData) return true;
  const slug = siteData?.project?.slug || siteData?.siteInstance?.slug;
  const id = siteData?.project?.id;
  return (
    slug === 'template-validation' ||
    id === 'template-validation' ||
    slug === 'preview' ||
    id === 'preview'
  );
}

/**
 * Hydration-safe wrapper around Deneb UI's official `isPreviewValidation(siteData)`.
 * - During static export & template validation (`slug === "template-validation"`),
 *   returns `true` consistently on both server and client.
 * - On live sites opened inside the Fivora visual editor iframe, renders `false`
 *   for SSR and initial hydration paint, then enables preview controls after mount
 *   to prevent React hydration mismatches.
 */
export function useIsEditorPreview(): boolean {
  const siteData = useSiteData();
  const [clientPreview, setClientPreview] = useState(false);

  useEffect(() => {
    setClientPreview(isPreviewValidation(siteData));
  }, [siteData]);

  return isStaticValidationSiteData(siteData) || clientPreview;
}

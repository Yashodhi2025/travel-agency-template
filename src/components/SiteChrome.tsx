'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useSiteData } from '@/lib/siteDataContext';
import { getThemeCssProperties } from '@deneb-ui/ui';
import { LuxuryHeader } from './LuxuryHeader';
import { Footer } from './EditableFooter';
import { OpeningCurtain } from './OpeningCurtain';
import { MobileConciergeBar } from './MobileConciergeBar';

const AnnouncementPreviewStrip = dynamic(() => import('./AnnouncementPreviewStrip'));

export default function SiteChrome({ children }: { children: ReactNode }) {
  const siteData = useSiteData();
  const pathname = usePathname() || '/';
  const isAnnouncementPreview =
    pathname === '/announcement-bar-preview' || pathname === '/announcement-bar-preview/';

  const themeStyle = getThemeCssProperties(
    (siteData?.template?.structure?.theme || siteData?.theme) as any,
  );

  return (
    <div className="site-shell" style={themeStyle}>
      <a
        href="#main-content"
        data-preview-static="skip-to-content-link"
        className="skip-to-content"
      >
        Skip to main content
      </a>
      <OpeningCurtain />
      {isAnnouncementPreview && <AnnouncementPreviewStrip />}
      <LuxuryHeader activeRoute={pathname} />
      <main id="main-content">{children}</main>
      <Footer />
      <MobileConciergeBar />
    </div>
  );
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import siteData from '@/data/site-data.json';
import { SiteDataProvider, ThemeStyles } from '@/lib/siteDataContext';
import SiteChrome from '@/components/SiteChrome';
import './globals.css';
import '../fonts/deneb-fonts.css';

export async function generateMetadata(): Promise<Metadata> {
  const sd = siteData as any;
  const common = sd?.content?.common;
  const home = sd?.content?.home;
  const shop = sd?.shop;

  const brand = common?.websiteTitle || shop?.businessName || 'CEYLON ODYSSEY';
  const tagline = common?.tagline ? ` — ${common.tagline}` : '';
  const title = `${brand}${tagline}`;

  const description =
    common?.shortDescription ||
    shop?.description ||
    'Thoughtfully curated bespoke journeys across Sri Lanka.';

  const icon = common?.logoUrl || shop?.logoUrl || '/images/brand-logo.svg';
  const ogImage = home?.bannerImageUrl || '/images/hero-sigiriya.webp';
  const liveUrl = typeof sd?.siteInstance?.liveUrl === 'string' && /^https?:\/\//i.test(sd.siteInstance.liveUrl)
    ? sd.siteInstance.liveUrl
    : undefined;

  return {
    ...(liveUrl ? { metadataBase: new URL(liveUrl) } : {}),
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: ogImage ? [{ url: ogImage, alt: brand }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const sd = siteData as any;
  const initialTheme = sd?.template?.structure?.theme || sd?.theme;
  const common = sd?.content?.common || {};
  const contact = sd?.content?.contact || {};

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: common.websiteTitle || 'CEYLON ODYSSEY',
    description: common.shortDescription || '',
  };
  if (contact.email) jsonLd.email = contact.email;
  if (contact.phone) jsonLd.telephone = contact.phone;
  if (contact.address) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      streetAddress: contact.address,
    };
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeStyles theme={initialTheme} enableDualMode />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <SiteDataProvider initialSiteData={siteData}>
          <SiteChrome>{children}</SiteChrome>
        </SiteDataProvider>
      </body>
    </html>
  );
}

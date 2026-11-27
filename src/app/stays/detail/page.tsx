'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import {
  buildMailtoEnquiryUrl,
  buildWhatsAppEnquiryUrl,
  formatMoney,
  resolveItemIdentifier,
  saveTripEnquiryDraft,
  slugifyKey,
  splitDelimitedItems,
  stayDetailHref,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';

function StayDetailContent() {
  const searchParams = useSearchParams();
  const requestedId = (searchParams.get('id') ?? '').trim();

  const siteData = useSiteData();
  const content = contentObject(siteData?.content);
  const home = contentObject(content.home);
  const common = contentObject(content.common);
  const contact = contentObject(content.contact);
  const shop = contentObject(siteData?.shop);
  const shopContact = contentObject(shop.contact);

  const selectedPages =
    siteData.requirements?.requiredPages ??
    siteData.template?.structure?.pages ?? [
      'home',
      'destinations',
      'tours',
      'experiences',
      'stays',
      'offers',
      'journal',
      'plan_your_trip',
      'about_us',
      'services',
      'contact',
    ];
  const hasStays = selectedPages.includes('stays');
  const hasPlanner = selectedPages.includes('plan_your_trip');
  const staysBackHref = hasStays ? '/stays/' : '/#stays';
  const plannerTarget = hasPlanner ? '/plan-your-trip/' : '/#tailor-made';

  const stays = useMemo(
    () =>
      contentList(home.stays).map((raw, idx) => {
        const item = contentObject(raw);
        const rawPrice =
          typeof item.indicativePrice === 'number'
            ? item.indicativePrice
            : parseFloat(String(item.indicativePrice ?? 0));
        const indicativePrice = Number.isFinite(rawPrice) ? rawPrice : 0;
        const showPrice = item.showPrice !== undefined ? Boolean(item.showPrice) : indicativePrice > 0;
        return {
          index: idx,
          id: contentText(item.id),
          slug: resolveItemIdentifier(contentText(item.id), contentText(item.title), idx),
          title: contentText(item.title),
          subtitle: contentText(item.subtitle),
          category: contentText(item.category),
          description: contentText(item.description),
          overview: contentText(item.overview),
          roomTypes: splitDelimitedItems(contentText(item.roomTypes)),
          amenities: splitDelimitedItems(contentText(item.amenities)),
          suitableFor: contentText(item.suitableFor) || 'Families, Couples, Leisure Travellers',
          nearbyAttractions: splitDelimitedItems(contentText(item.nearbyAttractions)),
          importantInfo: contentText(item.importantInfo),
          imageUrl: contentText(item.imageUrl) || '/images/exp-villa.webp',
          imageAlt: contentText(item.imageAlt),
          photoGallery: contentList(item.photoGallery).map((g) => contentObject(g)),
          showPrice,
          indicativePrice,
          priceLabel: contentText(item.priceLabel),
        };
      }),
    [home.stays],
  );

  const stay = useMemo(() => {
    if (!requestedId) return stays[0] ?? null;
    const norm = slugifyKey(requestedId);
    const found = stays.find(
      (s) =>
        s.slug === norm ||
        slugifyKey(s.id) === norm ||
        slugifyKey(s.title) === norm ||
        String(s.index) === requestedId,
    );
    return found ?? null;
  }, [stays, requestedId]);

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!stay) {
    return (
      <div className="lux-container flex min-h-[55vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 data-preview-static="stay-not-found-title" className="font-display m-0 text-3xl font-bold text-[var(--lux-text)]">
          Accommodation Not Found
        </h1>
        <p data-preview-static="stay-not-found-body" className="m-0 max-w-md text-sm text-[var(--lux-text-muted)]">
          This stay listing could not be found or may have been updated. Browse all Sri Lankan accommodation options to explore available styles.
        </p>
        <a
          href={withBasePath(staysBackHref)}
          data-preview-static="stay-not-found-back"
          className="lux-btn-tropical mt-2"
        >
          Browse All Stays
        </a>
      </div>
    );
  }

  const galleryItems =
    stay.photoGallery.length > 0
      ? stay.photoGallery.map((g) => ({
          imageUrl: contentText(g.imageUrl) || stay.imageUrl,
          caption: contentText(g.caption) || stay.title,
        }))
      : [{ imageUrl: stay.imageUrl, caption: stay.title }];

  const safePhotoIdx = Math.min(activePhotoIdx, galleryItems.length - 1);
  const relatedStays = stays.filter((s) => s.slug !== stay.slug).slice(0, 3);

  const displayRate =
    stay.showPrice && stay.indicativePrice > 0
      ? stay.priceLabel || `Illustrative from ${formatMoney(stay.indicativePrice, 'LKR')} / night`
      : 'Request a Quote';

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyEmail =
    contentText(shopContact.email) || contentText(shop.businessEmail) || contentText(contact.email);
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);

  const inquiryMsg = [
    `Hello ${brandName},`,
    `I would like to enquire about "${stay.title}" (${stay.subtitle || 'Sri Lanka'}).`,
    stay.category ? `Accommodation Category: ${stay.category}` : null,
    `Displayed Rate Guide: ${displayRate}`,
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappHref = buildWhatsAppEnquiryUrl(agencyWhatsApp, inquiryMsg);
  const mailtoHref = buildMailtoEnquiryUrl(
    agencyEmail,
    `Accommodation Inquiry: ${stay.title}`,
    inquiryMsg,
  );

  const handlePlanStay = () => {
    saveTripEnquiryDraft({
      stayName: stay.title,
      stayCategory: stay.category,
      accommodation: stay.category || stay.title,
      destination: stay.subtitle || undefined,
      sourceLabel: `Accommodation: ${stay.title}`,
    });
    window.location.href = withBasePath(plannerTarget);
  };

  return (
    <article className="pb-16">
      {/* Cinematic Property Hero */}
      <section className="relative isolate flex min-h-[50vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]">
        <img
          src={withBasePath(stay.imageUrl)}
          alt={stay.imageAlt || stay.title}
          data-preview-static="stay-detail-hero-image"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#101820]/95 via-[#101820]/45 to-[#101820]/30"
        />

        <div className="lux-container relative z-10 pb-10 pt-20">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.08em] text-[#FAF8F3]/78">
            <a
              href={withBasePath('/')}
              data-preview-static="stay-detail-bc-home"
              className="text-[#FAF8F3]/80 no-underline hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <a
              href={withBasePath(staysBackHref)}
              data-preview-static="stay-detail-bc-list"
              className="text-[#FAF8F3]/80 no-underline hover:text-[#C5A46D]"
            >
              Hotels &amp; Stays
            </a>
            <span aria-hidden="true">/</span>
            <span data-preview-static="stay-detail-bc-current" className="font-semibold text-[#C5A46D]">
              {stay.title}
            </span>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
            {stay.category && (
              <span data-preview-static="stay-detail-category" className="text-[#C5A46D]">
                {stay.category}
              </span>
            )}
            {stay.subtitle && (
              <>
                <span aria-hidden="true" className="text-white/40">·</span>
                <span data-preview-static="stay-detail-location" className="text-[#FF783D]">
                  {stay.subtitle}
                </span>
              </>
            )}
          </div>

          <h1
            data-preview-static="stay-detail-title"
            className="font-display m-0 mb-3 max-w-3xl text-3xl font-bold leading-[1.08] sm:text-5xl"
          >
            {stay.title}
          </h1>
          <p
            data-preview-static="stay-detail-summary"
            className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/85 sm:text-base"
          >
            {stay.description}
          </p>
        </div>
      </section>

      {/* Main Property Detail Layout */}
      <div className="lux-container pt-10">
        {/* Quick Key Facts Strip */}
        <div className="mb-10 grid grid-cols-1 gap-4 rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-5 sm:grid-cols-3">
          <div>
            <span data-preview-static="stay-fact-loc-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Locations &amp; Regions
            </span>
            <span data-preview-static="stay-fact-loc-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {stay.subtitle || 'Sri Lanka'}
            </span>
          </div>
          <div>
            <span data-preview-static="stay-fact-suitable-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Suitable Travellers
            </span>
            <span data-preview-static="stay-fact-suitable-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {stay.suitableFor}
            </span>
          </div>
          <div>
            <span data-preview-static="stay-fact-rate-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Indicative Rate Guide
            </span>
            <span data-preview-static="stay-fact-rate-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {displayRate}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left 8 Columns */}
          <div className="space-y-10 lg:col-span-8">
            <section>
              <h2 data-preview-static="stay-overview-heading" className="font-display m-0 mb-3 text-2xl font-bold text-[var(--lux-text)]">
                Property Overview
              </h2>
              <p data-preview-static="stay-overview-body" className="m-0 max-w-[65ch] text-[15px] leading-[1.8] text-[var(--lux-text-muted)]">
                {stay.overview || stay.description}
              </p>
            </section>

            {/* Interactive Photo Gallery */}
            {galleryItems.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="stay-gallery-heading" className="font-display m-0 mb-4 text-xl font-bold text-[var(--lux-text)]">
                  Photo Gallery
                </h2>
                <div className="overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)]">
                  <img
                    src={withBasePath(galleryItems[safePhotoIdx].imageUrl)}
                    alt={galleryItems[safePhotoIdx].caption}
                    data-preview-static="stay-gallery-active-img"
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <p data-preview-static="stay-gallery-active-caption" className="m-0 px-4 py-2.5 text-xs text-[var(--lux-text-muted)]">
                    {galleryItems[safePhotoIdx].caption}
                  </p>
                </div>
                {galleryItems.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {galleryItems.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        data-preview-static="stay-gallery-thumb"
                        aria-label={`View photo ${idx + 1}: ${photo.caption}`}
                        aria-pressed={idx === safePhotoIdx}
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`overflow-hidden rounded border-2 p-0 transition ${
                          idx === safePhotoIdx
                            ? 'border-[var(--brand-accent,#FF783D)]'
                            : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={withBasePath(photo.imageUrl)}
                          alt={photo.caption}
                          loading="lazy"
                          className="h-14 w-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Accommodation Types */}
            {stay.roomTypes.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="stay-rooms-heading" className="font-display m-0 mb-4 text-xl font-bold text-[var(--lux-text)]">
                  Accommodation &amp; Room Types
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {stay.roomTypes.map((room, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded border border-[var(--lux-border)] bg-[var(--lux-surface)] p-3.5 text-sm text-[var(--lux-text)]"
                    >
                      <span aria-hidden="true" className="mt-0.5 text-[#C5A46D]">✦</span>
                      <span data-preview-static="stay-room-item">{room}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Amenities & Facilities */}
            {stay.amenities.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="stay-amenities-heading" className="font-display m-0 mb-4 text-xl font-bold text-[var(--lux-text)]">
                  Amenities &amp; Facilities
                </h2>
                <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 text-sm text-[var(--lux-text-muted)] sm:grid-cols-2">
                  {stay.amenities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span aria-hidden="true" className="font-bold text-[#154C42] dark:text-[#FF783D]">✓</span>
                      <span data-preview-static="stay-amenity-item">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Nearby Attractions */}
            {stay.nearbyAttractions.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="stay-nearby-heading" className="font-display m-0 mb-4 text-xl font-bold text-[var(--lux-text)]">
                  Nearby Attractions &amp; Highlights
                </h2>
                <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm text-[var(--lux-text-muted)]">
                  {stay.nearbyAttractions.map((spot, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span aria-hidden="true" className="font-bold text-[#154C42] dark:text-[#FF783D]">→</span>
                      <span data-preview-static="stay-nearby-item">{spot}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Important Information */}
            {stay.importantInfo && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <div className="rounded-[6px] border-l-2 border-[#C5A46D] bg-[var(--lux-surface-alt)] p-5">
                  <h2 data-preview-static="stay-important-heading" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                    Important Accommodation Information
                  </h2>
                  <p data-preview-static="stay-important-body" className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]">
                    {stay.importantInfo}
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Right 4 Columns: Sticky Inquiry Card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-sm)]">
              <span data-preview-static="stay-aside-eyebrow" className="font-display mb-1 block text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                {stay.category || 'Curated Stay'}
              </span>
              <p data-preview-static="stay-aside-rate" className="font-display m-0 mb-1 text-xl font-bold text-[var(--lux-text)]">
                {displayRate}
              </p>
              <p data-preview-static="stay-aside-note" className="m-0 mb-5 text-xs leading-relaxed text-[var(--lux-text-muted)]">
                Illustrative guide only — no live room booking or payment is taken here. Request a personalised quotation matched to your dates and meal plan.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  data-preview-static="stay-aside-plan-btn"
                  onClick={handlePlanStay}
                  className="lux-btn-tropical w-full"
                >
                  Plan Your Trip With This Stay
                </button>
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="stay-aside-whatsapp-btn"
                    className="lux-btn-sunset w-full"
                  >
                    WhatsApp Inquiry ↗
                  </a>
                )}
                {mailtoHref && (
                  <a
                    href={mailtoHref}
                    data-preview-static="stay-aside-email-btn"
                    className="lux-btn-outline w-full"
                  >
                    Email Inquiry
                  </a>
                )}
              </div>

              <div className="mt-5 border-t border-[var(--lux-border)] pt-4">
                <a
                  href={withBasePath(staysBackHref)}
                  data-preview-static="stay-aside-back-link"
                  className="lux-link-underline"
                >
                  ← All Hotels &amp; Stays
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Stays */}
        {relatedStays.length > 0 && (
          <section className="mt-14 border-t border-[var(--lux-border)] pt-10">
            <h2 data-preview-static="stay-related-heading" className="font-display m-0 mb-6 text-2xl font-bold text-[var(--lux-text)]">
              More Places to Stay
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedStays.map((rel) => {
                const relHref = hasStays
                  ? stayDetailHref(rel.id, rel.title, rel.index)
                  : withBasePath('/#stays');
                return (
                  <a
                    key={rel.slug}
                    href={relHref}
                    data-preview-static="stay-related-card-link"
                    className="group flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] text-inherit no-underline transition hover:shadow-[var(--lux-shadow-md)]"
                  >
                    <div className="lux-image-zoom aspect-[16/10] w-full overflow-hidden">
                      <img
                        src={withBasePath(rel.imageUrl)}
                        alt={rel.imageAlt || rel.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-4">
                      <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--lux-teal)]">
                        {rel.category} · {rel.subtitle}
                      </span>
                      <h3 className="font-display m-0 text-base font-bold text-[var(--lux-text)] group-hover:text-[var(--brand-accent,#FF783D)]">
                        {rel.title}
                      </h3>
                      <span className="mt-auto pt-2 text-xs font-semibold text-[var(--lux-text-muted)]">
                        {rel.showPrice && rel.indicativePrice > 0
                          ? rel.priceLabel || formatMoney(rel.indicativePrice, 'LKR')
                          : 'Request a Quote'}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export default function StayDetailPage() {
  return (
    <Suspense
      fallback={
        <div role="status" className="lux-container flex min-h-[50vh] items-center justify-center py-16 text-sm text-[var(--lux-text-muted)]">
          <span data-preview-static="stay-detail-loading">Loading accommodation details…</span>
        </div>
      }
    >
      <StayDetailContent />
    </Suspense>
  );
}

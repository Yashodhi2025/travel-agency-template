'use client';

import { useState } from 'react';
import { PlatformProductDetail } from '@deneb-ui/ui';
import {
  contentList,
  contentObject,
  contentText,
  platformProductDetailHref,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import {
  buildMailtoEnquiryUrl,
  buildWhatsAppEnquiryUrl,
  formatMoney,
  saveTripEnquiryDraft,
  splitDelimitedItems,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';

function TourItineraryDetailView({ product }: { product: Record<string, unknown> }) {
  const siteData = useSiteData();
  const allProducts = useProducts();
  const content = contentObject(siteData?.content);
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
  const hasTours = selectedPages.includes('tours');
  const toursBackHref = hasTours ? '/tours/' : '/#packages';
  const plannerTarget = selectedPages.includes('plan_your_trip')
    ? '/plan-your-trip/'
    : '/#tailor-made';

  const [openDay, setOpenDay] = useState<number | null>(0);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  const name = contentText(product.name) || contentText(product.title) || 'Curated Sri Lanka Journey';
  const description = contentText(product.description);
  const imageUrl = contentText(product.imageUrl) || contentText(product.featuredImage) || '/images/hero-sigiriya.webp';
  const imageAlt = contentText(product.imageAlt) || name;
  const category = contentText(product.category) || 'Private Journey';
  const badge = contentText(product.badge);
  const duration = contentText(product.duration);
  const destinations = contentText(product.destinations);
  const travelStyle = contentText(product.travelStyle);
  const groupSize = contentText(product.groupSize);
  const tourType = contentText(product.tourType);
  const pricingLabel = contentText(product.pricingLabel);
  const accommodation = contentText(product.accommodation);
  const transport = contentText(product.transport);
  const importantInfo = contentText(product.importantInfo);
  const highlights = splitDelimitedItems(contentText(product.highlights));
  const inclusions = splitDelimitedItems(contentText(product.inclusions));
  const exclusions = splitDelimitedItems(contentText(product.exclusions));
  const itinerary = contentList(product.itinerary).map((raw) => contentObject(raw));
  const photoGallery = contentList(product.photoGallery).map((raw) => contentObject(raw));

  const currency = contentText(product.currency) || 'LKR';
  const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0));
  const compareAt =
    typeof product.compareAtPrice === 'number'
      ? product.compareAtPrice
      : parseFloat(String(product.compareAtPrice || 0));
  const itemShowPrice = product.showPrice !== undefined ? Boolean(product.showPrice) : true;
  const isRange = Boolean(
    product.isPriceRange ||
      (product.minPrice !== undefined &&
        product.maxPrice !== undefined &&
        Number(product.maxPrice) > Number(product.minPrice)) ||
      contentText(product.priceRange),
  );
  const displayPrice = isRange
    ? contentText(product.priceRange) ||
      `${formatMoney(Number(product.minPrice ?? price), currency)} – ${formatMoney(Number(product.maxPrice ?? price), currency)}`
    : formatMoney(price, currency);

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyEmail =
    contentText(shopContact.email) || contentText(shop.businessEmail) || contentText(contact.email);
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);

  const enquiryMessage = [
    `Hello ${brandName},`,
    `I would like to enquire about the "${name}" package.`,
    tourType ? `Market: ${tourType}` : null,
    duration ? `Duration: ${duration}` : null,
    destinations ? `Route: ${destinations}` : null,
    itemShowPrice && price > 0 ? `Indicative Guide Shown: ${displayPrice}` : 'Pricing: Request a Quote',
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappHref = buildWhatsAppEnquiryUrl(agencyWhatsApp, enquiryMessage);
  const mailtoHref = buildMailtoEnquiryUrl(agencyEmail, `Tour Package Inquiry: ${name}`, enquiryMessage);

  const relatedJourneys = allProducts
    .filter((candidate) => String((candidate as Record<string, unknown>)?.id ?? '') !== String(product.id ?? ''))
    .slice(0, 3);

  const gallerySlides =
    photoGallery.length > 0
      ? photoGallery.map((g) => ({
          imageUrl: contentText(g.imageUrl) || imageUrl,
          caption: contentText(g.caption) || name,
        }))
      : [];

  const safeGalleryIdx = gallerySlides.length > 0 ? Math.min(activeGalleryIdx, gallerySlides.length - 1) : 0;

  const handleCarryToPlanner = () => {
    saveTripEnquiryDraft({
      travelType:
        tourType === 'Domestic' || tourType === 'Inbound' || tourType === 'Outbound'
          ? tourType
          : undefined,
      packageName: name,
      destination: destinations || undefined,
      duration: duration || undefined,
      travelStyle: category || undefined,
      currency: currency || 'LKR',
      sourceLabel: `Tour Package: ${name}`,
    });
    window.location.href = withBasePath(plannerTarget);
  };

  return (
    <article className="pb-16">
      {/* Cinematic Package Hero */}
      <section className="relative isolate flex min-h-[50vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]">
        <img
          src={withBasePath(imageUrl)}
          alt={imageAlt}
          data-preview-static="tour-detail-hero-image"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#101820]/95 via-[#101820]/50 to-[#101820]/30"
        />

        <div className="lux-container relative z-10 pb-10 pt-20">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.08em] text-[#FAF8F3]/78">
            <a
              href={withBasePath('/')}
              data-preview-static="breadcrumb-home"
              className="text-[#FAF8F3]/80 no-underline hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <a
              href={withBasePath(toursBackHref)}
              data-preview-static="breadcrumb-packages"
              className="text-[#FAF8F3]/80 no-underline hover:text-[#C5A46D]"
            >
              Tour Packages
            </a>
            <span aria-hidden="true">/</span>
            <span data-preview-static="breadcrumb-current" className="font-semibold text-[#C5A46D]">
              {name}
            </span>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            {tourType && (
              <span
                data-preview-static="tour-detail-market"
                className="rounded bg-[#154C42] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#FAF8F3]"
              >
                {tourType}
              </span>
            )}
            <span
              data-preview-static="tour-detail-category"
              className="rounded bg-[#C5A46D] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#101820]"
            >
              {category}
            </span>
            {badge && (
              <span
                data-preview-static="tour-detail-badge"
                className="rounded border border-white/30 bg-white/10 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#FAF8F3]"
              >
                {badge}
              </span>
            )}
          </div>

          <h1
            data-preview-static="tour-detail-title"
            className="font-display m-0 mb-2.5 max-w-4xl text-3xl font-bold leading-[1.08] sm:text-5xl"
          >
            {name}
          </h1>
          {destinations && (
            <p
              data-preview-static="tour-detail-route"
              className="m-0 text-sm font-medium tracking-[0.04em] text-[#C5A46D] sm:text-base"
            >
              {destinations}
            </p>
          )}
        </div>
      </section>

      {/* Main Content + Sticky Inquiry Panel */}
      <div className="lux-container pt-10">
        {/* Key Specs Strip */}
        <div className="mb-10 grid grid-cols-1 gap-4 rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span data-preview-static="spec-duration-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Duration
            </span>
            <span data-preview-static="spec-duration-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {duration || 'Flexible Duration'}
            </span>
          </div>
          <div>
            <span data-preview-static="spec-style-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Travel Style
            </span>
            <span data-preview-static="spec-style-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {travelStyle || 'Private Tailor-Made'}
            </span>
          </div>
          <div>
            <span data-preview-static="spec-group-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Group Size
            </span>
            <span data-preview-static="spec-group-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {groupSize || 'Private Party'}
            </span>
          </div>
          <div>
            <span data-preview-static="spec-price-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Indicative Rate ({currency})
            </span>
            <span data-preview-static="spec-price-value" className="font-display mt-1 block text-base font-bold text-[var(--lux-tropical)]">
              {itemShowPrice ? displayPrice : 'Request a Quote'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left 8 Columns */}
          <div className="space-y-10 lg:col-span-8">
            <section>
              <h2 data-preview-static="tour-overview-heading" className="font-display m-0 mb-3 text-2xl font-bold text-[var(--lux-text)]">
                Package Overview
              </h2>
              <p data-preview-static="tour-overview-body" className="m-0 max-w-[65ch] text-[15px] leading-[1.8] text-[var(--lux-text-muted)]">
                {description}
              </p>
            </section>

            {/* Interactive Photo Gallery */}
            {gallerySlides.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="tour-gallery-heading" className="font-display m-0 mb-4 text-xl font-bold text-[var(--lux-text)]">
                  Photo Gallery
                </h2>
                <div className="overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)]">
                  <img
                    src={withBasePath(gallerySlides[safeGalleryIdx].imageUrl)}
                    alt={gallerySlides[safeGalleryIdx].caption}
                    data-preview-static="tour-gallery-active-image"
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <p data-preview-static="tour-gallery-active-caption" className="m-0 px-4 py-2.5 text-xs text-[var(--lux-text-muted)]">
                    {gallerySlides[safeGalleryIdx].caption}
                  </p>
                </div>
                {gallerySlides.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {gallerySlides.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        data-preview-static="tour-gallery-thumb"
                        aria-label={`View gallery photo ${idx + 1}: ${photo.caption}`}
                        aria-pressed={idx === safeGalleryIdx}
                        onClick={() => setActiveGalleryIdx(idx)}
                        className={`overflow-hidden rounded border-2 p-0 transition ${
                          idx === safeGalleryIdx
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

            {highlights.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="tour-highlights-heading" className="font-display m-0 mb-4 text-xl font-bold text-[var(--lux-text)]">
                  Tour Highlights
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded border border-[var(--lux-border)] bg-[var(--lux-surface)] p-3.5 text-sm text-[var(--lux-text)]"
                    >
                      <span aria-hidden="true" className="mt-0.5 text-[#C5A46D]">✦</span>
                      <span data-preview-static="tour-highlight-item">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Day-by-Day Itinerary Accordion */}
            {itinerary.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <h2 data-preview-static="tour-itinerary-heading" className="font-display m-0 text-2xl font-bold text-[var(--lux-text)]">
                    Day-by-Day Itinerary
                  </h2>
                  <button
                    type="button"
                    data-preview-static="tour-itinerary-toggle-all"
                    onClick={() => setOpenDay((prev) => (prev === -1 ? 0 : -1))}
                    className="border-0 bg-transparent p-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-tropical)] underline"
                  >
                    {openDay === -1 ? 'Collapse All' : 'Expand All Days'}
                  </button>
                </div>

                <div className="divide-y divide-[var(--lux-border)] border-y border-[var(--lux-border)]">
                  {itinerary.map((dayObj, idx) => {
                    const isOpen = openDay === -1 || openDay === idx;
                    const dayLabel = contentText(dayObj.day) || `Day ${idx + 1}`;
                    const dayTitle = contentText(dayObj.title);
                    const dayDesc = contentText(dayObj.description);
                    const dayStay = contentText(dayObj.stay);
                    const panelId = `tour-day-panel-${idx}`;

                    return (
                      <div key={idx} className="py-4">
                        <button
                          type="button"
                          data-preview-static="tour-day-toggle"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => setOpenDay((prev) => (prev === idx ? null : idx))}
                          className="flex w-full items-center justify-between gap-4 border-0 bg-transparent p-0 text-left"
                        >
                          <span className="flex flex-wrap items-baseline gap-2.5">
                            <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                              {dayLabel}
                            </span>
                            <span className="font-display text-base font-bold text-[var(--lux-text)] sm:text-lg">
                              {dayTitle}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[var(--lux-border-strong)] text-sm text-[var(--lux-tropical)]"
                          >
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>

                        {isOpen && (
                          <div id={panelId} className="mt-2.5 space-y-1.5 pl-0 sm:pl-1">
                            {dayDesc && (
                              <p data-preview-static="tour-day-description" className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]">
                                {dayDesc}
                              </p>
                            )}
                            {dayStay && (
                              <p data-preview-static="tour-day-stay" className="m-0 text-xs font-semibold text-[var(--lux-teal)]">
                                Suggested stay: {dayStay}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Accommodation & Transportation */}
            {(accommodation || transport) && (
              <section className="grid grid-cols-1 gap-6 border-t border-[var(--lux-border)] pt-8 sm:grid-cols-2">
                {accommodation && (
                  <div className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-5">
                    <h2 data-preview-static="tour-accom-heading" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                      Accommodation
                    </h2>
                    <p data-preview-static="tour-accom-body" className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]">
                      {accommodation}
                    </p>
                  </div>
                )}
                {transport && (
                  <div className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-5">
                    <h2 data-preview-static="tour-transport-heading" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                      Transportation
                    </h2>
                    <p data-preview-static="tour-transport-body" className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]">
                      {transport}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Inclusions & Exclusions */}
            {(inclusions.length > 0 || exclusions.length > 0) && (
              <section className="grid grid-cols-1 gap-6 border-t border-[var(--lux-border)] pt-8 sm:grid-cols-2">
                <div className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-5">
                  <h3 data-preview-static="tour-inclusions-heading" className="font-display m-0 mb-3 text-lg font-bold text-[var(--lux-text)]">
                    Typically Included
                  </h3>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm text-[var(--lux-text-muted)]">
                    {inclusions.map((inc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span aria-hidden="true" className="font-bold text-[var(--lux-tropical)]">✓</span>
                        <span data-preview-static="tour-inclusion-item">{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-5">
                  <h3 data-preview-static="tour-exclusions-heading" className="font-display m-0 mb-3 text-lg font-bold text-[var(--lux-text)]">
                    Typically Excluded
                  </h3>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm text-[var(--lux-text-muted)]">
                    {exclusions.map((exc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-[var(--lux-text-muted)]">—</span>
                        <span data-preview-static="tour-exclusion-item">{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Important Travel Information */}
            {importantInfo && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <div className="rounded-[6px] border-l-2 border-[#C5A46D] bg-[var(--lux-surface-alt)] p-5">
                  <h2 data-preview-static="tour-important-heading" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                    Important Travel Information
                  </h2>
                  <p data-preview-static="tour-important-body" className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]">
                    {importantInfo}
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Right 4 Columns: Sticky Inquiry Card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-sm)]">
              <span
                data-preview-static="tour-sidebar-eyebrow"
                className="font-display mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]"
              >
                Tailor This Package
              </span>
              <div className="mb-1 flex items-baseline gap-2">
                <h3 data-preview-static="tour-sidebar-heading" className="font-display m-0 text-2xl font-bold text-[var(--lux-text)]">
                  {itemShowPrice ? displayPrice : 'Request a Quote'}
                </h3>
                {itemShowPrice && compareAt > 0 && !isRange && (
                  <span data-preview-static="tour-sidebar-compare" className="text-xs text-[var(--lux-text-muted)] line-through">
                    {formatMoney(compareAt, currency)}
                  </span>
                )}
              </div>
              {pricingLabel && itemShowPrice && (
                <p data-preview-static="tour-sidebar-pricing-basis" className="m-0 mb-3 text-xs font-medium text-[var(--lux-teal)]">
                  {pricingLabel}
                </p>
              )}
              <p data-preview-static="tour-sidebar-note" className="m-0 mb-5 text-xs leading-relaxed text-[var(--lux-text-muted)]">
                Illustrative demonstration guide. No online checkout or simulated payment — enquire directly via WhatsApp or email for verified live rates and custom dates.
              </p>

              <div className="flex flex-col gap-2.5">
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="tour-sidebar-whatsapp-btn"
                    className="lux-btn-sunset w-full"
                  >
                    Enquire on WhatsApp ↗
                  </a>
                )}

                <button
                  type="button"
                  data-preview-static="tour-sidebar-customise-btn"
                  onClick={handleCarryToPlanner}
                  className="lux-btn-tropical w-full"
                >
                  Customise This Itinerary
                </button>

                {mailtoHref && (
                  <a
                    href={mailtoHref}
                    data-preview-static="tour-sidebar-email-btn"
                    className="lux-btn-outline w-full"
                  >
                    Email Inquiry
                  </a>
                )}
              </div>

              <div className="mt-5 border-t border-[var(--lux-border)] pt-4">
                <a
                  href={withBasePath(toursBackHref)}
                  data-preview-static="tour-sidebar-back-link"
                  className="lux-link-underline"
                >
                  ← Browse All Tour Packages
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Packages */}
        {relatedJourneys.length > 0 && (
          <section className="mt-14 border-t border-[var(--lux-border)] pt-10">
            <h2 data-preview-static="tour-related-heading" className="font-display m-0 mb-6 text-2xl font-bold text-[var(--lux-text)]">
              Related Tour Packages
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedJourneys.map((rawRel, idx) => {
                const rel = contentObject(rawRel);
                const relId = typeof rel.id === 'string' || typeof rel.id === 'number' ? rel.id : null;
                return (
                  <a
                    key={relId ?? idx}
                    href={platformProductDetailHref(relId)}
                    data-preview-static="tour-related-card-link"
                    className="group flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] text-inherit no-underline transition hover:shadow-[var(--lux-shadow-md)]"
                  >
                    <div className="lux-image-zoom aspect-[16/10] w-full overflow-hidden">
                      <img
                        src={withBasePath(contentText(rel.imageUrl) || '/images/hero-sigiriya.webp')}
                        alt={contentText(rel.name)}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--lux-tropical)]">
                        {contentText(rel.duration) || contentText(rel.category)}
                      </span>
                      <h3 className="font-display mt-1 mb-1 text-base font-bold text-[var(--lux-text)] group-hover:text-[var(--brand-accent,#FF783D)]">
                        {contentText(rel.name)}
                      </h3>
                      <p className="m-0 text-xs text-[var(--lux-text-muted)]">
                        {contentText(rel.destinations)}
                      </p>
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

export default function ProductDetailPage() {
  return (
    <PlatformProductDetail
      backHref="/#packages"
      backLabel="Explore All Journeys"
      renderProduct={(product) => (
        <TourItineraryDetailView product={product as Record<string, unknown>} />
      )}
      loadingFallback={
        <div
          role="status"
          className="lux-container flex min-h-[50vh] items-center justify-center py-16 text-sm text-[var(--lux-text-muted)]"
        >
          <span data-preview-static="product-detail-loading">Loading itinerary details…</span>
        </div>
      }
      notFoundFallback={
        <div className="lux-container flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 py-20 text-center">
          <h1 data-preview-static="tour-not-found-heading" className="font-display m-0 text-3xl font-bold text-[var(--lux-text)]">
            Tour Package Not Found
          </h1>
          <p data-preview-static="tour-not-found-body" className="m-0 text-sm text-[var(--lux-text-muted)]">
            This sample tour package could not be located or may have been updated. Browse our curated tours to explore available itineraries.
          </p>
          <a
            href={withBasePath('/#packages')}
            data-preview-static="tour-not-found-cta"
            className="lux-btn-tropical mt-2"
          >
            Browse Tour Packages
          </a>
        </div>
      }
    />
  );
}

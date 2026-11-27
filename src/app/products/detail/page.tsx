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

  const [openDay, setOpenDay] = useState<number | null>(0);

  const name = contentText(product.name) || contentText(product.title) || 'Curated Sri Lanka Journey';
  const description = contentText(product.description);
  const imageUrl = contentText(product.imageUrl) || contentText(product.featuredImage) || '/images/hero-sigiriya.webp';
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
  const highlights = splitDelimitedItems(contentText(product.highlights));
  const inclusions = splitDelimitedItems(contentText(product.inclusions));
  const exclusions = splitDelimitedItems(contentText(product.exclusions));
  const itinerary = contentList(product.itinerary).map((raw) => contentObject(raw));
  const gallery = contentList(product.photoGallery).map((raw) => contentObject(raw));

  const currency = contentText(product.currency) || 'LKR';
  const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0));
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
    `I would like to enquire about customising the "${name}" itinerary.`,
    duration ? `Duration: ${duration}` : null,
    destinations ? `Route: ${destinations}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappHref = buildWhatsAppEnquiryUrl(agencyWhatsApp, enquiryMessage);
  const mailtoHref = buildMailtoEnquiryUrl(agencyEmail, `Itinerary Enquiry: ${name}`, enquiryMessage);

  const relatedJourneys = allProducts
    .filter((candidate) => String((candidate as any)?.id ?? '') !== String(product.id ?? ''))
    .slice(0, 3);

  const handleCarryToPlanner = () => {
    saveTripEnquiryDraft({
      packageName: name,
      destination: destinations || undefined,
      duration: duration || undefined,
      travelStyle: category || undefined,
    });
    window.location.href = withBasePath('/#tailor-made');
  };

  return (
    <article className="pb-20">
      {/* Cinematic Tour Hero */}
      <section className="relative isolate flex min-h-[56vh] items-end overflow-hidden bg-[#0D241E] text-[#F7F3EA]">
        <img
          src={withBasePath(imageUrl)}
          alt={name}
          data-preview-static="tour-detail-hero-image"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#091814]/95 via-[#0D241E]/55 to-[#091814]/35"
        />

        <div className="lux-container relative z-10 pb-12 pt-20">
          {/* Breadcrumb */}
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#F7F3EA]/75">
            <a
              href={withBasePath('/')}
              data-preview-static="breadcrumb-home"
              className="text-[#F7F3EA]/80 no-underline hover:text-[#C6A46A]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <a
              href={withBasePath('/#packages')}
              data-preview-static="breadcrumb-packages"
              className="text-[#F7F3EA]/80 no-underline hover:text-[#C6A46A]"
            >
              Tour Packages
            </a>
            <span aria-hidden="true">/</span>
            <span data-preview-static="breadcrumb-current" className="text-[#C6A46A]">
              {name}
            </span>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            {tourType && (
              <span
                data-preview-static="tour-detail-market"
                className="rounded-full bg-[#101820]/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#FAF9F6] backdrop-blur-sm"
              >
                {tourType}
              </span>
            )}
            <span
              data-preview-static="tour-detail-category"
              className="rounded-full bg-[#FF783D] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
            >
              {category}
            </span>
            {badge && (
              <span
                data-preview-static="tour-detail-badge"
                className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#FAF9F6]"
              >
                {badge}
              </span>
            )}
          </div>

          <h1
            data-preview-static="tour-detail-title"
            className="font-editorial m-0 mb-3 max-w-4xl text-4xl font-medium leading-[1.08] sm:text-5xl lg:text-6xl"
          >
            {name}
          </h1>
          {destinations && (
            <p
              data-preview-static="tour-detail-route"
              className="m-0 text-sm tracking-[0.06em] text-[#C6A46A] sm:text-base"
            >
              {destinations}
            </p>
          )}
        </div>
      </section>

      {/* Main Content + Sticky Enquiry Panel */}
      <div className="lux-container pt-12">
        {/* Key Specs Strip */}
        <div className="mb-12 grid grid-cols-1 gap-4 border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span data-preview-static="spec-duration-label" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]">
              Duration
            </span>
            <span data-preview-static="spec-duration-value" className="mt-1 block text-sm font-medium text-[var(--lux-text)]">
              {duration || 'Flexible Duration'}
            </span>
          </div>
          <div>
            <span data-preview-static="spec-style-label" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]">
              Travel Style
            </span>
            <span data-preview-static="spec-style-value" className="mt-1 block text-sm font-medium text-[var(--lux-text)]">
              {travelStyle || 'Private Tailor-Made'}
            </span>
          </div>
          <div>
            <span data-preview-static="spec-group-label" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]">
              Group Size
            </span>
            <span data-preview-static="spec-group-value" className="mt-1 block text-sm font-medium text-[var(--lux-text)]">
              {groupSize || 'Private Party'}
            </span>
          </div>
          <div>
            <span data-preview-static="spec-price-label" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]">
              Indicative Pricing
            </span>
            <span data-preview-static="spec-price-value" className="font-editorial mt-1 block text-lg font-semibold text-[var(--lux-forest)]">
              {itemShowPrice ? displayPrice : 'Price on Request'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left 8 Columns: Story, Highlights, Itinerary, Stays, Inclusions */}
          <div className="space-y-12 lg:col-span-8">
            <section>
              <h2 data-preview-static="tour-overview-heading" className="font-editorial mb-4 text-3xl font-medium text-[var(--lux-text)]">
                Journey Overview
              </h2>
              <p data-preview-static="tour-overview-body" className="m-0 text-base leading-[1.85] text-[var(--lux-text-muted)]">
                {description}
              </p>
            </section>

            {highlights.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-10">
                <h2 data-preview-static="tour-highlights-heading" className="font-editorial mb-5 text-2xl font-medium text-[var(--lux-text)]">
                  Signature Highlights
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-4 text-sm text-[var(--lux-text)]"
                    >
                      <span aria-hidden="true" className="mt-0.5 text-[#C6A46A]">✦</span>
                      <span data-preview-static="tour-highlight-item">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {itinerary.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-10">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <h2 data-preview-static="tour-itinerary-heading" className="font-editorial m-0 text-3xl font-medium text-[var(--lux-text)]">
                    Suggested Day-by-Day Itinerary
                  </h2>
                  <button
                    type="button"
                    data-preview-static="tour-itinerary-toggle-all"
                    onClick={() => setOpenDay((prev) => (prev === -1 ? 0 : -1))}
                    className="border-0 bg-transparent p-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--lux-gold-deep)] underline dark:text-[#C6A46A]"
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

                    return (
                      <div key={idx} className="py-5">
                        <button
                          type="button"
                          data-preview-static="tour-day-toggle"
                          aria-expanded={isOpen}
                          onClick={() => setOpenDay((prev) => (prev === idx ? null : idx))}
                          className="flex w-full items-center justify-between gap-4 border-0 bg-transparent p-0 text-left"
                        >
                          <span className="flex flex-wrap items-baseline gap-3">
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]">
                              {dayLabel}
                            </span>
                            <span className="font-editorial text-xl font-medium text-[var(--lux-text)]">
                              {dayTitle}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[var(--lux-border-strong)] text-sm text-[#C6A46A]"
                          >
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="mt-3 space-y-2 pl-0 sm:pl-2">
                            {dayDesc && (
                              <p data-preview-static="tour-day-description" className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]">
                                {dayDesc}
                              </p>
                            )}
                            {dayStay && (
                              <p data-preview-static="tour-day-stay" className="m-0 text-xs font-medium text-[var(--lux-teal)]">
                                Suggested stay style: {dayStay}
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

            {(accommodation || transport) && (
              <section className="grid grid-cols-1 gap-6 border-t border-[var(--lux-border)] pt-10 sm:grid-cols-2">
                {accommodation && (
                  <div>
                    <h2 data-preview-static="tour-accom-heading" className="font-display mb-3 text-xl font-bold text-[var(--lux-text)]">
                      Accommodation Overview
                    </h2>
                    <p data-preview-static="tour-accom-body" className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]">
                      {accommodation}
                    </p>
                  </div>
                )}
                {transport && (
                  <div>
                    <h2 data-preview-static="tour-transport-heading" className="font-display mb-3 text-xl font-bold text-[var(--lux-text)]">
                      Transport Overview
                    </h2>
                    <p data-preview-static="tour-transport-body" className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]">
                      {transport}
                    </p>
                  </div>
                )}
              </section>
            )}

            {gallery.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-10">
                <h2 data-preview-static="tour-gallery-heading" className="font-display mb-5 text-2xl font-bold text-[var(--lux-text)]">
                  Journey Photo Gallery
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {gallery.map((photo, idx) => (
                    <figure key={idx} className="m-0 overflow-hidden rounded-lg border border-[var(--lux-border)]">
                      <img
                        src={withBasePath(contentText(photo.imageUrl) || imageUrl)}
                        alt={contentText(photo.caption) || `${name} photo ${idx + 1}`}
                        data-preview-static="tour-gallery-image"
                        className="aspect-[4/3] w-full object-cover"
                      />
                      {contentText(photo.caption) && (
                        <figcaption
                          data-preview-static="tour-gallery-caption"
                          className="bg-[var(--lux-surface)] px-3 py-2 text-xs text-[var(--lux-text-muted)]"
                        >
                          {contentText(photo.caption)}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {(inclusions.length > 0 || exclusions.length > 0) && (
              <section className="grid grid-cols-1 gap-6 border-t border-[var(--lux-border)] pt-10 sm:grid-cols-2">
                <div className="border border-[var(--lux-border)] bg-[var(--lux-surface)] p-6">
                  <h3 data-preview-static="tour-inclusions-heading" className="font-editorial mb-4 text-xl font-medium text-[var(--lux-text)]">
                    Typically Included
                  </h3>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm text-[var(--lux-text-muted)]">
                    {inclusions.map((inc, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span aria-hidden="true" className="text-[var(--lux-teal)]">✓</span>
                        <span data-preview-static="tour-inclusion-item">{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-[var(--lux-border)] bg-[var(--lux-surface)] p-6">
                  <h3 data-preview-static="tour-exclusions-heading" className="font-editorial mb-4 text-xl font-medium text-[var(--lux-text)]">
                    Typically Excluded
                  </h3>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm text-[var(--lux-text-muted)]">
                    {exclusions.map((exc, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span aria-hidden="true" className="text-[var(--lux-text-muted)]">—</span>
                        <span data-preview-static="tour-exclusion-item">{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>

          {/* Right 4 Columns: Sticky Bespoke Enquiry Card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-md)]">
              <span
                data-preview-static="tour-sidebar-eyebrow"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
              >
                Tailor This Journey
              </span>
              <h3 data-preview-static="tour-sidebar-heading" className="font-display mb-1 text-2xl font-bold text-[var(--lux-text)]">
                {itemShowPrice ? displayPrice : 'Price on Request'}
              </h3>
              {pricingLabel && itemShowPrice && (
                <p data-preview-static="tour-sidebar-pricing-basis" className="m-0 mb-3 text-xs font-medium text-[#167D91] dark:text-[#4AB4C8]">
                  {pricingLabel}
                </p>
              )}
              <p data-preview-static="tour-sidebar-note" className="mb-6 text-xs leading-relaxed text-[var(--lux-text-muted)]">
                Illustrative private guide. Every itinerary is adjusted to your exact dates, hotel tier, and party size with a transparent custom proposal.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  data-preview-static="tour-sidebar-customise-btn"
                  onClick={handleCarryToPlanner}
                  className="lux-btn-primary w-full"
                >
                  Customise This Itinerary
                </button>

                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="tour-sidebar-whatsapp-btn"
                    className="lux-btn-gold w-full"
                  >
                    Enquire on WhatsApp ↗
                  </a>
                )}

                {mailtoHref && (
                  <a
                    href={mailtoHref}
                    data-preview-static="tour-sidebar-email-btn"
                    className="lux-btn-outline w-full"
                  >
                    Email Concierge
                  </a>
                )}
              </div>

              <div className="mt-6 border-t border-[var(--lux-border)] pt-4 text-xs text-[var(--lux-text-muted)]">
                <a
                  href={withBasePath('/#packages')}
                  data-preview-static="tour-sidebar-back-link"
                  className="lux-link-underline"
                >
                  ← Explore all itineraries
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Journeys */}
        {relatedJourneys.length > 0 && (
          <section className="mt-20 border-t border-[var(--lux-border)] pt-14">
            <h2 data-preview-static="tour-related-heading" className="font-editorial mb-8 text-3xl font-medium text-[var(--lux-text)]">
              More Curated Journeys
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
                    className="lux-card group flex flex-col overflow-hidden text-inherit no-underline"
                  >
                    <div className="lux-image-zoom aspect-[16/10] w-full overflow-hidden">
                      <img
                        src={withBasePath(contentText(rel.imageUrl) || '/images/hero-sigiriya.webp')}
                        alt={contentText(rel.name)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]">
                        {contentText(rel.duration) || contentText(rel.category)}
                      </span>
                      <h3 className="font-editorial mt-1 mb-1 text-xl font-medium text-[var(--lux-text)] group-hover:underline">
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
          className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4 py-16 text-sm text-[var(--lux-text-muted)]"
        >
          <span data-preview-static="product-detail-loading">Loading itinerary details…</span>
        </div>
      }
      notFoundFallback={
        <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <h1 data-preview-static="tour-not-found-heading" className="font-editorial m-0 text-3xl font-medium text-[var(--lux-text)]">
            Journey Not Found
          </h1>
          <p data-preview-static="tour-not-found-body" className="m-0 text-sm text-[var(--lux-text-muted)]">
            This sample itinerary could not be located or may have been updated. Browse our curated journeys to explore available routes.
          </p>
          <a
            href={withBasePath('/#packages')}
            data-preview-static="tour-not-found-cta"
            className="lux-btn-primary mt-2"
          >
            Browse All Journeys
          </a>
        </div>
      }
    />
  );
}

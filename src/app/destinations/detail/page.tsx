'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  experienceDetailHref,
  formatMoney,
  resolveItemIdentifier,
  saveTripEnquiryDraft,
  slugifyKey,
  splitDelimitedItems,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';

function DestinationDetailContent() {
  const searchParams = useSearchParams();
  const requestedId = (searchParams.get('id') ?? '').trim();

  const siteData = useSiteData();
  const allProducts = useProducts();
  const content = contentObject(siteData?.content);
  const home = contentObject(content.home);
  const common = contentObject(content.common);
  const contact = contentObject(content.contact);
  const shop = contentObject(siteData?.shop);
  const shopContact = contentObject(shop.contact);

  const selectedPages =
    siteData.requirements?.requiredPages ??
    siteData.template?.structure?.pages ??
    ['home', 'destinations', 'tours', 'experiences', 'about_us', 'services', 'contact'];
  const hasDestinations = selectedPages.includes('destinations');
  const hasExperiences = selectedPages.includes('experiences');

  const destinations = useMemo(
    () =>
      contentList(home.destinations).map((raw, idx) => {
        const item = contentObject(raw);
        return {
          index: idx,
          id: contentText(item.id),
          slug: resolveItemIdentifier(contentText(item.id), contentText(item.name), idx),
          name: contentText(item.name),
          region: contentText(item.region),
          category: contentText(item.category),
          bestSeason: contentText(item.bestSeason),
          suggestedDuration: contentText(item.suggestedDuration) || '2 – 3 Days',
          shortDescription: contentText(item.shortDescription),
          detailedDescription: contentText(item.detailedDescription),
          highlights: splitDelimitedItems(contentText(item.highlights)),
          topAttractions: splitDelimitedItems(contentText(item.topAttractions)),
          thingsToDo: splitDelimitedItems(contentText(item.thingsToDo)),
          travelInfo: contentText(item.travelInfo),
          imageUrl: contentText(item.imageUrl) || '/images/hero-sigiriya.webp',
          imageAlt: contentText(item.imageAlt),
          photoGallery: contentList(item.photoGallery).map((g) => contentObject(g)),
        };
      }),
    [home.destinations],
  );

  const destination = useMemo(() => {
    if (!requestedId) return destinations[0] ?? null;
    const norm = slugifyKey(requestedId);
    const bySlug = destinations.find(
      (d) =>
        d.slug === norm ||
        slugifyKey(d.id) === norm ||
        slugifyKey(d.name) === norm ||
        String(d.index) === requestedId,
    );
    return bySlug ?? null;
  }, [destinations, requestedId]);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!destination) {
    return (
      <div className="lux-container flex min-h-[55vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 data-preview-static="dest-not-found-title" className="font-display m-0 text-3xl font-bold text-[var(--lux-text)]">
          Destination Not Found
        </h1>
        <p data-preview-static="dest-not-found-body" className="m-0 max-w-md text-sm text-[var(--lux-text-muted)]">
          This destination could not be found or may have been updated. Browse all Sri Lankan destinations to explore available regions.
        </p>
        <a
          href={withBasePath(hasDestinations ? '/destinations/' : '/#destinations')}
          data-preview-static="dest-not-found-back"
          className="lux-btn-tropical mt-2"
        >
          Browse All Destinations
        </a>
      </div>
    );
  }

  const galleryItems =
    destination.photoGallery.length > 0
      ? destination.photoGallery.map((g) => ({
          imageUrl: contentText(g.imageUrl) || destination.imageUrl,
          caption: contentText(g.caption) || destination.name,
        }))
      : [{ imageUrl: destination.imageUrl, caption: destination.name }];

  const safePhotoIdx = Math.min(activePhotoIndex, galleryItems.length - 1);
  const attractionsList =
    destination.topAttractions.length > 0 ? destination.topAttractions : destination.highlights;

  // Auto-match related tours
  const destKeyword = destination.name.toLowerCase();
  const relatedTours = allProducts
    .filter((raw) => {
      const p = contentObject(raw);
      const hay = `${contentText(p.destinations)} ${contentText(p.name)} ${contentText(p.description)}`.toLowerCase();
      return hay.includes(destKeyword);
    })
    .slice(0, 3);
  const displayTours = relatedTours.length > 0 ? relatedTours : allProducts.slice(0, 3);

  // Auto-match related experiences
  const allExperiences = contentList(home.experiences).map((raw, idx) => {
    const e = contentObject(raw);
    return {
      index: idx,
      id: contentText(e.id),
      title: contentText(e.title),
      category: contentText(e.category),
      location: contentText(e.location),
      description: contentText(e.description),
      imageUrl: contentText(e.imageUrl) || '/images/hero-ella.webp',
      imageAlt: contentText(e.imageAlt),
    };
  });
  const matchedExperiences = allExperiences
    .filter((e) => {
      const hay = `${e.location} ${e.title} ${e.category} ${e.description}`.toLowerCase();
      return hay.includes(destKeyword) || (destination.category && hay.includes(destination.category.toLowerCase()));
    })
    .slice(0, 3);
  const displayExperiences =
    matchedExperiences.length > 0 ? matchedExperiences : allExperiences.slice(0, 3);

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
    `I would like to plan a trip including ${destination.name} (${destination.region || 'Sri Lanka'}).`,
    destination.suggestedDuration ? `Suggested stay: ${destination.suggestedDuration}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappHref = buildWhatsAppEnquiryUrl(agencyWhatsApp, inquiryMsg);
  const mailtoHref = buildMailtoEnquiryUrl(
    agencyEmail,
    `Destination Inquiry: ${destination.name}`,
    inquiryMsg,
  );

  const handlePlanHere = () => {
    saveTripEnquiryDraft({
      destination: destination.name,
      duration: destination.suggestedDuration,
    });
    window.location.href = withBasePath('/#tailor-made');
  };

  return (
    <article className="pb-16">
      {/* Destination Hero */}
      <section className="relative isolate flex min-h-[50vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]">
        <img
          src={withBasePath(destination.imageUrl)}
          alt={destination.imageAlt || destination.name}
          data-preview-static="dest-detail-hero-image"
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
              data-preview-static="dest-detail-bc-home"
              className="text-[#FAF8F3]/80 no-underline hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <a
              href={withBasePath(hasDestinations ? '/destinations/' : '/#destinations')}
              data-preview-static="dest-detail-bc-list"
              className="text-[#FAF8F3]/80 no-underline hover:text-[#C5A46D]"
            >
              Destinations
            </a>
            <span aria-hidden="true">/</span>
            <span data-preview-static="dest-detail-bc-current" className="font-semibold text-[#C5A46D]">
              {destination.name}
            </span>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
            {destination.region && (
              <span data-preview-static="dest-detail-region" className="text-[#C5A46D]">
                {destination.region}
              </span>
            )}
            {destination.category && (
              <>
                <span aria-hidden="true" className="text-white/40">·</span>
                <span data-preview-static="dest-detail-category" className="text-[#FF783D]">
                  {destination.category}
                </span>
              </>
            )}
          </div>

          <h1
            data-preview-static="dest-detail-title"
            className="font-display m-0 mb-3 max-w-3xl text-3xl font-bold leading-[1.08] sm:text-5xl"
          >
            {destination.name}
          </h1>
          <p
            data-preview-static="dest-detail-summary"
            className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/85 sm:text-base"
          >
            {destination.shortDescription}
          </p>
        </div>
      </section>

      {/* Main Detail Layout */}
      <div className="lux-container pt-10">
        {/* Compact Key Travel Facts Strip */}
        <div className="mb-10 grid grid-cols-1 gap-4 rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-5 sm:grid-cols-3">
          <div>
            <span data-preview-static="dest-fact-season-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Best Time to Visit
            </span>
            <span data-preview-static="dest-fact-season-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {destination.bestSeason || 'Year-round'}
            </span>
          </div>
          <div>
            <span data-preview-static="dest-fact-duration-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Suggested Duration
            </span>
            <span data-preview-static="dest-fact-duration-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {destination.suggestedDuration}
            </span>
          </div>
          <div>
            <span data-preview-static="dest-fact-region-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Region &amp; Character
            </span>
            <span data-preview-static="dest-fact-region-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {[destination.region, destination.category].filter(Boolean).join(' · ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left 8 Columns: Overview, Top Attractions, Things to Do, Travel Info, Gallery */}
          <div className="space-y-10 lg:col-span-8">
            <section>
              <h2 data-preview-static="dest-overview-heading" className="font-display m-0 mb-3 text-2xl font-bold text-[var(--lux-text)]">
                Overview
              </h2>
              <p data-preview-static="dest-overview-body" className="m-0 max-w-[65ch] text-[15px] leading-[1.8] text-[var(--lux-text-muted)]">
                {destination.detailedDescription || destination.shortDescription}
              </p>
            </section>

            {attractionsList.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="dest-attractions-heading" className="font-display m-0 mb-4 text-xl font-bold text-[var(--lux-text)]">
                  Top Attractions
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {attractionsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded border border-[var(--lux-border)] bg-[var(--lux-surface)] p-3.5 text-sm text-[var(--lux-text)]"
                    >
                      <span aria-hidden="true" className="mt-0.5 text-[#C5A46D]">✦</span>
                      <span data-preview-static="dest-attraction-item">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {destination.thingsToDo.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="dest-things-heading" className="font-display m-0 mb-4 text-xl font-bold text-[var(--lux-text)]">
                  Things to Do
                </h2>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm text-[var(--lux-text-muted)]">
                  {destination.thingsToDo.map((todo, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span aria-hidden="true" className="font-bold text-[#154C42] dark:text-[#FF783D]">→</span>
                      <span data-preview-static="dest-todo-item">{todo}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {destination.travelInfo && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="dest-transport-heading" className="font-display m-0 mb-3 text-xl font-bold text-[var(--lux-text)]">
                  Travel &amp; Transport Information
                </h2>
                <p data-preview-static="dest-transport-body" className="m-0 max-w-[65ch] text-sm leading-[1.8] text-[var(--lux-text-muted)]">
                  {destination.travelInfo}
                </p>
              </section>
            )}

            {/* Interactive Keyboard-Friendly Photo Gallery */}
            {galleryItems.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="dest-gallery-heading" className="font-display m-0 mb-4 text-xl font-bold text-[var(--lux-text)]">
                  Photo Gallery
                </h2>
                <div className="overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)]">
                  <img
                    src={withBasePath(galleryItems[safePhotoIdx].imageUrl)}
                    alt={galleryItems[safePhotoIdx].caption}
                    data-preview-static="dest-gallery-active-img"
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <p data-preview-static="dest-gallery-active-caption" className="m-0 px-4 py-2.5 text-xs text-[var(--lux-text-muted)]">
                    {galleryItems[safePhotoIdx].caption}
                  </p>
                </div>
                {galleryItems.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {galleryItems.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        data-preview-static="dest-gallery-thumb"
                        aria-label={`View photo ${idx + 1}: ${photo.caption}`}
                        aria-pressed={idx === safePhotoIdx}
                        onClick={() => setActivePhotoIndex(idx)}
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
          </div>

          {/* Right 4 Columns: Sticky Inquiry Card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-sm)]">
              <span data-preview-static="dest-aside-eyebrow" className="font-display mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                Visit {destination.name}
              </span>
              <h2 data-preview-static="dest-aside-title" className="font-display m-0 mb-2 text-xl font-bold text-[var(--lux-text)]">
                Include {destination.name} in Your Trip
              </h2>
              <p data-preview-static="dest-aside-note" className="m-0 mb-5 text-xs leading-relaxed text-[var(--lux-text-muted)]">
                Suitable for domestic weekend getaways, family tours, honeymoon escapes, or multi-city inbound itineraries with private A/C transport.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  data-preview-static="dest-aside-plan-btn"
                  onClick={handlePlanHere}
                  className="lux-btn-tropical w-full"
                >
                  Plan Your Trip
                </button>
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="dest-aside-whatsapp-btn"
                    className="lux-btn-sunset w-full"
                  >
                    WhatsApp Inquiry ↗
                  </a>
                )}
                {mailtoHref && (
                  <a
                    href={mailtoHref}
                    data-preview-static="dest-aside-email-btn"
                    className="lux-btn-outline w-full"
                  >
                    Email Inquiry
                  </a>
                )}
              </div>

              <div className="mt-5 border-t border-[var(--lux-border)] pt-4">
                <a
                  href={withBasePath(hasDestinations ? '/destinations/' : '/#destinations')}
                  data-preview-static="dest-aside-back-link"
                  className="lux-link-underline"
                >
                  ← All Destinations
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Tours */}
        {displayTours.length > 0 && (
          <section className="mt-14 border-t border-[var(--lux-border)] pt-10">
            <h2 data-preview-static="dest-related-tours-heading" className="font-display m-0 mb-6 text-2xl font-bold text-[var(--lux-text)]">
              Related Tour Packages
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {displayTours.map((rawTour, idx) => {
                const t = contentObject(rawTour);
                const tId = typeof t.id === 'string' || typeof t.id === 'number' ? t.id : null;
                const price = typeof t.price === 'number' ? t.price : parseFloat(String(t.price || 0));
                const showPrice = t.showPrice !== undefined ? Boolean(t.showPrice) : true;
                const currency = contentText(t.currency) || 'LKR';
                return (
                  <a
                    key={tId ?? idx}
                    href={platformProductDetailHref(tId)}
                    data-preview-static="dest-related-tour-link"
                    className="group flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] text-inherit no-underline transition hover:shadow-[var(--lux-shadow-md)]"
                  >
                    <div className="lux-image-zoom aspect-[16/10] w-full overflow-hidden">
                      <img
                        src={withBasePath(contentText(t.imageUrl) || '/images/hero-sigiriya.webp')}
                        alt={contentText(t.name)}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 p-4">
                      <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--lux-tropical)]">
                        {contentText(t.duration) || contentText(t.tourType)}
                      </span>
                      <h3 className="font-display m-0 text-base font-bold text-[var(--lux-text)] group-hover:text-[var(--brand-accent,#FF783D)]">
                        {contentText(t.name)}
                      </h3>
                      <span className="mt-auto pt-2 text-xs font-semibold text-[var(--lux-text-muted)]">
                        {showPrice && price > 0 ? formatMoney(price, currency) : 'Request a Quote'}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Experiences */}
        {displayExperiences.length > 0 && (
          <section className="mt-12 border-t border-[var(--lux-border)] pt-10">
            <h2 data-preview-static="dest-related-exp-heading" className="font-display m-0 mb-6 text-2xl font-bold text-[var(--lux-text)]">
              Related Experiences
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {displayExperiences.map((exp) => {
                const expHref = hasExperiences
                  ? experienceDetailHref(exp.id, exp.title, exp.index)
                  : withBasePath('/#experiences');
                return (
                  <a
                    key={exp.id || exp.index}
                    href={expHref}
                    data-preview-static="dest-related-exp-link"
                    className="group flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] text-inherit no-underline transition hover:shadow-[var(--lux-shadow-md)]"
                  >
                    <div className="lux-image-zoom aspect-[16/10] w-full overflow-hidden">
                      <img
                        src={withBasePath(exp.imageUrl)}
                        alt={exp.imageAlt || exp.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                        {exp.category}
                      </span>
                      <h3 className="font-display mt-1 mb-1 text-base font-bold text-[var(--lux-text)] group-hover:text-[var(--brand-accent,#FF783D)]">
                        {exp.title}
                      </h3>
                      <p className="m-0 line-clamp-2 text-xs text-[var(--lux-text-muted)]">
                        {exp.description}
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

export default function DestinationDetailPage() {
  return (
    <Suspense
      fallback={
        <div role="status" className="lux-container flex min-h-[50vh] items-center justify-center py-16 text-sm text-[var(--lux-text-muted)]">
          <span data-preview-static="dest-detail-loading">Loading destination guide…</span>
        </div>
      }
    >
      <DestinationDetailContent />
    </Suspense>
  );
}

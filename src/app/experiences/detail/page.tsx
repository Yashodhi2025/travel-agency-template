'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import {
  buildMailtoEnquiryUrl,
  buildWhatsAppEnquiryUrl,
  experienceDetailHref,
  resolveItemIdentifier,
  saveTripEnquiryDraft,
  slugifyKey,
  splitDelimitedItems,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';

function ExperienceDetailContent() {
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
    siteData.template?.structure?.pages ??
    ['home', 'destinations', 'tours', 'experiences', 'about_us', 'services', 'contact'];
  const hasExperiences = selectedPages.includes('experiences');
  const expBackHref = hasExperiences ? '/experiences/' : '/#experiences';

  const experiences = useMemo(
    () =>
      contentList(home.experiences).map((raw, idx) => {
        const item = contentObject(raw);
        return {
          index: idx,
          id: contentText(item.id),
          slug: resolveItemIdentifier(contentText(item.id), contentText(item.title), idx),
          title: contentText(item.title),
          category: contentText(item.category),
          location: contentText(item.location) || 'Sri Lanka',
          description: contentText(item.description),
          overview: contentText(item.overview),
          highlights: splitDelimitedItems(contentText(item.highlights)),
          duration: contentText(item.duration) || 'Half Day',
          bestSeason: contentText(item.bestSeason) || 'Year-round',
          suitableFor: contentText(item.suitableFor) || 'Families, Couples, Groups',
          practicalInfo: contentText(item.practicalInfo),
          imageUrl: contentText(item.imageUrl) || '/images/hero-ella.webp',
          imageAlt: contentText(item.imageAlt),
          photoGallery: contentList(item.photoGallery).map((g) => contentObject(g)),
        };
      }),
    [home.experiences],
  );

  const experience = useMemo(() => {
    if (!requestedId) return experiences[0] ?? null;
    const norm = slugifyKey(requestedId);
    const found = experiences.find(
      (e) =>
        e.slug === norm ||
        slugifyKey(e.id) === norm ||
        slugifyKey(e.title) === norm ||
        String(e.index) === requestedId,
    );
    return found ?? null;
  }, [experiences, requestedId]);

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!experience) {
    return (
      <div className="lux-container flex min-h-[55vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 data-preview-static="exp-not-found-title" className="font-display m-0 text-3xl font-bold text-[var(--lux-text)]">
          Experience Not Found
        </h1>
        <p data-preview-static="exp-not-found-body" className="m-0 max-w-md text-sm text-[var(--lux-text-muted)]">
          This experience could not be located or may have been updated. Browse all Sri Lankan experiences to discover available activities.
        </p>
        <a
          href={withBasePath(expBackHref)}
          data-preview-static="exp-not-found-back"
          className="lux-btn-tropical mt-2"
        >
          Browse All Experiences
        </a>
      </div>
    );
  }

  const gallerySlides =
    experience.photoGallery.length > 0
      ? experience.photoGallery.map((g) => ({
          imageUrl: contentText(g.imageUrl) || experience.imageUrl,
          caption: contentText(g.caption) || experience.title,
        }))
      : [{ imageUrl: experience.imageUrl, caption: experience.title }];

  const safePhotoIdx = Math.min(activePhotoIdx, gallerySlides.length - 1);

  const relatedExperiences = experiences
    .filter((candidate) => candidate.slug !== experience.slug)
    .slice(0, 3);

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
    `I would like to enquire about the "${experience.title}" experience (${experience.location}).`,
    `Typical duration: ${experience.duration}`,
  ].join('\n');

  const whatsappHref = buildWhatsAppEnquiryUrl(agencyWhatsApp, inquiryMsg);
  const mailtoHref = buildMailtoEnquiryUrl(
    agencyEmail,
    `Experience Inquiry: ${experience.title}`,
    inquiryMsg,
  );

  const handlePlanExperience = () => {
    saveTripEnquiryDraft({
      experienceName: experience.title,
      destination: experience.location,
      travelStyle: experience.category,
    });
    window.location.href = withBasePath('/#tailor-made');
  };

  return (
    <article className="pb-16">
      {/* Experience Hero */}
      <section className="relative isolate flex min-h-[50vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]">
        <img
          src={withBasePath(experience.imageUrl)}
          alt={experience.imageAlt || experience.title}
          data-preview-static="exp-detail-hero-image"
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
              data-preview-static="exp-detail-bc-home"
              className="text-[#FAF8F3]/80 no-underline hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <a
              href={withBasePath(expBackHref)}
              data-preview-static="exp-detail-bc-list"
              className="text-[#FAF8F3]/80 no-underline hover:text-[#C5A46D]"
            >
              Experiences
            </a>
            <span aria-hidden="true">/</span>
            <span data-preview-static="exp-detail-bc-current" className="font-semibold text-[#C5A46D]">
              {experience.title}
            </span>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
            {experience.category && (
              <span data-preview-static="exp-detail-category" className="text-[#C5A46D]">
                {experience.category}
              </span>
            )}
            <span aria-hidden="true" className="text-white/40">·</span>
            <span data-preview-static="exp-detail-location" className="text-[#FF783D]">
              {experience.location}
            </span>
          </div>

          <h1
            data-preview-static="exp-detail-title"
            className="font-display m-0 mb-3 max-w-3xl text-3xl font-bold leading-[1.08] sm:text-5xl"
          >
            {experience.title}
          </h1>
          <p
            data-preview-static="exp-detail-summary"
            className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/85 sm:text-base"
          >
            {experience.description}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="lux-container pt-10">
        {/* Key Facts Strip */}
        <div className="mb-10 grid grid-cols-1 gap-4 rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-5 sm:grid-cols-3">
          <div>
            <span data-preview-static="exp-fact-duration-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Typical Duration
            </span>
            <span data-preview-static="exp-fact-duration-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {experience.duration}
            </span>
          </div>
          <div>
            <span data-preview-static="exp-fact-season-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Best Season
            </span>
            <span data-preview-static="exp-fact-season-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {experience.bestSeason}
            </span>
          </div>
          <div>
            <span data-preview-static="exp-fact-suitable-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
              Suitable For
            </span>
            <span data-preview-static="exp-fact-suitable-value" className="mt-1 block text-sm font-semibold text-[var(--lux-text)]">
              {experience.suitableFor}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left 8 Columns */}
          <div className="space-y-10 lg:col-span-8">
            <section>
              <h2 data-preview-static="exp-overview-heading" className="font-display m-0 mb-3 text-2xl font-bold text-[var(--lux-text)]">
                Overview
              </h2>
              <p data-preview-static="exp-overview-body" className="m-0 max-w-[65ch] text-[15px] leading-[1.8] text-[var(--lux-text-muted)]">
                {experience.overview || experience.description}
              </p>
            </section>

            {experience.highlights.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="exp-highlights-heading" className="font-display m-0 mb-4 text-xl font-bold text-[var(--lux-text)]">
                  Experience Highlights
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {experience.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded border border-[var(--lux-border)] bg-[var(--lux-surface)] p-3.5 text-sm text-[var(--lux-text)]"
                    >
                      <span aria-hidden="true" className="mt-0.5 text-[#C5A46D]">✦</span>
                      <span data-preview-static="exp-highlight-item">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {experience.practicalInfo && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <div className="rounded-[6px] border-l-2 border-[#C5A46D] bg-[var(--lux-surface-alt)] p-5">
                  <h2 data-preview-static="exp-practical-heading" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                    Practical Information
                  </h2>
                  <p data-preview-static="exp-practical-body" className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]">
                    {experience.practicalInfo}
                  </p>
                </div>
              </section>
            )}

            {/* Photo Gallery */}
            {gallerySlides.length > 0 && (
              <section className="border-t border-[var(--lux-border)] pt-8">
                <h2 data-preview-static="exp-gallery-heading" className="font-display m-0 mb-4 text-xl font-bold text-[var(--lux-text)]">
                  Photo Gallery
                </h2>
                <div className="overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)]">
                  <img
                    src={withBasePath(gallerySlides[safePhotoIdx].imageUrl)}
                    alt={gallerySlides[safePhotoIdx].caption}
                    data-preview-static="exp-gallery-active-img"
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <p data-preview-static="exp-gallery-active-caption" className="m-0 px-4 py-2.5 text-xs text-[var(--lux-text-muted)]">
                    {gallerySlides[safePhotoIdx].caption}
                  </p>
                </div>
                {gallerySlides.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {gallerySlides.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        data-preview-static="exp-gallery-thumb"
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
          </div>

          {/* Right 4 Columns: Sticky Inquiry Card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-sm)]">
              <span data-preview-static="exp-aside-eyebrow" className="font-display mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                Custom Arrangement
              </span>
              <h2 data-preview-static="exp-aside-title" className="font-display m-0 mb-2 text-xl font-bold text-[var(--lux-text)]">
                Add to Your Sri Lanka Journey
              </h2>
              <p data-preview-static="exp-aside-note" className="m-0 mb-5 text-xs leading-relaxed text-[var(--lux-text-muted)]">
                Available as a standalone day excursion or seamlessly integrated into any domestic weekend getaway or inbound tour itinerary.
              </p>

              <div className="flex flex-col gap-2.5">
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="exp-aside-whatsapp-btn"
                    className="lux-btn-sunset w-full"
                  >
                    Enquire on WhatsApp ↗
                  </a>
                )}
                <button
                  type="button"
                  data-preview-static="exp-aside-plan-btn"
                  onClick={handlePlanExperience}
                  className="lux-btn-tropical w-full"
                >
                  Plan This Experience
                </button>
                {mailtoHref && (
                  <a
                    href={mailtoHref}
                    data-preview-static="exp-aside-email-btn"
                    className="lux-btn-outline w-full"
                  >
                    Email Inquiry
                  </a>
                )}
              </div>

              <div className="mt-5 border-t border-[var(--lux-border)] pt-4">
                <a
                  href={withBasePath(expBackHref)}
                  data-preview-static="exp-aside-back-link"
                  className="lux-link-underline"
                >
                  ← All Experiences
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Experiences */}
        {relatedExperiences.length > 0 && (
          <section className="mt-14 border-t border-[var(--lux-border)] pt-10">
            <h2 data-preview-static="exp-related-heading" className="font-display m-0 mb-6 text-2xl font-bold text-[var(--lux-text)]">
              More Sri Lankan Experiences
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedExperiences.map((rel) => {
                const relHref = hasExperiences
                  ? experienceDetailHref(rel.id, rel.title, rel.index)
                  : withBasePath('/#experiences');
                return (
                  <a
                    key={rel.slug}
                    href={relHref}
                    data-preview-static="exp-related-card-link"
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
                    <div className="p-4">
                      <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                        {rel.category} · {rel.location}
                      </span>
                      <h3 className="font-display mt-1 mb-1 text-base font-bold text-[var(--lux-text)] group-hover:text-[var(--brand-accent,#FF783D)]">
                        {rel.title}
                      </h3>
                      <p className="m-0 line-clamp-2 text-xs text-[var(--lux-text-muted)]">
                        {rel.description}
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

export default function ExperienceDetailPage() {
  return (
    <Suspense
      fallback={
        <div role="status" className="lux-container flex min-h-[50vh] items-center justify-center py-16 text-sm text-[var(--lux-text-muted)]">
          <span data-preview-static="exp-detail-loading">Loading experience details…</span>
        </div>
      }
    >
      <ExperienceDetailContent />
    </Suspense>
  );
}

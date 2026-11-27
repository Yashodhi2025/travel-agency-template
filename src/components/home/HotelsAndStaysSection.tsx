'use client';

import { useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { resolveItemIdentifier, sanitizeHref, type TripEnquiryDraft } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '../Reveal';

interface HotelsAndStaysSectionProps {
  onEnquireStay: (draft: TripEnquiryDraft) => void;
}

export function HotelsAndStaysSection({ onEnquireStay }: HotelsAndStaysSectionProps) {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const home = contentObject(contentObject(siteData?.content).home);
  const [showAll, setShowAll] = useState(false);

  const selectedPages = Array.isArray(siteData?.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData?.template?.structure?.pages || [
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

  const stays = contentList(home.stays).map((raw, idx) => {
    const item = contentObject(raw);
    const rawPrice =
      typeof item.indicativePrice === 'number'
        ? item.indicativePrice
        : parseFloat(String(item.indicativePrice ?? 0));
    return {
      rawId: contentText(item.id),
      title: contentText(item.title),
      subtitle: contentText(item.subtitle),
      category: contentText(item.category),
      description: contentText(item.description),
      overview: contentText(item.overview),
      roomTypes: contentText(item.roomTypes),
      amenities: contentText(item.amenities),
      suitableFor: contentText(item.suitableFor),
      nearbyAttractions: contentText(item.nearbyAttractions),
      importantInfo: contentText(item.importantInfo),
      photoGallery: contentList(item.photoGallery),
      showPrice: item.showPrice !== undefined ? Boolean(item.showPrice) : true,
      indicativePrice: Number.isFinite(rawPrice) ? rawPrice : 0,
      imageUrl: contentText(item.imageUrl) || '/images/exp-villa.webp',
      imageAlt: contentText(item.imageAlt),
      priceLabel: contentText(item.priceLabel),
      ctaLabel: contentText(item.ctaLabel) || 'View Stay',
      ctaUrl: contentText(item.ctaUrl) || '/#tailor-made',
      index: idx,
    };
  });

  const resolveStayHref = (stay: (typeof stays)[number], idx: number) => {
    const clean = sanitizeHref(stay.ctaUrl) || '/#tailor-made';
    if (!hasStays) {
      return clean.includes('/stays') ? '/#tailor-made' : clean;
    }
    if (clean === '/#tailor-made') {
      const key = resolveItemIdentifier(stay.rawId, stay.title, idx);
      return `/stays/detail/?id=${encodeURIComponent(key)}`;
    }
    return clean;
  };

  const rawLimit = Number(home.featuredStaysCount);
  const featuredLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.round(rawLimit) : 3;
  const visibleStays = isEditorPreview || showAll ? stays : stays.slice(0, featuredLimit);
  const hasMore = !isEditorPreview && stays.length > featuredLimit;

  return (
    <section
      id="stays"
      data-design-section="home-stays"
      className="lux-section border-b border-[var(--lux-border)] bg-[var(--lux-bg)]"
    >
      <div className="lux-container">
        <Reveal variant="fade-up">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <div className="mb-2.5">
                <EditableText
                  as="span"
                  className="lux-eyebrow-tropical"
                  data-preview-field-path="home.staysEyebrow"
                  defaultValue={contentText(home.staysEyebrow) || 'HOTELS & STAYS'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                className="font-display m-0 text-2xl font-bold tracking-[-0.025em] text-[var(--lux-text)] sm:text-3xl lg:text-[2.25rem]"
                data-preview-field-path="home.staysHeading"
                defaultValue={contentText(home.staysHeading) || 'Featured Places to Stay'}
              />
              <EditableText
                as="p"
                className="mt-2 m-0 text-sm leading-relaxed text-[var(--lux-text-muted)] sm:text-[15px]"
                data-preview-field-path="home.staysSummary"
                defaultValue={contentText(home.staysSummary)}
              />
            </div>

            {!isEditorPreview && hasStays && (
              <a
                href={withBasePath('/stays/')}
                className="lux-btn-outline self-start lg:self-end"
              >
                <span data-preview-field-path="home.staysViewAllLabel">
                  {contentText(home.staysViewAllLabel) || 'View All Stays'}
                </span>
                <span aria-hidden="true">→</span>
              </a>
            )}

            {!isEditorPreview && !hasStays && hasMore && (
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="lux-btn-outline self-start lg:self-end"
              >
                <span data-preview-field-path="home.staysViewAllLabel">
                  {showAll
                    ? 'Show Featured Only'
                    : contentText(home.staysViewAllLabel) || 'View All Stays'}
                </span>
                <span aria-hidden="true">{showAll ? '↑' : '→'}</span>
              </button>
            )}

            {isEditorPreview && (
              <span
                data-preview-field-path="home.staysViewAllLabel"
                className="lux-btn-outline self-start lg:self-end"
              >
                {contentText(home.staysViewAllLabel) || 'View All Stays'}
              </span>
            )}
          </div>
        </Reveal>

        {/* Three Featured Stays — Editorial Hospitality Composition */}
        <div
          data-preview-list-path="home.stays"
          className="grid grid-cols-1 gap-7 md:grid-cols-3"
        >
          {stays.length === 0 && (
            <p
              data-preview-static="stays-empty-state"
              className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-8 text-center text-sm text-[var(--lux-text-muted)]"
            >
              No hotels or accommodation styles configured yet. Add stays in Fivora.
            </p>
          )}

          {visibleStays.map((stay, index) => {
            const href = resolveStayHref(stay, index);
            return (
              <article
                key={stay.rawId || index}
                data-preview-item-path={`home.stays[${index}]`}
                className="group flex flex-col"
              >
                <div className="lux-image-zoom relative aspect-[16/10] w-full overflow-hidden rounded-[6px] bg-[#101820]">
                  {!isEditorPreview && hasStays ? (
                    <a href={withBasePath(href)} className="block h-full w-full">
                      <EditableImage
                        src={stay.imageUrl}
                        alt={stay.imageAlt || stay.title}
                        data-preview-field-path={`home.stays[${index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ) : (
                    <EditableImage
                      src={stay.imageUrl}
                      alt={stay.imageAlt || stay.title}
                      data-preview-field-path={`home.stays[${index}].imageUrl`}
                      fit="cover"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col pt-4">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em]">
                    <span
                      data-preview-field-path={`home.stays[${index}].category`}
                      className="text-[var(--lux-gold-deep)] dark:text-[#C5A46D]"
                    >
                      {stay.category}
                    </span>
                    <span
                      data-preview-field-path={`home.stays[${index}].subtitle`}
                      className="text-[var(--lux-teal)]"
                    >
                      {stay.subtitle}
                    </span>
                  </div>

                  <EditableText
                    as="h3"
                    className="font-display m-0 mb-1.5 text-lg font-bold leading-snug text-[var(--lux-text)]"
                    data-preview-field-path={`home.stays[${index}].title`}
                    defaultValue={stay.title}
                  />

                  <EditableText
                    as="p"
                    className="m-0 mb-3.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--lux-text-muted)]"
                    data-preview-field-path={`home.stays[${index}].description`}
                    defaultValue={stay.description}
                  />

                  {isEditorPreview && (
                    <div className="mb-2.5 space-y-1.5 rounded border border-dashed border-[var(--lux-border-strong)] p-2.5 text-[11px] text-[var(--lux-text-muted)]">
                      <p data-preview-field-path={`home.stays[${index}].overview`} className="m-0">
                        {stay.overview}
                      </p>
                      <div>
                        <span data-preview-static="stay-rooms-label">Rooms: </span>
                        <span data-preview-field-path={`home.stays[${index}].roomTypes`}>{stay.roomTypes}</span>
                      </div>
                      <div>
                        <span data-preview-static="stay-amenities-label">Amenities: </span>
                        <span data-preview-field-path={`home.stays[${index}].amenities`}>{stay.amenities}</span>
                      </div>
                      <div>
                        <span data-preview-static="stay-suitable-label">Suitable for: </span>
                        <span data-preview-field-path={`home.stays[${index}].suitableFor`}>{stay.suitableFor}</span>
                      </div>
                      <div>
                        <span data-preview-static="stay-nearby-label">Nearby: </span>
                        <span data-preview-field-path={`home.stays[${index}].nearbyAttractions`}>
                          {stay.nearbyAttractions}
                        </span>
                      </div>
                      <div>
                        <span data-preview-static="stay-important-label">Important info: </span>
                        <span data-preview-field-path={`home.stays[${index}].importantInfo`}>
                          {stay.importantInfo}
                        </span>
                      </div>
                      <div>
                        <span data-preview-static="stay-show-price-label">Show rate: </span>
                        <span data-preview-field-path={`home.stays[${index}].showPrice`}>
                          {stay.showPrice ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span data-preview-static="stay-numeric-price-label">Indicative LKR: </span>
                        <span data-preview-field-path={`home.stays[${index}].indicativePrice`}>
                          {stay.indicativePrice}
                        </span>
                      </div>
                      <div>
                        <span data-preview-static="stay-rate-label">Rate label: </span>
                        <span data-preview-field-path={`home.stays[${index}].priceLabel`}>
                          {stay.priceLabel}
                        </span>
                      </div>
                      <div
                        data-preview-list-path={`home.stays[${index}].photoGallery`}
                        className="space-y-1 border-t border-[var(--lux-border)] pt-1.5"
                      >
                        <strong data-preview-static="stay-gallery-heading">Stay gallery</strong>
                        {stay.photoGallery.length === 0 && (
                          <p data-preview-static="stay-gallery-empty" className="m-0 opacity-75">
                            No gallery photos added yet.
                          </p>
                        )}
                        {stay.photoGallery.map((rawPhoto, photoIdx) => {
                          const pObj = contentObject(rawPhoto);
                          return (
                            <div
                              key={photoIdx}
                              data-preview-item-path={`home.stays[${index}].photoGallery[${photoIdx}]`}
                              className="flex items-center gap-2 rounded border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-1"
                            >
                              <EditableImage
                                src={contentText(pObj.imageUrl) || stay.imageUrl}
                                alt={contentText(pObj.caption) || `${stay.title} ${photoIdx + 1}`}
                                data-preview-field-path={`home.stays[${index}].photoGallery[${photoIdx}].imageUrl`}
                                fit="cover"
                                className="h-6 w-9 shrink-0 rounded object-cover"
                              />
                              <span data-preview-field-path={`home.stays[${index}].photoGallery[${photoIdx}].caption`}>
                                {contentText(pObj.caption)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div>
                        <span data-preview-static="stay-alt-label">Alt: </span>
                        <span data-preview-field-path={`home.stays[${index}].imageAlt`}>
                          {stay.imageAlt || stay.title}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--lux-border)] pt-3">
                    {!isEditorPreview && stay.priceLabel && (
                      <span
                        data-preview-field-path={`home.stays[${index}].priceLabel`}
                        className="text-xs font-medium text-[var(--lux-text-muted)]"
                      >
                        {stay.priceLabel}
                      </span>
                    )}

                    <a
                      href={withBasePath(href)}
                      data-preview-field-path={`home.stays[${index}].ctaUrl`}
                      onClick={(e) => {
                        if (!isEditorPreview && href === '/#tailor-made') {
                          e.preventDefault();
                          onEnquireStay({
                            accommodation: stay.category || stay.title,
                            destination: stay.subtitle || undefined,
                          });
                          document.getElementById('tailor-made')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="lux-link-underline"
                    >
                      <span data-preview-field-path={`home.stays[${index}].ctaLabel`}>
                        {stay.ctaLabel}
                      </span>
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <EditableText
          as="p"
          className="mt-6 m-0 text-[11.5px] text-[var(--lux-text-muted)]"
          data-preview-field-path="home.staysDisclaimer"
          defaultValue={
            contentText(home.staysDisclaimer) ||
            'Illustrative accommodation showcase. Listings do not imply direct partnerships or live availability.'
          }
        />
      </div>
    </section>
  );
}

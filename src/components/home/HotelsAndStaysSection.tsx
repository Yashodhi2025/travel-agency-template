'use client';

import { useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { sanitizeHref, type TripEnquiryDraft } from '@/lib/travelHelpers';
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

  const stays = contentList(home.stays).map((raw) => {
    const item = contentObject(raw);
    return {
      title: contentText(item.title),
      subtitle: contentText(item.subtitle),
      category: contentText(item.category),
      description: contentText(item.description),
      imageUrl: contentText(item.imageUrl) || '/images/exp-villa.webp',
      imageAlt: contentText(item.imageAlt),
      priceLabel: contentText(item.priceLabel),
      ctaLabel: contentText(item.ctaLabel) || 'Enquire',
      ctaUrl: contentText(item.ctaUrl) || '/#tailor-made',
    };
  });

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

            {hasMore && (
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
            const href = sanitizeHref(stay.ctaUrl) || '/#tailor-made';
            return (
              <article
                key={index}
                data-preview-item-path={`home.stays[${index}]`}
                className="group flex flex-col"
              >
                <div className="lux-image-zoom relative aspect-[16/10] w-full overflow-hidden rounded-[6px] bg-[#101820]">
                  <EditableImage
                    src={stay.imageUrl}
                    alt={stay.imageAlt || stay.title}
                    data-preview-field-path={`home.stays[${index}].imageUrl`}
                    fit="cover"
                    className="h-full w-full object-cover"
                  />
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
                    <div className="mb-2.5 space-y-1 rounded border border-dashed border-[var(--lux-border-strong)] p-2 text-[11px] text-[var(--lux-text-muted)]">
                      <div>
                        <span data-preview-static="stay-alt-label">Alt: </span>
                        <span data-preview-field-path={`home.stays[${index}].imageAlt`}>
                          {stay.imageAlt || stay.title}
                        </span>
                      </div>
                      <div>
                        <span data-preview-static="stay-rate-label">Rate: </span>
                        <span data-preview-field-path={`home.stays[${index}].priceLabel`}>
                          {stay.priceLabel}
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

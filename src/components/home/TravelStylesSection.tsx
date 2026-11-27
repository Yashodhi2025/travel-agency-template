'use client';

import { useRef } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { sanitizeHref } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '../Reveal';

interface TravelStylesSectionProps {
  onSelectTravelStyle: (styleTitle: string) => void;
}

export function TravelStylesSection({ onSelectTravelStyle }: TravelStylesSectionProps) {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const home = contentObject(contentObject(siteData?.content).home);
  const railRef = useRef<HTMLDivElement | null>(null);

  const styles = contentList(home.travelStyles).map((raw, idx) => {
    const item = contentObject(raw);
    return {
      id: contentText(item.id) || `style-${idx}`,
      title: contentText(item.title),
      description: contentText(item.description),
      imageUrl: contentText(item.imageUrl) || '/images/style-family-holiday.webp',
      imageAlt: contentText(item.imageAlt),
      ctaLabel: contentText(item.ctaLabel) || 'Explore',
      ctaUrl: contentText(item.ctaUrl) || '/#packages',
    };
  });

  const scrollRail = (direction: 'prev' | 'next') => {
    const el = railRef.current;
    if (!el) return;
    const distance = Math.max(280, el.clientWidth * 0.68);
    el.scrollBy({ left: direction === 'next' ? distance : -distance, behavior: 'smooth' });
  };

  return (
    <section
      id="travel-styles"
      data-design-section="home-travel-styles"
      className="lux-section lux-section-alt border-b border-[var(--lux-border)]"
    >
      <div className="lux-container">
        <Reveal variant="fade-up">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <div className="mb-2.5">
                <EditableText
                  as="span"
                  className="lux-eyebrow"
                  data-preview-field-path="home.travelStylesEyebrow"
                  defaultValue={contentText(home.travelStylesEyebrow) || 'TRAVEL STYLES'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                className="font-display m-0 text-2xl font-bold tracking-[-0.025em] text-[var(--lux-text)] sm:text-3xl lg:text-[2.25rem]"
                data-preview-field-path="home.travelStylesHeading"
                defaultValue={contentText(home.travelStylesHeading) || 'Find Your Way to Travel'}
              />
              <EditableText
                as="p"
                className="mt-2 m-0 text-sm leading-relaxed text-[var(--lux-text-muted)] sm:text-[15px]"
                data-preview-field-path="home.travelStylesSummary"
                defaultValue={contentText(home.travelStylesSummary)}
              />
            </div>

            {!isEditorPreview && styles.length > 2 && (
              <div className="flex items-center gap-2 self-start lg:self-end">
                <button
                  type="button"
                  data-preview-static="travel-styles-prev"
                  aria-label="Scroll travel styles left"
                  onClick={() => scrollRail('prev')}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] text-base text-[var(--lux-text)] transition hover:border-[var(--brand-accent,#FF783D)] hover:text-[var(--brand-accent,#FF783D)]"
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  type="button"
                  data-preview-static="travel-styles-next"
                  aria-label="Scroll travel styles right"
                  onClick={() => scrollRail('next')}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] text-base text-[var(--lux-text)] transition hover:border-[var(--brand-accent,#FF783D)] hover:text-[var(--brand-accent,#FF783D)]"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>
        </Reveal>

        {/* Compact Horizontal Carousel — authentic category-matched photography */}
        <div
          ref={railRef}
          data-preview-list-path="home.travelStyles"
          className={
            isEditorPreview
              ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
              : 'lux-rail -mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-2'
          }
        >
          {styles.length === 0 && (
            <p
              data-preview-static="travel-styles-empty"
              className="w-full border border-dashed border-[var(--lux-border-strong)] p-8 text-center text-sm text-[var(--lux-text-muted)]"
            >
              No travel styles configured yet. Add holiday categories in Fivora.
            </p>
          )}

          {styles.map((styleItem, index) => {
            const href = sanitizeHref(styleItem.ctaUrl) || '/#packages';
            return (
              <article
                key={styleItem.id}
                data-preview-item-path={`home.travelStyles[${index}]`}
                className={`group flex flex-col ${
                  isEditorPreview
                    ? 'rounded-md border border-[var(--lux-border)] bg-[var(--lux-surface)] p-3'
                    : 'w-[250px] shrink-0 snap-start sm:w-[272px] lg:w-[285px]'
                }`}
              >
                <div className="lux-image-zoom relative aspect-[4/3] w-full overflow-hidden rounded-[6px] bg-[#101820]">
                  <EditableImage
                    src={styleItem.imageUrl}
                    alt={styleItem.imageAlt || styleItem.title}
                    data-preview-field-path={`home.travelStyles[${index}].imageUrl`}
                    fit="cover"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col pt-3.5">
                  <EditableText
                    as="h3"
                    className="font-display m-0 mb-1.5 text-base font-bold leading-snug text-[var(--lux-text)] transition-colors group-hover:text-[var(--brand-accent,#FF783D)]"
                    data-preview-field-path={`home.travelStyles[${index}].title`}
                    defaultValue={styleItem.title}
                  />

                  <EditableText
                    as="p"
                    className="m-0 mb-3 line-clamp-2 text-[13px] leading-relaxed text-[var(--lux-text-muted)]"
                    data-preview-field-path={`home.travelStyles[${index}].description`}
                    defaultValue={styleItem.description}
                  />

                  {isEditorPreview && (
                    <div className="mb-2.5 rounded border border-dashed border-[var(--lux-border-strong)] p-2 text-[11px] text-[var(--lux-text-muted)]">
                      <span data-preview-static="style-alt-label" className="font-semibold">
                        Alt:{' '}
                      </span>
                      <span data-preview-field-path={`home.travelStyles[${index}].imageAlt`}>
                        {styleItem.imageAlt || styleItem.title}
                      </span>
                    </div>
                  )}

                  <div className="mt-auto">
                    <a
                      href={withBasePath(href)}
                      data-preview-field-path={`home.travelStyles[${index}].ctaUrl`}
                      onClick={(e) => {
                        if (!isEditorPreview && href === '/#packages') {
                          e.preventDefault();
                          onSelectTravelStyle(styleItem.title);
                          document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="lux-link-underline group/link"
                    >
                      <span data-preview-field-path={`home.travelStyles[${index}].ctaLabel`}>
                        {styleItem.ctaLabel}
                      </span>
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform duration-300 group-hover/link:translate-x-1"
                      >
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

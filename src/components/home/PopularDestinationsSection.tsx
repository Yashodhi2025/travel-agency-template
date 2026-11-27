'use client';

import { useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { sanitizeHref, type TripEnquiryDraft } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '../Reveal';

interface PopularDestinationsSectionProps {
  onSelectDestinationForFilter: (destinationName: string) => void;
  onPlanDestination: (draft: TripEnquiryDraft) => void;
}

/**
 * Compact 5-item asymmetric editorial mosaic (2 large hero tiles + 3 crisp smaller tiles).
 * Full destination dataset stays preserved in site-data.json and expandable via "View All Destinations"
 * (ready for dedicated /destinations page in Stage 3).
 */
function getMosaicLayout(index: number, isEditorPreview: boolean): {
  colSpan: string;
  aspect: string;
} {
  if (isEditorPreview) {
    return { colSpan: 'sm:col-span-6 lg:col-span-4', aspect: 'aspect-[4/3]' };
  }
  const pos = index % 5;
  if (pos === 0) return { colSpan: 'md:col-span-7', aspect: 'aspect-[16/10]' };
  if (pos === 1) return { colSpan: 'md:col-span-5', aspect: 'aspect-[4/3] md:aspect-[16/14]' };
  return { colSpan: 'md:col-span-4', aspect: 'aspect-[4/3]' };
}

export function PopularDestinationsSection({
  onSelectDestinationForFilter,
  onPlanDestination,
}: PopularDestinationsSectionProps) {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const home = contentObject(contentObject(siteData?.content).home);
  const [showAll, setShowAll] = useState(false);

  const destinations = contentList(home.destinations).map((raw, idx) => {
    const item = contentObject(raw);
    return {
      id: contentText(item.id) || `dest-${idx}`,
      name: contentText(item.name),
      region: contentText(item.region),
      category: contentText(item.category),
      bestSeason: contentText(item.bestSeason),
      shortDescription: contentText(item.shortDescription),
      detailedDescription: contentText(item.detailedDescription),
      highlights: contentText(item.highlights),
      imageUrl: contentText(item.imageUrl) || '/images/hero-sigiriya.webp',
      imageAlt: contentText(item.imageAlt),
      ctaLabel: contentText(item.ctaLabel) || 'Explore',
      ctaUrl: contentText(item.ctaUrl) || '/#packages',
    };
  });

  const rawLimit = Number(home.featuredDestinationsCount);
  const featuredLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.round(rawLimit) : 5;
  const visibleDestinations =
    isEditorPreview || showAll ? destinations : destinations.slice(0, featuredLimit);
  const hasMore = !isEditorPreview && destinations.length > featuredLimit;

  return (
    <section
      id="destinations"
      data-design-section="home-destinations"
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
                  data-preview-field-path="home.destinationsEyebrow"
                  defaultValue={contentText(home.destinationsEyebrow) || 'FEATURED DESTINATIONS'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                className="font-display m-0 text-2xl font-bold tracking-[-0.025em] text-[var(--lux-text)] sm:text-3xl lg:text-[2.25rem]"
                data-preview-field-path="home.destinationsHeading"
                defaultValue={contentText(home.destinationsHeading) || 'Iconic Corners of Sri Lanka'}
              />
              <EditableText
                as="p"
                className="mt-2 m-0 text-sm leading-relaxed text-[var(--lux-text-muted)] sm:text-[15px]"
                data-preview-field-path="home.destinationsSummary"
                defaultValue={contentText(home.destinationsSummary)}
              />
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="lux-btn-outline self-start lg:self-end"
              >
                <span data-preview-field-path="home.destinationsViewAllLabel">
                  {showAll
                    ? 'Show Featured Only'
                    : contentText(home.destinationsViewAllLabel) || 'View All Destinations'}
                </span>
                <span aria-hidden="true">{showAll ? '↑' : '→'}</span>
              </button>
            )}

            {isEditorPreview && (
              <span
                data-preview-field-path="home.destinationsViewAllLabel"
                className="lux-btn-outline self-start lg:self-end"
              >
                {contentText(home.destinationsViewAllLabel) || 'View All Destinations'}
              </span>
            )}
          </div>
        </Reveal>

        {/* Compact Editorial Image Mosaic */}
        <div
          data-preview-list-path="home.destinations"
          className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5"
        >
          {destinations.length === 0 && (
            <p
              data-preview-static="destinations-empty-state"
              className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-8 text-center text-sm text-[var(--lux-text-muted)]"
            >
              No destinations added yet. Add destinations in Fivora.
            </p>
          )}

          {visibleDestinations.map((dest, index) => {
            const href = sanitizeHref(dest.ctaUrl) || '/#packages';
            const { colSpan, aspect } = getMosaicLayout(index, isEditorPreview);
            const isFeatureTile = !isEditorPreview && index % 5 < 2;

            return (
              <article
                key={dest.id}
                data-preview-item-path={`home.destinations[${index}]`}
                className={`group relative flex flex-col overflow-hidden rounded-[6px] bg-[#101820] ${colSpan} ${
                  isEditorPreview ? 'border border-[var(--lux-border)] bg-[var(--lux-surface)]' : ''
                }`}
              >
                <div className={`lux-image-zoom relative w-full overflow-hidden ${aspect}`}>
                  <EditableImage
                    src={dest.imageUrl}
                    alt={dest.imageAlt || dest.name}
                    data-preview-field-path={`home.destinations[${index}].imageUrl`}
                    fit="cover"
                    className="h-full w-full object-cover"
                  />

                  {!isEditorPreview && (
                    <>
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#101820]/88 via-[#101820]/35 to-transparent"
                      />

                      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-5 text-[#FAF8F3]">
                        <span
                          data-preview-field-path={`home.destinations[${index}].region`}
                          className="font-display mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#C5A46D]"
                        >
                          {dest.region}
                        </span>

                        <div className="flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <EditableText
                              as="h3"
                              color="#FAF8F3"
                              className={`font-display m-0 font-bold text-[#FAF8F3] ${
                                isFeatureTile ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                              }`}
                              data-preview-field-path={`home.destinations[${index}].name`}
                              defaultValue={dest.name}
                            />
                            {isFeatureTile && (
                              <EditableText
                                as="p"
                                color="rgba(250, 248, 243, 0.84)"
                                className="mt-1 m-0 line-clamp-2 max-w-md text-xs leading-relaxed text-[#FAF8F3]/84 sm:text-[13px]"
                                data-preview-field-path={`home.destinations[${index}].shortDescription`}
                                defaultValue={dest.shortDescription}
                              />
                            )}
                          </div>

                          <button
                            type="button"
                            data-preview-static="destination-explore-arrow-btn"
                            aria-label={`${dest.ctaLabel} — ${dest.name}`}
                            onClick={() => {
                              if (href === '/#packages') {
                                onSelectDestinationForFilter(dest.name);
                                document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
                              } else {
                                window.location.href = withBasePath(href);
                              }
                            }}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-[#101820]/45 text-sm text-[#FAF8F3] backdrop-blur-sm transition duration-200 group-hover:border-[#FF783D] group-hover:bg-[#FF783D]"
                          >
                            <span aria-hidden="true">→</span>
                          </button>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px]">
                          <a
                            href={withBasePath(href)}
                            data-preview-field-path={`home.destinations[${index}].ctaUrl`}
                            onClick={(e) => {
                              if (href === '/#packages') {
                                e.preventDefault();
                                onSelectDestinationForFilter(dest.name);
                                document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="font-display font-semibold tracking-[0.06em] text-[#FF783D] no-underline hover:underline"
                          >
                            <span data-preview-field-path={`home.destinations[${index}].ctaLabel`}>
                              {dest.ctaLabel}
                            </span>
                          </a>
                          <button
                            type="button"
                            data-preview-static="destination-quick-plan-btn"
                            onClick={() => {
                              onPlanDestination({ destination: dest.name });
                              document.getElementById('tailor-made')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="border-0 bg-transparent p-0 text-[11px] font-medium text-[#FAF8F3]/80 transition hover:text-white"
                          >
                            Plan here
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Full Editable Surface in Fivora Editor Preview */}
                {isEditorPreview && (
                  <div className="flex flex-1 flex-col gap-1.5 p-3.5 text-xs text-[var(--lux-text)]">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span
                        data-preview-field-path={`home.destinations[${index}].region`}
                        className="font-semibold uppercase tracking-[0.12em] text-[#167D91]"
                      >
                        {dest.region}
                      </span>
                      <span
                        data-preview-field-path={`home.destinations[${index}].category`}
                        className="font-semibold uppercase tracking-[0.12em] text-[#FF783D]"
                      >
                        {dest.category}
                      </span>
                    </div>
                    <EditableText
                      as="h3"
                      className="font-display m-0 text-base font-bold text-[var(--lux-text)]"
                      data-preview-field-path={`home.destinations[${index}].name`}
                      defaultValue={dest.name}
                    />
                    <span
                      data-preview-field-path={`home.destinations[${index}].bestSeason`}
                      className="text-[11px] text-[var(--lux-text-muted)]"
                    >
                      {dest.bestSeason}
                    </span>
                    <EditableText
                      as="p"
                      className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path={`home.destinations[${index}].shortDescription`}
                      defaultValue={dest.shortDescription}
                    />
                    <p
                      data-preview-field-path={`home.destinations[${index}].detailedDescription`}
                      className="m-0 text-[11px] text-[var(--lux-text-muted)]"
                    >
                      {dest.detailedDescription}
                    </p>
                    <p
                      data-preview-field-path={`home.destinations[${index}].highlights`}
                      className="m-0 text-[11px] text-[var(--lux-text-muted)]"
                    >
                      {dest.highlights}
                    </p>
                    <div className="text-[11px] text-[var(--lux-text-muted)]">
                      <span data-preview-static="dest-alt-label">Alt: </span>
                      <span data-preview-field-path={`home.destinations[${index}].imageAlt`}>
                        {dest.imageAlt || dest.name}
                      </span>
                    </div>
                    <a
                      href={withBasePath(href)}
                      data-preview-field-path={`home.destinations[${index}].ctaUrl`}
                      className="mt-auto pt-1 font-semibold text-[#FF783D] underline"
                    >
                      <span data-preview-field-path={`home.destinations[${index}].ctaLabel`}>
                        {dest.ctaLabel}
                      </span>
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

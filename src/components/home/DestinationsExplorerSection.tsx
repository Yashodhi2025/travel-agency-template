'use client';

import { useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { sanitizeHref, splitDelimitedItems, type TripEnquiryDraft } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '../Reveal';

interface DestinationItem {
  id: string;
  name: string;
  region: string;
  category: string;
  bestSeason: string;
  shortDescription: string;
  detailedDescription: string;
  highlights: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  mapX: number;
  mapY: number;
}

interface DestinationsExplorerSectionProps {
  onSelectDestinationForFilter: (destinationName: string) => void;
  onPlanDestination: (draft: TripEnquiryDraft) => void;
}

export function DestinationsExplorerSection({
  onSelectDestinationForFilter,
  onPlanDestination,
}: DestinationsExplorerSectionProps) {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const home = contentObject(contentObject(siteData?.content).home);

  const destinations: DestinationItem[] = contentList(home.destinations).map((raw, idx) => {
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
      ctaLabel: contentText(item.ctaLabel) || 'Explore Journeys',
      ctaUrl: contentText(item.ctaUrl) || '/#packages',
      mapX: typeof item.mapX === 'number' && Number.isFinite(item.mapX) ? item.mapX : 50,
      mapY: typeof item.mapY === 'number' && Number.isFinite(item.mapY) ? item.mapY : 50,
    };
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');

  const safeSelected = destinations.length > 0 ? Math.min(selectedIndex, destinations.length - 1) : 0;
  const activeDestination = destinations[safeSelected];

  const categories = ['All', ...Array.from(new Set(destinations.map((d) => d.category).filter(Boolean)))];

  const visibleDestinations =
    isEditorPreview || activeCategory === 'All'
      ? destinations
      : destinations.filter((d) => d.category === activeCategory);

  const handleExploreDestination = (dest: DestinationItem) => {
    onSelectDestinationForFilter(dest.name);
    const el = document.getElementById('packages');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlanHere = (dest: DestinationItem) => {
    onPlanDestination({ destination: dest.name });
    const el = document.getElementById('tailor-made');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="destinations"
      data-design-section="home-destinations"
      className="lux-section lux-section-alt border-y border-[var(--lux-border)]"
    >
      <div className="lux-container">
        <Reveal>
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3">
                <EditableText
                  as="span"
                  className="lux-eyebrow"
                  data-preview-field-path="home.destinationsEyebrow"
                  defaultValue={contentText(home.destinationsEyebrow) || 'ISLAND DISCOVERY'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                className="font-editorial m-0 text-3xl font-medium text-[var(--lux-text)] sm:text-4xl lg:text-5xl"
                data-preview-field-path="home.destinationsHeading"
                defaultValue={contentText(home.destinationsHeading) || 'Iconic Destinations Across Sri Lanka'}
              />
              <EditableText
                as="p"
                className="mt-4 text-base leading-relaxed text-[var(--lux-text-muted)]"
                data-preview-field-path="home.destinationsSummary"
                defaultValue={contentText(home.destinationsSummary)}
              />
            </div>

            {/* Category filter chips (live mode) */}
            {!isEditorPreview && categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    data-preview-static="destination-category-filter"
                    onClick={() => setActiveCategory(cat)}
                    className={`min-h-[38px] border px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.11em] transition ${
                      activeCategory === cat
                        ? 'border-[#102D25] bg-[#102D25] text-[#F7F3EA] dark:border-[#C6A46A] dark:bg-[#C6A46A] dark:text-[#101917]'
                        : 'border-[var(--lux-border-strong)] bg-transparent text-[var(--lux-text-muted)] hover:border-[#C6A46A] hover:text-[var(--lux-text)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Interactive Sri Lanka Island Explorer (Map + Spotlight Card) */}
        {destinations.length > 0 && activeDestination && (
          <Reveal className="mb-14">
            <div className="grid grid-cols-1 gap-8 border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-md)] lg:grid-cols-12 lg:p-8">
              {/* Original Stylised Sri Lanka Vector Silhouette Map */}
              <div className="flex flex-col justify-between lg:col-span-5">
                <div className="mb-4 flex items-center justify-between">
                  <span
                    data-preview-static="island-explorer-label"
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
                  >
                    Interactive Island Explorer
                  </span>
                  <span
                    data-preview-static="island-explorer-hint"
                    className="text-xs text-[var(--lux-text-muted)]"
                  >
                    Select a marker
                  </span>
                </div>

                <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] rounded border border-[var(--lux-border)] bg-gradient-to-b from-[#102D25]/8 to-[#216E78]/10 p-4 dark:from-[#0D241E] dark:to-[#132C28]">
                  {/* Accurate, clean original SVG teardrop outline of Sri Lanka */}
                  <svg
                    viewBox="0 0 240 340"
                    className="h-full w-full"
                    role="img"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="slTerrain" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1A4439" stopOpacity="0.92" />
                        <stop offset="100%" stopColor="#102D25" stopOpacity="0.98" />
                      </linearGradient>
                    </defs>
                    {/* Subtle ocean compass lines */}
                    <circle cx="120" cy="180" r="108" fill="none" stroke="#C6A46A" strokeOpacity="0.18" strokeDasharray="3 5" />
                    <path
                      d="M84 22 C96 18, 108 26, 112 38 C118 54, 130 68, 146 84 C162 100, 174 126, 182 152 C192 184, 198 214, 194 244 C188 272, 166 296, 136 312 C110 324, 80 318, 62 300 C46 282, 42 254, 46 226 C50 198, 56 172, 60 144 C64 114, 64 84, 72 58 C76 42, 74 28, 84 22 Z"
                      fill="url(#slTerrain)"
                      stroke="#C6A46A"
                      strokeWidth="2"
                    />
                    {/* Central highlands subtle topographic contour */}
                    <path
                      d="M96 178 C112 162, 136 168, 144 190 C150 212, 136 238, 114 238 C94 238, 86 200, 96 178 Z"
                      fill="#C6A46A"
                      fillOpacity="0.14"
                      stroke="#C6A46A"
                      strokeOpacity="0.4"
                      strokeWidth="1"
                    />
                  </svg>

                  {/* Interactive Destination Pins */}
                  {destinations.map((dest, idx) => {
                    const isSelected = idx === safeSelected;
                    return (
                      <button
                        key={dest.id}
                        type="button"
                        data-preview-static="island-map-pin"
                        aria-label={`Select destination ${dest.name}`}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedIndex(idx)}
                        style={{
                          left: `${Math.max(10, Math.min(90, dest.mapX))}%`,
                          top: `${Math.max(8, Math.min(92, dest.mapY))}%`,
                        }}
                        className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
                          isSelected
                            ? 'z-20 h-4 w-4 bg-[#C6A46A] ring-4 ring-[#C6A46A]/35'
                            : 'z-10 h-3 w-3 bg-[#F7F3EA] ring-2 ring-[#102D25] hover:scale-125 hover:bg-[#C6A46A]'
                        }`}
                      >
                        <span className="sr-only">{dest.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Accessible Destination Quick Selector Pills */}
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {destinations.map((dest, idx) => (
                    <button
                      key={`pill-${dest.id}`}
                      type="button"
                      data-preview-static="island-selector-pill"
                      onClick={() => setSelectedIndex(idx)}
                      className={`border px-2.5 py-1 text-[11px] font-medium transition ${
                        idx === safeSelected
                          ? 'border-[#C6A46A] bg-[#102D25] text-[#F7F3EA]'
                          : 'border-[var(--lux-border)] bg-transparent text-[var(--lux-text-muted)] hover:border-[#C6A46A] hover:text-[var(--lux-text)]'
                      }`}
                    >
                      {dest.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Destination Spotlight Panel */}
              <div className="flex flex-col justify-between gap-5 lg:col-span-7">
                <div className="lux-image-zoom relative aspect-[16/10] w-full overflow-hidden rounded">
                  <img
                    src={withBasePath(activeDestination.imageUrl)}
                    alt={activeDestination.name}
                    data-preview-static="spotlight-destination-image"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                    {activeDestination.region && (
                      <span
                        data-preview-static="spotlight-region-badge"
                        className="bg-[#102D25]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F7F3EA] backdrop-blur-sm"
                      >
                        {activeDestination.region}
                      </span>
                    )}
                    {activeDestination.bestSeason && (
                      <span
                        data-preview-static="spotlight-season-badge"
                        className="bg-[#C6A46A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#101917]"
                      >
                        {activeDestination.bestSeason}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3
                    data-preview-static="spotlight-destination-title"
                    className="font-editorial mb-2 text-3xl font-medium text-[var(--lux-text)]"
                  >
                    {activeDestination.name}
                  </h3>
                  <p
                    data-preview-static="spotlight-destination-description"
                    className="mb-4 text-base leading-relaxed text-[var(--lux-text-muted)]"
                  >
                    {activeDestination.detailedDescription || activeDestination.shortDescription}
                  </p>

                  {splitDelimitedItems(activeDestination.highlights).length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      {splitDelimitedItems(activeDestination.highlights).map((item, idx) => (
                        <span
                          key={idx}
                          data-preview-static="spotlight-highlight-chip"
                          className="border border-[var(--lux-border-strong)] bg-[var(--lux-surface-alt)] px-3 py-1 text-xs text-[var(--lux-text)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      data-preview-static="spotlight-filter-tours-btn"
                      onClick={() => handleExploreDestination(activeDestination)}
                      className="lux-btn-primary"
                    >
                      {activeDestination.ctaLabel || 'View Matching Journeys'}
                    </button>
                    <button
                      type="button"
                      data-preview-static="spotlight-plan-destination-btn"
                      onClick={() => handlePlanHere(activeDestination)}
                      className="lux-btn-outline"
                    >
                      Include in Tailor-Made Trip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Editorial Bento Destination Collection (Primary Editable Source of Truth) */}
        <div
          data-preview-list-path="home.destinations"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {destinations.length === 0 && (
            <p
              data-preview-static="destinations-empty-state"
              className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-8 text-center text-sm text-[var(--lux-text-muted)]"
            >
              No destinations added yet. Add destinations in the Fivora editor to populate this showcase.
            </p>
          )}

          {visibleDestinations.map((dest) => {
            const index = destinations.findIndex((d) => d.id === dest.id);
            const safeIndex = index >= 0 ? index : 0;
            const href = sanitizeHref(dest.ctaUrl) || '/#packages';
            const isFeaturedTile = !isEditorPreview && activeCategory === 'All' && (safeIndex === 0 || safeIndex === 4);

            return (
              <article
                key={dest.id}
                data-preview-item-path={`home.destinations[${safeIndex}]`}
                className={`lux-card group flex flex-col overflow-hidden ${
                  isFeaturedTile ? 'sm:col-span-2 lg:col-span-2' : ''
                }`}
              >
                <div
                  className={`lux-image-zoom relative w-full overflow-hidden ${
                    isFeaturedTile ? 'aspect-[16/9]' : 'aspect-[4/3]'
                  }`}
                >
                  <EditableImage
                    src={dest.imageUrl}
                    alt={dest.name}
                    data-preview-field-path={`home.destinations[${safeIndex}].imageUrl`}
                    fit="cover"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                    <span
                      data-preview-field-path={`home.destinations[${safeIndex}].region`}
                      className="bg-[#102D25]/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F7F3EA]"
                      style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                    >
                      {dest.region}
                    </span>
                    <span
                      data-preview-field-path={`home.destinations[${safeIndex}].category`}
                      className="bg-[#C6A46A] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#101917]"
                      style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                    >
                      {dest.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <EditableText
                      as="h3"
                      className="font-editorial m-0 text-2xl font-medium text-[var(--lux-text)]"
                      data-preview-field-path={`home.destinations[${safeIndex}].name`}
                      defaultValue={dest.name}
                    />
                    <span
                      data-preview-field-path={`home.destinations[${safeIndex}].bestSeason`}
                      className="text-right text-[11px] font-medium text-[var(--lux-teal)]"
                      style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                    >
                      {dest.bestSeason}
                    </span>
                  </div>

                  <EditableText
                    as="p"
                    className="mb-3 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                    data-preview-field-path={`home.destinations[${safeIndex}].shortDescription`}
                    defaultValue={dest.shortDescription}
                  />

                  {isEditorPreview && (
                    <div className="mb-4 space-y-2 rounded border border-dashed border-[var(--lux-border-strong)] p-3 text-xs">
                      <div>
                        <span data-preview-static="dest-detail-desc-label" className="font-semibold">
                          Full description:{' '}
                        </span>
                        <span data-preview-field-path={`home.destinations[${safeIndex}].detailedDescription`}>
                          {dest.detailedDescription}
                        </span>
                      </div>
                      <div>
                        <span data-preview-static="dest-highlights-label" className="font-semibold">
                          Highlights:{' '}
                        </span>
                        <span data-preview-field-path={`home.destinations[${safeIndex}].highlights`}>
                          {dest.highlights}
                        </span>
                      </div>
                    </div>
                  )}

                  {!isEditorPreview && dest.highlights && (
                    <p
                      data-preview-field-path={`home.destinations[${safeIndex}].highlights`}
                      className="mb-4 text-xs leading-relaxed text-[var(--lux-text-muted)]/90"
                    >
                      {dest.highlights}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--lux-border)] pt-4">
                    <a
                      href={withBasePath(href)}
                      data-preview-field-path={`home.destinations[${safeIndex}].ctaUrl`}
                      onClick={(e) => {
                        if (!isEditorPreview && href === '/#packages') {
                          e.preventDefault();
                          handleExploreDestination(dest);
                        }
                      }}
                      className="lux-link-underline"
                    >
                      <span data-preview-field-path={`home.destinations[${safeIndex}].ctaLabel`}>
                        {dest.ctaLabel}
                      </span>
                    </a>

                    {!isEditorPreview && (
                      <button
                        type="button"
                        data-preview-static="dest-spotlight-trigger"
                        onClick={() => {
                          setSelectedIndex(safeIndex);
                          document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="border-0 bg-transparent p-0 text-xs font-medium text-[var(--lux-text-muted)] transition hover:text-[var(--lux-gold-deep)]"
                      >
                        Map view →
                      </button>
                    )}
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

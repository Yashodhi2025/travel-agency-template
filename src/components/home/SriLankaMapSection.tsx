'use client';

import { useMemo, useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { sanitizeHref, type TripEnquiryDraft } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '../Reveal';

const MAP_EXPERIENCE_CATEGORIES = [
  'All Experiences',
  'Beaches',
  'Wildlife & Nature',
  'History & Culture',
  'Adventure',
  'Wellness',
  'Gastronomy',
] as const;

/**
 * Original geographically accurate Sri Lanka coastline & relief paths projected from
 * public WGS84 geographic coordinates (lon 79.45°E–82.15°E, lat 5.75°N–10.00°N)
 * into viewBox="0 0 360 500".
 * Includes Jaffna Peninsula, Elephant Pass, Mannar Island, Kayts, Kalpitiya Lagoon,
 * Trincomalee Koddiyar Bay, Dondra Head, and Central Highlands relief.
 */
const SRI_LANKA_COAST_PATH =
  'M 118.4 43.9 L 124.8 55.5 L 138.9 74.5 L 158.4 89.2 L 181.1 103 L 194.1 129.3 L 210.3 149.3 L 223.3 165.1 L 227.6 176.7 L 221.1 182 L 231.9 187.3 L 246 215.7 L 263.3 245.3 L 277.3 265.3 L 290.3 298 L 294.6 326.4 L 292.5 355.9 L 289.2 377 L 279.5 394.9 L 258.9 410.8 L 240.6 424.5 L 214.6 435 L 180 445.5 L 167 454 L 157.3 456.1 L 151.9 454 L 143.2 452.9 L 138.9 450.8 L 120.5 446.6 L 116.2 444.5 L 104.3 432.9 L 98.9 422.3 L 92.4 403.4 L 89.2 386.5 L 82.7 371.8 L 76.2 349.6 L 75.1 320.1 L 70.8 281.1 L 74 242.1 L 67.5 211.5 L 76.2 224.2 L 78.3 205.2 L 84.8 178.8 L 87 155.7 L 84.8 134.6 L 101.1 115.6 L 98.9 91.4 L 100 77.7 L 128.1 75.5 L 109.7 62.9 L 94.6 61.8 L 97.8 48.1 Z';

const MANNAR_ISLAND_PATH = 'M 62.1 121.9 L 74 125.1 L 83.7 133.5 L 78.3 135.6 L 67.5 129.3 Z';
const KAYTS_ISLAND_PATH = 'M 79.4 53.4 L 89.2 55.5 L 88.1 62.9 L 79.4 61.8 Z';
const CENTRAL_HIGHLANDS_OUTER =
  'M 177.8 294.8 L 193 312.7 L 216.8 346.5 L 203.8 367.5 L 164.9 371.8 L 144.3 357 L 149.7 327.5 L 162.7 304.3 Z';
const CENTRAL_HIGHLANDS_PEAK =
  'M 176 318 C 188 320, 198 334, 194 348 C 189 359, 170 361, 162 350 C 156 340, 163 317, 176 318 Z';

interface MapMarkerItem {
  id: string;
  name: string;
  region: string;
  category: string;
  categories: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
  mapX: number;
  mapY: number;
}

interface SriLankaMapSectionProps {
  onSelectDestinationForFilter: (destinationName: string) => void;
  onPlanDestination: (draft: TripEnquiryDraft) => void;
}

function markerMatchesCategory(marker: MapMarkerItem, selectedCategory: string): boolean {
  if (selectedCategory === 'All Experiences') return true;
  const target = selectedCategory.toLowerCase();
  const combined = `${marker.category},${marker.categories}`.toLowerCase();
  return combined.includes(target);
}

export function SriLankaMapSection({
  onSelectDestinationForFilter,
  onPlanDestination,
}: SriLankaMapSectionProps) {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const home = contentObject(contentObject(siteData?.content).home);

  const selectedPages = Array.isArray(siteData?.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData?.template?.structure?.pages || [
        'home',
        'destinations',
        'tours',
        'experiences',
        'about_us',
        'services',
        'contact',
      ];
  const hasDestinations = selectedPages.includes('destinations');

  const resolveMapHref = (rawUrl: string) => {
    const clean = sanitizeHref(rawUrl) || '/#packages';
    if (!hasDestinations && clean.includes('/destinations')) {
      return '/#packages';
    }
    return clean;
  };

  const markers: MapMarkerItem[] = contentList(home.mapMarkers).map((raw, idx) => {
    const item = contentObject(raw);
    return {
      id: contentText(item.id) || `marker-${idx}`,
      name: contentText(item.name),
      region: contentText(item.region),
      category: contentText(item.category),
      categories: contentText(item.categories),
      description: contentText(item.description),
      imageUrl: contentText(item.imageUrl) || '/images/hero-sigiriya.webp',
      imageAlt: contentText(item.imageAlt),
      ctaLabel: contentText(item.ctaLabel) || 'Explore Location',
      ctaUrl: contentText(item.ctaUrl) || '/#packages',
      mapX: typeof item.mapX === 'number' && Number.isFinite(item.mapX) ? item.mapX : 50,
      mapY: typeof item.mapY === 'number' && Number.isFinite(item.mapY) ? item.mapY : 50,
    };
  });

  const [activeCategory, setActiveCategory] = useState<string>('All Experiences');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const matchingIndices = useMemo(() => {
    const set = new Set<number>();
    markers.forEach((marker, idx) => {
      if (markerMatchesCategory(marker, activeCategory)) set.add(idx);
    });
    return set;
  }, [markers, activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'All Experiences') return;
    const firstMatch = markers.findIndex((m) => markerMatchesCategory(m, cat));
    if (firstMatch >= 0) setSelectedIndex(firstMatch);
  };

  const safeSelected = markers.length > 0 ? Math.min(selectedIndex, markers.length - 1) : 0;
  const activeMarker = markers[safeSelected] ?? null;

  return (
    <section
      id="island-map"
      data-design-section="home-island-map"
      className="lux-section border-b border-[var(--lux-border)] bg-[var(--lux-bg)]"
    >
      <div className="lux-container">
        <Reveal variant="fade-up">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <div className="mb-2.5">
                <EditableText
                  as="span"
                  className="lux-eyebrow-tropical"
                  data-preview-field-path="home.mapEyebrow"
                  defaultValue={contentText(home.mapEyebrow) || 'INTERACTIVE SRI LANKA MAP'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                className="font-display m-0 text-2xl font-bold tracking-[-0.025em] text-[var(--lux-text)] sm:text-3xl lg:text-[2.25rem]"
                data-preview-field-path="home.mapHeading"
                defaultValue={contentText(home.mapHeading) || 'Explore the Island by Experience'}
              />
              <EditableText
                as="p"
                className="mt-2 m-0 text-sm leading-relaxed text-[var(--lux-text-muted)] sm:text-[15px]"
                data-preview-field-path="home.mapSummary"
                defaultValue={contentText(home.mapSummary)}
              />
            </div>

            {/* Keyboard-Accessible Experience Category Filter Bar */}
            {!isEditorPreview && markers.length > 0 && (
              <div
                role="tablist"
                aria-label="Filter Sri Lanka map by travel experience"
                className="flex flex-wrap gap-1.5"
              >
                {MAP_EXPERIENCE_CATEGORIES.map((category) => {
                  const isSelected = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      data-preview-static="map-category-tab"
                      onClick={() => handleCategoryChange(category)}
                      className={`min-h-[36px] rounded border px-3 py-1 text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'border-[var(--brand-secondary,#154C42)] bg-[var(--brand-secondary,#154C42)] text-[#FAF8F3] dark:border-[var(--brand-accent,#FF783D)] dark:bg-[var(--brand-accent,#FF783D)] dark:text-white'
                          : 'border-[var(--lux-border-strong)] bg-transparent text-[var(--lux-text-muted)] hover:border-[var(--brand-accent,#FF783D)] hover:text-[var(--lux-text)]'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>

        {/* Cartographic Sri Lanka Map + Compact Location Spotlight */}
        {markers.length > 0 && activeMarker && (
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left: Accurate Cartographic SVG Map */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto aspect-[360/500] w-full max-w-[380px] overflow-hidden rounded-[8px] border border-[var(--lux-border-strong)] bg-gradient-to-b from-[#E5EFEF] via-[#EAF1EE] to-[#DFEBE9] shadow-[var(--lux-shadow-sm)] dark:from-[#12222C] dark:via-[#101E28] dark:to-[#0E1A22]">
                {/* Geographically Accurate Sri Lanka SVG Cartography */}
                <svg
                  viewBox="0 0 360 500"
                  className="h-full w-full"
                  role="img"
                  aria-label="Interactive geographic map of Sri Lanka"
                >
                  <defs>
                    <linearGradient id="slLandFill" x1="0" y1="0" x2="0.85" y2="1">
                      <stop offset="0%" stopColor="#1D6255" />
                      <stop offset="55%" stopColor="#154C42" />
                      <stop offset="100%" stopColor="#103C34" />
                    </linearGradient>
                    <radialGradient id="slHighlandGlow" cx="50%" cy="50%" r="55%">
                      <stop offset="0%" stopColor="#C5A46D" stopOpacity="0.42" />
                      <stop offset="100%" stopColor="#C5A46D" stopOpacity="0.06" />
                    </radialGradient>
                    <filter id="slLandShadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#101820" floodOpacity="0.22" />
                    </filter>
                  </defs>

                  {/* Subtle Lat/Lon Graticule Lines */}
                  <g stroke="#167D91" strokeOpacity="0.13" strokeWidth="0.7" strokeDasharray="2 5">
                    <line x1="0" y1="125" x2="360" y2="125" />
                    <line x1="0" y1="250" x2="360" y2="250" />
                    <line x1="0" y1="375" x2="360" y2="375" />
                    <line x1="120" y1="0" x2="120" y2="500" />
                    <line x1="240" y1="0" x2="240" y2="500" />
                  </g>

                  {/* Subtle Coastal Bathymetry Halo */}
                  <path
                    d={SRI_LANKA_COAST_PATH}
                    fill="none"
                    stroke="#167D91"
                    strokeOpacity="0.16"
                    strokeWidth="12"
                    strokeLinejoin="round"
                  />

                  {/* Main Sri Lanka Coastline & Northern Islands */}
                  <g filter="url(#slLandShadow)">
                    <path
                      d={SRI_LANKA_COAST_PATH}
                      fill="url(#slLandFill)"
                      stroke="#C5A46D"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d={MANNAR_ISLAND_PATH}
                      fill="#154C42"
                      stroke="#C5A46D"
                      strokeWidth="1.1"
                      strokeLinejoin="round"
                    />
                    <path
                      d={KAYTS_ISLAND_PATH}
                      fill="#154C42"
                      stroke="#C5A46D"
                      strokeWidth="1.1"
                      strokeLinejoin="round"
                    />
                  </g>

                  {/* Central Highlands Topographic Elevation Contours */}
                  <path
                    d={CENTRAL_HIGHLANDS_OUTER}
                    fill="url(#slHighlandGlow)"
                    stroke="#C5A46D"
                    strokeOpacity="0.45"
                    strokeWidth="0.9"
                    strokeDasharray="3 3"
                  />
                  <path
                    d={CENTRAL_HIGHLANDS_PEAK}
                    fill="#C5A46D"
                    fillOpacity="0.18"
                    stroke="#FAF8F3"
                    strokeOpacity="0.32"
                    strokeWidth="0.7"
                  />

                  {/* Subtle Geographic Reference Dots (Colombo & Jaffna) */}
                  <g fill="#FAF8F3" fillOpacity="0.65">
                    <circle cx="78.4" cy="349.9" r="2.2" />
                    <circle cx="96.2" cy="61.6" r="2.2" />
                  </g>
                  <g
                    fontFamily="Montserrat, Inter, sans-serif"
                    fontSize="7.5"
                    fontWeight="600"
                    letterSpacing="1.2"
                    fill="#154C42"
                    fillOpacity="0.6"
                  >
                    <text x="16" y="352">COLOMBO</text>
                    <text x="148" y="48">JAFFNA</text>
                  </g>

                  {/* Tasteful Ocean & Compass Labels */}
                  <g
                    fontFamily="Montserrat, Inter, sans-serif"
                    fontSize="7"
                    fontWeight="700"
                    letterSpacing="2.2"
                    fill="#167D91"
                    fillOpacity="0.62"
                  >
                    <text x="234" y="96">BAY OF</text>
                    <text x="234" y="106">BENGAL</text>
                    <text x="14" y="178">GULF OF</text>
                    <text x="14" y="188">MANNAR</text>
                    <text x="184" y="482">INDIAN OCEAN</text>
                  </g>

                  {/* Minimalist Compass Rose */}
                  <g transform="translate(316, 44)" stroke="#C5A46D" strokeWidth="1" opacity="0.85">
                    <circle cx="0" cy="0" r="14" fill="none" strokeOpacity="0.45" />
                    <line x1="0" y1="-11" x2="0" y2="11" />
                    <line x1="-11" y1="0" x2="11" y2="0" />
                    <polygon points="0,-11 -2.5,-3 2.5,-3" fill="#FF783D" stroke="none" />
                    <text
                      x="0"
                      y="-17"
                      textAnchor="middle"
                      fontFamily="Montserrat, sans-serif"
                      fontSize="7"
                      fontWeight="700"
                      fill="#154C42"
                      stroke="none"
                    >
                      N
                    </text>
                  </g>
                </svg>

                {/* Interactive Animated Destination Markers */}
                {markers.map((marker, idx) => {
                  const isSelected = idx === safeSelected;
                  const isHighlighted = matchingIndices.has(idx);
                  return (
                    <button
                      key={marker.id}
                      type="button"
                      data-preview-static="sri-lanka-map-pin"
                      aria-label={`Inspect ${marker.name} (${marker.category})`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedIndex(idx)}
                      style={{
                        left: `${Math.max(10, Math.min(90, marker.mapX))}%`,
                        top: `${Math.max(8, Math.min(94, marker.mapY))}%`,
                      }}
                      className={`group absolute -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-2 transition-all duration-300 ${
                        isSelected
                          ? 'z-30 scale-110'
                          : isHighlighted
                            ? 'z-20 opacity-100 hover:scale-125'
                            : 'z-10 opacity-30 hover:opacity-80'
                      }`}
                    >
                      {isSelected && (
                        <span
                          aria-hidden="true"
                          className="map-pin-pulse pointer-events-none absolute inset-1 rounded-full bg-[#FF783D]/55"
                        />
                      )}
                      <span
                        className={`relative block rounded-full transition-colors ${
                          isSelected
                            ? 'h-3.5 w-3.5 border-2 border-[#FAF8F3] bg-[#FF783D] shadow-[0_0_0_3px_rgba(255,120,61,0.3)]'
                            : isHighlighted
                              ? 'h-2.5 w-2.5 border-[1.5px] border-[#101820] bg-[#FAF8F3] group-hover:bg-[#FF783D]'
                              : 'h-2 w-2 bg-[#9AA7B2]'
                        }`}
                      />
                      <span
                        className={`font-display pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.04em] transition-opacity ${
                          isSelected
                            ? 'bg-[#101820] text-[#FAF8F3] opacity-100 shadow-sm'
                            : isHighlighted
                              ? 'bg-[#101820]/82 text-[#FAF8F3] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                              : 'opacity-0'
                        }`}
                      >
                        {marker.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Compact Keyboard-Accessible Location Quick Pills */}
              <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
                {markers.map((marker, idx) => {
                  const isSelected = idx === safeSelected;
                  const isHighlighted = matchingIndices.has(idx);
                  return (
                    <button
                      key={`chip-${marker.id}`}
                      type="button"
                      data-preview-static="map-location-chip"
                      onClick={() => setSelectedIndex(idx)}
                      className={`rounded border px-2.5 py-1 text-[11px] font-medium transition ${
                        isSelected
                          ? 'border-[var(--brand-accent,#FF783D)] bg-[var(--brand-accent,#FF783D)] text-white'
                          : isHighlighted
                            ? 'border-[var(--lux-border-strong)] bg-[var(--lux-surface)] text-[var(--lux-text)] hover:border-[var(--brand-accent,#FF783D)]'
                            : 'border-[var(--lux-border)] bg-transparent text-[var(--lux-text-muted)] opacity-50 hover:opacity-100'
                      }`}
                    >
                      {marker.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Location Editorial Spotlight */}
            <div className="lg:col-span-7">
              <div
                key={`spotlight-${activeMarker.id}`}
                className="coverflow-stagger-1 flex flex-col gap-5"
              >
                <div className="lux-image-zoom relative aspect-[16/10] w-full overflow-hidden rounded-[6px] bg-[#101820] shadow-[var(--lux-shadow-md)]">
                  <img
                    src={withBasePath(activeMarker.imageUrl)}
                    alt={activeMarker.imageAlt || activeMarker.name}
                    data-preview-static="map-spotlight-image"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.14em]">
                    {activeMarker.region && (
                      <span
                        data-preview-static="map-spotlight-region"
                        className="text-[var(--lux-teal)]"
                      >
                        {activeMarker.region}
                      </span>
                    )}
                    {activeMarker.category && (
                      <>
                        <span aria-hidden="true" className="text-[var(--lux-text-muted)]">·</span>
                        <span
                          data-preview-static="map-spotlight-category"
                          className="text-[var(--lux-gold-deep)] dark:text-[#C5A46D]"
                        >
                          {activeMarker.category}
                        </span>
                      </>
                    )}
                  </div>

                  <h3
                    data-preview-static="map-spotlight-title"
                    className="font-display m-0 mb-2.5 text-2xl font-bold tracking-[-0.02em] text-[var(--lux-text)] sm:text-3xl"
                  >
                    {activeMarker.name}
                  </h3>

                  <p
                    data-preview-static="map-spotlight-description"
                    className="m-0 mb-5 max-w-[58ch] text-sm leading-[1.75] text-[var(--lux-text-muted)] sm:text-[15px]"
                  >
                    {activeMarker.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={withBasePath(resolveMapHref(activeMarker.ctaUrl))}
                      data-preview-static="map-spotlight-explore-cta"
                      onClick={(e) => {
                        const target = resolveMapHref(activeMarker.ctaUrl);
                        if (target === '/#packages') {
                          e.preventDefault();
                          onSelectDestinationForFilter(activeMarker.name);
                          document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="lux-btn-tropical"
                    >
                      <span>{activeMarker.ctaLabel || `Explore ${activeMarker.name}`}</span>
                      <span aria-hidden="true">→</span>
                    </a>

                    <button
                      type="button"
                      data-preview-static="map-spotlight-plan-btn"
                      onClick={() => {
                        onPlanDestination({ destination: activeMarker.name });
                        document.getElementById('tailor-made')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="lux-btn-outline"
                    >
                      Include in My Trip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fivora Editor Preview Collection (all markers editable without altering live layout) */}
        {(isEditorPreview || markers.length === 0) && (
          <div className="mt-8 border-t border-[var(--lux-border)] pt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <strong
                data-preview-static="map-markers-editor-heading"
                className="font-display text-xs uppercase tracking-[0.18em] text-[#C5A46D]"
              >
                Interactive Map Locations Collection
              </strong>
              <span
                data-preview-static="map-markers-editor-hint"
                className="text-xs text-[var(--lux-text-muted)]"
              >
                Add, remove, reorder, or edit Sri Lanka map markers and coordinates in Fivora
              </span>
            </div>

            <div
              data-preview-list-path="home.mapMarkers"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            >
              {markers.length === 0 && (
                <p
                  data-preview-static="map-markers-empty-state"
                  className="col-span-full rounded border border-dashed border-[var(--lux-border-strong)] p-8 text-center text-sm text-[var(--lux-text-muted)]"
                >
                  No map locations configured yet. Add locations in Fivora to populate the Sri Lanka map.
                </p>
              )}

              {markers.map((marker, index) => {
                const safeHref = resolveMapHref(marker.ctaUrl);
                return (
                  <article
                    key={marker.id}
                    data-preview-item-path={`home.mapMarkers[${index}]`}
                    className="flex flex-col gap-2 rounded border border-[var(--lux-border)] bg-[var(--lux-surface)] p-3 text-xs"
                  >
                    <div className="aspect-[16/10] overflow-hidden rounded">
                      <EditableImage
                        src={marker.imageUrl}
                        alt={marker.imageAlt || marker.name}
                        data-preview-field-path={`home.mapMarkers[${index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <EditableText
                      as="h4"
                      className="font-display m-0 text-sm font-bold text-[var(--lux-text)]"
                      data-preview-field-path={`home.mapMarkers[${index}].name`}
                      defaultValue={marker.name}
                    />
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <span
                        data-preview-field-path={`home.mapMarkers[${index}].region`}
                        className="text-[#167D91]"
                      >
                        {marker.region}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        data-preview-field-path={`home.mapMarkers[${index}].category`}
                        className="text-[#FF783D]"
                      >
                        {marker.category}
                      </span>
                    </div>
                    <p
                      data-preview-field-path={`home.mapMarkers[${index}].categories`}
                      className="m-0 text-[11px] text-[var(--lux-text-muted)]"
                    >
                      {marker.categories}
                    </p>
                    <EditableText
                      as="p"
                      className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path={`home.mapMarkers[${index}].description`}
                      defaultValue={marker.description}
                    />
                    <div className="text-[11px] text-[var(--lux-text-muted)]">
                      <span data-preview-static="map-marker-alt-label">Alt: </span>
                      <span data-preview-field-path={`home.mapMarkers[${index}].imageAlt`}>
                        {marker.imageAlt || marker.name}
                      </span>
                    </div>
                    <a
                      href={withBasePath(safeHref)}
                      data-preview-field-path={`home.mapMarkers[${index}].ctaUrl`}
                      className="mt-auto pt-1 font-semibold text-[#FF783D] underline"
                    >
                      <span data-preview-field-path={`home.mapMarkers[${index}].ctaLabel`}>
                        {marker.ctaLabel}
                      </span>
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

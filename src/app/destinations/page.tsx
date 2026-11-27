'use client';

import { useMemo, useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import {
  buildWhatsAppEnquiryUrl,
  destinationDetailHref,
  saveTripEnquiryDraft,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

const DESTINATION_CATEGORIES = [
  { id: 'All', label: 'All Destinations', match: [] as string[] },
  { id: 'Beaches', label: 'Beaches', match: ['beach', 'coast', 'bay', 'mirissa', 'trincomalee', 'bentota', 'arugam'] },
  { id: 'Hill Country', label: 'Hill Country', match: ['hill', 'tea', 'highland', 'ella', 'nuwara', 'uva'] },
  { id: 'Heritage', label: 'Heritage', match: ['heritage', 'culture', 'history', 'fort', 'sigiriya', 'kandy', 'galle', 'anuradhapura'] },
  { id: 'Wildlife', label: 'Wildlife', match: ['wildlife', 'safari', 'nature', 'yala', 'wilpattu', 'wilderness'] },
  { id: 'Adventure', label: 'Adventure', match: ['adventure', 'hike', 'surf', 'ella', 'arugam', 'sigiriya', 'trek'] },
  { id: 'Cities', label: 'Cities & Towns', match: ['city', 'cities', 'town', 'kandy', 'galle', 'colombo', 'capital'] },
];

export default function DestinationsPage() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const page = contentObject(content.destinationsPage);
  const home = contentObject(content.home);
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
  const hasDestinations = selectedPages.includes('destinations');
  const plannerTarget = selectedPages.includes('plan_your_trip')
    ? '/plan-your-trip/'
    : '/#tailor-made';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const destinations = contentList(home.destinations).map((raw, idx) => {
    const item = contentObject(raw);
    return {
      index: idx,
      id: contentText(item.id),
      name: contentText(item.name),
      region: contentText(item.region),
      category: contentText(item.category),
      bestSeason: contentText(item.bestSeason),
      suggestedDuration: contentText(item.suggestedDuration),
      shortDescription: contentText(item.shortDescription),
      imageUrl: contentText(item.imageUrl) || '/images/hero-sigiriya.webp',
      imageAlt: contentText(item.imageAlt),
      ctaLabel: contentText(item.ctaLabel) || 'Explore Destination',
    };
  });

  const filteredDestinations = useMemo(() => {
    if (isEditorPreview) return destinations;
    return destinations.filter((dest) => {
      if (selectedCategory !== 'All') {
        const catDef = DESTINATION_CATEGORIES.find((c) => c.id === selectedCategory);
        const haystack = `${dest.category} ${dest.region} ${dest.name} ${dest.shortDescription}`.toLowerCase();
        if (catDef && catDef.match.length > 0 && !catDef.match.some((kw) => haystack.includes(kw))) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const haystack = `${dest.name} ${dest.region} ${dest.category} ${dest.shortDescription}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [destinations, isEditorPreview, selectedCategory, searchQuery]);

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);
  const whatsappUrl = buildWhatsAppEnquiryUrl(
    agencyWhatsApp,
    `Hello ${brandName}, I would like help planning a multi-destination Sri Lanka itinerary.`,
  );

  const bannerImageUrl = contentText(page.bannerImageUrl) || '/images/hero-sigiriya.webp';
  const bannerImageAlt =
    contentText(page.bannerImageAlt) || contentText(page.heading) || 'Sri Lanka destinations landscape';

  return (
    <div data-preview-page-key="destinations">
      {/* Compact Cinematic Photographic Hero */}
      <section
        data-design-section="destinations-hero"
        className="relative isolate flex min-h-[38vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={bannerImageUrl}
            alt={bannerImageAlt}
            data-preview-field-path="destinationsPage.bannerImageUrl"
            fit="cover"
            className="h-full w-full object-cover opacity-55"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#101820]/94 via-[#101820]/55 to-[#101820]/35"
        />

        <div className="lux-container relative z-10 pb-10 pt-20">
          {/* Accessible Breadcrumb */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.08em] text-[#FAF8F3]/78">
            <a
              href={withBasePath('/')}
              data-preview-static="destinations-breadcrumb-home"
              className="text-[#FAF8F3]/80 no-underline transition hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <EditableText
              as="span"
              color="#C5A46D"
              className="font-semibold text-[#C5A46D]"
              data-preview-field-path="destinationsPage.breadcrumbLabel"
              defaultValue={contentText(page.breadcrumbLabel) || 'Destinations'}
            />
          </div>

          <div className="max-w-3xl">
            <div className="mb-2.5">
              <EditableText
                as="span"
                color="#C5A46D"
                className="lux-eyebrow !text-[#C5A46D]"
                data-preview-field-path="destinationsPage.eyebrow"
                defaultValue={contentText(page.eyebrow) || 'EXPLORE SRI LANKA'}
              />
            </div>

            <EditableText
              as="h1"
              variant="h1"
              color="#FAF8F3"
              className="font-display m-0 mb-2.5 text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#FAF8F3] sm:text-4xl lg:text-5xl"
              data-preview-field-path="destinationsPage.heading"
              defaultValue={contentText(page.heading) || 'Destinations Across the Island'}
            />

            <EditableText
              as="p"
              color="#E8DDC8"
              className="m-0 mb-2 text-base font-medium text-[#E8DDC8] sm:text-lg"
              data-preview-field-path="destinationsPage.subtitle"
              defaultValue={contentText(page.subtitle)}
            />

            <EditableText
              as="p"
              color="rgba(250, 248, 243, 0.8)"
              className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/80"
              data-preview-field-path="destinationsPage.description"
              defaultValue={contentText(page.description)}
            />

            {isEditorPreview && (
              <div className="mt-3 inline-block rounded border border-dashed border-white/25 bg-[#101820]/65 px-2.5 py-1 text-[11px] text-[#A3B0BA]">
                <span data-preview-static="dest-hero-alt-label">Hero alt: </span>
                <span data-preview-field-path="destinationsPage.bannerImageAlt">{bannerImageAlt}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search & Category Filter Bar + Editorial Destination Grid */}
      <section className="lux-section bg-[var(--lux-bg)]" data-design-section="destinations-grid">
        <div className="lux-container">
          {!isEditorPreview && destinations.length > 0 && (
            <div className="mb-8 flex flex-col gap-4 border-b border-[var(--lux-border)] pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {DESTINATION_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      data-preview-static="destinations-category-filter"
                      aria-pressed={active}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`min-h-[38px] rounded border px-3.5 py-1 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-[var(--brand-secondary,#154C42)] bg-[var(--brand-secondary,#154C42)] text-[#FAF8F3] dark:border-[var(--brand-accent,#FF783D)] dark:bg-[var(--brand-accent,#FF783D)] dark:text-white'
                          : 'border-[var(--lux-border-strong)] bg-transparent text-[var(--lux-text-muted)] hover:border-[var(--brand-accent,#FF783D)] hover:text-[var(--lux-text)]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="dest-search-input"
                  data-preview-static="dest-search-sr-label"
                  className="sr-only"
                >
                  Search destinations by name
                </label>
                <input
                  id="dest-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destination (e.g. Ella, Galle)..."
                  data-preview-static="dest-search-input"
                  className="lux-input !min-h-[38px] sm:w-64"
                />
                {(selectedCategory !== 'All' || searchQuery.trim()) && (
                  <button
                    type="button"
                    data-preview-static="dest-reset-filters-btn"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="lux-btn-outline !min-h-[38px] !px-3.5 !text-[11px]"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Editorial Grid */}
          <div
            data-preview-list-path="home.destinations"
            className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3"
          >
            {destinations.length === 0 && (
              <div className="col-span-full rounded-[6px] border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="destinations-page-empty-title" className="font-display m-0 mb-1.5 text-lg font-bold text-[var(--lux-text)]">
                  No Destinations Configured Yet
                </p>
                <p data-preview-static="destinations-page-empty-body" className="m-0 text-sm text-[var(--lux-text-muted)]">
                  Add Sri Lankan or international destinations in Fivora to populate this discovery directory.
                </p>
              </div>
            )}

            {destinations.length > 0 && filteredDestinations.length === 0 && !isEditorPreview && (
              <div className="col-span-full rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="destinations-no-results-title" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                  No Destinations Match Your Search
                </p>
                <p data-preview-static="destinations-no-results-body" className="m-0 mb-5 text-sm text-[var(--lux-text-muted)]">
                  Try another keyword or reset your filters — or tell us where you would like to go and we can plan a custom route.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    data-preview-static="destinations-no-results-reset"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="lux-btn-outline !min-h-[40px]"
                  >
                    Show All Destinations
                  </button>
                  <button
                    type="button"
                    data-preview-static="destinations-no-results-plan"
                    onClick={() => {
                      saveTripEnquiryDraft({
                        destination: searchQuery.trim() || undefined,
                        sourceLabel: searchQuery.trim()
                          ? `Custom Destination: ${searchQuery.trim()}`
                          : 'Destinations Directory',
                      });
                      window.location.href = withBasePath(plannerTarget);
                    }}
                    className="lux-btn-sunset !min-h-[40px]"
                  >
                    Request Custom Destination
                  </button>
                </div>
              </div>
            )}

            {filteredDestinations.map((dest) => {
              const detailUrl = hasDestinations
                ? destinationDetailHref(dest.id, dest.name, dest.index)
                : withBasePath('/#destinations');

              return (
                <article
                  key={dest.id || dest.index}
                  data-preview-item-path={`home.destinations[${dest.index}]`}
                  className="group flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] transition-shadow duration-300 hover:shadow-[var(--lux-shadow-md)]"
                >
                  <div className="lux-image-zoom relative aspect-[16/10] w-full overflow-hidden bg-[#101820]">
                    {isEditorPreview ? (
                      <EditableImage
                        src={dest.imageUrl}
                        alt={dest.imageAlt || dest.name}
                        data-preview-field-path={`home.destinations[${dest.index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <a href={detailUrl} className="block h-full w-full">
                        <EditableImage
                          src={dest.imageUrl}
                          alt={dest.imageAlt || dest.name}
                          data-preview-field-path={`home.destinations[${dest.index}].imageUrl`}
                          fit="cover"
                          className="h-full w-full object-cover"
                        />
                      </a>
                    )}
                    {dest.bestSeason && (
                      <span
                        data-preview-field-path={`home.destinations[${dest.index}].bestSeason`}
                        className="font-display absolute bottom-2.5 left-3 rounded bg-[#101820]/82 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.06em] text-[#FAF8F3] backdrop-blur-sm"
                      >
                        {dest.bestSeason}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em]">
                      <span
                        data-preview-field-path={`home.destinations[${dest.index}].region`}
                        className="text-[var(--lux-teal)]"
                      >
                        {dest.region}
                      </span>
                      <span
                        data-preview-field-path={`home.destinations[${dest.index}].category`}
                        className="text-[var(--lux-gold-deep)] dark:text-[#C5A46D]"
                      >
                        {dest.category}
                      </span>
                    </div>

                    {isEditorPreview ? (
                      <EditableText
                        as="h2"
                        className="font-display m-0 text-xl font-bold text-[var(--lux-text)]"
                        data-preview-field-path={`home.destinations[${dest.index}].name`}
                        defaultValue={dest.name}
                      />
                    ) : (
                      <a href={detailUrl} className="text-inherit no-underline hover:text-[var(--brand-accent,#FF783D)]">
                        <EditableText
                          as="h2"
                          className="font-display m-0 text-xl font-bold text-[var(--lux-text)] transition-colors hover:text-[var(--brand-accent,#FF783D)]"
                          data-preview-field-path={`home.destinations[${dest.index}].name`}
                          defaultValue={dest.name}
                        />
                      </a>
                    )}

                    <EditableText
                      as="p"
                      className="m-0 mb-3 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path={`home.destinations[${dest.index}].shortDescription`}
                      defaultValue={dest.shortDescription}
                    />

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--lux-border)] pt-3.5">
                      {dest.suggestedDuration ? (
                        <span
                          data-preview-field-path={`home.destinations[${dest.index}].suggestedDuration`}
                          className="text-xs font-medium text-[var(--lux-text-muted)]"
                        >
                          {dest.suggestedDuration}
                        </span>
                      ) : (
                        <span data-preview-static="dest-duration-fallback" className="text-xs text-[var(--lux-text-muted)]">
                          Sri Lanka
                        </span>
                      )}

                      <a
                        href={detailUrl}
                        data-preview-static="destination-card-explore-link"
                        className="lux-link-underline"
                      >
                        Explore →
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compact Travel Inquiry CTA */}
      <section className="lux-section lux-section-tropical" data-design-section="destinations-cta">
        <div className="lux-container">
          <Reveal variant="fade-up">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <EditableText
                  as="h2"
                  color="#FAF8F3"
                  className="font-display m-0 mb-2 text-2xl font-bold text-[#FAF8F3] sm:text-3xl"
                  data-preview-field-path="destinationsPage.ctaHeading"
                  defaultValue={contentText(page.ctaHeading) || 'Planning a Multi-Destination Route?'}
                />
                <EditableText
                  as="p"
                  color="rgba(250, 248, 243, 0.82)"
                  className="m-0 text-sm leading-relaxed text-[#FAF8F3]/82 sm:text-base"
                  data-preview-field-path="destinationsPage.ctaBody"
                  defaultValue={contentText(page.ctaBody)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = withBasePath(plannerTarget);
                  }}
                  className="lux-btn-sunset"
                >
                  <span data-preview-field-path="destinationsPage.ctaLabel">
                    {contentText(page.ctaLabel) || 'Plan Your Custom Route'}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="destinations-bottom-whatsapp-cta"
                    className="lux-btn-outline-light"
                  >
                    Chat on WhatsApp ↗
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

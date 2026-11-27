'use client';

import { useMemo, useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import {
  buildWhatsAppEnquiryUrl,
  formatMoney,
  saveTripEnquiryDraft,
  splitDelimitedItems,
  stayDetailHref,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

const STAY_CATEGORIES = [
  { id: 'All', label: 'All Stays', match: [] as string[] },
  { id: 'Beach Resorts', label: 'Beach Resorts', match: ['beach', 'coast', 'resort'] },
  { id: 'Boutique Hotels', label: 'Boutique Hotels', match: ['boutique', 'heritage', 'colonial'] },
  { id: 'Luxury Villas', label: 'Luxury Villas', match: ['villa', 'luxury', 'private'] },
  { id: 'Hill-Country Bungalows', label: 'Hill-Country Bungalows', match: ['hill', 'bungalow', 'mountain', 'tea', 'highland'] },
  { id: 'Eco Lodges', label: 'Eco Lodges', match: ['eco', 'forest', 'nature', 'lake'] },
  { id: 'Family-Friendly Hotels', label: 'Family-Friendly', match: ['family', 'kids', 'multi-generational'] },
  { id: 'Budget Guesthouses', label: 'Budget Guesthouses', match: ['budget', 'guesthouse', 'value', 'homestay'] },
  { id: 'Wildlife Retreats', label: 'Wildlife Retreats', match: ['wildlife', 'safari', 'camp', 'yala', 'wilpattu'] },
];

const BUDGET_BANDS = [
  { id: 'All', label: 'All Budgets' },
  { id: 'value', label: 'Value (Under LKR 25,000)' },
  { id: 'comfort', label: 'Comfort (LKR 25,000 – 50,000)' },
  { id: 'luxury', label: 'Premium & Luxury (LKR 50,000+)' },
  { id: 'quote', label: 'Request a Quote Only' },
] as const;

export default function StaysPage() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const page = contentObject(content.staysPage);
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
  const hasStays = selectedPages.includes('stays');
  const hasPlanner = selectedPages.includes('plan_your_trip');
  const plannerTarget = hasPlanner ? '/plan-your-trip/' : '/#tailor-made';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('All');

  const stays = useMemo(
    () =>
      contentList(home.stays).map((raw, idx) => {
        const item = contentObject(raw);
        const rawPrice =
          typeof item.indicativePrice === 'number'
            ? item.indicativePrice
            : parseFloat(String(item.indicativePrice ?? 0));
        const indicativePrice = Number.isFinite(rawPrice) ? rawPrice : 0;
        const showPrice = item.showPrice !== undefined ? Boolean(item.showPrice) : indicativePrice > 0;
        return {
          index: idx,
          id: contentText(item.id),
          title: contentText(item.title),
          subtitle: contentText(item.subtitle),
          category: contentText(item.category),
          description: contentText(item.description),
          amenities: splitDelimitedItems(contentText(item.amenities)),
          suitableFor: contentText(item.suitableFor),
          imageUrl: contentText(item.imageUrl) || '/images/exp-villa.webp',
          imageAlt: contentText(item.imageAlt),
          showPrice,
          indicativePrice,
          priceLabel: contentText(item.priceLabel),
          ctaLabel: contentText(item.ctaLabel) || 'View Stay',
        };
      }),
    [home.stays],
  );

  const locationOptions = useMemo(() => {
    const tokens = new Set<string>();
    stays.forEach((s) => {
      s.subtitle
        .split(/[·,|/]/)
        .map((part) => part.trim())
        .filter((part) => part.length > 2)
        .forEach((loc) => tokens.add(loc));
    });
    return ['All', ...Array.from(tokens).sort()];
  }, [stays]);

  const hasReliablePrices = useMemo(
    () => stays.some((s) => s.showPrice && s.indicativePrice > 0),
    [stays],
  );

  const filteredStays = useMemo(() => {
    if (isEditorPreview) return stays;
    return stays.filter((stay) => {
      if (selectedCategory !== 'All') {
        const catDef = STAY_CATEGORIES.find((c) => c.id === selectedCategory);
        const hay = `${stay.category} ${stay.title} ${stay.description} ${stay.suitableFor}`.toLowerCase();
        if (catDef && catDef.match.length > 0 && !catDef.match.some((kw) => hay.includes(kw))) {
          return false;
        }
      }
      if (selectedLocation !== 'All') {
        if (!stay.subtitle.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }
      if (selectedBudget !== 'All') {
        if (selectedBudget === 'quote') {
          if (stay.showPrice && stay.indicativePrice > 0) return false;
        } else {
          if (!stay.showPrice || stay.indicativePrice <= 0) return false;
          if (selectedBudget === 'value' && stay.indicativePrice >= 25000) return false;
          if (selectedBudget === 'comfort' && (stay.indicativePrice < 25000 || stay.indicativePrice > 50000)) {
            return false;
          }
          if (selectedBudget === 'luxury' && stay.indicativePrice <= 50000) return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${stay.title} ${stay.subtitle} ${stay.category} ${stay.description} ${stay.amenities.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [stays, isEditorPreview, selectedCategory, selectedLocation, selectedBudget, searchQuery]);

  const hasActiveFilter =
    selectedCategory !== 'All' ||
    selectedLocation !== 'All' ||
    selectedBudget !== 'All' ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedLocation('All');
    setSelectedBudget('All');
    setSearchQuery('');
  };

  const handleEnquireStay = (stay?: (typeof stays)[number]) => {
    if (stay) {
      saveTripEnquiryDraft({
        stayName: stay.title,
        stayCategory: stay.category,
        accommodation: stay.category || stay.title,
        destination: stay.subtitle || undefined,
        sourceLabel: `Accommodation: ${stay.title}`,
      });
    } else if (searchQuery.trim()) {
      saveTripEnquiryDraft({
        destination: searchQuery.trim(),
        sourceLabel: 'Custom Accommodation Inquiry',
      });
    }
    window.location.href = withBasePath(plannerTarget);
  };

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);
  const whatsappUrl = buildWhatsAppEnquiryUrl(
    agencyWhatsApp,
    `Hello ${brandName}, I would like recommendations for hotels, villas, or bungalows in Sri Lanka.`,
  );

  const bannerImageUrl = contentText(page.bannerImageUrl) || '/images/exp-villa.webp';
  const bannerImageAlt =
    contentText(page.bannerImageAlt) || contentText(page.heading) || 'Sri Lanka hotels and stays';

  return (
    <div data-preview-page-key="stays">
      {/* Compact Photographic Hero */}
      <section
        data-design-section="stays-hero"
        className="relative isolate flex min-h-[38vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={bannerImageUrl}
            alt={bannerImageAlt}
            data-preview-field-path="staysPage.bannerImageUrl"
            fit="cover"
            className="h-full w-full object-cover opacity-55"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#101820]/94 via-[#101820]/55 to-[#101820]/35"
        />

        <div className="lux-container relative z-10 pb-10 pt-20">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.08em] text-[#FAF8F3]/78">
            <a
              href={withBasePath('/')}
              data-preview-static="stays-breadcrumb-home"
              className="text-[#FAF8F3]/80 no-underline transition hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <EditableText
              as="span"
              color="#C5A46D"
              className="font-semibold text-[#C5A46D]"
              data-preview-field-path="staysPage.breadcrumbLabel"
              defaultValue={contentText(page.breadcrumbLabel) || 'Hotels & Stays'}
            />
          </div>

          <div className="max-w-3xl">
            <div className="mb-2.5">
              <EditableText
                as="span"
                color="#C5A46D"
                className="lux-eyebrow !text-[#C5A46D]"
                data-preview-field-path="staysPage.eyebrow"
                defaultValue={contentText(page.eyebrow) || 'HOTELS & STAYS'}
              />
            </div>

            <EditableText
              as="h1"
              variant="h1"
              color="#FAF8F3"
              className="font-display m-0 mb-2.5 text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#FAF8F3] sm:text-4xl lg:text-5xl"
              data-preview-field-path="staysPage.heading"
              defaultValue={contentText(page.heading) || 'Handpicked Places to Stay Across Sri Lanka'}
            />

            <EditableText
              as="p"
              color="#E8DDC8"
              className="m-0 mb-2 text-base font-medium text-[#E8DDC8] sm:text-lg"
              data-preview-field-path="staysPage.subtitle"
              defaultValue={contentText(page.subtitle)}
            />

            <EditableText
              as="p"
              color="rgba(250, 248, 243, 0.8)"
              className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/80"
              data-preview-field-path="staysPage.description"
              defaultValue={contentText(page.description)}
            />

            {isEditorPreview && (
              <div className="mt-3 inline-block rounded border border-dashed border-white/25 bg-[#101820]/65 px-2.5 py-1 text-[11px] text-[#A3B0BA]">
                <span data-preview-static="stays-hero-alt-label">Hero alt: </span>
                <span data-preview-field-path="staysPage.bannerImageAlt">{bannerImageAlt}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters & Accommodation Grid */}
      <section className="lux-section bg-[var(--lux-bg)]" data-design-section="stays-catalog">
        <div className="lux-container">
          {!isEditorPreview && stays.length > 0 && (
            <div className="mb-8 space-y-4 border-b border-[var(--lux-border)] pb-6">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {STAY_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      data-preview-static="stays-category-filter"
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

              {/* Search + Location + Budget Row */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="stays-search" data-preview-static="stays-search-label" className="sr-only">
                    Search accommodations by name or location
                  </label>
                  <input
                    id="stays-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stay or region (e.g. Ella, Villa)..."
                    data-preview-static="stays-search-input"
                    className="lux-input !min-h-[40px]"
                  />
                </div>

                <div>
                  <label htmlFor="stays-location" data-preview-static="stays-location-label" className="sr-only">
                    Filter by location
                  </label>
                  <select
                    id="stays-location"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    data-preview-static="stays-location-select"
                    className="lux-select !min-h-[40px]"
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc === 'All' ? 'All Locations' : loc}
                      </option>
                    ))}
                  </select>
                </div>

                {hasReliablePrices && (
                  <div>
                    <label htmlFor="stays-budget" data-preview-static="stays-budget-label" className="sr-only">
                      Filter by nightly budget
                    </label>
                    <select
                      id="stays-budget"
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      data-preview-static="stays-budget-select"
                      className="lux-select !min-h-[40px]"
                    >
                      {BUDGET_BANDS.map((band) => (
                        <option key={band.id} value={band.id}>
                          {band.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span data-preview-static="stays-result-count" className="text-xs font-medium text-[var(--lux-text-muted)]">
                    Showing {filteredStays.length} of {stays.length} stay styles
                  </span>
                  {hasActiveFilter && (
                    <button
                      type="button"
                      data-preview-static="stays-reset-btn"
                      onClick={resetFilters}
                      className="lux-btn-outline !min-h-[38px] !px-3 !text-[11px]"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Editorial Accommodation Grid */}
          <div
            data-preview-list-path="home.stays"
            className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3"
          >
            {stays.length === 0 && (
              <div className="col-span-full rounded-[6px] border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="stays-empty-title" className="font-display m-0 mb-1.5 text-lg font-bold text-[var(--lux-text)]">
                  No Accommodations Configured Yet
                </p>
                <p data-preview-static="stays-empty-body" className="m-0 text-sm text-[var(--lux-text-muted)]">
                  Add hotels, villas, bungalows, or lodges in Fivora to showcase accommodation options.
                </p>
              </div>
            )}

            {stays.length > 0 && filteredStays.length === 0 && !isEditorPreview && (
              <div className="col-span-full rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="stays-no-match-title" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                  No Stays Match Those Filters
                </p>
                <p data-preview-static="stays-no-match-body" className="m-0 mb-5 text-sm text-[var(--lux-text-muted)]">
                  Reset your filters or share your exact town, star category, and room count — we source properties across the island.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    data-preview-static="stays-no-match-reset"
                    onClick={resetFilters}
                    className="lux-btn-outline !min-h-[40px]"
                  >
                    Show All Stays
                  </button>
                  <button
                    type="button"
                    data-preview-static="stays-no-match-enquire"
                    onClick={() => handleEnquireStay()}
                    className="lux-btn-sunset !min-h-[40px]"
                  >
                    Request Custom Stay
                  </button>
                </div>
              </div>
            )}

            {filteredStays.map((stay) => {
              const detailUrl = hasStays
                ? stayDetailHref(stay.id, stay.title, stay.index)
                : withBasePath('/#stays');
              const rateDisplay =
                stay.showPrice && stay.indicativePrice > 0
                  ? stay.priceLabel || `Illustrative from ${formatMoney(stay.indicativePrice, 'LKR')} / night`
                  : 'Request a Quote';

              return (
                <article
                  key={stay.id || stay.index}
                  data-preview-item-path={`home.stays[${stay.index}]`}
                  className="group flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] transition-shadow duration-300 hover:shadow-[var(--lux-shadow-md)]"
                >
                  <div className="lux-image-zoom relative aspect-[16/10] w-full overflow-hidden bg-[#101820]">
                    {isEditorPreview ? (
                      <EditableImage
                        src={stay.imageUrl}
                        alt={stay.imageAlt || stay.title}
                        data-preview-field-path={`home.stays[${stay.index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <a href={detailUrl} className="block h-full w-full">
                        <EditableImage
                          src={stay.imageUrl}
                          alt={stay.imageAlt || stay.title}
                          data-preview-field-path={`home.stays[${stay.index}].imageUrl`}
                          fit="cover"
                          className="h-full w-full object-cover"
                        />
                      </a>
                    )}
                    {stay.category && (
                      <span
                        data-preview-field-path={`home.stays[${stay.index}].category`}
                        className="font-display absolute left-3 top-3 rounded bg-[#101820]/84 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#FAF8F3] backdrop-blur-sm"
                      >
                        {stay.category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2.5 p-5">
                    <span
                      data-preview-field-path={`home.stays[${stay.index}].subtitle`}
                      className="font-display text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--lux-teal)]"
                    >
                      {stay.subtitle}
                    </span>

                    {isEditorPreview ? (
                      <EditableText
                        as="h2"
                        className="font-display m-0 text-xl font-bold leading-snug text-[var(--lux-text)]"
                        data-preview-field-path={`home.stays[${stay.index}].title`}
                        defaultValue={stay.title}
                      />
                    ) : (
                      <a href={detailUrl} className="text-inherit no-underline hover:text-[var(--brand-accent,#FF783D)]">
                        <EditableText
                          as="h2"
                          className="font-display m-0 text-xl font-bold leading-snug text-[var(--lux-text)] transition-colors hover:text-[var(--brand-accent,#FF783D)]"
                          data-preview-field-path={`home.stays[${stay.index}].title`}
                          defaultValue={stay.title}
                        />
                      </a>
                    )}

                    <EditableText
                      as="p"
                      className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path={`home.stays[${stay.index}].description`}
                      defaultValue={stay.description}
                    />

                    {/* Key Amenities Preview */}
                    {stay.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {stay.amenities.slice(0, 3).map((amenity, aIdx) => (
                          <span
                            key={aIdx}
                            data-preview-static="stay-card-amenity-chip"
                            className="rounded border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] px-2 py-0.5 text-[11px] text-[var(--lux-text-muted)]"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Indicative Rate & Actions */}
                    <div className="mt-auto space-y-3 border-t border-[var(--lux-border)] pt-3.5">
                      <div className="text-xs font-semibold text-[var(--lux-text)]">
                        {stay.showPrice && stay.indicativePrice > 0 ? (
                          <span data-preview-field-path={`home.stays[${stay.index}].priceLabel`}>
                            {rateDisplay}
                          </span>
                        ) : (
                          <span
                            data-preview-static="stay-price-on-request"
                            className="font-display uppercase tracking-[0.08em] text-[var(--lux-tropical)]"
                          >
                            Request a Quote
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <a
                          href={detailUrl}
                          data-preview-static="stay-card-view-link"
                          className="lux-link-underline"
                        >
                          View Stay →
                        </a>
                        <button
                          type="button"
                          data-preview-static="stay-card-enquire-btn"
                          onClick={() => handleEnquireStay(stay)}
                          className="lux-btn-tropical !min-h-[34px] !px-3.5 !text-[10.5px]"
                        >
                          Enquire Now
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Illustrative Notice */}
          <div className="mt-8 rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-4">
            <EditableText
              as="p"
              className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]"
              data-preview-field-path="staysPage.disclaimer"
              defaultValue={
                contentText(page.disclaimer) ||
                'Displayed accommodation styles and nightly rates in LKR are illustrative guides only. Live availability and final quotations are confirmed upon inquiry.'
              }
            />
          </div>
        </div>
      </section>

      {/* Bottom Custom Accommodation CTA */}
      <section className="lux-section lux-section-tropical" data-design-section="stays-cta">
        <div className="lux-container">
          <Reveal variant="fade-up">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <EditableText
                  as="h2"
                  color="#FAF8F3"
                  className="font-display m-0 mb-2 text-2xl font-bold text-[#FAF8F3] sm:text-3xl"
                  data-preview-field-path="staysPage.ctaHeading"
                  defaultValue={
                    contentText(page.ctaHeading) || 'Looking for a Specific Hotel Tier or Multi-Stop Stay Plan?'
                  }
                />
                <EditableText
                  as="p"
                  color="rgba(250, 248, 243, 0.82)"
                  className="m-0 text-sm leading-relaxed text-[#FAF8F3]/82 sm:text-base"
                  data-preview-field-path="staysPage.ctaBody"
                  defaultValue={contentText(page.ctaBody)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleEnquireStay()}
                  className="lux-btn-sunset"
                >
                  <span data-preview-field-path="staysPage.ctaLabel">
                    {contentText(page.ctaLabel) || 'Plan Your Stays'}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="stays-bottom-whatsapp-cta"
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

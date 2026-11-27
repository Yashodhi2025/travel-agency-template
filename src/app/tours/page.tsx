'use client';

import { useMemo, useState } from 'react';
import { EditableCard, EditableImage, EditableText } from '@deneb-ui/ui';
import {
  contentObject,
  contentText,
  platformProductDetailHref,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import {
  buildWhatsAppEnquiryUrl,
  extractDaysCount,
  formatMoney,
  saveTripEnquiryDraft,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

const MARKET_TABS = ['All', 'Domestic', 'Inbound', 'Outbound'] as const;

export default function ToursPage() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const page = contentObject(content.toursPage);
  const common = contentObject(content.common);
  const contact = contentObject(content.contact);
  const shop = contentObject(siteData?.shop);
  const shopContact = contentObject(shop.contact);
  const products = useProducts();

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
  const plannerTarget = selectedPages.includes('plan_your_trip')
    ? '/plan-your-trip/'
    : '/#tailor-made';

  const [marketFilter, setMarketFilter] = useState<string>('All');
  const [styleFilter, setStyleFilter] = useState<string>('All');
  const [durationFilter, setDurationFilter] = useState<string>('');
  const [budgetFilter, setBudgetFilter] = useState<string>('');
  const [destinationQuery, setDestinationQuery] = useState<string>('');

  const categories = useMemo(
    () => [
      'All',
      ...Array.from(
        new Set(
          products
            .map((p) => contentText((p as Record<string, unknown>).category))
            .filter(Boolean),
        ),
      ),
    ],
    [products],
  );

  const filteredEntries = useMemo(() => {
    const entries = products.map((rawProduct, index) => ({
      product: contentObject(rawProduct),
      index,
    }));

    if (isEditorPreview) return entries;

    return entries.filter(({ product }) => {
      if (marketFilter !== 'All') {
        if (contentText(product.tourType).toLowerCase() !== marketFilter.toLowerCase()) return false;
      }
      if (styleFilter !== 'All') {
        const hay = `${contentText(product.category)} ${contentText(product.travelStyle)}`.toLowerCase();
        if (!hay.includes(styleFilter.toLowerCase())) return false;
      }
      if (durationFilter) {
        const days = extractDaysCount(contentText(product.duration));
        if (days !== null) {
          if (durationFilter === 'weekend' && days > 4) return false;
          if (durationFilter === 'short' && (days < 5 || days > 7)) return false;
          if (durationFilter === 'medium' && (days < 8 || days > 10)) return false;
          if (durationFilter === 'long' && days < 11) return false;
        }
      }
      if (budgetFilter) {
        const prodRecord = product as Record<string, unknown>;
        const showPrice = prodRecord.showPrice !== undefined ? Boolean(prodRecord.showPrice) : true;
        const basePrice = Number(prodRecord.minPrice || prodRecord.price || 0);
        if (budgetFilter === 'quote') {
          if (showPrice && basePrice > 0) return false;
        } else {
          if (!showPrice || basePrice <= 0) return false;
          if (budgetFilter === 'under100k' && basePrice > 100000) return false;
          if (budgetFilter === '100k-300k' && (basePrice < 100000 || basePrice > 300000)) return false;
          if (budgetFilter === '300k-600k' && (basePrice < 300000 || basePrice > 600000)) return false;
          if (budgetFilter === 'over600k' && basePrice < 600000) return false;
        }
      }
      if (destinationQuery.trim()) {
        const q = destinationQuery.trim().toLowerCase();
        const hay = `${contentText(product.destinations)} ${contentText(product.name)} ${contentText(product.description)} ${contentText(product.category)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    products,
    isEditorPreview,
    marketFilter,
    styleFilter,
    durationFilter,
    budgetFilter,
    destinationQuery,
  ]);

  const hasFilters = Boolean(
    marketFilter !== 'All' ||
      styleFilter !== 'All' ||
      durationFilter ||
      budgetFilter ||
      destinationQuery.trim(),
  );

  const resetFilters = () => {
    setMarketFilter('All');
    setStyleFilter('All');
    setDurationFilter('');
    setBudgetFilter('');
    setDestinationQuery('');
  };

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);
  const whatsappUrl = buildWhatsAppEnquiryUrl(
    agencyWhatsApp,
    `Hello ${brandName}, I would like a custom tour package quotation.`,
  );

  const bannerImageUrl = contentText(page.bannerImageUrl) || '/images/hero-ella.webp';
  const bannerImageAlt =
    contentText(page.bannerImageAlt) || contentText(page.heading) || 'Sri Lanka tour packages';

  return (
    <div data-preview-page-key="tours">
      {/* Compact Photographic Hero */}
      <section
        data-design-section="tours-hero"
        className="relative isolate flex min-h-[38vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={bannerImageUrl}
            alt={bannerImageAlt}
            data-preview-field-path="toursPage.bannerImageUrl"
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
              data-preview-static="tours-breadcrumb-home"
              className="text-[#FAF8F3]/80 no-underline transition hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <EditableText
              as="span"
              color="#C5A46D"
              className="font-semibold text-[#C5A46D]"
              data-preview-field-path="toursPage.breadcrumbLabel"
              defaultValue={contentText(page.breadcrumbLabel) || 'Tour Packages'}
            />
          </div>

          <div className="max-w-3xl">
            <div className="mb-2.5">
              <EditableText
                as="span"
                color="#C5A46D"
                className="lux-eyebrow !text-[#C5A46D]"
                data-preview-field-path="toursPage.eyebrow"
                defaultValue={contentText(page.eyebrow) || 'TOUR PACKAGES'}
              />
            </div>

            <EditableText
              as="h1"
              variant="h1"
              color="#FAF8F3"
              className="font-display m-0 mb-2.5 text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#FAF8F3] sm:text-4xl lg:text-5xl"
              data-preview-field-path="toursPage.heading"
              defaultValue={contentText(page.heading) || 'Domestic, Inbound & Outbound Holidays'}
            />

            <EditableText
              as="p"
              color="#E8DDC8"
              className="m-0 mb-2 text-base font-medium text-[#E8DDC8] sm:text-lg"
              data-preview-field-path="toursPage.subtitle"
              defaultValue={contentText(page.subtitle)}
            />

            <EditableText
              as="p"
              color="rgba(250, 248, 243, 0.8)"
              className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/80"
              data-preview-field-path="toursPage.description"
              defaultValue={contentText(page.description)}
            />

            {isEditorPreview && (
              <div className="mt-3 inline-block rounded border border-dashed border-white/25 bg-[#101820]/65 px-2.5 py-1 text-[11px] text-[#A3B0BA]">
                <span data-preview-static="tours-hero-alt-label">Hero alt: </span>
                <span data-preview-field-path="toursPage.bannerImageAlt">{bannerImageAlt}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters & Tour Packages Grid */}
      <section className="lux-section bg-[var(--lux-bg)]" data-design-section="tours-list">
        <div className="lux-container">
          {!isEditorPreview && products.length > 0 && (
            <div className="mb-8 space-y-4 border-b border-[var(--lux-border)] pb-6">
              {/* Primary Market Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {MARKET_TABS.map((tab) => {
                    const active = marketFilter === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        data-preview-static="tours-market-tab"
                        aria-pressed={active}
                        onClick={() => setMarketFilter(tab)}
                        className={`min-h-[38px] rounded border px-4 py-1 text-xs font-semibold transition-colors ${
                          active
                            ? 'border-[var(--brand-secondary,#154C42)] bg-[var(--brand-secondary,#154C42)] text-[#FAF8F3] dark:border-[var(--brand-accent,#FF783D)] dark:bg-[var(--brand-accent,#FF783D)] dark:text-white'
                            : 'border-[var(--lux-border-strong)] bg-transparent text-[var(--lux-text-muted)] hover:border-[var(--brand-accent,#FF783D)] hover:text-[var(--lux-text)]'
                        }`}
                      >
                        {tab === 'All' ? 'All Markets' : `${tab} Tours`}
                      </button>
                    );
                  })}
                </div>

                {hasFilters && (
                  <button
                    type="button"
                    data-preview-static="tours-reset-filters-btn"
                    onClick={resetFilters}
                    className="lux-btn-outline !min-h-[36px] !px-3.5 !text-[11px]"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>

              {/* Practical Sri Lankan Multi-Filter Row */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="tours-style-select" data-preview-static="tours-style-label" className="mb-1 block text-[11px] font-semibold text-[var(--lux-text-muted)]">
                    Travel Style
                  </label>
                  <select
                    id="tours-style-select"
                    value={styleFilter}
                    onChange={(e) => setStyleFilter(e.target.value)}
                    data-preview-static="tours-style-select"
                    className="lux-select !min-h-[40px]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'All' ? 'All Travel Styles' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tours-duration-select" data-preview-static="tours-duration-label" className="mb-1 block text-[11px] font-semibold text-[var(--lux-text-muted)]">
                    Duration
                  </label>
                  <select
                    id="tours-duration-select"
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                    data-preview-static="tours-duration-select"
                    className="lux-select !min-h-[40px]"
                  >
                    <option value="">Any Duration</option>
                    <option value="weekend">Weekend / 2 – 4 Days</option>
                    <option value="short">5 – 7 Days</option>
                    <option value="medium">8 – 10 Days</option>
                    <option value="long">11+ Days</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tours-budget-select" data-preview-static="tours-budget-label" className="mb-1 block text-[11px] font-semibold text-[var(--lux-text-muted)]">
                    Indicative Budget (LKR)
                  </label>
                  <select
                    id="tours-budget-select"
                    value={budgetFilter}
                    onChange={(e) => setBudgetFilter(e.target.value)}
                    data-preview-static="tours-budget-select"
                    className="lux-select !min-h-[40px]"
                  >
                    <option value="">Any Budget</option>
                    <option value="under100k">Under LKR 100,000</option>
                    <option value="100k-300k">LKR 100,000 – 300,000</option>
                    <option value="300k-600k">LKR 300,000 – 600,000</option>
                    <option value="over600k">LKR 600,000+</option>
                    <option value="quote">Request a Quote Only</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tours-dest-search" data-preview-static="tours-dest-label" className="mb-1 block text-[11px] font-semibold text-[var(--lux-text-muted)]">
                    Destination
                  </label>
                  <input
                    id="tours-dest-search"
                    type="search"
                    value={destinationQuery}
                    onChange={(e) => setDestinationQuery(e.target.value)}
                    placeholder="e.g. Ella, Galle, Maldives..."
                    data-preview-static="tours-dest-input"
                    className="lux-input !min-h-[40px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tour Packages Grid */}
          <div
            data-preview-list-path="products"
            className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3"
          >
            {products.length === 0 && (
              <div className="col-span-full rounded-[6px] border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="tours-empty-title" className="font-display m-0 mb-1.5 text-lg font-bold text-[var(--lux-text)]">
                  No Tour Packages Configured Yet
                </p>
                <p data-preview-static="tours-empty-body" className="m-0 text-sm text-[var(--lux-text-muted)]">
                  Add domestic, inbound, or outbound itineraries in Fivora to publish your tours catalogue.
                </p>
              </div>
            )}

            {products.length > 0 && filteredEntries.length === 0 && !isEditorPreview && (
              <div className="col-span-full rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="tours-no-match-title" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                  No Sample Tours Match Those Filters
                </p>
                <p data-preview-static="tours-no-match-body" className="m-0 mb-5 text-sm text-[var(--lux-text-muted)]">
                  Every route can be adapted to your dates, party size, pickup city, and budget. Reset filters or request a custom itinerary.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    data-preview-static="tours-no-match-reset"
                    onClick={resetFilters}
                    className="lux-btn-outline !min-h-[40px]"
                  >
                    Show All Tours
                  </button>
                  <button
                    type="button"
                    data-preview-static="tours-no-match-custom"
                    onClick={() => {
                      saveTripEnquiryDraft({
                        travelType:
                          marketFilter === 'Domestic' ||
                          marketFilter === 'Inbound' ||
                          marketFilter === 'Outbound'
                            ? marketFilter
                            : undefined,
                        destination: destinationQuery.trim() || undefined,
                        sourceLabel: 'Custom Tour Request',
                      });
                      window.location.href = withBasePath(plannerTarget);
                    }}
                    className="lux-btn-sunset !min-h-[40px]"
                  >
                    Request Custom Tour
                  </button>
                </div>
              </div>
            )}

            {filteredEntries.map(({ product, index }) => {
              const productId =
                typeof product.id === 'string' || typeof product.id === 'number' ? product.id : null;
              const price =
                typeof product.price === 'number'
                  ? product.price
                  : parseFloat(String(product.price || 0));
              const compareAt =
                typeof product.compareAtPrice === 'number'
                  ? product.compareAtPrice
                  : parseFloat(String(product.compareAtPrice || 0));
              const currency = contentText(product.currency) || 'LKR';
              const pricingLabel = contentText(product.pricingLabel) || 'Illustrative demo rate';
              const tourType = contentText(product.tourType);
              const category = contentText(product.category);
              const duration = contentText(product.duration);
              const destinations = contentText(product.destinations);
              const imageAlt = contentText(product.imageAlt) || contentText(product.name);

              const prodRecord = product as Record<string, unknown>;
              const customData = contentObject(prodRecord.customData);
              const itemShowPrice =
                prodRecord.showPrice !== undefined
                  ? Boolean(prodRecord.showPrice)
                  : customData.showPrice !== undefined
                    ? Boolean(customData.showPrice)
                    : true;

              const isRange = Boolean(
                prodRecord.isPriceRange ||
                  (prodRecord.minPrice !== undefined &&
                    prodRecord.maxPrice !== undefined &&
                    Number(prodRecord.maxPrice) > Number(prodRecord.minPrice)) ||
                  contentText(product.priceRange),
              );

              let displayPrice = formatMoney(price, currency);
              if (isRange) {
                if (contentText(product.priceRange)) {
                  displayPrice = contentText(product.priceRange);
                } else {
                  const min = prodRecord.minPrice !== undefined ? Number(prodRecord.minPrice) : price;
                  const max = prodRecord.maxPrice !== undefined ? Number(prodRecord.maxPrice) : price;
                  displayPrice = `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`;
                }
              }

              const detailHref = platformProductDetailHref(productId);

              return (
                <EditableCard
                  key={productId ?? index}
                  className="flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] !p-0 transition-shadow duration-300 hover:shadow-[var(--lux-shadow-md)]"
                  item={product as Record<string, unknown>}
                  itemPath={`products[${index}]`}
                  imageKey="__custom__"
                  data-preview-item-path={`products[${index}]`}
                  balance
                  radius="sm"
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <div className="lux-image-zoom relative aspect-[16/10] w-full overflow-hidden bg-[#101820]">
                    {isEditorPreview ? (
                      <EditableImage
                        src={contentText(product.imageUrl) || '/images/hero-sigiriya.webp'}
                        alt={imageAlt}
                        data-preview-field-path={`products[${index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <a href={detailHref} className="block h-full w-full">
                        <EditableImage
                          src={contentText(product.imageUrl) || '/images/hero-sigiriya.webp'}
                          alt={imageAlt}
                          data-preview-field-path={`products[${index}].imageUrl`}
                          fit="cover"
                          className="h-full w-full object-cover"
                        />
                      </a>
                    )}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#101820]/75 to-transparent"
                    />
                    {tourType && (
                      <span
                        data-preview-field-path={`products[${index}].tourType`}
                        className="font-display absolute left-3 top-3 rounded bg-[#101820]/85 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#FAF8F3] backdrop-blur-sm"
                      >
                        {tourType}
                      </span>
                    )}
                    {duration && (
                      <span
                        data-preview-field-path={`products[${index}].duration`}
                        className="font-display absolute bottom-2.5 left-3 text-[11px] font-bold tracking-[0.06em] text-[#FAF8F3]"
                      >
                        {duration}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2.5 p-5">
                    {category && (
                      <span
                        data-preview-field-path={`products[${index}].category`}
                        className="font-display text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--lux-tropical)]"
                      >
                        {category}
                      </span>
                    )}

                    {isEditorPreview ? (
                      <EditableText
                        as="h2"
                        className="font-display m-0 text-lg font-bold leading-snug text-[var(--lux-text)]"
                        data-preview-field-path={`products[${index}].name`}
                        defaultValue={contentText(product.name)}
                      />
                    ) : (
                      <a href={detailHref} className="text-inherit no-underline hover:text-[var(--brand-accent,#FF783D)]">
                        <EditableText
                          as="h2"
                          className="font-display m-0 text-lg font-bold leading-snug text-[var(--lux-text)] transition-colors hover:text-[var(--brand-accent,#FF783D)]"
                          data-preview-field-path={`products[${index}].name`}
                          defaultValue={contentText(product.name)}
                        />
                      </a>
                    )}

                    {destinations && (
                      <p
                        data-preview-field-path={`products[${index}].destinations`}
                        className="m-0 text-xs font-medium text-[var(--lux-teal)]"
                      >
                        {destinations}
                      </p>
                    )}

                    <EditableText
                      as="p"
                      className="m-0 line-clamp-2 text-xs leading-relaxed text-[var(--lux-text-muted)] sm:text-[13px]"
                      data-preview-field-path={`products[${index}].description`}
                      defaultValue={contentText(product.description)}
                    />

                    <div className="mt-auto border-t border-[var(--lux-border)] pt-3.5">
                      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                        {itemShowPrice ? (
                          <div>
                            <div className="flex items-baseline gap-2">
                              <EditableText
                                as="span"
                                className="font-display text-base font-bold text-[var(--lux-text)]"
                                data-preview-field-path={`products[${index}].price`}
                                defaultValue={displayPrice}
                              />
                              {compareAt > 0 && !isRange && (
                                <span
                                  data-preview-static="tours-compare-price"
                                  className="text-xs text-[var(--lux-text-muted)] line-through"
                                >
                                  {formatMoney(compareAt, currency)}
                                </span>
                              )}
                            </div>
                            <span
                              data-preview-field-path={`products[${index}].pricingLabel`}
                              className="block text-[10.5px] text-[var(--lux-text-muted)]"
                            >
                              {pricingLabel}
                            </span>
                          </div>
                        ) : (
                          <span
                            data-preview-static="tours-quote-badge"
                            className="font-display text-xs font-bold uppercase tracking-[0.08em] text-[var(--lux-tropical)]"
                          >
                            Request a Quote
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <a
                          href={detailHref}
                          data-preview-static="tours-view-itinerary-link"
                          className="lux-btn-tropical !min-h-[40px] !px-3 !text-[11px]"
                        >
                          View Itinerary
                        </a>
                        <button
                          type="button"
                          data-preview-static="tours-enquire-now-btn"
                          onClick={() => {
                            saveTripEnquiryDraft({
                              travelType:
                                tourType === 'Domestic' ||
                                tourType === 'Inbound' ||
                                tourType === 'Outbound'
                                  ? tourType
                                  : undefined,
                              packageName: contentText(product.name),
                              destination: destinations || undefined,
                              duration: duration || undefined,
                              travelStyle: category || undefined,
                            });
                            window.location.href = withBasePath('/#tailor-made');
                          }}
                          className="lux-btn-outline !min-h-[40px] !px-3 !text-[11px]"
                        >
                          Enquire Now
                        </button>
                      </div>
                    </div>
                  </div>
                </EditableCard>
              );
            })}
          </div>

          {/* Pricing Disclaimer */}
          <EditableText
            as="p"
            className="mt-8 m-0 border-l-2 border-[#C5A46D] pl-4 text-xs leading-relaxed text-[var(--lux-text-muted)]"
            data-preview-field-path="toursPage.pricingDisclaimer"
            defaultValue={
              contentText(page.pricingDisclaimer) ||
              'Displayed LKR prices are illustrative demonstration guides. Confirm exact quotations directly with the agency.'
            }
          />
        </div>
      </section>

      {/* Bottom Custom Tour CTA */}
      <section className="lux-section lux-section-tropical" data-design-section="tours-cta">
        <div className="lux-container">
          <Reveal variant="fade-up">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <EditableText
                  as="h2"
                  color="#FAF8F3"
                  className="font-display m-0 mb-2 text-2xl font-bold text-[#FAF8F3] sm:text-3xl"
                  data-preview-field-path="toursPage.ctaHeading"
                  defaultValue={
                    contentText(page.ctaHeading) || 'Need a Custom Family, Group, or Corporate Package?'
                  }
                />
                <EditableText
                  as="p"
                  color="rgba(250, 248, 243, 0.82)"
                  className="m-0 text-sm leading-relaxed text-[#FAF8F3]/82 sm:text-base"
                  data-preview-field-path="toursPage.ctaBody"
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
                  <span data-preview-field-path="toursPage.ctaLabel">
                    {contentText(page.ctaLabel) || 'Request Custom Quotation'}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="tours-bottom-whatsapp-cta"
                    className="lux-btn-outline-light"
                  >
                    WhatsApp Planner ↗
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

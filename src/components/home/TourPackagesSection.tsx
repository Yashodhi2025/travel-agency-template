'use client';

import { useMemo, useState } from 'react';
import { EditableCard, EditableImage, EditableText } from '@deneb-ui/ui';
import {
  contentList,
  contentObject,
  contentText,
  platformProductDetailHref,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { formatMoney, type TripEnquiryDraft } from '@/lib/travelHelpers';
import { Reveal } from '../Reveal';

const TOUR_MARKET_TABS = ['All', 'Domestic', 'Inbound', 'Outbound'] as const;

interface TourPackagesSectionProps {
  externalRegionFilter: string;
  externalStyleFilter: string;
  onResetExternalFilters: () => void;
  onEnquirePackage: (draft: TripEnquiryDraft) => void;
}

export function TourPackagesSection({
  externalRegionFilter,
  externalStyleFilter,
  onResetExternalFilters,
  onEnquirePackage,
}: TourPackagesSectionProps) {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const home = contentObject(contentObject(siteData?.content).home);
  const products = useProducts();

  const [marketFilter, setMarketFilter] = useState<string>('All');
  const [showAll, setShowAll] = useState(false);

  const rawLimit = Number(home.featuredPackagesCount);
  const featuredLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.round(rawLimit) : 3;

  const filteredEntries = useMemo(() => {
    const entries = products.map((rawProduct, index) => ({
      product: contentObject(rawProduct),
      index,
    }));

    if (isEditorPreview) return entries;

    return entries.filter(({ product }) => {
      if (marketFilter !== 'All') {
        const market = contentText(product.tourType).toLowerCase();
        if (market !== marketFilter.toLowerCase()) return false;
      }
      if (externalStyleFilter) {
        const haystack = `${contentText(product.category)} ${contentText(product.travelStyle)} ${contentText(product.tourType)} ${contentText(product.name)}`.toLowerCase();
        if (!haystack.includes(externalStyleFilter.toLowerCase())) return false;
      }
      if (externalRegionFilter) {
        const haystack = `${contentText(product.destinations)} ${contentText(product.name)} ${contentText(product.description)}`.toLowerCase();
        if (!haystack.includes(externalRegionFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [products, isEditorPreview, marketFilter, externalStyleFilter, externalRegionFilter]);

  const hasActiveFilter = Boolean(
    marketFilter !== 'All' || externalRegionFilter || externalStyleFilter,
  );

  // On live storefront, display only 3 featured packages by default (keeping homepage concise & editorial)
  const visibleEntries =
    isEditorPreview || showAll || hasActiveFilter
      ? filteredEntries
      : filteredEntries.slice(0, featuredLimit);

  const hasMoreToShow = !isEditorPreview && !hasActiveFilter && filteredEntries.length > featuredLimit;

  const clearAllFilters = () => {
    setMarketFilter('All');
    setShowAll(false);
    onResetExternalFilters();
  };

  return (
    <section
      id="packages"
      data-design-section="home-products"
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
                  data-preview-field-path="home.productsEyebrow"
                  defaultValue={contentText(home.productsEyebrow) || 'FEATURED TOUR PACKAGES'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                className="font-display m-0 text-2xl font-bold tracking-[-0.025em] text-[var(--lux-text)] sm:text-3xl lg:text-[2.25rem]"
                data-preview-field-path="home.productsHeading"
                defaultValue={contentText(home.productsHeading) || 'Curated Domestic, Inbound & Outbound Tours'}
              />
              <EditableText
                as="p"
                className="mt-2 m-0 text-sm leading-relaxed text-[var(--lux-text-muted)] sm:text-[15px]"
                data-preview-field-path="home.productsSummary"
                defaultValue={contentText(home.productsSummary)}
              />
            </div>

            {/* Clean Market Filter Tabs */}
            {!isEditorPreview && products.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {TOUR_MARKET_TABS.map((tab) => {
                  const active = marketFilter === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      data-preview-static="package-market-tab"
                      aria-pressed={active}
                      onClick={() => setMarketFilter(tab)}
                      className={`min-h-[36px] rounded border px-3.5 py-1 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-[var(--brand-secondary,#154C42)] bg-[var(--brand-secondary,#154C42)] text-[#FAF8F3] dark:border-[var(--brand-accent,#FF783D)] dark:bg-[var(--brand-accent,#FF783D)] dark:text-white'
                          : 'border-[var(--lux-border-strong)] bg-transparent text-[var(--lux-text-muted)] hover:border-[var(--brand-accent,#FF783D)] hover:text-[var(--lux-text)]'
                      }`}
                    >
                      {tab === 'All' ? 'Featured' : tab}
                    </button>
                  );
                })}
                {hasActiveFilter && (
                  <button
                    type="button"
                    data-preview-static="package-reset-filters"
                    onClick={clearAllFilters}
                    className="border-0 bg-transparent px-2 text-xs font-semibold text-[var(--brand-accent,#FF783D)] underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>
        </Reveal>

        {/* Active Region / Style Context Chip */}
        {!isEditorPreview && (externalRegionFilter || externalStyleFilter) && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--lux-border-strong)] bg-[var(--lux-surface-alt)] px-4 py-2.5 text-xs">
            <span data-preview-static="package-region-filter-notice">
              Filtered by <strong>{externalRegionFilter || externalStyleFilter}</strong>
            </span>
            <button
              type="button"
              data-preview-static="package-clear-region-btn"
              onClick={clearAllFilters}
              className="border-0 bg-transparent text-xs font-semibold text-[var(--brand-accent,#FF783D)] underline"
            >
              Show featured tours
            </button>
          </div>
        )}

        {/* Featured Tour Cards (Essential Information Only on Homepage) */}
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          data-preview-list-path="products"
        >
          {products.length === 0 && (
            <p
              data-preview-static="packages-empty-collection"
              className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-8 text-center text-sm text-[var(--lux-text-muted)]"
            >
              No tour packages configured yet. Add packages in Fivora.
            </p>
          )}

          {products.length > 0 && visibleEntries.length === 0 && !isEditorPreview && (
            <div className="col-span-full flex flex-col items-center gap-3 border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-8 text-center">
              <p data-preview-static="packages-no-match-title" className="font-display m-0 text-lg font-bold text-[var(--lux-text)]">
                No Sample Packages Match That Filter
              </p>
              <p data-preview-static="packages-no-match-body" className="m-0 max-w-md text-xs text-[var(--lux-text-muted)]">
                Every itinerary can be customised around your exact dates, pickup point, and budget.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  data-preview-static="packages-no-match-reset"
                  onClick={clearAllFilters}
                  className="lux-btn-outline !min-h-[38px]"
                >
                  Show Featured Tours
                </button>
                <button
                  type="button"
                  data-preview-static="packages-no-match-tailor"
                  onClick={() => {
                    onEnquirePackage({
                      destination: externalRegionFilter || undefined,
                      travelStyle: externalStyleFilter || undefined,
                    });
                    document.getElementById('tailor-made')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="lux-btn-sunset !min-h-[38px]"
                >
                  Request Custom Route
                </button>
              </div>
            </div>
          )}

          {visibleEntries.map(({ product, index }) => {
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
            const pricingLabel = contentText(product.pricingLabel) || 'Illustrative guide';
            const tourType = contentText(product.tourType);
            const badge = contentText(product.badge);
            const category = contentText(product.category);
            const duration = contentText(product.duration);
            const destinations = contentText(product.destinations);
            const travelStyle = contentText(product.travelStyle);
            const groupSize = contentText(product.groupSize);
            const highlights = contentText(product.highlights);
            const accommodation = contentText(product.accommodation);
            const transport = contentText(product.transport);
            const inclusions = contentText(product.inclusions);
            const exclusions = contentText(product.exclusions);
            const imageAlt = contentText(product.imageAlt) || contentText(product.name);
            const itinerary = contentList(product.itinerary);
            const photoGallery = contentList(product.photoGallery);

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
                {/* Clean High-Quality Tour Photograph */}
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

                  <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
                    {(tourType || isEditorPreview) && (
                      <span
                        data-preview-field-path={`products[${index}].tourType`}
                        className="rounded bg-[#101820]/82 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#FAF8F3] backdrop-blur-sm"
                        style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                      >
                        {tourType}
                      </span>
                    )}
                    {isEditorPreview && (
                      <span
                        data-preview-field-path={`products[${index}].badge`}
                        className="rounded bg-[#C5A46D] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#101820]"
                        style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>

                  {(duration || isEditorPreview) && (
                    <span
                      data-preview-field-path={`products[${index}].duration`}
                      className="font-display absolute bottom-2.5 left-3 z-10 text-[11px] font-bold tracking-[0.06em] text-[#FAF8F3]"
                      style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                    >
                      {duration}
                    </span>
                  )}
                </div>

                {/* Essential Tour Summary Only (full itinerary & details live on /products/detail) */}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    {(category || isEditorPreview) && (
                      <span
                        data-preview-field-path={`products[${index}].category`}
                        className="font-display font-bold uppercase tracking-[0.14em] text-[var(--lux-tropical)]"
                        style={{ minWidth: '1.5ch', minHeight: '1.1em' }}
                      >
                        {category}
                      </span>
                    )}
                    {isEditorPreview && (
                      <span
                        data-preview-field-path={`products[${index}].groupSize`}
                        className="text-[var(--lux-text-muted)]"
                      >
                        {groupSize}
                      </span>
                    )}
                  </div>

                  {isEditorPreview ? (
                    <EditableText
                      as="h3"
                      className="font-display m-0 text-lg font-bold leading-snug text-[var(--lux-text)]"
                      data-preview-field-path={`products[${index}].name`}
                      defaultValue={contentText(product.name)}
                    />
                  ) : (
                    <a href={detailHref} className="text-inherit no-underline hover:text-[var(--brand-accent,#FF783D)]">
                      <EditableText
                        as="h3"
                        className="font-display m-0 text-lg font-bold leading-snug text-[var(--lux-text)] transition-colors hover:text-[var(--brand-accent,#FF783D)]"
                        data-preview-field-path={`products[${index}].name`}
                        defaultValue={contentText(product.name)}
                      />
                    </a>
                  )}

                  {(destinations || isEditorPreview) && (
                    <p
                      data-preview-field-path={`products[${index}].destinations`}
                      className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]"
                      style={{ minHeight: '1.2em' }}
                    >
                      {destinations}
                    </p>
                  )}

                  {/* Full Editable Product Details & Itinerary preserved in Fivora Editor Preview */}
                  {isEditorPreview && (
                    <div className="mt-2 space-y-2.5 rounded border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface-alt)] p-3 text-xs">
                      <EditableText
                        as="p"
                        className="m-0 text-xs text-[var(--lux-text-muted)]"
                        data-preview-field-path={`products[${index}].description`}
                        defaultValue={contentText(product.description)}
                      />
                      <div className="grid gap-1 border-t border-[var(--lux-border)] pt-2">
                        <strong data-preview-static="product-pricing-settings-heading">Pricing settings</strong>
                        <div>
                          <span data-preview-static="product-show-price-label">Show price: </span>
                          <span data-preview-field-path={`products[${index}].showPrice`}>
                            {itemShowPrice ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {!itemShowPrice && (
                          <div>
                            <span data-preview-static="product-price-label">Starting price: </span>
                            <span data-preview-field-path={`products[${index}].price`}>
                              {displayPrice}
                            </span>
                          </div>
                        )}
                        <div>
                          <span data-preview-static="product-pricing-basis-label">Pricing basis: </span>
                          <span data-preview-field-path={`products[${index}].pricingLabel`}>
                            {pricingLabel}
                          </span>
                        </div>
                        <div>
                          <span data-preview-static="product-price-range-enabled-label">Price range enabled: </span>
                          <span data-preview-field-path={`products[${index}].isPriceRange`}>
                            {String(prodRecord.isPriceRange ?? false)}
                          </span>
                        </div>
                        <div>
                          <span data-preview-static="product-min-price-label">Minimum price: </span>
                          <span data-preview-field-path={`products[${index}].minPrice`}>
                            {String(prodRecord.minPrice ?? 0)}
                          </span>
                        </div>
                        <div>
                          <span data-preview-static="product-max-price-label">Maximum price: </span>
                          <span data-preview-field-path={`products[${index}].maxPrice`}>
                            {String(prodRecord.maxPrice ?? 0)}
                          </span>
                        </div>
                        <div>
                          <span data-preview-static="product-price-range-label">Price range: </span>
                          <span data-preview-field-path={`products[${index}].priceRange`}>
                            {String(product.priceRange || 'Not set')}
                          </span>
                        </div>
                        <div>
                          <span data-preview-static="product-compare-at-price-label">Previous price: </span>
                          <span data-preview-field-path={`products[${index}].compareAtPrice`}>
                            {compareAt}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-1 border-t border-[var(--lux-border)] pt-2">
                        <strong data-preview-static="product-details-settings-heading">Tour detail page fields</strong>
                        <div>
                          <span data-preview-static="product-alt-label">Cover alt: </span>
                          <span data-preview-field-path={`products[${index}].imageAlt`}>{imageAlt}</span>
                        </div>
                        <div>
                          <span data-preview-static="product-travel-style-label">Travel style: </span>
                          <span data-preview-field-path={`products[${index}].travelStyle`}>{travelStyle}</span>
                        </div>
                        <div>
                          <span data-preview-static="product-highlights-label">Highlights: </span>
                          <span data-preview-field-path={`products[${index}].highlights`}>{highlights}</span>
                        </div>
                        <div>
                          <span data-preview-static="product-accommodation-label">Accommodation: </span>
                          <span data-preview-field-path={`products[${index}].accommodation`}>{accommodation}</span>
                        </div>
                        <div>
                          <span data-preview-static="product-transport-label">Transport: </span>
                          <span data-preview-field-path={`products[${index}].transport`}>{transport}</span>
                        </div>
                        <div>
                          <span data-preview-static="product-inclusions-label">Inclusions: </span>
                          <span data-preview-field-path={`products[${index}].inclusions`}>{inclusions}</span>
                        </div>
                        <div>
                          <span data-preview-static="product-exclusions-label">Exclusions: </span>
                          <span data-preview-field-path={`products[${index}].exclusions`}>{exclusions}</span>
                        </div>
                      </div>

                      <div
                        data-preview-list-path={`products[${index}].photoGallery`}
                        className="space-y-1 border-t border-[var(--lux-border)] pt-2"
                      >
                        <strong data-preview-static="product-gallery-heading">Package gallery</strong>
                        {photoGallery.length === 0 && (
                          <p data-preview-static="product-gallery-empty" className="m-0 opacity-75">
                            No gallery photos added yet.
                          </p>
                        )}
                        {photoGallery.map((rawPhoto, photoIdx) => {
                          const photoObj = contentObject(rawPhoto);
                          return (
                            <div
                              key={photoIdx}
                              data-preview-item-path={`products[${index}].photoGallery[${photoIdx}]`}
                              className="flex items-center gap-2 rounded border border-[var(--lux-border)] bg-[var(--lux-surface)] p-1.5"
                            >
                              <EditableImage
                                src={contentText(photoObj.imageUrl) || '/images/hero-sigiriya.webp'}
                                alt={contentText(photoObj.caption) || `Gallery ${photoIdx + 1}`}
                                data-preview-field-path={`products[${index}].photoGallery[${photoIdx}].imageUrl`}
                                fit="cover"
                                className="h-7 w-10 shrink-0 rounded object-cover"
                              />
                              <span data-preview-field-path={`products[${index}].photoGallery[${photoIdx}].caption`}>
                                {contentText(photoObj.caption)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        data-preview-list-path={`products[${index}].itinerary`}
                        className="space-y-1 border-t border-[var(--lux-border)] pt-2"
                      >
                        <strong data-preview-static="product-itinerary-heading">Day-by-day itinerary</strong>
                        {itinerary.length === 0 && (
                          <p data-preview-static="product-itinerary-empty" className="m-0 opacity-75">
                            No itinerary days added yet.
                          </p>
                        )}
                        {itinerary.map((rawDay, dayIdx) => {
                          const dayObj = contentObject(rawDay);
                          return (
                            <div
                              key={dayIdx}
                              data-preview-item-path={`products[${index}].itinerary[${dayIdx}]`}
                              className="rounded border border-[var(--lux-border)] bg-[var(--lux-surface)] p-2"
                            >
                              <div className="flex flex-wrap gap-1.5 font-semibold">
                                <span data-preview-field-path={`products[${index}].itinerary[${dayIdx}].day`}>
                                  {contentText(dayObj.day)}
                                </span>
                                <span data-preview-field-path={`products[${index}].itinerary[${dayIdx}].title`}>
                                  {contentText(dayObj.title)}
                                </span>
                              </div>
                              <p
                                data-preview-field-path={`products[${index}].itinerary[${dayIdx}].description`}
                                className="m-0 mt-1 opacity-80"
                              >
                                {contentText(dayObj.description)}
                              </p>
                              <span
                                data-preview-field-path={`products[${index}].itinerary[${dayIdx}].stay`}
                                className="mt-1 inline-block text-[11px] text-[#167D91]"
                              >
                                {contentText(dayObj.stay)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Concise Price & Single Primary Action Row */}
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--lux-border)] pt-3.5">
                    <div>
                      {itemShowPrice ? (
                        <>
                          <EditableText
                            as="span"
                            className="font-display block text-base font-bold text-[var(--lux-text)]"
                            data-preview-field-path={`products[${index}].price`}
                            defaultValue={displayPrice}
                          />
                          {!isEditorPreview && (
                            <span
                              data-preview-field-path={`products[${index}].pricingLabel`}
                              className="block text-[10.5px] text-[var(--lux-text-muted)]"
                            >
                              {pricingLabel}
                            </span>
                          )}
                        </>
                      ) : (
                        <span
                          data-preview-static="product-price-on-request"
                          className="font-display inline-block text-xs font-bold uppercase tracking-[0.08em] text-[var(--lux-tropical)]"
                        >
                          Request a Quote
                        </span>
                      )}
                    </div>

                    <a
                      href={detailHref}
                      data-preview-static="Open the stable live product detail page"
                      className="lux-link-underline shrink-0"
                    >
                      Explore Tour →
                    </a>
                  </div>
                </div>
              </EditableCard>
            );
          })}
        </div>

        {/* Bottom Pricing Disclaimer + Prominent "View All Tours" CTA */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-[var(--lux-border)] pt-6 sm:flex-row sm:items-center">
          <EditableText
            as="p"
            className="m-0 max-w-xl text-xs leading-relaxed text-[var(--lux-text-muted)]"
            data-preview-field-path="home.productsPricingNote"
            defaultValue={
              contentText(home.productsPricingNote) ||
              'Displayed LKR rates are illustrative template guides. Configure verified rates in Fivora.'
            }
          />

          {hasMoreToShow && (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="lux-btn-tropical shrink-0"
            >
              <span data-preview-field-path="home.productsViewAllLabel">
                {showAll
                  ? 'Show Featured Only'
                  : contentText(home.productsViewAllLabel) || 'View All Tours'}
              </span>
              <span aria-hidden="true">{showAll ? '↑' : '→'}</span>
            </button>
          )}

          {isEditorPreview && (
            <span
              data-preview-field-path="home.productsViewAllLabel"
              className="lux-btn-tropical shrink-0"
            >
              {contentText(home.productsViewAllLabel) || 'View All Tours'}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

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
import {
  extractDaysCount,
  formatMoney,
  splitDelimitedItems,
  type TripEnquiryDraft,
} from '@/lib/travelHelpers';
import { Reveal } from '../Reveal';

interface TourPackagesSectionProps {
  externalRegionFilter: string;
  externalStyleFilter: string;
  externalDurationFilter: string;
  onResetExternalFilters: () => void;
  onEnquirePackage: (draft: TripEnquiryDraft) => void;
}

export function TourPackagesSection({
  externalRegionFilter,
  externalStyleFilter,
  externalDurationFilter,
  onResetExternalFilters,
  onEnquirePackage,
}: TourPackagesSectionProps) {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const home = contentObject(contentObject(siteData?.content).home);
  const products = useProducts();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const effectiveCategory = externalStyleFilter || (categoryFilter === 'All' ? '' : categoryFilter);
  const effectiveDuration = externalDurationFilter || durationFilter;

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => contentText((p as any).category)).filter(Boolean)))],
    [products],
  );

  const filteredEntries = useMemo(() => {
    const entries = products.map((rawProduct, index) => ({
      product: contentObject(rawProduct),
      index,
    }));

    if (isEditorPreview) return entries;

    return entries.filter(({ product }) => {
      if (effectiveCategory) {
        const cat = contentText(product.category).toLowerCase();
        if (cat !== effectiveCategory.toLowerCase()) return false;
      }
      if (externalRegionFilter) {
        const haystack = `${contentText(product.destinations)} ${contentText(product.name)} ${contentText(product.description)}`.toLowerCase();
        if (!haystack.includes(externalRegionFilter.toLowerCase())) return false;
      }
      if (effectiveDuration) {
        const days = extractDaysCount(contentText(product.duration));
        if (days !== null) {
          if (effectiveDuration === 'short' && days > 7) return false;
          if (effectiveDuration === 'medium' && (days < 8 || days > 10)) return false;
          if (effectiveDuration === 'long' && days < 11) return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const haystack = `${contentText(product.name)} ${contentText(product.destinations)} ${contentText(product.category)} ${contentText(product.description)}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [products, isEditorPreview, effectiveCategory, externalRegionFilter, effectiveDuration, searchQuery]);

  const hasActiveFilters = Boolean(
    effectiveCategory || externalRegionFilter || effectiveDuration || searchQuery.trim(),
  );

  const clearAllFilters = () => {
    setCategoryFilter('All');
    setDurationFilter('');
    setSearchQuery('');
    onResetExternalFilters();
  };

  return (
    <section
      id="packages"
      data-design-section="home-products"
      className="lux-section"
    >
      <div className="lux-container">
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <div className="mb-3">
              <EditableText
                as="span"
                className="lux-eyebrow"
                data-preview-field-path="home.productsEyebrow"
                defaultValue={contentText(home.productsEyebrow) || 'CURATED ITINERARIES'}
              />
            </div>
            <EditableText
              as="h2"
              variant="h2"
              className="font-editorial m-0 text-3xl font-medium text-[var(--lux-text)] sm:text-4xl lg:text-5xl"
              data-preview-field-path="home.productsHeading"
              defaultValue={contentText(home.productsHeading) || 'Signature Sri Lankan Journeys'}
            />
            <EditableText
              as="p"
              className="mt-4 text-base leading-relaxed text-[var(--lux-text-muted)]"
              data-preview-field-path="home.productsSummary"
              defaultValue={contentText(home.productsSummary)}
            />
          </div>
        </Reveal>

        {/* Live Storefront Filtering Bar */}
        {!isEditorPreview && products.length > 0 && (
          <div className="mb-10 flex flex-col gap-4 border-y border-[var(--lux-border)] py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected =
                  (cat === 'All' && !effectiveCategory) ||
                  effectiveCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    type="button"
                    data-preview-static="package-category-tab"
                    onClick={() => {
                      if (externalStyleFilter) onResetExternalFilters();
                      setCategoryFilter(cat);
                    }}
                    className={`min-h-[38px] border px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.11em] transition ${
                      isSelected
                        ? 'border-[#102D25] bg-[#102D25] text-[#F7F3EA] dark:border-[#C6A46A] dark:bg-[#C6A46A] dark:text-[#101917]'
                        : 'border-[var(--lux-border-strong)] bg-transparent text-[var(--lux-text-muted)] hover:border-[#C6A46A] hover:text-[var(--lux-text)]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                aria-label="Filter tours by duration"
                data-preview-static="package-duration-select"
                value={effectiveDuration}
                onChange={(e) => {
                  if (externalDurationFilter) onResetExternalFilters();
                  setDurationFilter(e.target.value);
                }}
                className="lux-select !min-h-[40px] sm:w-44"
              >
                <option value="">Any Duration</option>
                <option value="short">Up to 7 Days</option>
                <option value="medium">8 – 10 Days</option>
                <option value="long">11+ Days</option>
              </select>

              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destination or tour..."
                aria-label="Search tour packages"
                data-preview-static="package-search-input"
                className="lux-input !min-h-[40px] sm:w-56"
              />

              {hasActiveFilters && (
                <button
                  type="button"
                  data-preview-static="package-reset-filters"
                  onClick={clearAllFilters}
                  className="lux-btn-outline !min-h-[40px] !px-4 !text-xs"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Region Indicator */}
        {!isEditorPreview && externalRegionFilter && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border border-[#C6A46A]/45 bg-[#C6A46A]/10 px-4 py-3 text-sm">
            <span data-preview-static="package-region-filter-notice">
              Showing journeys featuring <strong>{externalRegionFilter}</strong>
            </span>
            <button
              type="button"
              data-preview-static="package-clear-region-btn"
              onClick={clearAllFilters}
              className="border-0 bg-transparent text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-forest)] underline"
            >
              Show all journeys
            </button>
          </div>
        )}

        {/* Tour Packages Grid */}
        <div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          data-preview-list-path="products"
        >
          {products.length === 0 && (
            <p
              data-preview-static="packages-empty-collection"
              className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-10 text-center text-sm text-[var(--lux-text-muted)]"
            >
              No tour packages configured yet. Add packages in Fivora to showcase your itineraries.
            </p>
          )}

          {products.length > 0 && filteredEntries.length === 0 && !isEditorPreview && (
            <div className="col-span-full flex flex-col items-center gap-4 border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
              <p data-preview-static="packages-no-match-title" className="font-editorial m-0 text-2xl text-[var(--lux-text)]">
                No Sample Itineraries Match That Exact Combination
              </p>
              <p data-preview-static="packages-no-match-body" className="m-0 max-w-lg text-sm text-[var(--lux-text-muted)]">
                Because every journey we arrange is privately crafted, we can still design this exact route for your dates.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  data-preview-static="packages-no-match-reset"
                  onClick={clearAllFilters}
                  className="lux-btn-outline"
                >
                  Show All Journeys
                </button>
                <button
                  type="button"
                  data-preview-static="packages-no-match-tailor"
                  onClick={() => {
                    onEnquirePackage({
                      destination: externalRegionFilter || searchQuery || undefined,
                      travelStyle: effectiveCategory || undefined,
                      duration: effectiveDuration || undefined,
                    });
                    document.getElementById('tailor-made')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="lux-btn-primary"
                >
                  Request Custom Route
                </button>
              </div>
            </div>
          )}

          {filteredEntries.map(({ product, index }) => {
            const productId =
              typeof product.id === 'string' || typeof product.id === 'number'
                ? product.id
                : null;
            const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0));
            const compareAt =
              typeof product.compareAtPrice === 'number'
                ? product.compareAtPrice
                : parseFloat(String(product.compareAtPrice || 0));
            const currency = contentText(product.currency) || 'USD';
            const badge = contentText(product.badge);
            const category = contentText(product.category);
            const duration = contentText(product.duration);
            const destinations = contentText(product.destinations);
            const travelStyle = contentText(product.travelStyle);
            const groupSize = contentText(product.groupSize);
            const highlights = contentText(product.highlights);
            const accommodation = contentText(product.accommodation);
            const inclusions = contentText(product.inclusions);
            const exclusions = contentText(product.exclusions);
            const itinerary = contentList(product.itinerary);

            const itemShowPrice =
              (product as any)?.showPrice !== undefined
                ? Boolean((product as any).showPrice)
                : (product as any)?.customData?.showPrice !== undefined
                  ? Boolean((product as any).customData.showPrice)
                  : true;

            const isRange = Boolean(
              (product as any)?.isPriceRange ||
                ((product as any)?.minPrice !== undefined &&
                  (product as any)?.maxPrice !== undefined &&
                  Number((product as any).maxPrice) > Number((product as any).minPrice)) ||
                contentText(product.priceRange),
            );

            let displayPrice = formatMoney(price, currency);
            if (isRange) {
              if (contentText(product.priceRange)) {
                displayPrice = contentText(product.priceRange);
              } else {
                const min = (product as any).minPrice !== undefined ? Number((product as any).minPrice) : price;
                const max = (product as any).maxPrice !== undefined ? Number((product as any).maxPrice) : price;
                displayPrice = `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`;
              }
            }

            const detailHref = platformProductDetailHref(productId);
            const highlightChips = splitDelimitedItems(highlights).slice(0, 3);

            return (
              <EditableCard
                key={productId ?? index}
                className="lux-card flex flex-col overflow-hidden !p-0"
                item={product as any}
                itemPath={`products[${index}]`}
                imageKey="__custom__"
                data-preview-item-path={`products[${index}]`}
                balance
                radius="md"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {/* Media */}
                <div className="lux-image-zoom relative aspect-[4/3] w-full overflow-hidden">
                  {isEditorPreview ? (
                    <EditableImage
                      src={contentText(product.imageUrl) || '/images/hero-sigiriya.webp'}
                      alt={contentText(product.name)}
                      data-preview-field-path={`products[${index}].imageUrl`}
                      fit="cover"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <a href={detailHref} className="block h-full w-full">
                      <EditableImage
                        src={contentText(product.imageUrl) || '/images/hero-sigiriya.webp'}
                        alt={contentText(product.name)}
                        data-preview-field-path={`products[${index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  )}

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" />

                  {(badge || isEditorPreview) && (
                    <span
                      data-preview-field-path={`products[${index}].badge`}
                      className="absolute left-3 top-3 z-10 bg-[#C6A46A] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#101917]"
                      style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                    >
                      {badge}
                    </span>
                  )}

                  {(duration || isEditorPreview) && (
                    <span
                      data-preview-field-path={`products[${index}].duration`}
                      className="absolute bottom-3 left-3 z-10 bg-[#102D25]/90 px-2.5 py-1 text-[11px] font-medium tracking-[0.06em] text-[#F7F3EA] backdrop-blur-sm"
                      style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                    >
                      {duration}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {(category || isEditorPreview) && (
                      <span
                        data-preview-field-path={`products[${index}].category`}
                        className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
                        style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                      >
                        {category}
                      </span>
                    )}
                    {(groupSize || isEditorPreview) && (
                      <span
                        data-preview-field-path={`products[${index}].groupSize`}
                        className="text-xs text-[var(--lux-text-muted)]"
                        style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                      >
                        {groupSize}
                      </span>
                    )}
                  </div>

                  {isEditorPreview ? (
                    <EditableText
                      as="h3"
                      className="font-editorial m-0 text-2xl font-medium text-[var(--lux-text)]"
                      data-preview-field-path={`products[${index}].name`}
                      defaultValue={contentText(product.name)}
                    />
                  ) : (
                    <a href={detailHref} className="text-inherit no-underline hover:underline">
                      <EditableText
                        as="h3"
                        className="font-editorial m-0 text-2xl font-medium text-[var(--lux-text)]"
                        data-preview-field-path={`products[${index}].name`}
                        defaultValue={contentText(product.name)}
                      />
                    </a>
                  )}

                  {(destinations || isEditorPreview) && (
                    <p
                      data-preview-field-path={`products[${index}].destinations`}
                      className="m-0 text-xs font-medium tracking-[0.03em] text-[var(--lux-teal)]"
                      style={{ minHeight: '1.2em' }}
                    >
                      {destinations}
                    </p>
                  )}

                  <EditableText
                    as="p"
                    className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                    data-preview-field-path={`products[${index}].description`}
                    defaultValue={contentText(product.description)}
                  />

                  {!isEditorPreview && highlightChips.length > 0 && (
                    <ul className="m-0 mt-1 flex list-none flex-col gap-1.5 p-0 text-xs text-[var(--lux-text-muted)]">
                      {highlightChips.map((chip, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2">
                          <span aria-hidden="true" className="mt-0.5 text-[#C6A46A]">✦</span>
                          <span data-preview-static="package-highlight-bullet">{chip}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Editor-only complete pricing + itinerary field bindings (keeps all product schema paths editable & visible on /) */}
                  {isEditorPreview && (
                    <div className="mt-2 space-y-3 rounded border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface-alt)] p-3.5 text-xs">
                      <div className="grid gap-1.5">
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
                          <span data-preview-static="product-price-range-enabled-label">Price range enabled: </span>
                          <span data-preview-field-path={`products[${index}].isPriceRange`}>
                            {String(product.isPriceRange ?? false)}
                          </span>
                        </div>
                        <div>
                          <span data-preview-static="product-min-price-label">Minimum price: </span>
                          <span data-preview-field-path={`products[${index}].minPrice`}>
                            {String(product.minPrice ?? 0)}
                          </span>
                        </div>
                        <div>
                          <span data-preview-static="product-max-price-label">Maximum price: </span>
                          <span data-preview-field-path={`products[${index}].maxPrice`}>
                            {String(product.maxPrice ?? 0)}
                          </span>
                        </div>
                        <div>
                          <span data-preview-static="product-price-range-label">Price range: </span>
                          <span data-preview-field-path={`products[${index}].priceRange`}>
                            {String(product.priceRange || 'Not set')}
                          </span>
                        </div>
                        <div>
                          <span data-preview-static="product-compare-at-price-label">Compare at price: </span>
                          <span data-preview-field-path={`products[${index}].compareAtPrice`}>
                            {compareAt}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-1.5 border-t border-[var(--lux-border)] pt-2.5">
                        <strong data-preview-static="product-details-settings-heading">Itinerary & detail fields</strong>
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
                          <span data-preview-static="product-inclusions-label">Inclusions: </span>
                          <span data-preview-field-path={`products[${index}].inclusions`}>{inclusions}</span>
                        </div>
                        <div>
                          <span data-preview-static="product-exclusions-label">Exclusions: </span>
                          <span data-preview-field-path={`products[${index}].exclusions`}>{exclusions}</span>
                        </div>
                      </div>

                      <div
                        data-preview-list-path={`products[${index}].itinerary`}
                        className="space-y-1.5 border-t border-[var(--lux-border)] pt-2.5"
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
                                className="mt-1 inline-block text-[11px] text-[var(--lux-teal)]"
                              >
                                {contentText(dayObj.stay)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pricing Footer */}
                  <div className="mt-auto border-t border-[var(--lux-border)] pt-4">
                    {itemShowPrice ? (
                      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                        <span
                          data-preview-static="package-price-prefix"
                          className="text-[11px] uppercase tracking-[0.14em] text-[var(--lux-text-muted)]"
                        >
                          Illustrative Guide
                        </span>
                        <div className="flex items-baseline gap-2">
                          <EditableText
                            as="span"
                            className="font-editorial text-xl font-semibold text-[var(--lux-forest)]"
                            data-preview-field-path={`products[${index}].price`}
                            defaultValue={displayPrice}
                          />
                          {compareAt > 0 && !isRange && (
                            isEditorPreview ? (
                              <span
                                data-preview-static="product-compare-at-price-display"
                                className="text-xs text-[var(--lux-text-muted)] line-through"
                              >
                                {formatMoney(compareAt, currency)}
                              </span>
                            ) : (
                              <EditableText
                                as="span"
                                className="text-xs text-[var(--lux-text-muted)] line-through"
                                data-preview-field-path={`products[${index}].compareAtPrice`}
                                defaultValue={formatMoney(compareAt, currency)}
                              />
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 flex items-center justify-between">
                        <span
                          data-preview-static="package-bespoke-prefix"
                          className="text-[11px] uppercase tracking-[0.14em] text-[var(--lux-text-muted)]"
                        >
                          Bespoke Quotation
                        </span>
                        <span
                          data-preview-static="product-price-on-request"
                          className="border border-[#C6A46A]/55 bg-[#C6A46A]/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--lux-forest)]"
                        >
                          Price on Request
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2.5">
                      <a
                        href={detailHref}
                        data-preview-static="Open the stable live product detail page"
                        className="lux-btn-primary !min-h-[42px] !px-3 !text-[11px]"
                      >
                        View Itinerary
                      </a>
                      <button
                        type="button"
                        data-preview-static="package-enquire-button"
                        onClick={() => {
                          onEnquirePackage({
                            packageName: contentText(product.name),
                            destination: destinations || undefined,
                            duration: duration || undefined,
                            travelStyle: category || undefined,
                          });
                          document.getElementById('tailor-made')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="lux-btn-outline !min-h-[42px] !px-3 !text-[11px]"
                      >
                        Enquire
                      </button>
                    </div>
                  </div>
                </div>
              </EditableCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

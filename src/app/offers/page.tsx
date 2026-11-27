'use client';

import { useEffect, useMemo, useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
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
  buildWhatsAppEnquiryUrl,
  formatCountdownParts,
  parseOfferDeadline,
  saveTripEnquiryDraft,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

export default function OffersPage() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const products = useProducts();
  const content = contentObject(siteData?.content);
  const page = contentObject(content.offersPage);
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
  const hasPlanner = selectedPages.includes('plan_your_trip');
  const plannerTarget = hasPlanner ? '/plan-your-trip/' : '/#tailor-made';

  // Hydration-safe clock: null during SSR and first paint, populated on mount.
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    if (isEditorPreview) return;
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isEditorPreview]);

  const defaultExpiredNotice =
    contentText(page.expiredNotice) ||
    'This seasonal offer window has concluded — contact our team for current travel rates.';

  const productById = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    products.forEach((raw) => {
      const p = contentObject(raw);
      const id = contentText(p.id);
      if (id) map.set(id, p);
    });
    return map;
  }, [products]);

  const offers = useMemo(
    () =>
      contentList(home.seasonalOffers).map((raw, idx) => {
        const item = contentObject(raw);
        const expiryDate = contentText(item.expiryDate);
        const targetTs = parseOfferDeadline(expiryDate);
        const remainingSec =
          targetTs !== null && nowMs !== null ? Math.floor((targetTs - nowMs) / 1000) : null;
        const isExpired = remainingSec !== null && remainingSec <= 0;
        return {
          index: idx,
          id: contentText(item.id) || `offer-${idx}`,
          title: contentText(item.title),
          category: contentText(item.category),
          discountLabel: contentText(item.discountLabel),
          description: contentText(item.description),
          imageUrl: contentText(item.imageUrl) || '/images/hero-tea.webp',
          imageAlt: contentText(item.imageAlt),
          currency: contentText(item.currency) || 'LKR',
          priceLabel: contentText(item.priceLabel),
          travelWindow: contentText(item.travelWindow),
          terms: contentText(item.terms),
          expiryDate,
          expiryMessage: contentText(item.expiryMessage),
          relatedPackageId: contentText(item.relatedPackageId),
          ctaLabel: contentText(item.ctaLabel) || 'Enquire Offer',
          targetTs,
          remainingSec,
          isExpired,
        };
      }),
    [home.seasonalOffers, nowMs],
  );

  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    offers.forEach((o) => {
      if (o.category) cats.add(o.category);
    });
    return ['All', ...Array.from(cats)];
  }, [offers]);

  const expiredCount = offers.filter((o) => o.isExpired).length;
  const featuredOffer =
    !isEditorPreview && selectedCategory === 'All'
      ? offers.find((o) => !o.isExpired) ?? null
      : null;

  const filteredOffers = useMemo(() => {
    if (isEditorPreview) return offers;
    return offers.filter((offer) => {
      if (!showExpired && offer.isExpired) return false;
      if (selectedCategory !== 'All' && offer.category !== selectedCategory) return false;
      return true;
    });
  }, [offers, isEditorPreview, showExpired, selectedCategory]);

  const handleEnquireOffer = (offer?: (typeof offers)[number]) => {
    if (offer) {
      const lowerCat = offer.category.toLowerCase();
      saveTripEnquiryDraft({
        travelType: lowerCat.includes('outbound')
          ? 'Outbound'
          : lowerCat.includes('avurudu') || lowerCat.includes('weekend')
            ? 'Domestic'
            : undefined,
        offerName: offer.title,
        travelStyle: offer.category || undefined,
        currency: offer.currency || 'LKR',
        sourceLabel: `Special Offer: ${offer.title}`,
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
    `Hello ${brandName}, I would like to enquire about your current seasonal travel offers.`,
  );

  const bannerImageUrl = contentText(page.bannerImageUrl) || '/images/hero-tea.webp';
  const bannerImageAlt =
    contentText(page.bannerImageAlt) || contentText(page.heading) || 'Seasonal Sri Lanka travel offers';

  return (
    <div data-preview-page-key="offers">
      {/* Compact Promotional Hero */}
      <section
        data-design-section="offers-hero"
        className="relative isolate flex min-h-[38vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={bannerImageUrl}
            alt={bannerImageAlt}
            data-preview-field-path="offersPage.bannerImageUrl"
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
              data-preview-static="offers-breadcrumb-home"
              className="text-[#FAF8F3]/80 no-underline transition hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <EditableText
              as="span"
              color="#C5A46D"
              className="font-semibold text-[#C5A46D]"
              data-preview-field-path="offersPage.breadcrumbLabel"
              defaultValue={contentText(page.breadcrumbLabel) || 'Special Offers'}
            />
          </div>

          <div className="max-w-3xl">
            <div className="mb-2.5">
              <EditableText
                as="span"
                color="#C5A46D"
                className="lux-eyebrow !text-[#C5A46D]"
                data-preview-field-path="offersPage.eyebrow"
                defaultValue={contentText(page.eyebrow) || 'SPECIAL OFFERS'}
              />
            </div>

            <EditableText
              as="h1"
              variant="h1"
              color="#FAF8F3"
              className="font-display m-0 mb-2.5 text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#FAF8F3] sm:text-4xl lg:text-5xl"
              data-preview-field-path="offersPage.heading"
              defaultValue={contentText(page.heading) || 'Seasonal Escapes & Holiday Deals'}
            />

            <EditableText
              as="p"
              color="#E8DDC8"
              className="m-0 mb-2 text-base font-medium text-[#E8DDC8] sm:text-lg"
              data-preview-field-path="offersPage.subtitle"
              defaultValue={contentText(page.subtitle)}
            />

            <EditableText
              as="p"
              color="rgba(250, 248, 243, 0.8)"
              className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/80"
              data-preview-field-path="offersPage.description"
              defaultValue={contentText(page.description)}
            />

            {isEditorPreview && (
              <div className="mt-3 space-y-1 rounded border border-dashed border-white/25 bg-[#101820]/65 px-3 py-2 text-[11px] text-[#A3B0BA]">
                <div>
                  <span data-preview-static="offers-hero-alt-label">Hero alt: </span>
                  <span data-preview-field-path="offersPage.bannerImageAlt">{bannerImageAlt}</span>
                </div>
                <div>
                  <span data-preview-static="offers-featured-label-editor">Featured badge: </span>
                  <span data-preview-field-path="offersPage.featuredLabel">
                    {contentText(page.featuredLabel) || 'Featured Seasonal Offer'}
                  </span>
                </div>
                <div>
                  <span data-preview-static="offers-expired-notice-editor">Default expired notice: </span>
                  <span data-preview-field-path="offersPage.expiredNotice">{defaultExpiredNotice}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Seasonal Offer Spotlight (Live Storefront) */}
      {!isEditorPreview && featuredOffer && (
        <section className="border-b border-[var(--lux-border)] bg-[var(--lux-surface-alt)] py-10" data-design-section="offers-featured">
          <div className="lux-container">
            <div className="grid grid-cols-1 overflow-hidden rounded-[6px] border border-[var(--lux-border-strong)] bg-[#101820] text-[#FAF8F3] shadow-[var(--lux-shadow-md)] lg:grid-cols-12">
              <div className="relative aspect-[16/10] overflow-hidden lg:col-span-6 lg:aspect-auto">
                <img
                  src={withBasePath(featuredOffer.imageUrl)}
                  alt={featuredOffer.imageAlt || featuredOffer.title}
                  data-preview-static="offers-featured-img"
                  className="h-full w-full object-cover"
                />
                <span
                  data-preview-field-path="offersPage.featuredLabel"
                  className="font-display absolute left-4 top-4 rounded bg-[#FF783D] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white"
                >
                  {contentText(page.featuredLabel) || 'Featured Seasonal Offer'}
                </span>
              </div>

              <div className="flex flex-col justify-center gap-3.5 p-6 sm:p-8 lg:col-span-6">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C5A46D]">
                  <span data-preview-static="offers-featured-cat">{featuredOffer.category}</span>
                  {featuredOffer.discountLabel && (
                    <>
                      <span aria-hidden="true" className="text-white/35">·</span>
                      <span data-preview-static="offers-featured-badge">{featuredOffer.discountLabel}</span>
                    </>
                  )}
                </div>

                <h2 data-preview-static="offers-featured-title" className="font-display m-0 text-2xl font-bold text-[#FAF8F3] sm:text-3xl">
                  {featuredOffer.title}
                </h2>

                <p data-preview-static="offers-featured-desc" className="m-0 text-sm leading-relaxed text-[#A3B0BA]">
                  {featuredOffer.description}
                </p>

                {featuredOffer.travelWindow && (
                  <p data-preview-static="offers-featured-window" className="m-0 text-xs font-medium text-[#E8DDC8]">
                    {featuredOffer.travelWindow}
                  </p>
                )}

                {/* Honest Hydration-Safe Countdown (Actual Merchant Deadline Only) */}
                {featuredOffer.targetTs !== null && (
                  <div className="pt-1">
                    {featuredOffer.remainingSec !== null && featuredOffer.remainingSec > 0 ? (
                      (() => {
                        const parts = formatCountdownParts(featuredOffer.remainingSec);
                        return (
                          <div
                            role="timer"
                            aria-live="off"
                            className="grid max-w-xs grid-cols-4 gap-2 text-center"
                          >
                            {(
                              [
                                ['Days', parts.days],
                                ['Hrs', parts.hours],
                                ['Min', parts.minutes],
                                ['Sec', parts.seconds],
                              ] as const
                            ).map(([label, val]) => (
                              <div
                                key={label}
                                className="rounded border border-white/15 bg-white/5 px-2 py-2"
                              >
                                <span
                                  data-preview-static={`featured-cd-val-${label.toLowerCase()}`}
                                  className="font-display block text-lg font-bold tabular-nums text-[#FAF8F3]"
                                >
                                  {val}
                                </span>
                                <span
                                  data-preview-static={`featured-cd-lbl-${label.toLowerCase()}`}
                                  className="block text-[9.5px] uppercase tracking-[0.14em] text-[#C5A46D]"
                                >
                                  {label}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    ) : (
                      <p data-preview-static="offers-featured-deadline-note" className="m-0 text-xs text-[#C5A46D]">
                        Offer valid until {featuredOffer.expiryDate.slice(0, 10)}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pt-4">
                  <div>
                    <span data-preview-static="offers-featured-price" className="font-display block text-lg font-bold text-[#C5A46D]">
                      {featuredOffer.priceLabel}
                    </span>
                    <span data-preview-static="offers-featured-price-hint" className="block text-[11px] text-[#A3B0BA]">
                      Illustrative sample guide · Confirmed on inquiry
                    </span>
                  </div>

                  <button
                    type="button"
                    data-preview-static="offers-featured-cta"
                    onClick={() => handleEnquireOffer(featuredOffer)}
                    className="lux-btn-sunset"
                  >
                    {featuredOffer.ctaLabel} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Bar & All Seasonal Offers Grid */}
      <section className="lux-section bg-[var(--lux-bg)]" data-design-section="offers-list">
        <div className="lux-container">
          {!isEditorPreview && offers.length > 0 && (
            <div className="mb-8 flex flex-col gap-4 border-b border-[var(--lux-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {categoryOptions.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      data-preview-static="offers-category-filter"
                      aria-pressed={active}
                      onClick={() => setSelectedCategory(cat)}
                      className={`min-h-[38px] rounded border px-3.5 py-1 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-[var(--brand-secondary,#154C42)] bg-[var(--brand-secondary,#154C42)] text-[#FAF8F3] dark:border-[var(--brand-accent,#FF783D)] dark:bg-[var(--brand-accent,#FF783D)] dark:text-white'
                          : 'border-[var(--lux-border-strong)] bg-transparent text-[var(--lux-text-muted)] hover:border-[var(--brand-accent,#FF783D)] hover:text-[var(--lux-text)]'
                      }`}
                    >
                      {cat === 'All' ? 'All Offers' : cat}
                    </button>
                  );
                })}
              </div>

              {expiredCount > 0 && (
                <button
                  type="button"
                  data-preview-static="offers-toggle-expired"
                  onClick={() => setShowExpired((prev) => !prev)}
                  className="lux-btn-outline !min-h-[36px] !px-3.5 !text-[11px]"
                >
                  {showExpired ? 'Hide Ended Offers' : `Show Ended Offers (${expiredCount})`}
                </button>
              )}
            </div>
          )}

          {/* Offers Grid */}
          <div
            data-preview-list-path="home.seasonalOffers"
            className="grid grid-cols-1 gap-7 md:grid-cols-2"
          >
            {offers.length === 0 && (
              <div className="col-span-full rounded-[6px] border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="offers-empty-title" className="font-display m-0 mb-1.5 text-lg font-bold text-[var(--lux-text)]">
                  No Seasonal Offers Available Right Now
                </p>
                <p data-preview-static="offers-empty-body" className="m-0 text-sm text-[var(--lux-text-muted)]">
                  We still tailor domestic, inbound, and outbound itineraries year-round. Contact our team for a custom quotation.
                </p>
              </div>
            )}

            {offers.length > 0 && filteredOffers.length === 0 && !isEditorPreview && (
              <div className="col-span-full rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="offers-no-active-title" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                  No Active Offers in This Category
                </p>
                <p data-preview-static="offers-no-active-body" className="m-0 mb-5 text-sm text-[var(--lux-text-muted)]">
                  All offers in this category may have concluded or belong to another seasonal window.
                </p>
                <button
                  type="button"
                  data-preview-static="offers-no-active-reset"
                  onClick={() => {
                    setSelectedCategory('All');
                    setShowExpired(true);
                  }}
                  className="lux-btn-outline !min-h-[40px]"
                >
                  View All Campaigns
                </button>
              </div>
            )}

            {filteredOffers.map((offer) => {
              const parts =
                !offer.isExpired && offer.remainingSec !== null && offer.remainingSec > 0
                  ? formatCountdownParts(offer.remainingSec)
                  : null;
              const matchedPackage = offer.relatedPackageId
                ? productById.get(offer.relatedPackageId)
                : undefined;

              return (
                <article
                  key={offer.id || offer.index}
                  data-preview-item-path={`home.seasonalOffers[${offer.index}]`}
                  className={`flex flex-col overflow-hidden rounded-[6px] border bg-[var(--lux-surface)] transition-shadow duration-300 hover:shadow-[var(--lux-shadow-md)] ${
                    offer.isExpired
                      ? 'border-[var(--lux-border)] opacity-80'
                      : 'border-[var(--lux-border-strong)]'
                  }`}
                >
                  <div className="lux-image-zoom relative aspect-[16/9] w-full overflow-hidden bg-[#101820]">
                    <EditableImage
                      src={offer.imageUrl}
                      alt={offer.imageAlt || offer.title}
                      data-preview-field-path={`home.seasonalOffers[${offer.index}].imageUrl`}
                      fit="cover"
                      className="h-full w-full object-cover"
                    />
                    {offer.discountLabel && (
                      <span
                        data-preview-field-path={`home.seasonalOffers[${offer.index}].discountLabel`}
                        className="font-display absolute left-3 top-3 rounded bg-[#101820]/88 px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-[#C5A46D] backdrop-blur-sm"
                      >
                        {offer.discountLabel}
                      </span>
                    )}
                    {offer.isExpired && !isEditorPreview && (
                      <span
                        data-preview-static="offer-card-ended-pill"
                        className="font-display absolute right-3 top-3 rounded bg-[#101820]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#FAF8F3]"
                      >
                        Offer Ended
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-bold uppercase tracking-[0.15em]">
                      <span
                        data-preview-field-path={`home.seasonalOffers[${offer.index}].category`}
                        className="text-[var(--lux-tropical)]"
                      >
                        {offer.category}
                      </span>
                      <span
                        data-preview-field-path={`home.seasonalOffers[${offer.index}].currency`}
                        className="text-[var(--lux-gold-deep)] dark:text-[#C5A46D]"
                      >
                        {offer.currency}
                      </span>
                    </div>

                    <EditableText
                      as="h2"
                      className="font-display m-0 text-xl font-bold leading-snug text-[var(--lux-text)]"
                      data-preview-field-path={`home.seasonalOffers[${offer.index}].title`}
                      defaultValue={offer.title}
                    />

                    <EditableText
                      as="p"
                      className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path={`home.seasonalOffers[${offer.index}].description`}
                      defaultValue={offer.description}
                    />

                    {offer.travelWindow && (
                      <p
                        data-preview-field-path={`home.seasonalOffers[${offer.index}].travelWindow`}
                        className="m-0 text-xs font-medium text-[var(--lux-teal)]"
                      >
                        {offer.travelWindow}
                      </p>
                    )}

                    {/* Countdown / Validity Status */}
                    <div className="rounded border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] px-3.5 py-2.5 text-xs">
                      {offer.isExpired && !isEditorPreview ? (
                        <p data-preview-static="offer-card-expired-msg" className="m-0 font-medium text-[var(--lux-text-muted)]">
                          {offer.expiryMessage || defaultExpiredNotice}
                        </p>
                      ) : offer.targetTs !== null ? (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[var(--lux-text-muted)]">
                            <span data-preview-static="offer-valid-prefix">Offer window until </span>
                            <strong
                              data-preview-field-path={`home.seasonalOffers[${offer.index}].expiryDate`}
                              className="text-[var(--lux-text)]"
                            >
                              {offer.expiryDate.slice(0, 10)}
                            </strong>
                          </span>
                          {parts && (
                            <span
                              role="timer"
                              aria-live="off"
                              data-preview-static="offer-card-countdown"
                              className="font-display rounded bg-[#154C42] px-2 py-0.5 text-[11px] font-bold tabular-nums text-[#FAF8F3]"
                            >
                              {parts.days}d {parts.hours}h {parts.minutes}m
                            </span>
                          )}
                        </div>
                      ) : (
                        <span data-preview-static="offer-open-window" className="text-[var(--lux-text-muted)]">
                          Seasonal window — confirm current availability on inquiry
                        </span>
                      )}
                    </div>

                    {offer.terms && (
                      <p
                        data-preview-field-path={`home.seasonalOffers[${offer.index}].terms`}
                        className="m-0 text-[11.5px] leading-relaxed text-[var(--lux-text-muted)]"
                      >
                        {offer.terms}
                      </p>
                    )}

                    <div className="mt-auto space-y-3 border-t border-[var(--lux-border)] pt-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span
                          data-preview-field-path={`home.seasonalOffers[${offer.index}].priceLabel`}
                          className="font-display text-base font-bold text-[var(--lux-text)]"
                        >
                          {offer.priceLabel}
                        </span>
                        <span
                          data-preview-static="offer-illustrative-tag"
                          className="text-[11px] text-[var(--lux-text-muted)]"
                        >
                          Illustrative guide · Quote confirmed
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {matchedPackage ? (
                          <a
                            href={platformProductDetailHref(offer.relatedPackageId)}
                            data-preview-static="offer-related-pkg-link"
                            className="lux-link-underline"
                          >
                            View Related Package →
                          </a>
                        ) : (
                          <span />
                        )}

                        <button
                          type="button"
                          onClick={() => handleEnquireOffer(offer)}
                          disabled={offer.isExpired && !isEditorPreview}
                          className={`!min-h-[38px] !px-4 !text-[11px] ${
                            offer.isExpired && !isEditorPreview
                              ? 'lux-btn-outline cursor-not-allowed opacity-60'
                              : 'lux-btn-sunset'
                          }`}
                        >
                          <span data-preview-field-path={`home.seasonalOffers[${offer.index}].ctaLabel`}>
                            {offer.isExpired && !isEditorPreview ? 'Offer Ended' : offer.ctaLabel}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pricing & Availability Disclaimer */}
          <div className="mt-8 rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-4">
            <EditableText
              as="p"
              className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]"
              data-preview-field-path="offersPage.pricingDisclaimer"
              defaultValue={
                contentText(page.pricingDisclaimer) ||
                'All offer rates shown are illustrative sample guides subject to live seasonal availability and confirmed quotation.'
              }
            />
          </div>
        </div>
      </section>

      {/* Bottom Custom Quotation CTA */}
      <section className="lux-section lux-section-tropical" data-design-section="offers-cta">
        <div className="lux-container">
          <Reveal variant="fade-up">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <EditableText
                  as="h2"
                  color="#FAF8F3"
                  className="font-display m-0 mb-2 text-2xl font-bold text-[#FAF8F3] sm:text-3xl"
                  data-preview-field-path="offersPage.ctaHeading"
                  defaultValue={contentText(page.ctaHeading) || 'Want a Custom Quotation Around Your Dates?'}
                />
                <EditableText
                  as="p"
                  color="rgba(250, 248, 243, 0.82)"
                  className="m-0 text-sm leading-relaxed text-[#FAF8F3]/82 sm:text-base"
                  data-preview-field-path="offersPage.ctaBody"
                  defaultValue={contentText(page.ctaBody)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleEnquireOffer()}
                  className="lux-btn-sunset"
                >
                  <span data-preview-field-path="offersPage.ctaLabel">
                    {contentText(page.ctaLabel) || 'Build Your Custom Trip'}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="offers-bottom-whatsapp-cta"
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

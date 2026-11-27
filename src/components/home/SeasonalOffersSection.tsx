'use client';

import { useEffect, useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import {
  formatCountdownParts,
  parseOfferDeadline,
  sanitizeHref,
  saveTripEnquiryDraft,
  type TripEnquiryDraft,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '../Reveal';

interface SeasonalOffersSectionProps {
  onEnquireOffer: (draft: TripEnquiryDraft) => void;
}

export function SeasonalOffersSection({ onEnquireOffer }: SeasonalOffersSectionProps) {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const home = contentObject(contentObject(siteData?.content).home);

  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    if (isEditorPreview) return;
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isEditorPreview]);

  const selectedPages = Array.isArray(siteData?.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData?.template?.structure?.pages || [
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
  const hasOffers = selectedPages.includes('offers');
  const hasPlanner = selectedPages.includes('plan_your_trip');

  const offers = contentList(home.seasonalOffers).map((raw, idx) => {
    const item = contentObject(raw);
    return {
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
      expiryDate: contentText(item.expiryDate),
      expiryMessage: contentText(item.expiryMessage),
      ctaLabel: contentText(item.ctaLabel) || 'Enquire Offer',
      ctaUrl: contentText(item.ctaUrl) || '/#tailor-made',
    };
  });

  const resolveOfferHref = (rawUrl: string) => {
    const clean = sanitizeHref(rawUrl) || '/#tailor-made';
    if (!hasPlanner && clean.includes('/plan-your-trip')) return '/#tailor-made';
    if (!hasOffers && clean.includes('/offers')) return '/#offers';
    return clean;
  };

  // Maximum 2 featured offers on live homepage by default (full offer list editable in Fivora preview)
  const rawLimit = Number(home.featuredOffersCount);
  const featuredLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(2, Math.round(rawLimit)) : 2;
  const visibleOffers = isEditorPreview ? offers : offers.slice(0, featuredLimit);

  return (
    <section
      id="offers"
      data-design-section="home-offers"
      className="lux-section lux-section-tropical relative overflow-hidden"
    >
      <div className="lux-container">
        <Reveal variant="fade-up">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <div className="mb-2.5">
                <EditableText
                  as="span"
                  color="#C5A46D"
                  className="lux-eyebrow !text-[#C5A46D]"
                  data-preview-field-path="home.offersEyebrow"
                  defaultValue={contentText(home.offersEyebrow) || 'SPECIAL OFFERS'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                color="#FAF8F3"
                className="font-display m-0 text-2xl font-bold tracking-[-0.025em] text-[#FAF8F3] sm:text-3xl lg:text-[2.25rem]"
                data-preview-field-path="home.offersHeading"
                defaultValue={contentText(home.offersHeading) || 'Seasonal Holiday Escapes'}
              />
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <EditableText
                as="p"
                color="rgba(250, 248, 243, 0.78)"
                className="m-0 max-w-md text-xs leading-relaxed text-[#FAF8F3]/78 sm:text-sm lg:text-right"
                data-preview-field-path="home.offersSummary"
                defaultValue={contentText(home.offersSummary)}
              />
              {!isEditorPreview && hasOffers && (
                <a
                  href={withBasePath('/offers/')}
                  data-preview-static="offers-view-all-link"
                  className="lux-btn-outline-light !min-h-[38px] !px-4 !text-[11px]"
                >
                  View All Special Offers →
                </a>
              )}
            </div>
          </div>
        </Reveal>

        {/* Two Side-by-Side Editorial Offer Compositions */}
        <div
          data-preview-list-path="home.seasonalOffers"
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {offers.length === 0 && (
            <p
              data-preview-static="seasonal-offers-empty"
              className="col-span-full rounded border border-dashed border-white/30 p-8 text-center text-sm text-[#FAF8F3]/80"
            >
              No seasonal offers configured yet. Add offers in Fivora.
            </p>
          )}

          {visibleOffers.map((offer, index) => {
            const href = resolveOfferHref(offer.ctaUrl);
            const targetTs = parseOfferDeadline(offer.expiryDate);
            const remainingSec =
              targetTs !== null && nowMs !== null ? Math.floor((targetTs - nowMs) / 1000) : null;
            const isExpired = remainingSec !== null && remainingSec <= 0;
            const parts =
              !isExpired && remainingSec !== null ? formatCountdownParts(remainingSec) : null;

            return (
              <article
                key={index}
                data-preview-item-path={`home.seasonalOffers[${index}]`}
                className="group grid grid-cols-1 overflow-hidden rounded-[6px] border border-white/15 bg-[#101820]/50 sm:grid-cols-12"
              >
                <div className="lux-image-zoom relative aspect-[16/10] overflow-hidden bg-[#101820] sm:col-span-5 sm:aspect-auto">
                  <EditableImage
                    src={offer.imageUrl}
                    alt={offer.imageAlt || offer.title}
                    data-preview-field-path={`home.seasonalOffers[${index}].imageUrl`}
                    fit="cover"
                    className="h-full w-full object-cover"
                  />
                  {(offer.discountLabel || isEditorPreview) && (
                    <span
                      data-preview-field-path={`home.seasonalOffers[${index}].discountLabel`}
                      className="font-display absolute left-3 top-3 rounded bg-[#101820]/85 px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-[#C5A46D] backdrop-blur-sm"
                    >
                      {offer.discountLabel}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2.5 p-5 sm:col-span-7 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#C5A46D]">
                    <span data-preview-field-path={`home.seasonalOffers[${index}].category`}>
                      {offer.category}
                    </span>
                    <span data-preview-field-path={`home.seasonalOffers[${index}].currency`}>
                      {offer.currency}
                    </span>
                  </div>

                  <EditableText
                    as="h3"
                    color="#FAF8F3"
                    className="font-display m-0 text-lg font-bold leading-snug text-[#FAF8F3] sm:text-xl"
                    data-preview-field-path={`home.seasonalOffers[${index}].title`}
                    defaultValue={offer.title}
                  />

                  <EditableText
                    as="p"
                    color="rgba(250, 248, 243, 0.8)"
                    className="m-0 text-xs leading-relaxed text-[#FAF8F3]/80 sm:text-[13px]"
                    data-preview-field-path={`home.seasonalOffers[${index}].description`}
                    defaultValue={offer.description}
                  />

                  {isEditorPreview && (
                    <div className="space-y-1 rounded border border-dashed border-white/20 p-2 text-[11px] text-[#FAF8F3]/80">
                      <div>
                        <span data-preview-static="offer-window-label">Travel window: </span>
                        <span data-preview-field-path={`home.seasonalOffers[${index}].travelWindow`}>
                          {offer.travelWindow}
                        </span>
                      </div>
                      <div>
                        <span data-preview-static="offer-expiry-msg-label">Expiry message: </span>
                        <span data-preview-field-path={`home.seasonalOffers[${index}].expiryMessage`}>
                          {offer.expiryMessage}
                        </span>
                      </div>
                      <div>
                        <span data-preview-static="offer-alt-label">Alt: </span>
                        <span data-preview-field-path={`home.seasonalOffers[${index}].imageAlt`}>
                          {offer.imageAlt || offer.title}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Expiry / Countdown Row */}
                  <div className="pt-0.5">
                    {isEditorPreview ? (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#FAF8F3]/85">
                        <span data-preview-static="offer-expiry-editor-label">Expires (ISO):</span>
                        <span
                          data-preview-field-path={`home.seasonalOffers[${index}].expiryDate`}
                          className="font-semibold text-[#C5A46D]"
                        >
                          {offer.expiryDate || 'Not set'}
                        </span>
                      </div>
                    ) : isExpired ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          data-preview-static="offer-expired-badge"
                          className="rounded border border-white/25 bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-[#FAF8F3]"
                        >
                          Offer ended
                        </span>
                        <span
                          data-preview-field-path={`home.seasonalOffers[${index}].expiryDate`}
                          className="text-[11px] text-[#A3B0BA]"
                        >
                          {offer.expiryDate.slice(0, 10)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
                        {parts && (
                          <span
                            role="timer"
                            aria-live="off"
                            data-preview-static="offer-timer-inline"
                            className="font-display rounded bg-[#101820]/70 px-2 py-0.5 font-bold tabular-nums text-[#FAF8F3]"
                          >
                            {parts.days}d {parts.hours}h {parts.minutes}m
                          </span>
                        )}
                        <span className="text-[#FAF8F3]/75">
                          <span data-preview-static="offer-ends-prefix">Until </span>
                          <span data-preview-field-path={`home.seasonalOffers[${index}].expiryDate`}>
                            {offer.expiryDate ? offer.expiryDate.slice(0, 10) : 'Seasonal'}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  <p
                    data-preview-field-path={`home.seasonalOffers[${index}].terms`}
                    className="m-0 text-[11px] text-[#FAF8F3]/65"
                  >
                    {offer.terms}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/12 pt-3">
                    <span
                      data-preview-field-path={`home.seasonalOffers[${index}].priceLabel`}
                      className="font-display text-sm font-bold text-[#C5A46D]"
                    >
                      {offer.priceLabel}
                    </span>

                    <a
                      href={withBasePath(href)}
                      data-preview-field-path={`home.seasonalOffers[${index}].ctaUrl`}
                      onClick={(e) => {
                        if (isEditorPreview) return;
                        if (href.includes('/plan-your-trip')) {
                          saveTripEnquiryDraft({
                            offerName: offer.title,
                            travelStyle: offer.category || undefined,
                            currency: offer.currency || 'LKR',
                            sourceLabel: `Special Offer: ${offer.title}`,
                          });
                        } else if (href === '/#tailor-made') {
                          e.preventDefault();
                          onEnquireOffer({
                            offerName: offer.title,
                            travelStyle: offer.category || undefined,
                          });
                          document.getElementById('tailor-made')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="lux-btn-sunset !min-h-[36px] !px-4 !text-[11px]"
                    >
                      <span data-preview-field-path={`home.seasonalOffers[${index}].ctaLabel`}>
                        {offer.ctaLabel}
                      </span>
                      <span aria-hidden="true">→</span>
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

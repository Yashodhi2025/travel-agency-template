'use client';

import { useState, type KeyboardEvent } from 'react';
import { EditableIcon, EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { sanitizeHref } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '../Reveal';

const FALLBACK_ICONS = ['map-pin', 'navigation', 'wallet', 'phone', 'car', 'calendar'];

export function TestimonialsAndTrustSection() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const home = contentObject(contentObject(siteData?.content).home);

  const features = contentList(home.features).map((raw, idx) => {
    const item = contentObject(raw);
    return {
      icon: contentText(item.icon) || FALLBACK_ICONS[idx % FALLBACK_ICONS.length],
      title: contentText(item.title),
      body: contentText(item.body),
    };
  });

  const testimonials = contentList(home.testimonials).map((raw) => {
    const item = contentObject(raw);
    return {
      name: contentText(item.name),
      country: contentText(item.country),
      journey: contentText(item.journey),
      quote: contentText(item.quote),
      rating: typeof item.rating === 'number' && Number.isFinite(item.rating) ? item.rating : 5,
      imageUrl: contentText(item.imageUrl) || '/images/hero-tea.webp',
      imageAlt: contentText(item.imageAlt),
    };
  });

  // Preserved datasets for Stage 3 dedicated pages (visible & editable in Fivora Editor Preview)
  const travelTips = contentList(home.travelTips).map((raw) => {
    const item = contentObject(raw);
    return {
      title: contentText(item.title),
      body: contentText(item.body),
    };
  });

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
  const hasJournal = selectedPages.includes('journal');

  const journalPosts = contentList(home.journalPosts).map((raw) => {
    const item = contentObject(raw);
    return {
      title: contentText(item.title),
      category: contentText(item.category),
      readingTime: contentText(item.readingTime),
      excerpt: contentText(item.excerpt),
      intro: contentText(item.intro),
      sections: contentList(item.sections),
      practicalTips: contentText(item.practicalTips),
      imageUrl: contentText(item.imageUrl) || '/images/hero-coast.webp',
      imageAlt: contentText(item.imageAlt),
      date: contentText(item.date),
      author: contentText(item.author),
      ctaLabel: contentText(item.ctaLabel) || 'Read Article',
      ctaUrl: contentText(item.ctaUrl) || '/#tailor-made',
    };
  });

  const faqs = contentList(home.faqs).map((raw) => {
    const item = contentObject(raw);
    return {
      question: contentText(item.question),
      answer: contentText(item.answer),
    };
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const count = testimonials.length;
  const safeSlide = count > 0 ? ((activeSlide % count) + count) % count : 0;
  const activeItem = count > 0 ? testimonials[safeSlide] : null;

  const handleSliderKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (count <= 1) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActiveSlide((prev) => (prev + 1) % count);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActiveSlide((prev) => (prev - 1 + count) % count);
    }
  };

  return (
    <section
      id="stories"
      data-design-section="home-testimonials"
      onKeyDown={handleSliderKeyDown}
      className="lux-section lux-section-alt border-b border-[var(--lux-border)]"
    >
      <div className="lux-container">
        {/* Part 1: Compact Trust Pillars (no heavy boxed cards, zero fabricated awards or stats) */}
        <div id="why-us" data-design-section="home-features" className="pb-12">
          <Reveal variant="fade-up">
            <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <div className="mb-2">
                  <EditableText
                    as="span"
                    className="lux-eyebrow-tropical"
                    data-preview-field-path="home.featuresEyebrow"
                    defaultValue={contentText(home.featuresEyebrow) || 'WHY TRAVEL WITH US'}
                  />
                </div>
                <EditableText
                  as="h2"
                  variant="h2"
                  className="font-display m-0 text-2xl font-bold tracking-[-0.025em] text-[var(--lux-text)] sm:text-3xl"
                  data-preview-field-path="home.featuresHeading"
                  defaultValue={contentText(home.featuresHeading) || 'Thoughtful Planning Without the Rush'}
                />
              </div>

              <EditableText
                as="p"
                className="m-0 max-w-md text-sm leading-relaxed text-[var(--lux-text-muted)]"
                data-preview-field-path="home.featuresSummary"
                defaultValue={contentText(home.featuresSummary)}
              />
            </div>
          </Reveal>

          <div
            data-preview-list-path="home.features"
            className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.length === 0 && (
              <p
                data-preview-static="features-empty-state"
                className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-6 text-center text-sm text-[var(--lux-text-muted)]"
              >
                No agency benefits configured yet. Add trust highlights in Fivora.
              </p>
            )}

            {features.map((feature, index) => (
              <article
                key={index}
                data-preview-item-path={`home.features[${index}]`}
                className="flex items-start gap-3.5 border-t border-[var(--lux-border-strong)] pt-4"
              >
                <span
                  data-preview-field-path={`home.features[${index}].icon`}
                  data-preview-control="icon-picker"
                  data-preview-icon-type="lucide"
                  data-preview-icon={feature.icon}
                  className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#154C42]/10 text-[#154C42] dark:bg-[#C5A46D]/15 dark:text-[#C5A46D]"
                >
                  <EditableIcon name={feature.icon} size={16} />
                </span>
                <div>
                  <EditableText
                    as="h3"
                    className="font-display m-0 mb-1 text-sm font-bold text-[var(--lux-text)]"
                    data-preview-field-path={`home.features[${index}].title`}
                    defaultValue={feature.title}
                  />
                  <EditableText
                    as="p"
                    className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]"
                    data-preview-field-path={`home.features[${index}].body`}
                    defaultValue={feature.body}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Part 2: Compact Editorial Testimonial Slider */}
        <div className="border-t border-[var(--lux-border)] pt-12">
          <div className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2">
                <EditableText
                  as="span"
                  className="lux-eyebrow"
                  data-preview-field-path="home.testimonialsEyebrow"
                  defaultValue={
                    contentText(home.testimonialsEyebrow) || 'TRAVELLER STORIES · ILLUSTRATIVE SAMPLES'
                  }
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                className="font-display m-0 text-2xl font-bold tracking-[-0.025em] text-[var(--lux-text)] sm:text-3xl"
                data-preview-field-path="home.testimonialsHeading"
                defaultValue={contentText(home.testimonialsHeading) || 'Moments Remembered Along the Way'}
              />
            </div>

            <EditableText
              as="p"
              className="m-0 max-w-md text-xs leading-relaxed text-[var(--lux-text-muted)]"
              data-preview-field-path="home.testimonialsSummary"
              defaultValue={contentText(home.testimonialsSummary)}
            />
          </div>

          {/* Live Storefront: Compact Horizontal Slider Card */}
          {!isEditorPreview && count > 0 && activeItem && (
            <div className="grid grid-cols-1 items-center gap-6 rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-5 shadow-[var(--lux-shadow-sm)] sm:p-7 lg:grid-cols-12">
              <div className="lux-image-zoom overflow-hidden rounded-[6px] bg-[#101820] lg:col-span-4">
                <img
                  src={withBasePath(activeItem.imageUrl)}
                  alt={activeItem.imageAlt || activeItem.journey || 'Sri Lanka journey photo'}
                  data-preview-static="stories-active-photo"
                  className="aspect-[16/10] h-full w-full object-cover"
                />
              </div>

              <div key={`story-${safeSlide}`} className="coverflow-stagger-1 flex flex-col lg:col-span-8">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span
                    data-preview-static="story-active-journey"
                    className="font-display font-bold uppercase tracking-[0.14em] text-[var(--lux-tropical)]"
                  >
                    {activeItem.journey}
                  </span>
                  <span
                    data-preview-static="story-active-rating"
                    className="font-semibold text-[var(--lux-gold-deep)] dark:text-[#C5A46D]"
                  >
                    {'★'.repeat(Math.max(1, Math.min(5, Math.round(activeItem.rating))))} {activeItem.rating}/5
                  </span>
                </div>

                <blockquote
                  data-preview-static="story-active-quote"
                  className="font-display m-0 mb-5 text-base font-medium leading-[1.6] text-[var(--lux-text)] sm:text-lg"
                >
                  &ldquo;{activeItem.quote}&rdquo;
                </blockquote>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--lux-border)] pt-4">
                  <div>
                    <p
                      data-preview-static="story-active-name"
                      className="font-display m-0 text-sm font-bold text-[var(--lux-text)]"
                    >
                      {activeItem.name}
                    </p>
                    <p
                      data-preview-static="story-active-country"
                      className="m-0 text-xs text-[var(--lux-text-muted)]"
                    >
                      {activeItem.country}
                    </p>
                  </div>

                  {count > 1 && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {testimonials.map((t, idx) => (
                          <button
                            key={idx}
                            type="button"
                            data-preview-static="story-slider-dot"
                            aria-label={`View traveller story ${idx + 1}: ${t.name}`}
                            aria-current={idx === safeSlide ? 'true' : undefined}
                            onClick={() => setActiveSlide(idx)}
                            className={`h-[3px] transition-all duration-300 ${
                              idx === safeSlide
                                ? 'w-7 bg-[var(--brand-accent,#FF783D)]'
                                : 'w-2.5 bg-[var(--lux-border-strong)] hover:bg-[var(--brand-accent,#FF783D)]/60'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          data-preview-static="story-slider-prev"
                          aria-label="Previous traveller story"
                          onClick={() => setActiveSlide((prev) => (prev - 1 + count) % count)}
                          className="flex h-9 w-9 items-center justify-center rounded border border-[var(--lux-border-strong)] bg-transparent text-sm text-[var(--lux-text)] transition hover:border-[var(--brand-accent,#FF783D)] hover:text-[var(--brand-accent,#FF783D)]"
                        >
                          <span aria-hidden="true">←</span>
                        </button>
                        <button
                          type="button"
                          data-preview-static="story-slider-next"
                          aria-label="Next traveller story"
                          onClick={() => setActiveSlide((prev) => (prev + 1) % count)}
                          className="flex h-9 w-9 items-center justify-center rounded border border-[var(--lux-border-strong)] bg-transparent text-sm text-[var(--lux-text)] transition hover:border-[var(--brand-accent,#FF783D)] hover:text-[var(--brand-accent,#FF783D)]"
                        >
                          <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State OR Full Editable Fivora Preview Grid for Testimonials */}
          {(isEditorPreview || count === 0) && (
            <div
              data-preview-list-path="home.testimonials"
              className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
            >
              {count === 0 && (
                <p
                  data-preview-static="testimonials-empty-state"
                  className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-6 text-center text-sm text-[var(--lux-text-muted)]"
                >
                  No traveller stories configured yet. Add verified guest stories in Fivora.
                </p>
              )}

              {testimonials.map((t, index) => (
                <article
                  key={index}
                  data-preview-item-path={`home.testimonials[${index}]`}
                  className="flex flex-col justify-between rounded border border-[var(--lux-border)] bg-[var(--lux-surface)] p-4"
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                      <span
                        data-preview-field-path={`home.testimonials[${index}].journey`}
                        className="font-display font-bold uppercase tracking-[0.12em] text-[#FF783D]"
                      >
                        {t.journey}
                      </span>
                      <span className="font-semibold text-[#154C42] dark:text-[#C5A46D]">
                        <span aria-hidden="true">★ </span>
                        <span data-preview-field-path={`home.testimonials[${index}].rating`}>
                          {t.rating}
                        </span>
                        <span data-preview-static="testimonial-rating-scale">/5</span>
                      </span>
                    </div>
                    <EditableText
                      as="blockquote"
                      className="m-0 mb-3 text-xs leading-relaxed text-[var(--lux-text)]"
                      data-preview-field-path={`home.testimonials[${index}].quote`}
                      defaultValue={t.quote}
                    />
                  </div>

                  <div className="space-y-1.5 border-t border-[var(--lux-border)] pt-2.5">
                    <div className="flex items-center gap-2.5">
                      <EditableImage
                        src={t.imageUrl}
                        alt={t.imageAlt || t.name}
                        data-preview-field-path={`home.testimonials[${index}].imageUrl`}
                        fit="cover"
                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                      />
                      <div>
                        <EditableText
                          as="p"
                          className="m-0 text-xs font-bold text-[var(--lux-text)]"
                          data-preview-field-path={`home.testimonials[${index}].name`}
                          defaultValue={t.name}
                        />
                        <EditableText
                          as="p"
                          className="m-0 text-[11px] text-[var(--lux-text-muted)]"
                          data-preview-field-path={`home.testimonials[${index}].country`}
                          defaultValue={t.country}
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-[var(--lux-text-muted)]">
                      <span data-preview-static="testimonial-alt-label">Alt: </span>
                      <span data-preview-field-path={`home.testimonials[${index}].imageAlt`}>
                        {t.imageAlt || t.name}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Preserved Stage-3 & Extended Content Collections (Visible & Editable ONLY in Fivora Editor Preview so live homepage stays concise while 100% of merchant data remains intact) */}
        {isEditorPreview && (
          <div className="mt-10 space-y-8 rounded-md border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 text-xs">
            <div>
              <strong
                data-preview-static="stage3-preserved-heading"
                className="font-display block text-xs uppercase tracking-[0.18em] text-[#C5A46D]"
              >
                Preserved Content Collections (Stage-3 Dedicated Pages &amp; Extended Data)
              </strong>
              <p
                data-preview-static="stage3-preserved-note"
                className="m-0 mt-1 text-xs text-[var(--lux-text-muted)]"
              >
                These collections remain fully editable in Fivora while kept off the streamlined live homepage.
              </p>
            </div>

            {/* Preserved Planner labels */}
            <div className="grid grid-cols-1 gap-2 border-t border-[var(--lux-border)] pt-4 sm:grid-cols-2">
              <div>
                <span data-preview-static="editor-planner-heading-label" className="font-semibold">
                  Planner heading:{' '}
                </span>
                <span data-preview-field-path="home.plannerHeading">
                  {contentText(home.plannerHeading)}
                </span>
              </div>
              <div>
                <span data-preview-static="editor-planner-subtitle-label" className="font-semibold">
                  Planner subtitle:{' '}
                </span>
                <span data-preview-field-path="home.plannerSubtitle">
                  {contentText(home.plannerSubtitle)}
                </span>
              </div>
              <div>
                <span data-preview-static="editor-planner-cta-label" className="font-semibold">
                  Planner filter CTA:{' '}
                </span>
                <span data-preview-field-path="home.plannerCtaLabel">
                  {contentText(home.plannerCtaLabel)}
                </span>
              </div>
              <div>
                <span data-preview-static="editor-planner-enquiry-label" className="font-semibold">
                  Planner enquiry CTA:{' '}
                </span>
                <span data-preview-field-path="home.plannerEnquiryLabel">
                  {contentText(home.plannerEnquiryLabel)}
                </span>
              </div>
            </div>

            {/* Preserved Travel Tips */}
            <div className="border-t border-[var(--lux-border)] pt-4">
              <EditableText
                as="h4"
                className="font-display m-0 mb-3 text-sm font-bold text-[var(--lux-text)]"
                data-preview-field-path="home.travelTipsHeading"
                defaultValue={contentText(home.travelTipsHeading) || 'Essential Sri Lanka Planning Notes'}
              />
              <div data-preview-list-path="home.travelTips" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {travelTips.length === 0 && (
                  <p data-preview-static="travel-tips-empty-state" className="m-0 text-[var(--lux-text-muted)]">
                    No planning notes configured.
                  </p>
                )}
                {travelTips.map((tip, idx) => (
                  <div
                    key={idx}
                    data-preview-item-path={`home.travelTips[${idx}]`}
                    className="rounded border border-[var(--lux-border)] p-2.5"
                  >
                    <p data-preview-field-path={`home.travelTips[${idx}].title`} className="m-0 font-bold">
                      {tip.title}
                    </p>
                    <p data-preview-field-path={`home.travelTips[${idx}].body`} className="m-0 mt-1 text-[var(--lux-text-muted)]">
                      {tip.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preserved Travel Journal */}
            <div className="border-t border-[var(--lux-border)] pt-4">
              <div className="mb-3 space-y-1">
                <span data-preview-field-path="home.journalEyebrow" className="block text-[11px] font-bold uppercase text-[#C5A46D]">
                  {contentText(home.journalEyebrow)}
                </span>
                <h4 data-preview-field-path="home.journalHeading" className="font-display m-0 text-sm font-bold">
                  {contentText(home.journalHeading)}
                </h4>
                <p data-preview-field-path="home.journalSummary" className="m-0 text-[var(--lux-text-muted)]">
                  {contentText(home.journalSummary)}
                </p>
              </div>
              <div data-preview-list-path="home.journalPosts" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {journalPosts.length === 0 && (
                  <p data-preview-static="journal-empty-state" className="m-0 text-[var(--lux-text-muted)]">
                    No travel journal articles configured.
                  </p>
                )}
                {journalPosts.map((post, idx) => {
                  const rawHref = sanitizeHref(post.ctaUrl) || '/#tailor-made';
                  const href = !hasJournal && rawHref.includes('/journal') ? '/#tailor-made' : rawHref;
                  return (
                    <article
                      key={idx}
                      data-preview-item-path={`home.journalPosts[${idx}]`}
                      className="flex flex-col gap-1.5 rounded border border-[var(--lux-border)] p-2.5"
                    >
                      <EditableImage
                        src={post.imageUrl}
                        alt={post.imageAlt || post.title}
                        data-preview-field-path={`home.journalPosts[${idx}].imageUrl`}
                        fit="cover"
                        className="aspect-[16/10] w-full rounded object-cover"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-bold uppercase">
                        <span data-preview-field-path={`home.journalPosts[${idx}].category`} className="text-[#FF783D]">
                          {post.category}
                        </span>
                        <span data-preview-field-path={`home.journalPosts[${idx}].readingTime`} className="text-[#C5A46D]">
                          {post.readingTime}
                        </span>
                      </div>
                      <strong data-preview-field-path={`home.journalPosts[${idx}].title`}>{post.title}</strong>
                      <p data-preview-field-path={`home.journalPosts[${idx}].excerpt`} className="m-0 text-[var(--lux-text-muted)]">
                        {post.excerpt}
                      </p>
                      <p data-preview-field-path={`home.journalPosts[${idx}].intro`} className="m-0 text-[11px] text-[var(--lux-text-muted)]">
                        {post.intro}
                      </p>
                      <p data-preview-field-path={`home.journalPosts[${idx}].practicalTips`} className="m-0 text-[11px] text-[var(--lux-text-muted)]">
                        {post.practicalTips}
                      </p>
                      <div
                        data-preview-list-path={`home.journalPosts[${idx}].sections`}
                        className="space-y-1 border-t border-[var(--lux-border)] pt-1.5"
                      >
                        <strong data-preview-static="journal-sections-heading" className="text-[10.5px]">
                          Article sections
                        </strong>
                        {post.sections.length === 0 && (
                          <p data-preview-static="journal-sections-empty" className="m-0 text-[10.5px] opacity-75">
                            No body sections added yet.
                          </p>
                        )}
                        {post.sections.map((rawSec, secIdx) => {
                          const sec = contentObject(rawSec);
                          const secImg = contentText(sec.imageUrl);
                          return (
                            <div
                              key={secIdx}
                              data-preview-item-path={`home.journalPosts[${idx}].sections[${secIdx}]`}
                              className="space-y-1 rounded border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-1.5 text-[10.5px]"
                            >
                              <strong data-preview-field-path={`home.journalPosts[${idx}].sections[${secIdx}].heading`} className="block">
                                {contentText(sec.heading)}
                              </strong>
                              <p data-preview-field-path={`home.journalPosts[${idx}].sections[${secIdx}].body`} className="m-0 text-[var(--lux-text-muted)]">
                                {contentText(sec.body)}
                              </p>
                              <EditableImage
                                src={secImg || post.imageUrl}
                                alt={contentText(sec.caption) || contentText(sec.heading) || post.title}
                                data-preview-field-path={`home.journalPosts[${idx}].sections[${secIdx}].imageUrl`}
                                fit="cover"
                                className="h-8 w-12 rounded object-cover"
                              />
                              <span data-preview-field-path={`home.journalPosts[${idx}].sections[${secIdx}].caption`} className="block text-[10px] text-[var(--lux-text-muted)]">
                                {contentText(sec.caption)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-[var(--lux-text-muted)]">
                        <span data-preview-field-path={`home.journalPosts[${idx}].date`}>{post.date}</span>
                        <span data-preview-field-path={`home.journalPosts[${idx}].author`}>{post.author}</span>
                      </div>
                      <span data-preview-field-path={`home.journalPosts[${idx}].imageAlt`} className="text-[10px] text-[var(--lux-text-muted)]">
                        {post.imageAlt || post.title}
                      </span>
                      <a
                        href={withBasePath(href)}
                        data-preview-field-path={`home.journalPosts[${idx}].ctaUrl`}
                        className="font-semibold text-[#FF783D] underline"
                      >
                        <span data-preview-field-path={`home.journalPosts[${idx}].ctaLabel`}>
                          {post.ctaLabel}
                        </span>
                      </a>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Preserved FAQs */}
            <div className="border-t border-[var(--lux-border)] pt-4">
              <div className="mb-3 space-y-1">
                <span data-preview-field-path="home.faqEyebrow" className="block text-[11px] font-bold uppercase text-[#C5A46D]">
                  {contentText(home.faqEyebrow)}
                </span>
                <h4 data-preview-field-path="home.faqHeading" className="font-display m-0 text-sm font-bold">
                  {contentText(home.faqHeading)}
                </h4>
                <p data-preview-field-path="home.faqSummary" className="m-0 text-[var(--lux-text-muted)]">
                  {contentText(home.faqSummary)}
                </p>
              </div>
              <div data-preview-list-path="home.faqs" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {faqs.length === 0 && (
                  <p data-preview-static="faqs-empty-state" className="m-0 text-[var(--lux-text-muted)]">
                    No FAQs configured.
                  </p>
                )}
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    data-preview-item-path={`home.faqs[${idx}]`}
                    className="rounded border border-[var(--lux-border)] p-2.5"
                  >
                    <p data-preview-field-path={`home.faqs[${idx}].question`} className="m-0 font-bold">
                      {faq.question}
                    </p>
                    <p data-preview-field-path={`home.faqs[${idx}].answer`} className="m-0 mt-1 text-[var(--lux-text-muted)]">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

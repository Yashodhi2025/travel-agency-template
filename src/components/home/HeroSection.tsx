'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type TouchEvent } from 'react';
import { EditableImage, EditableText, useComponentStyle } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { sanitizeHref } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';

interface HeroSlide {
  title: string;
  location: string;
  caption: string;
  imageUrl: string;
  backgroundImageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
}

function getRelativeOffset(index: number, active: number, count: number): number {
  if (count <= 1) return 0;
  let diff = index - active;
  if (count >= 5) {
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    return diff;
  }
  const half = Math.floor(count / 2);
  if (diff > half) diff -= count;
  if (diff < -half) diff += count;
  return diff;
}

export function HeroSection() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const home = contentObject(content.home);

  const { cssVars: heroCardVars } = useComponentStyle('home.hero.card', 'card');
  const { cssVars: heroHeadingVars } = useComponentStyle('home.hero.heading', 'text');
  const { cssVars: heroCtaVars } = useComponentStyle('home.hero.cta', 'button');

  const rawSlides = contentList(home.heroSlides);
  const slides: HeroSlide[] = rawSlides.map((raw) => {
    const item = contentObject(raw);
    const mainImage = contentText(item.imageUrl);
    return {
      title: contentText(item.title),
      location: contentText(item.location),
      caption: contentText(item.caption),
      imageUrl: mainImage,
      backgroundImageUrl: contentText(item.backgroundImageUrl) || mainImage,
      imageAlt: contentText(item.imageAlt),
      ctaLabel: contentText(item.ctaLabel),
      ctaUrl: contentText(item.ctaUrl),
    };
  });

  const bannerImageUrl = contentText(home.bannerImageUrl) || '/images/hero-sigiriya.webp';
  const heroEyebrow = contentText(home.heroEyebrow) || 'DISCOVER SRI LANKA';
  const heroTitle = contentText(home.heroTitle) || 'Sri Lanka, Curated With Warmth.';
  const heroSummary = contentText(home.heroSummary);
  const primaryCtaLabel = contentText(home.primaryCtaLabel) || 'Explore Journeys';
  const secondaryCtaLabel = contentText(home.secondaryCtaLabel) || 'Plan Your Escape';

  const selectedPages =
    siteData.requirements?.requiredPages ??
    siteData.template?.structure?.pages ??
    ['home', 'about_us', 'services', 'contact'];

  const count = slides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const safeActive = count > 0 ? ((activeIndex % count) + count) % count : 0;
  const currentSlide = count > 0 ? slides[safeActive] : null;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const goNext = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (isEditorPreview || paused || hovered || reducedMotion || count <= 1) return;
    const timer = window.setInterval(goNext, 6500);
    return () => window.clearInterval(timer);
  }, [isEditorPreview, paused, hovered, reducedMotion, count, goNext]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (isEditorPreview || count <= 1) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (count <= 1) return;
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const x = event.touches[0]?.clientX ?? touchStartX.current;
    touchDeltaX.current = x - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    if (Math.abs(delta) < 42) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (isEditorPreview || reducedMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: nx * 10, y: ny * 6 });
  };

  const scrollToSection = (target: string) => {
    if (target.startsWith('/#')) {
      const id = target.slice(2);
      const el = document.getElementById(id);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 76;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        return;
      }
    }
    window.location.href = withBasePath(target);
  };

  const activeCtaHref = sanitizeHref(currentSlide?.ctaUrl) || '/#destinations';

  return (
    <section
      data-design-section="home-hero"
      data-preview-style-target="home.hero.card"
      data-preview-style-type="card"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setParallax({ x: 0, y: 0 });
      }}
      onPointerMove={handlePointerMove}
      style={{ ...heroCardVars }}
      className="relative isolate flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-[#101820] pt-[74px] text-[#FAF8F3]"
    >
      {/* Base Fallback Hero Image — always mounted for home.bannerImageUrl */}
      <div className="absolute inset-0 -z-30 overflow-hidden">
        <img
          src={withBasePath(bannerImageUrl)}
          alt={heroTitle}
          data-preview-field-path="home.bannerImageUrl"
          className="h-full w-full scale-105 object-cover object-center opacity-55"
        />
      </div>

      {/* Synchronized Full-Screen Scenery Background (minimal blur so destination remains recognizable) */}
      {!isEditorPreview && count > 0 && (
        <div
          className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
          style={
            !reducedMotion
              ? {
                  transform: `translate3d(${-parallax.x}px, ${-parallax.y}px, 0) scale(1.04)`,
                  transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                }
              : undefined
          }
        >
          {slides.map((slide, idx) => {
            const isActive = idx === safeActive;
            const bgSrc = slide.backgroundImageUrl || slide.imageUrl || bannerImageUrl;
            return (
              <img
                key={`bg-${idx}`}
                src={withBasePath(bgSrc)}
                alt=""
                aria-hidden="true"
                loading={idx === 0 ? 'eager' : 'lazy'}
                data-preview-static="hero-coverflow-backdrop"
                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ filter: 'blur(0.75px) brightness(0.76) saturate(1.04)' }}
              />
            );
          })}
        </div>
      )}

      {/* Balanced Editorial Atmospheric Overlay — preserves scenery while guaranteeing legible text */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#101820]/72 via-[#101820]/30 to-[#101820]/94"
      />

      {/* ═══════════════════════════════════════════════════════════════════
          LIVE STOREFRONT: REFINED 3D COVERFLOW (calibrated for 1366x768, 1440x900 & Mobile)
          ═══════════════════════════════════════════════════════════════════ */}
      {!isEditorPreview && count > 0 && currentSlide && (
        <div className="lux-container relative z-10 flex flex-1 flex-col items-center justify-center py-3 sm:py-4">
          {/* Restrained Top Eyebrow */}
          <div className="mb-2 text-center">
            <EditableText
              as="span"
              color="#C5A46D"
              className="font-display inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.26em] text-[#C5A46D] sm:text-[11px]"
              data-preview-field-path="home.heroEyebrow"
              defaultValue={heroEyebrow}
            />
          </div>

          {/* 3D Perspective Coverflow Deck — sized so complete hero fits above the fold at 1366x768 */}
          <div
            className="coverflow-stage relative flex h-[270px] w-full max-w-[1160px] items-center justify-center sm:h-[310px] lg:h-[340px] xl:h-[385px]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left Navigation Arrow */}
            {count > 1 && (
              <button
                type="button"
                data-preview-static="hero-coverflow-prev"
                aria-label="Previous destination"
                onClick={goPrev}
                className="absolute left-0 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#101820]/55 text-lg text-[#FAF8F3] backdrop-blur-sm transition duration-200 hover:border-[#C5A46D] hover:bg-[#101820]/85 sm:left-2 sm:h-11 sm:w-11"
              >
                <span aria-hidden="true">&#8249;</span>
              </button>
            )}

            {/* Five-Card Desktop / Focused Mobile Coverflow Cards */}
            {slides.map((slide, idx) => {
              const offset = getRelativeOffset(idx, safeActive, count);
              const absOffset = Math.abs(offset);
              const isVisible = absOffset <= 2;

              let transform = 'translate3d(0, 0, -220px) scale(0.58) rotateY(0deg)';
              let opacity = 0;
              let zIndex = 1;
              let brightness = 0.48;

              if (offset === 0) {
                const px = !reducedMotion ? parallax.x * 0.25 : 0;
                const py = !reducedMotion ? parallax.y * 0.25 : 0;
                transform = `translate3d(${px}px, ${py}px, 90px) scale(1.03) rotateY(0deg)`;
                opacity = 1;
                zIndex = 30;
                brightness = 1;
              } else if (offset === -1) {
                transform = 'translate3d(-86%, 10px, -45px) scale(0.84) rotateY(16deg)';
                opacity = 0.92;
                zIndex = 20;
                brightness = 0.78;
              } else if (offset === 1) {
                transform = 'translate3d(86%, 10px, -45px) scale(0.84) rotateY(-16deg)';
                opacity = 0.92;
                zIndex = 20;
                brightness = 0.78;
              } else if (offset === -2) {
                transform = 'translate3d(-158%, 20px, -160px) scale(0.69) rotateY(24deg)';
                opacity = 0.62;
                zIndex = 10;
                brightness = 0.56;
              } else if (offset === 2) {
                transform = 'translate3d(158%, 20px, -160px) scale(0.69) rotateY(-24deg)';
                opacity = 0.62;
                zIndex = 10;
                brightness = 0.56;
              }

              return (
                <button
                  key={`card-${idx}`}
                  type="button"
                  data-preview-static="hero-coverflow-card"
                  aria-label={`Select ${slide.title || `destination ${idx + 1}`}`}
                  aria-pressed={offset === 0}
                  onClick={() => setActiveIndex(idx)}
                  tabIndex={isVisible ? 0 : -1}
                  className={`coverflow-card group absolute aspect-[4/5] w-[190px] overflow-hidden rounded-[10px] border p-0 text-left sm:w-[218px] lg:w-[244px] xl:w-[272px] ${
                    absOffset === 2 ? 'hidden md:block' : ''
                  } ${
                    offset === 0
                      ? 'border-white/35 shadow-[0_24px_56px_rgba(0,0,0,0.58)]'
                      : 'border-white/15 shadow-[0_14px_34px_rgba(0,0,0,0.44)] hover:border-[#C5A46D]/75'
                  }`}
                  style={{
                    transform,
                    opacity: isVisible ? opacity : 0,
                    zIndex,
                    pointerEvents: isVisible ? 'auto' : 'none',
                    filter: `brightness(${brightness})`,
                  }}
                >
                  <img
                    src={withBasePath(slide.imageUrl || bannerImageUrl)}
                    alt={slide.imageAlt || slide.title || 'Sri Lanka destination'}
                    loading={absOffset <= 1 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle bottom gradient ONLY on neighbor cards to hold their label cleanly */}
                  {offset !== 0 && (
                    <>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#101820]/85 to-transparent"
                      />
                      <span className="pointer-events-none absolute inset-x-3 bottom-2.5 block truncate text-center font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#FAF8F3]/92">
                        {slide.title}
                      </span>
                    </>
                  )}
                </button>
              );
            })}

            {/* Right Navigation Arrow */}
            {count > 1 && (
              <button
                type="button"
                data-preview-static="hero-coverflow-next"
                aria-label="Next destination"
                onClick={goNext}
                className="absolute right-0 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#101820]/55 text-lg text-[#FAF8F3] backdrop-blur-sm transition duration-200 hover:border-[#C5A46D] hover:bg-[#101820]/85 sm:right-2 sm:h-11 sm:w-11"
              >
                <span aria-hidden="true">&#8250;</span>
              </button>
            )}
          </div>

          {/* Synchronized Destination Title, Subtitle, Description & CTAs — cleanly positioned BELOW the active photograph so the scenery is completely unobstructed */}
          <div
            key={`meta-${safeActive}`}
            className="mt-4 flex max-w-2xl flex-col items-center px-2 text-center sm:mt-5"
          >
            {currentSlide.location && (
              <p
                data-preview-static="hero-active-region"
                className="coverflow-stagger-1 font-display m-0 mb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#C5A46D] sm:text-[11px]"
              >
                {currentSlide.location}
              </p>
            )}

            <h1
              data-preview-static="hero-active-title"
              data-preview-style-target="home.hero.heading"
              data-preview-style-type="text"
              style={{
                ...heroHeadingVars,
                textShadow: '0 4px 24px rgba(16, 24, 32, 0.72)',
              }}
              className="coverflow-stagger-2 font-display m-0 mb-2 text-3xl font-extrabold uppercase leading-[1.04] tracking-[0.14em] text-[#FAF8F3] sm:text-5xl lg:text-[3.35rem]"
            >
              {currentSlide.title}
            </h1>

            {currentSlide.caption && (
              <p
                data-preview-static="hero-active-description"
                className="coverflow-stagger-3 m-0 mb-4 max-w-xl text-sm leading-relaxed text-[#FAF8F3]/85 sm:text-[15px]"
              >
                {currentSlide.caption}
              </p>
            )}

            <div className="coverflow-stagger-3 flex flex-wrap items-center justify-center gap-3">
              <a
                href={withBasePath(activeCtaHref)}
                data-preview-static="hero-active-explore-cta"
                data-preview-style-target="home.hero.cta"
                data-preview-style-type="button"
                style={{ ...heroCtaVars }}
                onClick={(e) => {
                  if (activeCtaHref.startsWith('/#')) {
                    e.preventDefault();
                    scrollToSection(activeCtaHref);
                  }
                }}
                className="lux-btn-sunset !min-h-[42px]"
              >
                <span>{currentSlide.ctaLabel || primaryCtaLabel}</span>
                <span aria-hidden="true">→</span>
              </a>

              {selectedPages.includes('contact') && (
                <button
                  type="button"
                  data-target-page="contact"
                  onClick={() => scrollToSection('/#tailor-made')}
                  className="lux-btn-outline-light !min-h-[42px]"
                >
                  <span data-preview-field-path="home.secondaryCtaLabel">
                    {secondaryCtaLabel}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Compact Bottom Progress Indicator, Counter & Autoplay Control */}
          <div className="mt-5 flex w-full max-w-lg items-center justify-between gap-4 border-t border-white/12 pt-3">
            <span
              data-preview-static="hero-slide-counter"
              className="font-display text-[11px] font-bold tracking-[0.2em] text-[#C5A46D]"
            >
              {String(safeActive + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>

            {count > 1 && (
              <div className="flex items-center gap-2">
                {slides.map((slide, idx) => (
                  <button
                    key={`dot-${idx}`}
                    type="button"
                    data-preview-static="hero-progress-dot"
                    aria-label={`Go to ${slide.title || `slide ${idx + 1}`}`}
                    aria-current={idx === safeActive ? 'true' : undefined}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-[3px] transition-all duration-300 ${
                      idx === safeActive
                        ? 'w-8 bg-[#FF783D]'
                        : 'w-3 bg-white/35 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}

            {count > 1 && !reducedMotion ? (
              <button
                type="button"
                data-preview-static="hero-autoplay-toggle"
                aria-label={paused ? 'Resume automatic carousel' : 'Pause automatic carousel'}
                onClick={() => setPaused((p) => !p)}
                className="font-display rounded border border-white/25 bg-transparent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FAF8F3]/80 transition hover:border-[#C5A46D] hover:text-[#FAF8F3]"
              >
                {paused ? 'Play' : 'Pause'}
              </button>
            ) : (
              <span
                data-preview-static="hero-swipe-hint"
                className="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A3B0BA]"
              >
                Sri Lanka
              </span>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          FALLBACK HERO (0 slides) OR FIVORA EDITOR PREVIEW
          ═══════════════════════════════════════════════════════════════════ */}
      {(isEditorPreview || count === 0) && (
        <div className="lux-container relative z-10 flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3">
              <EditableText
                as="span"
                color="#C5A46D"
                className="font-display inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#C5A46D]"
                data-preview-field-path="home.heroEyebrow"
                defaultValue={heroEyebrow}
              />
            </div>

            <EditableText
              as="h1"
              variant="h1"
              color="#FAF8F3"
              data-preview-field-path="home.heroTitle"
              data-preview-style-target="home.hero.heading"
              data-preview-style-type="text"
              style={{ ...heroHeadingVars }}
              className="font-display m-0 mb-4 text-4xl font-extrabold uppercase leading-[1.08] tracking-[0.06em] text-[#FAF8F3] sm:text-5xl"
              defaultValue={heroTitle}
            />

            <EditableText
              as="p"
              color="#A3B0BA"
              className="mx-auto mb-7 max-w-2xl text-base leading-relaxed text-[#A3B0BA]"
              data-preview-field-path="home.heroSummary"
              defaultValue={heroSummary}
            />

            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => scrollToSection('/#packages')}
                data-preview-style-target="home.hero.cta"
                data-preview-style-type="button"
                style={{ ...heroCtaVars }}
                className="lux-btn-sunset"
              >
                <span data-preview-field-path="home.primaryCtaLabel">{primaryCtaLabel}</span>
              </button>

              {selectedPages.includes('contact') ? (
                <button
                  type="button"
                  data-target-page="contact"
                  onClick={() => scrollToSection('/#tailor-made')}
                  className="lux-btn-outline-light"
                >
                  <span data-preview-field-path="home.secondaryCtaLabel">
                    {secondaryCtaLabel}
                  </span>
                </button>
              ) : (
                <span
                  data-target-page="contact"
                  data-preview-field-path="home.secondaryCtaLabel"
                  className="lux-btn-outline-light unavailable"
                >
                  {secondaryCtaLabel}
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-white/15 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <strong
                data-preview-static="hero-slides-editor-heading"
                className="font-display text-xs uppercase tracking-[0.18em] text-[#C5A46D]"
              >
                3D Coverflow Destination Slides
              </strong>
              <span
                data-preview-static="hero-slides-editor-hint"
                className="text-xs text-[#A3B0BA]"
              >
                Click any slide field to edit in Fivora
              </span>
            </div>

            <div
              data-preview-list-path="home.heroSlides"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            >
              {count === 0 && (
                <p
                  data-preview-static="hero-slides-empty-note"
                  className="col-span-full rounded-lg border border-dashed border-white/25 p-6 text-center text-sm text-[#A3B0BA]"
                >
                  No hero coverflow slides configured yet. Add destination slides in Fivora to activate the 3D carousel.
                </p>
              )}

              {slides.map((slide, index) => {
                const safeUrl = sanitizeHref(slide.ctaUrl) || '/#destinations';
                return (
                  <article
                    key={index}
                    data-preview-item-path={`home.heroSlides[${index}]`}
                    className="flex flex-col gap-2 rounded-lg border border-white/15 bg-[#1B252E]/90 p-3 text-[#FAF8F3]"
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded border border-white/10">
                      <EditableImage
                        src={slide.imageUrl || bannerImageUrl}
                        alt={slide.imageAlt || slide.title || `Slide ${index + 1}`}
                        data-preview-field-path={`home.heroSlides[${index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex items-center gap-2 rounded border border-white/10 bg-[#101820]/70 p-2">
                      <EditableImage
                        src={slide.backgroundImageUrl || slide.imageUrl || bannerImageUrl}
                        alt={slide.imageAlt || slide.title || `Backdrop ${index + 1}`}
                        data-preview-field-path={`home.heroSlides[${index}].backgroundImageUrl`}
                        fit="cover"
                        className="h-9 w-14 shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 text-[11px] text-[#A3B0BA]">
                        <span data-preview-static="hero-slide-bg-label" className="block font-semibold text-[#FAF8F3]">
                          Background image
                        </span>
                        <span data-preview-static="hero-slide-alt-label">Alt: </span>
                        <span
                          data-preview-field-path={`home.heroSlides[${index}].imageAlt`}
                          className="text-[#FAF8F3]/90"
                        >
                          {slide.imageAlt || slide.title}
                        </span>
                      </div>
                    </div>

                    <span
                      data-preview-field-path={`home.heroSlides[${index}].location`}
                      className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[#C5A46D]"
                      style={{ minHeight: '1.1em' }}
                    >
                      {slide.location}
                    </span>

                    <h3
                      data-preview-field-path={`home.heroSlides[${index}].title`}
                      className="font-display m-0 text-base font-extrabold uppercase tracking-[0.1em] text-[#FAF8F3]"
                    >
                      {slide.title}
                    </h3>

                    <p
                      data-preview-field-path={`home.heroSlides[${index}].caption`}
                      className="m-0 text-xs leading-relaxed text-[#A3B0BA]"
                      style={{ minHeight: '1.2em' }}
                    >
                      {slide.caption}
                    </p>

                    <a
                      href={withBasePath(safeUrl)}
                      data-preview-field-path={`home.heroSlides[${index}].ctaUrl`}
                      className="font-display mt-auto inline-flex items-center gap-1.5 pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#FF783D] underline"
                    >
                      <span data-preview-field-path={`home.heroSlides[${index}].ctaLabel`}>
                        {slide.ctaLabel || 'Explore Destination'}
                      </span>
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

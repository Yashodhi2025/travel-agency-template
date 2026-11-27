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
  // For 2, 3, or 4 slides, keep clean minimal non-duplicating circular offset
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
  const heroEyebrow = contentText(home.heroEyebrow) || 'DISCOVER THE EXTRAORDINARY';
  const heroTitle = contentText(home.heroTitle) || 'The Island of Endless Wonders.';
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
    setParallax({ x: nx * 16, y: ny * 10 });
  };

  const scrollToSection = (target: string) => {
    if (target.startsWith('/#')) {
      const id = target.slice(2);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
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
      className="relative isolate flex min-h-[100svh] w-full flex-col justify-between overflow-hidden bg-[#101820] pt-[88px] text-[#F5F5F5]"
    >
      {/* Base Fallback Hero Image — always mounted for home.bannerImageUrl */}
      <div className="absolute inset-0 -z-30 overflow-hidden">
        <img
          src={withBasePath(bannerImageUrl)}
          alt={heroTitle}
          data-preview-field-path="home.bannerImageUrl"
          className="h-full w-full scale-105 object-cover object-center opacity-50"
        />
      </div>

      {/* Synchronized Full-Screen Atmospheric Background Crossfade */}
      {!isEditorPreview && count > 0 && (
        <div
          className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
          style={
            !reducedMotion
              ? {
                  transform: `translate3d(${-parallax.x}px, ${-parallax.y}px, 0) scale(1.08)`,
                  transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
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
                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ filter: 'blur(3px) saturate(1.08)' }}
              />
            );
          })}
        </div>
      )}

      {/* Cinematic Atmospheric Dark Overlays */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#101820]/82 via-[#101820]/46 to-[#101820]/96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 75% 60% at 50% 45%, rgba(16, 24, 32, 0.14) 0%, rgba(16, 24, 32, 0.72) 100%)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          LIVE STOREFRONT: CINEMATIC 3D COVERFLOW EXPERIENCE
          ═══════════════════════════════════════════════════════════════════ */}
      {!isEditorPreview && count > 0 && currentSlide && (
        <div className="lux-container relative z-10 flex flex-1 flex-col items-center justify-center py-6 sm:py-8">
          {/* Top Eyebrow */}
          <div className="mb-3 text-center sm:mb-4">
            <EditableText
              as="span"
              color="#FF783D"
              className="font-display inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#FF783D]"
              data-preview-field-path="home.heroEyebrow"
              defaultValue={heroEyebrow}
            />
          </div>

          {/* 3D Perspective Coverflow Deck */}
          <div
            className="coverflow-stage relative flex h-[340px] w-full max-w-[1240px] items-center justify-center sm:h-[400px] lg:h-[455px]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left Arrow */}
            {count > 1 && (
              <button
                type="button"
                data-preview-static="hero-coverflow-prev"
                aria-label="Previous destination"
                onClick={goPrev}
                className="absolute left-0 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#101820]/65 text-xl text-[#F5F5F5] backdrop-blur-md transition duration-300 hover:border-[#FF783D] hover:bg-[#FF783D] hover:text-white sm:left-2 sm:h-12 sm:w-12"
              >
                <span aria-hidden="true">&#8249;</span>
              </button>
            )}

            {/* Vertical Destination Cards with Real 3D Perspective Transforms */}
            {slides.map((slide, idx) => {
              const offset = getRelativeOffset(idx, safeActive, count);
              const absOffset = Math.abs(offset);
              const isVisible = absOffset <= 2;

              let transform = 'translate3d(0, 0, -240px) scale(0.55) rotateY(0deg)';
              let opacity = 0;
              let zIndex = 1;
              let brightness = 0.4;

              if (offset === 0) {
                const px = !reducedMotion ? parallax.x * 0.35 : 0;
                const py = !reducedMotion ? parallax.y * 0.35 : 0;
                transform = `translate3d(${px}px, ${py}px, 110px) scale(1.06) rotateY(0deg)`;
                opacity = 1;
                zIndex = 30;
                brightness = 1;
              } else if (offset === -1) {
                transform = 'translate3d(-84%, 14px, -45px) scale(0.84) rotateY(20deg)';
                opacity = 0.9;
                zIndex = 20;
                brightness = 0.72;
              } else if (offset === 1) {
                transform = 'translate3d(84%, 14px, -45px) scale(0.84) rotateY(-20deg)';
                opacity = 0.9;
                zIndex = 20;
                brightness = 0.72;
              } else if (offset === -2) {
                transform = 'translate3d(-154%, 28px, -175px) scale(0.68) rotateY(30deg)';
                opacity = 0.56;
                zIndex = 10;
                brightness = 0.5;
              } else if (offset === 2) {
                transform = 'translate3d(154%, 28px, -175px) scale(0.68) rotateY(-30deg)';
                opacity = 0.56;
                zIndex = 10;
                brightness = 0.5;
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
                  className={`coverflow-card group absolute aspect-[3/4] w-[205px] overflow-hidden rounded-[20px] border p-0 text-left sm:w-[240px] lg:w-[280px] ${
                    absOffset === 2 ? 'hidden md:block' : ''
                  } ${
                    offset === 0
                      ? 'border-white/30 shadow-[0_32px_70px_rgba(0,0,0,0.68)]'
                      : 'border-white/15 shadow-[0_20px_48px_rgba(0,0,0,0.52)] hover:border-[#FF783D]/70'
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
                    className={`h-full w-full object-cover object-center transition-transform duration-700 ${
                      offset === 0 ? 'scale-100 group-hover:scale-105' : 'scale-105 group-hover:scale-110'
                    }`}
                  />
                  {/* Subtle dark gradient inside each card */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#101820]/88 via-[#101820]/15 to-transparent"
                  />
                  {/* Neighbour Card Subtle Bottom Label */}
                  {offset !== 0 && (
                    <span className="pointer-events-none absolute inset-x-3 bottom-3 block truncate text-center font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F5]/90">
                      {slide.title}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Right Arrow */}
            {count > 1 && (
              <button
                type="button"
                data-preview-static="hero-coverflow-next"
                aria-label="Next destination"
                onClick={goNext}
                className="absolute right-0 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#101820]/65 text-xl text-[#F5F5F5] backdrop-blur-md transition duration-300 hover:border-[#FF783D] hover:bg-[#FF783D] hover:text-white sm:right-2 sm:h-12 sm:w-12"
              >
                <span aria-hidden="true">&#8250;</span>
              </button>
            )}

            {/* Large Uppercase Destination Title Across the Central Composition */}
            <div
              key={`title-lockup-${safeActive}`}
              className="pointer-events-none absolute inset-x-0 bottom-5 z-30 flex flex-col items-center px-4 text-center sm:bottom-6"
            >
              {currentSlide.location && (
                <p
                  data-preview-static="hero-active-region"
                  className="coverflow-stagger-1 font-display mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#101820]/65 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF783D] backdrop-blur-md sm:text-[11px]"
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
                  textShadow: '0 10px 36px rgba(16, 24, 32, 0.85), 0 2px 10px rgba(0, 0, 0, 0.65)',
                }}
                className="coverflow-stagger-2 font-display m-0 max-w-4xl text-4xl font-extrabold uppercase leading-none tracking-[0.16em] text-[#F5F5F5] sm:text-6xl lg:text-[5.25rem]"
              >
                {currentSlide.title}
              </h1>
            </div>
          </div>

          {/* Synchronized Description + Explore Destination CTA */}
          <div
            key={`meta-${safeActive}`}
            className="coverflow-stagger-3 mt-4 flex max-w-2xl flex-col items-center text-center sm:mt-5"
          >
            {currentSlide.caption && (
              <p
                data-preview-static="hero-active-description"
                className="m-0 mb-6 max-w-xl text-sm leading-relaxed text-[#A3B0BA] sm:text-base"
              >
                {currentSlide.caption}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3.5">
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
                className="lux-btn-sunset"
              >
                <span>{currentSlide.ctaLabel || primaryCtaLabel}</span>
                <span aria-hidden="true">→</span>
              </a>

              {selectedPages.includes('contact') && (
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
              )}
            </div>
          </div>

          {/* Bottom Minimal Progress Bar, Counter & Autoplay Control */}
          <div className="mt-7 flex w-full max-w-xl flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 sm:mt-8">
            <span
              data-preview-static="hero-slide-counter"
              className="font-display text-xs font-bold tracking-[0.2em] text-[#A3B0BA]"
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
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === safeActive
                        ? 'w-9 bg-[#FF783D]'
                        : 'w-2.5 bg-white/30 hover:bg-white/60'
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
                className="font-display rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A3B0BA] transition hover:border-[#FF783D] hover:text-[#F5F5F5]"
              >
                {paused ? 'Play' : 'Pause'}
              </button>
            ) : (
              <span
                data-preview-static="hero-swipe-hint"
                className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A3B0BA]"
              >
                Sri Lanka
              </span>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          FALLBACK HERO (when 0 slides configured) OR FIVORA EDITOR PREVIEW
          Exposes all required hero & coverflow slide targets cleanly & visibly.
          ═══════════════════════════════════════════════════════════════════ */}
      {(isEditorPreview || count === 0) && (
        <div className="lux-container relative z-10 flex flex-1 flex-col justify-center py-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4">
              <EditableText
                as="span"
                color="#FF783D"
                className="font-display inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.26em] text-[#FF783D]"
                data-preview-field-path="home.heroEyebrow"
                defaultValue={heroEyebrow}
              />
            </div>

            <EditableText
              as="h1"
              variant="h1"
              color="#F5F5F5"
              data-preview-field-path="home.heroTitle"
              data-preview-style-target="home.hero.heading"
              data-preview-style-type="text"
              style={{ ...heroHeadingVars }}
              className="font-display m-0 mb-5 text-4xl font-extrabold uppercase leading-[1.06] tracking-[0.06em] text-[#F5F5F5] sm:text-5xl lg:text-6xl"
              defaultValue={heroTitle}
            />

            <EditableText
              as="p"
              color="#A3B0BA"
              className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-[#A3B0BA] sm:text-lg"
              data-preview-field-path="home.heroSummary"
              defaultValue={heroSummary}
            />

            <div className="flex flex-wrap items-center justify-center gap-4">
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

          {/* Visible Fivora Coverflow Slides Editor Grid */}
          <div className="mt-10 border-t border-white/15 pt-7">
            <div className="mb-4 flex items-center justify-between">
              <strong
                data-preview-static="hero-slides-editor-heading"
                className="font-display text-xs uppercase tracking-[0.2em] text-[#FF783D]"
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
                  className="col-span-full rounded-xl border border-dashed border-white/25 p-6 text-center text-sm text-[#A3B0BA]"
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
                    className="flex flex-col gap-2.5 rounded-2xl border border-white/15 bg-[#202B33]/90 p-3.5 text-[#F5F5F5]"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-xl border border-white/10">
                      <EditableImage
                        src={slide.imageUrl || bannerImageUrl}
                        alt={slide.imageAlt || slide.title || `Slide ${index + 1}`}
                        data-preview-field-path={`home.heroSlides[${index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#101820]/70 p-2">
                      <EditableImage
                        src={slide.backgroundImageUrl || slide.imageUrl || bannerImageUrl}
                        alt={slide.imageAlt || slide.title || `Backdrop ${index + 1}`}
                        data-preview-field-path={`home.heroSlides[${index}].backgroundImageUrl`}
                        fit="cover"
                        className="h-9 w-14 shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 text-[11px] text-[#A3B0BA]">
                        <span data-preview-static="hero-slide-bg-label" className="block font-semibold text-[#F5F5F5]">
                          Background image
                        </span>
                        <span data-preview-static="hero-slide-alt-label">Alt: </span>
                        <span
                          data-preview-field-path={`home.heroSlides[${index}].imageAlt`}
                          className="text-[#F5F5F5]/90"
                        >
                          {slide.imageAlt || slide.title}
                        </span>
                      </div>
                    </div>

                    <span
                      data-preview-field-path={`home.heroSlides[${index}].location`}
                      className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF783D]"
                      style={{ minHeight: '1.1em' }}
                    >
                      {slide.location}
                    </span>

                    <h3
                      data-preview-field-path={`home.heroSlides[${index}].title`}
                      className="font-display m-0 text-lg font-extrabold uppercase tracking-[0.1em] text-[#F5F5F5]"
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
                      className="font-display mt-auto inline-flex items-center gap-1.5 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#FF783D] underline"
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

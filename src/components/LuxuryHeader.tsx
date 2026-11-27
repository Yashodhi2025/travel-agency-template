'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { withBasePath } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

interface LuxuryHeaderProps {
  activeRoute: string;
}

export function LuxuryHeader({ activeRoute }: LuxuryHeaderProps) {
  const siteData = useSiteData();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerCloseRef = useRef<HTMLButtonElement | null>(null);

  const content = contentObject(siteData?.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);
  const shop = contentObject(siteData?.shop);

  const siteTitle =
    contentText(common.websiteTitle) || contentText(shop.businessName) || 'CEYLON ODYSSEY';
  const tagline = contentText(common.tagline);
  const logoUrl = contentText(common.logoUrl) || contentText(shop.logoUrl) || '/images/brand-logo.svg';
  const headerCtaLabel = contentText(common.headerCtaLabel) || 'Plan Your Trip';

  const requiredPages = Array.isArray(siteData?.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData?.template?.structure?.pages || ['home', 'about_us', 'services', 'contact'];

  const isHome = activeRoute === '/' || activeRoute === '';
  const hasServices = requiredPages.includes('services');
  const hasAbout = requiredPages.includes('about_us');
  const hasContact = requiredPages.includes('contact');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerCloseRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const navigateTo = (target: string) => {
    setMenuOpen(false);
    if (typeof window === 'undefined') return;
    if (target.startsWith('/#') && isHome) {
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

  const navItems: Array<{
    key: string;
    labelKey: string;
    fallback: string;
    href: string;
    targetPage?: string;
    enabled: boolean;
    active: boolean;
  }> = [
      {
        key: 'home',
        labelKey: 'home',
        fallback: 'Home',
        href: '/',
        targetPage: 'home',
        enabled: true,
        active: isHome,
      },
      {
        key: 'destinations',
        labelKey: 'destinations',
        fallback: 'Destinations',
        href: '/#destinations',
        enabled: true,
        active: false,
      },
      {
        key: 'packages',
        labelKey: 'packages',
        fallback: 'Tour Packages',
        href: '/#packages',
        enabled: true,
        active: false,
      },
      {
        key: 'experiences',
        labelKey: 'experiences',
        fallback: 'Experiences',
        href: '/#experiences',
        enabled: true,
        active: false,
      },
      {
        key: 'services',
        labelKey: 'services',
        fallback: 'Services',
        href: '/services/',
        targetPage: 'services',
        enabled: hasServices,
        active: activeRoute.startsWith('/services'),
      },
      {
        key: 'about_us',
        labelKey: 'about_us',
        fallback: 'About Us',
        href: '/about_us/',
        targetPage: 'about_us',
        enabled: hasAbout,
        active: activeRoute.startsWith('/about_us'),
      },
      {
        key: 'contact',
        labelKey: 'contact',
        fallback: 'Contact',
        href: '/contact/',
        targetPage: 'contact',
        enabled: hasContact,
        active: activeRoute.startsWith('/contact'),
      },
    ];

  const isOverlayHero = isHome && !scrolled && !menuOpen;

  const headerClasses = isHome
    ? isOverlayHero
      ? 'fixed inset-x-0 top-0 z-50 w-full bg-gradient-to-b from-[#101820]/75 via-[#101820]/30 to-transparent text-[#FAF8F3] transition-all duration-300'
      : 'fixed inset-x-0 top-0 z-50 w-full border-b border-[var(--lux-border)] bg-[#FAF8F3]/96 text-[#101820] shadow-[0_2px_16px_rgba(16,24,32,0.06)] backdrop-blur-md transition-all duration-300 dark:bg-[#101820]/96 dark:text-[#FAF8F3]'
    : 'sticky top-0 z-50 w-full border-b border-[var(--lux-border)] bg-[var(--lux-bg)]/96 text-[var(--lux-text)] shadow-[0_2px_12px_rgba(16,24,32,0.05)] backdrop-blur-md transition-all duration-300';

  const renderNavButton = (item: (typeof navItems)[number], labelNode: ReactNode) => {
    if (!item.enabled) {
      return (
        <span
          key={item.key}
          data-target-page={item.targetPage}
          className="unavailable whitespace-nowrap px-2.5 py-2 text-xs"
        >
          {labelNode}
        </span>
      );
    }

    return (
      <span key={item.key} data-target-page={item.targetPage} className="shrink-0">
        <button
          type="button"
          onClick={() => navigateTo(item.href)}
          aria-current={item.active ? 'page' : undefined}
          className={`group relative whitespace-nowrap border-0 bg-transparent px-2.5 py-2 text-[13px] font-medium tracking-[0.015em] transition-colors xl:px-3 ${item.active
            ? isOverlayHero
              ? 'font-semibold text-[#FAF8F3]'
              : 'font-semibold text-[#154C42] dark:text-[#FAF8F3]'
            : isOverlayHero
              ? 'text-[#FAF8F3]/82 hover:text-[#FAF8F3]'
              : 'text-[#4E5B66] hover:text-[#101820] dark:text-[#A3B0BA] dark:hover:text-[#FAF8F3]'
            }`}
        >
          {labelNode}
          <span
            aria-hidden="true"
            className={`absolute inset-x-2.5 bottom-0.5 h-[1.5px] bg-[var(--brand-accent,#FF783D)] transition-transform duration-300 ${item.active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}
          />
        </button>
      </span>
    );
  };

  return (
    <header data-design-section="navbar" className={headerClasses}>
      <div className="lux-container flex h-[72px] items-center justify-between gap-4">
        {/* Brand Lockup — clean editorial proportion, zero truncation */}
        <button
          type="button"
          onClick={() => navigateTo('/')}
          className="group flex shrink-0 items-center gap-2.5 border-0 bg-transparent p-0 text-left"
        >
          <img
            src={withBasePath(logoUrl)}
            alt={siteTitle}
            data-preview-field-path="common.logoUrl"
            className="h-8 w-8 shrink-0 rounded object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="flex flex-col whitespace-nowrap">
            <span
              data-preview-field-path="common.websiteTitle"
              className="font-display text-[14px] font-bold uppercase leading-tight tracking-[0.16em] sm:text-[15px]"
            >
              {siteTitle}
            </span>
            <span
              data-preview-field-path="common.tagline"
              className={`text-[9.5px] font-medium uppercase tracking-[0.2em] ${isOverlayHero ? 'text-[#C5A46D]' : 'text-[#967742] dark:text-[#C5A46D]'
                }`}
              style={{ minHeight: '1.05em' }}
            >
              {tagline}
            </span>
          </span>
        </button>

        {/* Single-line Desktop Navigation */}
        <nav className="hidden items-center gap-0.5 whitespace-nowrap lg:flex xl:gap-1.5">
          {renderNavButton(
            navItems[0],
            <span data-preview-field-path="common.navLabels.home">
              {contentText(navLabels.home) || 'Home'}
            </span>,
          )}
          {renderNavButton(
            navItems[1],
            <span data-preview-field-path="common.navLabels.destinations">
              {contentText(navLabels.destinations) || 'Destinations'}
            </span>,
          )}
          {renderNavButton(
            navItems[2],
            <span data-preview-field-path="common.navLabels.packages">
              {contentText(navLabels.packages) || 'Tour Packages'}
            </span>,
          )}
          {renderNavButton(
            navItems[3],
            <span data-preview-field-path="common.navLabels.experiences">
              {contentText(navLabels.experiences) || 'Experiences'}
            </span>,
          )}
          {renderNavButton(
            navItems[4],
            <span data-preview-field-path="common.navLabels.services">
              {contentText(navLabels.services) || 'Services'}
            </span>,
          )}
          {renderNavButton(
            navItems[5],
            <span data-preview-field-path="common.navLabels.about_us">
              {contentText(navLabels.about_us) || 'About Us'}
            </span>,
          )}
          {renderNavButton(
            navItems[6],
            <span data-preview-field-path="common.navLabels.contact">
              {contentText(navLabels.contact) || 'Contact'}
            </span>,
          )}
        </nav>

        {/* Right Controls: Theme Toggle + Refined Plan Your Trip CTA + Mobile Trigger */}
        <div className="flex shrink-0 items-center gap-2.5">
          <ThemeToggle
            className={
              isOverlayHero
                ? '!rounded-md !border-white/25 !bg-[#101820]/35 !text-[#FAF8F3] backdrop-blur-sm hover:!border-[#C5A46D] hover:!text-[#C5A46D]'
                : '!rounded-md !border-[var(--lux-border-strong)] !bg-transparent hover:!border-[var(--brand-accent,#FF783D)] hover:!text-[var(--brand-accent,#FF783D)]'
            }
          />

          {hasContact ? (
            <span data-target-page="contact" className="hidden sm:inline-flex">
              <button
                type="button"
                onClick={() => navigateTo('/#tailor-made')}
                className="font-display inline-flex min-h-[38px] items-center justify-center whitespace-nowrap rounded-md border border-[var(--brand-accent,#FF783D)] bg-[var(--brand-accent,#FF783D)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.11em] text-white transition-colors duration-200 hover:bg-[#EA662C]"
              >
                <span data-preview-field-path="common.headerCtaLabel">{headerCtaLabel}</span>
              </button>
            </span>
          ) : (
            <span
              data-target-page="contact"
              data-preview-field-path="common.headerCtaLabel"
              className="unavailable hidden whitespace-nowrap text-xs sm:inline-flex"
            >
              {headerCtaLabel}
            </span>
          )}

          <button
            ref={menuButtonRef}
            type="button"
            data-preview-static="mobile-menu-toggle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition lg:hidden ${isOverlayHero
              ? 'border-white/25 bg-[#101820]/35 text-[#FAF8F3] backdrop-blur-sm hover:border-[#C5A46D]'
              : 'border-[var(--lux-border-strong)] bg-transparent text-[var(--lux-text)] hover:border-[var(--brand-accent,#FF783D)]'
              }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Accessible Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-[72px] z-50 max-h-[calc(100vh-72px)] overflow-y-auto border-b border-white/10 bg-[#101820]/98 px-6 py-6 text-[#FAF8F3] shadow-xl backdrop-blur-lg lg:hidden">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <span
              data-preview-static="mobile-menu-heading"
              className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#C5A46D]"
            >
              Explore Ceylon Odyssey
            </span>
            <button
              ref={drawerCloseRef}
              type="button"
              data-preview-static="mobile-menu-close"
              aria-label="Close menu"
              onClick={() => {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              className="rounded border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#FAF8F3] hover:border-[#FF783D]"
            >
              Close
            </button>
          </div>

          <div className="flex flex-col">
            {navItems.map((item) => {
              const label = contentText(navLabels[item.labelKey]) || item.fallback;
              if (!item.enabled) return null;
              return (
                <button
                  key={`mobile-${item.key}`}
                  type="button"
                  onClick={() => navigateTo(item.href)}
                  className={`flex min-h-[48px] w-full items-center justify-between border-0 border-b border-white/10 bg-transparent px-1 py-2.5 text-left text-sm font-semibold tracking-[0.04em] ${item.active ? 'text-[#FF783D]' : 'text-[#FAF8F3]/90 hover:text-[#FF783D]'
                    }`}
                >
                  <span>{label}</span>
                  <span aria-hidden="true" className="text-[#C5A46D]">→</span>
                </button>
              );
            })}
          </div>

          {hasContact && (
            <button
              type="button"
              data-preview-static="mobile-menu-plan-cta"
              onClick={() => navigateTo('/#tailor-made')}
              className="lux-btn-sunset mt-5 w-full"
            >
              {headerCtaLabel}
            </button>
          )}
        </div>
      )}
    </header>
  );
}

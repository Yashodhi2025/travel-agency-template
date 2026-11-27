'use client';

import { useMemo, useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { buildWhatsAppEnquiryUrl, journalDetailHref } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

const JOURNAL_CATEGORIES = [
  { id: 'All', label: 'All Guides', match: [] as string[] },
  { id: 'Destination Guides', label: 'Destination Guides', match: ['destination', 'ella', 'highland', 'weekend', 'guide'] },
  { id: 'Travel Planning', label: 'Travel Planning', match: ['planning', 'etiquette', 'visa', 'route', 'first'] },
  { id: 'Culture & Heritage', label: 'Culture & Heritage', match: ['culture', 'heritage', 'temple', 'sigiriya', 'kandy'] },
  { id: 'Wildlife & Nature', label: 'Wildlife & Nature', match: ['wildlife', 'safari', 'yala', 'wilpattu', 'nature'] },
  { id: 'Food & Experiences', label: 'Food & Experiences', match: ['food', 'culinary', 'spice', 'tea', 'experience'] },
  { id: 'Family Travel', label: 'Family Travel', match: ['family', 'children', 'kids'] },
  { id: 'Seasonal Travel', label: 'Seasonal Travel', match: ['seasonal', 'monsoon', 'weather', 'month'] },
];

export default function JournalPage() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const page = contentObject(content.journalPage);
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
  const hasJournal = selectedPages.includes('journal');
  const hasPlanner = selectedPages.includes('plan_your_trip');
  const plannerTarget = hasPlanner ? '/plan-your-trip/' : '/#tailor-made';

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const articles = useMemo(
    () =>
      contentList(home.journalPosts).map((raw, idx) => {
        const item = contentObject(raw);
        return {
          index: idx,
          id: contentText(item.id),
          title: contentText(item.title),
          category: contentText(item.category),
          readingTime: contentText(item.readingTime),
          excerpt: contentText(item.excerpt),
          imageUrl: contentText(item.imageUrl) || '/images/hero-coast.webp',
          imageAlt: contentText(item.imageAlt),
          ctaLabel: contentText(item.ctaLabel) || 'Read Article',
        };
      }),
    [home.journalPosts],
  );

  const filteredArticles = useMemo(() => {
    if (isEditorPreview) return articles;
    return articles.filter((article) => {
      if (selectedCategory !== 'All') {
        const catDef = JOURNAL_CATEGORIES.find((c) => c.id === selectedCategory);
        const hay = `${article.category} ${article.title} ${article.excerpt}`.toLowerCase();
        if (catDef && catDef.match.length > 0 && !catDef.match.some((kw) => hay.includes(kw))) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${article.title} ${article.category} ${article.excerpt}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [articles, isEditorPreview, selectedCategory, searchQuery]);

  const showFeatured =
    !isEditorPreview &&
    selectedCategory === 'All' &&
    !searchQuery.trim() &&
    filteredArticles.length > 0;
  const featuredArticle = showFeatured ? filteredArticles[0] : null;
  const gridArticles = showFeatured ? filteredArticles.slice(1) : filteredArticles;

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);
  const whatsappUrl = buildWhatsAppEnquiryUrl(
    agencyWhatsApp,
    `Hello ${brandName}, I was reading your Sri Lanka travel guides and would like help planning a trip.`,
  );

  const bannerImageUrl = contentText(page.bannerImageUrl) || '/images/hero-coast.webp';
  const bannerImageAlt =
    contentText(page.bannerImageAlt) || contentText(page.heading) || 'Sri Lanka travel journal';

  return (
    <div data-preview-page-key="journal">
      {/* Compact Editorial Hero */}
      <section
        data-design-section="journal-hero"
        className="relative isolate flex min-h-[38vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={bannerImageUrl}
            alt={bannerImageAlt}
            data-preview-field-path="journalPage.bannerImageUrl"
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
              data-preview-static="journal-breadcrumb-home"
              className="text-[#FAF8F3]/80 no-underline transition hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <EditableText
              as="span"
              color="#C5A46D"
              className="font-semibold text-[#C5A46D]"
              data-preview-field-path="journalPage.breadcrumbLabel"
              defaultValue={contentText(page.breadcrumbLabel) || 'Travel Journal'}
            />
          </div>

          <div className="max-w-3xl">
            <div className="mb-2.5">
              <EditableText
                as="span"
                color="#C5A46D"
                className="lux-eyebrow !text-[#C5A46D]"
                data-preview-field-path="journalPage.eyebrow"
                defaultValue={contentText(page.eyebrow) || 'TRAVEL JOURNAL'}
              />
            </div>

            <EditableText
              as="h1"
              variant="h1"
              color="#FAF8F3"
              className="font-display m-0 mb-2.5 text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#FAF8F3] sm:text-4xl lg:text-5xl"
              data-preview-field-path="journalPage.heading"
              defaultValue={contentText(page.heading) || 'Stories, Guides & Island Planning Notes'}
            />

            <EditableText
              as="p"
              color="#E8DDC8"
              className="m-0 mb-2 text-base font-medium text-[#E8DDC8] sm:text-lg"
              data-preview-field-path="journalPage.subtitle"
              defaultValue={contentText(page.subtitle)}
            />

            <EditableText
              as="p"
              color="rgba(250, 248, 243, 0.8)"
              className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/80"
              data-preview-field-path="journalPage.description"
              defaultValue={contentText(page.description)}
            />

            {isEditorPreview && (
              <div className="mt-3 space-y-1 rounded border border-dashed border-white/25 bg-[#101820]/65 px-3 py-2 text-[11px] text-[#A3B0BA]">
                <div>
                  <span data-preview-static="journal-hero-alt-label">Hero alt: </span>
                  <span data-preview-field-path="journalPage.bannerImageAlt">{bannerImageAlt}</span>
                </div>
                <div>
                  <span data-preview-static="journal-featured-label-editor">Featured badge: </span>
                  <span data-preview-field-path="journalPage.featuredLabel">
                    {contentText(page.featuredLabel) || 'Featured Guide'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Journal Directory */}
      <section className="lux-section bg-[var(--lux-bg)]" data-design-section="journal-articles">
        <div className="lux-container">
          {/* Category Filters + Search */}
          {!isEditorPreview && articles.length > 0 && (
            <div className="mb-8 flex flex-col gap-4 border-b border-[var(--lux-border)] pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {JOURNAL_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      data-preview-static="journal-category-filter"
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

              <div className="flex items-center gap-2">
                <label htmlFor="journal-search" data-preview-static="journal-search-label" className="sr-only">
                  Search travel journal articles
                </label>
                <input
                  id="journal-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guides (e.g. monsoon, Ella, safari)..."
                  data-preview-static="journal-search-input"
                  className="lux-input !min-h-[38px] sm:w-64"
                />
                {(selectedCategory !== 'All' || searchQuery.trim()) && (
                  <button
                    type="button"
                    data-preview-static="journal-reset-btn"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="lux-btn-outline !min-h-[38px] !px-3.5 !text-[11px]"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Featured Editorial Article (Live, Unfiltered) */}
          {featuredArticle && (
            <article className="mb-10 grid grid-cols-1 overflow-hidden rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] shadow-[var(--lux-shadow-sm)] lg:grid-cols-12">
              <div className="lux-image-zoom relative aspect-[16/10] overflow-hidden bg-[#101820] lg:col-span-6 lg:aspect-auto">
                <a
                  href={
                    hasJournal
                      ? journalDetailHref(featuredArticle.id, featuredArticle.title, featuredArticle.index)
                      : withBasePath('/#stories')
                  }
                  className="block h-full w-full"
                >
                  <EditableImage
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.imageAlt || featuredArticle.title}
                    data-preview-field-path={`home.journalPosts[${featuredArticle.index}].imageUrl`}
                    fit="cover"
                    className="h-full w-full object-cover"
                  />
                </a>
                <span
                  data-preview-field-path="journalPage.featuredLabel"
                  className="font-display absolute left-4 top-4 rounded bg-[#154C42] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FAF8F3]"
                >
                  {contentText(page.featuredLabel) || 'Featured Guide'}
                </span>
              </div>

              <div className="flex flex-col justify-center gap-3 p-6 sm:p-8 lg:col-span-6">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em]">
                  <span
                    data-preview-field-path={`home.journalPosts[${featuredArticle.index}].category`}
                    className="text-[var(--lux-tropical)]"
                  >
                    {featuredArticle.category}
                  </span>
                  {featuredArticle.readingTime && (
                    <>
                      <span aria-hidden="true" className="text-[var(--lux-text-muted)]">·</span>
                      <span
                        data-preview-field-path={`home.journalPosts[${featuredArticle.index}].readingTime`}
                        className="text-[var(--lux-gold-deep)] dark:text-[#C5A46D]"
                      >
                        {featuredArticle.readingTime}
                      </span>
                    </>
                  )}
                </div>

                <a
                  href={
                    hasJournal
                      ? journalDetailHref(featuredArticle.id, featuredArticle.title, featuredArticle.index)
                      : withBasePath('/#stories')
                  }
                  className="text-inherit no-underline hover:text-[var(--brand-accent,#FF783D)]"
                >
                  <EditableText
                    as="h2"
                    className="font-display m-0 text-2xl font-bold leading-snug text-[var(--lux-text)] transition-colors hover:text-[var(--brand-accent,#FF783D)] sm:text-3xl"
                    data-preview-field-path={`home.journalPosts[${featuredArticle.index}].title`}
                    defaultValue={featuredArticle.title}
                  />
                </a>

                <EditableText
                  as="p"
                  className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)] sm:text-[15px]"
                  data-preview-field-path={`home.journalPosts[${featuredArticle.index}].excerpt`}
                  defaultValue={featuredArticle.excerpt}
                />

                <div className="pt-2">
                  <a
                    href={
                      hasJournal
                        ? journalDetailHref(featuredArticle.id, featuredArticle.title, featuredArticle.index)
                        : withBasePath('/#stories')
                    }
                    data-preview-static="journal-featured-read-link"
                    className="lux-btn-tropical"
                  >
                    {featuredArticle.ctaLabel || 'Read Article'} →
                  </a>
                </div>
              </div>
            </article>
          )}

          {/* Responsive Editorial Grid */}
          <div
            data-preview-list-path="home.journalPosts"
            className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3"
          >
            {articles.length === 0 && (
              <div className="col-span-full rounded-[6px] border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="journal-empty-title" className="font-display m-0 mb-1.5 text-lg font-bold text-[var(--lux-text)]">
                  No Travel Journal Articles Yet
                </p>
                <p data-preview-static="journal-empty-body" className="m-0 text-sm text-[var(--lux-text-muted)]">
                  Add destination guides, seasonal travel notes, and planning articles in Fivora.
                </p>
              </div>
            )}

            {articles.length > 0 && filteredArticles.length === 0 && !isEditorPreview && (
              <div className="col-span-full rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="journal-no-results-title" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                  No Guides Match Your Search
                </p>
                <p data-preview-static="journal-no-results-body" className="m-0 mb-5 text-sm text-[var(--lux-text-muted)]">
                  Try another topic or reset filters to browse all Sri Lanka planning guides.
                </p>
                <button
                  type="button"
                  data-preview-static="journal-no-results-reset"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="lux-btn-outline !min-h-[40px]"
                >
                  Show All Articles
                </button>
              </div>
            )}

            {gridArticles.map((article) => {
              const detailUrl = hasJournal
                ? journalDetailHref(article.id, article.title, article.index)
                : withBasePath('/#stories');

              return (
                <article
                  key={article.id || article.index}
                  data-preview-item-path={`home.journalPosts[${article.index}]`}
                  className="group flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] transition-shadow duration-300 hover:shadow-[var(--lux-shadow-md)]"
                >
                  <div className="lux-image-zoom relative aspect-[16/10] w-full overflow-hidden bg-[#101820]">
                    {isEditorPreview ? (
                      <EditableImage
                        src={article.imageUrl}
                        alt={article.imageAlt || article.title}
                        data-preview-field-path={`home.journalPosts[${article.index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <a href={detailUrl} className="block h-full w-full">
                        <EditableImage
                          src={article.imageUrl}
                          alt={article.imageAlt || article.title}
                          data-preview-field-path={`home.journalPosts[${article.index}].imageUrl`}
                          fit="cover"
                          className="h-full w-full object-cover"
                        />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2.5 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em]">
                      <span
                        data-preview-field-path={`home.journalPosts[${article.index}].category`}
                        className="text-[var(--lux-tropical)]"
                      >
                        {article.category}
                      </span>
                      {article.readingTime && (
                        <span
                          data-preview-field-path={`home.journalPosts[${article.index}].readingTime`}
                          className="text-[var(--lux-gold-deep)] dark:text-[#C5A46D]"
                        >
                          {article.readingTime}
                        </span>
                      )}
                    </div>

                    {isEditorPreview ? (
                      <EditableText
                        as="h2"
                        className="font-display m-0 text-lg font-bold leading-snug text-[var(--lux-text)]"
                        data-preview-field-path={`home.journalPosts[${article.index}].title`}
                        defaultValue={article.title}
                      />
                    ) : (
                      <a href={detailUrl} className="text-inherit no-underline hover:text-[var(--brand-accent,#FF783D)]">
                        <EditableText
                          as="h2"
                          className="font-display m-0 text-lg font-bold leading-snug text-[var(--lux-text)] transition-colors hover:text-[var(--brand-accent,#FF783D)]"
                          data-preview-field-path={`home.journalPosts[${article.index}].title`}
                          defaultValue={article.title}
                        />
                      </a>
                    )}

                    <EditableText
                      as="p"
                      className="m-0 mb-2 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path={`home.journalPosts[${article.index}].excerpt`}
                      defaultValue={article.excerpt}
                    />

                    <div className="mt-auto border-t border-[var(--lux-border)] pt-3.5">
                      <a
                        href={detailUrl}
                        data-preview-static="journal-card-read-link"
                        className="lux-link-underline"
                      >
                        Read Article →
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Planning CTA */}
      <section className="lux-section lux-section-tropical" data-design-section="journal-cta">
        <div className="lux-container">
          <Reveal variant="fade-up">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <EditableText
                  as="h2"
                  color="#FAF8F3"
                  className="font-display m-0 mb-2 text-2xl font-bold text-[#FAF8F3] sm:text-3xl"
                  data-preview-field-path="journalPage.ctaHeading"
                  defaultValue={
                    contentText(page.ctaHeading) || 'Inspired to Turn These Ideas Into a Real Route?'
                  }
                />
                <EditableText
                  as="p"
                  color="rgba(250, 248, 243, 0.82)"
                  className="m-0 text-sm leading-relaxed text-[#FAF8F3]/82 sm:text-base"
                  data-preview-field-path="journalPage.ctaBody"
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
                  <span data-preview-field-path="journalPage.ctaLabel">
                    {contentText(page.ctaLabel) || 'Open Trip Planner'}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="journal-bottom-whatsapp-cta"
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

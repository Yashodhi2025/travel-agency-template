'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  contentList,
  contentObject,
  contentText,
  platformProductDetailHref,
  useProducts,
  useSiteData,
} from '@/lib/siteDataContext';
import {
  buildWhatsAppEnquiryUrl,
  destinationDetailHref,
  formatMoney,
  journalDetailHref,
  resolveItemIdentifier,
  saveTripEnquiryDraft,
  slugifyKey,
  splitDelimitedItems,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';

function JournalDetailContent() {
  const searchParams = useSearchParams();
  const requestedId = (searchParams.get('id') ?? '').trim();

  const siteData = useSiteData();
  const allProducts = useProducts();
  const content = contentObject(siteData?.content);
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
  const hasDestinations = selectedPages.includes('destinations');
  const hasPlanner = selectedPages.includes('plan_your_trip');
  const journalBackHref = hasJournal ? '/journal/' : '/#stories';
  const plannerTarget = hasPlanner ? '/plan-your-trip/' : '/#tailor-made';

  const articles = useMemo(
    () =>
      contentList(home.journalPosts).map((raw, idx) => {
        const item = contentObject(raw);
        return {
          index: idx,
          id: contentText(item.id),
          slug: resolveItemIdentifier(contentText(item.id), contentText(item.title), idx),
          title: contentText(item.title),
          category: contentText(item.category),
          readingTime: contentText(item.readingTime),
          excerpt: contentText(item.excerpt),
          intro: contentText(item.intro),
          imageUrl: contentText(item.imageUrl) || '/images/hero-coast.webp',
          imageAlt: contentText(item.imageAlt),
          sections: contentList(item.sections).map((s) => {
            const sec = contentObject(s);
            return {
              heading: contentText(sec.heading),
              body: contentText(sec.body),
              imageUrl: contentText(sec.imageUrl),
              caption: contentText(sec.caption),
            };
          }),
          practicalTips: splitDelimitedItems(contentText(item.practicalTips)),
          relatedDestinationId: contentText(item.relatedDestinationId),
          relatedPackageId: contentText(item.relatedPackageId),
        };
      }),
    [home.journalPosts],
  );

  const article = useMemo(() => {
    if (!requestedId) return articles[0] ?? null;
    const norm = slugifyKey(requestedId);
    const found = articles.find(
      (a) =>
        a.slug === norm ||
        slugifyKey(a.id) === norm ||
        slugifyKey(a.title) === norm ||
        String(a.index) === requestedId,
    );
    return found ?? null;
  }, [articles, requestedId]);

  if (!article) {
    return (
      <div className="lux-container flex min-h-[55vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 data-preview-static="journal-not-found-title" className="font-display m-0 text-3xl font-bold text-[var(--lux-text)]">
          Article Not Found
        </h1>
        <p data-preview-static="journal-not-found-body" className="m-0 max-w-md text-sm text-[var(--lux-text-muted)]">
          This travel guide could not be found or may have been updated. Browse all Sri Lanka journal guides below.
        </p>
        <a
          href={withBasePath(journalBackHref)}
          data-preview-static="journal-not-found-back"
          className="lux-btn-tropical mt-2"
        >
          Browse Travel Journal
        </a>
      </div>
    );
  }

  const allDestinations = contentList(home.destinations).map((raw, idx) => {
    const d = contentObject(raw);
    return {
      index: idx,
      id: contentText(d.id),
      slug: resolveItemIdentifier(contentText(d.id), contentText(d.name), idx),
      name: contentText(d.name),
      region: contentText(d.region),
      shortDescription: contentText(d.shortDescription),
      imageUrl: contentText(d.imageUrl) || '/images/hero-sigiriya.webp',
    };
  });

  const matchedDestination = article.relatedDestinationId
    ? allDestinations.find((d) => d.slug === slugifyKey(article.relatedDestinationId) || d.id === article.relatedDestinationId)
    : allDestinations[0];

  const matchedPackageRaw = article.relatedPackageId
    ? allProducts.find((p) => contentText(contentObject(p).id) === article.relatedPackageId)
    : allProducts[0];
  const matchedPackage = matchedPackageRaw ? contentObject(matchedPackageRaw) : null;

  const relatedArticles = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);
  const whatsappHref = buildWhatsAppEnquiryUrl(
    agencyWhatsApp,
    `Hello ${brandName}, I just read "${article.title}" and would like help planning a Sri Lanka trip.`,
  );

  const handlePlanFromArticle = () => {
    saveTripEnquiryDraft({
      destination: matchedDestination?.name || undefined,
      travelStyle: article.category || undefined,
      sourceLabel: `Journal Guide: ${article.title}`,
    });
    window.location.href = withBasePath(plannerTarget);
  };

  return (
    <article className="pb-16">
      {/* Large Editorial Cover Hero */}
      <section className="relative isolate flex min-h-[48vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]">
        <img
          src={withBasePath(article.imageUrl)}
          alt={article.imageAlt || article.title}
          data-preview-static="journal-detail-cover-img"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#101820]/96 via-[#101820]/50 to-[#101820]/30"
        />

        <div className="lux-container relative z-10 pb-10 pt-20">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.08em] text-[#FAF8F3]/78">
            <a
              href={withBasePath('/')}
              data-preview-static="journal-detail-bc-home"
              className="text-[#FAF8F3]/80 no-underline hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <a
              href={withBasePath(journalBackHref)}
              data-preview-static="journal-detail-bc-list"
              className="text-[#FAF8F3]/80 no-underline hover:text-[#C5A46D]"
            >
              Travel Journal
            </a>
            <span aria-hidden="true">/</span>
            <span data-preview-static="journal-detail-bc-current" className="font-semibold text-[#C5A46D]">
              {article.category || 'Guide'}
            </span>
          </div>

          <div className="mb-2.5 flex flex-wrap items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em]">
            {article.category && (
              <span data-preview-static="journal-detail-category" className="text-[#C5A46D]">
                {article.category}
              </span>
            )}
            {article.readingTime && (
              <>
                <span aria-hidden="true" className="text-white/40">·</span>
                <span data-preview-static="journal-detail-readtime" className="text-[#FF783D]">
                  {article.readingTime}
                </span>
              </>
            )}
          </div>

          <h1
            data-preview-static="journal-detail-title"
            className="font-display m-0 max-w-3xl text-3xl font-bold leading-[1.12] sm:text-4xl lg:text-5xl"
          >
            {article.title}
          </h1>
        </div>
      </section>

      {/* Readable Editorial Body + Compact Sidebar */}
      <div className="lux-container pt-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left 8 Columns: Readable Article Column */}
          <div className="lg:col-span-8">
            <div className="max-w-[68ch] space-y-8">
              {/* Article Introduction */}
              <p
                data-preview-static="journal-detail-intro"
                className="m-0 border-l-2 border-[#C5A46D] pl-5 text-base font-medium leading-[1.85] text-[var(--lux-text)] sm:text-lg"
              >
                {article.intro || article.excerpt}
              </p>

              {/* Editable Structured Sections (No Raw HTML Rendering) */}
              {article.sections.map((section, idx) => (
                <section key={idx} className="space-y-4 border-t border-[var(--lux-border)] pt-7">
                  {section.heading && (
                    <h2
                      data-preview-static="journal-section-heading"
                      className="font-display m-0 text-xl font-bold leading-snug text-[var(--lux-text)] sm:text-2xl"
                    >
                      {section.heading}
                    </h2>
                  )}
                  {section.body && (
                    <p
                      data-preview-static="journal-section-body"
                      className="m-0 text-[15px] leading-[1.85] text-[var(--lux-text-muted)]"
                    >
                      {section.body}
                    </p>
                  )}
                  {section.imageUrl && (
                    <figure className="m-0 overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)]">
                      <img
                        src={withBasePath(section.imageUrl)}
                        alt={section.caption || section.heading || article.title}
                        loading="lazy"
                        data-preview-static="journal-section-image"
                        className="aspect-[16/10] w-full object-cover"
                      />
                      {section.caption && (
                        <figcaption
                          data-preview-static="journal-section-caption"
                          className="px-4 py-2.5 text-xs text-[var(--lux-text-muted)]"
                        >
                          {section.caption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </section>
              ))}

              {/* Practical Travel Tips Box */}
              {article.practicalTips.length > 0 && (
                <section className="rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface-alt)] p-6">
                  <h2 data-preview-static="journal-tips-heading" className="font-display m-0 mb-3.5 text-lg font-bold text-[var(--lux-text)]">
                    Practical Travel Tips
                  </h2>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm leading-relaxed text-[var(--lux-text-muted)]">
                    {article.practicalTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span aria-hidden="true" className="font-bold text-[#154C42] dark:text-[#FF783D]">✦</span>
                        <span data-preview-static="journal-tip-item">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          {/* Right 4 Columns: Planning Sidebar & Recommended Destination / Tour */}
          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-sm)]">
              <span data-preview-static="journal-aside-eyebrow" className="font-display mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                Turn Inspiration Into a Plan
              </span>
              <h2 data-preview-static="journal-aside-title" className="font-display m-0 mb-2 text-xl font-bold text-[var(--lux-text)]">
                Plan a Trip Around This Guide
              </h2>
              <p data-preview-static="journal-aside-body" className="m-0 mb-5 text-xs leading-relaxed text-[var(--lux-text-muted)]">
                Share your preferred months, group size, and pickup location — we will tailor a realistic Sri Lanka itinerary around your pace.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  data-preview-static="journal-aside-plan-btn"
                  onClick={handlePlanFromArticle}
                  className="lux-btn-tropical w-full"
                >
                  Plan Your Trip
                </button>
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="journal-aside-whatsapp-btn"
                    className="lux-btn-sunset w-full"
                  >
                    Ask on WhatsApp ↗
                  </a>
                )}
              </div>

              <div className="mt-5 border-t border-[var(--lux-border)] pt-4">
                <a
                  href={withBasePath(journalBackHref)}
                  data-preview-static="journal-aside-back"
                  className="lux-link-underline"
                >
                  ← Back to Travel Journal
                </a>
              </div>
            </div>

            {/* Recommended Destination Card */}
            {matchedDestination && (
              <div className="overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)]">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={withBasePath(matchedDestination.imageUrl)}
                    alt={matchedDestination.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <span data-preview-static="journal-rec-dest-label" className="font-display block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lux-teal)]">
                    Recommended Destination
                  </span>
                  <h3 data-preview-static="journal-rec-dest-name" className="font-display mt-1 mb-1 text-base font-bold text-[var(--lux-text)]">
                    {matchedDestination.name}
                  </h3>
                  <p data-preview-static="journal-rec-dest-desc" className="m-0 mb-3 line-clamp-2 text-xs text-[var(--lux-text-muted)]">
                    {matchedDestination.shortDescription}
                  </p>
                  <a
                    href={
                      hasDestinations
                        ? destinationDetailHref(
                            matchedDestination.id,
                            matchedDestination.name,
                            matchedDestination.index,
                          )
                        : withBasePath('/#destinations')
                    }
                    data-preview-static="journal-rec-dest-link"
                    className="lux-link-underline"
                  >
                    Explore {matchedDestination.name} →
                  </a>
                </div>
              </div>
            )}

            {/* Recommended Tour Package Card */}
            {matchedPackage && (
              <div className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-4">
                <span data-preview-static="journal-rec-tour-label" className="font-display block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                  Suggested Tour Package
                </span>
                <h3 data-preview-static="journal-rec-tour-name" className="font-display mt-1 mb-1 text-base font-bold text-[var(--lux-text)]">
                  {contentText(matchedPackage.name)}
                </h3>
                <p data-preview-static="journal-rec-tour-meta" className="m-0 mb-3 text-xs text-[var(--lux-text-muted)]">
                  {[
                    contentText(matchedPackage.duration),
                    matchedPackage.showPrice !== false && Number(matchedPackage.price) > 0
                      ? formatMoney(Number(matchedPackage.price), contentText(matchedPackage.currency) || 'LKR')
                      : 'Request a Quote',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <a
                  href={platformProductDetailHref(
                    typeof matchedPackage.id === 'string' || typeof matchedPackage.id === 'number'
                      ? matchedPackage.id
                      : null,
                  )}
                  data-preview-static="journal-rec-tour-link"
                  className="lux-link-underline"
                >
                  View Package Itinerary →
                </a>
              </div>
            )}
          </aside>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-14 border-t border-[var(--lux-border)] pt-10">
            <h2 data-preview-static="journal-related-heading" className="font-display m-0 mb-6 text-2xl font-bold text-[var(--lux-text)]">
              More From the Travel Journal
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedArticles.map((rel) => {
                const relHref = hasJournal
                  ? journalDetailHref(rel.id, rel.title, rel.index)
                  : withBasePath('/#stories');
                return (
                  <a
                    key={rel.slug}
                    href={relHref}
                    data-preview-static="journal-related-card-link"
                    className="group flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] text-inherit no-underline transition hover:shadow-[var(--lux-shadow-md)]"
                  >
                    <div className="lux-image-zoom aspect-[16/10] w-full overflow-hidden">
                      <img
                        src={withBasePath(rel.imageUrl)}
                        alt={rel.imageAlt || rel.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--lux-tropical)]">
                        {[rel.category, rel.readingTime].filter(Boolean).join(' · ')}
                      </span>
                      <h3 className="font-display mt-1 mb-1 text-base font-bold text-[var(--lux-text)] group-hover:text-[var(--brand-accent,#FF783D)]">
                        {rel.title}
                      </h3>
                      <p className="m-0 line-clamp-2 text-xs text-[var(--lux-text-muted)]">
                        {rel.excerpt}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export default function JournalDetailPage() {
  return (
    <Suspense
      fallback={
        <div role="status" className="lux-container flex min-h-[50vh] items-center justify-center py-16 text-sm text-[var(--lux-text-muted)]">
          <span data-preview-static="journal-detail-loading">Loading travel guide…</span>
        </div>
      }
    >
      <JournalDetailContent />
    </Suspense>
  );
}

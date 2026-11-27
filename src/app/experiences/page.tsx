'use client';

import { useMemo, useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import {
  buildWhatsAppEnquiryUrl,
  experienceDetailHref,
  saveTripEnquiryDraft,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

const EXPERIENCE_CATEGORIES = [
  { id: 'All', label: 'All Experiences', match: [] as string[] },
  { id: 'Wildlife', label: 'Wildlife Safaris', match: ['wildlife', 'safari', 'yala', 'wilpattu'] },
  { id: 'Heritage', label: 'Cultural & Heritage', match: ['cultural', 'heritage', 'dance', 'kandy', 'temple'] },
  { id: 'Trains', label: 'Hill-Country Trains', match: ['train', 'rail', 'ella', 'highlands'] },
  { id: 'Hiking', label: 'Hiking & Adventure', match: ['hik', 'adventure', 'trek', 'knuckles', 'peak'] },
  { id: 'Coast', label: 'Beaches & Surf', match: ['surf', 'coast', 'ocean', 'beach', 'water'] },
  { id: 'Cuisine', label: 'Sri Lankan Cuisine', match: ['cook', 'gastron', 'culinar', 'spice', 'food'] },
  { id: 'Wellness', label: 'Ayurveda & Wellness', match: ['ayurveda', 'wellness', 'spa', 'yoga'] },
  { id: 'Tea', label: 'Tea Plantations', match: ['tea', 'estate', 'nuwara', 'ceylon'] },
];

export default function ExperiencesPage() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const page = contentObject(content.experiencesPage);
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
  const hasExperiences = selectedPages.includes('experiences');
  const plannerTarget = selectedPages.includes('plan_your_trip')
    ? '/plan-your-trip/'
    : '/#tailor-made';

  const [selectedCategory, setSelectedCategory] = useState('All');

  const experiences = contentList(home.experiences).map((raw, idx) => {
    const item = contentObject(raw);
    return {
      index: idx,
      id: contentText(item.id),
      title: contentText(item.title),
      category: contentText(item.category),
      location: contentText(item.location),
      duration: contentText(item.duration),
      bestSeason: contentText(item.bestSeason),
      description: contentText(item.description),
      imageUrl: contentText(item.imageUrl) || '/images/hero-ella.webp',
      imageAlt: contentText(item.imageAlt),
    };
  });

  const filteredExperiences = useMemo(() => {
    if (isEditorPreview || selectedCategory === 'All') return experiences;
    const catDef = EXPERIENCE_CATEGORIES.find((c) => c.id === selectedCategory);
    if (!catDef || catDef.match.length === 0) return experiences;
    return experiences.filter((exp) => {
      const hay = `${exp.category} ${exp.title} ${exp.location} ${exp.description}`.toLowerCase();
      return catDef.match.some((kw) => hay.includes(kw));
    });
  }, [experiences, isEditorPreview, selectedCategory]);

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);
  const whatsappUrl = buildWhatsAppEnquiryUrl(
    agencyWhatsApp,
    `Hello ${brandName}, I would like to include curated Sri Lankan experiences in my trip.`,
  );

  const bannerImageUrl = contentText(page.bannerImageUrl) || '/images/hero-tea.webp';
  const bannerImageAlt =
    contentText(page.bannerImageAlt) || contentText(page.heading) || 'Authentic Sri Lankan experiences';

  return (
    <div data-preview-page-key="experiences">
      {/* Compact Photographic Hero */}
      <section
        data-design-section="experiences-hero"
        className="relative isolate flex min-h-[38vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={bannerImageUrl}
            alt={bannerImageAlt}
            data-preview-field-path="experiencesPage.bannerImageUrl"
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
              data-preview-static="experiences-breadcrumb-home"
              className="text-[#FAF8F3]/80 no-underline transition hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <EditableText
              as="span"
              color="#C5A46D"
              className="font-semibold text-[#C5A46D]"
              data-preview-field-path="experiencesPage.breadcrumbLabel"
              defaultValue={contentText(page.breadcrumbLabel) || 'Experiences'}
            />
          </div>

          <div className="max-w-3xl">
            <div className="mb-2.5">
              <EditableText
                as="span"
                color="#C5A46D"
                className="lux-eyebrow !text-[#C5A46D]"
                data-preview-field-path="experiencesPage.eyebrow"
                defaultValue={contentText(page.eyebrow) || 'SIGNATURE EXPERIENCES'}
              />
            </div>

            <EditableText
              as="h1"
              variant="h1"
              color="#FAF8F3"
              className="font-display m-0 mb-2.5 text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#FAF8F3] sm:text-4xl lg:text-5xl"
              data-preview-field-path="experiencesPage.heading"
              defaultValue={contentText(page.heading) || 'Authentic Sri Lankan Moments'}
            />

            <EditableText
              as="p"
              color="#E8DDC8"
              className="m-0 mb-2 text-base font-medium text-[#E8DDC8] sm:text-lg"
              data-preview-field-path="experiencesPage.subtitle"
              defaultValue={contentText(page.subtitle)}
            />

            <EditableText
              as="p"
              color="rgba(250, 248, 243, 0.8)"
              className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/80"
              data-preview-field-path="experiencesPage.description"
              defaultValue={contentText(page.description)}
            />

            {isEditorPreview && (
              <div className="mt-3 inline-block rounded border border-dashed border-white/25 bg-[#101820]/65 px-2.5 py-1 text-[11px] text-[#A3B0BA]">
                <span data-preview-static="exp-hero-alt-label">Hero alt: </span>
                <span data-preview-field-path="experiencesPage.bannerImageAlt">{bannerImageAlt}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter Bar + Editorial Image-Led Experiences Grid */}
      <section className="lux-section bg-[var(--lux-bg)]" data-design-section="experiences-grid">
        <div className="lux-container">
          {!isEditorPreview && experiences.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-1.5 border-b border-[var(--lux-border)] pb-6">
              {EXPERIENCE_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    data-preview-static="experiences-category-filter"
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
          )}

          <div
            data-preview-list-path="home.experiences"
            className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3"
          >
            {experiences.length === 0 && (
              <div className="col-span-full rounded-[6px] border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="experiences-page-empty-title" className="font-display m-0 mb-1.5 text-lg font-bold text-[var(--lux-text)]">
                  No Experiences Configured Yet
                </p>
                <p data-preview-static="experiences-page-empty-body" className="m-0 text-sm text-[var(--lux-text-muted)]">
                  Add curated island experiences in Fivora to populate this gallery.
                </p>
              </div>
            )}

            {experiences.length > 0 && filteredExperiences.length === 0 && !isEditorPreview && (
              <div className="col-span-full rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="experiences-no-match-title" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                  No Experiences Found in That Category
                </p>
                <button
                  type="button"
                  data-preview-static="experiences-no-match-reset"
                  onClick={() => setSelectedCategory('All')}
                  className="lux-btn-outline !min-h-[40px]"
                >
                  Show All Experiences
                </button>
              </div>
            )}

            {filteredExperiences.map((exp) => {
              const detailUrl = hasExperiences
                ? experienceDetailHref(exp.id, exp.title, exp.index)
                : withBasePath('/#experiences');

              return (
                <article
                  key={exp.id || exp.index}
                  data-preview-item-path={`home.experiences[${exp.index}]`}
                  className="group flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] transition-shadow duration-300 hover:shadow-[var(--lux-shadow-md)]"
                >
                  <div className="lux-image-zoom relative aspect-[16/10] w-full overflow-hidden bg-[#101820]">
                    {isEditorPreview ? (
                      <EditableImage
                        src={exp.imageUrl}
                        alt={exp.imageAlt || exp.title}
                        data-preview-field-path={`home.experiences[${exp.index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <a href={detailUrl} className="block h-full w-full">
                        <EditableImage
                          src={exp.imageUrl}
                          alt={exp.imageAlt || exp.title}
                          data-preview-field-path={`home.experiences[${exp.index}].imageUrl`}
                          fit="cover"
                          className="h-full w-full object-cover"
                        />
                      </a>
                    )}
                    {exp.duration && (
                      <span
                        data-preview-field-path={`home.experiences[${exp.index}].duration`}
                        className="font-display absolute bottom-2.5 left-3 rounded bg-[#101820]/82 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.06em] text-[#FAF8F3] backdrop-blur-sm"
                      >
                        {exp.duration}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em]">
                      <span
                        data-preview-field-path={`home.experiences[${exp.index}].category`}
                        className="text-[var(--lux-gold-deep)] dark:text-[#C5A46D]"
                      >
                        {exp.category}
                      </span>
                      {exp.location && (
                        <span
                          data-preview-field-path={`home.experiences[${exp.index}].location`}
                          className="text-[var(--lux-teal)]"
                        >
                          {exp.location}
                        </span>
                      )}
                    </div>

                    {isEditorPreview ? (
                      <EditableText
                        as="h2"
                        className="font-display m-0 text-xl font-bold text-[var(--lux-text)]"
                        data-preview-field-path={`home.experiences[${exp.index}].title`}
                        defaultValue={exp.title}
                      />
                    ) : (
                      <a href={detailUrl} className="text-inherit no-underline hover:text-[var(--brand-accent,#FF783D)]">
                        <EditableText
                          as="h2"
                          className="font-display m-0 text-xl font-bold text-[var(--lux-text)] transition-colors hover:text-[var(--brand-accent,#FF783D)]"
                          data-preview-field-path={`home.experiences[${exp.index}].title`}
                          defaultValue={exp.title}
                        />
                      </a>
                    )}

                    <EditableText
                      as="p"
                      className="m-0 mb-3 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path={`home.experiences[${exp.index}].description`}
                      defaultValue={exp.description}
                    />

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--lux-border)] pt-3.5">
                      <a
                        href={detailUrl}
                        data-preview-static="experience-card-detail-link"
                        className="lux-link-underline"
                      >
                        Explore Experience →
                      </a>

                      {!isEditorPreview && (
                        <button
                          type="button"
                          data-preview-static="experience-card-enquire-btn"
                          onClick={() => {
                            saveTripEnquiryDraft({
                              experienceName: exp.title,
                              experiences: [exp.title],
                              destination: exp.location || undefined,
                              sourceLabel: `Experience: ${exp.title}`,
                            });
                            window.location.href = withBasePath(plannerTarget);
                          }}
                          className="border-0 bg-transparent p-0 text-xs font-semibold text-[var(--lux-text-muted)] hover:text-[var(--brand-accent,#FF783D)]"
                        >
                          Add to Trip
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Inquiry CTA */}
      <section className="lux-section lux-section-tropical" data-design-section="experiences-cta">
        <div className="lux-container">
          <Reveal variant="fade-up">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <EditableText
                  as="h2"
                  color="#FAF8F3"
                  className="font-display m-0 mb-2 text-2xl font-bold text-[#FAF8F3] sm:text-3xl"
                  data-preview-field-path="experiencesPage.ctaHeading"
                  defaultValue={contentText(page.ctaHeading) || 'Weave These Experiences Into Your Trip'}
                />
                <EditableText
                  as="p"
                  color="rgba(250, 248, 243, 0.82)"
                  className="m-0 text-sm leading-relaxed text-[#FAF8F3]/82 sm:text-base"
                  data-preview-field-path="experiencesPage.ctaBody"
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
                  <span data-preview-field-path="experiencesPage.ctaLabel">
                    {contentText(page.ctaLabel) || 'Plan Experiences'}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="experiences-bottom-whatsapp-cta"
                    className="lux-btn-outline-light"
                  >
                    WhatsApp Concierge ↗
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

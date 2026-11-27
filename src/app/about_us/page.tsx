'use client';

import { useRouter } from 'next/navigation';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { buildWhatsAppEnquiryUrl } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

export default function AboutPage() {
  const router = useRouter();
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const about = contentObject(content.about);
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
  const hasContact = selectedPages.includes('contact');
  const plannerTarget = hasPlanner ? '/plan-your-trip/' : hasContact ? '/contact/' : '/#tailor-made';

  const collageImages = contentList(about.collageImages) as Array<{
    id?: string;
    image?: string;
    caption?: string;
  }>;
  const expertiseItems = contentList(about.expertiseItems).map((raw) => contentObject(raw));
  const values = contentList(about.values).map((raw) => contentObject(raw));
  const team = contentList(about.team).map((raw) => contentObject(raw));

  const credentialsNote = contentText(about.credentialsNote).trim();
  const showCredentials = isEditorPreview || credentialsNote.length > 0;
  const showTeam = isEditorPreview || team.length > 0;

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);
  const whatsappUrl = buildWhatsAppEnquiryUrl(
    agencyWhatsApp,
    `Hello ${brandName}, I would like to learn more about planning a journey with your team.`,
  );

  const heroImageUrl = contentText(about.imageUrl) || '/images/hero-tea.webp';
  const heroImageAlt =
    contentText(about.imageAlt) || contentText(about.heading) || 'Misty Sri Lankan tea highlands';

  return (
    <div data-preview-page-key="about_us">
      {/* Compact Cinematic Hero */}
      <section
        data-design-section="about"
        className="relative isolate flex min-h-[38vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={heroImageUrl}
            alt={heroImageAlt}
            data-preview-field-path="about.imageUrl"
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
              data-preview-static="about-breadcrumb-home"
              className="text-[#FAF8F3]/80 no-underline transition hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <EditableText
              as="span"
              color="#C5A46D"
              className="font-semibold text-[#C5A46D]"
              data-preview-field-path="about.breadcrumbLabel"
              defaultValue={contentText(about.breadcrumbLabel) || 'About Us'}
            />
          </div>

          <div className="max-w-3xl">
            <div className="mb-2.5">
              <EditableText
                as="span"
                color="#C5A46D"
                className="lux-eyebrow !text-[#C5A46D]"
                data-preview-field-path="about.eyebrow"
                defaultValue={contentText(about.eyebrow) || 'OUR STORY & APPROACH'}
              />
            </div>
            <EditableText
              as="h1"
              variant="h1"
              color="#FAF8F3"
              className="font-display m-0 mb-2.5 text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#FAF8F3] sm:text-4xl lg:text-5xl"
              data-preview-field-path="about.heading"
              defaultValue={contentText(about.heading)}
            />
            <EditableText
              as="p"
              color="rgba(250, 248, 243, 0.82)"
              className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/82 sm:text-base"
              data-preview-field-path="about.body"
              defaultValue={contentText(about.body)}
            />

            {isEditorPreview && (
              <div className="mt-3 inline-block rounded border border-dashed border-white/25 bg-[#101820]/65 px-2.5 py-1 text-[11px] text-[#A3B0BA]">
                <span data-preview-static="about-hero-alt-label">Hero alt: </span>
                <span data-preview-field-path="about.imageAlt">{heroImageAlt}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ayubowan Welcome, Story, Philosophy & Editorial Collage */}
      <section className="lux-section bg-[var(--lux-bg)]" data-design-section="about-heritage">
        <div className="lux-container">
          <Reveal variant="fade-up">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
              <div className="space-y-7 lg:col-span-5">
                <div className="border-l-2 border-[#C5A46D] pl-5">
                  <EditableText
                    as="h2"
                    className="font-display m-0 mb-2 text-2xl font-bold text-[var(--lux-text)]"
                    data-preview-field-path="about.ayubowanHeading"
                    defaultValue={contentText(about.ayubowanHeading) || 'Ayubowan — Welcome to Our Island'}
                  />
                  <EditableText
                    as="p"
                    className="m-0 text-sm leading-[1.8] text-[var(--lux-text-muted)] sm:text-[15px]"
                    data-preview-field-path="about.ayubowanBody"
                    defaultValue={contentText(about.ayubowanBody)}
                  />
                </div>

                <div className="border-t border-[var(--lux-border)] pt-6">
                  <EditableText
                    as="h2"
                    className="font-display m-0 mb-2.5 text-xl font-bold text-[var(--lux-text)] sm:text-2xl"
                    data-preview-field-path="about.missionHeading"
                    defaultValue={contentText(about.missionHeading)}
                  />
                  <EditableText
                    as="p"
                    className="m-0 text-sm leading-[1.8] text-[var(--lux-text-muted)]"
                    data-preview-field-path="about.missionBody"
                    defaultValue={contentText(about.missionBody)}
                  />
                </div>

                <div className="border-t border-[var(--lux-border)] pt-6">
                  <EditableText
                    as="h3"
                    className="font-display m-0 mb-2 text-xl font-bold text-[var(--lux-text)]"
                    data-preview-field-path="about.historyHeading"
                    defaultValue={contentText(about.historyHeading)}
                  />
                  <EditableText
                    as="p"
                    className="m-0 text-sm leading-[1.8] text-[var(--lux-text-muted)]"
                    data-preview-field-path="about.history"
                    defaultValue={contentText(about.history)}
                  />
                </div>
              </div>

              <div className="space-y-4 lg:col-span-7">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <EditableText
                      as="h3"
                      className="font-display m-0 text-xl font-bold text-[var(--lux-text)]"
                      data-preview-field-path="about.collageHeading"
                      defaultValue={contentText(about.collageHeading)}
                    />
                    <EditableText
                      as="p"
                      className="mt-1 m-0 max-w-xl text-xs leading-relaxed text-[var(--lux-text-muted)] sm:text-sm"
                      data-preview-field-path="about.collageDescription"
                      defaultValue={contentText(about.collageDescription)}
                    />
                  </div>
                </div>

                <div
                  data-preview-list-path="about.collageImages"
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  {collageImages.length === 0 && (
                    <p
                      data-preview-static="about-collage-empty"
                      className="col-span-full rounded-[6px] border border-dashed border-[var(--lux-border-strong)] p-8 text-center text-sm text-[var(--lux-text-muted)]"
                    >
                      No gallery images added yet.
                    </p>
                  )}

                  {collageImages.map((item, index) => (
                    <figure
                      key={item.id || index}
                      data-preview-item-path={`about.collageImages[${index}]`}
                      className="lux-image-zoom relative m-0 aspect-[4/3] overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[#101820]"
                    >
                      <img
                        src={withBasePath(item.image || '/images/hero-sigiriya.webp')}
                        alt={item.caption || 'Sri Lanka editorial scene'}
                        loading="lazy"
                        data-preview-field-path={`about.collageImages[${index}].image`}
                        className="h-full w-full object-cover"
                      />
                      {(item.caption || isEditorPreview) && (
                        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101820]/90 via-[#101820]/45 to-transparent px-4 pb-3 pt-8 text-xs font-medium tracking-[0.03em] text-[#FAF8F3]">
                          <span
                            data-preview-field-path={`about.collageImages[${index}].caption`}
                            style={{ display: 'inline-block', minWidth: '1.5ch', minHeight: '1.2em' }}
                          >
                            {item.caption || ''}
                          </span>
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Domestic, Inbound & Outbound Travel Expertise */}
      <section className="lux-section lux-section-alt border-y border-[var(--lux-border)]" data-design-section="about-expertise">
        <div className="lux-container">
          <div className="mb-7 max-w-2xl">
            <span data-preview-static="about-expertise-eyebrow" className="lux-eyebrow-tropical mb-2 block">
              OUR TRAVEL MARKETS
            </span>
            <EditableText
              as="h2"
              className="font-display m-0 text-2xl font-bold text-[var(--lux-text)] sm:text-3xl"
              data-preview-field-path="about.expertiseHeading"
              defaultValue={contentText(about.expertiseHeading) || 'Domestic, Inbound & Outbound Expertise'}
            />
          </div>

          <div
            data-preview-list-path="about.expertiseItems"
            className="grid grid-cols-1 gap-5 md:grid-cols-3"
          >
            {expertiseItems.length === 0 && (
              <p
                data-preview-static="about-expertise-empty"
                className="col-span-full rounded-[6px] border border-dashed border-[var(--lux-border-strong)] p-6 text-center text-sm text-[var(--lux-text-muted)]"
              >
                No travel market highlights configured yet.
              </p>
            )}

            {expertiseItems.map((item, idx) => (
              <article
                key={idx}
                data-preview-item-path={`about.expertiseItems[${idx}]`}
                className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-sm)]"
              >
                <span
                  data-preview-field-path={`about.expertiseItems[${idx}].audience`}
                  className="font-display mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-teal)]"
                >
                  {contentText(item.audience)}
                </span>
                <EditableText
                  as="h3"
                  className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]"
                  data-preview-field-path={`about.expertiseItems[${idx}].title`}
                  defaultValue={contentText(item.title)}
                />
                <EditableText
                  as="p"
                  className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                  data-preview-field-path={`about.expertiseItems[${idx}].description`}
                  defaultValue={contentText(item.description)}
                />
              </article>
            ))}
          </div>

          {/* Why Travel With Us — Core Values */}
          <div className="mt-12 border-t border-[var(--lux-border)] pt-10">
            <span data-preview-static="about-values-eyebrow" className="lux-eyebrow mb-4 block">
              WHY TRAVEL WITH US
            </span>
            <div
              data-preview-list-path="about.values"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {values.length === 0 && (
                <p
                  data-preview-static="about-values-empty"
                  className="col-span-full rounded-[6px] border border-dashed border-[var(--lux-border-strong)] p-6 text-center text-sm text-[var(--lux-text-muted)]"
                >
                  No agency values configured yet.
                </p>
              )}

              {values.map((val, index) => (
                <article
                  key={index}
                  data-preview-item-path={`about.values[${index}]`}
                  className="border-t-2 border-[#154C42] bg-[var(--lux-surface)] p-5 dark:border-[#C5A46D]"
                >
                  <span data-preview-static="about-value-number" className="font-display mb-2 block text-xs font-bold tracking-[0.18em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <EditableText
                    as="h3"
                    className="font-display m-0 mb-1.5 text-base font-bold text-[var(--lux-text)]"
                    data-preview-field-path={`about.values[${index}].title`}
                    defaultValue={contentText(val.title)}
                  />
                  <EditableText
                    as="p"
                    className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)] sm:text-[13px]"
                    data-preview-field-path={`about.values[${index}].description`}
                    defaultValue={contentText(val.description)}
                  />
                </article>
              ))}
            </div>
          </div>

          {/* Responsible Travel & Optional Merchant Credentials (hidden cleanly on live site when unconfigured) */}
          <div className={`mt-10 grid grid-cols-1 gap-6 ${showCredentials ? 'lg:grid-cols-2' : ''}`}>
            <div className="rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 sm:p-7">
              <EditableText
                as="h3"
                className="font-display m-0 mb-2.5 text-xl font-bold text-[var(--lux-text)]"
                data-preview-field-path="about.responsibleTravelHeading"
                defaultValue={contentText(about.responsibleTravelHeading)}
              />
              <EditableText
                as="p"
                className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                data-preview-field-path="about.responsibleTravelBody"
                defaultValue={contentText(about.responsibleTravelBody)}
              />
            </div>

            {showCredentials && (
              <div className="rounded-[6px] border border-[#C5A46D]/45 bg-[var(--lux-surface)] p-6 sm:p-7">
                <EditableText
                  as="h3"
                  className="font-display m-0 mb-2.5 text-xl font-bold text-[var(--lux-text)]"
                  data-preview-field-path="about.credentialsHeading"
                  defaultValue={contentText(about.credentialsHeading) || 'Agency Registration & Accreditations'}
                />
                <EditableText
                  as="p"
                  className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                  data-preview-field-path="about.credentialsNote"
                  defaultValue={credentialsNote}
                  placeholder="Optional: add your tourism licence number or company registration here. Hidden on live site when blank."
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Optional Travel Desks / Team Section */}
      {showTeam && (
        <section className="lux-section bg-[var(--lux-bg)]" data-design-section="about-team">
          <div className="lux-container">
            <div className="mb-8 max-w-2xl">
              <span data-preview-static="about-team-eyebrow" className="lux-eyebrow-tropical mb-2 block">
                LOCAL KNOWLEDGE &amp; CARE
              </span>
              <EditableText
                as="h2"
                className="font-display m-0 text-2xl font-bold text-[var(--lux-text)] sm:text-3xl"
                data-preview-field-path="about.teamHeading"
                defaultValue={contentText(about.teamHeading) || 'Dedicated Travel Planning Desks'}
              />
            </div>

            <div
              data-preview-list-path="about.team"
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              {team.length === 0 && (
                <p
                  data-preview-static="about-team-empty"
                  className="col-span-full rounded-[6px] border border-dashed border-[var(--lux-border-strong)] p-6 text-center text-sm text-[var(--lux-text-muted)]"
                >
                  No planning desks or team profiles added yet (hidden on live storefront when empty).
                </p>
              )}

              {team.map((member, index) => (
                <article
                  key={index}
                  data-preview-item-path={`about.team[${index}]`}
                  className="flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] transition-shadow hover:shadow-[var(--lux-shadow-md)]"
                >
                  <div className="lux-image-zoom aspect-[16/10] w-full overflow-hidden bg-[#101820]">
                    <EditableImage
                      src={contentText(member.imageUrl) || '/images/dest-kandy.webp'}
                      alt={contentText(member.name)}
                      data-preview-field-path={`about.team[${index}].imageUrl`}
                      fit="cover"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <EditableText
                      as="h3"
                      className="font-display m-0 text-lg font-bold text-[var(--lux-text)]"
                      data-preview-field-path={`about.team[${index}].name`}
                      defaultValue={contentText(member.name)}
                    />
                    <EditableText
                      as="p"
                      className="mt-1 mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--lux-teal)]"
                      data-preview-field-path={`about.team[${index}].role`}
                      defaultValue={contentText(member.role)}
                    />
                    <EditableText
                      as="p"
                      className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path={`about.team[${index}].bio`}
                      defaultValue={contentText(member.bio)}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom Plan Your Trip Band */}
      <section className="lux-section lux-section-tropical" data-design-section="about-cta">
        <div className="lux-container">
          <Reveal variant="fade-up">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <EditableText
                  as="h2"
                  color="#FAF8F3"
                  className="font-display m-0 mb-2 text-2xl font-bold text-[#FAF8F3] sm:text-3xl"
                  data-preview-field-path="about.ctaHeading"
                  defaultValue={contentText(about.ctaHeading) || 'Ready to Design Your Own Journey?'}
                />
                <EditableText
                  as="p"
                  color="rgba(250, 248, 243, 0.82)"
                  className="m-0 text-sm leading-relaxed text-[#FAF8F3]/82 sm:text-base"
                  data-preview-field-path="about.ctaBody"
                  defaultValue={contentText(about.ctaBody)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push(plannerTarget)}
                  className="lux-btn-sunset"
                >
                  <span data-preview-field-path="about.ctaLabel">
                    {contentText(about.ctaLabel) || 'Start Planning Your Trip'}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="about-bottom-whatsapp-cta"
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

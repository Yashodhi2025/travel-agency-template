'use client';

import { EditableIcon, EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { sanitizeHref } from '@/lib/travelHelpers';
import { pageRoute, withBasePath } from '@/lib/utils';
import { Reveal } from '../Reveal';

export function AyubowanWelcomeSection() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const home = contentObject(contentObject(siteData?.content).home);
  const highlights = contentList(home.welcomeHighlights);
  const quickCtas = contentList(home.demoPreOrderCta);

  const selectedPages =
    siteData.requirements?.requiredPages ??
    siteData.template?.structure?.pages ??
    ['home', 'about_us', 'services', 'contact'];

  const hasAbout = selectedPages.includes('about_us');
  const hasContact = selectedPages.includes('contact');

  const introImageUrl = contentText(home.introImageUrl) || '/images/ayubowan-hospitality.webp';
  const introImageAlt =
    contentText(home.introImageAlt) ||
    contentText(home.introTitle) ||
    'Warm Sri Lankan Ceylon tea hospitality welcome';

  return (
    <section
      id="ayubowan"
      data-design-section="home-introduction"
      className="lux-section border-b border-[var(--lux-border)] bg-[var(--lux-bg)]"
    >
      <div className="lux-container">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Warm Concise Editorial Welcome */}
          <div className="lg:col-span-6">
            <Reveal variant="fade-up">
              <div className="mb-3">
                <EditableText
                  as="span"
                  className="lux-eyebrow-tropical"
                  data-preview-field-path="home.introEyebrow"
                  defaultValue={contentText(home.introEyebrow) || 'AYUBOWAN · SRI LANKAN HOSPITALITY'}
                />
              </div>

              <EditableText
                as="h2"
                variant="h2"
                className="font-display m-0 mb-5 max-w-xl text-3xl font-bold leading-[1.14] tracking-[-0.025em] text-[var(--lux-text)] sm:text-4xl lg:text-[2.5rem]"
                data-preview-field-path="home.introTitle"
                defaultValue={contentText(home.introTitle) || 'Ayubowan. Your Journey Begins Here.'}
              />

              <EditableText
                as="p"
                className="m-0 mb-3.5 max-w-[58ch] text-[15px] leading-[1.75] text-[var(--lux-text)]/90 sm:text-base"
                data-preview-field-path="home.introBody"
                defaultValue={contentText(home.introBody)}
              />

              <EditableText
                as="p"
                className="m-0 mb-7 max-w-[58ch] text-sm leading-[1.75] text-[var(--lux-text-muted)] sm:text-[15px]"
                data-preview-field-path="home.introSupportingBody"
                defaultValue={contentText(home.introSupportingBody)}
              />
            </Reveal>

            {/* Three Compact Trust/Service Highlights */}
            <Reveal variant="fade-up" delayMs={80}>
              <div
                data-preview-list-path="home.welcomeHighlights"
                className="mb-7 grid grid-cols-1 gap-4 border-y border-[var(--lux-border)] py-5 sm:grid-cols-3"
              >
                {highlights.length === 0 && (
                  <p
                    data-preview-static="welcome-highlights-empty"
                    className="col-span-full m-0 text-xs text-[var(--lux-text-muted)]"
                  >
                    Add hospitality highlights in Fivora to showcase your welcome pillars.
                  </p>
                )}

                {highlights.map((rawItem, index) => {
                  const item = contentObject(rawItem);
                  const iconName = contentText(item.icon) || 'navigation';
                  return (
                    <div
                      key={index}
                      data-preview-item-path={`home.welcomeHighlights[${index}]`}
                      className="flex flex-col gap-1.5"
                    >
                      <span
                        data-preview-field-path={`home.welcomeHighlights[${index}].icon`}
                        data-preview-control="icon-picker"
                        data-preview-icon-type="lucide"
                        data-preview-icon={iconName}
                        className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#154C42]/10 text-[#154C42] dark:bg-[#C5A46D]/15 dark:text-[#C5A46D]"
                      >
                        <EditableIcon name={iconName} size={16} />
                      </span>
                      <EditableText
                        as="h3"
                        className="font-display m-0 text-[13px] font-bold text-[var(--lux-text)]"
                        data-preview-field-path={`home.welcomeHighlights[${index}].title`}
                        defaultValue={contentText(item.title)}
                      />
                      <EditableText
                        as="p"
                        className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]"
                        data-preview-field-path={`home.welcomeHighlights[${index}].description`}
                        defaultValue={contentText(item.description)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                {hasAbout ? (
                  <button
                    type="button"
                    data-target-page="about_us"
                    onClick={() => {
                      window.location.href = withBasePath(pageRoute('about_us'));
                    }}
                    className="lux-btn-tropical"
                  >
                    <span data-preview-field-path="home.introCtaLabel">
                      {contentText(home.introCtaLabel) || 'Discover Our Story'}
                    </span>
                    <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <span
                    data-target-page="about_us"
                    data-preview-field-path="home.introCtaLabel"
                    className="lux-btn-tropical unavailable"
                  >
                    {contentText(home.introCtaLabel) || 'Discover Our Story'}
                  </span>
                )}

                <div
                  data-preview-list-path="home.demoPreOrderCta"
                  className="flex flex-wrap items-center gap-3"
                >
                  {quickCtas.map((rawCta, index) => {
                    const cta = contentObject(rawCta);
                    const label = contentText(cta.buttonLabel) || 'Plan Your Trip';
                    const rawUrl = sanitizeHref(contentText(cta.buttonUrl));
                    const url =
                      rawUrl && (hasContact || !rawUrl.includes('/contact'))
                        ? rawUrl
                        : '/#tailor-made';
                    return (
                      <a
                        key={index}
                        href={withBasePath(url)}
                        data-preview-item-path={`home.demoPreOrderCta[${index}]`}
                        data-preview-field-path={`home.demoPreOrderCta[${index}].buttonUrl`}
                        className="lux-btn-outline"
                      >
                        <span data-preview-field-path={`home.demoPreOrderCta[${index}].buttonLabel`}>
                          {label}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Clean Editorial Hospitality Photograph */}
          <div className="relative lg:col-span-6">
            <Reveal variant="mask-reveal">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-3.5 -right-3.5 -z-10 hidden h-[75%] w-[75%] border border-[#C5A46D]/45 sm:block"
                />
                <div className="lux-image-zoom relative aspect-[4/3] w-full overflow-hidden rounded-[6px] shadow-[var(--lux-shadow-md)]">
                  <EditableImage
                    src={introImageUrl}
                    alt={introImageAlt}
                    data-preview-field-path="home.introImageUrl"
                    fit="cover"
                    className="h-full w-full object-cover"
                  />
                </div>

                {isEditorPreview && (
                  <div className="mt-2.5 rounded border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface-alt)] px-3 py-2 text-xs text-[var(--lux-text-muted)]">
                    <span data-preview-static="intro-image-alt-label" className="font-semibold text-[var(--lux-text)]">
                      Image alt text:{' '}
                    </span>
                    <span data-preview-field-path="home.introImageAlt">{introImageAlt}</span>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

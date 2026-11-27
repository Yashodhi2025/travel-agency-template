'use client';

import { EditableCard, EditableImage, EditableList, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { sanitizeHref } from '@/lib/travelHelpers';
import { pageRoute, withBasePath } from '@/lib/utils';
import { Reveal } from '../Reveal';

export function TrustAndIntroSection() {
  const siteData = useSiteData();
  const home = contentObject(contentObject(siteData?.content).home);
  const features = contentList(home.features);
  const quickCtas = contentList(home.demoPreOrderCta);
  const selectedPages =
    siteData.requirements?.requiredPages ??
    siteData.template?.structure?.pages ??
    ['home', 'about_us', 'services', 'contact'];

  const hasAbout = selectedPages.includes('about_us');
  const hasContact = selectedPages.includes('contact');

  return (
    <section data-design-section="home-introduction" className="lux-section">
      <div className="lux-container">
        <Reveal>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Editorial Copy */}
            <div className="lg:col-span-6">
              <div className="mb-4">
                <EditableText
                  as="span"
                  className="lux-eyebrow"
                  data-preview-field-path="home.introEyebrow"
                  defaultValue={contentText(home.introEyebrow) || 'THE CEYLON ODYSSEY PHILOSOPHY'}
                />
              </div>

              <EditableText
                as="h2"
                variant="h2"
                className="font-editorial m-0 mb-6 text-3xl font-medium leading-[1.15] text-[var(--lux-text)] sm:text-4xl lg:text-[2.8rem]"
                data-preview-field-path="home.introTitle"
                defaultValue={contentText(home.introTitle)}
              />

              <EditableText
                as="p"
                className="mb-8 text-base leading-[1.85] text-[var(--lux-text-muted)] sm:text-lg"
                data-preview-field-path="home.introBody"
                defaultValue={contentText(home.introBody)}
              />

              <div className="flex flex-wrap items-center gap-4">
                {hasAbout ? (
                  <button
                    type="button"
                    data-target-page="about_us"
                    onClick={() => {
                      window.location.href = withBasePath(pageRoute('about_us'));
                    }}
                    className="lux-btn-primary"
                  >
                    <span data-preview-field-path="home.introCtaLabel">
                      {contentText(home.introCtaLabel) || 'About Our Approach'}
                    </span>
                  </button>
                ) : (
                  <span
                    data-target-page="about_us"
                    data-preview-field-path="home.introCtaLabel"
                    className="lux-btn-primary unavailable"
                  >
                    {contentText(home.introCtaLabel) || 'About Our Approach'}
                  </span>
                )}

                <div
                  data-preview-list-path="home.demoPreOrderCta"
                  className="flex flex-wrap items-center gap-3"
                >
                  {quickCtas.map((rawCta, index) => {
                    const cta = contentObject(rawCta);
                    const label = contentText(cta.buttonLabel) || 'Speak With a Specialist';
                    const rawUrl = sanitizeHref(contentText(cta.buttonUrl));
                    const url =
                      rawUrl && (hasContact || !rawUrl.includes('/contact'))
                        ? rawUrl
                        : hasContact
                          ? '/contact/'
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
            </div>

            {/* Composed Architectural Imagery */}
            <div className="relative lg:col-span-6">
              <div className="lux-image-zoom relative aspect-[4/3] overflow-hidden border border-[var(--lux-border-strong)] p-2.5 bg-[var(--lux-surface)] shadow-[var(--lux-shadow-md)]">
                <EditableImage
                  src={contentText(home.introImageUrl) || '/images/exp-villa.webp'}
                  alt={contentText(home.introTitle) || 'Sri Lanka luxury sanctuary'}
                  data-preview-field-path="home.introImageUrl"
                  fit="cover"
                  className="h-full w-full object-cover"
                />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-4 -left-4 -z-10 h-36 w-36 border border-[#C6A46A]/45"
              />
            </div>
          </div>
        </Reveal>

        {/* Four Configurable Value Propositions */}
        <div className="mt-16 border-t border-[var(--lux-border)] pt-14" data-design-section="home-features">
          <Reveal>
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <EditableText
                as="h3"
                className="font-editorial m-0 text-2xl font-medium text-[var(--lux-text)] sm:text-3xl"
                data-preview-field-path="home.featuresHeading"
                defaultValue={contentText(home.featuresHeading) || 'Crafted Around Every Traveller'}
              />
              <span
                data-preview-static="features-section-note"
                className="text-xs uppercase tracking-[0.18em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
              >
                Tailor-Made Standards
              </span>
            </div>
          </Reveal>

          <EditableList
            data-preview-list-path="home.features"
            items={features}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            itemAs={false}
          >
            {(rawFeature, index) => {
              const feature = contentObject(rawFeature);
              return (
                <EditableCard
                  key={index}
                  className="lux-card flex flex-col justify-between !p-6"
                  itemPath={`home.features[${index}]`}
                  data-preview-item-path={`home.features[${index}]`}
                  item={feature as any}
                  imageKey="__custom__"
                  balance
                  radius="md"
                >
                  <div>
                    <span
                      data-preview-static="feature-ordinal"
                      className="font-editorial mb-4 inline-block text-2xl text-[#C6A46A]"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <EditableText
                      as="h4"
                      className="font-editorial m-0 mb-2.5 text-xl font-medium text-[var(--lux-text)]"
                      data-preview-field-path={`home.features[${index}].title`}
                      defaultValue={contentText(feature.title)}
                    />
                    <EditableText
                      as="p"
                      className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path={`home.features[${index}].body`}
                      defaultValue={contentText(feature.body)}
                    />
                  </div>
                </EditableCard>
              );
            }}
          </EditableList>
        </div>
      </div>
    </section>
  );
}

'use client';

import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

export default function AboutPage() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const about = contentObject(contentObject(siteData.content).about);
  const collageImages = contentList(about.collageImages) as Array<{
    id?: string;
    image?: string;
    caption?: string;
  }>;
  const values = contentList(about.values).map((raw) => contentObject(raw));
  const team = contentList(about.team).map((raw) => contentObject(raw));

  return (
    <div data-preview-page-key="about_us">
      {/* Cinematic About Banner */}
      <section
        data-design-section="about"
        className="relative isolate flex min-h-[48vh] items-end overflow-hidden bg-[#0D241E] text-[#F7F3EA]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={contentText(about.imageUrl) || '/images/hero-tea.webp'}
            alt={contentText(about.heading) || 'About Ceylon Odyssey'}
            data-preview-field-path="about.imageUrl"
            fit="cover"
            className="h-full w-full object-cover opacity-55"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#091814]/92 via-[#0D241E]/58 to-[#091814]/40"
        />

        <div className="lux-container relative z-10 pb-14 pt-20">
          <div className="max-w-3xl">
            <div className="mb-3">
              <EditableText
                as="span"
                color="#C6A46A"
                className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A46A]"
                data-preview-field-path="about.eyebrow"
                defaultValue={contentText(about.eyebrow) || 'OUR STORY & APPROACH'}
              />
            </div>
            <EditableText
              as="h1"
              variant="h1"
              color="#F7F3EA"
              className="font-editorial m-0 mb-4 text-4xl font-medium leading-[1.08] text-[#F7F3EA] sm:text-5xl lg:text-6xl"
              data-preview-field-path="about.heading"
              defaultValue={contentText(about.heading)}
            />
            <EditableText
              as="p"
              color="rgba(247, 243, 234, 0.84)"
              className="m-0 max-w-2xl text-base leading-relaxed text-[#F7F3EA]/84 sm:text-lg"
              data-preview-field-path="about.body"
              defaultValue={contentText(about.body)}
            />
          </div>
        </div>
      </section>

      {/* Mission, Craft & Visual Collage */}
      <section className="lux-section" data-design-section="about-heritage">
        <div className="lux-container">
          <Reveal>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
              <div className="space-y-8 lg:col-span-5">
                <div>
                  <EditableText
                    as="h2"
                    className="font-editorial m-0 mb-3 text-3xl font-medium text-[var(--lux-text)]"
                    data-preview-field-path="about.missionHeading"
                    defaultValue={contentText(about.missionHeading)}
                  />
                  <EditableText
                    as="p"
                    className="m-0 text-base leading-[1.8] text-[var(--lux-text-muted)]"
                    data-preview-field-path="about.missionBody"
                    defaultValue={contentText(about.missionBody)}
                  />
                </div>

                <div className="border-t border-[var(--lux-border)] pt-7">
                  <EditableText
                    as="h3"
                    className="font-editorial m-0 mb-2.5 text-2xl font-medium text-[var(--lux-text)]"
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

                <div className="border-t border-[var(--lux-border)] pt-7">
                  <EditableText
                    as="h3"
                    className="font-editorial m-0 mb-2 text-2xl font-medium text-[var(--lux-text)]"
                    data-preview-field-path="about.collageHeading"
                    defaultValue={contentText(about.collageHeading)}
                  />
                  <EditableText
                    as="p"
                    className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                    data-preview-field-path="about.collageDescription"
                    defaultValue={contentText(about.collageDescription)}
                  />
                </div>
              </div>

              <div
                data-preview-list-path="about.collageImages"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7"
              >
                {collageImages.length === 0 && (
                  <p
                    data-preview-static="about-collage-empty"
                    className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-8 text-center text-sm text-[var(--lux-text-muted)]"
                  >
                    No gallery images added yet.
                  </p>
                )}

                {collageImages.map((item, index) => (
                  <figure
                    key={item.id || index}
                    data-preview-item-path={`about.collageImages[${index}]`}
                    className="lux-image-zoom relative m-0 aspect-[4/3] overflow-hidden border border-[var(--lux-border)] bg-[var(--lux-surface-alt)]"
                  >
                    <img
                      src={withBasePath(item.image || '/images/hero-sigiriya.webp')}
                      alt={item.caption || 'Sri Lanka editorial scene'}
                      data-preview-field-path={`about.collageImages[${index}].image`}
                      className="h-full w-full object-cover"
                    />
                    {(item.caption || isEditorPreview) && (
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#091814]/90 to-transparent px-4 pb-3.5 pt-8 text-xs font-medium tracking-[0.04em] text-[#F7F3EA]">
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
          </Reveal>
        </div>
      </section>

      {/* Core Values */}
      <section className="lux-section lux-section-alt border-y border-[var(--lux-border)]">
        <div className="lux-container">
          <div
            data-preview-list-path="about.values"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.length === 0 && (
              <p
                data-preview-static="about-values-empty"
                className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-6 text-center text-sm text-[var(--lux-text-muted)]"
              >
                No agency values configured yet.
              </p>
            )}

            {values.map((val, index) => (
              <article
                key={index}
                data-preview-item-path={`about.values[${index}]`}
                className="lux-card p-6"
              >
                <span data-preview-static="about-value-number" className="font-editorial mb-3 block text-2xl text-[#C6A46A]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <EditableText
                  as="h3"
                  className="font-editorial m-0 mb-2 text-xl font-medium text-[var(--lux-text)]"
                  data-preview-field-path={`about.values[${index}].title`}
                  defaultValue={contentText(val.title)}
                />
                <EditableText
                  as="p"
                  className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                  data-preview-field-path={`about.values[${index}].description`}
                  defaultValue={contentText(val.description)}
                />
              </article>
            ))}
          </div>

          {/* Responsible Travel & Configurable Credentials */}
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-7">
              <EditableText
                as="h3"
                className="font-editorial m-0 mb-3 text-2xl font-medium text-[var(--lux-text)]"
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

            <div className="border border-[#C6A46A]/45 bg-[var(--lux-surface)] p-7">
              <EditableText
                as="h3"
                className="font-editorial m-0 mb-3 text-2xl font-medium text-[var(--lux-text)]"
                data-preview-field-path="about.credentialsHeading"
                defaultValue={contentText(about.credentialsHeading)}
              />
              <EditableText
                as="p"
                className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                data-preview-field-path="about.credentialsNote"
                defaultValue={contentText(about.credentialsNote)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Illustrative Specialists Team */}
      <section className="lux-section">
        <div className="lux-container">
          <div className="mb-10 max-w-2xl">
            <EditableText
              as="h2"
              className="font-editorial m-0 text-3xl font-medium text-[var(--lux-text)] sm:text-4xl"
              data-preview-field-path="about.teamHeading"
              defaultValue={contentText(about.teamHeading) || 'Illustrative Destination Specialists'}
            />
          </div>

          <div
            data-preview-list-path="about.team"
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {team.length === 0 && (
              <p
                data-preview-static="about-team-empty"
                className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-6 text-center text-sm text-[var(--lux-text-muted)]"
              >
                No team profiles added yet.
              </p>
            )}

            {team.map((member, index) => (
              <article
                key={index}
                data-preview-item-path={`about.team[${index}]`}
                className="lux-card flex flex-col overflow-hidden"
              >
                <div className="lux-image-zoom aspect-[4/3] w-full overflow-hidden">
                  <EditableImage
                    src={contentText(member.imageUrl) || '/images/dest-kandy.webp'}
                    alt={contentText(member.name)}
                    data-preview-field-path={`about.team[${index}].imageUrl`}
                    fit="cover"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <EditableText
                    as="h3"
                    className="font-editorial m-0 text-xl font-medium text-[var(--lux-text)]"
                    data-preview-field-path={`about.team[${index}].name`}
                    defaultValue={contentText(member.name)}
                  />
                  <EditableText
                    as="p"
                    className="mt-1 mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
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

          {/* Bottom CTA */}
          <div className="mt-16 flex flex-col items-start justify-between gap-6 border border-[#C6A46A]/35 bg-[#102D25] p-8 text-[#F7F3EA] md:flex-row md:items-center md:p-12">
            <div className="max-w-2xl">
              <EditableText
                as="h2"
                color="#F7F3EA"
                className="font-editorial m-0 mb-2 text-2xl font-medium text-[#F7F3EA] sm:text-3xl"
                data-preview-field-path="about.ctaHeading"
                defaultValue={contentText(about.ctaHeading)}
              />
              <EditableText
                as="p"
                color="rgba(247, 243, 234, 0.8)"
                className="m-0 text-sm leading-relaxed text-[#F7F3EA]/80 sm:text-base"
                data-preview-field-path="about.ctaBody"
                defaultValue={contentText(about.ctaBody)}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                window.location.href = withBasePath('/contact/');
              }}
              className="lux-btn-gold flex-shrink-0"
            >
              <span data-preview-field-path="about.ctaLabel">
                {contentText(about.ctaLabel) || 'Start Planning Your Trip'}
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { sanitizeHref, type TripEnquiryDraft } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '../Reveal';

interface ExperiencesAndStaysSectionProps {
  onSelectExperienceStyle: (style: string) => void;
  onEnquireExperience: (draft: TripEnquiryDraft) => void;
}

export function ExperiencesAndStaysSection({
  onSelectExperienceStyle,
  onEnquireExperience,
}: ExperiencesAndStaysSectionProps) {
  const siteData = useSiteData();
  const home = contentObject(contentObject(siteData?.content).home);

  const experiences = contentList(home.experiences).map((raw) => {
    const item = contentObject(raw);
    return {
      title: contentText(item.title),
      category: contentText(item.category),
      description: contentText(item.description),
      imageUrl: contentText(item.imageUrl) || '/images/exp-wellness.webp',
      ctaLabel: contentText(item.ctaLabel) || 'Explore',
      ctaUrl: contentText(item.ctaUrl) || '/#packages',
    };
  });

  const stays = contentList(home.stays).map((raw) => {
    const item = contentObject(raw);
    return {
      title: contentText(item.title),
      subtitle: contentText(item.subtitle),
      description: contentText(item.description),
      imageUrl: contentText(item.imageUrl) || '/images/exp-villa.webp',
    };
  });

  const travelTips = contentList(home.travelTips).map((raw) => {
    const item = contentObject(raw);
    return {
      title: contentText(item.title),
      body: contentText(item.body),
    };
  });

  return (
    <>
      {/* Travel Experiences Editorial Showcase */}
      <section
        id="experiences"
        data-design-section="home-experiences"
        className="lux-section lux-section-dark lux-grain relative overflow-hidden"
      >
        <div className="lux-container relative z-10">
          <Reveal>
            <div className="mb-12 max-w-2xl">
              <div className="mb-3">
                <EditableText
                  as="span"
                  color="#C6A46A"
                  className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A46A]"
                  data-preview-field-path="home.experiencesEyebrow"
                  defaultValue={contentText(home.experiencesEyebrow) || 'CURATED EXPERIENCES'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                color="#F7F3EA"
                className="font-editorial m-0 text-3xl font-medium text-[#F7F3EA] sm:text-4xl lg:text-5xl"
                data-preview-field-path="home.experiencesHeading"
                defaultValue={contentText(home.experiencesHeading) || 'Ways to Experience the Island'}
              />
              <EditableText
                as="p"
                color="rgba(247, 243, 234, 0.78)"
                className="mt-4 text-base leading-relaxed text-[#F7F3EA]/78"
                data-preview-field-path="home.experiencesSummary"
                defaultValue={contentText(home.experiencesSummary)}
              />
            </div>
          </Reveal>

          <div
            data-preview-list-path="home.experiences"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {experiences.length === 0 && (
              <p
                data-preview-static="experiences-empty-state"
                className="col-span-full border border-dashed border-[#C6A46A]/40 p-8 text-center text-sm text-[#F7F3EA]/70"
              >
                No travel experiences added yet. Add experience categories in Fivora.
              </p>
            )}

            {experiences.map((exp, index) => {
              const safeUrl = sanitizeHref(exp.ctaUrl) || '/#packages';
              return (
                <article
                  key={index}
                  data-preview-item-path={`home.experiences[${index}]`}
                  className="group flex flex-col overflow-hidden border border-[#C6A46A]/22 bg-[#0B1E19] transition duration-300 hover:border-[#C6A46A]/60"
                >
                  <div className="lux-image-zoom relative aspect-[4/3] w-full overflow-hidden">
                    <EditableImage
                      src={exp.imageUrl}
                      alt={exp.title}
                      data-preview-field-path={`home.experiences[${index}].imageUrl`}
                      fit="cover"
                      className="h-full w-full object-cover"
                    />
                    <span
                      data-preview-field-path={`home.experiences[${index}].category`}
                      className="absolute left-3 top-3 bg-[#0D241E]/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C6A46A] backdrop-blur-sm"
                      style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                    >
                      {exp.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <EditableText
                      as="h3"
                      color="#F7F3EA"
                      className="font-editorial m-0 mb-2 text-xl font-medium text-[#F7F3EA]"
                      data-preview-field-path={`home.experiences[${index}].title`}
                      defaultValue={exp.title}
                    />
                    <EditableText
                      as="p"
                      color="rgba(247, 243, 234, 0.76)"
                      className="mb-5 text-sm leading-relaxed text-[#F7F3EA]/76"
                      data-preview-field-path={`home.experiences[${index}].description`}
                      defaultValue={exp.description}
                    />
                    <div className="mt-auto border-t border-white/10 pt-3.5">
                      <a
                        href={withBasePath(safeUrl)}
                        data-preview-field-path={`home.experiences[${index}].ctaUrl`}
                        onClick={(e) => {
                          if (safeUrl === '/#tailor-made') {
                            e.preventDefault();
                            onEnquireExperience({ travelStyle: exp.title });
                            document.getElementById('tailor-made')?.scrollIntoView({ behavior: 'smooth' });
                          } else if (safeUrl === '/#packages') {
                            e.preventDefault();
                            onSelectExperienceStyle(exp.category || exp.title);
                            document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#C6A46A] no-underline transition hover:text-[#E5CA96]"
                      >
                        <span data-preview-field-path={`home.experiences[${index}].ctaLabel`}>
                          {exp.ctaLabel}
                        </span>
                        <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Illustrative Accommodation Styles & Essential Planning Notes */}
      <section data-design-section="home-stays" className="lux-section">
        <div className="lux-container">
          <Reveal>
            <div className="mb-12 max-w-2xl">
              <div className="mb-3">
                <EditableText
                  as="span"
                  className="lux-eyebrow"
                  data-preview-field-path="home.staysEyebrow"
                  defaultValue={contentText(home.staysEyebrow) || 'ILLUSTRATIVE ACCOMMODATION STYLES'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                className="font-editorial m-0 text-3xl font-medium text-[var(--lux-text)] sm:text-4xl"
                data-preview-field-path="home.staysHeading"
                defaultValue={contentText(home.staysHeading) || 'Sanctuaries That Belong to Their Landscape'}
              />
              <EditableText
                as="p"
                className="mt-4 text-base leading-relaxed text-[var(--lux-text-muted)]"
                data-preview-field-path="home.staysSummary"
                defaultValue={contentText(home.staysSummary)}
              />
            </div>
          </Reveal>

          <div
            data-preview-list-path="home.stays"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stays.length === 0 && (
              <p
                data-preview-static="stays-empty-state"
                className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-8 text-center text-sm text-[var(--lux-text-muted)]"
              >
                No accommodation styles added yet.
              </p>
            )}

            {stays.map((stay, index) => (
              <article
                key={index}
                data-preview-item-path={`home.stays[${index}]`}
                className="lux-card flex flex-col overflow-hidden"
              >
                <div className="lux-image-zoom aspect-[4/3] w-full overflow-hidden">
                  <EditableImage
                    src={stay.imageUrl}
                    alt={stay.title}
                    data-preview-field-path={`home.stays[${index}].imageUrl`}
                    fit="cover"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span
                    data-preview-field-path={`home.stays[${index}].subtitle`}
                    className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
                    style={{ minHeight: '1.2em' }}
                  >
                    {stay.subtitle}
                  </span>
                  <EditableText
                    as="h3"
                    className="font-editorial m-0 mb-2 text-xl font-medium text-[var(--lux-text)]"
                    data-preview-field-path={`home.stays[${index}].title`}
                    defaultValue={stay.title}
                  />
                  <EditableText
                    as="p"
                    className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                    data-preview-field-path={`home.stays[${index}].description`}
                    defaultValue={stay.description}
                  />
                </div>
              </article>
            ))}
          </div>

          {/* Essential Island Planning Notes */}
          <div className="mt-16 border-t border-[var(--lux-border)] pt-14">
            <Reveal>
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <EditableText
                  as="h3"
                  className="font-editorial m-0 text-2xl font-medium text-[var(--lux-text)] sm:text-3xl"
                  data-preview-field-path="home.travelTipsHeading"
                  defaultValue={contentText(home.travelTipsHeading) || 'Essential Island Planning Notes'}
                />
                <a
                  href="https://www.eta.gov.lk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-preview-static="official-sri-lanka-eta-link"
                  className="lux-link-underline"
                >
                  Official Sri Lanka ETA Portal ↗
                </a>
              </div>
            </Reveal>

            <div
              data-preview-list-path="home.travelTips"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {travelTips.length === 0 && (
                <p
                  data-preview-static="travel-tips-empty-state"
                  className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-6 text-center text-sm text-[var(--lux-text-muted)]"
                >
                  No planning notes added yet.
                </p>
              )}

              {travelTips.map((tip, index) => (
                <article
                  key={index}
                  data-preview-item-path={`home.travelTips[${index}]`}
                  className="border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-6"
                >
                  <EditableText
                    as="h4"
                    className="font-editorial m-0 mb-2 text-lg font-medium text-[var(--lux-text)]"
                    data-preview-field-path={`home.travelTips[${index}].title`}
                    defaultValue={tip.title}
                  />
                  <EditableText
                    as="p"
                    className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                    data-preview-field-path={`home.travelTips[${index}].body`}
                    defaultValue={tip.body}
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

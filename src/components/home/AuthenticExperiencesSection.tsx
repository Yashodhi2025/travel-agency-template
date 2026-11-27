'use client';

import { useRef } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { sanitizeHref, type TripEnquiryDraft } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '../Reveal';

interface AuthenticExperiencesSectionProps {
  onSelectExperienceStyle: (style: string) => void;
  onEnquireExperience: (draft: TripEnquiryDraft) => void;
}

export function AuthenticExperiencesSection({
  onSelectExperienceStyle,
  onEnquireExperience,
}: AuthenticExperiencesSectionProps) {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const home = contentObject(contentObject(siteData?.content).home);
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const experiences = contentList(home.experiences).map((raw) => {
    const item = contentObject(raw);
    return {
      title: contentText(item.title),
      category: contentText(item.category),
      description: contentText(item.description),
      imageUrl: contentText(item.imageUrl) || '/images/hero-ella.webp',
      imageAlt: contentText(item.imageAlt),
      ctaLabel: contentText(item.ctaLabel) || 'Explore',
      ctaUrl: contentText(item.ctaUrl) || '/#tailor-made',
    };
  });

  const slideGallery = (dir: 'prev' | 'next') => {
    const el = galleryRef.current;
    if (!el) return;
    const step = Math.max(300, el.clientWidth * 0.7);
    el.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
  };

  return (
    <section
      id="experiences"
      data-design-section="home-experiences"
      className="lux-section lux-section-dark relative overflow-hidden"
    >
      <div className="lux-container">
        <Reveal variant="fade-up">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <div className="mb-2.5">
                <EditableText
                  as="span"
                  color="#C5A46D"
                  className="lux-eyebrow !text-[#C5A46D]"
                  data-preview-field-path="home.experiencesEyebrow"
                  defaultValue={contentText(home.experiencesEyebrow) || 'SIGNATURE EXPERIENCES'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                color="#FAF8F3"
                className="font-display m-0 text-2xl font-bold tracking-[-0.025em] text-[#FAF8F3] sm:text-3xl lg:text-[2.25rem]"
                data-preview-field-path="home.experiencesHeading"
                defaultValue={contentText(home.experiencesHeading) || 'Signature Island Experiences'}
              />
              <EditableText
                as="p"
                color="#A3B0BA"
                className="mt-2 m-0 text-sm leading-relaxed text-[#A3B0BA] sm:text-[15px]"
                data-preview-field-path="home.experiencesSummary"
                defaultValue={contentText(home.experiencesSummary)}
              />
            </div>

            {!isEditorPreview && experiences.length > 2 && (
              <div className="flex items-center gap-2 self-start lg:self-end">
                <button
                  type="button"
                  data-preview-static="experiences-slide-prev"
                  aria-label="Slide experiences left"
                  onClick={() => slideGallery('prev')}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/5 text-base text-[#FAF8F3] transition hover:border-[#C5A46D] hover:text-[#C5A46D]"
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  type="button"
                  data-preview-static="experiences-slide-next"
                  aria-label="Slide experiences right"
                  onClick={() => slideGallery('next')}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/5 text-base text-[#FAF8F3] transition hover:border-[#C5A46D] hover:text-[#C5A46D]"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>
        </Reveal>

        {/* Compact Horizontal Photographic Carousel */}
        <div
          ref={galleryRef}
          data-preview-list-path="home.experiences"
          className={
            isEditorPreview
              ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
              : 'lux-rail -mx-1 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto px-1 pb-2'
          }
        >
          {experiences.length === 0 && (
            <p
              data-preview-static="experiences-empty-state"
              className="w-full border border-dashed border-white/25 p-8 text-center text-sm text-[#A3B0BA]"
            >
              No signature experiences added yet. Add Sri Lankan experiences in Fivora.
            </p>
          )}

          {experiences.map((exp, index) => {
            const safeUrl = sanitizeHref(exp.ctaUrl) || '/#tailor-made';

            return (
              <article
                key={index}
                data-preview-item-path={`home.experiences[${index}]`}
                className={`group flex flex-col ${
                  isEditorPreview
                    ? 'rounded-md border border-white/15 bg-[#151F28] p-3'
                    : 'w-[265px] shrink-0 snap-start sm:w-[300px] lg:w-[320px]'
                }`}
              >
                <div className="lux-image-zoom relative aspect-[16/10] w-full overflow-hidden rounded-[6px] bg-[#1B252E]">
                  <EditableImage
                    src={exp.imageUrl}
                    alt={exp.imageAlt || exp.title}
                    data-preview-field-path={`home.experiences[${index}].imageUrl`}
                    fit="cover"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col pt-3.5">
                  <span
                    data-preview-field-path={`home.experiences[${index}].category`}
                    className="font-display mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#C5A46D]"
                    style={{ minHeight: '1.1em' }}
                  >
                    {exp.category}
                  </span>

                  <EditableText
                    as="h3"
                    color="#FAF8F3"
                    className="font-display m-0 mb-1.5 text-base font-bold text-[#FAF8F3]"
                    data-preview-field-path={`home.experiences[${index}].title`}
                    defaultValue={exp.title}
                  />

                  <EditableText
                    as="p"
                    color="#A3B0BA"
                    className="m-0 mb-3 line-clamp-2 text-[13px] leading-relaxed text-[#A3B0BA]"
                    data-preview-field-path={`home.experiences[${index}].description`}
                    defaultValue={exp.description}
                  />

                  {isEditorPreview && (
                    <div className="mb-2.5 rounded border border-dashed border-white/20 p-2 text-[11px] text-[#A3B0BA]">
                      <span data-preview-static="exp-alt-label">Alt: </span>
                      <span data-preview-field-path={`home.experiences[${index}].imageAlt`}>
                        {exp.imageAlt || exp.title}
                      </span>
                    </div>
                  )}

                  <div className="mt-auto">
                    <a
                      href={withBasePath(safeUrl)}
                      data-preview-field-path={`home.experiences[${index}].ctaUrl`}
                      onClick={(e) => {
                        if (isEditorPreview) return;
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
                      className="font-display inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.06em] text-[#FAF8F3] no-underline transition hover:text-[#FF783D]"
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
  );
}

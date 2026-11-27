'use client';

import { EditableCard, EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useServices, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { saveTripEnquiryDraft } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

export default function ServicesPage() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData.content);
  const page = contentObject(content.servicesPage);
  const services = useServices();

  const handleEnquireService = (serviceName: string) => {
    saveTripEnquiryDraft({ serviceName });
    window.location.href = withBasePath('/contact/');
  };

  return (
    <div data-preview-page-key="services">
      {/* Cinematic Services Hero Banner */}
      <section
        data-design-section="services-heading"
        className="relative isolate flex min-h-[46vh] items-end overflow-hidden bg-[#0D241E] text-[#F7F3EA]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={contentText(page.bannerImageUrl) || '/images/exp-villa.webp'}
            alt={contentText(page.heading) || 'Bespoke travel services'}
            data-preview-field-path="servicesPage.bannerImageUrl"
            fit="cover"
            className="h-full w-full object-cover opacity-55"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#091814]/92 via-[#0D241E]/60 to-[#091814]/40"
        />

        <div className="lux-container relative z-10 pb-14 pt-20">
          <div className="max-w-3xl">
            <div className="mb-3">
              <EditableText
                as="span"
                color="#C6A46A"
                className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A46A]"
                data-preview-field-path="servicesPage.eyebrow"
                defaultValue={contentText(page.eyebrow) || 'BESPOKE TRAVEL SERVICES'}
              />
            </div>
            <EditableText
              as="h1"
              variant="h1"
              color="#F7F3EA"
              className="font-editorial m-0 mb-4 text-4xl font-medium leading-[1.08] text-[#F7F3EA] sm:text-5xl lg:text-6xl"
              data-preview-field-path="servicesPage.heading"
              defaultValue={contentText(page.heading)}
            />
            <EditableText
              as="p"
              color="rgba(247, 243, 234, 0.84)"
              className="m-0 max-w-2xl text-base leading-relaxed text-[#F7F3EA]/84 sm:text-lg"
              data-preview-field-path="servicesPage.intro"
              defaultValue={contentText(page.intro)}
            />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="lux-section" data-design-section="services-list">
        <div className="lux-container">
          <div
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            data-preview-list-path="services"
          >
            {services.length === 0 && (
              <p
                data-preview-static="services-empty-state"
                className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-10 text-center text-sm text-[var(--lux-text-muted)]"
              >
                No travel services configured yet. Add your agency&apos;s services in Fivora.
              </p>
            )}

            {services.map((rawService, index) => {
              const service = contentObject(rawService);
              const features = contentList(service.features);
              const imageUrl = contentText(service.imageUrl);
              const itemShowPrice =
                (service as any)?.showPrice !== undefined
                  ? Boolean((service as any).showPrice)
                  : (service as any)?.customData?.showPrice !== undefined
                    ? Boolean((service as any).customData.showPrice)
                    : true;
              const price = (service as any).price;
              const priceLabel = contentText((service as any).priceLabel);
              const hasNumericPrice =
                price !== undefined && price !== null && String(price).trim() !== '' && Number(price) > 0;
              const formattedPrice = hasNumericPrice
                ? typeof price === 'number'
                  ? `USD ${price.toLocaleString('en-US')}`
                  : String(price)
                : '';
              const showsStorefrontPrice = itemShowPrice && (hasNumericPrice || Boolean(priceLabel));

              return (
                <EditableCard
                  key={contentText(service.id) || index}
                  className="lux-card flex flex-col overflow-hidden !p-0"
                  item={service as any}
                  itemPath={`services[${index}]`}
                  imageKey="__custom__"
                  data-preview-item-path={`services[${index}]`}
                  balance
                  radius="md"
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  {(imageUrl || isEditorPreview) && (
                    <div className="lux-image-zoom aspect-[16/10] w-full overflow-hidden">
                      <EditableImage
                        src={imageUrl || '/images/hero-sigiriya.webp'}
                        alt={contentText(service.name)}
                        data-preview-field-path={`services[${index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <EditableText
                      as="h2"
                      className="font-editorial m-0 text-2xl font-medium text-[var(--lux-text)]"
                      data-preview-field-path={`services[${index}].name`}
                      defaultValue={contentText(service.name)}
                    />
                    <EditableText
                      as="p"
                      className="mt-2.5 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path={`services[${index}].description`}
                      defaultValue={contentText(service.description)}
                    />

                    {(features.length > 0 || isEditorPreview) && (
                      <ul
                        className="m-0 mt-5 flex list-none flex-col gap-2 border-t border-[var(--lux-border)] pt-4 p-0"
                        data-preview-list-path={`services[${index}].features`}
                      >
                        {features.map((feature, fIndex) => (
                          <li
                            key={fIndex}
                            data-preview-item-path={`services[${index}].features[${fIndex}]`}
                            className="flex items-start gap-2 text-xs text-[var(--lux-text-muted)]"
                          >
                            <span aria-hidden="true" className="mt-0.5 text-[#C6A46A]">✦</span>
                            <span data-preview-field-path={`services[${index}].features[${fIndex}]`}>
                              {contentText(feature)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {isEditorPreview && (
                      <div className="mt-4 grid gap-1.5 rounded border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface-alt)] p-3 text-xs">
                        <strong data-preview-static="service-pricing-settings-heading">Pricing settings</strong>
                        <div>
                          <span data-preview-static="service-show-price-label">Show price: </span>
                          <span data-preview-field-path={`services[${index}].showPrice`}>
                            {itemShowPrice ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {(!showsStorefrontPrice || !hasNumericPrice) && (
                          <div>
                            <span data-preview-static="service-price-label">Price: </span>
                            <span data-preview-field-path={`services[${index}].price`}>
                              {hasNumericPrice ? formattedPrice : '0'}
                            </span>
                          </div>
                        )}
                        {(!showsStorefrontPrice || !priceLabel) && (
                          <div>
                            <span data-preview-static="service-price-note-label">Price label: </span>
                            <span data-preview-field-path={`services[${index}].priceLabel`}>
                              {priceLabel || 'Not set'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-6">
                      {showsStorefrontPrice ? (
                        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-[var(--lux-border)] pt-4">
                          {hasNumericPrice && (
                            <EditableText
                              as="span"
                              className="font-editorial text-xl font-semibold text-[var(--lux-forest)]"
                              data-preview-field-path={`services[${index}].price`}
                              defaultValue={formattedPrice}
                            />
                          )}
                          {priceLabel && (
                            <EditableText
                              as="span"
                              className="text-xs text-[var(--lux-text-muted)]"
                              data-preview-field-path={`services[${index}].priceLabel`}
                              defaultValue={priceLabel}
                            />
                          )}
                        </div>
                      ) : !itemShowPrice ? (
                        <div className="mb-4 border-t border-[var(--lux-border)] pt-4">
                          <span
                            data-preview-static="service-quote-on-request"
                            className="inline-flex border border-[#C6A46A]/55 bg-[#C6A46A]/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--lux-forest)]"
                          >
                            Quote on Request
                          </span>
                        </div>
                      ) : null}

                      <button
                        type="button"
                        data-preview-static="service-enquire-button"
                        onClick={() => handleEnquireService(contentText(service.name))}
                        className="lux-btn-outline w-full !min-h-[42px] !text-xs"
                      >
                        Enquire About This Service
                      </button>
                    </div>
                  </div>
                </EditableCard>
              );
            })}
          </div>

          {/* Bottom Concierge Band */}
          <Reveal className="mt-16">
            <div className="flex flex-col items-start justify-between gap-6 border border-[#C6A46A]/35 bg-[#102D25] p-8 text-[#F7F3EA] md:flex-row md:items-center md:p-12">
              <div className="max-w-2xl">
                <EditableText
                  as="h2"
                  color="#F7F3EA"
                  className="font-editorial m-0 mb-2 text-2xl font-medium text-[#F7F3EA] sm:text-3xl"
                  data-preview-field-path="servicesPage.ctaHeading"
                  defaultValue={contentText(page.ctaHeading) || 'Need a Combined Itinerary & Transfer Proposal?'}
                />
                <EditableText
                  as="p"
                  color="rgba(247, 243, 234, 0.8)"
                  className="m-0 text-sm leading-relaxed text-[#F7F3EA]/80 sm:text-base"
                  data-preview-field-path="servicesPage.ctaBody"
                  defaultValue={contentText(page.ctaBody)}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = withBasePath('/contact/');
                }}
                className="lux-btn-gold flex-shrink-0"
              >
                <span data-preview-field-path="servicesPage.ctaLabel">
                  {contentText(page.ctaLabel) || 'Request a Service Quotation'}
                </span>
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

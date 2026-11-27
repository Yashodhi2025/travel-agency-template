'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditableCard, EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useServices, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import {
  buildWhatsAppEnquiryUrl,
  formatMoney,
  saveTripEnquiryDraft,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

const SERVICE_FILTERS = [
  { id: 'All', label: 'All Services', match: [] as string[] },
  { id: 'Planning', label: 'Holiday Planning', match: ['domestic', 'inbound', 'outbound', 'tailor', 'honeymoon', 'family'] },
  { id: 'Transport', label: 'Transfers & Chauffeurs', match: ['airport', 'transfer', 'chauffeur', 'car', 'driver'] },
  { id: 'Stays', label: 'Stays & Safaris', match: ['hotel', 'resort', 'villa', 'wildlife', 'safari', 'excursion'] },
  { id: 'Groups', label: 'Groups & Guidance', match: ['group', 'corporate', 'documentation', 'guidance'] },
] as const;

export default function ServicesPage() {
  const router = useRouter();
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const page = contentObject(content.servicesPage);
  const common = contentObject(content.common);
  const contact = contentObject(content.contact);
  const shop = contentObject(siteData?.shop);
  const shopContact = contentObject(shop.contact);
  const services = useServices();

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

  const [activeFilter, setActiveFilter] = useState<string>('All');

  const indexedServices = useMemo(
    () =>
      services.map((raw, index) => ({
        service: contentObject(raw),
        index,
      })),
    [services],
  );

  const visibleServices = useMemo(() => {
    if (isEditorPreview || activeFilter === 'All') return indexedServices;
    const def = SERVICE_FILTERS.find((f) => f.id === activeFilter);
    if (!def || def.match.length === 0) return indexedServices;
    return indexedServices.filter(({ service }) => {
      const hay = `${contentText(service.name)} ${contentText(service.description)}`.toLowerCase();
      return def.match.some((kw) => hay.includes(kw));
    });
  }, [indexedServices, isEditorPreview, activeFilter]);

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);

  const handlePlanService = (serviceName: string) => {
    const lower = serviceName.toLowerCase();
    saveTripEnquiryDraft({
      travelType: lower.includes('outbound')
        ? 'Outbound'
        : lower.includes('domestic')
          ? 'Domestic'
          : lower.includes('inbound')
            ? 'Inbound'
            : undefined,
      travelStyle: lower.includes('honeymoon')
        ? 'Honeymoon'
        : lower.includes('corporate') || lower.includes('group')
          ? 'Corporate Travel'
          : lower.includes('wildlife') || lower.includes('safari')
            ? 'Wildlife & Nature'
            : undefined,
      serviceName,
      sourceLabel: `Service: ${serviceName}`,
    });
    router.push(plannerTarget);
  };

  const bannerImageUrl = contentText(page.bannerImageUrl) || '/images/exp-villa.webp';
  const bannerImageAlt =
    contentText(page.bannerImageAlt) || contentText(page.heading) || 'Bespoke travel services';
  const generalWhatsappUrl = buildWhatsAppEnquiryUrl(
    agencyWhatsApp,
    `Hello ${brandName}, I would like a quotation for your Sri Lanka travel services.`,
  );

  return (
    <div data-preview-page-key="services">
      {/* Compact Cinematic Hero */}
      <section
        data-design-section="services-heading"
        className="relative isolate flex min-h-[38vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={bannerImageUrl}
            alt={bannerImageAlt}
            data-preview-field-path="servicesPage.bannerImageUrl"
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
              data-preview-static="services-breadcrumb-home"
              className="text-[#FAF8F3]/80 no-underline transition hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <EditableText
              as="span"
              color="#C5A46D"
              className="font-semibold text-[#C5A46D]"
              data-preview-field-path="servicesPage.breadcrumbLabel"
              defaultValue={contentText(page.breadcrumbLabel) || 'Services'}
            />
          </div>

          <div className="max-w-3xl">
            <div className="mb-2.5">
              <EditableText
                as="span"
                color="#C5A46D"
                className="lux-eyebrow !text-[#C5A46D]"
                data-preview-field-path="servicesPage.eyebrow"
                defaultValue={contentText(page.eyebrow) || 'TRAVEL SERVICES'}
              />
            </div>
            <EditableText
              as="h1"
              variant="h1"
              color="#FAF8F3"
              className="font-display m-0 mb-2.5 text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#FAF8F3] sm:text-4xl lg:text-5xl"
              data-preview-field-path="servicesPage.heading"
              defaultValue={contentText(page.heading)}
            />
            <EditableText
              as="p"
              color="rgba(250, 248, 243, 0.82)"
              className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/82 sm:text-base"
              data-preview-field-path="servicesPage.intro"
              defaultValue={contentText(page.intro)}
            />

            {isEditorPreview && (
              <div className="mt-3 inline-block rounded border border-dashed border-white/25 bg-[#101820]/65 px-2.5 py-1 text-[11px] text-[#A3B0BA]">
                <span data-preview-static="services-hero-alt-label">Hero alt: </span>
                <span data-preview-field-path="servicesPage.bannerImageAlt">{bannerImageAlt}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Bar & Services Catalog */}
      <section className="lux-section bg-[var(--lux-bg)]" data-design-section="services-list">
        <div className="lux-container">
          {!isEditorPreview && services.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--lux-border)] pb-5">
              <div className="flex flex-wrap gap-1.5">
                {SERVICE_FILTERS.map((cat) => {
                  const active = activeFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      data-preview-static="services-category-filter"
                      aria-pressed={active}
                      onClick={() => setActiveFilter(cat.id)}
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
              <span data-preview-static="services-count-label" className="text-xs font-medium text-[var(--lux-text-muted)]">
                Showing {visibleServices.length} of {services.length} services
              </span>
            </div>
          )}

          <div
            className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3"
            data-preview-list-path="services"
          >
            {services.length === 0 && (
              <p
                data-preview-static="services-empty-state"
                className="col-span-full rounded-[6px] border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center text-sm text-[var(--lux-text-muted)]"
              >
                No travel services configured yet. Add your agency&apos;s services in Fivora.
              </p>
            )}

            {services.length > 0 && visibleServices.length === 0 && !isEditorPreview && (
              <div className="col-span-full rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-10 text-center">
                <p data-preview-static="services-no-match-title" className="font-display m-0 mb-2 text-lg font-bold text-[var(--lux-text)]">
                  No Services in This Category
                </p>
                <button
                  type="button"
                  data-preview-static="services-no-match-reset"
                  onClick={() => setActiveFilter('All')}
                  className="lux-btn-outline !min-h-[40px]"
                >
                  Show All Services
                </button>
              </div>
            )}

            {visibleServices.map(({ service, index }) => {
              const features = contentList(service.features);
              const imageUrl = contentText(service.imageUrl);
              const serviceName = contentText(service.name);
              const itemShowPrice =
                (service as any)?.showPrice !== undefined
                  ? Boolean((service as any).showPrice)
                  : (service as any)?.customData?.showPrice !== undefined
                    ? Boolean((service as any).customData.showPrice)
                    : true;
              const price = (service as any).price;
              const priceLabel = contentText((service as any).priceLabel);
              const numericPrice = typeof price === 'number' ? price : parseFloat(String(price ?? 0));
              const hasNumericPrice =
                price !== undefined &&
                price !== null &&
                String(price).trim() !== '' &&
                Number.isFinite(numericPrice) &&
                numericPrice > 0;
              const formattedPrice = hasNumericPrice ? formatMoney(numericPrice, 'LKR') : '';
              const showsStorefrontPrice = itemShowPrice && (hasNumericPrice || Boolean(priceLabel));

              const serviceWhatsappUrl = buildWhatsAppEnquiryUrl(
                agencyWhatsApp,
                `Hello ${brandName}, I would like to enquire about your "${serviceName}" service.`,
              );

              return (
                <EditableCard
                  key={contentText(service.id) || index}
                  className="flex flex-col overflow-hidden rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] !p-0 transition-shadow duration-300 hover:shadow-[var(--lux-shadow-md)]"
                  item={service as any}
                  itemPath={`services[${index}]`}
                  imageKey="__custom__"
                  data-preview-item-path={`services[${index}]`}
                  balance
                  radius="sm"
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  {(imageUrl || isEditorPreview) && (
                    <div className="lux-image-zoom aspect-[16/10] w-full overflow-hidden bg-[#101820]">
                      <EditableImage
                        src={imageUrl || '/images/hero-sigiriya.webp'}
                        alt={serviceName}
                        data-preview-field-path={`services[${index}].imageUrl`}
                        fit="cover"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <EditableText
                      as="h2"
                      className="font-display m-0 text-lg font-bold leading-snug text-[var(--lux-text)] sm:text-xl"
                      data-preview-field-path={`services[${index}].name`}
                      defaultValue={serviceName}
                    />
                    <EditableText
                      as="p"
                      className="mt-2 m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path={`services[${index}].description`}
                      defaultValue={contentText(service.description)}
                    />

                    {(features.length > 0 || isEditorPreview) && (
                      <ul
                        className="m-0 mt-4 flex list-none flex-col gap-1.5 border-t border-[var(--lux-border)] pt-3.5 p-0"
                        data-preview-list-path={`services[${index}].features`}
                      >
                        {features.length === 0 && (
                          <li
                            data-preview-static="service-features-empty"
                            className="text-xs italic text-[var(--lux-text-muted)]"
                          >
                            No feature highlights added yet.
                          </li>
                        )}
                        {features.map((feature, fIndex) => (
                          <li
                            key={fIndex}
                            data-preview-item-path={`services[${index}].features[${fIndex}]`}
                            className="flex items-start gap-2 text-xs text-[var(--lux-text-muted)]"
                          >
                            <span aria-hidden="true" className="mt-0.5 text-[#C5A46D]">✦</span>
                            <span data-preview-field-path={`services[${index}].features[${fIndex}]`}>
                              {contentText(feature)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {isEditorPreview && (
                      <div className="mt-4 grid gap-1 rounded border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface-alt)] p-3 text-xs">
                        <strong data-preview-static="service-pricing-settings-heading">Pricing settings</strong>
                        <div>
                          <span data-preview-static="service-show-price-label">Show price: </span>
                          <span data-preview-field-path={`services[${index}].showPrice`}>
                            {itemShowPrice ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {(!showsStorefrontPrice || !hasNumericPrice) && (
                          <div>
                            <span data-preview-static="service-price-label">Price (LKR): </span>
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

                    <div className="mt-auto pt-5">
                      {showsStorefrontPrice ? (
                        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2 border-t border-[var(--lux-border)] pt-3.5">
                          {hasNumericPrice && (
                            <EditableText
                              as="span"
                              className="font-display text-base font-bold text-[var(--lux-text)]"
                              data-preview-field-path={`services[${index}].price`}
                              defaultValue={formattedPrice}
                            />
                          )}
                          {priceLabel && (
                            <EditableText
                              as="span"
                              className="text-[11px] text-[var(--lux-text-muted)]"
                              data-preview-field-path={`services[${index}].priceLabel`}
                              defaultValue={priceLabel}
                            />
                          )}
                        </div>
                      ) : !itemShowPrice ? (
                        <div className="mb-3.5 border-t border-[var(--lux-border)] pt-3.5">
                          <span
                            data-preview-static="service-quote-on-request"
                            className="font-display text-xs font-bold uppercase tracking-[0.08em] text-[var(--lux-tropical)]"
                          >
                            Request a Quote
                          </span>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          data-preview-static="service-enquire-button"
                          onClick={() => handlePlanService(serviceName)}
                          className="lux-btn-tropical flex-1 !min-h-[40px] !px-3.5 !text-[11px]"
                        >
                          Enquire Now →
                        </button>
                        {serviceWhatsappUrl && (
                          <a
                            href={serviceWhatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-preview-static="service-whatsapp-btn"
                            className="lux-btn-outline !min-h-[40px] !px-3 !text-[11px]"
                          >
                            WhatsApp ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </EditableCard>
              );
            })}
          </div>

          {/* Honest Coordination Disclaimer */}
          <div className="mt-8 rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-4">
            <EditableText
              as="p"
              className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]"
              data-preview-field-path="servicesPage.serviceNotice"
              defaultValue={
                contentText(page.serviceNotice) ||
                'All services are arranged personally upon quotation. Displayed LKR rates are illustrative starting guides only.'
              }
            />
          </div>
        </div>
      </section>

      {/* Bottom Concierge Band */}
      <section className="lux-section lux-section-tropical" data-design-section="services-cta">
        <div className="lux-container">
          <Reveal variant="fade-up">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <EditableText
                  as="h2"
                  color="#FAF8F3"
                  className="font-display m-0 mb-2 text-2xl font-bold text-[#FAF8F3] sm:text-3xl"
                  data-preview-field-path="servicesPage.ctaHeading"
                  defaultValue={contentText(page.ctaHeading) || 'Need a Combined Itinerary & Transport Quotation?'}
                />
                <EditableText
                  as="p"
                  color="rgba(250, 248, 243, 0.82)"
                  className="m-0 text-sm leading-relaxed text-[#FAF8F3]/82 sm:text-base"
                  data-preview-field-path="servicesPage.ctaBody"
                  defaultValue={contentText(page.ctaBody)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push(plannerTarget)}
                  className="lux-btn-sunset"
                >
                  <span data-preview-field-path="servicesPage.ctaLabel">
                    {contentText(page.ctaLabel) || 'Plan Your Services'}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
                {generalWhatsappUrl && (
                  <a
                    href={generalWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-preview-static="services-bottom-whatsapp-cta"
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

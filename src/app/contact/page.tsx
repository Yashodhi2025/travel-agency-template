'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { EditableBox, EditableImage, EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import {
  buildMailtoEnquiryUrl,
  buildWhatsAppEnquiryUrl,
  readTripEnquiryDraft,
  sanitizeHref,
  sanitizePhoneDigits,
} from '@/lib/travelHelpers';

export default function ContactPage() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData.content);
  const contact = contentObject(content.contact);
  const common = contentObject(content.common);
  const shop = contentObject(siteData?.shop);
  const shopContact = contentObject(shop.contact);

  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [fallbackChannels, setFallbackChannels] = useState<{
    mailto: string | null;
    whatsapp: string | null;
  } | null>(null);

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const directionsLabel = contentText(contact.directionsLabel) || 'View Location on Map';
  const directionsUrl = sanitizeHref(
    contentText(contact.directionsUrl) ||
      contentText(contact.mapUrl) ||
      contentText(contact.addressUrl),
  );
  const address = contentText(shop?.address && typeof shop.address === 'object' ? (shop.address as any).line1 : '') || contentText(contact.address);
  const phone = contentText(shopContact.phone) || contentText(contact.phone);
  const email = contentText(shopContact.email) || contentText(contact.email);
  const whatsapp = contentText(shopContact.whatsapp) || contentText(contact.whatsapp) || phone;
  const directMessageText = contentText(contact.directMessageText) || 'Consult on WhatsApp';

  const phoneDigits = sanitizePhoneDigits(phone);
  const whatsappUrl = buildWhatsAppEnquiryUrl(
    whatsapp,
    `Hello ${brandName}, I would like to discuss planning a trip to Sri Lanka.`,
  );

  useEffect(() => {
    const draft = readTripEnquiryDraft();
    if (!draft) return;
    const parts = [
      draft.serviceName ? `Service of interest: ${draft.serviceName}` : null,
      draft.packageName ? `Itinerary of interest: ${draft.packageName}` : null,
      draft.destination ? `Preferred destination: ${draft.destination}` : null,
      draft.duration ? `Preferred duration: ${draft.duration}` : null,
      draft.travelDate ? `Preferred travel month: ${draft.travelDate}` : null,
      draft.travellers ? `Travellers: ${draft.travellers}` : null,
    ].filter(Boolean);
    if (parts.length > 0) {
      setMessage((prev) => prev || parts.join('\n'));
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('');
    setFallbackChannels(null);

    if (!name.trim() || !senderEmail.trim() || !message.trim()) {
      setStatus('Please complete your name, email address, and travel message before sending.');
      return;
    }

    const composedText = `Travel Enquiry for ${brandName}\nName: ${name.trim()}\nEmail: ${senderEmail.trim()}\n\n${message.trim()}`;
    const mailto = buildMailtoEnquiryUrl(email, `Travel Enquiry — ${name.trim()}`, composedText);
    const wa = buildWhatsAppEnquiryUrl(whatsapp, composedText);

    const projectId = siteData.project?.id?.trim();
    const isDemoProject =
      !projectId ||
      projectId === 'ceylon-odyssey-template' ||
      projectId === 'template-validation';

    if (isDemoProject) {
      setStatus('Your enquiry brief is ready. Select email or WhatsApp below to send it directly to the agency.');
      setFallbackChannels({ mailto, whatsapp: wa });
      return;
    }

    setStatus('Sending your enquiry...');
    try {
      const response = await fetch(siteData.api?.contactUrl || '/site-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name: name.trim(),
          email: senderEmail.trim(),
          message: message.trim(),
        }),
      });
      if (!response.ok) throw new Error('Endpoint unavailable');
      setName('');
      setSenderEmail('');
      setMessage('');
      setStatus('Thank you — your travel enquiry has been delivered to our concierge team.');
    } catch {
      setStatus('Direct endpoint delivery is currently unavailable. Please send your prefilled brief using email or WhatsApp below.');
      setFallbackChannels({ mailto, whatsapp: wa });
    }
  }

  return (
    <div data-preview-page-key="contact">
      {/* Cinematic Contact Banner */}
      <section
        data-design-section="contact-heading"
        className="relative isolate flex min-h-[44vh] items-end overflow-hidden bg-[#0D241E] text-[#F7F3EA]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={contentText(contact.bannerImageUrl) || '/images/hero-galle.webp'}
            alt={contentText(contact.heading) || 'Contact Ceylon Odyssey'}
            data-preview-field-path="contact.bannerImageUrl"
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
                data-preview-field-path="contact.eyebrow"
                defaultValue={contentText(contact.eyebrow) || 'CONCIERGE & ENQUIRIES'}
              />
            </div>
            <EditableText
              as="h1"
              variant="h1"
              color="#F7F3EA"
              className="font-editorial m-0 mb-4 text-4xl font-medium leading-[1.08] text-[#F7F3EA] sm:text-5xl lg:text-6xl"
              data-preview-field-path="contact.heading"
              defaultValue={contentText(contact.heading)}
            />
            <EditableText
              as="p"
              color="rgba(247, 243, 234, 0.84)"
              className="m-0 max-w-2xl text-base leading-relaxed text-[#F7F3EA]/84 sm:text-lg"
              data-preview-field-path="contact.intro"
              defaultValue={contentText(contact.intro)}
            />
          </div>
        </div>
      </section>

      {/* Contact Details + Enquiry Form */}
      <section id="enquiry-info" className="lux-section" data-design-section="contact-details">
        <div className="lux-container">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
            {/* Concierge Info Card */}
            <div className="space-y-6 lg:col-span-5">
              <EditableBox
                stylePath="contact.informationCard"
                className="lux-card p-7"
                balance
                radius="md"
              >
                <EditableText
                  as="h2"
                  className="font-editorial m-0 mb-5 text-2xl font-medium text-[var(--lux-text)]"
                  fieldPath="contact.directInformationTitle"
                  defaultValue={contentText(contact.directInformationTitle) || 'Direct Concierge Details'}
                  placeholder="Add an information heading"
                />

                <div className="space-y-4 text-sm">
                  <div>
                    <span data-preview-static="contact-phone-label" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]">
                      Telephone
                    </span>
                    {phoneDigits.length >= 7 || isEditorPreview ? (
                      <a
                        href={phoneDigits.length >= 7 ? `tel:${phone}` : '#'}
                        data-preview-field-path="contact.phone"
                        className="mt-1 inline-block text-base font-medium text-[var(--lux-text)] no-underline hover:text-[var(--lux-gold-deep)]"
                        style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                      >
                        {phone}
                      </a>
                    ) : (
                      <span data-preview-static="contact-phone-unconfigured" className="mt-1 block text-xs text-[var(--lux-text-muted)]">
                        Telephone not configured
                      </span>
                    )}
                  </div>

                  <div>
                    <span data-preview-static="contact-email-label" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]">
                      Email
                    </span>
                    {email || isEditorPreview ? (
                      <a
                        href={email ? `mailto:${email}` : '#'}
                        data-preview-field-path="contact.email"
                        className="mt-1 inline-block break-all text-base font-medium text-[var(--lux-text)] no-underline hover:text-[var(--lux-gold-deep)]"
                        style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                      >
                        {email}
                      </a>
                    ) : (
                      <span data-preview-static="contact-email-unconfigured" className="mt-1 block text-xs text-[var(--lux-text-muted)]">
                        Email not configured
                      </span>
                    )}
                  </div>

                  <div>
                    <span data-preview-static="contact-address-label" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]">
                      Office Address
                    </span>
                    <EditableText
                      as="p"
                      className="m-0 mt-1 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path="contact.address"
                      defaultValue={address}
                    />
                  </div>

                  <div className="border-t border-[var(--lux-border)] pt-4">
                    <EditableText
                      as="h3"
                      className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
                      data-preview-field-path="contact.openingHoursHeading"
                      defaultValue={contentText(contact.openingHoursHeading) || 'Concierge Hours'}
                    />
                    <EditableText
                      as="p"
                      className="m-0 mt-1 text-sm text-[var(--lux-text-muted)]"
                      data-preview-field-path="contact.openingHours"
                      defaultValue={contentText(contact.openingHours)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--lux-border)] pt-5">
                  {(directionsUrl || isEditorPreview) && (
                    <a
                      href={directionsUrl || '#'}
                      data-preview-field-path="contact.directionsUrl"
                      target={directionsUrl ? '_blank' : undefined}
                      rel={directionsUrl ? 'noopener noreferrer' : undefined}
                      className="lux-btn-outline !min-h-[42px] !px-4 !text-xs"
                    >
                      <svg
                        data-preview-static="map-link-icon"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span data-preview-field-path="contact.directionsLabel">{directionsLabel}</span>
                    </a>
                  )}

                  {(whatsappUrl || isEditorPreview) && (
                    <a
                      href={whatsappUrl || '#'}
                      target={whatsappUrl ? '_blank' : undefined}
                      rel={whatsappUrl ? 'noopener noreferrer' : undefined}
                      className="lux-btn-primary !min-h-[42px] !px-4 !text-xs"
                      data-preview-field-path="contact.whatsapp"
                    >
                      <span data-preview-field-path="contact.directMessageText">
                        {directMessageText}
                      </span>
                    </a>
                  )}
                </div>
              </EditableBox>

              {/* Transparent Enquiry Guidance Card */}
              <div className="border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-6">
                <EditableText
                  as="h3"
                  className="font-editorial m-0 mb-2 text-xl font-medium text-[var(--lux-text)]"
                  data-preview-field-path="contact.enquiryGuidanceHeading"
                  defaultValue={contentText(contact.enquiryGuidanceHeading) || 'How Enquiries Work'}
                />
                <EditableText
                  as="p"
                  className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                  data-preview-field-path="contact.enquiryGuidance"
                  defaultValue={contentText(contact.enquiryGuidance)}
                />
              </div>
            </div>

            {/* Enquiry Form */}
            <div className="lg:col-span-7">
              <EditableBox stylePath="contact.formCard" className="lux-card p-7 sm:p-9" balance radius="md">
                <form
                  className="space-y-5"
                  onSubmit={handleSubmit}
                  data-fivora-contact-disabled
                  noValidate
                >
                  <EditableText
                    as="h2"
                    className="font-editorial m-0 text-3xl font-medium text-[var(--lux-text)]"
                    data-preview-field-path="contact.formTitle"
                    defaultValue={contentText(contact.formTitle)}
                  />

                  <label className="block">
                    <EditableText
                      as="span"
                      fieldPath="contact.nameLabel"
                      defaultValue={contentText(contact.nameLabel ?? 'Full Name')}
                      placeholder="Full Name"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    />
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-preview-static="contact-name-input"
                      placeholder="Your full name"
                      className="lux-input"
                    />
                  </label>

                  <label className="block">
                    <EditableText
                      as="span"
                      fieldPath="contact.emailLabel"
                      defaultValue={contentText(contact.emailLabel ?? 'Email Address')}
                      placeholder="Email Address"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    />
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      data-preview-static="contact-email-input"
                      placeholder="you@example.com"
                      className="lux-input"
                    />
                  </label>

                  <label className="block">
                    <EditableText
                      as="span"
                      fieldPath="contact.messageLabel"
                      defaultValue={contentText(contact.messageLabel ?? 'Your Travel Ideas & Requirements')}
                      placeholder="Your Travel Ideas & Requirements"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    />
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      data-preview-static="contact-message-input"
                      placeholder="Share preferred travel dates, duration, destinations, and party size..."
                      className="lux-textarea"
                    />
                  </label>

                  <button type="submit" className="lux-btn-primary">
                    <span data-preview-field-path="contact.submitLabel">
                      {contentText(contact.submitLabel) || 'Send Travel Enquiry'}
                    </span>
                  </button>

                  {status && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="border border-[#C6A46A]/50 bg-[var(--lux-surface-alt)] p-4 text-sm text-[var(--lux-text)]"
                    >
                      <p data-preview-static="contact-status-message" className="m-0">
                        {status}
                      </p>
                      {fallbackChannels && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {fallbackChannels.whatsapp && (
                            <a
                              href={fallbackChannels.whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-preview-static="contact-fallback-whatsapp"
                              className="lux-btn-primary !min-h-[38px] !px-4 !text-xs"
                            >
                              Send via WhatsApp ↗
                            </a>
                          )}
                          {fallbackChannels.mailto && (
                            <a
                              href={fallbackChannels.mailto}
                              data-preview-static="contact-fallback-mailto"
                              className="lux-btn-gold !min-h-[38px] !px-4 !text-xs"
                            >
                              Open in Email App ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </EditableBox>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

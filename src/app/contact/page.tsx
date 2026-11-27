'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
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
import { withBasePath } from '@/lib/utils';

const INQUIRY_TYPES = [
  'General Travel Inquiry',
  'Domestic Sri Lanka Holiday',
  'Inbound Island Tour',
  'Outbound Holiday (Ex-Colombo)',
  'Airport Transfer / Private Chauffeur',
  'Hotel, Resort or Villa Arrangement',
  'Group / Corporate Travel',
] as const;

export default function ContactPage() {
  const router = useRouter();
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const contact = contentObject(content.contact);
  const common = contentObject(content.common);
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
  const plannerTarget = hasPlanner ? '/plan-your-trip/' : '/#tailor-made';

  // Form state kept strictly in memory (never persisted to browser storage)
  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [inquiryType, setInquiryType] = useState<string>('General Travel Inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [preparedBrief, setPreparedBrief] = useState<{
    text: string;
    mailto: string | null;
    whatsapp: string | null;
  } | null>(null);
  const [copyStatus, setCopyStatus] = useState('');

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const directionsLabel = contentText(contact.directionsLabel) || 'View Location on Map';
  const directionsUrl = sanitizeHref(
    contentText(contact.directionsUrl) ||
      contentText(contact.mapUrl) ||
      contentText(contact.addressUrl),
  );
  const address =
    contentText(shop?.address && typeof shop.address === 'object' ? (shop.address as any).line1 : '') ||
    contentText(contact.address);
  const phone = contentText(shopContact.phone) || contentText(shop.businessPhone) || contentText(contact.phone);
  const email = contentText(shopContact.email) || contentText(shop.businessEmail) || contentText(contact.email);
  const whatsapp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    phone;
  const directMessageText = contentText(contact.directMessageText) || 'Chat on WhatsApp';

  const phoneDigits = sanitizePhoneDigits(phone);
  const whatsappUrl = buildWhatsAppEnquiryUrl(
    whatsapp,
    `Hello ${brandName}, I would like to discuss planning a trip with your team.`,
  );

  // Reuse shared social media links from common.socialMedia
  const rawSocial = contentObject(common.socialMedia);
  const socialLinks = Object.entries(rawSocial)
    .map(([key, val]) => ({ key, url: sanitizeHref(contentText(val)) }))
    .filter((entry): entry is { key: string; url: string } => Boolean(entry.url && entry.url.startsWith('http')));

  // Prefill non-PII context if visitor arrived from another page
  useEffect(() => {
    const draft = readTripEnquiryDraft();
    if (!draft) return;
    if (draft.travelType === 'Domestic') setInquiryType('Domestic Sri Lanka Holiday');
    else if (draft.travelType === 'Inbound') setInquiryType('Inbound Island Tour');
    else if (draft.travelType === 'Outbound') setInquiryType('Outbound Holiday (Ex-Colombo)');
    else if (draft.serviceName) setInquiryType('General Travel Inquiry');

    if (draft.serviceName || draft.packageName || draft.offerName) {
      setSubject((prev) => prev || draft.serviceName || draft.packageName || draft.offerName || '');
    }

    const parts = [
      draft.serviceName ? `Service of interest: ${draft.serviceName}` : null,
      draft.packageName ? `Tour package: ${draft.packageName}` : null,
      draft.offerName ? `Special offer: ${draft.offerName}` : null,
      draft.stayName ? `Accommodation style: ${draft.stayName}` : null,
      draft.destination ? `Preferred destination(s): ${draft.destination}` : null,
      draft.duration ? `Preferred duration: ${draft.duration}` : null,
      draft.travelDate ? `Preferred travel date: ${draft.travelDate}` : null,
    ].filter(Boolean);
    if (parts.length > 0) {
      setMessage((prev) => prev || parts.join('\n'));
    }
  }, []);

  function handlePrepareInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopyStatus('');
    const nextErrors: { name?: string; email?: string; message?: string } = {};

    if (!name.trim()) nextErrors.name = 'Please enter your full name.';
    if (!senderEmail.trim()) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!message.trim()) nextErrors.message = 'Please share a brief note about your travel inquiry.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setPreparedBrief(null);
      return;
    }

    const composedText = [
      `Travel Inquiry — ${brandName}`,
      `Inquiry Type: ${inquiryType}`,
      subject.trim() ? `Subject: ${subject.trim()}` : null,
      `Name: ${name.trim()}`,
      `Email: ${senderEmail.trim()}`,
      senderPhone.trim() ? `Phone / WhatsApp: ${senderPhone.trim()}` : null,
      '',
      message.trim(),
    ]
      .filter((line) => line !== null)
      .join('\n');

    const mailSubject = subject.trim()
      ? `${inquiryType}: ${subject.trim()} — ${name.trim()}`
      : `${inquiryType} — ${name.trim()}`;

    setPreparedBrief({
      text: composedText,
      mailto: buildMailtoEnquiryUrl(email, mailSubject, composedText),
      whatsapp: buildWhatsAppEnquiryUrl(whatsapp, composedText),
    });
  }

  const handleCopyBrief = async () => {
    if (!preparedBrief) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(preparedBrief.text);
        setCopyStatus('Inquiry text copied to clipboard.');
        window.setTimeout(() => setCopyStatus(''), 4000);
        return;
      }
      setCopyStatus('Clipboard copy unavailable — select and copy the message above.');
    } catch {
      setCopyStatus('Could not copy automatically — please copy the message text manually.');
    }
  };

  const bannerImageUrl = contentText(contact.bannerImageUrl) || '/images/hero-galle.webp';
  const bannerImageAlt =
    contentText(contact.bannerImageAlt) || contentText(contact.heading) || 'Contact our travel concierge';

  return (
    <div data-preview-page-key="contact">
      {/* Compact Photographic Hero */}
      <section
        data-design-section="contact-heading"
        className="relative isolate flex min-h-[38vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={bannerImageUrl}
            alt={bannerImageAlt}
            data-preview-field-path="contact.bannerImageUrl"
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
              data-preview-static="contact-breadcrumb-home"
              className="text-[#FAF8F3]/80 no-underline transition hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <EditableText
              as="span"
              color="#C5A46D"
              className="font-semibold text-[#C5A46D]"
              data-preview-field-path="contact.breadcrumbLabel"
              defaultValue={contentText(contact.breadcrumbLabel) || 'Contact'}
            />
          </div>

          <div className="max-w-3xl">
            <div className="mb-2.5">
              <EditableText
                as="span"
                color="#C5A46D"
                className="lux-eyebrow !text-[#C5A46D]"
                data-preview-field-path="contact.eyebrow"
                defaultValue={contentText(contact.eyebrow) || 'TRAVEL CONCIERGE'}
              />
            </div>
            <EditableText
              as="h1"
              variant="h1"
              color="#FAF8F3"
              className="font-display m-0 mb-2.5 text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#FAF8F3] sm:text-4xl lg:text-5xl"
              data-preview-field-path="contact.heading"
              defaultValue={contentText(contact.heading)}
            />
            <EditableText
              as="p"
              color="rgba(250, 248, 243, 0.82)"
              className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/82 sm:text-base"
              data-preview-field-path="contact.intro"
              defaultValue={contentText(contact.intro)}
            />

            {isEditorPreview && (
              <div className="mt-3 inline-block rounded border border-dashed border-white/25 bg-[#101820]/65 px-2.5 py-1 text-[11px] text-[#A3B0BA]">
                <span data-preview-static="contact-hero-alt-label">Hero alt: </span>
                <span data-preview-field-path="contact.bannerImageAlt">{bannerImageAlt}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Details + Concierge Inquiry Form */}
      <section className="lux-section bg-[var(--lux-bg)]" data-design-section="contact-details">
        <div className="lux-container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            {/* Left 5 Columns: Direct Details, Planner Callout & Privacy/Terms */}
            <div className="space-y-6 lg:col-span-5">
              <EditableBox
                stylePath="contact.informationCard"
                className="rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-sm)] sm:p-7"
                balance
                radius="sm"
              >
                <EditableText
                  as="h2"
                  className="font-display m-0 mb-5 text-xl font-bold text-[var(--lux-text)]"
                  fieldPath="contact.directInformationTitle"
                  defaultValue={contentText(contact.directInformationTitle) || 'Direct Contact Details'}
                  placeholder="Direct Contact Details"
                />

                <div className="space-y-4 text-sm">
                  <div>
                    <span data-preview-static="contact-phone-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                      Telephone
                    </span>
                    {phoneDigits.length >= 7 || isEditorPreview ? (
                      <a
                        href={phoneDigits.length >= 7 ? `tel:${phone}` : '#'}
                        data-preview-field-path="contact.phone"
                        className="mt-0.5 inline-block text-base font-semibold text-[var(--lux-text)] no-underline hover:text-[var(--brand-accent,#FF783D)]"
                        style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                      >
                        {phone}
                      </a>
                    ) : (
                      <span data-preview-static="contact-phone-unconfigured" className="mt-0.5 block text-xs text-[var(--lux-text-muted)]">
                        Telephone not configured
                      </span>
                    )}
                  </div>

                  <div>
                    <span data-preview-static="contact-email-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                      Email
                    </span>
                    {email || isEditorPreview ? (
                      <a
                        href={email ? `mailto:${email}` : '#'}
                        data-preview-field-path="contact.email"
                        className="mt-0.5 inline-block break-all text-base font-semibold text-[var(--lux-text)] no-underline hover:text-[var(--brand-accent,#FF783D)]"
                        style={{ minWidth: '1.5ch', minHeight: '1.2em' }}
                      >
                        {email}
                      </a>
                    ) : (
                      <span data-preview-static="contact-email-unconfigured" className="mt-0.5 block text-xs text-[var(--lux-text-muted)]">
                        Email not configured
                      </span>
                    )}
                  </div>

                  <div>
                    <span data-preview-static="contact-address-label" className="font-display block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]">
                      Office Location
                    </span>
                    <EditableText
                      as="p"
                      className="m-0 mt-0.5 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                      data-preview-field-path="contact.address"
                      defaultValue={address}
                    />
                  </div>

                  <div className="border-t border-[var(--lux-border)] pt-3.5">
                    <EditableText
                      as="h3"
                      className="font-display m-0 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]"
                      data-preview-field-path="contact.openingHoursHeading"
                      defaultValue={contentText(contact.openingHoursHeading) || 'Business Hours'}
                    />
                    <EditableText
                      as="p"
                      className="m-0 mt-0.5 text-sm text-[var(--lux-text-muted)]"
                      data-preview-field-path="contact.openingHours"
                      defaultValue={contentText(contact.openingHours)}
                    />
                  </div>
                </div>

                {/* WhatsApp + Optional Office Map Directions */}
                <div className="mt-5 flex flex-wrap gap-2.5 border-t border-[var(--lux-border)] pt-4">
                  {(whatsappUrl || isEditorPreview) && (
                    <a
                      href={whatsappUrl || '#'}
                      target={whatsappUrl ? '_blank' : undefined}
                      rel={whatsappUrl ? 'noopener noreferrer' : undefined}
                      className="lux-btn-sunset !min-h-[40px] !px-4 !text-[11px]"
                      data-preview-field-path="contact.whatsapp"
                    >
                      <span data-preview-field-path="contact.directMessageText">
                        {directMessageText}
                      </span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}

                  {(directionsUrl || isEditorPreview) && (
                    <a
                      href={directionsUrl || '#'}
                      data-preview-field-path="contact.directionsUrl"
                      target={directionsUrl ? '_blank' : undefined}
                      rel={directionsUrl ? 'noopener noreferrer' : undefined}
                      className="lux-btn-outline !min-h-[40px] !px-4 !text-[11px]"
                    >
                      <span data-preview-field-path="contact.directionsLabel">{directionsLabel}</span>
                    </a>
                  )}
                </div>

                {/* Shared Social Channels */}
                {socialLinks.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--lux-border)] pt-4">
                    <span data-preview-static="contact-social-label" className="mr-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]">
                      Follow:
                    </span>
                    {socialLinks.map(({ key, url }) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-preview-static={`contact-social-${key}`}
                        className="rounded border border-[var(--lux-border-strong)] px-2.5 py-1 text-[11px] font-semibold capitalize text-[var(--lux-text)] no-underline transition hover:border-[var(--brand-accent,#FF783D)] hover:text-[var(--brand-accent,#FF783D)]"
                      >
                        {key}
                      </a>
                    ))}
                  </div>
                )}
              </EditableBox>

              {/* Dedicated Interactive Trip Planner Callout */}
              <div className="rounded-[6px] border border-[#154C42]/30 bg-[#154C42] p-6 text-[#FAF8F3]">
                <EditableText
                  as="h3"
                  color="#FAF8F3"
                  className="font-display m-0 mb-1.5 text-lg font-bold text-[#FAF8F3]"
                  data-preview-field-path="contact.plannerCtaHeading"
                  defaultValue={contentText(contact.plannerCtaHeading) || 'Planning a Multi-Stop Holiday?'}
                />
                <EditableText
                  as="p"
                  color="rgba(250, 248, 243, 0.82)"
                  className="m-0 mb-4 text-xs leading-relaxed text-[#FAF8F3]/82"
                  data-preview-field-path="contact.plannerCtaBody"
                  defaultValue={contentText(contact.plannerCtaBody)}
                />
                <button
                  type="button"
                  onClick={() => router.push(plannerTarget)}
                  className="lux-btn-sunset !min-h-[40px] !text-[11px]"
                >
                  <span data-preview-field-path="contact.plannerCtaLabel">
                    {contentText(contact.plannerCtaLabel) || 'Open Trip Planner'}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              {/* Enquiry Guidance + Privacy & Terms Anchor (linked from Footer Policy & Terms) */}
              <div
                id="enquiry-info"
                className="space-y-4 rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-5"
              >
                <div>
                  <EditableText
                    as="h3"
                    className="font-display m-0 mb-1.5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--lux-text)]"
                    data-preview-field-path="contact.enquiryGuidanceHeading"
                    defaultValue={contentText(contact.enquiryGuidanceHeading) || 'How Inquiries Work'}
                  />
                  <EditableText
                    as="p"
                    className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]"
                    data-preview-field-path="contact.enquiryGuidance"
                    defaultValue={contentText(contact.enquiryGuidance)}
                  />
                </div>
                <div className="border-t border-[var(--lux-border)] pt-3.5">
                  <EditableText
                    as="h3"
                    className="font-display m-0 mb-1.5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--lux-text)]"
                    data-preview-field-path="contact.privacyTermsHeading"
                    defaultValue={contentText(contact.privacyTermsHeading) || 'Enquiry Privacy & Terms'}
                  />
                  <EditableText
                    as="p"
                    className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]"
                    data-preview-field-path="contact.privacyTermsBody"
                    defaultValue={contentText(contact.privacyTermsBody)}
                  />
                </div>
              </div>
            </div>

            {/* Right 7 Columns: Concierge Inquiry Form */}
            <div className="lg:col-span-7">
              <EditableBox
                stylePath="contact.formCard"
                className="rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-sm)] sm:p-8"
                balance
                radius="sm"
              >
                <form
                  className="space-y-4"
                  onSubmit={handlePrepareInquiry}
                  data-fivora-contact-disabled
                  noValidate
                >
                  <div>
                    <EditableText
                      as="h2"
                      className="font-display m-0 text-2xl font-bold text-[var(--lux-text)]"
                      data-preview-field-path="contact.formTitle"
                      defaultValue={contentText(contact.formTitle) || 'Send a Travel Inquiry'}
                    />
                    <p data-preview-static="contact-required-hint" className="mt-1 m-0 text-xs text-[var(--lux-text-muted)]">
                      Fields marked with <strong className="text-[var(--brand-accent,#FF783D)]">*</strong> are required to prepare your WhatsApp or email inquiry.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-[var(--lux-text-muted)]">
                        <EditableText
                          as="span"
                          fieldPath="contact.nameLabel"
                          defaultValue={contentText(contact.nameLabel) || 'Full Name'}
                          placeholder="Full Name"
                        />
                        <span aria-hidden="true" className="text-[var(--brand-accent,#FF783D)]">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        aria-invalid={Boolean(errors.name)}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        data-preview-static="contact-name-input"
                        placeholder="Your full name"
                        className="lux-input"
                      />
                      {errors.name && (
                        <span role="alert" data-preview-static="contact-name-err" className="mt-1 block text-[11px] text-red-600 dark:text-red-400">
                          {errors.name}
                        </span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-[var(--lux-text-muted)]">
                        <EditableText
                          as="span"
                          fieldPath="contact.emailLabel"
                          defaultValue={contentText(contact.emailLabel) || 'Email Address'}
                          placeholder="Email Address"
                        />
                        <span aria-hidden="true" className="text-[var(--brand-accent,#FF783D)]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        aria-invalid={Boolean(errors.email)}
                        value={senderEmail}
                        onChange={(e) => {
                          setSenderEmail(e.target.value);
                          setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        data-preview-static="contact-email-input"
                        placeholder="you@example.com"
                        className="lux-input"
                      />
                      {errors.email && (
                        <span role="alert" data-preview-static="contact-email-err" className="mt-1 block text-[11px] text-red-600 dark:text-red-400">
                          {errors.email}
                        </span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="mb-1.5 block text-xs font-semibold text-[var(--lux-text-muted)]">
                        <EditableText
                          as="span"
                          fieldPath="contact.phoneLabel"
                          defaultValue={contentText(contact.phoneLabel) || 'Phone or WhatsApp Number'}
                          placeholder="Phone or WhatsApp Number"
                        />
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        data-preview-static="contact-phone-input"
                        placeholder="+94 77 ... (optional)"
                        className="lux-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-type" data-preview-static="contact-type-lbl" className="mb-1.5 block text-xs font-semibold text-[var(--lux-text-muted)]">
                        Inquiry Type
                      </label>
                      <select
                        id="contact-type"
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value)}
                        data-preview-static="contact-type-select"
                        className="lux-select"
                      >
                        {INQUIRY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" data-preview-static="contact-subject-lbl" className="mb-1.5 block text-xs font-semibold text-[var(--lux-text-muted)]">
                      Subject (Optional)
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      data-preview-static="contact-subject-input"
                      placeholder="e.g. Avurudu Family Holiday to Ella, Airport Transfer Inquiry..."
                      className="lux-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-[var(--lux-text-muted)]">
                      <EditableText
                        as="span"
                        fieldPath="contact.messageLabel"
                        defaultValue={contentText(contact.messageLabel) || 'Your Travel Ideas & Questions'}
                        placeholder="Your Travel Ideas & Questions"
                      />
                      <span aria-hidden="true" className="text-[var(--brand-accent,#FF783D)]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      aria-invalid={Boolean(errors.message)}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        setErrors((prev) => ({ ...prev, message: undefined }));
                      }}
                      data-preview-static="contact-message-input"
                      placeholder="Share preferred travel dates, duration, destinations, pickup point, and party size..."
                      className="lux-textarea"
                    />
                    {errors.message && (
                      <span role="alert" data-preview-static="contact-message-err" className="mt-1 block text-[11px] text-red-600 dark:text-red-400">
                        {errors.message}
                      </span>
                    )}
                  </div>

                  <div className="pt-1">
                    <button type="submit" className="lux-btn-tropical">
                      <span data-preview-field-path="contact.submitLabel">
                        {contentText(contact.submitLabel) || 'Prepare Inquiry Brief'}
                      </span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>

                  {/* Transparent Handoff Box — opens WhatsApp or Email App directly */}
                  {preparedBrief && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="space-y-3 rounded-[6px] border border-[#154C42]/35 bg-[var(--lux-surface-alt)] p-5"
                    >
                      <p data-preview-static="contact-brief-title" className="font-display m-0 text-xs font-bold uppercase tracking-[0.14em] text-[var(--lux-tropical)]">
                        Your Inquiry Brief Is Ready to Send
                      </p>
                      <p data-preview-static="contact-brief-explanation" className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]">
                        Nothing has been submitted yet. Choose WhatsApp or Email below to open your messaging app with this prefilled inquiry addressed directly to {brandName}.
                      </p>
                      <pre
                        data-preview-static="contact-brief-preview"
                        className="m-0 max-h-48 overflow-auto whitespace-pre-wrap rounded border border-[var(--lux-border)] bg-[var(--lux-surface)] p-3 font-sans text-xs text-[var(--lux-text)]"
                      >
                        {preparedBrief.text}
                      </pre>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {preparedBrief.whatsapp && (
                          <a
                            href={preparedBrief.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-preview-static="contact-fallback-whatsapp"
                            className="lux-btn-sunset !min-h-[40px] !px-4 !text-[11px]"
                          >
                            Open in WhatsApp ↗
                          </a>
                        )}
                        {preparedBrief.mailto && (
                          <a
                            href={preparedBrief.mailto}
                            data-preview-static="contact-fallback-mailto"
                            className="lux-btn-tropical !min-h-[40px] !px-4 !text-[11px]"
                          >
                            Open in Email App ↗
                          </a>
                        )}
                        <button
                          type="button"
                          data-preview-static="contact-copy-brief-btn"
                          onClick={handleCopyBrief}
                          className="lux-btn-outline !min-h-[40px] !px-4 !text-[11px]"
                        >
                          Copy Message
                        </button>
                      </div>
                      {copyStatus && (
                        <p data-preview-static="contact-copy-status" className="m-0 text-xs font-semibold text-[var(--lux-tropical)]">
                          {copyStatus}
                        </p>
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

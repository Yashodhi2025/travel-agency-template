'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import {
  buildMailtoEnquiryUrl,
  buildWhatsAppEnquiryUrl,
  readTripEnquiryDraft,
  type TripEnquiryDraft,
} from '@/lib/travelHelpers';
import { Reveal } from '../Reveal';

const TRIP_PATHS = [
  'Domestic',
  'Inbound',
  'Outbound',
  'Customized Itinerary',
  'Family & Group',
] as const;

interface PlanYourTripSectionProps {
  activeDraft: TripEnquiryDraft | null;
}

export function PlanYourTripSection({ activeDraft }: PlanYourTripSectionProps) {
  const siteData = useSiteData();
  const content = contentObject(siteData?.content);
  const home = contentObject(content.home);
  const common = contentObject(content.common);
  const contact = contentObject(content.contact);
  const shop = contentObject(siteData?.shop);
  const shopContact = contentObject(shop.contact);

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyEmail =
    contentText(shopContact.email) || contentText(shop.businessEmail) || contentText(contact.email);
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);

  const [tripPath, setTripPath] = useState<string>('Inbound');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travellers, setTravellers] = useState('2 Adults');
  const [budgetTier, setBudgetTier] = useState('Comfort Standard (LKR 150,000 – 350,000)');
  const [customerName, setCustomerName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [preparedBrief, setPreparedBrief] = useState<{
    whatsapp: string | null;
    mailto: string | null;
  } | null>(null);

  useEffect(() => {
    const draft = activeDraft ?? readTripEnquiryDraft();
    if (!draft) return;
    if (draft.travelType) setTripPath(draft.travelType);
    if (draft.destination) setDestination(draft.destination);
    if (draft.travelDate) setTravelDate(draft.travelDate);
    if (draft.packageName || draft.offerName || draft.accommodation) {
      const refText = draft.packageName || draft.offerName || draft.accommodation || '';
      setNotes((prev) => (prev.includes(refText) ? prev : `Interested in: ${refText}`));
    }
  }, [activeDraft]);

  const buildBriefText = () =>
    [
      `Trip Inquiry — ${brandName}`,
      `Journey Type: ${tripPath}`,
      destination.trim() ? `Destination(s): ${destination.trim()}` : null,
      travelDate ? `Preferred Date: ${travelDate}` : null,
      `Travellers: ${travellers}`,
      `Budget Guide: ${budgetTier}`,
      `Name: ${customerName.trim()}`,
      `Phone / WhatsApp: ${telephone.trim()}`,
      `Email: ${email.trim()}`,
      notes.trim() ? `Notes: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

  const validateFields = (): boolean => {
    setFormError('');
    if (!customerName.trim()) {
      setFormError('Please enter your name.');
      return false;
    }
    if (!telephone.trim() || telephone.replace(/[^\d]/g, '').length < 7) {
      setFormError('Please enter a valid telephone or WhatsApp number.');
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handlePrepare = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateFields()) return;
    const message = buildBriefText();
    setPreparedBrief({
      whatsapp: buildWhatsAppEnquiryUrl(agencyWhatsApp, message),
      mailto: buildMailtoEnquiryUrl(agencyEmail, `${tripPath} Inquiry — ${customerName.trim()}`, message),
    });
  };

  const handleDirectWhatsApp = () => {
    if (!validateFields()) return;
    const url = buildWhatsAppEnquiryUrl(agencyWhatsApp, buildBriefText());
    if (!url) {
      setFormError('WhatsApp number is not configured yet in Fivora Contact settings.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="tailor-made"
      data-design-section="home-tailor-made"
      className="lux-section bg-[#101820] text-[#FAF8F3]"
    >
      <div className="lux-container">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Left Editorial Pitch + Visual Anchor */}
          <div className="lg:col-span-5">
            <Reveal variant="fade-up">
              <div className="mb-2.5">
                <EditableText
                  as="span"
                  color="#C5A46D"
                  className="lux-eyebrow !text-[#C5A46D]"
                  data-preview-field-path="home.tailorMadeEyebrow"
                  defaultValue={contentText(home.tailorMadeEyebrow) || 'PLAN YOUR TRIP'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                color="#FAF8F3"
                className="font-display m-0 mb-3.5 text-2xl font-bold leading-[1.15] tracking-[-0.025em] text-[#FAF8F3] sm:text-3xl lg:text-[2.25rem]"
                data-preview-field-path="home.tailorMadeHeading"
                defaultValue={contentText(home.tailorMadeHeading) || 'Tell Us How You Want to Travel'}
              />
              <EditableText
                as="p"
                color="#A3B0BA"
                className="m-0 mb-5 text-sm leading-relaxed text-[#A3B0BA] sm:text-[15px]"
                data-preview-field-path="home.tailorMadeBody"
                defaultValue={contentText(home.tailorMadeBody)}
              />

              <div className="lux-image-zoom mb-4 aspect-[16/9] w-full overflow-hidden rounded-[6px] border border-white/10">
                <EditableImage
                  src={contentText(home.tailorMadeImageUrl) || '/images/ayubowan-hospitality.webp'}
                  alt={contentText(home.tailorMadeHeading) || 'Plan your Sri Lanka trip'}
                  data-preview-field-path="home.tailorMadeImageUrl"
                  fit="cover"
                  className="h-full w-full object-cover"
                />
              </div>

              <EditableText
                as="p"
                color="#9AA7B2"
                className="m-0 border-l-2 border-[#C5A46D] pl-3.5 text-xs leading-relaxed text-[#9AA7B2]"
                data-preview-field-path="home.tailorMadeNote"
                defaultValue={
                  contentText(home.tailorMadeNote) ||
                  'Submitting prepares a pre-filled WhatsApp or email inquiry directly to the agency.'
                }
              />
            </Reveal>
          </div>

          {/* Right Compact Conversion-Focused Inquiry Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handlePrepare}
              noValidate
              className="rounded-[8px] border border-white/10 bg-[var(--lux-surface)] p-5 text-[var(--lux-text)] shadow-[var(--lux-shadow-md)] sm:p-7"
            >
              {/* Quick Journey Path Pills */}
              <div className="mb-5">
                <span
                  data-preview-static="plan-travel-type-legend"
                  className="font-display mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--lux-text-muted)]"
                >
                  Select Journey Type
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TRIP_PATHS.map((pathOption) => {
                    const selected = tripPath === pathOption;
                    return (
                      <button
                        key={pathOption}
                        type="button"
                        data-preview-static="plan-travel-type-btn"
                        aria-pressed={selected}
                        onClick={() => setTripPath(pathOption)}
                        className={`min-h-[36px] rounded border px-3 py-1 text-xs font-semibold transition ${
                          selected
                            ? 'border-[var(--brand-secondary,#154C42)] bg-[var(--brand-secondary,#154C42)] text-[#FAF8F3] dark:border-[var(--brand-accent,#FF783D)] dark:bg-[var(--brand-accent,#FF783D)] dark:text-white'
                            : 'border-[var(--lux-border-strong)] bg-transparent text-[var(--lux-text)] hover:border-[var(--brand-accent,#FF783D)]'
                        }`}
                      >
                        {pathOption}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="plan-destination"
                    data-preview-static="plan-destination-label"
                    className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]"
                  >
                    Destination(s)
                  </label>
                  <input
                    id="plan-destination"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    data-preview-static="plan-destination-input"
                    placeholder="Ella, Sigiriya, Galle, Maldives..."
                    className="lux-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="plan-date"
                    data-preview-static="plan-date-label"
                    className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]"
                  >
                    Preferred Travel Date
                  </label>
                  <input
                    id="plan-date"
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    data-preview-static="plan-date-input"
                    className="lux-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="plan-travellers"
                    data-preview-static="plan-travellers-label"
                    className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]"
                  >
                    Travellers
                  </label>
                  <select
                    id="plan-travellers"
                    value={travellers}
                    onChange={(e) => setTravellers(e.target.value)}
                    data-preview-static="plan-travellers-select"
                    className="lux-select"
                  >
                    <option value="2 Adults (Couple)">2 Adults (Couple)</option>
                    <option value="Family (2 Adults + Children)">Family (2 Adults + Children)</option>
                    <option value="Small Group (4 – 8 Guests)">Small Group (4 – 8 Guests)</option>
                    <option value="Large / Corporate Group (9+)">Large / Corporate Group (9+)</option>
                    <option value="Solo Traveller">Solo Traveller</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="plan-budget"
                    data-preview-static="plan-budget-label"
                    className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]"
                  >
                    Budget Tier
                  </label>
                  <select
                    id="plan-budget"
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(e.target.value)}
                    data-preview-static="plan-budget-select"
                    className="lux-select"
                  >
                    <option value="Value / Budget (Under LKR 150,000)">Value / Budget (Under LKR 150,000)</option>
                    <option value="Comfort Standard (LKR 150,000 – 350,000)">Comfort Standard (LKR 150,000 – 350,000)</option>
                    <option value="Boutique & Premium (LKR 350,000 – 750,000)">Boutique &amp; Premium (LKR 350,000 – 750,000)</option>
                    <option value="Luxury Private Villas (LKR 750,000+)">Luxury Private Villas (LKR 750,000+)</option>
                    <option value="Flexible — Please Advise">Flexible — Please Advise</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="plan-name"
                    data-preview-static="plan-name-label"
                    className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]"
                  >
                    Full Name *
                  </label>
                  <input
                    id="plan-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    data-preview-static="plan-name-input"
                    placeholder="Your name"
                    className="lux-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="plan-phone"
                    data-preview-static="plan-phone-label"
                    className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]"
                  >
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="plan-phone"
                    type="tel"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    data-preview-static="plan-phone-input"
                    placeholder="+94 77 ... or intl"
                    className="lux-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="plan-email"
                    data-preview-static="plan-email-label"
                    className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]"
                  >
                    Email Address *
                  </label>
                  <input
                    id="plan-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-preview-static="plan-email-input"
                    placeholder="you@example.com"
                    className="lux-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="plan-notes"
                    data-preview-static="plan-notes-label"
                    className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]"
                  >
                    Pickup / Special Notes
                  </label>
                  <input
                    id="plan-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    data-preview-static="plan-notes-input"
                    placeholder="CMB Airport, Colombo pickup, or tour name..."
                    className="lux-input"
                  />
                </div>
              </div>

              {formError && (
                <p
                  role="alert"
                  data-preview-static="plan-form-error"
                  className="mt-3.5 rounded border border-red-400/50 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300"
                >
                  {formError}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="button" onClick={handleDirectWhatsApp} className="lux-btn-sunset">
                  <span data-preview-field-path="home.tailorMadeWhatsappLabel">
                    {contentText(home.tailorMadeWhatsappLabel) || 'Send Directly on WhatsApp'}
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>

                <button type="submit" className="lux-btn-outline">
                  <span data-preview-field-path="home.tailorMadeCtaLabel">
                    {contentText(home.tailorMadeCtaLabel) || 'Prepare Inquiry Brief'}
                  </span>
                </button>
              </div>

              {preparedBrief && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-4 rounded border border-[var(--lux-border-strong)] bg-[var(--lux-surface-alt)] p-4"
                >
                  <p
                    data-preview-static="plan-brief-heading"
                    className="font-display m-0 mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--lux-tropical)]"
                  >
                    Inquiry Brief Ready — Send Directly
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {preparedBrief.whatsapp && (
                      <a
                        href={preparedBrief.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-preview-static="plan-brief-whatsapp-link"
                        className="lux-btn-sunset !min-h-[38px] !text-[11px]"
                      >
                        Open in WhatsApp ↗
                      </a>
                    )}
                    {preparedBrief.mailto && (
                      <a
                        href={preparedBrief.mailto}
                        data-preview-static="plan-brief-email-link"
                        className="lux-btn-tropical !min-h-[38px] !text-[11px]"
                      >
                        Open in Email App ↗
                      </a>
                    )}
                    {!preparedBrief.whatsapp && !preparedBrief.mailto && (
                      <span data-preview-static="plan-brief-no-channel" className="text-xs text-[var(--lux-text-muted)]">
                        Configure an agency email or WhatsApp number in Fivora Contact settings.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

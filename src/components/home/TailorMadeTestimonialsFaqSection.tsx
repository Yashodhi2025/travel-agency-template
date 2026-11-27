'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import {
  buildMailtoEnquiryUrl,
  buildWhatsAppEnquiryUrl,
  readTripEnquiryDraft,
  type TripEnquiryDraft,
} from '@/lib/travelHelpers';
import { Reveal } from '../Reveal';

interface TailorMadeTestimonialsFaqSectionProps {
  activeDraft: TripEnquiryDraft | null;
}

export function TailorMadeTestimonialsFaqSection({
  activeDraft,
}: TailorMadeTestimonialsFaqSectionProps) {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
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

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [duration, setDuration] = useState('10 Days');
  const [adults, setAdults] = useState('2');
  const [childrenCount, setChildrenCount] = useState('0');
  const [preferredDestinations, setPreferredDestinations] = useState('');
  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState('Mid-Range to Boutique (USD 2,000 – 4,000)');
  const [accommodationStyle, setAccommodationStyle] = useState('Boutique Heritage & Luxury Villas');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [preparedSummary, setPreparedSummary] = useState<{
    mailto: string | null;
    whatsapp: string | null;
    text: string;
  } | null>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const draft = activeDraft ?? readTripEnquiryDraft();
    if (!draft) return;
    if (draft.destination) setPreferredDestinations(draft.destination);
    if (draft.travelStyle) setInterests(draft.travelStyle);
    if (draft.duration) {
      if (draft.duration === 'short') setDuration('5 – 7 Days');
      else if (draft.duration === 'medium') setDuration('8 – 10 Days');
      else if (draft.duration === 'long') setDuration('11 – 14 Days');
      else setDuration(draft.duration);
    }
    if (draft.travelDate) setArrivalDate(draft.travelDate);
    if (draft.packageName) {
      setNotes((prev) =>
        prev.includes(draft.packageName!)
          ? prev
          : `Interested in customising: ${draft.packageName}${prev ? `\n${prev}` : ''}`,
      );
    }
  }, [activeDraft]);

  const handlePrepareEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your name so our travel specialist can address you.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const lines = [
      `Tailor-Made Sri Lanka Enquiry — ${brandName}`,
      `Name: ${fullName.trim()}`,
      `Email: ${email.trim()}`,
      phone.trim() ? `Phone / WhatsApp: ${phone.trim()}` : null,
      country.trim() ? `Country: ${country.trim()}` : null,
      arrivalDate ? `Preferred Arrival: ${arrivalDate}` : null,
      `Duration: ${duration}`,
      `Party: ${adults} Adults, ${childrenCount} Children`,
      preferredDestinations.trim() ? `Preferred Destinations: ${preferredDestinations.trim()}` : null,
      interests.trim() ? `Travel Interests: ${interests.trim()}` : null,
      `Estimated Budget: ${budget}`,
      `Accommodation Preference: ${accommodationStyle}`,
      notes.trim() ? `Additional Notes: ${notes.trim()}` : null,
    ].filter(Boolean);

    const text = lines.join('\n');
    const mailto = buildMailtoEnquiryUrl(
      agencyEmail,
      `Tailor-Made Journey Enquiry — ${fullName.trim()}`,
      text,
    );
    const whatsapp = buildWhatsAppEnquiryUrl(agencyWhatsApp, text);

    setPreparedSummary({ mailto, whatsapp, text });
  };

  const testimonials = contentList(home.testimonials).map((raw) => {
    const item = contentObject(raw);
    return {
      name: contentText(item.name),
      country: contentText(item.country),
      journey: contentText(item.journey),
      quote: contentText(item.quote),
      rating: typeof item.rating === 'number' && Number.isFinite(item.rating) ? item.rating : 5,
      imageUrl: contentText(item.imageUrl) || '/images/hero-tea.webp',
    };
  });

  const faqs = contentList(home.faqs).map((raw) => {
    const item = contentObject(raw);
    return {
      question: contentText(item.question),
      answer: contentText(item.answer),
    };
  });

  return (
    <>
      {/* Tailor-Made Holiday Enquiry Section */}
      <section
        id="tailor-made"
        data-design-section="home-tailor-made"
        className="relative isolate overflow-hidden bg-[#0D241E] py-20 text-[#F7F3EA] sm:py-24"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={contentText(home.tailorMadeImageUrl) || '/images/hero-coast.webp'}
            alt={contentText(home.tailorMadeHeading) || 'Tailor-made Sri Lanka travel'}
            data-preview-field-path="home.tailorMadeImageUrl"
            fit="cover"
            className="h-full w-full object-cover opacity-30"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#0B1F1A]/95 via-[#102D25]/88 to-[#091814]/95"
        />

        <div className="lux-container relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            {/* Editorial Pitch */}
            <div className="lg:col-span-5">
              <Reveal>
                <div className="mb-4">
                  <EditableText
                    as="span"
                    color="#C6A46A"
                    className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A46A]"
                    data-preview-field-path="home.tailorMadeEyebrow"
                    defaultValue={contentText(home.tailorMadeEyebrow) || 'BESPOKE HOLIDAY ENQUIRY'}
                  />
                </div>
                <EditableText
                  as="h2"
                  variant="h2"
                  color="#F7F3EA"
                  className="font-editorial m-0 mb-5 text-4xl font-medium leading-[1.1] text-[#F7F3EA] sm:text-5xl"
                  data-preview-field-path="home.tailorMadeHeading"
                  defaultValue={contentText(home.tailorMadeHeading) || 'Your Journey. Your Story.'}
                />
                <EditableText
                  as="p"
                  color="rgba(247, 243, 234, 0.82)"
                  className="mb-8 text-base leading-relaxed text-[#F7F3EA]/82"
                  data-preview-field-path="home.tailorMadeBody"
                  defaultValue={contentText(home.tailorMadeBody)}
                />

                <div className="space-y-4 border-t border-[#C6A46A]/25 pt-6 text-sm text-[#F7F3EA]/80">
                  <p data-preview-static="tailor-made-honest-note" className="m-0 leading-relaxed">
                    Completing this form prepares a structured travel brief that you can dispatch directly via your email client or WhatsApp — with no automated billing or third-party data harvesting.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Accessible Tailor-Made Form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handlePrepareEnquiry}
                noValidate
                className="border border-[#C6A46A]/30 bg-[var(--lux-surface)] p-6 text-[var(--lux-text)] shadow-2xl sm:p-8"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="tm-name"
                      data-preview-static="tm-name-label"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    >
                      Full Name *
                    </label>
                    <input
                      id="tm-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      data-preview-static="tm-name-input"
                      placeholder="Your full name"
                      className="lux-input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tm-email"
                      data-preview-static="tm-email-label"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    >
                      Email Address *
                    </label>
                    <input
                      id="tm-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-preview-static="tm-email-input"
                      placeholder="you@example.com"
                      className="lux-input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tm-phone"
                      data-preview-static="tm-phone-label"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    >
                      Phone / WhatsApp
                    </label>
                    <input
                      id="tm-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      data-preview-static="tm-phone-input"
                      placeholder="+44 / +1 / +94..."
                      className="lux-input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tm-country"
                      data-preview-static="tm-country-label"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    >
                      Country of Residence
                    </label>
                    <input
                      id="tm-country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      data-preview-static="tm-country-input"
                      placeholder="e.g. United Kingdom"
                      className="lux-input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tm-arrival"
                      data-preview-static="tm-arrival-label"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    >
                      Preferred Arrival
                    </label>
                    <input
                      id="tm-arrival"
                      type="month"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      data-preview-static="tm-arrival-input"
                      className="lux-input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tm-duration"
                      data-preview-static="tm-duration-label"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    >
                      Trip Duration
                    </label>
                    <input
                      id="tm-duration"
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      data-preview-static="tm-duration-input"
                      placeholder="e.g. 10 Days"
                      className="lux-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="tm-adults"
                        data-preview-static="tm-adults-label"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                      >
                        Adults
                      </label>
                      <input
                        id="tm-adults"
                        type="number"
                        min={1}
                        max={24}
                        value={adults}
                        onChange={(e) => setAdults(e.target.value)}
                        data-preview-static="tm-adults-input"
                        className="lux-input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tm-children"
                        data-preview-static="tm-children-label"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                      >
                        Children
                      </label>
                      <input
                        id="tm-children"
                        type="number"
                        min={0}
                        max={16}
                        value={childrenCount}
                        onChange={(e) => setChildrenCount(e.target.value)}
                        data-preview-static="tm-children-input"
                        className="lux-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="tm-budget"
                      data-preview-static="tm-budget-label"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    >
                      Estimated Budget
                    </label>
                    <select
                      id="tm-budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      data-preview-static="tm-budget-select"
                      className="lux-select"
                    >
                      <option value="Comfort Boutique (USD 1,500 – 2,500)">Comfort Boutique (USD 1,500 – 2,500)</option>
                      <option value="Mid-Range to Boutique (USD 2,000 – 4,000)">Boutique Luxury (USD 2,500 – 4,500)</option>
                      <option value="Ultra-Luxury Private Villas (USD 4,500+)">Ultra-Luxury Villas (USD 4,500+)</option>
                      <option value="Flexible — Advise Me">Flexible — Please Advise</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="tm-destinations"
                      data-preview-static="tm-destinations-label"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    >
                      Preferred Destinations
                    </label>
                    <input
                      id="tm-destinations"
                      type="text"
                      value={preferredDestinations}
                      onChange={(e) => setPreferredDestinations(e.target.value)}
                      data-preview-static="tm-destinations-input"
                      placeholder="Sigiriya, Ella, Yala, Galle..."
                      className="lux-input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tm-style"
                      data-preview-static="tm-accom-label"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    >
                      Accommodation Style
                    </label>
                    <select
                      id="tm-style"
                      value={accommodationStyle}
                      onChange={(e) => setAccommodationStyle(e.target.value)}
                      data-preview-static="tm-accom-select"
                      className="lux-select"
                    >
                      <option value="Boutique Heritage & Luxury Villas">Boutique Heritage &amp; Villas</option>
                      <option value="Tea Bungalows & Eco Lodges">Tea Bungalows &amp; Eco Lodges</option>
                      <option value="5-Star Beach & Luxury Resorts">Luxury Resorts &amp; Retreats</option>
                      <option value="Curated Mix">Curated Mix Across Regions</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="tm-interests"
                      data-preview-static="tm-interests-label"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    >
                      Travel Interests &amp; Pace
                    </label>
                    <input
                      id="tm-interests"
                      type="text"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      data-preview-static="tm-interests-input"
                      placeholder="Wildlife safaris, scenic rail, Ayurveda, honeymoon dining..."
                      className="lux-input"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="tm-notes"
                      data-preview-static="tm-notes-label"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--lux-text-muted)]"
                    >
                      Additional Requirements
                    </label>
                    <textarea
                      id="tm-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      data-preview-static="tm-notes-input"
                      placeholder="Tell us about celebrations, dietary preferences, or desired pace..."
                      className="lux-textarea"
                    />
                  </div>
                </div>

                {formError && (
                  <p
                    role="alert"
                    data-preview-static="tm-form-error"
                    className="mt-4 border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
                  >
                    {formError}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button type="submit" className="lux-btn-primary">
                    <span data-preview-field-path="home.tailorMadeCtaLabel">
                      {contentText(home.tailorMadeCtaLabel) || 'Prepare My Trip Enquiry'}
                    </span>
                  </button>
                </div>

                {preparedSummary && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mt-6 border border-[#C6A46A]/50 bg-[var(--lux-surface-alt)] p-5"
                  >
                    <p
                      data-preview-static="tm-prepared-heading"
                      className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
                    >
                      Enquiry Brief Ready — Choose How to Send
                    </p>
                    <p
                      data-preview-static="tm-prepared-explanation"
                      className="mb-4 text-xs text-[var(--lux-text-muted)]"
                    >
                      This static storefront does not silently submit your personal details. Use one of the direct channels below to dispatch your prefilled brief to the agency:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {preparedSummary.whatsapp && (
                        <a
                          href={preparedSummary.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-preview-static="tm-send-whatsapp"
                          className="lux-btn-primary !min-h-[40px] !text-xs"
                        >
                          Send via WhatsApp ↗
                        </a>
                      )}
                      {preparedSummary.mailto && (
                        <a
                          href={preparedSummary.mailto}
                          data-preview-static="tm-send-email"
                          className="lux-btn-gold !min-h-[40px] !text-xs"
                        >
                          Open in Email App ↗
                        </a>
                      )}
                      {!preparedSummary.whatsapp && !preparedSummary.mailto && (
                        <span data-preview-static="tm-no-channel" className="text-xs text-[var(--lux-text-muted)]">
                          Configure an agency email or WhatsApp number in Fivora to enable direct dispatch.
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

      {/* Illustrative Testimonials */}
      <section data-design-section="home-testimonials" className="lux-section lux-section-alt border-b border-[var(--lux-border)]">
        <div className="lux-container">
          <Reveal>
            <div className="mb-12 max-w-2xl">
              <div className="mb-3">
                <EditableText
                  as="span"
                  className="lux-eyebrow"
                  data-preview-field-path="home.testimonialsEyebrow"
                  defaultValue={contentText(home.testimonialsEyebrow) || 'ILLUSTRATIVE TRAVELLER IMPRESSIONS'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                className="font-editorial m-0 text-3xl font-medium text-[var(--lux-text)] sm:text-4xl"
                data-preview-field-path="home.testimonialsHeading"
                defaultValue={contentText(home.testimonialsHeading) || 'Words From Inspired Journeys'}
              />
              <EditableText
                as="p"
                className="mt-3 text-sm leading-relaxed text-[var(--lux-text-muted)]"
                data-preview-field-path="home.testimonialsSummary"
                defaultValue={contentText(home.testimonialsSummary)}
              />
            </div>
          </Reveal>

          <div
            data-preview-list-path="home.testimonials"
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {testimonials.length === 0 && (
              <p
                data-preview-static="testimonials-empty-state"
                className="col-span-full border border-dashed border-[var(--lux-border-strong)] p-8 text-center text-sm text-[var(--lux-text-muted)]"
              >
                No guest testimonials configured yet. Add verified client notes in Fivora.
              </p>
            )}

            {testimonials.map((t, index) => (
              <article
                key={index}
                data-preview-item-path={`home.testimonials[${index}]`}
                className="lux-card flex flex-col justify-between p-6"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span
                      data-preview-field-path={`home.testimonials[${index}].journey`}
                      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
                      style={{ minHeight: '1.2em' }}
                    >
                      {t.journey}
                    </span>
                    <span className="text-xs font-semibold text-[#C6A46A]">
                      <span aria-hidden="true">★ </span>
                      <span data-preview-field-path={`home.testimonials[${index}].rating`}>
                        {t.rating}
                      </span>
                      <span data-preview-static="testimonial-rating-scale">/5</span>
                    </span>
                  </div>

                  <EditableText
                    as="blockquote"
                    className="font-editorial m-0 mb-6 text-lg leading-relaxed text-[var(--lux-text)]"
                    data-preview-field-path={`home.testimonials[${index}].quote`}
                    defaultValue={t.quote}
                  />
                </div>

                <div className="flex items-center gap-3.5 border-t border-[var(--lux-border)] pt-4">
                  <EditableImage
                    src={t.imageUrl}
                    alt={t.name}
                    data-preview-field-path={`home.testimonials[${index}].imageUrl`}
                    fit="cover"
                    className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <EditableText
                      as="p"
                      className="m-0 text-sm font-semibold text-[var(--lux-text)]"
                      data-preview-field-path={`home.testimonials[${index}].name`}
                      defaultValue={t.name}
                    />
                    <EditableText
                      as="p"
                      className="m-0 text-xs text-[var(--lux-text-muted)]"
                      data-preview-field-path={`home.testimonials[${index}].country`}
                      defaultValue={t.country}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Accessible FAQ Accordion */}
      <section data-design-section="home-faqs" className="lux-section">
        <div className="lux-container max-w-4xl">
          <Reveal>
            <div className="mb-10 text-center">
              <div className="mb-3 flex justify-center">
                <EditableText
                  as="span"
                  className="lux-eyebrow"
                  data-preview-field-path="home.faqEyebrow"
                  defaultValue={contentText(home.faqEyebrow) || 'PLANNING QUESTIONS'}
                />
              </div>
              <EditableText
                as="h2"
                variant="h2"
                className="font-editorial m-0 text-3xl font-medium text-[var(--lux-text)] sm:text-4xl"
                data-preview-field-path="home.faqHeading"
                defaultValue={contentText(home.faqHeading) || 'Frequently Asked Questions'}
              />
              <EditableText
                as="p"
                className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--lux-text-muted)]"
                data-preview-field-path="home.faqSummary"
                defaultValue={contentText(home.faqSummary)}
              />
            </div>
          </Reveal>

          <div
            data-preview-list-path="home.faqs"
            className="divide-y divide-[var(--lux-border)] border-y border-[var(--lux-border)]"
          >
            {faqs.length === 0 && (
              <p
                data-preview-static="faqs-empty-state"
                className="py-8 text-center text-sm text-[var(--lux-text-muted)]"
              >
                No FAQs added yet. Add planning questions in Fivora.
              </p>
            )}

            {faqs.map((faq, index) => {
              const isExpanded = isEditorPreview || openFaqIndex === index;
              const panelId = `faq-panel-${index}`;
              return (
                <div
                  key={index}
                  data-preview-item-path={`home.faqs[${index}]`}
                  className="py-5"
                >
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    onClick={() => setOpenFaqIndex((prev) => (prev === index ? null : index))}
                    className="flex w-full items-center justify-between gap-4 border-0 bg-transparent p-0 text-left"
                  >
                    <EditableText
                      as="span"
                      className="font-editorial text-lg font-medium text-[var(--lux-text)] sm:text-xl"
                      data-preview-field-path={`home.faqs[${index}].question`}
                      defaultValue={faq.question}
                    />
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[var(--lux-border-strong)] text-sm text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
                    >
                      {isExpanded ? '−' : '+'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div id={panelId} className="mt-3 pr-8">
                      <EditableText
                        as="p"
                        className="m-0 text-sm leading-relaxed text-[var(--lux-text-muted)] sm:text-base"
                        data-preview-field-path={`home.faqs[${index}].answer`}
                        defaultValue={faq.answer}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

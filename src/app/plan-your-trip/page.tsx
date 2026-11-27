'use client';

import { useEffect, useMemo, useState } from 'react';
import { EditableImage, EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import {
  buildMailtoEnquiryUrl,
  buildWhatsAppEnquiryUrl,
  clearTripEnquiryDraft,
  readTripEnquiryDraft,
  saveTripEnquiryDraft,
  splitDelimitedItems,
} from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';

const STEP_LABELS = [
  'Journey Type',
  'Destinations & Style',
  'Dates & Travellers',
  'Budget & Stay',
  'Experiences & Notes',
  'Review & Send',
] as const;

const DURATION_OPTIONS = [
  'Weekend (2–3 Days)',
  '4–5 Days',
  '6–8 Days',
  '9–12 Days',
  '13+ Days',
  'Flexible / Undecided',
] as const;

const BUDGET_TIERS = [
  { id: 'Budget-friendly', note: 'Smart value stays & practical routing' },
  { id: 'Comfortable', note: 'Well-rated 3–4★ hotels & private A/C vehicle' },
  { id: 'Premium', note: 'Boutique hotels, tea bungalows & curated dining' },
  { id: 'Luxury', note: 'Private pool villas, flagship lodges & bespoke care' },
  { id: 'Custom budget', note: 'Specify your own preferred range below' },
  { id: 'Not decided yet', note: 'Open to comparing a few options' },
] as const;

const ACCOMMODATION_PREFS = [
  'Guesthouse',
  'Boutique hotel',
  'Standard hotel',
  'Resort',
  'Luxury villa',
  'Eco lodge',
  'No preference',
] as const;

const TRANSPORT_PREFS = [
  'Private car',
  'Private van',
  'Group coach',
  'Train journey',
  'Self-arranged transport',
  'No preference',
] as const;

const SPECIAL_REQUIREMENT_CHIPS = [
  'Family-friendly activities',
  'Relaxed travel pace',
  'Adventure activities',
  'Dietary preferences',
  'Accessibility requirements',
  'Special occasions',
] as const;

const DEFAULT_JOURNEY_OPTIONS = [
  {
    key: 'Domestic',
    title: 'Domestic Sri Lanka Holiday',
    description: 'Weekend breaks, Poya long weekends, Avurudu family getaways, and local group trips.',
    badge: 'For Sri Lankan Residents',
  },
  {
    key: 'Inbound',
    title: 'Inbound Sri Lanka Journey',
    description: 'Private airport welcome at CMB with curated heritage, highland, wildlife, and coastal routes.',
    badge: 'Visiting Sri Lanka',
  },
  {
    key: 'Outbound',
    title: 'Outbound International Holiday',
    description: 'Curated overseas holidays from Colombo to Maldives, Thailand, Singapore, Dubai, and beyond.',
    badge: 'Travelling Overseas',
  },
  {
    key: 'Custom',
    title: 'Custom or Undecided Journey',
    description: 'Still exploring options? Share a few ideas and our travel desk will guide you.',
    badge: 'Flexible Guidance',
  },
];

function mapStayCategoryToAccommodation(raw?: string): string {
  if (!raw) return 'No preference';
  const lower = raw.toLowerCase();
  if (lower.includes('guesthouse') || lower.includes('budget')) return 'Guesthouse';
  if (lower.includes('boutique') || lower.includes('bungalow')) return 'Boutique hotel';
  if (lower.includes('villa')) return 'Luxury villa';
  if (lower.includes('eco') || lower.includes('wildlife')) return 'Eco lodge';
  if (lower.includes('resort') || lower.includes('beach')) return 'Resort';
  if (lower.includes('family') || lower.includes('hotel')) return 'Standard hotel';
  return 'No preference';
}

export default function PlanYourTripPage() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const page = contentObject(content.planTripPage);
  const home = contentObject(content.home);
  const common = contentObject(content.common);
  const contact = contentObject(content.contact);
  const shop = contentObject(siteData?.shop);
  const shopContact = contentObject(shop.contact);

  // Merchant-editable configuration
  const journeyOptions = useMemo(() => {
    const raw = contentList(page.journeyOptions);
    if (raw.length === 0) return DEFAULT_JOURNEY_OPTIONS;
    return raw.map((item, idx) => {
      const obj = contentObject(item);
      return {
        key: contentText(obj.key) || DEFAULT_JOURNEY_OPTIONS[idx]?.key || `Option-${idx + 1}`,
        title: contentText(obj.title) || DEFAULT_JOURNEY_OPTIONS[idx]?.title || 'Journey Option',
        description: contentText(obj.description),
        badge: contentText(obj.badge),
      };
    });
  }, [page.journeyOptions]);

  const destinations = useMemo(
    () =>
      contentList(home.destinations).map((raw, idx) => {
        const d = contentObject(raw);
        return {
          id: contentText(d.id) || `dest-${idx}`,
          name: contentText(d.name),
          region: contentText(d.region),
          imageUrl: contentText(d.imageUrl) || '/images/hero-sigiriya.webp',
        };
      }),
    [home.destinations],
  );

  const experiences = useMemo(
    () =>
      contentList(home.experiences).map((raw, idx) => {
        const e = contentObject(raw);
        return {
          id: contentText(e.id) || `exp-${idx}`,
          title: contentText(e.title),
          category: contentText(e.category),
          imageUrl: contentText(e.imageUrl) || '/images/hero-ella.webp',
        };
      }),
    [home.experiences],
  );

  const outboundList = useMemo(() => {
    const parsed = splitDelimitedItems(contentText(page.outboundDestinations));
    return parsed.length > 0
      ? parsed
      : ['Maldives', 'Thailand', 'Singapore', 'Dubai', 'Malaysia', 'Bali', 'Vietnam'];
  }, [page.outboundDestinations]);

  const travelStyles = useMemo(() => {
    const parsed = splitDelimitedItems(contentText(page.travelStyleOptions));
    return parsed.length > 0
      ? parsed
      : [
          'Family Holiday',
          'Romantic Escape',
          'Honeymoon',
          'Adventure',
          'Wildlife & Nature',
          'Culture & Heritage',
          'Beach Holiday',
          'Wellness',
          'Group Travel',
          'Corporate Travel',
          'Undecided',
        ];
  }, [page.travelStyleOptions]);

  const pickupSuggestions = useMemo(() => {
    const parsed = splitDelimitedItems(contentText(page.pickupCities));
    return parsed.length > 0
      ? parsed
      : ['Bandaranaike International Airport (CMB)', 'Colombo', 'Negombo', 'Kandy', 'Galle'];
  }, [page.pickupCities]);

  const supportedCurrencies = useMemo(() => {
    const parsed = splitDelimitedItems(contentText(page.supportedCurrencies));
    return parsed.length > 0 ? parsed : ['LKR', 'USD', 'EUR', 'GBP'];
  }, [page.supportedCurrencies]);

  // Interactive Customer Planner State (temporary; personal contact info is NEVER stored in sessionStorage)
  const [step, setStep] = useState<number>(1);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [prefillBanner, setPrefillBanner] = useState<string>('');
  const [stepError, setStepError] = useState<string>('');
  const [copiedNotice, setCopiedNotice] = useState<string>('');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Step 1
  const [journeyType, setJourneyType] = useState<string>('Domestic');
  // Step 2
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [customDestInput, setCustomDestInput] = useState<string>('');
  const [destinationUndecided, setDestinationUndecided] = useState<boolean>(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  // Step 3
  const [flexibleDates, setFlexibleDates] = useState<boolean>(true);
  const [departureDate, setDepartureDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('4–5 Days');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [childAges, setChildAges] = useState<string>('');
  const [pickupLocation, setPickupLocation] = useState<string>('');
  // Step 4
  const [budgetTier, setBudgetTier] = useState<string>('Comfortable');
  const [budgetScope, setBudgetScope] = useState<'Total trip budget' | 'Per person budget'>('Total trip budget');
  const [currency, setCurrency] = useState<string>('LKR');
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [accommodationPref, setAccommodationPref] = useState<string>('No preference');
  const [transportPref, setTransportPref] = useState<string>('No preference');
  // Step 5
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [dietaryNotes, setDietaryNotes] = useState<string>('');
  const [accessibilityNotes, setAccessibilityNotes] = useState<string>('');
  const [specialOccasion, setSpecialOccasion] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  // Step 6 (Optional contact info — kept in memory ONLY)
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');

  // Prefill from TripEnquiryDraft on mount
  useEffect(() => {
    const draft = readTripEnquiryDraft();
    if (!draft) return;

    if (draft.travelType) {
      setJourneyType(draft.travelType);
    }

    const preDests: string[] = [];
    if (Array.isArray(draft.destinations)) {
      draft.destinations.forEach((d) => {
        if (d.trim()) preDests.push(d.trim());
      });
    }
    if (draft.destination) {
      draft.destination
        .split(/[·,|]/)
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => {
          if (!preDests.includes(part)) preDests.push(part);
        });
    }
    if (preDests.length > 0) {
      setSelectedDestinations(preDests);
      setDestinationUndecided(false);
    }

    if (draft.travelStyle) {
      const matched = travelStyles.find((s) =>
        s.toLowerCase().includes(draft.travelStyle!.toLowerCase()) ||
        draft.travelStyle!.toLowerCase().includes(s.toLowerCase()),
      );
      setSelectedStyles([matched || draft.travelStyle]);
    }

    if (draft.travelDate) {
      setDepartureDate(draft.travelDate);
      setFlexibleDates(false);
    }
    if (draft.returnDate) setReturnDate(draft.returnDate);
    if (draft.flexibleDates !== undefined) setFlexibleDates(draft.flexibleDates);
    if (draft.duration) setDuration(draft.duration);
    if (draft.pickupLocation) setPickupLocation(draft.pickupLocation);
    if (draft.currency && supportedCurrencies.includes(draft.currency)) {
      setCurrency(draft.currency);
    }
    if (draft.budgetTier) setBudgetTier(draft.budgetTier);

    const mappedAccom = mapStayCategoryToAccommodation(draft.stayCategory || draft.accommodation);
    if (mappedAccom !== 'No preference') setAccommodationPref(mappedAccom);

    const preExps: string[] = [];
    if (Array.isArray(draft.experiences)) preExps.push(...draft.experiences);
    if (draft.experienceName && !preExps.includes(draft.experienceName)) {
      preExps.push(draft.experienceName);
    }
    if (preExps.length > 0) setSelectedExperiences(preExps);

    const refParts = [
      draft.packageName ? `Tour Package: ${draft.packageName}` : null,
      draft.offerName ? `Special Offer: ${draft.offerName}` : null,
      draft.stayName ? `Preferred Stay Style: ${draft.stayName}` : null,
      draft.serviceName ? `Service Requested: ${draft.serviceName}` : null,
    ].filter(Boolean);
    if (refParts.length > 0) {
      setAdditionalNotes(refParts.join(' | '));
    }

    if (draft.sourceLabel) {
      setPrefillBanner(draft.sourceLabel);
    } else if (refParts[0]) {
      setPrefillBanner(refParts[0]);
    } else if (preDests.length > 0) {
      setPrefillBanner(`Destination: ${preDests.join(', ')}`);
    } else if (preExps.length > 0) {
      setPrefillBanner(`Experience: ${preExps.join(', ')}`);
    }
  }, [supportedCurrencies, travelStyles]);

  // Persist non-PII trip selections in sessionStorage while navigating steps
  useEffect(() => {
    if (isEditorPreview) return;
    saveTripEnquiryDraft({
      travelType:
        journeyType === 'Domestic' ||
        journeyType === 'Inbound' ||
        journeyType === 'Outbound' ||
        journeyType === 'Custom'
          ? journeyType
          : 'Custom',
      destinations: destinationUndecided ? [] : selectedDestinations,
      travelStyle: selectedStyles[0],
      travelDate: flexibleDates ? undefined : departureDate || undefined,
      returnDate: flexibleDates ? undefined : returnDate || undefined,
      flexibleDates,
      duration,
      pickupLocation: pickupLocation || undefined,
      currency,
      budgetTier,
      accommodation: accommodationPref !== 'No preference' ? accommodationPref : undefined,
      experiences: selectedExperiences,
    });
  }, [
    isEditorPreview,
    journeyType,
    selectedDestinations,
    destinationUndecided,
    selectedStyles,
    flexibleDates,
    departureDate,
    returnDate,
    duration,
    pickupLocation,
    currency,
    budgetTier,
    accommodationPref,
    selectedExperiences,
  ]);

  const toggleInList = (value: string, list: string[], setter: (next: string[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleAddCustomDestination = () => {
    const clean = customDestInput.trim();
    if (!clean) return;
    setDestinationUndecided(false);
    if (!selectedDestinations.includes(clean)) {
      setSelectedDestinations((prev) => [...prev, clean]);
    }
    setCustomDestInput('');
  };

  const validateCurrentStep = (targetStep: number): boolean => {
    setStepError('');
    if (targetStep <= step) return true;

    if (step === 3) {
      if (adults < 1 || adults > 50) {
        setStepError('Please select at least 1 adult traveller.');
        return false;
      }
      if (children < 0 || children > 20) {
        setStepError('Please enter a valid number of children (0–20).');
        return false;
      }
      if (!flexibleDates) {
        if (!departureDate) {
          setStepError('Please select a preferred departure date, or switch on "My dates are flexible".');
          return false;
        }
        if (returnDate && returnDate < departureDate) {
          setStepError('Return date cannot be earlier than your departure date.');
          return false;
        }
      }
    }

    if (step === 4 && budgetAmount.trim()) {
      const numeric = Number(budgetAmount.replace(/,/g, ''));
      if (!Number.isFinite(numeric) || numeric <= 0) {
        setStepError('Please enter a valid positive number for your optional budget amount, or leave it blank.');
        return false;
      }
    }

    return true;
  };

  const goToStep = (next: number) => {
    const clamped = Math.max(1, Math.min(6, next));
    if (!validateCurrentStep(clamped)) return;
    setStep(clamped);
    if (typeof window !== 'undefined') {
      document.getElementById('planner-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleConfirmReset = () => {
    setJourneyType('Domestic');
    setSelectedDestinations([]);
    setCustomDestInput('');
    setDestinationUndecided(false);
    setSelectedStyles([]);
    setFlexibleDates(true);
    setDepartureDate('');
    setReturnDate('');
    setDuration('4–5 Days');
    setAdults(2);
    setChildren(0);
    setChildAges('');
    setPickupLocation('');
    setBudgetTier('Comfortable');
    setBudgetScope('Total trip budget');
    setCurrency(supportedCurrencies[0] || 'LKR');
    setBudgetAmount('');
    setAccommodationPref('No preference');
    setTransportPref('No preference');
    setSelectedExperiences([]);
    setSelectedRequirements([]);
    setDietaryNotes('');
    setAccessibilityNotes('');
    setSpecialOccasion('');
    setAdditionalNotes('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setPrefillBanner('');
    setStepError('');
    setCopiedNotice('');
    setConfirmResetOpen(false);
    clearTripEnquiryDraft();
    setStep(1);
  };

  const brandName = contentText(common.websiteTitle) || 'Ceylon Odyssey';
  const agencyEmail =
    contentText(shopContact.email) || contentText(shop.businessEmail) || contentText(contact.email);
  const agencyWhatsApp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    contentText(contact.phone);

  const selectedJourneyObj =
    journeyOptions.find((j) => j.key === journeyType) || journeyOptions[0];

  const formattedSummary = useMemo(() => {
    const destText = destinationUndecided
      ? 'Open to suggestions / Undecided'
      : selectedDestinations.length > 0
        ? selectedDestinations.join(', ')
        : 'Not specified yet';

    const dateText = flexibleDates
      ? `Flexible dates (${duration})`
      : [
          departureDate ? `Depart: ${departureDate}` : null,
          returnDate ? `Return: ${returnDate}` : null,
          `Duration: ${duration}`,
        ]
          .filter(Boolean)
          .join(' | ');

    const partyText =
      children > 0
        ? `${adults} Adult${adults === 1 ? '' : 's'}, ${children} Child${children === 1 ? '' : 'ren'}${childAges.trim() ? ` (Ages: ${childAges.trim()})` : ''}`
        : `${adults} Adult${adults === 1 ? '' : 's'}`;

    const budgetText = budgetAmount.trim()
      ? `${budgetTier} — ${currency} ${budgetAmount.trim()} (${budgetScope})`
      : `${budgetTier} (${budgetScope}, Currency: ${currency})`;

    return [
      `Bespoke Trip Inquiry — ${brandName}`,
      '----------------------------------------',
      `1. Journey Type: ${selectedJourneyObj?.title || journeyType}`,
      `2. Destinations: ${destText}`,
      `   Travel Style(s): ${selectedStyles.length > 0 ? selectedStyles.join(', ') : 'Open / Flexible'}`,
      `3. Travel Timing: ${dateText}`,
      `   Travellers: ${partyText}`,
      pickupLocation.trim() ? `   Pickup Location: ${pickupLocation.trim()}` : null,
      `4. Budget Guide: ${budgetText}`,
      `   Accommodation: ${accommodationPref}`,
      `   Transport: ${transportPref}`,
      selectedExperiences.length > 0
        ? `5. Selected Experiences: ${selectedExperiences.join(', ')}`
        : null,
      selectedRequirements.length > 0
        ? `   Preferences: ${selectedRequirements.join(', ')}`
        : null,
      dietaryNotes.trim() ? `   Dietary Notes: ${dietaryNotes.trim()}` : null,
      accessibilityNotes.trim() ? `   Accessibility Notes: ${accessibilityNotes.trim()}` : null,
      specialOccasion.trim() ? `   Special Occasion: ${specialOccasion.trim()}` : null,
      additionalNotes.trim() ? `   Additional Notes: ${additionalNotes.trim()}` : null,
      contactName.trim() || contactEmail.trim() || contactPhone.trim()
        ? '----------------------------------------'
        : null,
      contactName.trim() ? `Name: ${contactName.trim()}` : null,
      contactPhone.trim() ? `Phone / WhatsApp: ${contactPhone.trim()}` : null,
      contactEmail.trim() ? `Email: ${contactEmail.trim()}` : null,
      '----------------------------------------',
      '(Prepared via interactive trip planner — inquiry only, awaiting agency quotation.)',
    ]
      .filter(Boolean)
      .join('\n');
  }, [
    brandName,
    selectedJourneyObj,
    journeyType,
    destinationUndecided,
    selectedDestinations,
    selectedStyles,
    flexibleDates,
    departureDate,
    returnDate,
    duration,
    adults,
    children,
    childAges,
    pickupLocation,
    budgetTier,
    budgetAmount,
    currency,
    budgetScope,
    accommodationPref,
    transportPref,
    selectedExperiences,
    selectedRequirements,
    dietaryNotes,
    accessibilityNotes,
    specialOccasion,
    additionalNotes,
    contactName,
    contactPhone,
    contactEmail,
  ]);

  const emailInvalid =
    contactEmail.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim());
  const whatsappHref = buildWhatsAppEnquiryUrl(agencyWhatsApp, formattedSummary);
  const mailtoHref = buildMailtoEnquiryUrl(
    agencyEmail,
    `Bespoke Trip Inquiry (${selectedJourneyObj?.title || journeyType})${contactName.trim() ? ` — ${contactName.trim()}` : ''}`,
    formattedSummary,
  );

  const handleCopySummary = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(formattedSummary);
        setCopiedNotice('Trip summary copied to your clipboard.');
        window.setTimeout(() => setCopiedNotice(''), 4000);
        return;
      }
      setCopiedNotice('Copy is unavailable in this browser — select and copy the summary text above.');
    } catch {
      setCopiedNotice('Could not access clipboard — please copy directly from the summary box.');
    }
  };

  const bannerImageUrl = contentText(page.bannerImageUrl) || '/images/ayubowan-hospitality.webp';
  const bannerImageAlt =
    contentText(page.bannerImageAlt) || contentText(page.heading) || 'Plan your Sri Lanka journey';

  const summaryHeading = contentText(page.summaryHeading) || 'Your Trip Summary';
  const inquiryNotice =
    contentText(page.inquiryNotice) ||
    'Sending prepares a formatted travel inquiry directly for our agency via WhatsApp or your email app. No payment is taken and no reservation is confirmed until we reply with your tailored quotation.';
  const whatsappCtaLabel = contentText(page.whatsappCtaLabel) || 'Send via WhatsApp';
  const emailCtaLabel = contentText(page.emailCtaLabel) || 'Send via Email';
  const copyCtaLabel = contentText(page.copyCtaLabel) || 'Copy Trip Summary';

  const renderTripSummaryBody = () => (
    <div className="space-y-3 text-xs">
      <div className="flex items-start justify-between gap-2 border-b border-[var(--lux-border)] pb-2.5">
        <div>
          <span data-preview-static="sum-lbl-1" className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--lux-text-muted)]">
            1. Journey Type
          </span>
          <span data-preview-static="sum-val-1" className="font-semibold text-[var(--lux-text)]">
            {selectedJourneyObj?.title || journeyType}
          </span>
        </div>
        <button
          type="button"
          data-preview-static="sum-edit-1"
          onClick={() => goToStep(1)}
          className="border-0 bg-transparent p-0 text-[11px] font-semibold text-[var(--lux-tropical)] underline"
        >
          Edit
        </button>
      </div>

      <div className="flex items-start justify-between gap-2 border-b border-[var(--lux-border)] pb-2.5">
        <div className="min-w-0">
          <span data-preview-static="sum-lbl-2" className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--lux-text-muted)]">
            2. Destinations &amp; Style
          </span>
          <span data-preview-static="sum-val-2a" className="block font-semibold text-[var(--lux-text)]">
            {destinationUndecided
              ? 'Open to suggestions'
              : selectedDestinations.length > 0
                ? selectedDestinations.join(', ')
                : 'Not selected yet'}
          </span>
          {selectedStyles.length > 0 && (
            <span data-preview-static="sum-val-2b" className="mt-0.5 block text-[var(--lux-text-muted)]">
              {selectedStyles.join(' · ')}
            </span>
          )}
        </div>
        <button
          type="button"
          data-preview-static="sum-edit-2"
          onClick={() => goToStep(2)}
          className="shrink-0 border-0 bg-transparent p-0 text-[11px] font-semibold text-[var(--lux-tropical)] underline"
        >
          Edit
        </button>
      </div>

      <div className="flex items-start justify-between gap-2 border-b border-[var(--lux-border)] pb-2.5">
        <div>
          <span data-preview-static="sum-lbl-3" className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--lux-text-muted)]">
            3. Dates &amp; Travellers
          </span>
          <span data-preview-static="sum-val-3a" className="block font-semibold text-[var(--lux-text)]">
            {flexibleDates
              ? `Flexible · ${duration}`
              : `${departureDate || 'Date TBD'}${returnDate ? ` → ${returnDate}` : ''} (${duration})`}
          </span>
          <span data-preview-static="sum-val-3b" className="mt-0.5 block text-[var(--lux-text-muted)]">
            {adults} Adult{adults === 1 ? '' : 's'}
            {children > 0 ? `, ${children} Child${children === 1 ? '' : 'ren'}` : ''}
            {pickupLocation ? ` · From ${pickupLocation}` : ''}
          </span>
        </div>
        <button
          type="button"
          data-preview-static="sum-edit-3"
          onClick={() => goToStep(3)}
          className="shrink-0 border-0 bg-transparent p-0 text-[11px] font-semibold text-[var(--lux-tropical)] underline"
        >
          Edit
        </button>
      </div>

      <div className="flex items-start justify-between gap-2 border-b border-[var(--lux-border)] pb-2.5">
        <div>
          <span data-preview-static="sum-lbl-4" className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--lux-text-muted)]">
            4. Budget, Stay &amp; Transport
          </span>
          <span data-preview-static="sum-val-4a" className="block font-semibold text-[var(--lux-text)]">
            {budgetTier}
            {budgetAmount.trim() ? ` (${currency} ${budgetAmount.trim()})` : ` (${currency})`}
          </span>
          <span data-preview-static="sum-val-4b" className="mt-0.5 block text-[var(--lux-text-muted)]">
            {budgetScope} · {accommodationPref} · {transportPref}
          </span>
        </div>
        <button
          type="button"
          data-preview-static="sum-edit-4"
          onClick={() => goToStep(4)}
          className="shrink-0 border-0 bg-transparent p-0 text-[11px] font-semibold text-[var(--lux-tropical)] underline"
        >
          Edit
        </button>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span data-preview-static="sum-lbl-5" className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--lux-text-muted)]">
            5. Experiences &amp; Notes
          </span>
          <span data-preview-static="sum-val-5" className="block font-semibold text-[var(--lux-text)]">
            {selectedExperiences.length > 0
              ? selectedExperiences.join(', ')
              : 'No specific experiences selected'}
          </span>
          {selectedRequirements.length > 0 && (
            <span data-preview-static="sum-val-5b" className="mt-0.5 block text-[var(--lux-text-muted)]">
              {selectedRequirements.join(' · ')}
            </span>
          )}
        </div>
        <button
          type="button"
          data-preview-static="sum-edit-5"
          onClick={() => goToStep(5)}
          className="shrink-0 border-0 bg-transparent p-0 text-[11px] font-semibold text-[var(--lux-tropical)] underline"
        >
          Edit
        </button>
      </div>
    </div>
  );

  return (
    <div data-preview-page-key="plan_your_trip">
      {/* Compact Cinematic Concierge Hero */}
      <section
        data-design-section="planner-hero"
        className="relative isolate flex min-h-[34vh] items-end overflow-hidden bg-[#101820] text-[#FAF8F3]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <EditableImage
            src={bannerImageUrl}
            alt={bannerImageAlt}
            data-preview-field-path="planTripPage.bannerImageUrl"
            fit="cover"
            className="h-full w-full object-cover opacity-55"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#101820]/95 via-[#101820]/58 to-[#101820]/35"
        />

        <div className="lux-container relative z-10 pb-9 pt-20">
          <div className="mb-3.5 flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.08em] text-[#FAF8F3]/78">
            <a
              href={withBasePath('/')}
              data-preview-static="planner-bc-home"
              className="text-[#FAF8F3]/80 no-underline transition hover:text-[#C5A46D]"
            >
              Home
            </a>
            <span aria-hidden="true">/</span>
            <EditableText
              as="span"
              color="#C5A46D"
              className="font-semibold text-[#C5A46D]"
              data-preview-field-path="planTripPage.breadcrumbLabel"
              defaultValue={contentText(page.breadcrumbLabel) || 'Plan Your Trip'}
            />
          </div>

          <div className="max-w-3xl">
            <div className="mb-2">
              <EditableText
                as="span"
                color="#C5A46D"
                className="lux-eyebrow !text-[#C5A46D]"
                data-preview-field-path="planTripPage.eyebrow"
                defaultValue={contentText(page.eyebrow) || 'BESPOKE TRIP PLANNER'}
              />
            </div>

            <EditableText
              as="h1"
              variant="h1"
              color="#FAF8F3"
              className="font-display m-0 mb-2 text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#FAF8F3] sm:text-4xl lg:text-5xl"
              data-preview-field-path="planTripPage.heading"
              defaultValue={contentText(page.heading) || 'Plan Your Ideal Journey, Step by Step'}
            />

            <EditableText
              as="p"
              color="#E8DDC8"
              className="m-0 mb-2 text-base font-medium text-[#E8DDC8] sm:text-lg"
              data-preview-field-path="planTripPage.subtitle"
              defaultValue={contentText(page.subtitle)}
            />

            <EditableText
              as="p"
              color="rgba(250, 248, 243, 0.8)"
              className="m-0 max-w-2xl text-sm leading-relaxed text-[#FAF8F3]/80"
              data-preview-field-path="planTripPage.description"
              defaultValue={contentText(page.description)}
            />

            {isEditorPreview && (
              <div className="mt-3 inline-block rounded border border-dashed border-white/25 bg-[#101820]/65 px-2.5 py-1 text-[11px] text-[#A3B0BA]">
                <span data-preview-static="planner-hero-alt-label">Hero alt: </span>
                <span data-preview-field-path="planTripPage.bannerImageAlt">{bannerImageAlt}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          LIVE STOREFRONT: 6-STEP INTERACTIVE CONCIERGE PLANNER
          ═══════════════════════════════════════════════════════════════════ */}
      {!isEditorPreview && (
        <section
          id="planner-workspace"
          data-design-section="planner-wizard"
          className="lux-section bg-[var(--lux-bg)]"
        >
          <div className="lux-container">
            {/* Prefill Context Banner */}
            {prefillBanner && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[#154C42]/30 bg-[#154C42]/8 px-4 py-3 text-xs dark:border-[#C5A46D]/35 dark:bg-[#C5A46D]/10">
                <span data-preview-static="planner-prefill-notice" className="font-medium text-[var(--lux-text)]">
                  Pre-filled from your selection: <strong>{prefillBanner}</strong>
                </span>
                <button
                  type="button"
                  data-preview-static="planner-prefill-dismiss"
                  onClick={() => setPrefillBanner('')}
                  className="border-0 bg-transparent p-0 text-xs font-semibold text-[var(--lux-tropical)] underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Accessible Step Progress Indicator */}
            <div className="mb-7 overflow-x-auto pb-2">
              <ol className="m-0 flex min-w-[620px] list-none items-center justify-between gap-2 p-0">
                {STEP_LABELS.map((label, idx) => {
                  const num = idx + 1;
                  const isCurrent = step === num;
                  const isCompleted = num < step;
                  return (
                    <li key={label} className="flex-1">
                      <button
                        type="button"
                        data-preview-static={`planner-step-tab-${num}`}
                        aria-current={isCurrent ? 'step' : undefined}
                        onClick={() => goToStep(num)}
                        className={`flex w-full items-center gap-2 rounded border px-3 py-2.5 text-left transition ${
                          isCurrent
                            ? 'border-[var(--brand-accent,#FF783D)] bg-[var(--brand-accent,#FF783D)] text-white shadow-sm'
                            : isCompleted
                              ? 'border-[var(--brand-secondary,#154C42)] bg-[var(--brand-secondary,#154C42)]/10 text-[var(--lux-text)] dark:border-[#C5A46D]/50'
                              : 'border-[var(--lux-border)] bg-[var(--lux-surface)] text-[var(--lux-text-muted)] hover:border-[var(--lux-border-strong)]'
                        }`}
                      >
                        <span
                          className={`font-display flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                            isCurrent
                              ? 'bg-white text-[#FF783D]'
                              : isCompleted
                                ? 'bg-[#154C42] text-white'
                                : 'bg-[var(--lux-surface-alt)] text-[var(--lux-text-muted)]'
                          }`}
                        >
                          {isCompleted ? '✓' : num}
                        </span>
                        <span className="truncate text-[11.5px] font-semibold">{label}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Mobile Collapsible Live Summary */}
            <div className="mb-6 lg:hidden">
              <button
                type="button"
                data-preview-static="planner-mobile-summary-toggle"
                aria-expanded={mobileSummaryOpen}
                onClick={() => setMobileSummaryOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] px-4 py-3 text-left"
              >
                <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--lux-text)]">
                  {summaryHeading} (Step {step} of 6)
                </span>
                <span aria-hidden="true" className="text-sm text-[var(--lux-tropical)]">
                  {mobileSummaryOpen ? '▲' : '▼'}
                </span>
              </button>
              {mobileSummaryOpen && (
                <div className="mt-2 rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-4">
                  {renderTripSummaryBody()}
                </div>
              )}
            </div>

            {/* Two-Column Desktop Workspace */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              {/* Left 8 Columns: Active Step Form */}
              <div className="rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-5 shadow-[var(--lux-shadow-sm)] sm:p-8 lg:col-span-8">
                {/* STEP 1 — JOURNEY TYPE */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <span data-preview-static="step1-kicker" className="lux-eyebrow-tropical mb-1.5 block">
                        Step 1 of 6
                      </span>
                      <EditableText
                        as="h2"
                        className="font-display m-0 mb-1.5 text-2xl font-bold text-[var(--lux-text)]"
                        data-preview-field-path="planTripPage.step1Title"
                        defaultValue={contentText(page.step1Title) || 'What Kind of Journey Are You Planning?'}
                      />
                      <EditableText
                        as="p"
                        className="m-0 text-sm text-[var(--lux-text-muted)]"
                        data-preview-field-path="planTripPage.step1Subtitle"
                        defaultValue={contentText(page.step1Subtitle)}
                      />
                    </div>

                    <div
                      data-preview-list-path="planTripPage.journeyOptions"
                      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                      {journeyOptions.map((opt, idx) => {
                        const selected = journeyType === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            data-preview-item-path={`planTripPage.journeyOptions[${idx}]`}
                            aria-pressed={selected}
                            onClick={() => setJourneyType(opt.key)}
                            className={`flex flex-col items-start gap-2 rounded-[6px] border p-5 text-left transition ${
                              selected
                                ? 'border-[var(--brand-accent,#FF783D)] bg-[var(--brand-accent,#FF783D)]/8 shadow-sm ring-1 ring-[var(--brand-accent,#FF783D)]'
                                : 'border-[var(--lux-border-strong)] bg-[var(--lux-bg)] hover:border-[var(--brand-secondary,#154C42)]'
                            }`}
                          >
                            {opt.badge && (
                              <span
                                data-preview-field-path={`planTripPage.journeyOptions[${idx}].badge`}
                                className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lux-gold-deep)] dark:text-[#C5A46D]"
                              >
                                {opt.badge}
                              </span>
                            )}
                            <span
                              data-preview-field-path={`planTripPage.journeyOptions[${idx}].title`}
                              className="font-display text-base font-bold text-[var(--lux-text)]"
                            >
                              {opt.title}
                            </span>
                            <span
                              data-preview-field-path={`planTripPage.journeyOptions[${idx}].description`}
                              className="text-xs leading-relaxed text-[var(--lux-text-muted)]"
                            >
                              {opt.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 2 — DESTINATIONS & TRAVEL STYLE */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <span data-preview-static="step2-kicker" className="lux-eyebrow-tropical mb-1.5 block">
                        Step 2 of 6
                      </span>
                      <EditableText
                        as="h2"
                        className="font-display m-0 mb-1.5 text-2xl font-bold text-[var(--lux-text)]"
                        data-preview-field-path="planTripPage.step2Title"
                        defaultValue={contentText(page.step2Title) || 'Choose Your Destinations & Travel Style'}
                      />
                      <EditableText
                        as="p"
                        className="m-0 text-sm text-[var(--lux-text-muted)]"
                        data-preview-field-path="planTripPage.step2Subtitle"
                        defaultValue={contentText(page.step2Subtitle)}
                      />
                    </div>

                    {/* Destination Selector */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span data-preview-static="step2-dest-label" className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--lux-text)]">
                          {journeyType === 'Outbound'
                            ? 'Preferred Outbound Destinations'
                            : 'Preferred Sri Lanka Destinations'}
                        </span>
                        <button
                          type="button"
                          data-preview-static="step2-dest-undecided-btn"
                          aria-pressed={destinationUndecided}
                          onClick={() => {
                            setDestinationUndecided((prev) => !prev);
                            if (!destinationUndecided) setSelectedDestinations([]);
                          }}
                          className={`rounded border px-3 py-1 text-xs font-semibold transition ${
                            destinationUndecided
                              ? 'border-[var(--brand-secondary,#154C42)] bg-[var(--brand-secondary,#154C42)] text-white'
                              : 'border-[var(--lux-border-strong)] bg-transparent text-[var(--lux-text-muted)]'
                          }`}
                        >
                          Not Decided Yet — Suggest Best Route
                        </button>
                      </div>

                      {journeyType !== 'Outbound' && destinations.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {destinations.map((dest) => {
                            const active = !destinationUndecided && selectedDestinations.includes(dest.name);
                            return (
                              <button
                                key={dest.id}
                                type="button"
                                data-preview-static="step2-dest-card"
                                aria-pressed={active}
                                onClick={() => {
                                  setDestinationUndecided(false);
                                  toggleInList(dest.name, selectedDestinations, setSelectedDestinations);
                                }}
                                className={`group relative overflow-hidden rounded-[6px] border p-0 text-left transition ${
                                  active
                                    ? 'border-[var(--brand-accent,#FF783D)] ring-2 ring-[var(--brand-accent,#FF783D)]'
                                    : 'border-[var(--lux-border)] opacity-90 hover:opacity-100'
                                }`}
                              >
                                <div className="aspect-[4/3] w-full overflow-hidden bg-[#101820]">
                                  <img
                                    src={withBasePath(dest.imageUrl)}
                                    alt={dest.name}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="bg-[var(--lux-bg)] p-2">
                                  <span className="font-display block truncate text-xs font-bold text-[var(--lux-text)]">
                                    {dest.name}
                                  </span>
                                  <span className="block truncate text-[10px] text-[var(--lux-text-muted)]">
                                    {dest.region}
                                  </span>
                                </div>
                                {active && (
                                  <span
                                    aria-hidden="true"
                                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF783D] text-[11px] font-bold text-white"
                                  >
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {(journeyType === 'Outbound' || journeyType === 'Custom') && (
                        <div className="pt-1">
                          <span data-preview-static="step2-outbound-label" className="mb-2 block text-xs font-medium text-[var(--lux-text-muted)]">
                            Popular Outbound Destinations:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {outboundList.map((country) => {
                              const active = !destinationUndecided && selectedDestinations.includes(country);
                              return (
                                <button
                                  key={country}
                                  type="button"
                                  data-preview-static="step2-outbound-chip"
                                  aria-pressed={active}
                                  onClick={() => {
                                    setDestinationUndecided(false);
                                    toggleInList(country, selectedDestinations, setSelectedDestinations);
                                  }}
                                  className={`min-h-[36px] rounded border px-3.5 py-1 text-xs font-semibold transition ${
                                    active
                                      ? 'border-[var(--brand-accent,#FF783D)] bg-[var(--brand-accent,#FF783D)] text-white'
                                      : 'border-[var(--lux-border-strong)] bg-[var(--lux-bg)] text-[var(--lux-text)] hover:border-[var(--brand-accent,#FF783D)]'
                                  }`}
                                >
                                  {country}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Custom Destination Input */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <label htmlFor="custom-dest-input" data-preview-static="step2-custom-dest-lbl" className="sr-only">
                          Add a custom destination
                        </label>
                        <input
                          id="custom-dest-input"
                          type="text"
                          value={customDestInput}
                          onChange={(e) => setCustomDestInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomDestination();
                            }
                          }}
                          placeholder="Add another town or country (e.g. Jaffna, Nuwara Eliya, Japan)..."
                          data-preview-static="step2-custom-dest-input"
                          className="lux-input !min-h-[40px] flex-1"
                        />
                        <button
                          type="button"
                          data-preview-static="step2-add-custom-dest"
                          onClick={handleAddCustomDestination}
                          className="lux-btn-outline !min-h-[40px] !px-4"
                        >
                          + Add
                        </button>
                      </div>

                      {selectedDestinations.length > 0 && !destinationUndecided && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedDestinations.map((item) => (
                            <button
                              key={item}
                              type="button"
                              data-preview-static="step2-selected-dest-pill"
                              onClick={() =>
                                setSelectedDestinations((prev) => prev.filter((x) => x !== item))
                              }
                              className="inline-flex items-center gap-1.5 rounded bg-[#154C42] px-2.5 py-1 text-xs font-semibold text-[#FAF8F3]"
                            >
                              <span>{item}</span>
                              <span aria-hidden="true">×</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Travel Styles Multi-Select */}
                    <div className="space-y-2.5 border-t border-[var(--lux-border)] pt-5">
                      <span data-preview-static="step2-styles-label" className="font-display block text-xs font-bold uppercase tracking-[0.14em] text-[var(--lux-text)]">
                        Select Travel Style(s)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {travelStyles.map((style) => {
                          const active = selectedStyles.includes(style);
                          return (
                            <button
                              key={style}
                              type="button"
                              data-preview-static="step2-style-chip"
                              aria-pressed={active}
                              onClick={() => toggleInList(style, selectedStyles, setSelectedStyles)}
                              className={`min-h-[38px] rounded border px-3.5 py-1.5 text-xs font-semibold transition ${
                                active
                                  ? 'border-[var(--brand-secondary,#154C42)] bg-[var(--brand-secondary,#154C42)] text-[#FAF8F3] dark:border-[var(--brand-accent,#FF783D)] dark:bg-[var(--brand-accent,#FF783D)]'
                                  : 'border-[var(--lux-border-strong)] bg-[var(--lux-bg)] text-[var(--lux-text-muted)] hover:border-[var(--brand-accent,#FF783D)] hover:text-[var(--lux-text)]'
                              }`}
                            >
                              {style}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 — TRAVEL DATES & TRAVELLERS */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <span data-preview-static="step3-kicker" className="lux-eyebrow-tropical mb-1.5 block">
                        Step 3 of 6
                      </span>
                      <EditableText
                        as="h2"
                        className="font-display m-0 mb-1.5 text-2xl font-bold text-[var(--lux-text)]"
                        data-preview-field-path="planTripPage.step3Title"
                        defaultValue={contentText(page.step3Title) || 'Travel Dates, Travellers & Pickup Location'}
                      />
                      <EditableText
                        as="p"
                        className="m-0 text-sm text-[var(--lux-text-muted)]"
                        data-preview-field-path="planTripPage.step3Subtitle"
                        defaultValue={contentText(page.step3Subtitle)}
                      />
                    </div>

                    {/* Flexible Dates Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-4">
                      <div>
                        <span data-preview-static="step3-flex-title" className="block text-sm font-bold text-[var(--lux-text)]">
                          My travel dates are flexible
                        </span>
                        <span data-preview-static="step3-flex-desc" className="block text-xs text-[var(--lux-text-muted)]">
                          Leave this on if you are still comparing weekends, school holidays, or seasons.
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={flexibleDates}
                        data-preview-static="step3-flex-switch"
                        onClick={() => {
                          setFlexibleDates((prev) => !prev);
                          setStepError('');
                        }}
                        className={`min-h-[36px] rounded border px-4 py-1 text-xs font-bold uppercase tracking-[0.1em] transition ${
                          flexibleDates
                            ? 'border-[#154C42] bg-[#154C42] text-white'
                            : 'border-[var(--lux-border-strong)] bg-transparent text-[var(--lux-text-muted)]'
                        }`}
                      >
                        {flexibleDates ? 'Flexible: On' : 'Exact Dates'}
                      </button>
                    </div>

                    {!flexibleDates && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="plan-dep-date" data-preview-static="step3-dep-lbl" className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]">
                            Preferred Departure Date *
                          </label>
                          <input
                            id="plan-dep-date"
                            type="date"
                            value={departureDate}
                            onChange={(e) => {
                              setDepartureDate(e.target.value);
                              setStepError('');
                            }}
                            data-preview-static="step3-dep-input"
                            className="lux-input"
                          />
                        </div>
                        <div>
                          <label htmlFor="plan-ret-date" data-preview-static="step3-ret-lbl" className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]">
                            Preferred Return Date (optional)
                          </label>
                          <input
                            id="plan-ret-date"
                            type="date"
                            min={departureDate || undefined}
                            value={returnDate}
                            onChange={(e) => {
                              setReturnDate(e.target.value);
                              setStepError('');
                            }}
                            data-preview-static="step3-ret-input"
                            className="lux-input"
                          />
                        </div>
                      </div>
                    )}

                    {/* Duration */}
                    <div>
                      <span data-preview-static="step3-duration-lbl" className="mb-2 block text-xs font-semibold text-[var(--lux-text-muted)]">
                        Approximate Trip Duration
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {DURATION_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            data-preview-static="step3-duration-btn"
                            aria-pressed={duration === opt}
                            onClick={() => setDuration(opt)}
                            className={`min-h-[36px] rounded border px-3.5 py-1 text-xs font-semibold transition ${
                              duration === opt
                                ? 'border-[var(--brand-accent,#FF783D)] bg-[var(--brand-accent,#FF783D)] text-white'
                                : 'border-[var(--lux-border-strong)] bg-[var(--lux-bg)] text-[var(--lux-text)]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Adults & Children Steppers */}
                    <div className="grid grid-cols-1 gap-4 border-t border-[var(--lux-border)] pt-5 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-bg)] p-3.5">
                        <div>
                          <span data-preview-static="step3-adults-lbl" className="block text-sm font-bold text-[var(--lux-text)]">
                            Adults
                          </span>
                          <span data-preview-static="step3-adults-sub" className="text-[11px] text-[var(--lux-text-muted)]">
                            Ages 12+
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            data-preview-static="step3-adults-dec"
                            aria-label="Decrease adults"
                            onClick={() => setAdults((a) => Math.max(1, a - 1))}
                            className="flex h-9 w-9 items-center justify-center rounded border border-[var(--lux-border-strong)] bg-transparent text-base font-bold text-[var(--lux-text)]"
                          >
                            −
                          </button>
                          <span data-preview-static="step3-adults-val" className="font-display w-6 text-center text-sm font-bold">
                            {adults}
                          </span>
                          <button
                            type="button"
                            data-preview-static="step3-adults-inc"
                            aria-label="Increase adults"
                            onClick={() => setAdults((a) => Math.min(50, a + 1))}
                            className="flex h-9 w-9 items-center justify-center rounded border border-[var(--lux-border-strong)] bg-transparent text-base font-bold text-[var(--lux-text)]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-bg)] p-3.5">
                        <div>
                          <span data-preview-static="step3-children-lbl" className="block text-sm font-bold text-[var(--lux-text)]">
                            Children
                          </span>
                          <span data-preview-static="step3-children-sub" className="text-[11px] text-[var(--lux-text-muted)]">
                            Under 12 (optional)
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            data-preview-static="step3-children-dec"
                            aria-label="Decrease children"
                            onClick={() => setChildren((c) => Math.max(0, c - 1))}
                            className="flex h-9 w-9 items-center justify-center rounded border border-[var(--lux-border-strong)] bg-transparent text-base font-bold text-[var(--lux-text)]"
                          >
                            −
                          </button>
                          <span data-preview-static="step3-children-val" className="font-display w-6 text-center text-sm font-bold">
                            {children}
                          </span>
                          <button
                            type="button"
                            data-preview-static="step3-children-inc"
                            aria-label="Increase children"
                            onClick={() => setChildren((c) => Math.min(20, c + 1))}
                            className="flex h-9 w-9 items-center justify-center rounded border border-[var(--lux-border-strong)] bg-transparent text-base font-bold text-[var(--lux-text)]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {children > 0 && (
                      <div>
                        <label htmlFor="plan-child-ages" data-preview-static="step3-child-ages-lbl" className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]">
                          Children&apos;s Ages (optional — helps match family rooms &amp; child rates)
                        </label>
                        <input
                          id="plan-child-ages"
                          type="text"
                          value={childAges}
                          onChange={(e) => setChildAges(e.target.value)}
                          placeholder="e.g. 4 and 9 years"
                          data-preview-static="step3-child-ages-input"
                          className="lux-input"
                        />
                      </div>
                    )}

                    {/* Pickup City */}
                    <div className="space-y-2 border-t border-[var(--lux-border)] pt-5">
                      <label htmlFor="plan-pickup-city" data-preview-static="step3-pickup-lbl" className="block text-xs font-semibold text-[var(--lux-text-muted)]">
                        Preferred Pickup City or Location (optional)
                      </label>
                      <input
                        id="plan-pickup-city"
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        placeholder="e.g. Colombo, CMB Airport, Kandy, Galle..."
                        data-preview-static="step3-pickup-input"
                        className="lux-input"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {pickupSuggestions.map((city) => (
                          <button
                            key={city}
                            type="button"
                            data-preview-static="step3-pickup-chip"
                            onClick={() => setPickupLocation(city)}
                            className={`rounded border px-2.5 py-1 text-[11px] font-medium transition ${
                              pickupLocation === city
                                ? 'border-[#154C42] bg-[#154C42] text-white'
                                : 'border-[var(--lux-border)] bg-[var(--lux-surface-alt)] text-[var(--lux-text-muted)] hover:border-[var(--lux-border-strong)]'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 — BUDGET, ACCOMMODATION & TRANSPORT */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <span data-preview-static="step4-kicker" className="lux-eyebrow-tropical mb-1.5 block">
                        Step 4 of 6
                      </span>
                      <EditableText
                        as="h2"
                        className="font-display m-0 mb-1.5 text-2xl font-bold text-[var(--lux-text)]"
                        data-preview-field-path="planTripPage.step4Title"
                        defaultValue={contentText(page.step4Title) || 'Budget Guide, Accommodation & Transport'}
                      />
                      <EditableText
                        as="p"
                        className="m-0 text-sm text-[var(--lux-text-muted)]"
                        data-preview-field-path="planTripPage.step4Subtitle"
                        defaultValue={contentText(page.step4Subtitle)}
                      />
                    </div>

                    {/* Budget Tier Cards */}
                    <div>
                      <span data-preview-static="step4-tier-lbl" className="font-display mb-2.5 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--lux-text)]">
                        Comfort &amp; Budget Tier
                      </span>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {BUDGET_TIERS.map((tier) => {
                          const active = budgetTier === tier.id;
                          return (
                            <button
                              key={tier.id}
                              type="button"
                              data-preview-static="step4-budget-tier"
                              aria-pressed={active}
                              onClick={() => setBudgetTier(tier.id)}
                              className={`flex flex-col items-start gap-1 rounded-[6px] border p-3.5 text-left transition ${
                                active
                                  ? 'border-[var(--brand-accent,#FF783D)] bg-[var(--brand-accent,#FF783D)]/8 ring-1 ring-[var(--brand-accent,#FF783D)]'
                                  : 'border-[var(--lux-border-strong)] bg-[var(--lux-bg)]'
                              }`}
                            >
                              <span className="font-display text-xs font-bold text-[var(--lux-text)]">
                                {tier.id}
                              </span>
                              <span className="text-[11px] leading-snug text-[var(--lux-text-muted)]">
                                {tier.note}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scope (Total vs Per Person) + Currency + Optional Amount */}
                    <div className="grid grid-cols-1 gap-4 rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-4 sm:grid-cols-3">
                      <div>
                        <span data-preview-static="step4-scope-lbl" className="mb-1.5 block text-xs font-semibold text-[var(--lux-text-muted)]">
                          Budget Basis
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {(['Total trip budget', 'Per person budget'] as const).map((scope) => (
                            <button
                              key={scope}
                              type="button"
                              data-preview-static="step4-scope-btn"
                              aria-pressed={budgetScope === scope}
                              onClick={() => setBudgetScope(scope)}
                              className={`min-h-[34px] rounded border px-2.5 py-1 text-left text-xs font-semibold transition ${
                                budgetScope === scope
                                  ? 'border-[#154C42] bg-[#154C42] text-white'
                                  : 'border-[var(--lux-border-strong)] bg-[var(--lux-surface)] text-[var(--lux-text)]'
                              }`}
                            >
                              {scope}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="plan-currency" data-preview-static="step4-currency-lbl" className="mb-1.5 block text-xs font-semibold text-[var(--lux-text-muted)]">
                          Preferred Currency
                        </label>
                        <select
                          id="plan-currency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          data-preview-static="step4-currency-select"
                          className="lux-select"
                        >
                          {supportedCurrencies.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="plan-budget-amt" data-preview-static="step4-amt-lbl" className="mb-1.5 block text-xs font-semibold text-[var(--lux-text-muted)]">
                          Approximate Budget (optional)
                        </label>
                        <input
                          id="plan-budget-amt"
                          type="text"
                          inputMode="numeric"
                          value={budgetAmount}
                          onChange={(e) => {
                            setBudgetAmount(e.target.value);
                            setStepError('');
                          }}
                          placeholder={`e.g. ${currency === 'LKR' ? '250,000' : '1,500'}`}
                          data-preview-static="step4-amt-input"
                          className="lux-input"
                        />
                      </div>
                    </div>

                    {/* Accommodation Preference */}
                    <div className="border-t border-[var(--lux-border)] pt-5">
                      <span data-preview-static="step4-accom-lbl" className="font-display mb-2.5 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--lux-text)]">
                        Accommodation Preference
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {ACCOMMODATION_PREFS.map((pref) => (
                          <button
                            key={pref}
                            type="button"
                            data-preview-static="step4-accom-btn"
                            aria-pressed={accommodationPref === pref}
                            onClick={() => setAccommodationPref(pref)}
                            className={`min-h-[38px] rounded border px-3.5 py-1 text-xs font-semibold transition ${
                              accommodationPref === pref
                                ? 'border-[var(--brand-secondary,#154C42)] bg-[var(--brand-secondary,#154C42)] text-white dark:border-[var(--brand-accent,#FF783D)] dark:bg-[var(--brand-accent,#FF783D)]'
                                : 'border-[var(--lux-border-strong)] bg-[var(--lux-bg)] text-[var(--lux-text-muted)]'
                            }`}
                          >
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transport Preference */}
                    <div className="border-t border-[var(--lux-border)] pt-5">
                      <span data-preview-static="step4-transport-lbl" className="font-display mb-2.5 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--lux-text)]">
                        Transport Preference
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {TRANSPORT_PREFS.map((pref) => (
                          <button
                            key={pref}
                            type="button"
                            data-preview-static="step4-transport-btn"
                            aria-pressed={transportPref === pref}
                            onClick={() => setTransportPref(pref)}
                            className={`min-h-[38px] rounded border px-3.5 py-1 text-xs font-semibold transition ${
                              transportPref === pref
                                ? 'border-[var(--brand-secondary,#154C42)] bg-[var(--brand-secondary,#154C42)] text-white dark:border-[var(--brand-accent,#FF783D)] dark:bg-[var(--brand-accent,#FF783D)]'
                                : 'border-[var(--lux-border-strong)] bg-[var(--lux-bg)] text-[var(--lux-text-muted)]'
                            }`}
                          >
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5 — EXPERIENCES & SPECIAL REQUIREMENTS */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <span data-preview-static="step5-kicker" className="lux-eyebrow-tropical mb-1.5 block">
                        Step 5 of 6
                      </span>
                      <EditableText
                        as="h2"
                        className="font-display m-0 mb-1.5 text-2xl font-bold text-[var(--lux-text)]"
                        data-preview-field-path="planTripPage.step5Title"
                        defaultValue={contentText(page.step5Title) || 'Experiences & Personal Preferences'}
                      />
                      <EditableText
                        as="p"
                        className="m-0 text-sm text-[var(--lux-text-muted)]"
                        data-preview-field-path="planTripPage.step5Subtitle"
                        defaultValue={contentText(page.step5Subtitle)}
                      />
                    </div>

                    {experiences.length > 0 && (
                      <div>
                        <span data-preview-static="step5-exp-lbl" className="font-display mb-2.5 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--lux-text)]">
                          Signature Experiences (Select Any)
                        </span>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {experiences.map((exp) => {
                            const active = selectedExperiences.includes(exp.title);
                            return (
                              <button
                                key={exp.id}
                                type="button"
                                data-preview-static="step5-exp-card"
                                aria-pressed={active}
                                onClick={() =>
                                  toggleInList(exp.title, selectedExperiences, setSelectedExperiences)
                                }
                                className={`flex items-center gap-3 rounded-[6px] border p-2.5 text-left transition ${
                                  active
                                    ? 'border-[var(--brand-accent,#FF783D)] bg-[var(--brand-accent,#FF783D)]/8 ring-1 ring-[var(--brand-accent,#FF783D)]'
                                    : 'border-[var(--lux-border)] bg-[var(--lux-bg)] hover:border-[var(--lux-border-strong)]'
                                }`}
                              >
                                <img
                                  src={withBasePath(exp.imageUrl)}
                                  alt={exp.title}
                                  loading="lazy"
                                  className="h-12 w-16 shrink-0 rounded object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <span className="font-display block truncate text-xs font-bold text-[var(--lux-text)]">
                                    {exp.title}
                                  </span>
                                  <span className="block truncate text-[10.5px] text-[var(--lux-text-muted)]">
                                    {exp.category}
                                  </span>
                                </div>
                                <span
                                  aria-hidden="true"
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                    active
                                      ? 'bg-[#FF783D] text-white'
                                      : 'border border-[var(--lux-border-strong)] text-transparent'
                                  }`}
                                >
                                  ✓
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Optional Requirements Chips */}
                    <div className="border-t border-[var(--lux-border)] pt-5">
                      <span data-preview-static="step5-req-lbl" className="font-display mb-2.5 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--lux-text)]">
                        Helpful Preferences (Optional)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {SPECIAL_REQUIREMENT_CHIPS.map((req) => {
                          const active = selectedRequirements.includes(req);
                          return (
                            <button
                              key={req}
                              type="button"
                              data-preview-static="step5-req-chip"
                              aria-pressed={active}
                              onClick={() =>
                                toggleInList(req, selectedRequirements, setSelectedRequirements)
                              }
                              className={`min-h-[36px] rounded border px-3 py-1 text-xs font-semibold transition ${
                                active
                                  ? 'border-[#154C42] bg-[#154C42] text-white'
                                  : 'border-[var(--lux-border-strong)] bg-[var(--lux-bg)] text-[var(--lux-text-muted)]'
                              }`}
                            >
                              {req}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Optional Text Notes — No sensitive documents or payment details requested */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="plan-dietary" data-preview-static="step5-diet-lbl" className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]">
                          Dietary Preferences (optional)
                        </label>
                        <input
                          id="plan-dietary"
                          type="text"
                          value={dietaryNotes}
                          onChange={(e) => setDietaryNotes(e.target.value)}
                          placeholder="e.g. Vegetarian, Halal, Mild spice, Nut allergy"
                          data-preview-static="step5-diet-input"
                          className="lux-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="plan-occasion" data-preview-static="step5-occ-lbl" className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]">
                          Special Occasion (optional)
                        </label>
                        <input
                          id="plan-occasion"
                          type="text"
                          value={specialOccasion}
                          onChange={(e) => setSpecialOccasion(e.target.value)}
                          placeholder="e.g. Honeymoon, Anniversary, Family Reunion"
                          data-preview-static="step5-occ-input"
                          className="lux-input"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="plan-access" data-preview-static="step5-access-lbl" className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]">
                          Accessibility or Mobility Notes (optional)
                        </label>
                        <input
                          id="plan-access"
                          type="text"
                          value={accessibilityNotes}
                          onChange={(e) => setAccessibilityNotes(e.target.value)}
                          placeholder="e.g. Ground-floor rooms for elders, minimal stair climbs"
                          data-preview-static="step5-access-input"
                          className="lux-input"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="plan-extra-notes" data-preview-static="step5-notes-lbl" className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]">
                          Additional Notes or Specific Package/Stay Interest (optional)
                        </label>
                        <textarea
                          id="plan-extra-notes"
                          rows={3}
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder="Anything else you would like us to know? Please do not enter passport or payment details."
                          data-preview-static="step5-notes-textarea"
                          className="lux-textarea"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6 — REVIEW & SEND INQUIRY */}
                {step === 6 && (
                  <div className="space-y-6">
                    <div>
                      <span data-preview-static="step6-kicker" className="lux-eyebrow-tropical mb-1.5 block">
                        Step 6 of 6
                      </span>
                      <EditableText
                        as="h2"
                        className="font-display m-0 mb-1.5 text-2xl font-bold text-[var(--lux-text)]"
                        data-preview-field-path="planTripPage.step6Title"
                        defaultValue={contentText(page.step6Title) || 'Review Your Trip Summary & Send Inquiry'}
                      />
                      <EditableText
                        as="p"
                        className="m-0 text-sm text-[var(--lux-text-muted)]"
                        data-preview-field-path="planTripPage.step6Subtitle"
                        defaultValue={contentText(page.step6Subtitle)}
                      />
                    </div>

                    {/* Optional Contact Details (In-Memory Only) */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label htmlFor="plan-contact-name" data-preview-static="step6-name-lbl" className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]">
                          Your Name (optional)
                        </label>
                        <input
                          id="plan-contact-name"
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Full name"
                          data-preview-static="step6-name-input"
                          className="lux-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="plan-contact-phone" data-preview-static="step6-phone-lbl" className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]">
                          Phone / WhatsApp (optional)
                        </label>
                        <input
                          id="plan-contact-phone"
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+94 77 ..."
                          data-preview-static="step6-phone-input"
                          className="lux-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="plan-contact-email" data-preview-static="step6-email-lbl" className="mb-1 block text-xs font-semibold text-[var(--lux-text-muted)]">
                          Email Address (optional)
                        </label>
                        <input
                          id="plan-contact-email"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="you@example.com"
                          data-preview-static="step6-email-input"
                          className="lux-input"
                        />
                        {emailInvalid && (
                          <span data-preview-static="step6-email-err" className="mt-1 block text-[11px] text-red-600 dark:text-red-400">
                            Please enter a valid email address or leave blank.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Formatted Message Preview */}
                    <div>
                      <span data-preview-static="step6-preview-lbl" className="font-display mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--lux-text)]">
                        Formatted Inquiry Preview
                      </span>
                      <pre
                        data-preview-static="step6-formatted-message"
                        className="m-0 max-h-64 overflow-auto whitespace-pre-wrap rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface-alt)] p-4 font-sans text-xs leading-relaxed text-[var(--lux-text)]"
                      >
                        {formattedSummary}
                      </pre>
                    </div>

                    {/* Honest Inquiry Preparation Notice */}
                    <div className="rounded-[6px] border-l-2 border-[#C5A46D] bg-[var(--lux-surface-alt)] px-4 py-3">
                      <EditableText
                        as="p"
                        className="m-0 text-xs leading-relaxed text-[var(--lux-text-muted)]"
                        data-preview-field-path="planTripPage.inquiryNotice"
                        defaultValue={inquiryNotice}
                      />
                    </div>

                    {/* Send / Copy / Start Over Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {whatsappHref && !emailInvalid ? (
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="lux-btn-sunset"
                        >
                          <span data-preview-field-path="planTripPage.whatsappCtaLabel">
                            {whatsappCtaLabel}
                          </span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="lux-btn-outline cursor-not-allowed opacity-60"
                        >
                          <span data-preview-field-path="planTripPage.whatsappCtaLabel">
                            {whatsappCtaLabel}
                          </span>
                        </button>
                      )}

                      {mailtoHref && !emailInvalid ? (
                        <a href={mailtoHref} className="lux-btn-tropical">
                          <span data-preview-field-path="planTripPage.emailCtaLabel">
                            {emailCtaLabel}
                          </span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="lux-btn-outline cursor-not-allowed opacity-60"
                        >
                          <span data-preview-field-path="planTripPage.emailCtaLabel">
                            {emailCtaLabel}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="lux-btn-outline"
                      >
                        <span data-preview-field-path="planTripPage.copyCtaLabel">
                          {copyCtaLabel}
                        </span>
                      </button>

                      {!confirmResetOpen ? (
                        <button
                          type="button"
                          data-preview-static="step6-start-over-btn"
                          onClick={() => setConfirmResetOpen(true)}
                          className="ml-auto border-0 bg-transparent px-2 py-2 text-xs font-semibold text-[var(--lux-text-muted)] underline hover:text-[var(--lux-text)]"
                        >
                          Start Over
                        </button>
                      ) : (
                        <div className="ml-auto flex items-center gap-2 rounded border border-red-400/50 bg-red-500/10 px-3 py-1.5 text-xs">
                          <span data-preview-static="step6-reset-prompt" className="font-medium text-[var(--lux-text)]">
                            Clear all choices?
                          </span>
                          <button
                            type="button"
                            data-preview-static="step6-reset-confirm"
                            onClick={handleConfirmReset}
                            className="rounded bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white"
                          >
                            Yes, Clear
                          </button>
                          <button
                            type="button"
                            data-preview-static="step6-reset-cancel"
                            onClick={() => setConfirmResetOpen(false)}
                            className="border-0 bg-transparent px-1.5 text-[11px] font-semibold text-[var(--lux-text)] underline"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {copiedNotice && (
                      <p
                        role="status"
                        aria-live="polite"
                        data-preview-static="step6-copy-status"
                        className="m-0 text-xs font-semibold text-[var(--lux-tropical)]"
                      >
                        {copiedNotice}
                      </p>
                    )}
                  </div>
                )}

                {/* Validation Error Banner */}
                {stepError && (
                  <p
                    role="alert"
                    data-preview-static="planner-step-error"
                    className="mt-5 rounded border border-red-400/50 bg-red-500/10 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-300"
                  >
                    {stepError}
                  </p>
                )}

                {/* Back & Next Controls */}
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--lux-border)] pt-5">
                  <button
                    type="button"
                    data-preview-static="planner-back-btn"
                    disabled={step === 1}
                    onClick={() => goToStep(step - 1)}
                    className={`lux-btn-outline ${step === 1 ? 'cursor-not-allowed opacity-45' : ''}`}
                  >
                    ← Back
                  </button>

                  <span data-preview-static="planner-step-counter" className="text-xs font-medium text-[var(--lux-text-muted)]">
                    Step {step} of 6
                  </span>

                  {step < 6 ? (
                    <button
                      type="button"
                      data-preview-static="planner-next-btn"
                      onClick={() => goToStep(step + 1)}
                      className="lux-btn-tropical"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <span data-preview-static="planner-ready-label" className="font-display text-xs font-bold uppercase tracking-[0.12em] text-[var(--lux-tropical)]">
                      Ready to Send
                    </span>
                  )}
                </div>
              </div>

              {/* Right 4 Columns: Sticky Desktop Live Trip Summary */}
              <aside className="hidden lg:col-span-4 lg:block">
                <div className="sticky top-24 rounded-[6px] border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-sm)]">
                  <div className="mb-4 flex items-center justify-between gap-2 border-b border-[var(--lux-border)] pb-3">
                    <EditableText
                      as="h2"
                      className="font-display m-0 text-base font-bold uppercase tracking-[0.1em] text-[var(--lux-text)]"
                      data-preview-field-path="planTripPage.summaryHeading"
                      defaultValue={summaryHeading}
                    />
                    <span data-preview-static="sum-step-pill" className="rounded bg-[#154C42]/12 px-2 py-0.5 text-[10.5px] font-bold text-[var(--lux-tropical)]">
                      {step}/6
                    </span>
                  </div>

                  {renderTripSummaryBody()}

                  <div className="mt-5 border-t border-[var(--lux-border)] pt-4">
                    <p data-preview-static="sum-honest-hint" className="m-0 text-[11px] leading-relaxed text-[var(--lux-text-muted)]">
                      No payment or passport info required. Jump to Step 6 anytime to review and send via WhatsApp or email.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          FIVORA EDITOR PREVIEW: ALL 6 PLANNER STEPS VISIBLY EDITABLE AT ONCE
          ═══════════════════════════════════════════════════════════════════ */}
      {isEditorPreview && (
        <section className="lux-section bg-[var(--lux-bg)]" data-design-section="planner-editor-preview">
          <div className="lux-container space-y-6">
            <div className="rounded-[6px] border border-dashed border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6">
              <strong
                data-preview-static="planner-editor-overview-heading"
                className="font-display mb-1 block text-xs uppercase tracking-[0.18em] text-[#C5A46D]"
              >
                Multi-Step Trip Planner — Full Fivora Editing Surface
              </strong>
              <p data-preview-static="planner-editor-overview-note" className="m-0 text-xs text-[var(--lux-text-muted)]">
                Live visitors step through Steps 1–6 interactively. All step headings, instructions, option lists, and CTA labels are displayed here for direct visual editing.
              </p>
            </div>

            {/* Step 1 Editable Surface */}
            <div className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-5 space-y-3">
              <EditableText
                as="h2"
                className="font-display m-0 text-lg font-bold"
                data-preview-field-path="planTripPage.step1Title"
                defaultValue={contentText(page.step1Title) || 'Step 1 — Journey Type'}
              />
              <EditableText
                as="p"
                className="m-0 text-xs text-[var(--lux-text-muted)]"
                data-preview-field-path="planTripPage.step1Subtitle"
                defaultValue={contentText(page.step1Subtitle)}
              />
              <div
                data-preview-list-path="planTripPage.journeyOptions"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
              >
                {contentList(page.journeyOptions).length === 0 && (
                  <p data-preview-static="planner-journey-options-empty" className="col-span-full m-0 text-xs text-[var(--lux-text-muted)]">
                    No journey type cards configured yet. Add options in Fivora.
                  </p>
                )}
                {contentList(page.journeyOptions).map((raw, idx) => {
                  const opt = contentObject(raw);
                  return (
                    <div
                      key={idx}
                      data-preview-item-path={`planTripPage.journeyOptions[${idx}]`}
                      className="rounded border border-[var(--lux-border)] bg-[var(--lux-bg)] p-3 text-xs space-y-1"
                    >
                      <span
                        data-preview-field-path={`planTripPage.journeyOptions[${idx}].badge`}
                        className="block text-[10px] font-bold uppercase text-[#C5A46D]"
                      >
                        {contentText(opt.badge)}
                      </span>
                      <strong data-preview-field-path={`planTripPage.journeyOptions[${idx}].title`} className="block">
                        {contentText(opt.title)}
                      </strong>
                      <p data-preview-field-path={`planTripPage.journeyOptions[${idx}].description`} className="m-0 text-[var(--lux-text-muted)]">
                        {contentText(opt.description)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Steps 2–5 Editable Configuration */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-5 space-y-2 text-xs">
                <EditableText
                  as="h2"
                  className="font-display m-0 text-base font-bold"
                  data-preview-field-path="planTripPage.step2Title"
                  defaultValue={contentText(page.step2Title) || 'Step 2 — Destinations & Style'}
                />
                <EditableText
                  as="p"
                  className="m-0 text-[var(--lux-text-muted)]"
                  data-preview-field-path="planTripPage.step2Subtitle"
                  defaultValue={contentText(page.step2Subtitle)}
                />
                <div>
                  <span data-preview-static="planner-editor-outbound-lbl" className="font-semibold">Outbound destinations: </span>
                  <span data-preview-field-path="planTripPage.outboundDestinations">
                    {contentText(page.outboundDestinations)}
                  </span>
                </div>
                <div>
                  <span data-preview-static="planner-editor-styles-lbl" className="font-semibold">Travel styles: </span>
                  <span data-preview-field-path="planTripPage.travelStyleOptions">
                    {contentText(page.travelStyleOptions)}
                  </span>
                </div>
              </div>

              <div className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-5 space-y-2 text-xs">
                <EditableText
                  as="h2"
                  className="font-display m-0 text-base font-bold"
                  data-preview-field-path="planTripPage.step3Title"
                  defaultValue={contentText(page.step3Title) || 'Step 3 — Dates & Travellers'}
                />
                <EditableText
                  as="p"
                  className="m-0 text-[var(--lux-text-muted)]"
                  data-preview-field-path="planTripPage.step3Subtitle"
                  defaultValue={contentText(page.step3Subtitle)}
                />
                <div>
                  <span data-preview-static="planner-editor-pickup-lbl" className="font-semibold">Pickup cities: </span>
                  <span data-preview-field-path="planTripPage.pickupCities">
                    {contentText(page.pickupCities)}
                  </span>
                </div>
              </div>

              <div className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-5 space-y-2 text-xs">
                <EditableText
                  as="h2"
                  className="font-display m-0 text-base font-bold"
                  data-preview-field-path="planTripPage.step4Title"
                  defaultValue={contentText(page.step4Title) || 'Step 4 — Budget & Stay'}
                />
                <EditableText
                  as="p"
                  className="m-0 text-[var(--lux-text-muted)]"
                  data-preview-field-path="planTripPage.step4Subtitle"
                  defaultValue={contentText(page.step4Subtitle)}
                />
                <div>
                  <span data-preview-static="planner-editor-currencies-lbl" className="font-semibold">Supported currencies: </span>
                  <span data-preview-field-path="planTripPage.supportedCurrencies">
                    {contentText(page.supportedCurrencies)}
                  </span>
                </div>
              </div>

              <div className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-5 space-y-2 text-xs">
                <EditableText
                  as="h2"
                  className="font-display m-0 text-base font-bold"
                  data-preview-field-path="planTripPage.step5Title"
                  defaultValue={contentText(page.step5Title) || 'Step 5 — Experiences & Notes'}
                />
                <EditableText
                  as="p"
                  className="m-0 text-[var(--lux-text-muted)]"
                  data-preview-field-path="planTripPage.step5Subtitle"
                  defaultValue={contentText(page.step5Subtitle)}
                />
              </div>
            </div>

            {/* Step 6 & Summary Editable Configuration */}
            <div className="rounded-[6px] border border-[var(--lux-border)] bg-[var(--lux-surface)] p-5 space-y-3 text-xs">
              <EditableText
                as="h2"
                className="font-display m-0 text-base font-bold"
                data-preview-field-path="planTripPage.step6Title"
                defaultValue={contentText(page.step6Title) || 'Step 6 — Review & Send'}
              />
              <EditableText
                as="p"
                className="m-0 text-[var(--lux-text-muted)]"
                data-preview-field-path="planTripPage.step6Subtitle"
                defaultValue={contentText(page.step6Subtitle)}
              />
              <div>
                <span data-preview-static="planner-editor-summary-lbl" className="font-semibold">Summary heading: </span>
                <span data-preview-field-path="planTripPage.summaryHeading">{summaryHeading}</span>
              </div>
              <p data-preview-field-path="planTripPage.inquiryNotice" className="m-0 text-[var(--lux-text-muted)]">
                {inquiryNotice}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <span data-preview-field-path="planTripPage.whatsappCtaLabel" className="lux-btn-sunset">
                  {whatsappCtaLabel}
                </span>
                <span data-preview-field-path="planTripPage.emailCtaLabel" className="lux-btn-tropical">
                  {emailCtaLabel}
                </span>
                <span data-preview-field-path="planTripPage.copyCtaLabel" className="lux-btn-outline">
                  {copyCtaLabel}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

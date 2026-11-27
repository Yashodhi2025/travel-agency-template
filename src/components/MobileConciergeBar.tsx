'use client';

import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import { buildWhatsAppEnquiryUrl, sanitizePhoneDigits } from '@/lib/travelHelpers';
import { withBasePath } from '@/lib/utils';

/**
 * Compact mobile-only bottom concierge bar.
 * - Hidden in Fivora editor preview mode so it never interferes with editor selection controls.
 * - Only displays Call / WhatsApp links when valid merchant contact details exist.
 */
export function MobileConciergeBar() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();

  if (isEditorPreview) return null;

  const content = contentObject(siteData?.content);
  const contact = contentObject(content.contact);
  const common = contentObject(content.common);
  const shop = contentObject(siteData?.shop);
  const shopContact = contentObject(shop.contact);

  const phone =
    contentText(shopContact.phone) ||
    contentText(shop.businessPhone) ||
    contentText(contact.phone);
  const whatsapp =
    contentText(shopContact.whatsapp) ||
    contentText(shop.businessWhatsapp) ||
    contentText(contact.whatsapp) ||
    phone;
  const brand = contentText(common.websiteTitle) || 'your agency';

  const phoneDigits = sanitizePhoneDigits(phone);
  const whatsappHref = buildWhatsAppEnquiryUrl(
    whatsapp,
    `Hello ${brand}, I would like to discuss a tailor-made Sri Lanka journey.`,
  );

  const selectedPages = Array.isArray(siteData?.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData?.template?.structure?.pages || [
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
  const planHref = selectedPages.includes('plan_your_trip') ? '/plan-your-trip/' : '/#tailor-made';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around gap-1.5 border-t border-[var(--lux-border-strong)] bg-[var(--lux-bg)]/95 px-3 py-2 shadow-lg backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {phoneDigits.length >= 7 && (
        <a
          href={`tel:${phone}`}
          data-preview-static="mobile-bar-call"
          className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded border border-[var(--lux-border-strong)] px-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--lux-text)] no-underline"
        >
          Call
        </a>
      )}
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          data-preview-static="mobile-bar-whatsapp"
          className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded border border-[#154C42] bg-[#154C42] px-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#FAF8F3] no-underline"
        >
          WhatsApp
        </a>
      )}
      <a
        href={withBasePath(planHref)}
        data-preview-static="mobile-bar-plan"
        className="flex min-h-[40px] flex-1 items-center justify-center rounded bg-[#FF783D] px-2 text-xs font-semibold uppercase tracking-[0.08em] text-white no-underline"
      >
        Plan Trip
      </a>
    </div>
  );
}

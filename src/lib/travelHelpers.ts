'use client';

export interface TripEnquiryDraft {
  destination?: string;
  travelStyle?: string;
  duration?: string;
  travellers?: string;
  travelDate?: string;
  budget?: string;
  packageName?: string;
  serviceName?: string;
}

const DRAFT_STORAGE_KEY = 'ceylon_odyssey_trip_draft_v1';

export function saveTripEnquiryDraft(draft: TripEnquiryDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore restricted storage contexts.
  }
}

export function readTripEnquiryDraft(): TripEnquiryDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as TripEnquiryDraft) : null;
  } catch {
    return null;
  }
}

export function sanitizeHref(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const href = value.trim();
  if (!href || /[\u0000-\u0020\u007f]/.test(href)) return undefined;
  if (/^[a-z][a-z\d+.-]*:/i.test(href) && !/^(https?:|mailto:|tel:)/i.test(href)) {
    return undefined;
  }
  return href;
}

export function sanitizePhoneDigits(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/[^\d]/g, '');
}

export function buildWhatsAppEnquiryUrl(phone: string | undefined | null, message: string): string | null {
  const digits = sanitizePhoneDigits(phone);
  if (digits.length < 7) return null;
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${digits}?text=${encoded}`;
}

export function buildMailtoEnquiryUrl(
  email: string | undefined | null,
  subject: string,
  body: string,
): string | null {
  const clean = email?.trim() ?? '';
  if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return null;
  return `mailto:${encodeURIComponent(clean)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function formatMoney(amount: number, currency = 'USD'): string {
  const safeCurrency = currency.trim() || 'USD';
  if (!Number.isFinite(amount)) return `${safeCurrency} 0`;
  return `${safeCurrency} ${amount.toLocaleString('en-US')}`;
}

export function splitDelimitedItems(raw: string | undefined | null): string[] {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(/\s*[|•\n]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function extractDaysCount(duration: string | undefined | null): number | null {
  if (!duration) return null;
  const match = duration.match(/(\d+)\s*(?:days?|nights?)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

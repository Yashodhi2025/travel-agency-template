'use client';

import { formatLocalizedNumber } from './i18n';
import { withBasePath } from './utils';

export interface TripEnquiryDraft {
  travelType?: 'Domestic' | 'Inbound' | 'Outbound';
  destination?: string;
  travelStyle?: string;
  duration?: string;
  travellers?: string;
  travelDate?: string;
  budget?: string;
  pickupLocation?: string;
  accommodation?: string;
  packageName?: string;
  serviceName?: string;
  offerName?: string;
  experienceName?: string;
}

const DRAFT_STORAGE_KEY = 'ceylon_odyssey_trip_draft_v2';

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

export function slugifyKey(value: string | undefined | null): string {
  if (!value || typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves a stable identifier for merchant-added destinations or experiences,
 * falling back to a URL-safe slug of the title or numeric index so items added
 * in Fivora without an explicit `id` field can still open on detail pages.
 */
export function resolveItemIdentifier(
  id: string | undefined | null,
  fallbackTitle: string | undefined | null,
  index: number,
): string {
  const cleanId = slugifyKey(id);
  if (cleanId) return cleanId;
  const slugTitle = slugifyKey(fallbackTitle);
  if (slugTitle) return slugTitle;
  return String(index);
}

export function destinationDetailHref(
  id: string | undefined | null,
  name: string | undefined | null,
  index: number,
): string {
  const key = resolveItemIdentifier(id, name, index);
  return withBasePath(`/destinations/detail/?id=${encodeURIComponent(key)}`);
}

export function experienceDetailHref(
  id: string | undefined | null,
  title: string | undefined | null,
  index: number,
): string {
  const key = resolveItemIdentifier(id, title, index);
  return withBasePath(`/experiences/detail/?id=${encodeURIComponent(key)}`);
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

export function formatMoney(amount: number, currency = 'LKR'): string {
  const safeCurrency = currency.trim() || 'LKR';
  if (!Number.isFinite(amount)) return `${safeCurrency} 0`;
  return `${safeCurrency} ${formatLocalizedNumber(amount)}`;
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

export function parseOfferDeadline(raw: string | undefined | null): number | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const dateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const ts = Date.parse(`${trimmed}T23:59:59+05:30`);
    return Number.isFinite(ts) ? ts : null;
  }
  const ts = Date.parse(trimmed);
  return Number.isFinite(ts) ? ts : null;
}

export function formatCountdownParts(remainingSeconds: number): {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
} {
  const clamped = Math.max(0, Math.floor(remainingSeconds));
  const days = Math.floor(clamped / 86400);
  const hours = Math.floor((clamped % 86400) / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

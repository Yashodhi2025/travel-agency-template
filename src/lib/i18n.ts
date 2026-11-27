/**
 * Future-ready localization foundation for English, Sinhala, and Tamil.
 * Stage 2 uses English ('en') by default without exposing non-functional UI switches.
 * Stage 3+ can connect full locale dictionaries and Fivora multi-language fields here.
 */
export type SupportedLocale = 'en' | 'si' | 'ta';

export interface LocaleConfig {
  code: SupportedLocale;
  bcp47: string;
  label: string;
  nativeLabel: string;
  direction: 'ltr';
  defaultCurrency: 'LKR' | 'USD';
}

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleConfig> = {
  en: {
    code: 'en',
    bcp47: 'en-LK',
    label: 'English',
    nativeLabel: 'English',
    direction: 'ltr',
    defaultCurrency: 'LKR',
  },
  si: {
    code: 'si',
    bcp47: 'si-LK',
    label: 'Sinhala',
    nativeLabel: 'සිංහල',
    direction: 'ltr',
    defaultCurrency: 'LKR',
  },
  ta: {
    code: 'ta',
    bcp47: 'ta-LK',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    direction: 'ltr',
    defaultCurrency: 'LKR',
  },
};

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export function formatLocalizedNumber(
  value: number,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  if (!Number.isFinite(value)) return '0';
  try {
    return new Intl.NumberFormat(SUPPORTED_LOCALES[locale].bcp47).format(value);
  } catch {
    return value.toLocaleString('en-US');
  }
}

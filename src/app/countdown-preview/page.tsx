'use client';

import { useEffect, useState } from 'react';
import {
  isSafeExternalLink,
  useComponentStyle,
  useSiteData,
  withBasePath,
} from '@deneb-ui/ui';
import { contentObject, contentText } from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function normalizeDeadline(value: string): string {
  const match = value
    .trim()
    .match(/^(\d{1,2}) ([a-z]{3}) (\d{4}), (\d{1,2}):(\d{2})(?::(\d{2}))? (AM|PM) (Z|[+-]\d{2}:\d{2})$/i);
  if (!match) return value.trim();
  const [, day, month, year, hour, minute, second = '00', period, offset] = match;
  const monthIndex = MONTHS.findIndex((name) => name.toLowerCase() === month.toLowerCase());
  if (monthIndex < 0 || Number(hour) < 1 || Number(hour) > 12) return '';
  const h = (Number(hour) % 12) + (period.toUpperCase() === 'PM' ? 12 : 0);
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${day.padStart(2, '0')}T${String(h).padStart(2, '0')}:${minute}:${second}${offset.toUpperCase()}`;
}

function parseDeadline(value: string): number | null {
  const normalized = normalizeDeadline(value);
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-](\d{2}):(\d{2}))$/,
  );
  if (!match) return null;
  const [, year, month, day, hour, minute, second, , , offsetHour, offsetMinute] = match;
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    m < 1 ||
    m > 12 ||
    d < 1 ||
    d > days[m - 1] ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second ?? 0) > 59 ||
    Number(offsetHour ?? 0) > 23 ||
    Number(offsetMinute ?? 0) > 59
  ) {
    return null;
  }
  const timestamp = Date.parse(normalized);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function CountdownTimerCard() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const home = contentObject(content.home);
  const countdown = contentObject(home.countdown);

  const heading = contentText(countdown.heading) || 'Flash Sale';
  const subtitle = contentText(countdown.subtitle) || 'Hurry! Offers end soon.';
  const deadline = contentText(countdown.deadline);
  const expiryMessage = contentText(countdown.expiryMessage) || 'The countdown has ended.';
  const ctaLabel = contentText(countdown.ctaLabel) || 'Learn more';
  const ctaUrl = contentText(countdown.ctaUrl).trim();
  const href =
    isSafeExternalLink(ctaUrl) && !/[\u0000-\u0020\u007f\\]/.test(ctaUrl)
      ? withBasePath(ctaUrl)
      : undefined;

  const target = parseDeadline(deadline);
  const [clock, setClock] = useState<{ target: number; remaining: number } | null>(null);
  const remaining = target !== null && clock?.target === target ? clock.remaining : null;
  const expired = remaining === 0;

  const { cssVars: cardVars } = useComponentStyle('home.countdown.card', 'card');
  const { cssVars: textVars } = useComponentStyle('home.countdown.text', 'text');
  const { cssVars: headingVars } = useComponentStyle('home.countdown.heading', 'text', { color: '#ff570a' });
  const { cssVars: digitCardVars } = useComponentStyle('home.countdown.digits.card', 'card', {
    backgroundColor: '#ffffff',
    borderRadius: 16,
  });
  const { cssVars: digitTextVars } = useComponentStyle('home.countdown.digits.text', 'text', { color: '#181a1d' });
  const { cssVars: ctaVars } = useComponentStyle('home.countdown.cta', 'button', {
    backgroundColor: '#ff570a',
    textColor: '#ffffff',
    borderRadius: 999,
  });

  useEffect(() => {
    if (target === null) {
      setClock(null);
      return;
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      const seconds = Math.max(0, Math.ceil((target - Date.now()) / 1000));
      setClock({ target, remaining: seconds });
      if (seconds === 0 && timer !== undefined) {
        clearInterval(timer);
      }
      return seconds;
    };
    if (update() > 0) {
      timer = setInterval(update, 1000);
    }
    return () => {
      if (timer !== undefined) clearInterval(timer);
    };
  }, [target]);

  const seconds = remaining ?? 0;
  const units: Array<[string, number]> = [
    ['Days', Math.floor(seconds / 86400)],
    ['Hours', Math.floor(seconds / 3600) % 24],
    ['Minutes', Math.floor(seconds / 60) % 60],
    ['Seconds', seconds % 60],
  ];

  return (
    <section
      data-preview-style-target="home.countdown.card"
      data-preview-style-type="card"
      style={{
        boxSizing: 'border-box',
        width: '100%',
        minWidth: 0,
        paddingTop: 'var(--deneb-card-pt, clamp(2rem, 5vw, 3rem))',
        paddingBottom: 'var(--deneb-card-pb, clamp(2rem, 5vw, 3rem))',
        paddingLeft: 'var(--deneb-card-pl, clamp(1rem, 3vw, 2rem))',
        paddingRight: 'var(--deneb-card-pr, clamp(1rem, 3vw, 2rem))',
        borderRadius: 'var(--deneb-card-radius, 24px)',
        background: 'var(--deneb-card-bg, #24272d)',
        ...cardVars,
      }}
    >
      <div
        data-preview-style-target="home.countdown.text"
        data-preview-style-type="text"
        style={{
          ...textVars,
          color: 'var(--deneb-color, #ffffff)',
          textAlign: 'center',
          overflowWrap: 'anywhere',
        }}
      >
        <h2
          data-preview-field-path="home.countdown.heading"
          data-preview-style-target="home.countdown.heading"
          data-preview-style-type="text"
          style={{
            ...headingVars,
            margin: '0 0 1rem',
            color: 'var(--deneb-color, #ff570a)',
            fontSize: 'var(--deneb-font-size, clamp(2rem, 5vw, 3.5rem))',
            fontWeight: 750,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
          }}
        >
          {heading}
        </h2>
        <p
          data-preview-field-path="home.countdown.subtitle"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', margin: '0 0 2rem' }}
        >
          {subtitle}
        </p>

        <div
          role="timer"
          aria-live="off"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 'clamp(0.65rem, 2.5vw, 1.5rem)',
            maxWidth: 480,
            margin: '0 auto 1.25rem',
          }}
        >
          {units.map(([label, value], index) => (
            <div key={label} style={{ minWidth: 0, position: 'relative' }}>
              {index > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 'calc(clamp(0.65rem, 2.5vw, 1.5rem) / -2)',
                    transform: 'translateX(-50%)',
                    top: '0.65rem',
                    fontSize: 'clamp(1.3rem, 4vw, 2rem)',
                    opacity: 0.75,
                  }}
                >
                  :
                </span>
              )}
              <div
                data-preview-style-target="home.countdown.digits.card"
                data-preview-style-type="card"
                style={{
                  ...digitCardVars,
                  background: 'var(--deneb-card-bg, #ffffff)',
                  borderRadius: 'var(--deneb-card-radius, 16px)',
                  padding: '1rem 0.2rem',
                  boxShadow: '0 4px 12px #00000012',
                }}
              >
                <span
                  data-preview-style-target="home.countdown.digits.text"
                  data-preview-style-type="text"
                  style={{
                    ...digitTextVars,
                    display: 'block',
                    color: 'var(--deneb-color, #181a1d)',
                    fontSize: 'clamp(1.25rem, 4vw, 2.25rem)',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 700,
                  }}
                >
                  {remaining === null ? '--' : String(value).padStart(2, '0')}
                </span>
              </div>
              <span
                data-preview-static={`countdown-unit-${label.toLowerCase()}`}
                style={{
                  display: 'block',
                  marginTop: 10,
                  fontSize: 'clamp(0.65rem, 2vw, 0.85rem)',
                  opacity: 0.8,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, opacity: 0.75, margin: '0 0 1.25rem' }}>
          <span data-preview-static="countdown-ends-prefix">Ends </span>
          <span data-preview-field-path="home.countdown.deadline">
            {target === null ? deadline || 'Set a deadline' : normalizeDeadline(deadline)}
          </span>
        </p>

        {target === null && (
          <p role="status" data-preview-static="countdown-deadline-format-hint" style={{ fontSize: 12, opacity: 0.8, margin: '0 0 1rem' }}>
            Use e.g. 01 Dec 2026, 11:59 PM +05:30, or an ISO date with a timezone.
          </p>
        )}

        {(expired || isEditorPreview) && (
          <p
            role={expired ? 'status' : undefined}
            style={{
              fontSize: '0.9rem',
              opacity: expired ? 1 : 0.85,
              margin: '0 0 1.25rem',
            }}
          >
            {!expired && isEditorPreview && (
              <span data-preview-static="countdown-expiry-preview-label">Expiry message: </span>
            )}
            <span data-preview-field-path="home.countdown.expiryMessage">
              {expiryMessage}
            </span>
          </p>
        )}

        <a
          href={href || '#sale-collection'}
          aria-disabled={!href || undefined}
          data-preview-field-path="home.countdown.ctaUrl"
          data-preview-style-target="home.countdown.cta"
          data-preview-style-type="button"
          style={{
            ...ctaVars,
            display: 'inline-block',
            maxWidth: '100%',
            background: 'var(--deneb-btn-bg, #ff570a)',
            color: 'var(--deneb-btn-color, #ffffff)',
            padding: 'var(--deneb-btn-py, 1rem) var(--deneb-btn-px, 2rem)',
            borderRadius: 'var(--deneb-btn-radius, 999px)',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 6px 20px #00000020',
          }}
        >
          <span data-preview-field-path="home.countdown.ctaLabel">{ctaLabel}</span>
        </a>
      </div>
    </section>
  );
}

export default function CountdownPreviewPage() {
  return (
    <div data-preview-page-key="countdown_preview" style={{ background: '#eff6ff', color: '#192e2c' }}>
      <section data-design-section="flash-sale" style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(2rem, 6vw, 5rem) 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(2rem, 5vw, 4rem)' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <p data-preview-static="sale-eyebrow" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              The seasonal edit · Limited time
            </p>
            <h1 data-preview-static="sale-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.06, letterSpacing: '-0.05em', margin: '1.25rem 0' }}>
              Everyday essentials.<br />Extraordinary prices.
            </h1>
            <p data-preview-static="sale-description" style={{ maxWidth: 460, fontSize: 18, lineHeight: 1.7, color: '#52625e' }}>
              Refresh your routine with thoughtfully selected pieces. Save up to 30% on our seasonal favourites while the offer lasts.
            </p>
            <div aria-hidden="true" style={{ marginTop: 28, padding: 32, borderRadius: 20, background: '#e4e9df', display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 400 180" style={{ width: '100%', maxWidth: 400 }} fill="none">
                <ellipse cx="200" cy="158" rx="155" ry="12" fill="#c5cec0" />
                <path d="M56 56h83l12 91H44z" fill="#426b5d" />
                <path d="M74 59V40c0-29 47-29 47 0v19" stroke="#264b3c" strokeWidth="8" />
                <rect x="181" y="35" width="60" height="119" rx="22" fill="#c28c62" />
                <rect x="194" y="20" width="34" height="23" rx="7" fill="#283f36" />
                <path d="M279 84h65v61c0 16-65 16-65 0z" fill="#faf7ee" />
                <path d="M344 95h13c24 0 24 37 0 37h-13" stroke="#faf7ee" strokeWidth="12" />
                <path d="M293 65c-13-15 13-17 0-32M317 65c-13-15 13-17 0-32" stroke="#b4c1ae" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <CountdownTimerCard />
            <p data-preview-static="sale-terms" style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#52625e' }}>
              Selected styles only. Offer ends at the deadline shown. While stocks last.
            </p>
          </div>
        </div>
      </section>
      <section id="sale-collection" style={{ padding: '2rem 1.25rem', textAlign: 'center', borderTop: '1px solid #d8ded4' }}>
        <h2 data-preview-static="sale-collection-heading" style={{ fontSize: 24, color: 'inherit' }}>
          Considered details. Everyday favourites.
        </h2>
        <p data-preview-static="sale-collection-copy">
          Discover the seasonal collection: carry essentials, reusable drinkware, and home accessories.
        </p>
      </section>
    </div>
  );
}

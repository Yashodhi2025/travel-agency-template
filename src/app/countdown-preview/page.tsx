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

  const heading = contentText(countdown.heading) || 'Seasonal Booking Window';
  const subtitle = contentText(countdown.subtitle) || 'Configure a genuine seasonal offer or departure window.';
  const deadline = contentText(countdown.deadline);
  const expiryMessage = contentText(countdown.expiryMessage) || 'This seasonal window has concluded.';
  const ctaLabel = contentText(countdown.ctaLabel) || 'Explore Journeys';
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
  const { cssVars: headingVars } = useComponentStyle('home.countdown.heading', 'text', { color: '#FF783D' });
  const { cssVars: digitCardVars } = useComponentStyle('home.countdown.digits.card', 'card', {
    backgroundColor: '#FAF9F6',
    borderRadius: 8,
  });
  const { cssVars: digitTextVars } = useComponentStyle('home.countdown.digits.text', 'text', { color: '#101820' });
  const { cssVars: ctaVars } = useComponentStyle('home.countdown.cta', 'button', {
    backgroundColor: '#FF783D',
    textColor: '#FFFFFF',
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
        paddingLeft: 'var(--deneb-card-pl, clamp(1.25rem, 3vw, 2.25rem))',
        paddingRight: 'var(--deneb-card-pr, clamp(1.25rem, 3vw, 2.25rem))',
        borderRadius: 'var(--deneb-card-radius, 8px)',
        border: '1px solid rgba(198, 164, 106, 0.35)',
        background: 'var(--deneb-card-bg, #102D25)',
        ...cardVars,
      }}
    >
      <div
        data-preview-style-target="home.countdown.text"
        data-preview-style-type="text"
        style={{
          ...textVars,
          color: 'var(--deneb-color, #F7F3EA)',
          textAlign: 'center',
          overflowWrap: 'anywhere',
        }}
      >
        <h2
          data-preview-field-path="home.countdown.heading"
          data-preview-style-target="home.countdown.heading"
          data-preview-style-type="text"
          className="font-editorial"
          style={{
            ...headingVars,
            margin: '0 0 0.85rem',
            color: 'var(--deneb-color, #C6A46A)',
            fontSize: 'var(--deneb-font-size, clamp(1.75rem, 4vw, 2.75rem))',
            fontWeight: 500,
            lineHeight: 1.15,
          }}
        >
          {heading}
        </h2>
        <p
          data-preview-field-path="home.countdown.subtitle"
          style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', opacity: 0.85, margin: '0 0 2rem' }}
        >
          {subtitle}
        </p>

        <div
          role="timer"
          aria-live="off"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 'clamp(0.5rem, 2vw, 1rem)',
            maxWidth: 460,
            margin: '0 auto 1.25rem',
          }}
        >
          {units.map(([label, value]) => (
            <div key={label} style={{ minWidth: 0 }}>
              <div
                data-preview-style-target="home.countdown.digits.card"
                data-preview-style-type="card"
                style={{
                  ...digitCardVars,
                  background: 'var(--deneb-card-bg, #F7F3EA)',
                  borderRadius: 'var(--deneb-card-radius, 6px)',
                  padding: '0.95rem 0.25rem',
                }}
              >
                <span
                  data-preview-style-target="home.countdown.digits.text"
                  data-preview-style-type="text"
                  className="font-editorial"
                  style={{
                    ...digitTextVars,
                    display: 'block',
                    color: 'var(--deneb-color, #102D25)',
                    fontSize: 'clamp(1.25rem, 4vw, 2.2rem)',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 600,
                  }}
                >
                  {remaining === null ? '--' : String(value).padStart(2, '0')}
                </span>
              </div>
              <span
                data-preview-static={`countdown-unit-${label.toLowerCase()}`}
                style={{
                  display: 'block',
                  marginTop: 8,
                  fontSize: '0.7rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  opacity: 0.8,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, opacity: 0.78, margin: '0 0 1.25rem' }}>
          <span data-preview-static="countdown-ends-prefix">Ends </span>
          <span data-preview-field-path="home.countdown.deadline">
            {target === null ? deadline || 'Set a deadline' : normalizeDeadline(deadline)}
          </span>
        </p>

        {target === null && (
          <p role="status" data-preview-static="countdown-deadline-format-hint" style={{ fontSize: 12, opacity: 0.8, margin: '0 0 1rem' }}>
            Use ISO format with a timezone offset, e.g. 2026-12-31T23:59+05:30.
          </p>
        )}

        {(expired || isEditorPreview) && (
          <p
            role={expired ? 'status' : undefined}
            style={{
              fontSize: '0.88rem',
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
          href={href || withBasePath('/#packages')}
          aria-disabled={!href || undefined}
          data-preview-field-path="home.countdown.ctaUrl"
          data-preview-style-target="home.countdown.cta"
          data-preview-style-type="button"
          style={{
            ...ctaVars,
            display: 'inline-block',
            maxWidth: '100%',
            background: 'var(--deneb-btn-bg, #C6A46A)',
            color: 'var(--deneb-btn-color, #101917)',
            padding: 'var(--deneb-btn-py, 0.85rem) var(--deneb-btn-px, 1.85rem)',
            borderRadius: 'var(--deneb-btn-radius, 2px)',
            fontSize: '0.78rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 600,
            textDecoration: 'none',
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
    <div data-preview-page-key="countdown_preview" className="lux-section">
      <section data-design-section="flash-sale" className="lux-container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p
              data-preview-static="sale-eyebrow"
              className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
            >
              Seasonal Journey Window · Illustrative Preview
            </p>
            <h1
              data-preview-static="sale-title"
              className="font-editorial m-0 mb-5 text-4xl font-medium leading-[1.08] text-[var(--lux-text)] sm:text-5xl"
            >
              Plan Ahead for Sri Lanka&apos;s Prime Seasons.
            </h1>
            <p
              data-preview-static="sale-description"
              className="m-0 max-w-lg text-base leading-relaxed text-[var(--lux-text-muted)]"
            >
              Configure genuine seasonal early-booking windows, festive departure cutoffs, or curated villa offers without artificial urgency.
            </p>
          </div>
          <div className="lg:col-span-6">
            <CountdownTimerCard />
            <p
              data-preview-static="sale-terms"
              className="mt-4 text-center text-xs text-[var(--lux-text-muted)]"
            >
              Illustrative demonstration countdown. Replace with verified merchant dates in Fivora.
            </p>
          </div>
        </div>
      </section>
      <section
        id="sale-collection"
        className="lux-container mt-14 border-t border-[var(--lux-border)] pt-10 text-center"
      >
        <h2
          data-preview-static="sale-collection-heading"
          className="font-editorial m-0 mb-2 text-2xl font-medium text-[var(--lux-text)]"
        >
          Curated Across Highlands, Wildlife &amp; Coast
        </h2>
        <p data-preview-static="sale-collection-copy" className="m-0 text-sm text-[var(--lux-text-muted)]">
          Pair seasonal windows with tailor-made itineraries across the Cultural Triangle, Ella, Yala, and Galle Fort.
        </p>
      </section>
    </div>
  );
}

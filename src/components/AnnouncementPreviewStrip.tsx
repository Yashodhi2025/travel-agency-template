'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  contentList,
  contentObject,
  contentText,
  useSiteData,
} from '@/lib/siteDataContext';
import { useIsEditorPreview } from '@/lib/useIsEditorPreview';
import {
  DENEB_PREVIEW_FOCUS_MESSAGE,
  LEGACY_PREVIEW_FOCUS_MESSAGE,
  PREVIEW_FOCUS_MESSAGE,
  resolveParentOrigin,
} from '@deneb-ui/ui';

type AnnouncementItem = {
  text: string;
  badge: string;
  icon: string;
  linkLabel: string;
  linkUrl: string;
};

const LIST_PATH = 'announcementBarPreview.announcements';

function safeHref(value: string): string | undefined {
  const href = value.trim();
  if (!href || /[\u0000-\u0020\u007f]/.test(href)) {
    return undefined;
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(href) && !/^(https?:|mailto:|tel:)/i.test(href)) {
    return undefined;
  }
  return href;
}

export default function AnnouncementPreviewStrip() {
  const siteData = useSiteData();
  const isEditorPreview = useIsEditorPreview();
  const content = contentObject(siteData?.content);
  const previewSection = contentObject(content.announcementBarPreview);
  const announcements: AnnouncementItem[] = contentList(previewSection.announcements).map((raw) => {
    const item = contentObject(raw);
    return {
      text: contentText(item.text),
      badge: contentText(item.badge),
      icon: contentText(item.icon),
      linkLabel: contentText(item.linkLabel),
      linkUrl: contentText(item.linkUrl),
    };
  });

  const count = announcements.length;
  const [activeSlide, setActiveSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inspectedPath, setInspectedPath] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const slidesId = useId();

  const activeIndex = count > 0 ? Math.min(activeSlide, count - 1) : 0;
  const inspectedIndex = inspectedPath?.startsWith(`${LIST_PATH}[`)
    ? Number(inspectedPath.slice(LIST_PATH.length + 1).split(']')[0])
    : -1;
  const inspectorPaused = inspectedIndex >= 0 && inspectedIndex < count;
  const rotating =
    !isEditorPreview &&
    count > 1 &&
    !hovered &&
    !focused &&
    !paused &&
    !inspectorPaused &&
    !reducedMotion;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setActiveSlide((current) => (count > 0 ? Math.min(current, count - 1) : 0));
  }, [count]);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % count);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [rotating, count]);

  useEffect(() => {
    let parentOrigin = resolveParentOrigin();
    let frame = 0;

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || !event.data || typeof event.data !== 'object') {
        return;
      }
      if (
        ![
          PREVIEW_FOCUS_MESSAGE,
          DENEB_PREVIEW_FOCUS_MESSAGE,
          LEGACY_PREVIEW_FOCUS_MESSAGE,
        ].includes(event.data.type)
      ) {
        return;
      }
      if (!parentOrigin && event.origin !== 'null') {
        parentOrigin = event.origin;
      }
      if (event.origin !== parentOrigin && event.origin !== window.location.origin) {
        return;
      }
      const path = typeof event.data.fieldPath === 'string' ? event.data.fieldPath : '';
      const match = path.startsWith(`${LIST_PATH}[`)
        ? path.slice(LIST_PATH.length).match(/^\[(\d+)\](?:\.(?:text|badge|icon|linkLabel|linkUrl))?$/)
        : null;
      const selected = match ? Number(match[1]) : -1;
      if (selected < 0 || selected >= count) {
        setInspectedPath(null);
        return;
      }
      setActiveSlide(selected);
      setInspectedPath(path);
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        itemRefs.current[selected]?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      });
    };

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      window.cancelAnimationFrame(frame);
    };
  }, [count]);

  const move = (direction: number) => {
    setInspectedPath(null);
    setActiveSlide((current) => (Math.min(current, count - 1) + direction + count) % count);
  };

  const buttonStyle = {
    color: 'inherit',
    background: 'transparent',
    border: 0,
    borderRadius: 4,
    padding: 4,
    cursor: 'pointer',
    font: 'inherit',
    minWidth: 28,
    minHeight: 28,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const;

  return (
    <div data-preview-page-key="announcement_bar_preview">
      {count === 0 ? (
        <div
          data-preview-list-path="announcementBarPreview.announcements"
          className="w-full border border-dashed border-slate-400 p-3 text-center text-sm"
        >
          <span data-preview-static="empty-announcements-placeholder">
            No announcements yet
          </span>
        </div>
      ) : (
        <div
          role="region"
          aria-roledescription="carousel"
          data-preview-list-path="announcementBarPreview.announcements"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setFocused(false);
            }
          }}
          style={{
            background: '#102a43',
            color: '#fff',
            width: '100%',
            boxSizing: 'border-box',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)',
            lineHeight: 1.5,
          }}
        >
          <div
            id={slidesId}
            aria-live={rotating ? 'off' : 'polite'}
            aria-atomic="true"
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: isEditorPreview ? '0.35rem' : 0,
            }}
          >
            {announcements.map((item, index) => {
              const isVisibleSlide = isEditorPreview || index === activeIndex;
              if (!isVisibleSlide) {
                return null;
              }
              const href = safeHref(item.linkUrl);
              const isHighlighted = index === activeIndex;

              return (
                <div
                  key={index}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  data-preview-item-path={`announcementBarPreview.announcements[${index}]`}
                  role="group"
                  aria-roledescription="slide"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    minHeight: 32,
                    overflowWrap: 'anywhere',
                    textAlign: 'center',
                    padding: isEditorPreview ? '4px 8px' : 0,
                    borderRadius: isEditorPreview ? 6 : 0,
                    background:
                      isEditorPreview && isHighlighted
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'transparent',
                  }}
                >
                  {(item.icon || isEditorPreview) && (
                    <span
                      data-preview-field-path={`announcementBarPreview.announcements[${index}].icon`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '1.25rem',
                        minHeight: '1.25rem',
                      }}
                    >
                      {item.icon}
                    </span>
                  )}
                  {(item.badge || isEditorPreview) && (
                    <span
                      data-preview-field-path={`announcementBarPreview.announcements[${index}].badge`}
                      style={{
                        border: '1px solid currentColor',
                        borderRadius: 20,
                        padding: '0.1rem 0.6rem',
                        fontSize: '0.8em',
                        minWidth: '1.5ch',
                        minHeight: '1.2em',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <span
                    data-preview-field-path={`announcementBarPreview.announcements[${index}].text`}
                    style={{ display: 'inline-block', minWidth: '1.5ch', minHeight: '1.2em' }}
                  >
                    {item.text}
                  </span>
                  {href && item.linkLabel ? (
                    <a
                      href={href}
                      data-preview-field-path={`announcementBarPreview.announcements[${index}].linkUrl`}
                      style={{ color: 'inherit', textDecoration: 'underline' }}
                    >
                      <span
                        data-preview-field-path={`announcementBarPreview.announcements[${index}].linkLabel`}
                      >
                        {item.linkLabel}
                      </span>
                    </a>
                  ) : isEditorPreview ? (
                    <a
                      href={href || '#preview-details'}
                      data-preview-field-path={`announcementBarPreview.announcements[${index}].linkUrl`}
                      style={{
                        color: 'inherit',
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        minWidth: '1.5ch',
                        minHeight: '1.2em',
                      }}
                    >
                      <span
                        data-preview-field-path={`announcementBarPreview.announcements[${index}].linkLabel`}
                        style={{ display: 'inline-block', minWidth: '1.5ch', minHeight: '1.2em' }}
                      >
                        {item.linkLabel}
                      </span>
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>

          {count > 1 && (
            <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
              <button
                type="button"
                data-preview-static="announcement-prev-button"
                style={buttonStyle}
                aria-label="Previous announcement"
                title="Previous announcement"
                aria-controls={slidesId}
                onClick={() => move(-1)}
              >
                <span aria-hidden="true">&#8249;</span>
              </button>
              <button
                type="button"
                data-preview-static="announcement-next-button"
                style={buttonStyle}
                aria-label="Next announcement"
                title="Next announcement"
                aria-controls={slidesId}
                onClick={() => move(1)}
              >
                <span aria-hidden="true">&#8250;</span>
              </button>
              {!isEditorPreview && !reducedMotion && (
                <button
                  type="button"
                  data-preview-static="announcement-pause-button"
                  style={buttonStyle}
                  aria-controls={slidesId}
                  aria-label={paused || inspectorPaused ? 'Resume rotation' : 'Pause rotation'}
                  title={paused || inspectorPaused ? 'Resume rotation' : 'Pause rotation'}
                  onClick={() => {
                    setPaused(!(paused || inspectorPaused));
                    setInspectedPath(null);
                  }}
                >
                  <span aria-hidden="true">{paused || inspectorPaused ? '▶' : 'Ⅱ'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

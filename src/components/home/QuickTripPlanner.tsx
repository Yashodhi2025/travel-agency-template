'use client';

import { useState } from 'react';
import { EditableText } from '@deneb-ui/ui';
import { contentList, contentObject, contentText, useProducts, useSiteData } from '@/lib/siteDataContext';
import { saveTripEnquiryDraft, type TripEnquiryDraft } from '@/lib/travelHelpers';

export interface PlannerSelection {
  region: string;
  style: string;
  duration: string;
  travellers: string;
  travelDate: string;
}

interface QuickTripPlannerProps {
  onApplyFilter: (selection: PlannerSelection) => void;
  onStartTailorMade: (draft: TripEnquiryDraft) => void;
}

export function QuickTripPlanner({ onApplyFilter, onStartTailorMade }: QuickTripPlannerProps) {
  const siteData = useSiteData();
  const home = contentObject(contentObject(siteData?.content).home);
  const products = useProducts();
  const destinations = contentList(home.destinations).map((item) => contentObject(item));

  const regions = Array.from(
    new Set(destinations.map((d) => contentText(d.name)).filter(Boolean)),
  );
  const styles = Array.from(
    new Set(products.map((p) => contentText((p as any).category)).filter(Boolean)),
  );

  const [region, setRegion] = useState('');
  const [style, setStyle] = useState('');
  const [duration, setDuration] = useState('');
  const [travellers, setTravellers] = useState('2 Guests');
  const [travelDate, setTravelDate] = useState('');

  const handleFilterClick = () => {
    onApplyFilter({ region, style, duration, travellers, travelDate });
    const target = document.getElementById('packages');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTailorClick = () => {
    const draft: TripEnquiryDraft = {
      destination: region || undefined,
      travelStyle: style || undefined,
      duration: duration || undefined,
      travellers: travellers || undefined,
      travelDate: travelDate || undefined,
    };
    saveTripEnquiryDraft(draft);
    onStartTailorMade(draft);
    const target = document.getElementById('tailor-made');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      aria-label={undefined}
      data-design-section="quick-trip-planner"
      className="relative z-20 pt-10 pb-8 sm:pt-12"
    >
      <div className="lux-container">
        <div className="border border-[var(--lux-border-strong)] bg-[var(--lux-surface)] p-6 shadow-[var(--lux-shadow-lg)] sm:p-8">
          <div className="mb-6 flex flex-col gap-2 border-b border-[var(--lux-border)] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <EditableText
                as="h2"
                variant="h3"
                className="font-editorial m-0 text-2xl font-medium text-[var(--lux-text)]"
                data-preview-field-path="home.plannerHeading"
                defaultValue={contentText(home.plannerHeading) || 'Curate Your Ideal Escape'}
              />
              <EditableText
                as="p"
                className="m-0 mt-1 text-sm text-[var(--lux-text-muted)]"
                data-preview-field-path="home.plannerSubtitle"
                defaultValue={contentText(home.plannerSubtitle)}
              />
            </div>
            <span
              data-preview-static="planner-badge-label"
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lux-gold-deep)] dark:text-[#C6A46A]"
            >
              Private Bespoke Planning
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
            <div>
              <label
                htmlFor="planner-destination"
                data-preview-static="planner-destination-label"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lux-text-muted)]"
              >
                Destination
              </label>
              <select
                id="planner-destination"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                data-preview-static="planner-destination-select"
                className="lux-select"
              >
                <option value="">All Sri Lanka Regions</option>
                {regions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="planner-style"
                data-preview-static="planner-style-label"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lux-text-muted)]"
              >
                Travel Style
              </label>
              <select
                id="planner-style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                data-preview-static="planner-style-select"
                className="lux-select"
              >
                <option value="">All Travel Styles</option>
                {styles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="planner-duration"
                data-preview-static="planner-duration-label"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lux-text-muted)]"
              >
                Duration
              </label>
              <select
                id="planner-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                data-preview-static="planner-duration-select"
                className="lux-select"
              >
                <option value="">Any Duration</option>
                <option value="short">Up to 7 Days</option>
                <option value="medium">8 – 10 Days</option>
                <option value="long">11+ Days</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="planner-travellers"
                data-preview-static="planner-travellers-label"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lux-text-muted)]"
              >
                Travellers
              </label>
              <select
                id="planner-travellers"
                value={travellers}
                onChange={(e) => setTravellers(e.target.value)}
                data-preview-static="planner-travellers-select"
                className="lux-select"
              >
                <option value="Solo Traveller">Solo Traveller</option>
                <option value="2 Guests">2 Guests (Couple)</option>
                <option value="3–4 Guests">3 – 4 Guests</option>
                <option value="5+ Family / Private Group">5+ Family / Group</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="planner-date"
                data-preview-static="planner-date-label"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lux-text-muted)]"
              >
                Preferred Month
              </label>
              <input
                id="planner-date"
                type="month"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                data-preview-static="planner-date-input"
                className="lux-input"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={handleFilterClick}
                className="lux-btn-primary w-full !min-h-[44px] !px-3"
              >
                <span data-preview-field-path="home.plannerCtaLabel">
                  {contentText(home.plannerCtaLabel) || 'Explore Tours'}
                </span>
              </button>
              <button
                type="button"
                onClick={handleTailorClick}
                className="lux-btn-outline w-full !min-h-[38px] !px-3 !py-1.5 !text-[11px]"
              >
                <span data-preview-field-path="home.plannerEnquiryLabel">
                  {contentText(home.plannerEnquiryLabel) || 'Plan My Trip'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

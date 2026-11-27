'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickTripPlanner, type PlannerSelection } from '@/components/home/QuickTripPlanner';
import { TrustAndIntroSection } from '@/components/home/TrustAndIntroSection';
import { DestinationsExplorerSection } from '@/components/home/DestinationsExplorerSection';
import { TourPackagesSection } from '@/components/home/TourPackagesSection';
import { ExperiencesAndStaysSection } from '@/components/home/ExperiencesAndStaysSection';
import { TailorMadeTestimonialsFaqSection } from '@/components/home/TailorMadeTestimonialsFaqSection';
import { saveTripEnquiryDraft, type TripEnquiryDraft } from '@/lib/travelHelpers';

export default function HomePage() {
  const [regionFilter, setRegionFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [enquiryDraft, setEnquiryDraft] = useState<TripEnquiryDraft | null>(null);

  const handleApplyPlannerFilter = (selection: PlannerSelection) => {
    setRegionFilter(selection.region);
    setStyleFilter(selection.style);
    setDurationFilter(selection.duration);
  };

  const handleStartEnquiry = (draft: TripEnquiryDraft) => {
    saveTripEnquiryDraft(draft);
    setEnquiryDraft(draft);
  };

  const handleResetFilters = () => {
    setRegionFilter('');
    setStyleFilter('');
    setDurationFilter('');
  };

  return (
    <div data-preview-page-key="home">
      <HeroSection />
      <QuickTripPlanner
        onApplyFilter={handleApplyPlannerFilter}
        onStartTailorMade={handleStartEnquiry}
      />
      <TrustAndIntroSection />
      <DestinationsExplorerSection
        onSelectDestinationForFilter={(destinationName) => {
          setRegionFilter(destinationName);
          setStyleFilter('');
          setDurationFilter('');
        }}
        onPlanDestination={handleStartEnquiry}
      />
      <TourPackagesSection
        externalRegionFilter={regionFilter}
        externalStyleFilter={styleFilter}
        externalDurationFilter={durationFilter}
        onResetExternalFilters={handleResetFilters}
        onEnquirePackage={handleStartEnquiry}
      />
      <ExperiencesAndStaysSection
        onSelectExperienceStyle={(style) => {
          setStyleFilter(style);
          setRegionFilter('');
          setDurationFilter('');
        }}
        onEnquireExperience={handleStartEnquiry}
      />
      <TailorMadeTestimonialsFaqSection activeDraft={enquiryDraft} />
    </div>
  );
}

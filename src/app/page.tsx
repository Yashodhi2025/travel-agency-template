'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { AyubowanWelcomeSection } from '@/components/home/AyubowanWelcomeSection';
import { TravelStylesSection } from '@/components/home/TravelStylesSection';
import { SriLankaMapSection } from '@/components/home/SriLankaMapSection';
import { PopularDestinationsSection } from '@/components/home/PopularDestinationsSection';
import { TourPackagesSection } from '@/components/home/TourPackagesSection';
import { AuthenticExperiencesSection } from '@/components/home/AuthenticExperiencesSection';
import { HotelsAndStaysSection } from '@/components/home/HotelsAndStaysSection';
import { SeasonalOffersSection } from '@/components/home/SeasonalOffersSection';
import { TestimonialsAndTrustSection } from '@/components/home/TestimonialsAndTrustSection';
import { PlanYourTripSection } from '@/components/home/PlanYourTripSection';
import { saveTripEnquiryDraft, type TripEnquiryDraft } from '@/lib/travelHelpers';

export default function HomePage() {
  const [regionFilter, setRegionFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [enquiryDraft, setEnquiryDraft] = useState<TripEnquiryDraft | null>(null);

  const handleStartEnquiry = (draft: TripEnquiryDraft) => {
    saveTripEnquiryDraft(draft);
    setEnquiryDraft(draft);
  };

  const handleResetFilters = () => {
    setRegionFilter('');
    setStyleFilter('');
  };

  return (
    <div data-preview-page-key="home">
      {/* 01 — Cinematic 3D Coverflow Destination Hero */}
      <HeroSection />

      {/* 02 — Compact Ayubowan Welcome */}
      <AyubowanWelcomeSection />

      {/* 03 — Travel Styles Carousel */}
      <TravelStylesSection
        onSelectTravelStyle={(styleTitle) => {
          setStyleFilter(styleTitle);
          setRegionFilter('');
        }}
      />

      {/* 04 — Interactive Sri Lanka Exploration Map */}
      <SriLankaMapSection
        onSelectDestinationForFilter={(destinationName) => {
          setRegionFilter(destinationName);
          setStyleFilter('');
        }}
        onPlanDestination={handleStartEnquiry}
      />

      {/* 05 — Featured Destinations Mosaic */}
      <PopularDestinationsSection
        onSelectDestinationForFilter={(destinationName) => {
          setRegionFilter(destinationName);
          setStyleFilter('');
        }}
        onPlanDestination={handleStartEnquiry}
      />

      {/* 06 — Featured Tour Packages */}
      <TourPackagesSection
        externalRegionFilter={regionFilter}
        externalStyleFilter={styleFilter}
        onResetExternalFilters={handleResetFilters}
        onEnquirePackage={handleStartEnquiry}
      />

      {/* 07 — Signature Experiences Carousel */}
      <AuthenticExperiencesSection
        onSelectExperienceStyle={(style) => {
          setStyleFilter(style);
          setRegionFilter('');
        }}
        onEnquireExperience={handleStartEnquiry}
      />

      {/* 08 — Featured Hotels & Stays */}
      <HotelsAndStaysSection onEnquireStay={handleStartEnquiry} />

      {/* 09 — Special Offers */}
      <SeasonalOffersSection onEnquireOffer={handleStartEnquiry} />

      {/* 10 — Consolidated Testimonials & Trust */}
      <TestimonialsAndTrustSection />

      {/* 11 — Compact Plan Your Trip CTA (12 — Premium Footer rendered by SiteChrome) */}
      <PlanYourTripSection activeDraft={enquiryDraft} />
    </div>
  );
}

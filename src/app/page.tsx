import React, { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { ConversionTool } from "@/components/converter/ConversionTool";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Features } from "@/components/home/Features";
import { SupportedImports } from "@/components/home/SupportedImports";
import { FaqSection } from "@/components/home/FaqSection";
import { AdSlot } from "@/components/ads/AdSlot";
import { AuthStatusBanner } from "@/components/home/AuthStatusBanner";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* Dynamic OAuth Status Banner */}
      <Suspense fallback={null}>
        <AuthStatusBanner />
      </Suspense>

      {/* Hero Section */}
      <Hero />

      {/* Conversion Tool Section (Kept 100% clean of advertisements) */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <ConversionTool />
      </section>

      {/* How It Works Educational Section */}
      <HowItWorks />

      {/* Mid-content Ad Slot placed strictly in content area, away from conversion buttons */}
      <AdSlot placement="between-content" />

      {/* Features Showcase */}
      <Features />

      {/* Supported Imports */}
      <SupportedImports />

      {/* FAQ Accordion */}
      <FaqSection />
    </div>
  );
}

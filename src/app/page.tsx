import React from "react";
import { Hero } from "@/components/home/Hero";
import { ConversionTool } from "@/components/converter/ConversionTool";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Features } from "@/components/home/Features";
import { SupportedImports } from "@/components/home/SupportedImports";
import { FaqSection } from "@/components/home/FaqSection";
import { AdSlot } from "@/components/ads/AdSlot";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <Hero />

      {/* Conversion Tool Section */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <ConversionTool />
      </section>

      {/* Compliant Ad Slot below tool (disabled by default) */}
      <AdSlot placement="below-hero" />

      {/* How It Works */}
      <HowItWorks />

      {/* Features Showcase */}
      <Features />

      {/* Supported Imports */}
      <SupportedImports />

      {/* Mid-content Ad Slot (disabled by default) */}
      <AdSlot placement="between-content" />

      {/* FAQ Accordion */}
      <FaqSection />
    </div>
  );
}

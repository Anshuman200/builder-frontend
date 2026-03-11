"use client";

import { HeroSection } from "@/components/landing/HeroSection";
import { TemplatesSection } from "@/components/landing/TemplatesSection";

/**
 * Clean Landing Page.
 * Layout (Header, Footer, Backgrounds) is handled by the parent (public) layout.
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <TemplatesSection />
    </div>
  );
}

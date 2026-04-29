import { HeroSection } from "@/components/landing/HeroSection";
import { TemplatesSection } from "@/components/landing/TemplatesSection";

/**
 * Landing Page (Server Component).
 * Standardizing on Server-Side rendering for high performance and caching.
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <TemplatesSection />
    </div>
  );
}
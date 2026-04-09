import type { Block, SectionTemplate } from "@/types";
/**
 * sectionTemplates.ts
 *
 * Aggregates all section templates from individual category files.
 * To add a new template, go to the relevant file in ./sections/ and add it there.
 * To add a new category, create a new file in ./sections/ and import it below.
 */



// ─── Type definition ──────────────────────────────────────────────────────────


// ─── Category imports ─────────────────────────────────────────────────────────

export { navigationSections } from "../sections/navigation";
export { heroSections } from "../sections/hero";
export { teamSections } from "../sections/team";
export { gallerySections } from "../sections/gallery";
export { featuresSections } from "../sections/features";
export { pricingSections } from "../sections/pricing";
export { testimonialSections } from "../sections/testimonial";
export { footerSections } from "../sections/footer";
export { contactSections } from "../sections/contact";
export { faqSections } from "../sections/faq";
export { statsSections } from "../sections/stats";
export { carouselSections } from "../sections/carousel";
export { ctaSections } from "../sections/cta";

// ─── Combined array (ordered display) ────────────────────────────────────────

import { navigationSections } from "../sections/navigation";
import { heroSections } from "../sections/hero";
import { teamSections } from "../sections/team";
import { gallerySections } from "../sections/gallery";
import { featuresSections } from "../sections/features";
import { pricingSections } from "../sections/pricing";
import { testimonialSections } from "../sections/testimonial";
import { footerSections } from "../sections/footer";
import { contactSections } from "../sections/contact";
import { faqSections } from "../sections/faq";
import { statsSections } from "../sections/stats";
import { carouselSections } from "../sections/carousel";
import { ctaSections } from "../sections/cta";

export const SECTION_TEMPLATES: SectionTemplate[] = [
    ...navigationSections,
    ...heroSections,
    ...teamSections,
    ...gallerySections,
    ...featuresSections,
    ...pricingSections,
    ...testimonialSections,
    ...footerSections,
    ...contactSections,
    ...faqSections,
    ...statsSections,
    ...carouselSections,
    ...ctaSections,
];

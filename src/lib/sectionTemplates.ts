import type { Block, SectionTemplate } from "@/@Types";
/**
 * sectionTemplates.ts
 *
 * Aggregates all section templates from individual category files.
 * To add a new template, go to the relevant file in ./sections/ and add it there.
 * To add a new category, create a new file in ./sections/ and import it below.
 */



// ─── Type definition ──────────────────────────────────────────────────────────


// ─── Category imports ─────────────────────────────────────────────────────────

export { navigationSections } from "./sections/navigation";
export { heroSections } from "./sections/hero";
export { teamSections } from "./sections/team";
export { logosSections } from "./sections/logos";
export { gallerySections } from "./sections/gallery";
export { featuresSections } from "./sections/features";
export { pricingSections } from "./sections/pricing";
export { testimonialSections } from "./sections/testimonial";
export { footerSections } from "./sections/footer";
export { contactSections } from "./sections/contact";
export { faqSections } from "./sections/faq";

// ─── Combined array (ordered display) ────────────────────────────────────────

import { navigationSections } from "./sections/navigation";
import { heroSections } from "./sections/hero";
import { teamSections } from "./sections/team";
import { logosSections } from "./sections/logos";
import { gallerySections } from "./sections/gallery";
import { featuresSections } from "./sections/features";
import { pricingSections } from "./sections/pricing";
import { testimonialSections } from "./sections/testimonial";
import { footerSections } from "./sections/footer";
import { contactSections } from "./sections/contact";
import { faqSections } from "./sections/faq";

export const SECTION_TEMPLATES: SectionTemplate[] = [
    ...navigationSections,
    ...heroSections,
    ...teamSections,
    ...logosSections,
    ...gallerySections,
    ...featuresSections,
    ...pricingSections,
    ...testimonialSections,
    ...footerSections,
    ...contactSections,
    ...faqSections,
];

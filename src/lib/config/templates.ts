import { heroSections } from "@/lib/sections/hero";
import { featuresSections } from "@/lib/sections/features";
import { statsSections } from "@/lib/sections/stats";
import { teamSections } from "@/lib/sections/team";
import { navigationSections } from "@/lib/sections/navigation";
import { footerSections } from "@/lib/sections/footer";
import { contactSections } from "@/lib/sections/contact";
import { ctaSections } from "@/lib/sections/cta";
import { faqSections } from "@/lib/sections/faq";
import { pricingSections } from "@/lib/sections/pricing";
import { gallerySections } from "@/lib/sections/gallery";
import { gridSections } from "@/lib/sections/grid";
import { chartSections } from "@/lib/sections/chart";
import type { SectionTemplate, Block } from "@/types";

export const ALL_TEMPLATES: Record<string, SectionTemplate[]> = {
    hero: heroSections,
    features: featuresSections,
    stats: statsSections,
    team: teamSections,
    header: navigationSections,
    footer: footerSections,
    contactForm: contactSections,
    cta: ctaSections,
    faq: faqSections,
    pricing: pricingSections,
    gallery: gallerySections,
    grid: gridSections,
    chart: chartSections
};

export function getTemplatesForBlock(block: Block): SectionTemplate[] | null {
    const tid = (block.props.templateId as string) || (block as any).templateId || "";
    
    // Check by prefix first (most reliable for templates)
    if (tid.startsWith("hero-")) return heroSections;
    if (tid.startsWith("contact-")) return contactSections;
    if (tid.startsWith("features-")) return featuresSections;
    if (tid.startsWith("stats-")) return statsSections;
    if (tid.startsWith("team-")) return teamSections;
    if (tid.startsWith("navigation-")) return navigationSections;
    if (tid.startsWith("footer-")) return footerSections;
    if (tid.startsWith("cta-")) return ctaSections;
    if (tid.startsWith("faq-")) return faqSections;
    if (tid.startsWith("pricing-")) return pricingSections;
    if (tid.startsWith("gallery-")) return gallerySections;
    if (tid.startsWith("grid-")) return gridSections;
    if (tid.startsWith("chart-")) return chartSections;

    // Fallback to block type
    return ALL_TEMPLATES[block.type] || null;
}

/**
 * Extracts text content from a block and its children.
 */
export function extractBlockText(block: Block): string[] {
    let res: string[] = [];
    if (block.type === "text" && block.props.content) res.push(block.props.content as string);
    else if (block.type === "button" && block.props.label) res.push(block.props.label as string);

    if (block.type === "features" && Array.isArray(block.props.features)) {
        block.props.features.forEach((f: any) => {
            if (f.title) res.push(f.title);
            if (f.description) res.push(f.description);
        });
    } else if (block.type === "stats" && Array.isArray(block.props.items)) {
        block.props.items.forEach((f: any) => {
            if (f.label) res.push(f.label);
            if (f.value) res.push(f.value);
            if (f.description) res.push(f.description);
        });
    } else if (block.type === "team" && Array.isArray(block.props.members)) {
        block.props.members.forEach((f: any) => {
            if (f.name) res.push(f.name);
            if (f.role) res.push(f.role);
            if (f.description) res.push(f.description);
        });
    } else if (block.type === "accordion" && Array.isArray(block.props.items)) {
        block.props.items.forEach((f: any) => {
            if (f.title) res.push(f.title);
            if (f.content) res.push(f.content);
        });
    } else if (block.type === "chart") {
        if (block.props.title) res.push(block.props.title as string);
        if (block.props.subtitle) res.push(block.props.subtitle as string);
    }

    ["childBlocks", "col0", "col1"].forEach(pName => {
        const children = block.props[pName] as Block[] | undefined;
        if (Array.isArray(children)) children.forEach(c => { res = [...res, ...extractBlockText(c)]; });
    });
    return res;
}

/**
 * Injects text content into a block and its children.
 */
export function injectBlockText(block: Block, texts: string[]): string[] {
    let remaining = [...texts];
    if (remaining.length === 0) return [];
    
    if (block.type === "text") block.props.content = remaining.shift();
    else if (block.type === "button") block.props.label = remaining.shift();

    if (block.type === "features" && Array.isArray(block.props.features)) {
        block.props.features.forEach((f: any) => {
            if (remaining.length > 0) f.title = remaining.shift();
            if (remaining.length > 0) f.description = remaining.shift();
        });
    } else if (block.type === "stats" && Array.isArray(block.props.items)) {
        block.props.items.forEach((f: any) => {
            if (remaining.length > 0) f.label = remaining.shift();
            if (remaining.length > 0) f.value = remaining.shift();
            if (remaining.length > 0) f.description = remaining.shift();
        });
    } else if (block.type === "team" && Array.isArray(block.props.members)) {
        block.props.members.forEach((f: any) => {
            if (remaining.length > 0) f.name = remaining.shift();
            if (remaining.length > 0) f.role = remaining.shift();
            if (remaining.length > 0) f.description = remaining.shift();
        });
    } else if (block.type === "accordion" && Array.isArray(block.props.items)) {
        block.props.items.forEach((f: any) => {
            if (remaining.length > 0) f.title = remaining.shift();
            if (remaining.length > 0) f.content = remaining.shift();
        });
    } else if (block.type === "chart") {
        if (remaining.length > 0) block.props.title = remaining.shift();
        if (remaining.length > 0) block.props.subtitle = remaining.shift();
    }

    ["childBlocks", "col0", "col1"].forEach(pName => {
        const children = block.props[pName] as Block[] | undefined;
        if (Array.isArray(children)) children.forEach(c => { remaining = injectBlockText(c, remaining); });
    });
    return remaining;
}

export function transformBlockToTemplate(block: Block, template: SectionTemplate): Block {
    // 1. Extract content
    const oldText = extractBlockText(block);

    // 2. Create new block
    const newBlock = template.create();

    // 3. Inject content
    injectBlockText(newBlock, oldText);

    // 4. Preserve core settings
    if (block.props.sectionId) newBlock.props.sectionId = block.props.sectionId;
    if (block.props.anchorId) newBlock.props.anchorId = block.props.anchorId;
    newBlock.props.templateId = template.id;

    return newBlock;
}

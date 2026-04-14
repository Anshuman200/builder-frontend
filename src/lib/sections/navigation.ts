// sections/navigation.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const navigationSections: SectionTemplate[] = [
    {
        id: "nav-logo-left",
        name: "Navbar Logo Left",
        category: "Navigation",
        preview: `<div style="font-family:sans-serif;padding:10px 16px;display:flex;align-items:center;gap:16px;background:var(--bg-secondary);border-bottom:1px solid var(--border)">
                <span style="font-size:10px;font-weight:800;color:var(--text);flex:1">Company Logo</span>
                <span style="font-size:8px;color:var(--text-muted)">Feature &nbsp; Pricing &nbsp; Docs</span>
                <span style="font-size:8px;background:var(--primary);color:#fff;padding:3px 8px;border-radius:4px">GET STARTED</span>
                </div>`,
        create: () => makeBlock("header", {
            layout: "standard",
            layoutWidth: "fluid",
            fullWidth: true,
            logoText: "Company Logo",
            links: [{ id: "1", label: "Home", url: "/" }],
            showCta: true, ctaText: "GET STARTED",
            bgColor: "#ffffff", textColor: "#111111",
        }),
    },
    {
        id: "nav-logo-center",
        name: "Navbar Logo Center",
        category: "Navigation",
        preview: `<div style="font-family:sans-serif;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;background:var(--bg-secondary);border-bottom:1px solid var(--border)">
                <span style="font-size:8px;color:var(--text-muted)">Feature &nbsp; Pricing &nbsp; Resources</span>
                <span style="font-size:10px;font-weight:800;color:var(--text)">Company Logo</span>
                <span style="font-size:8px;background:var(--primary);color:#fff;padding:3px 8px;border-radius:4px">GET STARTED</span>
                </div>`,
        create: () => makeBlock("header", {
            layout: "centered",
            layoutWidth: "fluid",
            fullWidth: true,
            logoText: "Company Logo",
            links: [{ id: "1", label: "Home", url: "/" }],
            showCta: true, ctaText: "GET STARTED",
            bgColor: "#ffffff", textColor: "#111111",
        }),
    },
    {
        id: "nav-no-shadow",
        name: "Navbar No Shadow",
        category: "Navigation",
        preview: `<div style="font-family:sans-serif;padding:10px 16px;display:flex;align-items:center;gap:16px;background:var(--surface)">
                <span style="font-size:10px;font-weight:800;color:var(--text);flex:1">Company Logo</span>
                <span style="font-size:8px;color:var(--text-muted)">About &nbsp; Feature &nbsp; Pricing</span>
                <span style="font-size:8px;border:1px solid var(--border);color:var(--text);padding:3px 8px;border-radius:4px">GET STARTED</span>
                </div>`,
        create: () => makeBlock("header", {
            layout: "standard",
            layoutWidth: "fluid",
            fullWidth: true,
            logoText: "Company Logo",
            style: "transparent",
            links: [{ id: "1", label: "Home", url: "/" }],
            showCta: true, ctaText: "GET STARTED", ctaVariant: "outline",
            bgColor: "#111827", textColor: "#ffffff",
        }),
    },
];

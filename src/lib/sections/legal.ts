import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const legalSections: SectionTemplate[] = [
    {
        id: "legal-tos",
        name: "Terms of Service Section",
        category: "Legal",
        preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px">
            <div style="font-size:10px;font-weight:700;margin-bottom:4px;color:var(--text)">Terms of Service</div>
            <div style="font-size:7px;color:var(--text-muted)">Standard terms and conditions for your users to read before using your services.</div>
            <div style="margin-top:8px;height:4px;width:100%;background:var(--border);border-radius:2px"></div>
            <div style="margin-top:4px;height:4px;width:80%;background:var(--border);border-radius:2px"></div>
        </div>`,
        create: () => makeBlock("tos", {}),
    },
    {
        id: "legal-privacy",
        name: "Privacy Policy Section",
        category: "Legal",
        preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px">
            <div style="font-size:10px;font-weight:700;margin-bottom:4px;color:var(--text)">Privacy Policy</div>
            <div style="font-size:7px;color:var(--text-muted)">Clear and concise information about data collection and usage protocols.</div>
            <div style="margin-top:8px;height:4px;width:100%;background:var(--border);border-radius:2px"></div>
            <div style="margin-top:4px;height:4px;width:90%;background:var(--border);border-radius:2px"></div>
        </div>`,
        create: () => makeBlock("privacy", {}),
    },
    {
        id: "legal-about",
        name: "About Us Section",
        category: "Legal",
        preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px">
            <div style="font-size:10px;font-weight:700;margin-bottom:4px;color:var(--text)">About Us</div>
            <div style="font-size:7px;color:var(--text-muted)">Introduction to your team, mission, and the story behind your journey.</div>
            <div style="margin-top:8px;height:4px;width:100%;background:var(--border);border-radius:2px"></div>
            <div style="margin-top:4px;height:4px;width:70%;background:var(--border);border-radius:2px"></div>
        </div>`,
        create: () => makeBlock("about", {}),
    },
];

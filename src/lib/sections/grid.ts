import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const gridSections: SectionTemplate[] = [
    {
        id: "grid-4x2-bento",
        name: "4-Column Bento Grid",
        category: "Grid",
        preview: `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:8px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;height:100%">
            ${Array.from({ length: 4 }).map(() => `<div style="aspect-ratio:1;background:#cbd5e1;border-radius:2px"></div>`).join('')}
        </div>`,
        create: () => {
            return makeBlock("grid", {
                columns: 4,
                gap: "1rem",
                padding: "60px 24px",
                align: "stretch",
                verticalAlign: "stretch",
                items: Array.from({ length: 8 }).map((_, i) => ({
                    id: `slot-${crypto.randomUUID()}`,
                    blocks: [
                        makeBlock("container", {
                            padding: "20px",
                            bgColor: "rgba(99,102,241,0.05)",
                            borderRadius: "12px",
                            childBlocks: [
                                makeBlock("icon", { iconName: "Zap", size: "54", color: "var(--primary)", align: "center" }),
                                makeBlock("text", { content: "Feature", tag: "h4", fontSize: "1.1rem", bold: true, marginTop: "8px", align: "center" }),
                                makeBlock("text", { content: "Description text goes here.", tag: "p", fontSize: "0.85rem", color: "var(--text-muted)", align: "center" }),
                                makeBlock("button", { label: "Learn more", variant: "solid", bgColor: "#000000", textColor: "#ffffff", size: "lg", align: "center", borderRadius: "9999px", fullWidth: true })
                            ]
                        })
                    ]
                }))
            });
        }
    },
    {
        id: "grid-6-logos",
        name: "6-Column Logo Wall",
        category: "Grid",
        preview: `<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;padding:8px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;height:100%">
            ${Array.from({ length: 7 }).map(() => `<div style="aspect-ratio:3/2;background:#cbd5e1;border-radius:2px"></div>`).join('')}
        </div>`,
        create: () => {
            return makeBlock("grid", {
                columns: 6,
                gap: "2rem",
                padding: "40px 24px",
                align: "center",
                verticalAlign: "center",
                items: Array.from({ length: 6 }).map((_, i) => ({
                    id: `slot-${crypto.randomUUID()}`,
                    blocks: [
                        makeBlock("image", {
                            src: `https://placehold.co/200x100/f8fafc/64748b?text=Logo+${i + 1}`,
                            height: "60px",
                            objectFit: "contain",
                            align: "center"
                        }),
                        makeBlock("text", { content: `Brand ${i + 1}`, tag: "h4", fontSize: "0.9rem", bold: true, marginTop: "12px", align: "center" }),
                    ]
                }))
            });
        }
    }
];

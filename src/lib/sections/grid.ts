import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const gridSections: SectionTemplate[] = [
    {
        id: "grid-4x2-bento",
        name: "4-Column Bento Grid",
        category: "Grid",
        previewImage: "/previews/grid/grid-4x2-bento.png",
        preview: `<div style="font-family:'Inter',sans-serif;height:100%;background:#ffffff;padding:40px 80px;display:flex;flex-direction:column;width:100%">
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;flex:1">
                  ${Array.from({ length: 8 }).map(() => `
                    <div style="background:#f8fafc;border-radius:16px;padding:24px;border:1px solid #f1f5f9;display:flex;flex-direction:column;align-items:center;text-align:center">
                      <div style="width:40px;height:40px;background:#6366f1;border-radius:10px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;color:#fff">
                        <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      </div>
                      <div style="font-size:18px;font-weight:800;color:#0f172a;margin-bottom:8px">Feature</div>
                      <div style="font-size:13px;color:#64748b;line-height:1.4;margin-bottom:16px">Powerful feature description text.</div>
                      <div style="margin-top:auto;width:100%;padding:8px;background:#000;color:#fff;border-radius:20px;font-size:11px;font-weight:700">Learn More</div>
                    </div>
                  `).join('')}
                </div>
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
        previewImage: "/previews/grid/grid-6-logos.png",
        preview: `<div style="font-family:'Inter',sans-serif;height:100%;background:#ffffff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 80px;width:100%">
                <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:40px;width:100%;align-items:center">
                  ${Array.from({ length: 6 }).map((_, i) => `
                    <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
                      <div style="width:100%;height:60px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:12px;font-weight:700">LOGO</div>
                      <div style="font-size:14px;font-weight:700;color:#64748b">Brand ${i + 1}</div>
                    </div>
                  `).join('')}
                </div>
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

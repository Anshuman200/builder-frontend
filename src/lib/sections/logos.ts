// sections/logos.ts
import { makeBlock } from "../blockConfig";
import type { SectionTemplate } from "@/@Types";

export const logosSections: SectionTemplate[] = [
    {
        id: "logos-strip",
        name: "Logo Strip",
        category: "Logos",
        preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary);text-align:center">
      <div style="font-size:7px;color:var(--text-muted);margin-bottom:8px">Trusted by great companies</div>
      <div style="display:flex;justify-content:center;gap:10px;align-items:center">
        ${[1, 2, 3, 4].map(() => `<div style="width:32px;height:14px;background:var(--surface);border-radius:2px;border:1px solid var(--border)"></div>`).join("")}
      </div>
    </div>`,
        create: () => {
            const root = makeBlock("container", { bgColor: "#ffffff", padding: "3rem 2rem" });
            root.props.childBlocks = [
                makeBlock("text", { content: "Trusted by teams at leading companies", tag: "p", fontSize: "0.875rem", color: "#94a3b8", align: "center", marginBottom: "2rem" }),
                makeBlock("columns", {
                    leftWidth: "50", gap: "2rem", align: "center",
                    col0: [makeBlock("image", { src: "https://placehold.co/120x40/e2e8f0/94a3b8?text=Logo", alt: "Logo", width: "120px" })],
                    col1: [makeBlock("image", { src: "https://placehold.co/120x40/e2e8f0/94a3b8?text=Logo", alt: "Logo", width: "120px" })],
                }),
            ];
            return root;
        },
    },
];

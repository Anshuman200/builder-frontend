// sections/hero.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/@Types";

export const heroSections: SectionTemplate[] = [
    {
        id: "hero-split",
        name: "Hero Heading Left",
        category: "Hero",
        preview: `<div style="font-family:sans-serif;display:flex;gap:8px;padding:14px;background:var(--bg-secondary);align-items:center">
      <div style="flex:1">
        <div style="font-size:10px;font-weight:800;color:var(--text);margin-bottom:4px">Title copy goes here</div>
        <div style="font-size:7px;color:var(--text-muted);margin-bottom:6px">Lorem ipsum dolor sit amet consectetur adipiscing elit.</div>
        <div style="font-size:7px;background:var(--primary);color:#fff;padding:3px 8px;border-radius:3px;display:inline-block">START FOR FREE</div>
      </div>
      <div style="width:60px;height:50px;background:var(--surface);border-radius:6px;flex-shrink:0;border:1px solid var(--border)"></div>
    </div>`,
        create: () => {
            const root = makeBlock("hero", { align: "left", bgColor: "#0f172a", textColor: "#ffffff", padding: "6rem 2rem" });
            const columns = makeBlock("columns", { leftWidth: "50", gap: "2rem", align: "center" });
            columns.props.col0 = [
                makeBlock("text", { content: "Welcome to PageCraft", tag: "h1", fontSize: "3.5rem", color: "#ffffff", bold: true, lineHeight: "1.2" }),
                makeBlock("text", { content: "Build stunning pages in minutes without writing code.", tag: "p", fontSize: "1.25rem", color: "#cbd5e1", marginTop: "1.5rem" }),
                makeBlock("button", { label: "Start Building Now", variant: "solid", bgColor: "#3b82f6", textColor: "#ffffff", size: "lg", marginTop: "2rem", fullWidth: false, borderRadius: "8px" }),
            ];
            columns.props.col1 = [makeBlock("image", { src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80", alt: "Hero", borderRadius: "16px", aspectRatio: "4/3", objectFit: "cover" })];
            root.props.childBlocks = [columns];
            return root;
        },
    },
    {
        id: "hero-centered",
        name: "Hero Heading Center",
        category: "Hero",
        preview: `<div style="font-family:sans-serif;padding:16px;background:var(--surface);text-align:center">
      <div style="font-size:11px;font-weight:800;color:var(--text);margin-bottom:4px">Create Your Masterpiece</div>
      <div style="font-size:7px;color:var(--text-muted);margin-bottom:8px">The most powerful drag-and-drop builder.</div>
      <div style="font-size:7px;background:linear-gradient(to right,#ec4899,#8b5cf6);color:#fff;padding:3px 10px;border-radius:999px;display:inline-block">Get Started Free</div>
    </div>`,
        create: () => {
            const root = makeBlock("hero", { align: "center", bgColor: "#1e293b", bgImage: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2000&q=80", bgOverlay: "rgba(15,23,42,0.75)", textColor: "#ffffff", padding: "8rem 2rem", minHeight: "80vh" });
            root.props.childBlocks = [
                makeBlock("text", { content: "Create Your Masterpiece", tag: "h1", fontSize: "4.5rem", color: "#ffffff", bold: true, align: "center", lineHeight: "1.1" }),
                makeBlock("text", { content: "The most powerful drag-and-drop builder for modern teams.", tag: "p", fontSize: "1.5rem", color: "#e2e8f0", align: "center", marginTop: "1.5rem" }),
                makeBlock("button", { label: "Get Started Free", variant: "gradient", gradientFrom: "#ec4899", gradientTo: "#8b5cf6", textColor: "#ffffff", size: "xl", align: "center", marginTop: "3rem", fullWidth: false, borderRadius: "9999px" }),
            ];
            return root;
        },
    },
    {
        id: "hero-right",
        name: "Hero Heading Right",
        category: "Hero",
        preview: `<div style="font-family:sans-serif;display:flex;gap:8px;padding:14px;background:var(--bg-secondary);align-items:center">
      <div style="width:60px;height:50px;background:var(--surface);border-radius:6px;flex-shrink:0;border:1px solid var(--border)"></div>
      <div style="flex:1">
        <div style="font-size:10px;font-weight:800;color:var(--text);margin-bottom:4px">Build Something Amazing</div>
        <div style="font-size:7px;color:var(--text-muted);margin-bottom:6px">Everything you need to launch fast.</div>
        <div style="font-size:7px;background:var(--primary);color:#fff;padding:3px 8px;border-radius:3px;display:inline-block">GET STARTED</div>
      </div>
    </div>`,
        create: () => {
            const root = makeBlock("hero", { align: "right", bgColor: "#f8fafc", textColor: "#0f172a", padding: "6rem 2rem" });
            const columns = makeBlock("columns", { leftWidth: "50", gap: "2rem", align: "center" });
            columns.props.col0 = [makeBlock("image", { src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80", alt: "Hero", borderRadius: "16px", aspectRatio: "4/3" })];
            columns.props.col1 = [
                makeBlock("text", { content: "Build Something Amazing", tag: "h1", fontSize: "3.5rem", color: "#0f172a", bold: true }),
                makeBlock("text", { content: "Everything you need to launch fast.", tag: "p", fontSize: "1.25rem", color: "#64748b", marginTop: "1rem" }),
                makeBlock("button", { label: "Get Started", variant: "solid", bgColor: "#0f172a", textColor: "#ffffff", size: "lg", marginTop: "2rem", fullWidth: false }),
            ];
            root.props.childBlocks = [columns];
            return root;
        },
    },
    {
        id: "hero-stack",
        name: "Hero Stack",
        category: "Hero",
        preview: `<div style="font-family:sans-serif;padding:14px;background:var(--bg-secondary);text-align:center">
      <div style="font-size:10px;font-weight:800;color:var(--text);margin-bottom:4px">Title copy goes here</div>
      <div style="font-size:7px;color:var(--text-muted);margin-bottom:6px">Supporting text for your hero section.</div>
      <div style="width:100%;height:36px;background:var(--surface);border-radius:4px;border:1px solid var(--border)"></div>
    </div>`,
        create: () => {
            const root = makeBlock("hero", { align: "center", bgColor: "#ffffff", textColor: "#0f172a", padding: "4rem 2rem" });
            root.props.childBlocks = [
                makeBlock("text", { content: "Title copy goes here", tag: "h1", fontSize: "3rem", color: "#0f172a", bold: true, align: "center" }),
                makeBlock("text", { content: "Supporting text for your hero section.", tag: "p", fontSize: "1.2rem", color: "#64748b", align: "center", marginTop: "1rem" }),
                makeBlock("image", { src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80", alt: "Hero", borderRadius: "12px", aspectRatio: "16/7", marginTop: "3rem" }),
            ];
            return root;
        },
    },
];

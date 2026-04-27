// sections/hero.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const heroSections: SectionTemplate[] = [
    {
        id: "hero-split",
        name: "Hero Heading Left",
        category: "Hero",
        previewImage: "/previews/hero/hero-split.png",
        preview: `<div style="font-family:'Inter',sans-serif;padding:60px 80px;background:#f8fafc;display:flex;align-items:center;gap:60px;height:100%;width:100%">
                <div style="flex:1">
                  <div style="font-size:56px;font-weight:900;color:#0f172a;line-height:1.1;margin-bottom:24px;letter-spacing:-0.03em">Launch your next big idea</div>
                  <div style="font-size:20px;color:#64748b;margin-bottom:40px;line-height:1.6;max-width:500px">Build beautiful pages in minutes with our powerful and intuitive drag-and-drop builder.</div>
                  <div style="display:flex;gap:16px">
                    <div style="background:#6366f1;color:#fff;font-size:18px;font-weight:700;padding:18px 36px;border-radius:12px;box-shadow:0 10px 20px rgba(99,102,241,0.2)">Get Started Free</div>
                  </div>
                </div>
                <div style="width:400px;height:400px;background:url(https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80) center/cover;border-radius:24px;box-shadow:0 30px 60px rgba(0,0,0,0.1);flex-shrink:0"></div>
                </div>`,
        create: () => {
            const root = makeBlock("hero", { align: "left", layout: "fluid", bgColor: "#0f172a", textColor: "#ffffff", padding: "6rem 2rem" });
            const columns = makeBlock("columns", { leftWidth: "50", gap: "2rem", align: "center" });
            columns.props.col0 = [
                makeBlock("text", { content: "Launch your next big idea", tag: "h1", fontSize: "3.5rem", color: "#ffffff", bold: true, lineHeight: "1.2" }),
                makeBlock("text", { content: "Build stunning pages in minutes with our powerful drag-and-drop builder.", tag: "p", fontSize: "1.25rem", color: "#cbd5e1", marginTop: "1.5rem" }),
                makeBlock("button", { label: "Get Started", variant: "solid", bgColor: "#3b82f6", textColor: "#ffffff", size: "lg", marginTop: "2rem", fullWidth: false, borderRadius: "8px" }),
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
        previewImage: "/previews/hero/hero-centered.png",
        preview: `<div style="font-family:'Inter',sans-serif;padding:60px 40px;background:linear-gradient(135deg,#0f172a,#1e293b);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;height:100%;width:100%;color:#fff">
                <div style="font-size:64px;font-weight:900;margin-bottom:24px;letter-spacing:-0.04em;line-height:1.1">Design Everything.</div>
                <div style="font-size:22px;color:rgba(255,255,255,0.7);max-width:700px;margin-bottom:48px;line-height:1.6">The most powerful and flexible builder for modern creative teams to launch fast and scale.</div>
                <div style="background:linear-gradient(to right,#ec4899,#8b5cf6);padding:20px 48px;border-radius:99px;font-size:20px;font-weight:700;box-shadow:0 15px 30px rgba(236,72,153,0.3)">Start for free</div>
                </div>`,
        create: () => {
            const root = makeBlock("hero", { align: "center", bgColor: "#1e293b", bgImage: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2000&q=80", bgOverlay: "rgba(15,23,42,0.75)", textColor: "#ffffff", padding: "8rem 2rem", minHeight: "80vh" });
            root.props.childBlocks = [
                makeBlock("text", { content: "Design Everything.", tag: "h1", fontSize: "4.5rem", color: "#ffffff", bold: true, align: "center", lineHeight: "1.1" }),
                makeBlock("text", { content: "The most powerful builder for modern creative teams to launch fast.", tag: "p", fontSize: "1.5rem", color: "#e2e8f0", align: "center", marginTop: "1.5rem" }),
                makeBlock("button", { label: "Start for free", variant: "gradient", gradientFrom: "#ec4899", gradientTo: "#8b5cf6", textColor: "#ffffff", size: "xl", align: "center", marginTop: "3rem", fullWidth: false, borderRadius: "9999px" }),
            ];
            return root;
        },
    },
    {
        id: "hero-right",
        name: "Hero Heading Right",
        category: "Hero",
        previewImage: "/previews/hero/hero-right.png",
        preview: `<div style="font-family:'Inter',sans-serif;padding:60px 80px;background:#ffffff;display:flex;align-items:center;gap:60px;height:100%;width:100%">
                <div style="width:400px;height:400px;background:url(https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80) center/cover;border-radius:24px;box-shadow:0 30px 60px rgba(0,0,0,0.05);flex-shrink:0"></div>
                <div style="flex:1">
                  <div style="font-size:56px;font-weight:900;color:#0f172a;line-height:1.1;margin-bottom:24px;letter-spacing:-0.03em">Track your growth</div>
                  <div style="font-size:20px;color:#64748b;margin-bottom:40px;line-height:1.6;max-width:500px">Smart analytics and real-time data to help you scale your business faster than ever.</div>
                  <div style="background:#0f172a;color:#fff;font-size:18px;font-weight:700;padding:18px 36px;border-radius:12px;display:inline-block">View Demo</div>
                </div>
                </div>`,
        create: () => {
            const root = makeBlock("hero", { align: "right", bgColor: "#f8fafc", textColor: "#0f172a", padding: "6rem 2rem" });
            const columns = makeBlock("columns", { leftWidth: "50", gap: "2rem", align: "center" });
            columns.props.col0 = [makeBlock("image", { src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80", alt: "Hero", borderRadius: "16px", aspectRatio: "4/3" })];
            columns.props.col1 = [
                makeBlock("text", { content: "Track your growth", tag: "h1", fontSize: "3.5rem", color: "#0f172a", bold: true }),
                makeBlock("text", { content: "Smart analytics to help you scale your business faster than ever before.", tag: "p", fontSize: "1.25rem", color: "#64748b", marginTop: "1rem" }),
                makeBlock("button", { label: "View Demo", variant: "solid", bgColor: "#0f172a", textColor: "#ffffff", size: "lg", marginTop: "2rem", fullWidth: false }),
            ];
            root.props.childBlocks = [columns];
            return root;
        },
    },
    {
        id: "hero-stack",
        name: "Hero Stack",
        category: "Hero",
        previewImage: "/previews/hero/hero-stack.png",
        preview: `<div style="font-family:'Inter',sans-serif;padding:60px 80px;background:#f1f5f9;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;height:100%;width:100%">
                <div style="font-size:56px;font-weight:900;color:#0f172a;margin-bottom:16px;letter-spacing:-0.03em">Experience the Future</div>
                <div style="font-size:22px;color:#64748b;margin-bottom:48px;max-width:700px">A completely new and intuitive way to build web applications without any complexity.</div>
                <div style="width:900px;height:360px;background:url(https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&q=80) center/cover;border-radius:24px;box-shadow:0 40px 100px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;position:relative">
                  <div style="width:80px;height:80px;background:rgba(255,255,255,0.95);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 20px 40px rgba(0,0,0,0.2)">
                    <div style="width:0;height:0;border-top:15px solid transparent;border-bottom:15px solid transparent;border-left:22px solid #6366f1;margin-left:8px"></div>
                  </div>
                </div>
                </div>`,
        create: () => {
            const root = makeBlock("hero", { align: "center", bgColor: "#ffffff", textColor: "#0f172a", padding: "4rem 2rem" });
            root.props.childBlocks = [
                makeBlock("text", { content: "Experience the Future", tag: "h1", fontSize: "3rem", color: "#0f172a", bold: true, align: "center" }),
                makeBlock("text", { content: "A new way to build web applications without the complexity.", tag: "p", fontSize: "1.2rem", color: "#64748b", align: "center", marginTop: "1rem" }),
                makeBlock("image", { src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80", alt: "Hero", borderRadius: "12px", aspectRatio: "16/7", marginTop: "3rem" }),
            ];
            return root;
        },
    },
];

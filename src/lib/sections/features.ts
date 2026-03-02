// sections/features.ts
import { makeBlock } from "../blockConfig";
import type { SectionTemplate } from "@/@Types";

export const featuresSections: SectionTemplate[] = [
  {
    id: "features-grid",
    name: "3-Column Feature Grid",
    category: "Features",
    preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary);text-align:center">
      <div style="font-size:9px;font-weight:700;color:var(--text);margin-bottom:8px">Why Choose Us?</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
        ${[1, 2, 3].map(() => `<div style="background:var(--surface);border-radius:4px;padding:6px;border:1px solid var(--border)">
          <div style="width:14px;height:14px;background:var(--primary);border-radius:3px;margin:0 auto 4px;opacity:0.8"></div>
          <div style="font-size:6px;font-weight:600;color:var(--text)">Feature</div>
          <div style="font-size:5px;color:var(--text-muted)">Short desc.</div>
        </div>`).join("")}
      </div>
    </div>`,
    create: () => makeBlock("features", {
      bgColor: "#f8fafc", textColor: "#0f172a", padding: "5rem 2rem",
      title: "Why Choose Us?", subtitle: "Everything you need to build faster.",
      align: "center", columns: 3,
      cardStyle: "raised", cardBg: "#ffffff", cardRadius: "16px",
      features: [
        { id: "1", title: "Lightning Fast", description: "Optimized performance ensures pages load in milliseconds.", icon: "Zap" },
        { id: "2", title: "Beautiful Design", description: "Modern, pre-built components that look great out of the box.", icon: "Palette" },
        { id: "3", title: "Fully Responsive", description: "Your site will look perfect on all devices.", icon: "Smartphone" },
        { id: "4", title: "SEO Optimized", description: "Built with best practices to help you rank higher.", icon: "Search" },
        { id: "5", title: "Secure & Reliable", description: "Enterprise-grade security and 99.9% uptime.", icon: "Shield" },
        { id: "6", title: "24/7 Support", description: "Our team is always here when you need it.", icon: "LifeBuoy" },
      ],
    }),
  },
  {
    id: "features-alternating",
    name: "Alternating Image & Text",
    category: "Features",
    preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary)">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <div style="flex:1">
          <div style="font-size:8px;font-weight:700;color:var(--text)">Build visually</div>
          <div style="font-size:6px;color:var(--text-muted)">See what your site looks like as you build.</div>
        </div>
        <div style="width:44px;height:28px;background:var(--surface);border-radius:4px;flex-shrink:0;border:1px solid var(--border)"></div>
      </div>
      <div style="border-top:1px solid var(--border);padding-top:8px;display:flex;gap:8px;align-items:center">
        <div style="width:44px;height:28px;background:var(--surface);border-radius:4px;flex-shrink:0;border:1px solid var(--border)"></div>
        <div style="flex:1">
          <div style="font-size:8px;font-weight:700;color:var(--text)">Publish instantly</div>
          <div style="font-size:6px;color:var(--text-muted)">Push changes live with a click.</div>
        </div>
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#f8fafc", padding: "5rem 2rem" });
      const row1 = makeBlock("columns", { leftWidth: "50", gap: "4rem", align: "center", padding: "0 0 4rem 0" });
      row1.props.col0 = [
        makeBlock("text", { content: "Build visually", tag: "h2", fontSize: "2.5rem", bold: true, color: "#0f172a" }),
        makeBlock("text", { content: "See exactly what your site will look like as you build it.", tag: "p", fontSize: "1.125rem", color: "#64748b" }),
      ];
      row1.props.col1 = [makeBlock("image", { src: "https://images.unsplash.com/photo-1542744094-24638ea0b562?auto=format&fit=crop&w=800&q=80", borderRadius: "12px", aspectRatio: "16/9" })];
      const row2 = makeBlock("columns", { leftWidth: "50", gap: "4rem", align: "center", padding: "4rem 0 0 0" });
      row2.props.col0 = [makeBlock("image", { src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", borderRadius: "12px", aspectRatio: "16/9" })];
      row2.props.col1 = [
        makeBlock("text", { content: "Publish instantly", tag: "h2", fontSize: "2.5rem", bold: true, color: "#0f172a" }),
        makeBlock("text", { content: "Push your changes live with a single click.", tag: "p", fontSize: "1.125rem", color: "#64748b" }),
      ];
      root.props.childBlocks = [row1, makeBlock("divider", { color: "#e2e8f0" }), row2];
      return root;
    },
  },
];

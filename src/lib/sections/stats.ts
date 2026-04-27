// sections/stats.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const statsSections: SectionTemplate[] = [
  {
    id: "stats-strip-modern",
    name: "Modern Stats Strip",
    category: "Stats",
    previewImage: "/previews/stats/stats-strip-modern.png",
    preview: `<div style="font-family:'Inter',sans-serif;padding:80px;background:#0f172a;display:flex;justify-content:space-around;align-items:center;height:100%;width:100%;box-sizing:border-box">
      ${[["420%", "Speed"], ["21K", "Ratings"], ["110X", "Growth"]].map(([v, l]) => `
        <div style="text-align:center">
          <div style="font-size:64px;font-weight:900;color:#6366f1;letter-spacing:-0.04em">${v}</div>
          <div style="font-size:16px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:3px;margin-top:8px">${l}</div>
        </div>`).join("")}
    </div>`,
    create: () => {
      return makeBlock("stats", {
        layout: "strip",
        padding: "4rem 2rem",
        bgColor: "transparent",
        accentColor: "var(--primary)",
        items: [
          { id: "1", value: "420%", label: "More Speed", description: "Ut porttitor leo a diam sollicitudin.", icon: "Zap" },
          { id: "2", value: "21.2K", label: "Total Ratings", description: "Maecenas pharetra convallis posuere morbi.", icon: "Star" },
          { id: "3", value: "110X", label: "Efficiency Level", description: "Lacinia at quis risus sed vulputate.", icon: "Activity" },
          { id: "4", value: "16M", label: "Total Users", description: "Fames ac turpis egestas sed tempus.", icon: "Users" },
        ]
      });
    },
  },
  {
    id: "stats-hero-grid",
    name: "Stats Hero Grid",
    category: "Stats",
    previewImage: "/previews/stats/stats-hero-grid.png",
    preview: `<div style="font-family:'Inter',sans-serif;padding:80px;background:#ffffff;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;height:100%;width:100%;box-sizing:border-box">
      <div>
        <div style="font-size:48px;font-weight:900;color:#0f172a;margin-bottom:24px;line-height:1.1">The numbers speak for themselves.</div>
        <div style="font-size:18px;color:#64748b;line-height:1.6">Join over 10,000 teams building the future with our tools.</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        ${[1, 2, 3, 4].map(() => `<div style="height:120px;background:#f1f5f9;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#6366f1">100+</div>`).join("")}
      </div>
    </div>`,
    create: () => {
      const parent = makeBlock("columns", {
        gap: "4rem",
        padding: "6rem 2rem",
        leftWidth: "50",
      });
      parent.props.col0 = [
        makeBlock("text", { content: "Let's build something great.", tag: "h2", fontSize: "4rem", bold: true, color: "#000" }),
        makeBlock("text", { content: "Enim sed faucibus turpis in eu mi bibendum neque egestas. Elit pellentesque habitant.", tag: "p", fontSize: "1.1rem", marginTop: "1.5rem", color: "var(--text-muted)" }),
      ];
      parent.props.col1 = [
        makeBlock("stats", {
          layout: "grid",
          columns: 2,
          gap: "2.5rem",
          padding: "0",
          accentColor: "var(--primary)",
          cardStyle: "none",
          items: [
            { id: "1", value: "420%", label: "Data Efficiency", icon: "Database" },
            { id: "2", value: "708+", label: "Conversion Rate", icon: "TrendingUp" },
            { id: "3", value: "1.82M", label: "AI LLM Scale", icon: "Cpu" },
            { id: "4", value: "3.23K", label: "Total Users", icon: "UserCheck" },
          ]
        })
      ];
      return parent;
    },
  }
];

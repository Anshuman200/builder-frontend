// sections/stats.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const statsSections: SectionTemplate[] = [
  {
    id: "stats-strip-modern",
    name: "Modern Stats Strip",
    category: "Stats",
    preview: `<div style="padding:16px;background:var(--bg-secondary);display:flex;justify-content:space-around;gap:12px">
      ${[["420%", "Speed"], ["21K", "Ratings"], ["110X", "Growth"]].map(([v, l]) => `
        <div style="text-align:center">
          <div style="font-size:14px;font-weight:900;color:var(--primary)">${v}</div>
          <div style="font-size:6px;font-weight:700;color:var(--text-muted);text-transform:uppercase">${l}</div>
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
    preview: `<div style="padding:16px;background:var(--bg);display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div style="grid-column: span 2; font-size:10px; font-weight:900; margin-bottom:4px">By the numbers</div>
      ${[1, 2, 3, 4].map(() => `<div style="height:20px;background:var(--surface);border-radius:4px"></div>`).join("")}
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

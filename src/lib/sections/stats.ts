// sections/stats.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const statsSections: SectionTemplate[] = [
  {
    id: "stats-strip-modern",
    name: "Modern Stats Strip",
    category: "Stats",
    previewImage: "/previews/stats/stats-strip-modern.png",
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

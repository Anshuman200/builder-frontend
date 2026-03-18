// sections/stats.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/@Types";

export const statsSections: SectionTemplate[] = [
  {
    id: "stats-strip",
    name: "Stats Strip",
    category: "Stats",
    preview: `<div style="font-family:sans-serif;padding:14px;background:var(--bg-secondary);display:flex;justify-content:space-around;align-items:center">
      ${[["10K+", "Users"], ["99%", "Uptime"], ["50+", "Countries"]].map(([n, l]) => `
        <div style="text-align:center">
          <div style="font-size:12px;font-weight:800;color:var(--primary)">${n}</div>
          <div style="font-size:6px;font-weight:600;color:var(--text-muted)">${l}</div>
        </div>`).join("")}
    </div>`,
    create: () => {
      const root = makeBlock("container", {
        bgColor: "#6366f1",
        padding: "4rem 2rem",
      });
      const cols = makeBlock("columns", {
        leftWidth: "25",
        gap: "0",
        align: "center",
      });
      const stat = (number: string, label: string) => {
        const c = makeBlock("container", { bgColor: "transparent", padding: "1.5rem" });
        c.props.childBlocks = [
          makeBlock("text", { content: number, tag: "p", fontSize: "3rem", bold: true, align: "center", color: "#ffffff" }),
          makeBlock("text", { content: label, tag: "p", fontSize: "1rem", align: "center", color: "rgba(255,255,255,0.75)", marginTop: "0.25rem" }),
        ];
        return c;
      };
      cols.props.col0 = [stat("10,000+", "Happy Customers")];
      cols.props.col1 = [stat("99.9%", "Uptime SLA")];
      cols.props.col2 = [stat("50+", "Countries Served")];
      cols.props.col3 = [stat("4.9★", "Average Rating")];
      root.props.childBlocks = [cols];
      return root;
    },
  },
  {
    id: "stats-grid",
    name: "Stats Grid with Context",
    category: "Stats",
    preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary)">
      <div style="font-size:8px;font-weight:700;color:var(--text);text-align:center;margin-bottom:8px">By the numbers</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        ${[["98%", "Satisfaction"], ["2M+", "Pages built"], ["500ms", "Avg load"], ["24/7", "Support"]].map(([n, l]) =>
          `<div style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:6px;text-align:center">
            <div style="font-size:10px;font-weight:800;color:var(--primary)">${n}</div>
            <div style="font-size:5px;color:var(--text-muted)">${l}</div>
          </div>`).join("")}
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#f8fafc", padding: "5rem 2rem" });
      root.props.childBlocks = [
        makeBlock("text", { content: "By the Numbers", tag: "h2", fontSize: "2.5rem", bold: true, align: "center", color: "#0f172a" }),
        makeBlock("text", { content: "Real results from real teams", tag: "p", fontSize: "1.125rem", align: "center", color: "#64748b", marginTop: "0.5rem", marginBottom: "3rem" }),
        (() => {
          const cols = makeBlock("columns", { leftWidth: "25", gap: "1.5rem", align: "center" });
          const statCard = (number: string, label: string, desc: string) => {
            const c = makeBlock("container", { bgColor: "#ffffff", padding: "2rem", borderRadius: "16px" });
            c.props.childBlocks = [
              makeBlock("text", { content: number, tag: "p", fontSize: "2.5rem", bold: true, align: "center", color: "#6366f1" }),
              makeBlock("text", { content: label, tag: "p", fontSize: "1rem", align: "center", color: "#0f172a", bold: true }),
              makeBlock("text", { content: desc, tag: "p", fontSize: "0.875rem", align: "center", color: "#64748b" }),
            ];
            return c;
          };
          cols.props.col0 = [statCard("98%", "Satisfaction Rate", "Across all customers")];
          cols.props.col1 = [statCard("2M+", "Pages Built", "And growing daily")];
          cols.props.col2 = [statCard("< 500ms", "Load Time", "Global average")];
          cols.props.col3 = [statCard("24/7", "Support", "Always available")];
          return cols;
        })()
      ];
      return root;
    },
  }
];

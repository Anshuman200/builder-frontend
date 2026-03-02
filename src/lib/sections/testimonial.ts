// sections/testimonial.ts
import { makeBlock } from "../blockConfig";
import type { SectionTemplate } from "@/@Types";

export const testimonialSections: SectionTemplate[] = [
    {
        id: "testimonial-slider",
        name: "Testimonial Slider",
        category: "Testimonial",
        preview: `<div style="font-family:sans-serif;padding:14px;background:var(--bg-secondary);text-align:center">
      <div style="font-size:7px;color:var(--text-muted);margin-bottom:6px;font-style:italic">"This product changed how we work. Absolutely incredible."</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:4px">
        <div style="width:16px;height:16px;border-radius:50%;background:var(--primary)"></div>
        <div style="font-size:7px;font-weight:600;color:var(--text)">Jane Smith, CEO</div>
      </div>
    </div>`,
        create: () => {
            const root = makeBlock("container", { bgColor: "#ffffff", padding: "5rem 2rem" });
            root.props.childBlocks = [
                makeBlock("text", { content: "What Our Customers Say", tag: "h2", fontSize: "2.5rem", bold: true, align: "center", color: "#0f172a" }),
                makeBlock("text", { content: "\"This product changed how we work. Absolutely incredible experience that we never expected.\"", tag: "p", fontSize: "1.5rem", color: "#374151", align: "center", marginTop: "2rem", italic: true }),
                makeBlock("text", { content: "— Jane Smith, CEO at Acme Corp", tag: "p", fontSize: "1rem", color: "#6366f1", align: "center", marginTop: "1rem", bold: true }),
            ];
            return root;
        },
    },
    {
        id: "testimonial-stack",
        name: "Testimonial Stack",
        category: "Testimonial",
        preview: `<div style="font-family:sans-serif;padding:10px;background:var(--bg-secondary)">
      ${[1, 2].map(() => `<div style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:7px;margin-bottom:5px">
        <div style="font-size:6px;color:var(--text-muted);font-style:italic;margin-bottom:4px">"Highly recommend to any team."</div>
        <div style="font-size:6px;font-weight:700;color:var(--primary)">John Doe · CTO</div>
      </div>`).join("")}
    </div>`,
        create: () => {
            const root = makeBlock("container", { bgColor: "#f8fafc", padding: "5rem 2rem" });
            const cols = makeBlock("columns", { leftWidth: "50", gap: "2rem" });
            const card = (quote: string, name: string) => {
                const c = makeBlock("container", { bgColor: "#ffffff", padding: "2rem", borderRadius: "12px" });
                c.props.childBlocks = [
                    makeBlock("text", { content: `"${quote}"`, tag: "p", fontSize: "1rem", color: "#374151", italic: true }),
                    makeBlock("text", { content: `— ${name}`, tag: "p", fontSize: "0.875rem", color: "#6366f1", bold: true, marginTop: "1rem" }),
                ];
                return c;
            };
            cols.props.col0 = [
                card("Highly recommend to any team building products.", "John Doe · CTO"),
                card("Saved us hundreds of hours every month.", "Emily Chen · VP Engineering"),
            ];
            cols.props.col1 = [
                card("The best tool we've used in the past decade.", "Mark Wilson · Founder"),
                card("Our design velocity tripled after adopting this.", "Sara Lee · Design Lead"),
            ];
            root.props.childBlocks = [
                makeBlock("text", { content: "Loved by Teams", tag: "h2", fontSize: "2.5rem", bold: true, align: "center", marginBottom: "3rem" }),
                cols,
            ];
            return root;
        },
    },
];

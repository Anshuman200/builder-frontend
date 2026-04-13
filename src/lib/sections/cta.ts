// sections/cta.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const ctaSections: SectionTemplate[] = [
  {
    id: "cta-split",
    name: "Split CTA with Image",
    category: "CTA",
    preview: `<div style="font-family:sans-serif;padding:10px;background:var(--bg-secondary);display:flex;gap:8px;align-items:center">
      <div style="flex:1">
        <div style="font-size:8px;font-weight:800;color:var(--text);margin-bottom:3px">Take the next step</div>
        <div style="font-size:6px;color:var(--text-muted);margin-bottom:6px">Start building today.</div>
        <div style="display:inline-block;background:#6366f1;color:#fff;font-size:5px;font-weight:700;padding:3px 8px;border-radius:3px">Start Free Trial</div>
      </div>
      <div style="width:50px;height:40px;background:var(--surface);border-radius:5px;border:1px solid var(--border)"></div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#0f172a", padding: "5rem 2rem" });
      const cols = makeBlock("columns", { leftWidth: "55", gap: "4rem", align: "center" });
      cols.props.col0 = [
        makeBlock("text", { content: "Take the Next Step", tag: "h2", fontSize: "2.75rem", bold: true, color: "#ffffff" }),
        makeBlock("text", { content: "Start your free trial today. No credit card required. Cancel anytime.", tag: "p", fontSize: "1.125rem", color: "#94a3b8", marginTop: "1rem" }),
        makeBlock("button", {
          text: "Start Free Trial",
          url: "#",
          variant: "solid",
          bgColor: "#6366f1",
          textColor: "#ffffff",
          align: "left",
          size: "large",
          borderRadius: "12px",
          marginTop: "2rem",
        }),
      ];
      cols.props.col1 = [
        makeBlock("image", {
          src: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
          borderRadius: "16px",
          aspectRatio: "4/3",
        }),
      ];
      root.props.childBlocks = [cols];
      return root;
    },
  },
  {
    id: "cta-card",
    name: "CTA Card on Gradient",
    category: "CTA",
    preview: `<div style="font-family:sans-serif;padding:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6)">
      <div style="background:rgba(255,255,255,0.12);border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:8px;font-weight:800;color:#fff;margin-bottom:3px">Start building today</div>
        <div style="font-size:5px;color:rgba(255,255,255,0.7);margin-bottom:6px">Free forever for personal use.</div>
        <div style="display:inline-block;background:#fff;color:#6366f1;font-size:5px;font-weight:700;padding:3px 10px;border-radius:20px">Sign Up Free</div>
      </div>
    </div>`,
    create: () => {
      const outer = makeBlock("container", {
        bgColor: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        padding: "5rem 2rem",
      });
      const card = makeBlock("container", {
        bgColor: "rgba(255,255,255,0.1)",
        padding: "4rem 3rem",
        borderRadius: "24px",
        maxWidth: "700px",
      });
      card.props.childBlocks = [
        makeBlock("text", { content: "Start Building Today", tag: "h2", fontSize: "2.75rem", bold: true, align: "center", color: "#ffffff" }),
        makeBlock("text", { content: "Free forever for personal use. Upgrade when you grow.", tag: "p", fontSize: "1.125rem", align: "center", color: "rgba(255,255,255,0.80)", marginTop: "0.75rem" }),
        makeBlock("button", {
          text: "Sign Up Free",
          url: "#",
          variant: "solid",
          bgColor: "#ffffff",
          textColor: "#6366f1",
          align: "center",
          size: "large",
          borderRadius: "9999px",
          marginTop: "2rem",
        }),
      ];
      outer.props.childBlocks = [card];
      return outer;
    },
  },
];

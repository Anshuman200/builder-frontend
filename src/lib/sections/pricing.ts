// sections/pricing.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const pricingSections: SectionTemplate[] = [
  {
    id: "pricing-cards",
    name: "Pricing Cards",
    category: "Pricing",
    preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary);text-align:center">
      <div style="font-size:9px;font-weight:700;color:var(--text);margin-bottom:8px">Simple Pricing</div>
      <div style="display:flex;gap:5px">
        <div style="flex:1;border:1px solid var(--border);border-radius:6px;padding:6px;background:var(--surface);box-shadow:0 2px 8px rgba(0,0,0,0.08)">
          <div style="font-size:7px;font-weight:700;color:var(--text)">Starter</div>
          <div style="font-size:9px;font-weight:800;color:var(--text);margin:2px 0">$0</div>
          <div style="font-size:6px;color:var(--text-muted)">/mo</div>
        </div>
        <div style="flex:1;border:1px solid var(--primary);border-radius:6px;padding:6px;background:var(--primary);box-shadow:0 4px 16px rgba(99,102,241,0.3)">
          <div style="font-size:7px;font-weight:700;color:#fff">Pro</div>
          <div style="font-size:9px;font-weight:800;color:#fff;margin:2px 0">$29</div>
          <div style="font-size:6px;color:#c7d2fe">/mo</div>
        </div>
        <div style="flex:1;border:1px solid var(--border);border-radius:6px;padding:6px;background:var(--surface);box-shadow:0 2px 8px rgba(0,0,0,0.08)">
          <div style="font-size:7px;font-weight:700;color:var(--text)">Team</div>
          <div style="font-size:9px;font-weight:800;color:var(--text);margin:2px 0">$99</div>
          <div style="font-size:6px;color:var(--text-muted)">/mo</div>
        </div>
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#f8fafc", padding: "5rem 2rem" });
      root.props.childBlocks = [
        makeBlock("text", { content: "Simple, Transparent Pricing", tag: "h2", fontSize: "2.5rem", bold: true, align: "center", color: "#0f172a" }),
        makeBlock("text", { content: "No hidden fees. Cancel anytime.", tag: "p", fontSize: "1.125rem", color: "#64748b", align: "center", marginTop: "1rem" }),
        makeBlock("features", {
          bgColor: "transparent", padding: "3rem 0 0", columns: 3, title: "", subtitle: "",
          cardStyle: "raised", cardBg: "#ffffff", cardRadius: "20px",
          features: [
            { id: "1", title: "Starter — Free", description: "Perfect for individuals just getting started. Everything you need to build fast.", icon: "Package" },
            { id: "2", title: "Pro — $29/mo", description: "Great for growing teams and businesses. Priority support included.", icon: "Rocket" },
            { id: "3", title: "Team — $99/mo", description: "Advanced features for large organizations. Unlimited seats & SSO.", icon: "Building2" },
          ],
        }),
      ];
      return root;
    },
  },
];

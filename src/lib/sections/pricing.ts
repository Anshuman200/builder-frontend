// sections/pricing.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const pricingSections: SectionTemplate[] = [
  {
    id: "pricing-cards",
    name: "Pricing Cards",
    category: "Pricing",
    previewImage: "/previews/pricing/pricing-cards.png",
    preview: `<div style="font-family:'Inter',sans-serif;padding:80px;background:#f8fafc;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;width:100%;box-sizing:border-box">
      <div style="font-size:48px;font-weight:900;color:#0f172a;margin-bottom:16px;letter-spacing:-0.03em">Simple Pricing</div>
      <div style="font-size:20px;color:#64748b;margin-bottom:60px">No hidden fees. Scale as you grow.</div>
      <div style="display:flex;gap:32px;width:100%;max-width:1100px">
        <div style="flex:1;border:1px solid #e2e8f0;border-radius:24px;padding:48px;background:#ffffff;box-shadow:0 10px 30px rgba(0,0,0,0.03)">
          <div style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:12px">Starter</div>
          <div style="font-size:48px;font-weight:900;color:#0f172a;margin-bottom:12px">$0 <span style="font-size:18px;color:#64748b;font-weight:500">/mo</span></div>
          <div style="height:120px;display:flex;flex-direction:column;gap:12px;margin-top:24px">
            ${[1, 2, 3].map(() => `<div style="height:10px;width:100%;background:#f1f5f9;border-radius:99px"></div>`).join("")}
          </div>
        </div>
        <div style="flex:1;border:2px solid #6366f1;border-radius:24px;padding:48px;background:#ffffff;box-shadow:0 20px 40px rgba(99,102,241,0.15);position:relative">
          <div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:#6366f1;color:#fff;font-size:14px;font-weight:800;padding:8px 20px;border-radius:99px;letter-spacing:1px">MOST POPULAR</div>
          <div style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:12px">Pro</div>
          <div style="font-size:48px;font-weight:900;color:#0f172a;margin-bottom:12px">$29 <span style="font-size:18px;color:#64748b;font-weight:500">/mo</span></div>
          <div style="height:120px;display:flex;flex-direction:column;gap:12px;margin-top:24px">
            ${[1, 2, 3, 4].map(() => `<div style="height:10px;width:100%;background:#e0e7ff;border-radius:99px"></div>`).join("")}
          </div>
        </div>
        <div style="flex:1;border:1px solid #e2e8f0;border-radius:24px;padding:48px;background:#ffffff;box-shadow:0 10px 30px rgba(0,0,0,0.03)">
          <div style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:12px">Team</div>
          <div style="font-size:48px;font-weight:900;color:#0f172a;margin-bottom:12px">$99 <span style="font-size:18px;color:#64748b;font-weight:500">/mo</span></div>
          <div style="height:120px;display:flex;flex-direction:column;gap:12px;margin-top:24px">
            ${[1, 2, 3, 4].map(() => `<div style="height:10px;width:100%;background:#f1f5f9;border-radius:99px"></div>`).join("")}
          </div>
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

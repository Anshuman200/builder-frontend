// sections/pricing.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const pricingSections: SectionTemplate[] = [
  {
    id: "pricing-cards",
    name: "Pricing Cards",
    category: "Pricing",
    previewImage: "/previews/pricing/pricing-cards.png",
    create: () => {
      return makeBlock("features", {
        bgColor: "#f8fafc", padding: "5rem 2rem", columns: 3, title: "Simple Pricing", subtitle: "Choose the plan that's right for you.",
        cardStyle: "raised", cardBg: "#ffffff", cardRadius: "20px", align: "center",
        features: [
          { id: "1", title: "Starter — Free", description: "Perfect for individuals just getting started. Everything you need to build fast.", icon: "Package" },
          { id: "2", title: "Pro — $29/mo", description: "Great for growing teams and businesses. Priority support included.", icon: "Rocket" },
          { id: "3", title: "Team — $99/mo", description: "Advanced features for large organizations. Unlimited seats & SSO.", icon: "Building2" },
        ],
      });
    },
  },
];

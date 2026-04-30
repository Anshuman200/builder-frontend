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
      const root = makeBlock("container", { bgColor: "#f8fafc", padding: "5rem 2rem" });
      root.props.childBlocks = [
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

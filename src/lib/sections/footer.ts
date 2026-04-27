// sections/footer.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const footerSections: SectionTemplate[] = [
  {
    id: "footer-simple",
    name: "Simple Footer",
    category: "Footer",
    previewImage: "/previews/footer/footer-simple.png",
    create: () => makeBlock("footer", {
      bgColor: "var(--surface)", textColor: "var(--text)", padding: "48px 32px",
      description: "The easiest way to build pages.",
      copyright: `© ${new Date().getFullYear()} Company. All rights reserved.`,
      fullWidth: true,
      links: [{ id: "1", label: "Privacy", url: "/privacy" }, { id: "2", label: "Terms of Use", url: "/terms" }],
    }),
  },
];

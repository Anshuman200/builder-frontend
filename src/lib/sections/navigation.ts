// sections/navigation.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const navigationSections: SectionTemplate[] = [
  {
    id: "nav-logo-left",
    name: "Navbar Logo Left",
    category: "Navigation",
    previewImage: "/previews/navigation/nav-logo-left.png",
    create: () => makeBlock("header", {
      layout: "standard",
      layoutWidth: "fluid",
      fullWidth: true,
      logoText: "PageCraft",
      links: [
        { id: "1", label: "Features", url: "#features" },
        { id: "2", label: "Pricing", url: "#pricing" },
        { id: "3", label: "About", url: "#about" }
      ],
      showCta: true, ctaText: "Get Started",
      bgColor: "#ffffff", textColor: "#0f172a",
    }),
  },
  {
    id: "nav-logo-center",
    name: "Navbar Logo Center",
    category: "Navigation",
    previewImage: "/previews/navigation/nav-logo-center.png",
    create: () => makeBlock("header", {
      layout: "centered",
      layoutWidth: "fluid",
      fullWidth: true,
      logoText: "PageCraft",
      links: [
        { id: "1", label: "Product", url: "#product" },
        { id: "2", label: "Blog", url: "#blog" }
      ],
      showCta: true, ctaText: "Login",
      bgColor: "#ffffff", textColor: "#0f172a",
      ctaBgColor: "#0f172a",
    }),
  },
  {
    id: "nav-glass-dark",
    name: "Navbar Glass Dark",
    category: "Navigation",
    previewImage: "/previews/navigation/nav-glass-dark.png",
    create: () => makeBlock("header", {
      layout: "standard",
      layoutWidth: "fluid",
      fullWidth: true,
      logoText: "PageCraft",
      style: "glass",
      links: [
        { id: "1", label: "Tour", url: "#tour" },
        { id: "2", label: "Docs", url: "#docs" }
      ],
      showCta: true, ctaText: "Launch App", ctaVariant: "outline",
      bgColor: "#0f172a", textColor: "#ffffff",
    }),
  },
];

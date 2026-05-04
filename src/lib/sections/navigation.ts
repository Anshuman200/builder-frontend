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
      logoText: "Solario Forge",
      links: [],
      showCta: true, ctaText: "Get Started",
      bgColor: "#ffffff", textColor: "#0f172a",
      ctaBgColor: "#0f172a",
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
      logoText: "Solario Forge",
      links: [],
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
      logoText: "Solario Forge",
      style: "glass",
      links: [],
      showCta: true, ctaText: "Launch App", ctaVariant: "outline",
      bgColor: "#0f172a", textColor: "#ffffff",
      ctaBgColor: "#0f172a",
    }),
  },
];

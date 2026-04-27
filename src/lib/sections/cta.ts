// sections/cta.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const ctaSections: SectionTemplate[] = [
  {
    id: "cta-wavy",
    name: "Modern Wavy Gradient",
    category: "CTA",
    previewImage: "/previews/cta/cta-wavy.png",
    create: () => {
      const root = makeBlock("container", {
        bgColor: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 30%, #7c3aed 50%, #ea580c 80%, #fbbf24 100%)",
        padding: "6rem 2rem",
        borderRadius: "24px",
        maxWidth: "100%",
        contentAlign: "center",
      });
      root.props.childBlocks = [
        makeBlock("text", { content: "Ready to Unlock your Brand’s Potential?", tag: "h2", fontSize: "3.5rem", bold: true, align: "center", color: "#ffffff", lineHeight: "1.1" }),
        makeBlock("text", { content: "Our design expertise can take your brand from ordinary to extraordinary. Let's create a lasting impression.", tag: "p", fontSize: "1.25rem", align: "center", color: "rgba(255,255,255,0.8)", marginTop: "1.5rem", maxWidth: "600px" }),
        {
          id: crypto.randomUUID(),
          type: "columns",
          props: {
            padding: "2rem 0 0 0",
            gap: "1rem",
            leftWidth: 50,
            alignItems: "center",
            col0: [
              makeBlock("button", { label: "Get a quote →", variant: "solid", bgColor: "#ffffff", textColor: "#000000", size: "lg", align: "right", fullWidth: false })
            ],
            col1: [
              makeBlock("button", { label: "Learn more", variant: "outline", borderColor: "rgba(255,255,255,0.3)", textColor: "#ffffff", size: "lg", align: "left", fullWidth: false })
            ]
          }
        }
      ];
      return root;
    },
  },
  {
    id: "cta-mobile-ai",
    name: "AI Elevate (Concentric)",
    category: "CTA",
    previewImage: "/previews/cta/cta-mobile-ai.png",
    create: () => {
      const root = makeBlock("container", {
        bgColor: "#e0f2fe",
        padding: "4rem 2rem",
        borderRadius: "24px",
        maxWidth: "100%",
      });
      const cols = makeBlock("columns", { leftWidth: "60", gap: "4rem", align: "center" });
      cols.props.col0 = [
        makeBlock("text", { content: "Experience the Efficiency of Joy Today", tag: "p", fontSize: "0.9rem", bold: true, color: "#3b82f6", bgColor: "#ffffff", padding: "4px 12px", borderRadius: "999px", display: "inline-block" } as any),
        makeBlock("text", { content: "Ready to Elevate Your Customer Service?", tag: "h2", fontSize: "3rem", bold: true, color: "#0f172a", marginTop: "1.5rem" }),
        makeBlock("text", { content: "Take the next step toward transforming your customer service. With Joy's AI-powered assistance, provide exceptional support that sets you apart.", tag: "p", fontSize: "1.1rem", color: "#475569", marginTop: "1.5rem" }),
        {
          id: crypto.randomUUID(),
          type: "columns",
          props: {
            padding: "2rem 0 0 0",
            gap: "1rem",
            leftWidth: 50,
            col0: [makeBlock("button", { label: "Get started now →", variant: "solid", bgColor: "#0284c7", textColor: "#ffffff", size: "lg", align: "left" })],
            col1: [makeBlock("button", { label: "Try demo for free", variant: "soft", bgColor: "#0284c7", textColor: "#0284c7", size: "lg", align: "left" })]
          }
        }
      ];
      cols.props.col1 = [
        makeBlock("image", {
          src: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
          alt: "Mobile App",
          borderRadius: "24px",
          aspectRatio: "9/16",
          width: "300px",
          align: "center",
          shadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
        } as any)
      ];
      root.props.childBlocks = [cols];
      return root;
    },
  },
  {
    id: "cta-laptop-luxury",
    name: "Laptop Catchy Headline",
    category: "CTA",
    previewImage: "/previews/cta/cta-laptop-luxury.png",
    create: () => {
      const root = makeBlock("container", {
        bgColor: "#f9fafb",
        padding: "6rem 2rem",
        borderRadius: "24px",
        maxWidth: "100%",
      });
      const cols = makeBlock("columns", { leftWidth: "50", gap: "3rem", align: "center" });
      cols.props.col0 = [
        makeBlock("text", { content: "LOREM IPSUM DOLOR", tag: "p", fontSize: "0.75rem", bold: true, color: "#3b82f6", letterSpacing: "0.1em" }),
        makeBlock("text", { content: "A catchy headline that grab user attention", tag: "h2", fontSize: "2.5rem", bold: true, color: "#111827", marginTop: "0.5rem" }),
        makeBlock("text", { content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin interdum enim turpis, vitae sollicitudin eros dignissim sed. Maecenas vitae facilisis metus.", tag: "p", fontSize: "1rem", color: "#6b7280", marginTop: "1.5rem" }),
        {
          id: crypto.randomUUID(),
          type: "columns",
          props: {
            padding: "2rem 0 0 0",
            gap: "1rem",
            leftWidth: 50,
            col0: [makeBlock("button", { label: "Primary action", variant: "solid", bgColor: "#2563eb", textColor: "#ffffff", size: "md", align: "left" })],
            col1: [makeBlock("button", { label: "Secondary action", variant: "soft", bgColor: "#2563eb", textColor: "#2563eb", size: "md", align: "left" })]
          }
        }
      ];
      cols.props.col1 = [
        makeBlock("image", {
          src: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
          alt: "Laptop Showcase",
          borderRadius: "12px",
          aspectRatio: "16/10",
          shadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
        } as any)
      ];
      root.props.childBlocks = [cols];
      return root;
    },
  },
  {
    id: "cta-minimalist",
    name: "Minimalist Pill Contrast",
    category: "CTA",
    previewImage: "/previews/cta/cta-minimalist.png",
    create: () => {
      const root = makeBlock("container", {
        bgColor: "#ffffff",
        padding: "8rem 2rem",
        borderRadius: "24px",
        contentAlign: "center",
        maxWidth: "100%",
      });
      root.props.childBlocks = [
        makeBlock("text", { content: "Ready to make everyday life clearer and easier?", tag: "h2", fontSize: "4rem", bold: true, align: "center", color: "#000000", maxWidth: "800px", lineHeight: "1.1" }),
        makeBlock("text", { content: "EyeSight brings together comfort, connection, and smart support in one simple pair of glasses designed for real life.", tag: "p", fontSize: "1.2rem", align: "center", color: "#666666", marginTop: "1.5rem", maxWidth: "500px" }),
        {
          id: crypto.randomUUID(),
          type: "columns",
          props: {
            padding: "3rem 0 0 0",
            gap: "1rem",
            leftWidth: 50,
            alignItems: "center",
            col0: [makeBlock("button", { label: "Buy now", variant: "outline", borderColor: "#000000", textColor: "#000000", size: "lg", align: "right", borderRadius: "9999px", fullWidth: false })],
            col1: [makeBlock("button", { label: "Learn more", variant: "solid", bgColor: "#000000", textColor: "#ffffff", size: "lg", align: "left", borderRadius: "9999px", fullWidth: false })]
          }
        }
      ];
      return root;
    },
  },
];

// lib/blockConfig.ts
import type { Block } from "@/stores/editorStore";

// ✅ Use Lucide icon names instead of generic string
import type * as LucideIcons from "lucide-react";
export type IconName = keyof typeof LucideIcons;

export interface BlockConfig {
  type: string;
  label: string;
  icon: IconName; // strictly typed icon
  defaultProps: Record<string, unknown>;
}

// ✅ Block definitions
export const BLOCK_TYPES: BlockConfig[] = [
  {
    type: "hero",
    label: "Hero",
    icon: "Sparkles",
    defaultProps: {
      heading: "Welcome to PageCraft",
      subheading: "Build beautiful pages in minutes — no code needed.",
      ctaLabel: "Get Started",
      ctaHref: "#",
      align: "center",
      bgColor: "#6366f1",
      textColor: "#ffffff",
      minHeight: "420px",
    },
  },
  {
    type: "text",
    label: "Text / Heading",
    icon: "Type",
    defaultProps: {
      content: "Add your text here.",
      tag: "p",
      align: "left",
      fontSize: "1rem",
      color: "",
      bold: false,
    },
  },
  {
    type: "image",
    label: "Image",
    icon: "Image",
    defaultProps: {
      src: "https://placehold.co/800x400/e2e8f0/64748b?text=Image",
      alt: "Image",
      width: "100%",
      objectFit: "cover",
      borderRadius: "0px",
    },
  },
  {
    type: "button",
    label: "Button",
    icon: "MousePointerClick",
    defaultProps: {
      label: "Click me",
      href: "#",
      variant: "primary",
      size: "md",
      align: "left",
      fullWidth: false,
    },
  },
  {
    type: "divider",
    label: "Divider",
    icon: "Minus",
    defaultProps: {
      style: "solid",
      color: "",
      thickness: "1px",
      marginY: "1rem",
    },
  },
  {
    type: "columns",
    label: "2 Columns",
    icon: "Columns2",
    defaultProps: {
      gap: "1.5rem",
      leftWidth: "50",
    },
  },
];

// ✅ Create a block with default props
export function createBlock(type: string): Block {
  const config = BLOCK_TYPES.find((b) => b.type === type);
  const defaultProps = config?.defaultProps ?? {};
  return {
    id: crypto.randomUUID(),
    type,
    props: { ...defaultProps },
    ...(type === "columns" ? { children: [] } : {}),
  };
}
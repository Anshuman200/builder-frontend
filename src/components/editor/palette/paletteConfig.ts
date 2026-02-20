import type { Block, BlockStyle } from "@/stores/editorStore";
import {
    LayoutTemplate,
    Type,
    Image,
    MousePointer,
    Minus,
    Columns2,
} from "lucide-react";
import type { ComponentType } from "react";

export type BlockType = "hero" | "text" | "image" | "button" | "divider" | "columns";

export interface PaletteBlockConfig {
    type: BlockType;
    label: string;
    description: string;
    icon: ComponentType<{ size?: number; className?: string }>;
    defaultProps: Record<string, unknown>;
    defaultStyle?: Partial<BlockStyle>;
}

export const PALETTE_BLOCKS: PaletteBlockConfig[] = [
    {
        type: "hero",
        label: "Hero Section",
        description: "Full-width hero with headline and CTA",
        icon: LayoutTemplate,
        defaultProps: {
            headline: "Build Something Amazing",
            subheadline:
                "Your compelling subheadline goes here. Tell visitors what makes you different.",
            ctaLabel: "Get Started",
            ctaUrl: "#",
            gradientFrom: "#0f0f23",
            gradientTo: "#1a0533",
            minHeight: "80vh",
            showStats: false,
        },
        defaultStyle: { padding: "0" },
    },
    {
        type: "text",
        label: "Text / Heading",
        description: "Paragraph, heading, or any text block",
        icon: Type,
        defaultProps: {
            tag: "p",
            content: "Your text goes here.",
            color: "#0f172a",
            fontSize: "16px",
            fontWeight: "400",
            textAlign: "left",
            lineHeight: "1.6",
        },
        defaultStyle: { padding: "16px 24px" },
    },
    {
        type: "image",
        label: "Image",
        description: "Single image with optional caption",
        icon: Image,
        defaultProps: {
            src: "",
            alt: "",
            objectFit: "cover",
            caption: "",
            width: "100%",
            height: "300px",
            borderRadius: "0px",
        },
        defaultStyle: { padding: "0" },
    },
    {
        type: "button",
        label: "Button",
        description: "CTA or navigation button",
        icon: MousePointer,
        defaultProps: {
            label: "Click Me",
            href: "#",
            openNewTab: false,
            variant: "primary",
            size: "md",
            bgColor: "#6366f1",
            textColor: "#ffffff",
            fullWidth: false,
        },
        defaultStyle: { padding: "24px", background: "transparent" },
    },
    {
        type: "divider",
        label: "Divider",
        description: "Horizontal rule to separate sections",
        icon: Minus,
        defaultProps: {
            style: "solid",
            thickness: 1,
            width: "100%",
            color: "rgba(0,0,0,0.12)",
        },
        defaultStyle: { padding: "16px 24px" },
    },
    {
        type: "columns",
        label: "2 Columns",
        description: "Side-by-side columns for content",
        icon: Columns2,
        defaultProps: {
            ratio: "1:1",
            gap: 24,
            stackMobile: true,
        },
        defaultStyle: { padding: "32px 24px" },
    },
];

export function createDefaultBlock(type: BlockType): Block {
    const config = PALETTE_BLOCKS.find((c) => c.type === type);
    if (!config) throw new Error(`Unknown block type: ${type}`);
    return {
        id: crypto.randomUUID(),
        type,
        props: { ...config.defaultProps },
        style: config.defaultStyle ? { ...config.defaultStyle } : undefined,
        children: type === "columns" ? [] : undefined,
    };
}

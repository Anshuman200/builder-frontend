"use client";

import type { Block, BlockStyle } from "@/stores/editorStore";
import { useEditorStore } from "@/stores/editorStore";
import { HeroBlock } from "./HeroBlock";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ButtonBlock } from "./ButtonBlock";
import { DividerBlock } from "./DividerBlock";
import { ColumnsBlock } from "./ColumnsBlock";

interface BlockRendererProps {
    block: Block;
}

function resolveStyle(block: Block, viewMode: "desktop" | "tablet" | "mobile"): BlockStyle {
    const base = block.style ?? {};
    if (viewMode === "tablet" && base.responsive?.tablet) {
        return { ...base, ...base.responsive.tablet };
    }
    if (viewMode === "mobile" && base.responsive?.mobile) {
        return { ...base, ...base.responsive.mobile };
    }
    return base;
}

export function BlockRenderer({ block }: BlockRendererProps) {
    const { viewMode } = useEditorStore();
    const style = resolveStyle(block, viewMode);

    switch (block.type) {
        case "hero":
            return <HeroBlock block={block} style={style} />;
        case "text":
            return <TextBlock block={block} style={style} />;
        case "image":
            return <ImageBlock block={block} style={style} />;
        case "button":
            return <ButtonBlock block={block} style={style} />;
        case "divider":
            return <DividerBlock block={block} style={style} />;
        case "columns":
            return <ColumnsBlock block={block} style={style} />;
        default:
            return (
                <div className="p-4 text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-200">
                    Unknown block type: {block.type}
                </div>
            );
    }
}

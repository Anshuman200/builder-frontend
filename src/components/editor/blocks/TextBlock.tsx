"use client";

import type { Block, BlockStyle } from "@/stores/editorStore";

interface TextBlockProps {
    block: Block;
    style: BlockStyle;
}

const TAG_DEFAULTS: Record<string, { fontSize: string; fontWeight: string; lineHeight: string }> = {
    h1: { fontSize: "2.25rem", fontWeight: "800", lineHeight: "1.15" },
    h2: { fontSize: "1.875rem", fontWeight: "700", lineHeight: "1.2" },
    h3: { fontSize: "1.5rem", fontWeight: "700", lineHeight: "1.25" },
    h4: { fontSize: "1.25rem", fontWeight: "600", lineHeight: "1.3" },
    p: { fontSize: "1rem", fontWeight: "400", lineHeight: "1.6" },
};

export function TextBlock({ block, style }: TextBlockProps) {
    const p = block.props as Record<string, string>;
    const tag = (p.tag || "p") as keyof typeof TAG_DEFAULTS;
    const defaults = TAG_DEFAULTS[tag] ?? TAG_DEFAULTS.p;
    const Tag = tag as React.ElementType;

    return (
        <div
            style={{
                padding: style.padding ?? "16px 24px",
                margin: style.margin,
                background: style.background,
            }}
        >
            <Tag
                style={{
                    margin: 0,
                    color: p.color || "#0f172a",
                    fontSize: p.fontSize || defaults.fontSize,
                    fontWeight: p.fontWeight || defaults.fontWeight,
                    lineHeight: p.lineHeight || defaults.lineHeight,
                    textAlign: (p.textAlign as React.CSSProperties["textAlign"]) || "left",
                }}
            >
                {p.content || (
                    <span style={{ color: "rgba(0,0,0,0.25)", fontStyle: "italic" }}>
                        Click to edit text…
                    </span>
                )}
            </Tag>
        </div>
    );
}

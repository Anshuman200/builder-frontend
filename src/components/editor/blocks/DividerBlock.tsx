"use client";

import type { Block, BlockStyle } from "@/stores/editorStore";

interface DividerBlockProps {
    block: Block;
    style: BlockStyle;
}

export function DividerBlock({ block, style }: DividerBlockProps) {
    const p = block.props as Record<string, string | number>;
    const thickness = Number(p.thickness) || 1;
    const color = (p.color as string) || "rgba(0,0,0,0.12)";
    const width = (p.width as string) || "100%";
    const borderStyle = (p.style as string) || "solid";

    return (
        <div
            style={{
                padding: style.padding ?? "16px 24px",
                margin: style.margin,
                textAlign: "center",
            }}
        >
            <hr
                style={{
                    border: "none",
                    borderTopWidth: thickness,
                    borderTopStyle: borderStyle as React.CSSProperties["borderTopStyle"],
                    borderTopColor: color,
                    width,
                    margin: "0 auto",
                }}
            />
        </div>
    );
}

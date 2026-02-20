"use client";

import { ImageIcon } from "lucide-react";
import type { Block, BlockStyle } from "@/stores/editorStore";

interface ImageBlockProps {
    block: Block;
    style: BlockStyle;
}

export function ImageBlock({ block, style }: ImageBlockProps) {
    const p = block.props as Record<string, string>;
    const width = p.width || "100%";
    const height = p.height || "300px";
    const borderRadius = p.borderRadius || "0px";

    return (
        <figure
            style={{
                padding: style.padding ?? "0",
                margin: style.margin ?? "0",
                background: style.background,
            }}
        >
            {p.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={p.src}
                    alt={p.alt || ""}
                    style={{
                        width,
                        height,
                        objectFit: (p.objectFit as React.CSSProperties["objectFit"]) || "cover",
                        borderRadius,
                        display: "block",
                    }}
                />
            ) : (
                <div
                    style={{
                        width,
                        height,
                        borderRadius,
                        background: "rgba(0,0,0,0.04)",
                        border: "2px dashed rgba(0,0,0,0.12)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        color: "rgba(0,0,0,0.3)",
                    }}
                >
                    <ImageIcon size={28} />
                    <span style={{ fontSize: 12 }}>Add image URL in properties</span>
                </div>
            )}
            {p.caption && (
                <figcaption
                    style={{
                        textAlign: "center",
                        fontSize: 13,
                        color: "rgba(0,0,0,0.4)",
                        padding: "8px 16px",
                    }}
                >
                    {p.caption}
                </figcaption>
            )}
        </figure>
    );
}

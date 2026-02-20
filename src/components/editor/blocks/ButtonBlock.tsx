"use client";

import type { Block, BlockStyle } from "@/stores/editorStore";
import { cn } from "@/lib/utils";

interface ButtonBlockProps {
    block: Block;
    style: BlockStyle;
}

const SIZE_STYLES: Record<string, React.CSSProperties> = {
    sm: { padding: "8px 20px", fontSize: 13 },
    md: { padding: "12px 28px", fontSize: 15 },
    lg: { padding: "16px 36px", fontSize: 17 },
};

export function ButtonBlock({ block, style }: ButtonBlockProps) {
    const p = block.props as Record<string, string | boolean>;
    const variant = (p.variant as string) || "primary";
    const size = (p.size as string) || "md";
    const sizeStyle = SIZE_STYLES[size] ?? SIZE_STYLES.md;
    const bgColor = (p.bgColor as string) || "#6366f1";
    const textColor = (p.textColor as string) || "#ffffff";
    const fullWidth = p.fullWidth === true;

    const variantStyle: React.CSSProperties =
        variant === "primary"
            ? { background: bgColor, color: textColor, border: "none" }
            : variant === "secondary"
            ? { background: "rgba(0,0,0,0.08)", color: "#0f172a", border: "none" }
            : variant === "outline"
            ? { background: "transparent", color: bgColor, border: `2px solid ${bgColor}` }
            : { background: "transparent", color: bgColor, border: "none" };

    return (
        <div
            style={{
                padding: style.padding ?? "24px",
                margin: style.margin,
                background: style.background,
                textAlign: (p.textAlign as React.CSSProperties["textAlign"]) || "center",
            }}
        >
            <a
                href={(p.href as string) || "#"}
                onClick={(e) => e.preventDefault()}
                style={{
                    ...sizeStyle,
                    ...variantStyle,
                    display: fullWidth ? "block" : "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 100,
                    fontWeight: 700,
                    textDecoration: "none",
                    cursor: "default",
                    width: fullWidth ? "100%" : undefined,
                }}
            >
                {(p.label as string) || "Click Me"}
            </a>
        </div>
    );
}

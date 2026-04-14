"use client";
import React from "react";
import { getIcon } from "@/lib/utils/icons";
import { PreviewContext, BlockProps, useLinkHandler } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { DEFAULT_THEME } from "@/lib/utils/theme";

const BTN_SIZES: Record<string, { padding: string; fontSize: string; iconSize: number }> = {
    sm: { padding: "8px 18px", fontSize: "0.8rem", iconSize: 14 },
    md: { padding: "11px 26px", fontSize: "0.95rem", iconSize: 16 },
    lg: { padding: "14px 34px", fontSize: "1.05rem", iconSize: 18 },
    xl: { padding: "18px 44px", fontSize: "1.2rem", iconSize: 20 },
};
const BTN_SHADOWS: Record<string, string> = {
    none: "none", sm: "0 1px 4px rgba(0,0,0,0.15)", md: "0 4px 12px rgba(0,0,0,0.18)",
    lg: "0 8px 24px rgba(0,0,0,0.22)", glow: "0 0 20px 4px rgba(99,102,241,0.45)",
};

export function ButtonBlock({ block }: BlockProps) {
    const isPreview = React.useContext(PreviewContext);
    const handleLink = useLinkHandler();
    const p = block.props;
    const variant = (p.variant as string) || "solid";
    const size = (p.size as string) || "md";
    const align = (p.align as string) || "left";
    const fullWidth = p.fullWidth === true;
    const sizeStyle = BTN_SIZES[size] || BTN_SIZES.md;
    const shadow = BTN_SHADOWS[(p.shadow as string) || "glow"] || "glow";
    const radius = (p.borderRadius as string) || "9999px";
    const bWidth = (p.borderWidth as string) || "2px";

    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const defaultPrimary = theme.colors?.primary || "#6366f1";
    const defaultSecondary = theme.colors?.secondary || "#8b5cf6";
    const defaultText = theme.colors?.buttonText || "#ffffff";

    let background = defaultPrimary, color = defaultText, border = "none";
    switch (variant) {
        case "solid": background = (p.bgColor as string) || defaultPrimary; color = (p.textColor as string) || defaultText; break;
        case "outline": background = "transparent"; color = (p.textColor as string) || (p.bgColor as string) || defaultPrimary; border = `${bWidth} solid ${(p.borderColor as string) || (p.bgColor as string) || defaultPrimary}`; break;
        case "ghost": background = (p.bgColor as string) ? `${p.bgColor}18` : "rgba(99,102,241,0.08)"; color = (p.textColor as string) || (p.bgColor as string) || defaultPrimary; break;
        case "soft": background = (p.bgColor as string) ? `${p.bgColor}22` : "rgba(99,102,241,0.13)"; color = (p.textColor as string) || (p.bgColor as string) || defaultPrimary; border = `${bWidth} solid ${(p.borderColor as string) || ((p.bgColor as string) ? `${p.bgColor}55` : "rgba(99,102,241,0.3)")}`; break;
        case "gradient": background = `linear-gradient(${(p.gradientDir as string) || "to right"}, ${(p.gradientFrom as string) || defaultPrimary}, ${(p.gradientTo as string) || defaultSecondary})`; color = (p.textColor as string) || defaultText; break;
        case "link": background = "transparent"; color = (p.textColor as string) || (p.bgColor as string) || defaultPrimary; break;
    }

    const IconLeft = (p.iconLeft as string) ? getIcon(p.iconLeft as string) : null;
    const IconRight = (p.iconRight as string) ? getIcon(p.iconRight as string) : null;

    const btnStyle: React.CSSProperties = {
        display: fullWidth ? "flex" : "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.45em",
        width: fullWidth ? "100%" : undefined, minWidth: fullWidth ? undefined : "240px",
        textDecoration: variant === "link" ? "underline" : "none",
        borderRadius: radius, fontWeight: (p.fontWeight as string) || "700",
        fontSize: (p.fontSize as string) || sizeStyle.fontSize, letterSpacing: (p.letterSpacing as string) || "0.02em",
        cursor: isPreview ? "pointer" : "default", boxShadow: shadow, transition: "all 0.18s ease",
        background, color, border, padding: sizeStyle.padding, userSelect: "none",
    };

    return (
        <div id={(p.sectionId as string) || `block-${block.id}`} style={{ padding: "14px 24px", width: "100%", textAlign: align as React.CSSProperties["textAlign"] }}>
            <a href={(p.href as string) || "#"} onClick={(e) => handleLink((p.href as string) || "#", e)} style={btnStyle}>
                {IconLeft && <IconLeft style={{ width: sizeStyle.iconSize, height: sizeStyle.iconSize }} />}
                <span>{(p.label as string) || "Click me"}</span>
                {IconRight && <IconRight style={{ width: sizeStyle.iconSize, height: sizeStyle.iconSize }} />}
            </a>
        </div>
    );
}

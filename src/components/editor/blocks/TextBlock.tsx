"use client";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";
import { BlockProps } from "./shared";

export function TextBlock({ block }: BlockProps) {
    const p = block.props;
    const Tag = ((p.tag as string) || "p") as React.ElementType;
    const defaultSizes: Record<string, string> = { h1: "2.25rem", h2: "1.875rem", h3: "1.5rem", h4: "1.25rem", p: "1rem" };
    const tag = (p.tag as string) || "p";
    const { viewMode, page } = useEditorStore();
    const isDark = (page?.theme?.mode || "light") === "dark";

    const desktopSize = (p.fontSize as string) || defaultSizes[tag] || "1rem";
    const tabletSize = (p.tabletFontSize as string) || desktopSize;
    const mobileSize = (p.mobileFontSize as string) || tabletSize;
    const fontSize = viewMode === "mobile" ? mobileSize : viewMode === "tablet" ? tabletSize : desktopSize;

    let finalColor = (p.color as string) || "inherit";
    const LIGHT_TEXTS = ["#0f172a", "#1e293b", "#334155", "#475569", "#64748b", "#000000", "#111827", "#1f2937", "#374151", "#4b5563", "#6b7280"];
    if (isDark && finalColor !== "inherit" && LIGHT_TEXTS.includes(finalColor.toLowerCase())) {
        finalColor = ["#64748b", "#6b7280", "#475569", "#4b5563"].includes(finalColor.toLowerCase()) ? "#94a3b8" : "#f8fafc";
    }

    return (
        <div id={(p.sectionId as string) || `block-${block.id}`} style={{ padding: "12px 24px", width: "100%" }}>
            <Tag style={{ margin: 0, width: "100%", fontSize, fontWeight: p.bold ? 700 : tag.startsWith("h") ? 700 : 400, fontStyle: p.italic ? "italic" : "normal", color: finalColor, textAlign: (p.align as React.CSSProperties["textAlign"]) || "left", lineHeight: (p.lineHeight as string) || 1.6, letterSpacing: (p.letterSpacing as string) || undefined }}>
                {(p.content as string) || (<span style={{ fontStyle: "italic", opacity: 0.5 }}>Click to edit text…</span>)}
            </Tag>
        </div>
    );
}

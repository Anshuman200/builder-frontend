"use client";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, getBackgroundStyles, BackgroundOverlay } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";

export function TextBlock({ block }: BlockProps) {
    const p = block.props;
    const Tag = ((p.tag as string) || "p") as React.ElementType;
    const defaultSizes: Record<string, string> = { h1: "2.25rem", h2: "1.875rem", h3: "1.5rem", h4: "1.25rem", p: "1rem" };
    const tag = (p.tag as string) || "p";
    const viewMode = useEditorStore((s) => s.viewMode);
    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const bgStyles = getBackgroundStyles(p, theme);


    const desktopSize = (p.fontSize as string) || defaultSizes[tag] || "1rem";
    const tabletSize = (p.tabletFontSize as string) || desktopSize;
    const mobileSize = (p.mobileFontSize as string) || tabletSize;
    const fontSize = viewMode === "mobile" ? mobileSize : viewMode === "tablet" ? tabletSize : desktopSize;

    const finalColor = (p.color as string) || "inherit";

    const wrapperStyle: React.CSSProperties = {
        ...bgStyles,
        padding: (p.padding as string) || "12px 24px",
        width: "100%",
        marginTop: (p.marginTop as string) || "0",
        marginLeft: (p.marginLeft as string) || "0",
        marginRight: (p.marginRight as string) || "0",
        marginBottom: (p.marginBottom as string) || "0",
        position: (p.position as any) || "relative",
        top: (p.top as string) || "auto",
        left: (p.left as string) || "auto",
        right: (p.right as string) || "auto",
        bottom: (p.bottom as string) || "auto",
        zIndex: (p.zIndex as number) || "auto",
        opacity: p.opacity !== undefined ? Number(p.opacity) : 1,
        transform: (p.transform as string) || "none",
    };

    const rawContent = (p.content as string) || "";
    // Split content on real newlines so each line renders as a separate element
    const lines = rawContent.split("\n");
    const tagStyle: React.CSSProperties = {
        margin: 0,
        width: "100%",
        fontSize,
        fontWeight: p.bold ? 700 : tag.startsWith("h") ? 700 : (p.fontWeight as number) || 400,
        fontStyle: p.italic ? "italic" : "normal",
        textDecoration: p.underline ? "underline" : p.strikethrough ? "line-through" : undefined,
        color: finalColor,
        textAlign: (p.align as React.CSSProperties["textAlign"]) || "left",
        lineHeight: (p.lineHeight as string) || 1.6,
        letterSpacing: (p.letterSpacing as string) || undefined,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        listStylePosition: "inside",
        position: "relative",
        zIndex: 2
    };

    return (
        <div id={(p.sectionId as string) || `block-${block.id}`} style={wrapperStyle}>
            <BackgroundOverlay p={p} />
            {rawContent ? (
                <Tag style={tagStyle}>
                    {lines.map((line, i) => (
                        <React.Fragment key={i}>
                            {line || "\u00A0" /* nbsp for blank lines */}
                            {i < lines.length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </Tag>
            ) : (
                <Tag style={tagStyle}><span style={{ fontStyle: "italic", opacity: 0.5 }}>Click to edit text…</span></Tag>
            )}
        </div>
    );
}

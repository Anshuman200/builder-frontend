"use client";
import React from "react";
import { getIcon } from "@/lib/utils/icons";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps } from "./shared";
import { DEFAULT_THEME, hexToRgb } from "@/lib/utils/theme";

export function FeaturesBlock({ block }: BlockProps) {
    const p = block.props;
    const viewMode = useEditorStore((s) => s.viewMode);
    const isDark = useEditorStore((s) => (s.page?.theme?.mode || "light") === "dark");

    const isPreview = React.useContext(PreviewContext);

    const LIGHT_BGS = ["#ffffff", "#fff", "#f8fafc", "#f1f5f9"];
    const LIGHT_TEXTS = ["#1e293b", "#0f172a", "#111111", "#000", "#000000"];
    const rawBg = (p.bgColor as string) || "#ffffff";
    const rawText = (p.textColor as string) || "#1e293b";
    const bgColor = isDark && LIGHT_BGS.includes(rawBg.toLowerCase()) ? "#09090b" : rawBg;
    const textColor = isDark && LIGHT_TEXTS.includes(rawText.toLowerCase()) ? "#fafafa" : rawText;

    const title = (p.title as string) || "Our Features";
    const subtitle = (p.subtitle as string) || "What makes us different";
    const align = (p.align as string) || "center";
    const columns = Number(p.columns) || 3;
    const gap = (p.gap as string) || "2rem";
    const features = (p.features as any[]) || [];

    const cardStyle = (p.cardStyle as string) || "raised";
    const rawCardBg = (p.cardBg as string) || "#ffffff";
    const cardBg = isDark && LIGHT_BGS.includes(rawCardBg.toLowerCase()) ? "#18181b" : rawCardBg;
    const cardRadius = (p.cardRadius as string) || "16px";
    const cardShadow = (p.cardShadow as string) || "0 4px 24px rgba(0,0,0,0.08), 0 1px 6px rgba(0,0,0,0.06)";
    const cardShadowHover = (p.cardShadowHover as string) || "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)";

    const titleSize = (p.titleSize as string) || "2.25rem";
    const subtitleSize = (p.subtitleSize as string) || "1.125rem";
    const cardTitleSize = (p.cardTitleSize as string) || "1.2rem";
    const cardDescSize = (p.cardDescSize as string) || "0.95rem";
    const iconSize = Number(p.iconSize) || 24;
    const iconWrapperSize = Number(p.iconWrapperSize) || 52;
    const iconRadius = (p.iconRadius as string) || "14px";
    
    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const defaultPrimary = theme.colors?.primary || "#6366f1";
    const primaryRgb = hexToRgb(defaultPrimary) || "99, 102, 241";

    const iconColor = (p.iconColor as string) || defaultPrimary;
    const iconBg = (p.iconBg as string) || `rgba(${primaryRgb}, 0.15)`;

    const desktopPadding = (p.padding as string) || "64px 24px";
    const tabletPadding = (p.tabletPadding as string) || "48px 16px";
    const mobilePadding = (p.mobilePadding as string) || "32px 16px";
    const editorPadding = viewMode === "mobile" ? mobilePadding : viewMode === "tablet" ? tabletPadding : desktopPadding;
    const editorCols = viewMode === "mobile" ? 1 : viewMode === "tablet" ? Math.min(2, columns) : columns;

    const getCardStyle = (): React.CSSProperties => {
        const base: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start", textAlign: align as any, padding: cardStyle !== "none" ? "2rem 1.75rem" : "0.5rem", borderRadius: cardStyle !== "none" ? cardRadius : 0, transition: "transform 0.2s ease, box-shadow 0.2s ease" };
        if (cardStyle === "raised") return { ...base, background: cardBg, boxShadow: cardShadow };
        if (cardStyle === "outlined") return { ...base, background: cardBg, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}` };
        if (cardStyle === "filled") return { ...base, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(var(--primary-rgb), 0.08)" };
        return base;
    };

    return (
        <>
            {isPreview && (
                <style>{`
          .features-${block.id} { padding: ${desktopPadding}; background: ${bgColor}; color: ${textColor}; }
          .features-grid-${block.id} { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: ${gap}; margin-top: 3rem; }
          .features-card-${block.id} { ${cardStyle === "raised" ? `background:${cardBg};box-shadow:${cardShadow};` : ""}${cardStyle === "outlined" ? `background:${cardBg};border:1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"};` : ""}${cardStyle === "filled" ? `background:${isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.06)"};` : ""}${cardStyle !== "none" ? `padding:2rem 1.75rem;border-radius:${cardRadius};` : ""}transition:transform 0.2s ease,box-shadow 0.2s ease; }
          ${cardStyle === "raised" ? `.features-card-${block.id}:hover { transform:translateY(-4px);box-shadow:${cardShadowHover}; }` : ""}
          @media (max-width: 1024px) { .features-${block.id} { padding: ${tabletPadding}; } .features-grid-${block.id} { grid-template-columns: repeat(${Math.min(2, columns)}, 1fr); gap: 1.5rem; } }
          @media (max-width: 768px) { .features-${block.id} { padding: ${mobilePadding}; } .features-grid-${block.id} { grid-template-columns: 1fr; gap: 1.25rem; } }
        `}</style>
            )}
            <section id={(p.sectionId as string) || `block-${block.id}`} className={isPreview ? `features-${block.id}` : undefined} style={isPreview ? {} : { padding: editorPadding, background: bgColor, color: textColor, width: "100%", boxSizing: "border-box" }}>
                <div style={{ maxWidth: "100dvw", margin: "0 auto", boxSizing: "border-box", width: "100%" }}>
                    <div style={{ textAlign: align as any }}>
                        {title && <h2 style={{ fontSize: titleSize, fontWeight: 700, margin: "0 0 1rem 0" }}>{title}</h2>}
                        {subtitle && <p style={{ fontSize: subtitleSize, opacity: 0.7, margin: 0, maxWidth: "600px", display: "inline-block" }}>{subtitle}</p>}
                    </div>
                    <div className={isPreview ? `features-grid-${block.id}` : undefined} style={isPreview ? {} : { display: "grid", gridTemplateColumns: `repeat(${editorCols}, 1fr)`, gap: editorCols === 1 ? "1.25rem" : gap, marginTop: "3rem" }}>
                        {features.map((feature, idx) => {
                            const IconCmp = getIcon(feature.icon);
                            return (
                                <div key={feature.id || idx} className={isPreview ? `features-card-${block.id}` : undefined} style={isPreview ? { display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start", textAlign: align as any } : getCardStyle()}>
                                    <div style={{ width: iconWrapperSize, height: iconWrapperSize, borderRadius: iconRadius, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", flexShrink: 0, boxShadow: "0 2px 8px rgba(99,102,241,0.15)", overflow: "hidden" }}>
                                        {feature.iconType === "image" && feature.image ? (
                                            <img src={feature.image} alt={feature.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            IconCmp ? <IconCmp style={{ width: iconSize, height: iconSize, color: iconColor }} /> : <Square2StackIcon style={{ width: iconSize, height: iconSize }} />
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: cardTitleSize, fontWeight: 700, margin: "0 0 0.5rem 0", letterSpacing: "-0.01em" }}>{feature.title}</h3>
                                    <p style={{ fontSize: cardDescSize, opacity: 0.65, margin: 0, lineHeight: 1.65 }}>{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
}

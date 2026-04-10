"use client";
import React from "react";
import Image from "next/image";
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

    const bgColor = (p.bgColor as string) || "var(--background)";
    const textColor = (p.textColor as string) || "var(--text)";

    const title = (p.title as string) || "Our Features";
    const subtitle = (p.subtitle as string) || "What makes us different";
    const align = (p.align as string) || "center";
    const columns = Number(p.columns) || 3;
    const gap = (p.gap as string) || "2rem";
    const features = (p.features as any[]) || [];
    const layout = (p.layout as string) || "grid";

    const cardStyle = (p.cardStyle as string) || "raised";
    const cardBg = (p.cardBg as string) || "var(--surface)";
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

    const getCardSty = (): React.CSSProperties => {
        const base: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start", textAlign: align as any, padding: cardStyle !== "none" ? "2rem 1.75rem" : "0.5rem", borderRadius: cardStyle !== "none" ? cardRadius : 0, transition: "transform 0.2s ease, box-shadow 0.2s ease" };
        if (cardStyle === "raised") return { ...base, background: cardBg, boxShadow: cardShadow };
        if (cardStyle === "outlined") return { ...base, background: cardBg, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}` };
        if (cardStyle === "filled") return { ...base, background: isDark ? "rgba(255,255,255,0.05)" : `rgba(${primaryRgb}, 0.06)` };
        return base;
    };

    const IconWrapper = ({ feature }: { feature: any }) => {
        const IconCmp = getIcon(feature.icon);
        return (
            <div style={{ width: iconWrapperSize, height: iconWrapperSize, borderRadius: iconRadius, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", position: "relative" }}>
                {feature.iconType === "image" && feature.image ? (
                    <Image 
                        src={feature.image} 
                        alt={feature.title} 
                        fill 
                        style={{ objectFit: "cover" }} 
                        unoptimized={!feature.image.includes('unsplash.com') && !feature.image.includes('pexels.com') && !feature.image.includes('amazonaws.com') && !feature.image.includes('cloudfront.net')}
                    />
                ) : (
                    IconCmp ? <IconCmp style={{ width: iconSize, height: iconSize, color: iconColor }} /> : <Square2StackIcon style={{ width: iconSize, height: iconSize }} />
                )}
            </div>
        );
    };

    const SectionHeader = () => (
        <div style={{ textAlign: align as any, marginBottom: "3rem" }}>
            {title && <h2 style={{ fontSize: titleSize, fontWeight: 700, margin: "0 0 1rem 0" }}>{title}</h2>}
            {subtitle && <p style={{ fontSize: subtitleSize, opacity: 0.7, margin: 0, maxWidth: "600px", display: "inline-block" }}>{subtitle}</p>}
        </div>
    );

    const renderGrid = () => (
        <>
            <SectionHeader />
            {isPreview ? (
                <div className={`features-grid-${block.id}`}>
                    {features.map((feat, idx) => (
                        <div key={feat.id || idx} className={`features-card-${block.id}`} style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start", textAlign: align as any }}>
                            <div style={{ marginBottom: "1.25rem" }}><IconWrapper feature={feat} /></div>
                            <h3 style={{ fontSize: cardTitleSize, fontWeight: 700, margin: "0 0 0.5rem 0" }}>{feat.title}</h3>
                            <p style={{ fontSize: cardDescSize, opacity: 0.65, margin: 0, lineHeight: 1.65 }}>{feat.description}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${editorCols}, 1fr)`, gap: editorCols === 1 ? "1.25rem" : gap }}>
                    {features.map((feat, idx) => (
                        <div key={feat.id || idx} style={{ ...getCardSty() }}>
                            <div style={{ marginBottom: "1.25rem" }}><IconWrapper feature={feat} /></div>
                            <h3 style={{ fontSize: cardTitleSize, fontWeight: 700, margin: "0 0 0.5rem 0" }}>{feat.title}</h3>
                            <p style={{ fontSize: cardDescSize, opacity: 0.65, margin: 0, lineHeight: 1.65 }}>{feat.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    const renderAlternating = () => (
        <>
            <SectionHeader />
            <div style={{ display: "flex", flexDirection: "column", gap }}>
                {features.map((feat, idx) => {
                    const even = idx % 2 === 0;
                    return (
                        <div key={feat.id || idx} style={{ display: "flex", alignItems: "center", gap: "3rem", flexDirection: even ? "row" : "row-reverse", padding: "2rem 0", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}` }}>
                            <div style={{ flexShrink: 0 }}>
                                <div style={{ width: 80, height: 80, borderRadius: iconRadius, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <IconWrapper feature={feat} />
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: cardTitleSize, fontWeight: 700, margin: "0 0 0.75rem 0" }}>{feat.title}</h3>
                                <p style={{ fontSize: cardDescSize, opacity: 0.65, margin: 0, lineHeight: 1.7 }}>{feat.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );

    const renderHorizontal = () => (
        <>
            <SectionHeader />
            <div style={{ display: "flex", gap, overflowX: "auto", paddingBottom: "0.5rem" }}>
                {features.map((feat, idx) => (
                    <div key={feat.id || idx} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.75rem", minWidth: 200, flex: 1, padding: "1.5rem", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", borderRadius: cardRadius, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}` }}>
                        <IconWrapper feature={feat} />
                        <h3 style={{ fontSize: cardTitleSize, fontWeight: 700, margin: 0 }}>{feat.title}</h3>
                        <p style={{ fontSize: cardDescSize, opacity: 0.6, margin: 0, lineHeight: 1.6 }}>{feat.description}</p>
                    </div>
                ))}
            </div>
        </>
    );

    const renderIconGrid = () => (
        <>
            <SectionHeader />
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${editorCols}, 1fr)`, gap }}>
                {features.map((feat, idx) => (
                    <div key={feat.id || idx} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem 1.5rem", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderRadius: cardRadius, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}` }}>
                        <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor }}>
                            {(() => { const C = getIcon(feat.icon); return C ? <C style={{ width: 20, height: 20 }} /> : <Square2StackIcon style={{ width: 20, height: 20 }} />; })()}
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, margin: "0 0 2px 0", fontSize: "0.95rem" }}>{feat.title}</p>
                            <p style={{ fontSize: "0.82rem", opacity: 0.55, margin: 0 }}>{feat.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderBento = () => (
        <>
            <SectionHeader />
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(2, editorCols)}, 1fr)`, gridAutoRows: "200px", gap }}>
                {features.map((feat, idx) => {
                    const wide = idx === 0 || idx === features.length - 1;
                    return (
                        <div key={feat.id || idx} style={{ gridColumn: wide ? "span 2" : "span 1", gridRow: wide ? "span 1" : "span 1", background: isDark ? "rgba(255,255,255,0.05)" : `rgba(${primaryRgb}, 0.06)`, borderRadius: cardRadius, padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", overflow: "hidden", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}` }}>
                            <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem" }}><IconWrapper feature={feat} /></div>
                            <h3 style={{ fontSize: cardTitleSize, fontWeight: 700, margin: "0 0 0.4rem 0" }}>{feat.title}</h3>
                            <p style={{ fontSize: cardDescSize, opacity: 0.6, margin: 0, lineHeight: 1.6 }}>{feat.description}</p>
                        </div>
                    );
                })}
            </div>
        </>
    );

    const renderContent = () => {
        switch (layout) {
            case "alternating": return renderAlternating();
            case "horizontal": return renderHorizontal();
            case "icon-grid": return renderIconGrid();
            case "bento": return renderBento();
            default: return renderGrid();
        }
    };

    return (
        <>
            {isPreview && (
                <style>{`
          .features-${block.id} { padding: ${desktopPadding}; background: ${bgColor}; color: ${textColor}; }
          .features-grid-${block.id} { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: ${gap}; }
          .features-card-${block.id} { ${cardStyle === "raised" ? `background:${cardBg};box-shadow:${cardShadow};` : ""}${cardStyle === "outlined" ? `background:${cardBg};border:1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"};` : ""}${cardStyle === "filled" ? `background:${isDark ? "rgba(255,255,255,0.05)" : `rgba(${primaryRgb},0.06)`};` : ""}${cardStyle !== "none" ? `padding:2rem 1.75rem;border-radius:${cardRadius};` : ""}transition:transform 0.2s ease,box-shadow 0.2s ease; }
          ${cardStyle === "raised" ? `.features-card-${block.id}:hover { transform:translateY(-4px);box-shadow:${cardShadowHover}; }` : ""}
          @media (max-width: 1024px) { .features-${block.id} { padding: ${tabletPadding}; } .features-grid-${block.id} { grid-template-columns: repeat(${Math.min(2, columns)}, 1fr); gap: 1.5rem; } }
          @media (max-width: 768px) { .features-${block.id} { padding: ${mobilePadding}; } .features-grid-${block.id} { grid-template-columns: 1fr; gap: 1.25rem; } }
        `}</style>
            )}
            <section id={(p.sectionId as string) || `block-${block.id}`} className={isPreview ? `features-${block.id}` : undefined} style={isPreview ? {} : { padding: editorPadding, background: bgColor, color: textColor, width: "100%", boxSizing: "border-box" }}>
                <div style={{ maxWidth: "100dvw", margin: "0 auto", boxSizing: "border-box", width: "100%" }}>
                    {renderContent()}
                </div>
            </section>
        </>
    );
}

"use client";
import React from "react";
import Image from "next/image";
import { getIcon } from "@/lib/utils/icons";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, getCardStyles, getBackgroundStyles, BackgroundOverlay } from "./shared";
import { DEFAULT_THEME, hexToRgb } from "@/lib/utils/theme";

export function FeaturesBlock({ block }: BlockProps) {
    const p = block.props;
    const viewMode = useEditorStore((s) => s.viewMode);
    const focusSubItem = useEditorStore((s) => s.focusSubItem);
    const isPreview = React.useContext(PreviewContext);
    const subItemFocus = useEditorStore((s) => s.subItemFocus);

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
    const iconSize: any = p.iconSize || "24px";
    const iconWrapperSize: any = p.iconWrapperSize || "52px";
    const iconRadius = (p.iconRadius as string) || "14px";

    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const defaultPrimary = theme.colors?.primary || "#6366f1";
    const primaryRgb = hexToRgb(defaultPrimary) || "99, 102, 241";
    const iconColor = (p.iconColor as string) || defaultPrimary;
    const iconBg = (p.iconBg as string) || `rgba(${primaryRgb}, 0.15)`;

    const titleColor = (p.titleColor as string) || textColor;
    const subtitleColor = (p.subtitleColor as string) || textColor;

    const desktopPadding = (p.padding as string) || "64px 24px";
    const tabletPadding = (p.tabletPadding as string) || "48px 16px";
    const mobilePadding = (p.mobilePadding as string) || "32px 16px";
    const editorPadding = viewMode === "mobile" ? mobilePadding : viewMode === "tablet" ? tabletPadding : desktopPadding;
    const editorCols = viewMode === "mobile" ? 1 : viewMode === "tablet" ? Math.min(2, columns) : columns;

    const getBaseCardStyle = (idx: number, isHovered?: boolean): React.CSSProperties => {
        const isFocused = !isPreview && subItemFocus?.blockId === block.id && subItemFocus?.index == idx;
        
        const base = getCardStyles({
            props: p,
            isFocused,
            isHovered,
            primaryRgb,
        });

        const layoutStyle: React.CSSProperties = {
            ...base,
            alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
            textAlign: align as any,
            // Ensure bento wide items are handled if called from bento
        };

        return layoutStyle;
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
                    IconCmp ? <IconCmp style={{ color: iconColor, width: iconSize, height: iconSize }} /> : <Square2StackIcon style={{ color: iconColor, width: iconSize, height: iconSize }} />
                )}
            </div>
        );
    };

    const SectionHeader = () => (
        <div onClick={() => !isPreview && focusSubItem(block.id, "Content")} style={{ textAlign: align as any, marginBottom: "3rem" }}>
            {title && <h2 style={{ fontSize: titleSize, fontWeight: 700, margin: "0 0 1rem 0", color: titleColor }}>{title}</h2>}
            {subtitle && <p style={{ fontSize: subtitleSize, opacity: 0.7, margin: 0, maxWidth: "600px", display: "inline-block", color: subtitleColor }}>{subtitle}</p>}
        </div>
    );

    const renderGrid = () => (
        <>
            <SectionHeader />
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${editorCols}, 1fr)`, gap: editorCols === 1 ? "1.25rem" : gap }}>
                {features.map((feat, idx) => {
                    return (
                        <div key={feat.id || idx} style={getBaseCardStyle(idx)}
                            onClick={(e) => {
                                if (isPreview) return;
                                e.stopPropagation();
                                const store = useEditorStore.getState();
                                store.selectBlock(block.id);
                                store.focusSubItem(block.id, idx);
                            }}
                            onMouseEnter={e => isPreview && Object.assign(e.currentTarget.style, getBaseCardStyle(idx, true))}
                            onMouseLeave={e => isPreview && Object.assign(e.currentTarget.style, getBaseCardStyle(idx))}
                        >
                            <div style={{ marginBottom: "1.25rem" }}><IconWrapper feature={feat} /></div>
                            <h3 style={{ fontSize: cardTitleSize, fontWeight: 700, margin: "0 0 0.5rem 0" }}>{feat.title}</h3>
                            <p style={{ fontSize: cardDescSize, opacity: 0.65, margin: 0, lineHeight: 1.65 }}>{feat.description}</p>
                        </div>
                    );
                })}
            </div>
        </>
    );

    const renderAlternating = () => (
        <>
            <SectionHeader />
            <div style={{ display: "flex", flexDirection: "column", gap }}>
                {features.map((feat, idx) => {
                    const even = idx % 2 === 0;
                    const baseStyle = getBaseCardStyle(idx);

                    return (
                        <div key={feat.id || idx}
                            style={{
                                ...baseStyle,
                                display: "flex",
                                alignItems: "center",
                                gap: "3rem",
                                flexDirection: even ? "row" : "row-reverse",
                                padding: "2rem 1.5rem",
                                margin: 0,
                                cursor: isPreview ? "default" : "pointer",
                            }}
                            onMouseEnter={e => isPreview && Object.assign(e.currentTarget.style, { ...getBaseCardStyle(idx, true), flexDirection: even ? "row" : "row-reverse" })}
                            onMouseLeave={e => isPreview && Object.assign(e.currentTarget.style, { ...getBaseCardStyle(idx), flexDirection: even ? "row" : "row-reverse" })}
                            onClick={(e) => {
                                if (isPreview) return;
                                e.stopPropagation();
                                const store = useEditorStore.getState();
                                store.selectBlock(block.id);
                                store.focusSubItem(block.id, idx);
                            }}
                        >
                            <div style={{ flexShrink: 0 }}>
                                <div style={{ width: iconWrapperSize, height: iconWrapperSize, borderRadius: iconRadius, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                {features.map((feat, idx) => {
                    return (
                        <div key={feat.id || idx}
                            style={{
                                ...getBaseCardStyle(idx),
                                flex: 1,
                                minWidth: 200,
                                alignItems: "flex-start",
                            }}
                            onMouseEnter={e => isPreview && Object.assign(e.currentTarget.style, getBaseCardStyle(idx, true))}
                            onMouseLeave={e => isPreview && Object.assign(e.currentTarget.style, getBaseCardStyle(idx))}
                            onClick={(e) => {
                                if (isPreview) return;
                                e.stopPropagation();
                                const store = useEditorStore.getState();
                                store.selectBlock(block.id);
                                store.focusSubItem(block.id, idx);
                            }}
                        >
                            <IconWrapper feature={feat} />
                            <h3 style={{ fontSize: cardTitleSize, fontWeight: 700, margin: "1rem 0 0.5rem 0" }}>{feat.title}</h3>
                            <p style={{ fontSize: cardDescSize, opacity: 0.6, margin: 0, lineHeight: 1.6 }}>{feat.description}</p>
                        </div>
                    );
                })}
            </div>
        </>
    );

    const renderIconGrid = () => (
        <>
            <SectionHeader />
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${editorCols}, 1fr)`, gap }}>
                {features.map((feat, idx) => (
                    <div key={feat.id || idx}
                        style={{
                            ...getBaseCardStyle(idx),
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "1rem",
                        }}
                        onMouseEnter={e => isPreview && Object.assign(e.currentTarget.style, { ...getBaseCardStyle(idx, true), flexDirection: "row" })}
                        onMouseLeave={e => isPreview && Object.assign(e.currentTarget.style, { ...getBaseCardStyle(idx), flexDirection: "row" })}
                        onClick={(e) => {
                            if (isPreview) return;
                            e.stopPropagation();
                            const store = useEditorStore.getState();
                            store.selectBlock(block.id);
                            store.focusSubItem(block.id, idx);
                        }}
                    >
                        <div style={{ flexShrink: 0, width: iconWrapperSize, height: iconWrapperSize, borderRadius: iconRadius, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor }}>
                            {(() => { const C = getIcon(feat.icon); return C ? <C width={iconSize} height={iconSize} /> : <Square2StackIcon width={iconSize} height={iconSize} />; })()}
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
                    const baseStyle = getBaseCardStyle(idx);

                    return (
                        <div key={feat.id || idx}
                            style={{
                                ...baseStyle,
                                gridColumn: wide ? "span 2" : "span 1",
                                gridRow: wide ? "span 1" : "span 1",
                                background: baseStyle.background || `rgba(${primaryRgb}, 0.06)`,
                                justifyContent: "flex-end",
                                overflow: "hidden",
                            }}
                            onMouseEnter={e => isPreview && Object.assign(e.currentTarget.style, getBaseCardStyle(idx, true))}
                            onMouseLeave={e => isPreview && Object.assign(e.currentTarget.style, getBaseCardStyle(idx))}
                            onClick={(e) => {
                                if (isPreview) return;
                                e.stopPropagation();
                                const store = useEditorStore.getState();
                                store.selectBlock(block.id);
                                store.focusSubItem(block.id, idx);
                            }}
                        >
                            <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem" }}><IconWrapper feature={feat} /></div>
                            <h3 style={{ fontSize: cardTitleSize, fontWeight: 700, margin: "0 0 0.4rem 0" }}>{feat.title}</h3>
                            <p style={{ fontSize: cardDescSize, opacity: 0.6, margin: 0, lineHeight: 1.6 }}>{feat.description}</p>
                        </div>
                    );
                })}
            </div>
        </>
    );

    const bgStyles = getBackgroundStyles(p, theme);

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
          .features-${block.id} { padding: ${desktopPadding}; color: ${textColor}; }
          @media (max-width: 1024px) { .features-${block.id} { padding: ${tabletPadding}; } }
          @media (max-width: 768px) { .features-${block.id} { padding: ${mobilePadding}; } }
        `}</style>
            )}
            <section 
                id={(p.sectionId as string) || `block-${block.id}`} 
                className={isPreview ? `features-${block.id}` : undefined} 
                style={{
                    ...bgStyles,
                    padding: isPreview ? undefined : editorPadding, 
                    color: textColor, 
                    width: "100%", 
                    boxSizing: "border-box",
                    position: "relative"
                }}
            >
                <BackgroundOverlay p={p} />
                <div style={{ maxWidth: "100dvw", margin: "0 auto", boxSizing: "border-box", width: "100%", position: "relative", zIndex: 2 }}>
                    {renderContent()}
                </div>
            </section>
        </>
    );
}

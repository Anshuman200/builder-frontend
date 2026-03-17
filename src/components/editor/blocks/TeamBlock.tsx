"use client";
import React from "react";
import { GlobeAltIcon, EnvelopeIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps } from "./shared";

export function TeamBlock({ block }: BlockProps) {
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
    const title = (p.title as string) || "Meet Our Team";
    const subtitle = (p.subtitle as string) || "The people behind the magic";
    const align = (p.align as string) || "center";
    const layout = (p.layout as string) || "grid";
    const columns = Number(p.columns) || 3;
    const gap = (p.gap as string) || "2rem";

    const cardStyle = (p.cardStyle as string) || "raised";
    const rawCardBg = (p.cardBg as string) || "#ffffff";
    const cardBg = isDark && LIGHT_BGS.includes(rawCardBg.toLowerCase()) ? "#18181b" : rawCardBg;
    const cardRadius = (p.cardRadius as string) || "16px";
    const cardShadow = (p.cardShadow as string) || "0 4px 24px rgba(0,0,0,0.08), 0 1px 6px rgba(0,0,0,0.06)";

    const imageStyle = (p.imageStyle as string) || "circle";
    const imageSize = (p.imageSize as string) || "120px";
    const imageRadius = (p.imageRadius as string) || "50%";

    const rawNameColor = (p.nameColor as string) || "#0f172a";
    const rawRoleColor = (p.roleColor as string) || "#64748b";
    const rawDescColor = (p.descColor as string) || "#475569";
    const rawSocialColor = (p.socialColor as string) || "#94a3b8";
    const nameColor = isDark && LIGHT_TEXTS.includes(rawNameColor.toLowerCase()) ? "#fafafa" : rawNameColor;
    const roleColor = isDark && ["#64748b", "#475569"].includes(rawRoleColor.toLowerCase()) ? "#94a3b8" : rawRoleColor;
    const descColor = isDark && ["#475569", "#334155"].includes(rawDescColor.toLowerCase()) ? "#cbd5e1" : rawDescColor;
    const socialColor = isDark && ["#94a3b8", "#64748b"].includes(rawSocialColor.toLowerCase()) ? "#cbd5e1" : rawSocialColor;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const members = (p.members as any[]) || [];

    const desktopPadding = (p.padding as string) || "64px 24px";
    const tabletPadding = (p.tabletPadding as string) || "48px 16px";
    const mobilePadding = (p.mobilePadding as string) || "32px 16px";
    const cardPadding = (p.cardPadding as string) || (cardStyle !== "none" ? "2rem 1.75rem" : "0.5rem");

    const getCardStyle = (): React.CSSProperties => {
        const isFloat = imageStyle === "float";
        const floatPad = cardStyle !== "none" ? "4rem 1.75rem 2rem" : "3rem 0.5rem 0.5rem";
        const base: React.CSSProperties = {
            display: "flex", flexDirection: layout === "list" ? "row" : "column",
            alignItems: layout === "list" ? "center" : (align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start"),
            textAlign: (layout === "list" ? "left" : align) as any,
            padding: isFloat ? floatPad : cardPadding,
            borderRadius: cardStyle !== "none" ? cardRadius : 0,
            gap: layout === "list" ? "1.5rem" : 0,
            position: "relative",
            overflow: imageStyle === "cover" ? "hidden" : "visible",
        };
        if (layout === "list" && viewMode === "mobile") { base.flexDirection = "column"; base.alignItems = align === "center" ? "center" : "flex-start"; base.textAlign = align as any; }
        if (cardStyle === "raised") return { ...base, background: cardBg, boxShadow: cardShadow };
        if (cardStyle === "outlined") return { ...base, background: cardBg, border: `1.5px solid ${isDark ? "#ffffff1a" : "#e2e8f0"}` };
        if (cardStyle === "filled") return { ...base, background: p.cardBg ? cardBg : (isDark ? "#ffffff0d" : "rgba(var(--primary-rgb), 0.08)") };
        return base;
    };

    return (
        <>
            <style>{`
                .team-section-${block.id} { 
                    padding: ${desktopPadding}; 
                    background: ${bgColor}; 
                    color: ${textColor}; 
                    width: 100%; 
                    box-sizing: border-box; 
                }
                .team-grid-${block.id} { 
                    display: grid; 
                    grid-template-columns: repeat(${columns}, 1fr); 
                    gap: ${gap}; 
                    margin-top: ${title || subtitle ? "4rem" : "0"}; 
                }
                @media (max-width: 1024px) {
                    .team-section-${block.id} { padding: ${tabletPadding}; }
                    .team-grid-${block.id} { grid-template-columns: repeat(${Math.min(2, columns)}, 1fr); gap: 1.5rem; }
                }
                @media (max-width: 768px) {
                    .team-section-${block.id} { padding: ${mobilePadding}; }
                    .team-grid-${block.id} { grid-template-columns: 1fr; gap: 1.25rem; }
                }

                /* Layout handling for editor view modes */
                ${viewMode === 'mobile' ? `
                    .team-section-${block.id} { padding: ${mobilePadding} !important; }
                    .team-grid-${block.id} { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
                ` : viewMode === 'tablet' ? `
                    .team-section-${block.id} { padding: ${tabletPadding} !important; }
                    .team-grid-${block.id} { grid-template-columns: repeat(${Math.min(2, columns)}, 1fr) !important; gap: 1.5rem !important; }
                ` : ''}
            `}</style>
            <section id={(p.sectionId as string) || `block-${block.id}`} className={`team-section-${block.id}`}>
                <div style={{ maxWidth: "1280px", margin: "0 auto", boxSizing: "border-box", width: "100%" }}>
                    <div style={{ textAlign: align as any }}>
                        {title && <h2 style={{ fontSize: "2.25rem", fontWeight: 700, margin: "0 0 1rem 0" }}>{title}</h2>}
                        {subtitle && <p style={{ fontSize: "1.125rem", opacity: 0.7, margin: 0, maxWidth: "600px", display: "inline-block" }}>{subtitle}</p>}
                    </div>

                    <div className={`team-grid-${block.id}`}>
                        {members.map((member, idx) => {
                            const isFloat = imageStyle === "float";
                            const isCover = imageStyle === "cover";
                            const isEvenList = layout === "list" && idx % 2 !== 0;
                            const cHeight = (p.cardHeight as string) && (p.cardHeight as string) !== "auto" ? (p.cardHeight as string) : "100%";
                            const iHeight = (p.imageHeight as string) || "240px";
                            const iPosition = (p.imagePosition as string) || "center";

                            const imageEl = member.image ? (() => {
                                if (isFloat) {
                                    return (
                                        <div style={{ width: imageSize, height: imageSize, borderRadius: imageRadius, overflow: "hidden", position: "absolute", top: `calc(-${imageSize} / 2)`, left: align === "center" ? "50%" : align === "right" ? "auto" : "1.75rem", right: align === "right" ? "1.75rem" : "auto", transform: align === "center" ? "translateX(-50%)" : "none", zIndex: 2, boxShadow: "0 8px 32px #0000002a, 0 2px 8px #0000001a" }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: iPosition }} />
                                        </div>
                                    );
                                }
                                if (isCover) {
                                    return (
                                        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden", zIndex: 0 }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: iPosition }} />
                                            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${(p.coverGradientBottom as string) || "#000000e6"} 0%, transparent 60%)` }} />
                                        </div>
                                    );
                                }
                                return (
                                    <div style={{ width: imageStyle === "square" ? "100%" : imageSize, height: imageStyle === "square" ? iHeight : imageSize, borderRadius: imageRadius, flexShrink: 0, marginBottom: layout === "list" ? 0 : "1.25rem", overflow: "hidden" }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: iPosition }} />
                                    </div>
                                );
                            })() : null;

                            const contentEl = (
                                <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", padding: isCover ? "0" : (p.cardContentPadding as string) || "1rem 1.25rem", ...(isCover ? { marginTop: "auto", padding: "1rem 1.25rem" } : {}), ...(isFloat ? { marginTop: `calc(${imageSize} / 2)` } : {}) }}>
                                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: isCover ? "#ffffff" : nameColor, margin: "0 0 0.25rem 0" }}>{member.name}</h3>
                                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: isCover ? "#ffffffcc" : roleColor, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{member.role}</div>
                                    {member.description && (<p style={{ fontSize: "0.95rem", color: isCover ? "#ffffffe6" : descColor, lineHeight: 1.6, margin: "0 0 1.25rem 0" }}>{member.description}</p>)}
                                    {member.socials && Object.keys(member.socials).length > 0 && (
                                        <div style={{ display: "flex", gap: "12px", justifyContent: layout === "list" ? "flex-start" : (align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start"), marginTop: "auto" }}>
                                            {Object.keys(member.socials).map(s => {
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                let IconCmp: React.ElementType | null = null;
                                                if (s === "twitter") IconCmp = GlobeAltIcon;
                                                if (s === "linkedin") IconCmp = GlobeAltIcon;
                                                if (s === "github") IconCmp = CodeBracketIcon;
                                                if (s === "facebook") IconCmp = GlobeAltIcon;
                                                if (s === "instagram") IconCmp = GlobeAltIcon;
                                                if (s === "email") IconCmp = EnvelopeIcon;
                                                if (!IconCmp) IconCmp = GlobeAltIcon;
                                                return (<a key={s} href={member.socials[s]} target="_blank" rel="noreferrer" style={{ color: isCover ? "#ffffffcc" : socialColor, transition: "opacity 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"} onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}><IconCmp style={{ width: 18, height: 18 }} /></a>);
                                            })}
                                        </div>
                                    )}
                                </div>
                            );

                            const resolvedCardStyle = { ...getCardStyle(), height: cHeight, flexDirection: (layout === "list" && isEvenList && viewMode !== "mobile" ? "row-reverse" : getCardStyle().flexDirection) as React.CSSProperties["flexDirection"] };

                            if (isFloat) {
                                return (
                                    <div key={`member-${idx}`} style={{ paddingTop: `calc(${imageSize} / 2)`, display: "flex", flexDirection: "column" }}>
                                        <div style={{ ...resolvedCardStyle, flex: 1 }}>{imageEl}{contentEl}</div>
                                    </div>
                                );
                            }
                            return (<div key={`member-${idx}`} style={resolvedCardStyle}>{imageEl}{contentEl}</div>);
                        })}
                    </div>
                </div>
            </section>
        </>
    );
}

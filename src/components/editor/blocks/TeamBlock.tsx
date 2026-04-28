"use client";
import React from "react";
import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, getCardStyles, getBackgroundStyles, BackgroundOverlay } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";

// ─── Inline brand SVG icons ───────────────────────────────────────────────────
const BRAND_ICONS: Record<string, React.ReactNode> = {
    twitter: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
    x: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
    linkedin: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
    github: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>,
    instagram: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>,
    facebook: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
    dribbble: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.048 6.39a10.16 10.16 0 006.29 2.166c1.42 0 2.77-.29 4.013-.806zm-9.83-2.09c.24-.38 3.044-4.994 8.41-6.73.075-.027.15-.052.225-.073-.14-.33-.275-.66-.42-.98-5.13 1.555-10.097 1.486-10.45 1.476a10.1 10.1 0 00.235 6.307zm-.24-8.18c.36.007 4.636.02 9.44-1.275-1.695-3.01-3.52-5.54-3.79-5.9a10.2 10.2 0 00-5.65 7.174zm7.265-8.338c.283.37 2.11 2.906 3.793 6.02 3.617-1.354 5.148-3.41 5.33-3.67A10.128 10.128 0 0013.198 2.84zm7.586 4.26c-.218.286-1.914 2.47-5.674 4.034.235.48.455.965.665 1.45.07.16.135.327.2.493 3.415-.43 6.8.258 7.13.33a10.15 10.15 0 00-2.32-6.308z" /></svg>,
    youtube: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
    tiktok: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>,
    email: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    website: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
};

type SocialValue = string | { url?: string; icon?: string };

function SocialLinks({ socials, color, justify, size = 18, blockId, isPreview }: { socials: Record<string, SocialValue>; color: string; justify: string; size?: number | string; blockId?: string; isPreview?: boolean }) {
    const entries = Object.entries(socials);
    if (!entries.length) return null;
    return (
        <div style={{ display: "flex", gap: 12, justifyContent: justify, marginTop: "auto", flexWrap: "wrap" }}>
            {entries.map(([key, val]) => {
                const href = typeof val === "string" ? val : val?.url || "";
                const customIcon = typeof val === "object" ? val?.icon : undefined;
                if (!href) return null;
                return (
                    <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color, transition: "opacity 0.2s", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.65"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                        onClick={(e) => {
                            if (!isPreview && blockId) {
                                e.preventDefault();
                                e.stopPropagation();
                                const store = useEditorStore.getState();
                                store.selectBlock(blockId);
                                store.focusSubItem(blockId, "Social Links Styling");
                            }
                        }}
                    >
                        {customIcon
                            ? <img src={customIcon} alt={key} style={{ width: size, height: size, borderRadius: 2, objectFit: "contain" }} />
                            : (() => {
                                const baseKey = key.includes("-") ? key.split("-")[0] : key;
                                const icon = BRAND_ICONS[baseKey] || BRAND_ICONS.website;
                                return React.cloneElement(icon as React.ReactElement<any>, {
                                    style: { width: size, height: size }
                                });
                            })()
                        }
                    </a>
                );
            })}
        </div>
    );
}

export function TeamBlock({ block }: BlockProps) {
    const p = block.props;
    const viewMode = useEditorStore((s) => s.viewMode);
    const focusSubItem = useEditorStore((s) => s.focusSubItem);
    const subItemFocus = useEditorStore((s) => s.subItemFocus);
    const isPreview = React.useContext(PreviewContext);
    
    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const bgStyles = getBackgroundStyles(p, theme);

    const textColor = (p.textColor as string) || "#1e293b";
    const title = typeof p.title === "string" ? p.title : "Meet Our Team";
    const subtitle = typeof p.subtitle === "string" ? p.subtitle : "The people behind the magic";
    const align = (p.align as string) || "center";
    const layout = (p.layout as string) || "grid";
    const columns = Number(p.columns) || 3;
    const gap = (p.gap as string) || "2rem";

    const titleSize = (p.titleSize as string) || "2.25rem";
    const subtitleSize = (p.subtitleSize as string) || "1.125rem";
    const titleColor = (p.titleColor as string) || textColor;
    const subtitleColor = (p.subtitleColor as string) || textColor;

    const cardStyle = (p.cardStyle as string) || "raised";
    const rawCardBg = (p.cardBg as string) || "#ffffff";
    const cardBg = rawCardBg;
    const cardRadius = (p.cardRadius as string) || "16px";
    const cardShadow = (p.cardShadow as string) || "0 4px 24px rgba(0,0,0,0.08), 0 1px 6px rgba(0,0,0,0.06)";

    const imageStyle = (p.imageStyle as string) || "circle";
    const imageSize = (p.imageSize as string) || "120px";
    const imageRadius = (p.imageRadius as string) || "50%";

    const rawNameColor = (p.nameColor as string) || "#0f172a";
    const rawRoleColor = (p.roleColor as string) || "#64748b";
    const rawDescColor = (p.descColor as string) || "#475569";
    const rawSocialColor = (p.socialColor as string) || "#94a3b8";
    const socialIconSize = (p.socialIconSize as string | number) || 18;
    const nameColor = rawNameColor;
    const roleColor = rawRoleColor;
    const descColor = rawDescColor;
    const socialColor = rawSocialColor;

    const members = (p.members as any[]) || [];

    const desktopPadding = (p.padding as string) || "64px 24px";
    const tabletPadding = (p.tabletPadding as string) || "48px 16px";
    const mobilePadding = (p.mobilePadding as string) || "32px 16px";

    const getBaseCardStyle = (idx: number): React.CSSProperties => {
        const isFocused = !isPreview && subItemFocus?.blockId === block.id && subItemFocus?.index === idx;
        const isFloat = imageStyle === "float";

        const base = getCardStyles({
            props: p,
            isFocused,
        });

        // Add layout-specific adjustments
        const layoutStyle: React.CSSProperties = {
            ...base,
            display: "flex",
            flexDirection: layout === "list" ? "row" : "column",
            alignItems: layout === "list" ? "center" : (align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start"),
            textAlign: (layout === "list" ? "left" : align) as React.CSSProperties["textAlign"],
            gap: layout === "list" ? "1.5rem" : 0,
            overflow: imageStyle === "cover" ? "hidden" : "visible",
            // Handle float padding override if needed
            ...(isFloat ? { padding: (p.cardStyle !== "none" ? "4rem 1.75rem 2rem" : "3rem 0.5rem 0.5rem") } : {})
        };

        if (layout === "list" && viewMode === "mobile") {
            layoutStyle.flexDirection = "column";
            layoutStyle.alignItems = align === "center" ? "center" : "flex-start";
            layoutStyle.textAlign = align as React.CSSProperties["textAlign"];
        }

        return layoutStyle;
    };

    const socialJustify = layout === "list" ? "flex-start" : align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

    return (
        <>
            <style>{`
                .team-section-${block.id} { 
                    padding: ${desktopPadding}; 
                    color: ${textColor}; 
                    width: 100%; 
                    box-sizing: border-box; 
                    position: relative;
                }
                .team-grid-container-${block.id} { 
                    display: grid; 
                    grid-template-columns: repeat(${columns}, 1fr); 
                    gap: ${gap}; 
                    margin-top: ${title || subtitle ? "4rem" : "0"}; 
                    position: relative;
                    z-index: 2;
                }
                .team-large-card-${block.id} {
                    display: flex;
                    align-items: center;
                    gap: 3rem;
                    padding: 2rem 2.5rem;
                    background: ${cardBg};
                    border-radius: ${cardRadius};
                    box-shadow: ${cardStyle === 'raised' ? cardShadow : 'none'};
                    border: ${cardStyle === 'outlined' ? `1.5px solid #e2e8f0` : 'none'};
                    flex-direction: row;
                }
                .team-large-card-reverse-${block.id} {
                    display: flex;
                    align-items: center;
                    gap: 3rem;
                    padding: 2rem 2.5rem;
                    background: ${cardBg};
                    border-radius: ${cardRadius};
                    box-shadow: ${cardStyle === 'raised' ? cardShadow : 'none'};
                    border: ${cardStyle === 'outlined' ? `1.5px solid #e2e8f0` : 'none'};
                    flex-direction: row-reverse;
                }
                @media (max-width: 1024px) {
                    .team-section-${block.id} { padding: ${tabletPadding}; }
                    .team-grid-container-${block.id} { grid-template-columns: repeat(${Math.min(2, columns)}, 1fr); gap: 1.5rem; }
                    .team-large-card-${block.id}, .team-large-card-reverse-${block.id} { gap: 2rem; padding: 1.5rem; }
                }
                @media (max-width: 768px) {
                    .team-section-${block.id} { padding: ${mobilePadding}; }
                    .team-grid-container-${block.id} { grid-template-columns: 1fr; gap: 1.25rem; }
                    .team-large-card-${block.id}, .team-large-card-reverse-${block.id} { flex-direction: column; text-align: center; gap: 1.5rem; }
                }

                /* Layout handling for editor view modes */
                ${viewMode === 'mobile' ? `
                    .team-section-${block.id} { padding: ${mobilePadding} !important; }
                    .team-grid-container-${block.id} { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
                    .team-large-card-${block.id}, .team-large-card-reverse-${block.id} { flex-direction: column !important; text-align: center !important; gap: 1.5rem !important; }
                ` : viewMode === 'tablet' ? `
                    .team-section-${block.id} { padding: ${tabletPadding} !important; }
                    .team-grid-container-${block.id} { grid-template-columns: repeat(${Math.min(2, columns)}, 1fr) !important; gap: 1.5rem !important; }
                    .team-large-card-${block.id}, .team-large-card-reverse-${block.id} { gap: 2rem !important; padding: 1.5rem !important; }
                ` : ''}
            `}</style>
            <section 
                id={(p.sectionId as string) || `block-${block.id}`} 
                className={`team-section-${block.id}`}
                style={bgStyles}
            >
                <BackgroundOverlay p={p} />
                <div style={{ boxSizing: "border-box", width: "100%", position: "relative", zIndex: 2 }}>
                    <div onClick={() => !isPreview && focusSubItem(block.id, "Content")} style={{ textAlign: align as React.CSSProperties["textAlign"], cursor: "pointer" }}>
                        {title && <h2 style={{ fontSize: titleSize, fontWeight: 700, margin: "0 0 1rem 0", color: titleColor }}>{title}</h2>}
                        {subtitle && <p style={{ fontSize: subtitleSize, opacity: 0.7, margin: 0, maxWidth: "600px", display: "inline-block", color: subtitleColor }}>{subtitle}</p>}
                    </div>
                    {/* ── Compact Row ───────────────────────────────────────────── */}
                    {layout === "compact" && (
                        <div className={`team-grid-container-${block.id}`}>
                            {members.map((member: any, idx: number) => {
                                const isFocused = !isPreview && subItemFocus?.blockId === block.id && subItemFocus?.index === idx;
                                const baseStyle = getBaseCardStyle(idx);

                                return (
                                    <div key={`mc-${idx}`} style={{ ...baseStyle, display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", cursor: "pointer" }}
                                        onClick={() => !isPreview && focusSubItem(block.id, idx)}
                                    >
                                        {member.image && (
                                            <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", position: "relative", flexShrink: 0 }}>
                                                <Image
                                                    src={member.image}
                                                    alt={member.name}
                                                    fill
                                                    style={{ objectFit: "cover" }}
                                                    unoptimized={!member.image.includes('unsplash.com') && !member.image.includes('pexels.com') && !member.image.includes('amazonaws.com') && !member.image.includes('cloudfront.net') && !member.image.includes('placehold.co') && !member.image.includes('placeholder.com')}
                                                />
                                            </div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: "0 0 0.15rem", fontWeight: 700, fontSize: "0.95rem", color: nameColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.name}</p>
                                            <p style={{ margin: "0 0 0.4rem", fontSize: "0.75rem", color: roleColor, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{member.role}</p>
                                            {member.socials && (
                                                <SocialLinks socials={member.socials as Record<string, SocialValue>} color={socialColor} justify="flex-start" size={socialIconSize} blockId={block.id} isPreview={isPreview} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Large Cards (Alternating) ─────────────────────────────── */}
                    {layout === "large" && (
                        <div style={{ display: "flex", flexDirection: "column", gap, marginTop: title || subtitle ? "3rem" : 0 }}>
                            {members.map((member: any, idx: number) => {
                                return (
                                    <div key={`ml-${idx}`}
                                        style={{
                                            ...getBaseCardStyle(idx),
                                            flexDirection: idx % 2 !== 0 ? "row-reverse" : "row",
                                            gap: "3rem",
                                            alignItems: "center",
                                        }}
                                        onClick={() => !isPreview && focusSubItem(block.id, idx)}
                                    >
                                        {member.image && (
                                            <div style={{ width: 160, height: 160, borderRadius: imageRadius, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                                                <Image
                                                    src={member.image}
                                                    alt={member.name}
                                                    fill
                                                    style={{ objectFit: "cover" }}
                                                    unoptimized={!member.image.includes('unsplash.com') && !member.image.includes('pexels.com') && !member.image.includes('amazonaws.com') && !member.image.includes('cloudfront.net')}
                                                />
                                            </div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", alignItems: "inherit" }}>
                                            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.25rem", color: nameColor }}>{member.name}</h3>
                                            <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", color: roleColor }}>{member.role}</p>
                                            {member.description && <p style={{ margin: "0 0 1rem", color: descColor, lineHeight: 1.7, fontSize: "0.95rem" }}>{member.description}</p>}
                                            {member.socials && (
                                                <SocialLinks socials={member.socials as Record<string, SocialValue>} color={socialColor} justify="inherit" size={socialIconSize} blockId={block.id} isPreview={isPreview} />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* ── Spotlight (Circular) ──────────────────────────────────── */}
                    {layout === "spotlight" && (
                        <div className={`team-grid-container-${block.id}`}>
                            {members.map((member: any, idx: number) => {
                                const baseStyle = getBaseCardStyle(idx);

                                return (
                                    <div key={`ms-${idx}`}
                                        style={{ ...baseStyle, alignItems: "center", textAlign: "center" }}
                                        onClick={() => !isPreview && focusSubItem(block.id, idx)}
                                    >
                                        <div style={{ width: 140, height: 140, borderRadius: "50%", overflow: "hidden", border: `4px solid #e2e8f0`, marginBottom: "1rem", position: "relative" }}>
                                            {member.image ? (
                                                <Image
                                                    src={member.image}
                                                    alt={member.name}
                                                    fill
                                                    style={{ objectFit: "cover" }}
                                                    unoptimized={!member.image.includes('unsplash.com') && !member.image.includes('pexels.com') && !member.image.includes('amazonaws.com') && !member.image.includes('cloudfront.net') && !member.image.includes('placehold.co') && !member.image.includes('placeholder.com')}
                                                />
                                            ) : (
                                                <div style={{ width: "100%", height: "100%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>👤</div>
                                            )}
                                        </div>
                                        <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.1rem", fontWeight: 700, color: nameColor }}>{member.name}</h3>
                                        <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", color: roleColor, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{member.role}</p>
                                        {member.socials && (
                                            <SocialLinks socials={member.socials as Record<string, SocialValue>} color={socialColor} justify="center" size={socialIconSize} blockId={block.id} isPreview={isPreview} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Grid / List (original) ───────────────────────────────── */}
                    {(layout === "grid" || layout === "list") && (
                        <div className={`team-grid-container-${block.id}`}>
                            {members.map((member: any, idx: number) => {
                                const isFloat = imageStyle === "float";
                                const isCover = imageStyle === "cover";
                                const isEvenList = layout === "list" && idx % 2 !== 0;
                                const cHeight = (p.cardHeight as string) && (p.cardHeight as string) !== "auto" ? (p.cardHeight as string) : "100%";

                                const baseStyle = getBaseCardStyle(idx);
                                const resolvedCardStyle = {
                                    ...baseStyle,
                                    height: cHeight,
                                    flexDirection: (layout === "list" && isEvenList && viewMode !== "mobile" ? "row-reverse" : baseStyle.flexDirection) as React.CSSProperties["flexDirection"]
                                };

                                const iHeight = (p.imageHeight as string) || "240px";
                                const iPosition = (p.imagePosition as string) || "center";

                                const imageEl = member.image ? (() => {
                                    if (isFloat) {
                                        return (
                                            <div style={{ width: imageSize, height: imageSize, borderRadius: imageRadius, overflow: "hidden", position: "absolute", top: `calc(-${imageSize} / 2)`, left: align === "center" ? "50%" : align === "right" ? "auto" : "1.75rem", right: align === "right" ? "1.75rem" : "auto", transform: align === "center" ? "translateX(-50%)" : "none", zIndex: 2, boxShadow: "0 8px 32px #0000002a, 0 2px 8px #0000001a" }}>
                                                <Image
                                                    src={member.image}
                                                    alt={member.name}
                                                    fill
                                                    style={{ objectFit: "cover", objectPosition: iPosition }}
                                                    unoptimized={!member.image.includes('unsplash.com') && !member.image.includes('pexels.com') && !member.image.includes('amazonaws.com') && !member.image.includes('cloudfront.net') && !member.image.includes('placehold.co') && !member.image.includes('placeholder.com')}
                                                />
                                            </div>
                                        );
                                    }
                                    if (isCover) {
                                        return (
                                            <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden", zIndex: 0 }}>
                                                <Image
                                                    src={member.image}
                                                    alt={member.name}
                                                    fill
                                                    style={{ objectFit: "cover", objectPosition: iPosition }}
                                                    unoptimized={!member.image.includes('unsplash.com') && !member.image.includes('pexels.com') && !member.image.includes('amazonaws.com') && !member.image.includes('cloudfront.net') && !member.image.includes('placehold.co') && !member.image.includes('placeholder.com')}
                                                />
                                                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${(p.coverGradientBottom as string) || "#000000e6"} 0%, transparent 60%)` }} />
                                            </div>
                                        );
                                    }
                                    return (
                                        <div style={{ width: imageStyle === "square" ? "100%" : imageSize, height: imageStyle === "square" ? iHeight : imageSize, borderRadius: imageRadius, flexShrink: 0, marginBottom: layout === "list" ? 0 : "1.25rem", overflow: "hidden", position: "relative" }}>
                                            <Image
                                                src={member.image}
                                                alt={member.name}
                                                fill
                                                style={{ objectFit: "cover", objectPosition: iPosition }}
                                                unoptimized={!member.image.includes('unsplash.com') && !member.image.includes('pexels.com') && !member.image.includes('amazonaws.com') && !member.image.includes('cloudfront.net')}
                                            />
                                        </div>
                                    );
                                })() : null;

                                const contentEl = (
                                    <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", padding: isCover ? "0" : (p.cardContentPadding as string) || "1rem 1.25rem", ...(isCover ? { marginTop: "auto", padding: "1rem 1.25rem" } : {}), ...(isFloat ? { marginTop: `calc(${imageSize} / 2)` } : {}) }}>
                                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: isCover ? "#ffffff" : nameColor, margin: "0 0 0.25rem 0" }}>{member.name}</h3>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: isCover ? "#ffffffcc" : roleColor, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{member.role}</div>
                                        {member.description && (<p style={{ fontSize: "0.95rem", color: isCover ? "#ffffffe6" : descColor, lineHeight: 1.6, margin: "0 0 1.25rem 0" }}>{member.description}</p>)}
                                        {member.socials && (
                                            <SocialLinks
                                                socials={member.socials as Record<string, SocialValue>}
                                                color={isCover ? "#ffffffcc" : socialColor}
                                                justify={socialJustify}
                                                size={socialIconSize}
                                                blockId={block.id}
                                                isPreview={isPreview}
                                            />
                                        )}
                                    </div>
                                );

                                if (isFloat) {
                                    return (
                                        <div key={`member-${idx}`} style={{ paddingTop: `calc(${imageSize} / 2)`, display: "flex", flexDirection: "column" }}
                                            onClick={() => !isPreview && focusSubItem(block.id, idx)}
                                        >
                                            <div style={{ ...resolvedCardStyle, flex: 1 }}>{imageEl}{contentEl}</div>
                                        </div>
                                    );
                                }
                                return (<div key={`member-${idx}`} style={resolvedCardStyle}
                                    onClick={() => !isPreview && focusSubItem(block.id, idx)}
                                >{imageEl}{contentEl}</div>);
                            })}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

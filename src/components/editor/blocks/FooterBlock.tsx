"use client";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps } from "./shared";

export function FooterBlock({ block }: BlockProps) {
    const p = block.props;
    const { viewMode, page } = useEditorStore();
    const theme = page?.theme || { layout: { maxWidth: "100dvw", paddingX: "32px", tabletPaddingX: "24px", mobilePaddingX: "16px" } };
    const layoutObj = theme.layout || { maxWidth: "100dvw", paddingX: "32px", tabletPaddingX: "24px", mobilePaddingX: "16px" };
    const isPreview = React.useContext(PreviewContext);
    const isDark = (page?.theme?.mode || "light") === "dark";

    const rawBg = (p.bgColor as string) || "#0f172a";
    const rawText = (p.textColor as string) || "#f8fafc";
    const bgColor = isDark && rawBg.toLowerCase() === "#0f172a" ? "#18181b" : rawBg;
    const textColor = isDark && rawText.toLowerCase() === "#f8fafc" ? "#e4e4e7" : rawText;

    const desktopPadding = p.padding ? (p.padding as string) : "48px 32px";
    const tabletPadding = p.tabletPadding ? (p.tabletPadding as string) : "32px 24px";
    const mobilePadding = p.mobilePadding ? (p.mobilePadding as string) : "24px 16px";
    const editorPadding = viewMode === "mobile" ? mobilePadding : viewMode === "tablet" ? tabletPadding : desktopPadding;

    const logoType = (p.logoType as string) || "text";
    const logoText = (p.logoText as string) || "PageCraft";
    const logoImage = p.logoImage as string;
    const logoWidth = (p.logoWidth as string) || "120px";
    const description = (p.description as string) || "Build beautiful pages in minutes.";
    const copyright = (p.copyright as string) || `© ${new Date().getFullYear()} PageCraft. All rights reserved.`;
    const links = (p.links as { id: string; label: string; url: string }[]) || [];
    const isMobile = isPreview ? false : (viewMode === "mobile");

    return (
        <>
            {isPreview && (
                <style>{`
          .footer-${block.id} { padding: ${desktopPadding}; }
          @media (max-width: 1024px) { .footer-${block.id} { padding: ${tabletPadding}; } .footer-${block.id}-inner { flex-direction: column; text-align: center; gap: 2rem; } .footer-${block.id}-links { justify-content: center; width: 100%; flex-wrap: wrap; } }
          @media (max-width: 768px) { .footer-${block.id} { padding: ${mobilePadding}; } .footer-${block.id}-links { flex-direction: column; gap: 1rem; align-items: center; } }
        `}</style>
            )}
            <footer id={(p.sectionId as string) || `block-${block.id}`} className={isPreview ? `footer-${block.id}` : undefined} style={{ background: bgColor, color: textColor, width: "100%", padding: isPreview ? undefined : editorPadding, paddingLeft: isPreview ? undefined : 0, paddingRight: isPreview ? undefined : 0 }}>
                <div className={isPreview && !p.fullWidth ? `footer-${block.id}-inner` : undefined} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "space-between", gap: isMobile ? "2rem" : "1rem", width: "100%", maxWidth: p.fullWidth ? "100%" : layoutObj.maxWidth, margin: "0 auto", boxSizing: "border-box", textAlign: isMobile ? "center" : "left", paddingLeft: isPreview && !p.fullWidth ? undefined : (viewMode === "mobile" ? layoutObj.mobilePaddingX : viewMode === "tablet" ? layoutObj.tabletPaddingX : layoutObj.paddingX), paddingRight: isPreview && !p.fullWidth ? undefined : (viewMode === "mobile" ? layoutObj.mobilePaddingX : viewMode === "tablet" ? layoutObj.tabletPaddingX : layoutObj.paddingX) }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: isMobile ? "center" : "flex-start" }}>
                        <div style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
                            {logoType === "image" && logoImage ? (<img src={logoImage} alt={logoText} style={{ width: logoWidth, maxHeight: "40px", objectFit: "contain" }} />) : (<span>{logoText}</span>)}
                        </div>
                        {description && (<p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8, maxWidth: "250px" }}>{description}</p>)}
                    </div>
                    <nav className={isPreview ? `footer-${block.id}-links` : undefined} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "1.5rem", alignItems: "center" }}>
                        {links.map((link) => {
                            const isAnchor = link.url.startsWith("#") && link.url.length > 1;
                            const handleNavClick = (e: React.MouseEvent) => { if (!isPreview) { e.preventDefault(); return; } if (isAnchor) { e.preventDefault(); const el = document.getElementById(link.url.substring(1)); if (el) el.scrollIntoView({ behavior: "smooth" }); } };
                            return (<a key={link.id} href={link.url} onClick={handleNavClick} style={{ color: "inherit", textDecoration: "none", fontWeight: 500, fontSize: "0.95rem", opacity: 0.8, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.8"}>{link.label}</a>);
                        })}
                    </nav>
                </div>
                {copyright && (
                    <div style={{ maxWidth: p.fullWidth ? "100%" : layoutObj.maxWidth, margin: "2rem auto 0", paddingLeft: isPreview && !p.fullWidth ? undefined : (viewMode === "mobile" ? layoutObj.mobilePaddingX : viewMode === "tablet" ? layoutObj.tabletPaddingX : layoutObj.paddingX), paddingRight: isPreview && !p.fullWidth ? undefined : (viewMode === "mobile" ? layoutObj.mobilePaddingX : viewMode === "tablet" ? layoutObj.tabletPaddingX : layoutObj.paddingX) }}>
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem", textAlign: "center", fontSize: "0.85rem", opacity: 0.6 }}>{copyright}</div>
                    </div>
                )}
            </footer>
        </>
    );
}

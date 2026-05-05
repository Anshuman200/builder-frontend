"use client";
import React from "react";
import Image from "next/image";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, useLinkHandler, getBackgroundStyles, BackgroundOverlay, getTextStyles } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";

export function FooterBlock({ block }: BlockProps) {
    const p = block.props;
    const viewMode = useEditorStore((s) => s.viewMode);
    const layoutObj = useEditorStore((s) => s.page?.theme?.layout) || { maxWidth: "100dvw", paddingX: "32px", tabletPaddingX: "24px", mobilePaddingX: "16px" };
    const isPreview = React.useContext(PreviewContext);
    const handleLink = useLinkHandler();
    const focusSubItem = useEditorStore((s) => s.focusSubItem);

    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const bgStyles = getBackgroundStyles(p, theme);

    const rawText = (p.textColor as string) || "#f8fafc";
    const textColor = rawText;

    const desktopPadding = p.padding ? (p.padding as string) : "48px 32px";
    const tabletPadding = p.tabletPadding ? (p.tabletPadding as string) : "32px 24px";
    const mobilePadding = p.mobilePadding ? (p.mobilePadding as string) : "24px 16px";
    const editorPadding = viewMode === "mobile" ? mobilePadding : viewMode === "tablet" ? tabletPadding : desktopPadding;

    const logoType = (p.logoType as string) || "text";
    const logoText = (p.logoText as string) || "Solario Forge";
    const logoImage = p.logoImage as string;
    const logoWidth = (p.logoWidth as string) || "120px";
    const logoHeight = (p.logoHeight as string) || "40px";
    const logoObjectFit = (p.logoObjectFit as React.CSSProperties["objectFit"]) || "cover";
    const logoShape = (p.logoShape as string) || "square";
    const description = (p.description as string) || "Build beautiful pages in minutes.";
    const copyright = (p.copyright as string) || `© ${new Date().getFullYear()} Solario Forge. All rights reserved.`;
    const links = (p.links as { id: string; label: string; url: string }[]) || [];
    const footerLayout = (p.layout as string) || "standard";
    const isMobile = isPreview ? false : (viewMode === "mobile");

    // Column link groups (for 'columns' layout)
    const linkGroups = (p.linkGroups as { id: string; heading: string; links: { id: string; label: string; url: string }[] }[]) || [];

    const routes = useEditorStore((s) => s.page?.routes) || [];
    const autoRoutes = routes.filter(r => !!r.showInFooter);

    // 1. Resolve explicitly ordered links from block props
    const resolvedLinks = (links as any[]).map(l => {
        if (l.isAuto) {
            const route = autoRoutes.find(r => r.id === l.routeId);
            if (!route) return null; // Filter out if no longer marked for footer
            return { id: route.id, label: route.name, url: route.path };
        }
        return l;
    }).filter(Boolean) as { id: string, label: string, url: string }[];

    // 2. Automatically append any visible routes that aren't in the sorted list yet
    autoRoutes.forEach(r => {
        if (!resolvedLinks.find(l => l.id === r.id)) {
            resolvedLinks.push({ id: r.id, label: r.name, url: r.path });
        }
    });

    const mergedLinks = resolvedLinks;

    const NavLink = ({ link }: { link: { id: string; label: string; url: string } }) => {
        const handleNavClick = (e: React.MouseEvent) => { handleLink(link.url, e); };
        const navColor = (p.navColor as string) || textColor;
        return (<a href={link.url} onClick={handleNavClick} style={{ color: navColor, textDecoration: "none", fontWeight: 500, fontSize: "0.9rem", opacity: 0.75, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.75"}>{link.label}</a>);
    };

    const Logo = () => (
        <a
            href="/"
            onClick={(e) => {
                handleLink("/", e);
                if (!isPreview) focusSubItem(block.id, "Brand & Content");
            }}
            style={{
                ...getTextStyles(p, "logo"),
                fontSize: getTextStyles(p, "logo").fontSize || "1.25rem",
                letterSpacing: getTextStyles(p, "logo").letterSpacing || "-0.02em",
                color: getTextStyles(p, "logo").color || (p.logoColor as string) || "inherit", 
                textDecorationSkipInk: "auto",
                cursor: "pointer",
                display: "flex", alignItems: "center"
            }}

        >
            {logoType === "image" && logoImage ? (
                <div style={{
                    width: logoWidth,
                    height: logoHeight,
                    position: "relative",
                    borderRadius: logoShape === "circle" ? "50%" : logoShape === "rounded" ? "12px" : "0px",
                    overflow: "hidden"
                }}>
                    <Image
                        src={logoImage}
                        alt={logoText}
                        fill
                        style={{ objectFit: logoObjectFit || "contain", objectPosition: isMobile ? "center" : "left" }}
                        unoptimized={!logoImage.includes('unsplash.com') && !logoImage.includes('pexels.com') && !logoImage.includes('amazonaws.com') && !logoImage.includes('cloudfront.net')}
                    />
                </div>
            ) : (<span>{logoText}</span>)}
        </a>
    );

    const innerPad = isPreview && !p.fullWidth ? undefined : (viewMode === "mobile" ? layoutObj.mobilePaddingX : viewMode === "tablet" ? layoutObj.tabletPaddingX : layoutObj.paddingX);

    const renderFooterContent = () => {
        // ── Minimal ──────────────────────────────────────────────────────
        if (footerLayout === "minimal") {
            return (
                <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", maxWidth: p.fullWidth ? "100%" : layoutObj.maxWidth, margin: "0 auto", paddingLeft: innerPad, paddingRight: innerPad }}>
                    <Logo />
                    <div onClick={() => { if (!isPreview) { focusSubItem(block.id, "Footer Links") } }} style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>{mergedLinks.map(link => <NavLink key={link.id} link={link} />)}</div>
                    {copyright && <p onClick={() => { if (!isPreview) { focusSubItem(block.id, "Copyright") } }} style={{ margin: 0, fontSize: "0.82rem", opacity: 0.5 }}>{copyright}</p>}
                </div>
            );
        }

        // ── Centered ─────────────────────────────────────────────────────
        if (footerLayout === "centered") {
            return (
                <div style={{ position: "relative", zIndex: 2, maxWidth: p.fullWidth ? "100%" : layoutObj.maxWidth, margin: "0 auto", paddingLeft: innerPad, paddingRight: innerPad, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5rem" }}>
                    <Logo />
                    {description && <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.7, maxWidth: 440 }}>{description}</p>}
                    {mergedLinks.length > 0 && (
                        <nav onClick={() => { if (!isPreview) { focusSubItem(block.id, "Footer Links") } }} style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center" }}>
                            {mergedLinks.map(link => <NavLink key={link.id} link={link} />)}
                        </nav>
                    )}
                    {copyright && <p onClick={() => { if (!isPreview) { focusSubItem(block.id, "Copyright") } }} style={{ margin: "1rem 0 0", fontSize: "0.82rem", opacity: 0.5, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem", width: "100%" }}>{copyright}</p>}
                </div>
            );
        }

        // ── Columns ───────────────────────────────────────────────────────
        if (footerLayout === "columns") {
            return (
                <div style={{ position: "relative", zIndex: 2, maxWidth: p.fullWidth ? "100%" : layoutObj.maxWidth, margin: "0 auto", paddingLeft: innerPad, paddingRight: innerPad }}>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : `auto repeat(${Math.max(1, linkGroups.length)}, 1fr)`, gap: "2rem 3rem", marginBottom: "2rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <Logo />
                            {description && <p style={{ margin: 0, fontSize: "0.88rem", opacity: 0.65, maxWidth: 240, lineHeight: 1.6 }}>{description}</p>}
                        </div>
                        {linkGroups.length > 0 ? linkGroups.map(group => (
                            <div key={group.id} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} onClick={() => { if (!isPreview) { focusSubItem(block.id, "Footer Links") } }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5 }}>{group.heading}</p>
                                {group.links.map(link => <NavLink key={link.id} link={link} />)}
                            </div>
                        )) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5 }}>Links</p>
                                {mergedLinks.map(link => <NavLink key={link.id} link={link} />)}
                            </div>
                        )}
                    </div>
                    {copyright && <div onClick={() => { if (!isPreview) { focusSubItem(block.id, "Copyright") } }} style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem", textAlign: "center", fontSize: "0.82rem", opacity: 0.5 }}>{copyright}</div>}
                </div>
            );
        }

        // ── Standard (default) ────────────────────────────────────────────
        return (
            <div style={{ position: "relative", zIndex: 2 }}>
                <div className={isPreview && !p.fullWidth ? `footer-${block.id}-inner` : undefined} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "space-between", gap: isMobile ? "2rem" : "1rem", width: "100%", maxWidth: p.fullWidth ? "100%" : layoutObj.maxWidth, margin: "0 auto", boxSizing: "border-box", textAlign: isMobile ? "center" : "left", paddingLeft: innerPad, paddingRight: innerPad }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: isMobile ? "center" : "flex-start" }}>
                        <Logo />
                        {description && (<p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8, maxWidth: "250px" }}>{description}</p>)}
                    </div>
                    <nav onClick={() => { if (!isPreview) { focusSubItem(block.id, "Footer Links") } }} className={isPreview ? `footer-${block.id}-links` : undefined} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "1.5rem", alignItems: "center" }}>
                        {mergedLinks.map(link => <NavLink key={link.id} link={link} />)}
                    </nav>
                </div>
                {copyright && (
                    <div onClick={() => { if (!isPreview) { focusSubItem(block.id, "Copyright") } }} style={{ maxWidth: p.fullWidth ? "100%" : layoutObj.maxWidth, margin: "2rem auto 0", paddingLeft: innerPad, paddingRight: innerPad }}>
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem", textAlign: "center", fontSize: "0.85rem", opacity: 0.6 }}>{copyright}</div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {isPreview && (
                <style>{`
          .footer-${block.id} { padding: ${desktopPadding}; }
          @media (max-width: 1024px) { .footer-${block.id} { padding: ${tabletPadding}; } .footer-${block.id}-inner { flex-direction: column; text-align: center; gap: 2rem; } .footer-${block.id}-links { justify-content: center; width: 100%; flex-wrap: wrap; } }
          @media (max-width: 768px) { .footer-${block.id} { padding: ${mobilePadding}; } .footer-${block.id}-links { flex-direction: column; gap: 1rem; align-items: center; } }
        `}</style>
            )}
            <footer
                id={(p.sectionId as string) || `block-${block.id}`}
                className={isPreview ? `footer-${block.id}` : undefined}
                style={{
                    ...bgStyles,
                    color: textColor,
                    width: "100%",
                    padding: isPreview ? undefined : editorPadding,
                    position: "relative"
                }}
            >
                <BackgroundOverlay p={p} />
                {renderFooterContent()}
            </footer>
        </>
    );
}

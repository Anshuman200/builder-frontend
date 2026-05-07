"use client";
import React from "react";
import Image from "next/image";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, useLinkHandler, useActivePath, CommonButton, getBackgroundStyles, BackgroundOverlay, getTextStyles } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";
import Link from "next/link";

export function HeaderBlock({ block }: BlockProps) {
    const p = block.props;
    const viewMode = useEditorStore((s) => s.viewMode);
    const layoutObj = useEditorStore((s) => s.page?.theme?.layout) || { maxWidth: "100dvw", paddingX: "32px", tabletPaddingX: "24px", mobilePaddingX: "16px" };
    const isPreview = React.useContext(PreviewContext);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const handleLink = useLinkHandler();
    const activePath = useActivePath();
    const focusSubItem = useEditorStore((s) => s.focusSubItem);

    const layout = (p.layout as string) || "standard";
    const position = (p.position as string) || "static";
    const style = (p.style as string) || "solid";
    const rawBg = (p.bgColor as string) || "#ffffff";
    const rawText = (p.textColor as string) || "#1e293b";
    const HEADER_LIGHT_DEFAULTS = ["#ffffff", "#fff", "#f8fafc", "#f1f5f9", "transparent"];
    const isDefaultBg = HEADER_LIGHT_DEFAULTS.includes(rawBg.toLowerCase());
    let bgColor = rawBg;
    let textColor = rawText;

    const desktopPadding = p.padding ? (p.padding as string) : "16px 0px";
    const tabletPadding = p.tabletPadding ? (p.tabletPadding as string) : desktopPadding;
    const mobilePadding = p.mobilePadding ? (p.mobilePadding as string) : tabletPadding;
    const editorPadding = viewMode === "mobile" ? mobilePadding : viewMode === "tablet" ? tabletPadding : desktopPadding;

    const logoType = (p.logoType as string) || "text";
    const logoText = (p.logoText as string) || "Solario Forge";
    const logoImage = p.logoImage as string;
    const bgImage = p.bgImage as string;
    const bgPosition = (p.bgPosition as string) || "center";
    const bgOpacity = parseFloat((p.bgOpacity as string) || "0");
    const logoWidth = (p.logoWidth as string) || "120px";
    const logoHeight = (p.logoHeight as string) || "40px";
    const logoObjectFit = (p.logoObjectFit as React.CSSProperties["objectFit"]) || "cover";
    const logoShape = (p.logoShape as string) || "square";
    const links = (p.links as { id: string; label: string; url: string }[]) || [];
    const showCta = p.showCta !== false;
    const ctaText = (p.ctaText as string) || "Get Started";
    const ctaUrl = (p.ctaUrl as string) || "#";
    const ctaVariant = (p.ctaVariant as string) || "solid";

    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const bgStyles = getBackgroundStyles(p, theme);
    const defaultPrimary = theme.colors?.primary || "#d97706";
    const defaultText = theme.colors?.buttonText || "#ffffff";

    const ctaBgColor = (p.ctaBg as string) || (p.ctaBgColor as string) || defaultPrimary;
    const ctaTextColor = (p.ctaTextColor as string) || (p.ctaColor as string) || defaultText;

    let background = bgStyles.backgroundColor || bgColor, backdropFilter = "none", borderBottom = "none";
    if (style === "glass") { background = (background as string).length === 7 ? `${background}cc` : background; backdropFilter = "blur(12px)"; borderBottom = "1px solid rgba(255, 255, 255, 0.2)"; }
    else if (style === "transparent") { background = "transparent"; }

    const isMobile = isPreview ? false : (viewMode === "mobile");
    const isFloating = p.isFloating === true;
    const floatingWidth = (p.floatingWidth as string) || "95%";
    const floatingTop = (p.floatingTop as string) || "20px";
    const floatingRadius = (p.floatingRadius as string) || "16px";
    const floatingShadow = (p.floatingShadow as string) || "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    const floatingBorderWidth = (p.floatingBorderWidth as string) || "1px";
    const floatingBorderColor = (p.floatingBorderColor as string) || "rgba(255,255,255,0.1)";

    const layoutWidth = (p.layoutWidth as string) || "fluid";
    const innerMaxWidth = layoutWidth === "fluid" ? "100%" : (layoutWidth === "narrow" ? "800px" : layoutObj.maxWidth);

    const baseHeaderStyle: React.CSSProperties = {
        ...bgStyles,
        position: isPreview ? (isFloating ? "fixed" : (position as any)) : "relative",
        top: isPreview ? (isFloating ? floatingTop : (position !== "static" ? 0 : undefined)) : undefined,
        left: isPreview ? (isFloating ? "50%" : (position !== "static" ? 0 : undefined)) : undefined,
        right: isPreview ? (position !== "static" && !isFloating ? 0 : undefined) : undefined,
        transform: isPreview ? (isFloating ? "translateX(-50%)" : undefined) : undefined,
        zIndex: isPreview ? 10000 : undefined,
        backgroundColor: style === "transparent" ? "transparent" : background,
        backdropFilter,
        borderBottom: isFloating ? "none" : borderBottom,
        border: isFloating && style !== "transparent" ? `${floatingBorderWidth} solid ${floatingBorderColor}` : undefined,
        borderRadius: isFloating ? floatingRadius : undefined,
        color: textColor,
        width: isPreview ? (isFloating ? floatingWidth : "100%") : "100%",
        maxWidth: isPreview ? (isFloating ? innerMaxWidth : "100%") : "100%",
        boxShadow: isFloating ? floatingShadow : undefined,
        transition: "all 0.3s ease"
    };
    const ctaStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 20px", borderRadius: "9999px", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", cursor: isPreview ? "pointer" : "default", transition: "opacity 0.2s", background: ctaVariant === "solid" ? ctaBgColor : "transparent", color: ctaVariant === "solid" ? ctaTextColor : ctaBgColor, border: ctaVariant === "outline" ? `2px solid ${ctaBgColor}` : "none" };

    // Logo Element
    const LogoElement = () => {
        const borderRadius = logoShape === "circle" ? "50%" : logoShape === "rounded" ? "12px" : "0px";

        return (
            <Link
                href="/"
                onClick={(e) => {
                    handleLink("/", e);
                    if (!isPreview) focusSubItem(block.id, "Brand (Logo)");
                }}
                style={{
                    ...getTextStyles(p, "logo"),
                    fontSize: getTextStyles(p, "logo").fontSize || "1.25rem",
                    letterSpacing: getTextStyles(p, "logo").letterSpacing || "-0.02em",
                    color: getTextStyles(p, "logo").color || (p.logoColor as string) || textColor,
                    display: "flex", alignItems: "center",
                    textDecorationSkipInk: "auto",
                    cursor: "pointer"
                }}

            >
                {logoType === "image" && logoImage ? (
                    <div style={{
                        width: logoWidth,
                        height: logoHeight,
                        position: "relative",
                        borderRadius,
                        overflow: "hidden"
                    }}>
                        <Image
                            src={logoImage}
                            alt={logoText}
                            fill
                            style={{ objectFit: logoObjectFit || "contain", objectPosition: "left" }}
                            unoptimized={!logoImage.includes('unsplash.com') && !logoImage.includes('pexels.com') && !logoImage.includes('amazonaws.com') && !logoImage.includes('cloudfront.net')}
                            priority
                        />
                    </div>
                ) : (<span>{logoText}</span>)}
            </Link>
        );
    };

    const routes = useEditorStore((s) => s.page?.routes) || [];
    const autoRoutes = routes.filter(r => r.showInHeader !== false);

    // 1. Resolve explicitly ordered links from block props
    const resolvedLinks = (links as any[]).map(l => {
        if (l.isAuto) {
            const route = autoRoutes.find(r => r.id === l.routeId);
            if (!route) return null; // Filter out if no longer marked for header
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

    // ── Nav style props (from Properties Panel) ──────────────────────────────
    const navActiveStyle = (p.navActiveStyle as string) || "underline";
    const navActiveColor = (p.navActiveColor as string) || ctaBgColor;
    const navActiveWeight = (p.navActiveWeight as string) || "700";
    const navInactiveOpacity = parseFloat((p.navInactiveOpacity as string) || "0.75");

    // Nav Links Element
    const NavLinksElement = ({ isMobileMenu = false }: { isMobileMenu?: boolean }) => (
        <nav style={{ display: "flex", alignItems: "center", flexDirection: isMobileMenu ? "column" : "row", gap: isMobileMenu ? "1.5rem" : "2rem" }}>
            {mergedLinks.map((link) => {
                const handleNavClick = (e: React.MouseEvent) => {
                    handleLink(link.url, e);
                    if (!isPreview) focusSubItem(block.id, "Navigation Links");
                    if (isPreview && isMobileMenu) setMobileMenuOpen(false);
                };
                const isActive = link.url === activePath;

                // ── Per-style computed values ──────────────────────────────
                const weight = isActive ? Number(navActiveWeight) : 500;
                const opacity = isActive ? 1 : navInactiveOpacity;

                // Underline
                const borderBottom = (() => {
                    if (isMobileMenu) return "none";
                    if (navActiveStyle === "underline") {
                        return isActive ? `2px solid ${navActiveColor}` : "2px solid transparent";
                    }
                    return "none";
                })();

                // Pill background
                const navColor = (p.navColor as string) || textColor;
                const pillBg = navActiveStyle === "pill" && isActive ? navActiveColor : "transparent";
                const pillColor = navActiveStyle === "pill" && isActive ? "#ffffff" : navColor;
                const pillRadius = "6px";
                const pillPad = navActiveStyle === "pill" ? (isMobileMenu ? "6px 16px" : "4px 14px") : undefined;

                return (
                    <span key={link.id} style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
                        <Link
                            href={link.url}
                            onClick={handleNavClick}
                            style={{
                                color: pillColor,
                                textDecoration: "none",
                                fontWeight: weight,
                                fontSize: isMobileMenu ? "1.1rem" : "0.95rem",
                                opacity,
                                transition: "opacity 0.2s, background 0.2s",
                                paddingBottom: navActiveStyle === "underline" && !isMobileMenu ? "4px" : undefined,
                                borderBottom,
                                background: pillBg,
                                borderRadius: navActiveStyle === "pill" ? pillRadius : undefined,
                                padding: pillPad,
                                display: "inline-block",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = isActive ? "1" : String(navInactiveOpacity); }}
                        >
                            {link.label}
                        </Link>
                        {/* Dot indicator */}
                        {navActiveStyle === "dot" && isActive && !isMobileMenu && (
                            <span style={{
                                display: "block",
                                width: 5, height: 5,
                                borderRadius: "50%",
                                background: navActiveColor,
                                marginTop: 3,
                                flexShrink: 0,
                            }} />
                        )}
                    </span>
                );
            })}
        </nav>
    );



    return (
        <>
            {isPreview && (
                <style>{`
          .header-${block.id} { padding: ${desktopPadding}; padding-left: 0; padding-right: 0; }
          .header-${block.id}-inner { max-width: ${innerMaxWidth}; padding-left: ${layoutObj.paddingX}; padding-right: ${layoutObj.paddingX}; margin: 0 auto; width: 100%; box-sizing: border-box; }
          .header-${block.id}-mobile-menu { display: none !important; }
          .header-${block.id}-hamburger { display: none !important; }
          @media (max-width: 1024px) { .header-${block.id} { padding: ${tabletPadding}; padding-left: 0; padding-right: 0; } .header-${block.id}-inner { padding-left: ${layoutObj.tabletPaddingX}; padding-right: ${layoutObj.tabletPaddingX}; } }
          @media (max-width: 768px) { .header-${block.id} { padding: ${mobilePadding}; padding-left: 0; padding-right: 0; } .header-${block.id}-inner { padding-left: ${layoutObj.mobilePaddingX}; padding-right: ${layoutObj.mobilePaddingX}; } .header-${block.id}-desktop-nav { display: none !important; } .header-${block.id}-desktop-cta { display: none !important; } .header-${block.id}-hamburger { display: flex !important; } .header-${block.id}-mobile-menu.open { display: flex !important; } }
        `}</style>
            )}
            <header
                id={(p.sectionId as string) || `block-${block.id}`}
                className={isPreview ? `header-${block.id}` : undefined}
                style={{
                    ...baseHeaderStyle,
                    padding: isPreview ? undefined : editorPadding,
                    paddingLeft: isPreview ? undefined : 0,
                    paddingRight: isPreview ? undefined : 0
                }}
            >
                <BackgroundOverlay p={p} />
                <div className={isPreview ? `header-${block.id}-inner` : undefined} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: innerMaxWidth, margin: "0 auto", boxSizing: "border-box", paddingLeft: isPreview ? undefined : (viewMode === "mobile" ? layoutObj.mobilePaddingX : viewMode === "tablet" ? layoutObj.tabletPaddingX : layoutObj.paddingX), paddingRight: isPreview ? undefined : (viewMode === "mobile" ? layoutObj.mobilePaddingX : viewMode === "tablet" ? layoutObj.tabletPaddingX : layoutObj.paddingX), position: "relative", zIndex: 2 }}>
                    {layout === "split" ? (<NavLinksElement />) : layout === "centered" ? (<div className={isPreview ? `header-${block.id}-desktop-nav` : undefined} style={{ flex: 1, display: isMobile ? "none" : "flex" }}><NavLinksElement /></div>) : (<LogoElement />)}
                    {layout === "centered" ? (<div style={{ flex: 1, display: "flex", justifyContent: "center" }}><LogoElement /></div>) : layout === "split" ? (<LogoElement />) : (<div className={isPreview ? `header-${block.id}-desktop-nav` : undefined} style={{ display: isMobile ? "none" : "flex" }}><NavLinksElement /></div>)}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", ...(layout === "centered" ? { flex: 1, justifyContent: "flex-end" } : {}) }}>
                        {!isMobile && showCta && (
                            <div className={isPreview ? `header-${block.id}-desktop-cta` : undefined} style={{ display: isMobile ? "none" : "block" }}>
                                {showCta && ctaText && (
                                    <CommonButton
                                        props={p}
                                        prefix="cta"
                                        blockId={block.id}
                                        onClick={() => {
                                            if (!isPreview) focusSubItem(block.id, "CTA Content");
                                        }}
                                    />
                                )}
                            </div>
                        )}
                        <button className={isPreview ? `header-${block.id}-hamburger` : undefined} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: isMobile ? "flex" : "none", background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: "8px" }}>
                            <Bars3Icon style={{ width: 24, height: 24 }} />
                        </button>
                    </div>
                </div>
                <div className={isPreview ? `header-${block.id}-mobile-menu ${mobileMenuOpen ? 'open' : ''}` : undefined} style={{ position: "absolute", top: "100%", left: 0, right: 0, background: style === "transparent" ? "#ffffff" : background, color: textColor, zIndex: 40, display: "flex", flexDirection: "column", borderTop: "1px solid rgba(150,150,150,0.1)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", padding: "1.5rem 24px 2rem", transform: mobileMenuOpen ? "translateY(0)" : "translateY(-150%)", opacity: mobileMenuOpen ? 1 : 0, visibility: mobileMenuOpen ? "visible" : "hidden", transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, visibility 0.4s", pointerEvents: mobileMenuOpen ? "auto" : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
                        <NavLinksElement isMobileMenu={true} />
                        {showCta && (
                            <CommonButton
                                props={p}
                                prefix="cta"
                                className="mt-4"
                                blockId={block.id}
                            />
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}

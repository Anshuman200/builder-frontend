"use client";
import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";

export function HeaderBlock({ block }: BlockProps) {
    const p = block.props;
    const viewMode = useEditorStore((s) => s.viewMode);
    const layoutObj = useEditorStore((s) => s.page?.theme?.layout) || { maxWidth: "100dvw", paddingX: "32px", tabletPaddingX: "24px", mobilePaddingX: "16px" };
    const isDark = useEditorStore((s) => (s.page?.theme?.mode || "light") === "dark");
    const isPreview = React.useContext(PreviewContext);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const layout = (p.layout as string) || "standard";
    const position = (p.position as string) || "static";
    const style = (p.style as string) || "solid";
    const rawBg = (p.bgColor as string) || "#ffffff";
    const rawText = (p.textColor as string) || "#1e293b";
    const HEADER_LIGHT_DEFAULTS = ["#ffffff", "#fff", "#f8fafc", "#f1f5f9", "transparent"];
    const isDefaultBg = HEADER_LIGHT_DEFAULTS.includes(rawBg.toLowerCase());
    let bgColor = rawBg;
    if (isDark && isDefaultBg) bgColor = rawBg === "transparent" ? "transparent" : "#09090b";
    let textColor = rawText;
    if (isDark) textColor = "#f8fafc";

    const desktopPadding = p.padding ? (p.padding as string) : "16px 0px";
    const tabletPadding = p.tabletPadding ? (p.tabletPadding as string) : desktopPadding;
    const mobilePadding = p.mobilePadding ? (p.mobilePadding as string) : tabletPadding;
    const editorPadding = viewMode === "mobile" ? mobilePadding : viewMode === "tablet" ? tabletPadding : desktopPadding;

    const logoType = (p.logoType as string) || "text";
    const logoText = (p.logoText as string) || "PageCraft";
    const logoImage = p.logoImage as string;
    const logoWidth = (p.logoWidth as string) || "120px";
    const links = (p.links as { id: string; label: string; url: string }[]) || [];
    const showCta = p.showCta !== false;
    const ctaText = (p.ctaText as string) || "Get Started";
    const ctaUrl = (p.ctaUrl as string) || "#";
    const ctaVariant = (p.ctaVariant as string) || "solid";
    
    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const defaultPrimary = theme.colors?.primary || "#6366f1";
    const defaultText = theme.colors?.buttonText || "#ffffff";

    const ctaBgColor = (p.ctaBgColor as string) || defaultPrimary;
    const ctaTextColor = (p.ctaTextColor as string) || defaultText;

    let background = bgColor, backdropFilter = "none", borderBottom = "none";
    if (style === "glass") { background = bgColor.length === 7 ? `${bgColor}cc` : bgColor; backdropFilter = "blur(12px)"; borderBottom = "1px solid rgba(255, 255, 255, 0.2)"; }
    else if (style === "transparent") { background = "transparent"; }
    else if (isDark && style === "solid") { borderBottom = "1px solid rgba(255,255,255,0.08)"; }

    const isMobile = isPreview ? false : (viewMode === "mobile");
    const baseHeaderStyle: React.CSSProperties = { position: position as any, top: position !== "static" ? 0 : undefined, left: position !== "static" ? 0 : undefined, right: position !== "static" ? 0 : undefined, zIndex: 50, background, backdropFilter, borderBottom, color: textColor, width: "100%" };
    const ctaStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 20px", borderRadius: "9999px", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", cursor: isPreview ? "pointer" : "default", transition: "opacity 0.2s", background: ctaVariant === "solid" ? ctaBgColor : "transparent", color: ctaVariant === "solid" ? ctaTextColor : ctaBgColor, border: ctaVariant === "outline" ? `2px solid ${ctaBgColor}` : "none" };

    const LogoElement = () => (
        <div style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em", color: textColor, display: "flex", alignItems: "center" }}>
            {logoType === "image" && logoImage ? (<img src={logoImage} alt={logoText} style={{ width: logoWidth, maxHeight: "40px", objectFit: "contain" }} />) : (<span>{logoText}</span>)}
        </div>
    );

    const NavLinksElement = ({ isMobileMenu = false }: { isMobileMenu?: boolean }) => (
        <nav style={{ display: "flex", alignItems: "center", flexDirection: isMobileMenu ? "column" : "row", gap: isMobileMenu ? "1.5rem" : "2rem" }}>
            {links.map((link) => {
                const isAnchor = link.url.startsWith("#") && link.url.length > 1;
                const handleNavClick = (e: React.MouseEvent) => {
                    if (!isPreview) { e.preventDefault(); return; }
                    if (isAnchor) { e.preventDefault(); const el = document.getElementById(link.url.substring(1)); if (el) { el.scrollIntoView({ behavior: "smooth" }); if (isMobileMenu) setMobileMenuOpen(false); } }
                };
                return (<a key={link.id} href={link.url} onClick={handleNavClick} style={{ color: "inherit", textDecoration: "none", fontWeight: 500, fontSize: isMobileMenu ? "1.1rem" : "0.95rem", opacity: 0.8, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.8"}>{link.label}</a>);
            })}
        </nav>
    );

    return (
        <>
            {isPreview && (
                <style>{`
          .header-${block.id} { padding: ${desktopPadding}; padding-left: 0; padding-right: 0; }
          .header-${block.id}-inner { max-width: ${layoutObj.maxWidth}; padding-left: ${layoutObj.paddingX}; padding-right: ${layoutObj.paddingX}; margin: 0 auto; width: 100%; box-sizing: border-box; }
          .header-${block.id}-mobile-menu { display: none !important; }
          .header-${block.id}-hamburger { display: none !important; }
          @media (max-width: 1024px) { .header-${block.id} { padding: ${tabletPadding}; padding-left: 0; padding-right: 0; } .header-${block.id}-inner { padding-left: ${layoutObj.tabletPaddingX}; padding-right: ${layoutObj.tabletPaddingX}; } }
          @media (max-width: 768px) { .header-${block.id} { padding: ${mobilePadding}; padding-left: 0; padding-right: 0; } .header-${block.id}-inner { padding-left: ${layoutObj.mobilePaddingX}; padding-right: ${layoutObj.mobilePaddingX}; } .header-${block.id}-desktop-nav { display: none !important; } .header-${block.id}-desktop-cta { display: none !important; } .header-${block.id}-hamburger { display: flex !important; } .header-${block.id}-mobile-menu.open { display: flex !important; } }
        `}</style>
            )}
            <header id={(p.sectionId as string) || `block-${block.id}`} className={isPreview ? `header-${block.id}` : undefined} style={{ ...baseHeaderStyle, position: position === "static" ? "relative" : (position as any), padding: isPreview ? undefined : editorPadding, paddingLeft: isPreview ? undefined : 0, paddingRight: isPreview ? undefined : 0, zIndex: 50 }}>
                <div className={isPreview && !p.fullWidth ? `header-${block.id}-inner` : undefined} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: p.fullWidth ? "100%" : layoutObj.maxWidth, margin: "0 auto", boxSizing: "border-box", paddingLeft: isPreview && !p.fullWidth ? undefined : (viewMode === "mobile" ? layoutObj.mobilePaddingX : viewMode === "tablet" ? layoutObj.tabletPaddingX : layoutObj.paddingX), paddingRight: isPreview && !p.fullWidth ? undefined : (viewMode === "mobile" ? layoutObj.mobilePaddingX : viewMode === "tablet" ? layoutObj.tabletPaddingX : layoutObj.paddingX) }}>
                    {layout === "split" ? (<NavLinksElement />) : layout === "centered" ? (<div className={isPreview ? `header-${block.id}-desktop-nav` : undefined} style={{ flex: 1, display: isMobile ? "none" : "flex" }}><NavLinksElement /></div>) : (<LogoElement />)}
                    {layout === "centered" ? (<div style={{ flex: 1, display: "flex", justifyContent: "center" }}><LogoElement /></div>) : layout === "split" ? (<LogoElement />) : (<div className={isPreview ? `header-${block.id}-desktop-nav` : undefined} style={{ display: isMobile ? "none" : "flex" }}><NavLinksElement /></div>)}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", ...(layout === "centered" ? { flex: 1, justifyContent: "flex-end" } : {}) }}>
                        {!isMobile && showCta && (
                            <div className={isPreview ? `header-${block.id}-desktop-cta` : undefined} style={{ display: isMobile ? "none" : "block" }}>
                                {showCta && ctaText && (
                                    <a href={ctaUrl} onClick={(e) => { if (!isPreview) { e.preventDefault(); return; } const isAnchor = ctaUrl.startsWith("#") && ctaUrl.length > 1; if (isAnchor) { e.preventDefault(); const el = document.getElementById(ctaUrl.substring(1)); if (el) el.scrollIntoView({ behavior: "smooth" }); } }} style={ctaStyle}
                                        onMouseEnter={e => { if (ctaVariant === "outline") { e.currentTarget.style.background = ctaBgColor; e.currentTarget.style.color = ctaTextColor; } else { e.currentTarget.style.opacity = "0.9"; } }}
                                        onMouseLeave={e => { if (ctaVariant === "outline") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = ctaBgColor; } else { e.currentTarget.style.opacity = "1"; } }}
                                    >{ctaText}</a>
                                )}
                            </div>
                        )}
                        <button className={isPreview ? `header-${block.id}-hamburger` : undefined} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: isMobile ? "flex" : "none", background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: "8px" }}>
                            <Bars3Icon style={{ width: 24, height: 24 }} />
                        </button>
                    </div>
                </div>
                <div className={isPreview ? `header-${block.id}-mobile-menu ${mobileMenuOpen ? 'open' : ''}` : undefined} style={{ position: "absolute", top: "100%", left: 0, right: 0, background: style === "transparent" ? (isDark ? "#09090b" : "#ffffff") : background, color: textColor, zIndex: 40, display: "flex", flexDirection: "column", borderTop: "1px solid rgba(150,150,150,0.1)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", padding: "1.5rem 24px 2rem", transform: mobileMenuOpen ? "translateY(0)" : "translateY(-150%)", opacity: mobileMenuOpen ? 1 : 0, visibility: mobileMenuOpen ? "visible" : "hidden", transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, visibility 0.4s", pointerEvents: mobileMenuOpen ? "auto" : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
                        <NavLinksElement isMobileMenu={true} />
                        {showCta && (<a href={ctaUrl} style={{ ...ctaStyle, width: "100%", marginTop: "1rem", padding: "12px 20px" }}>{ctaText}</a>)}
                    </div>
                </div>
            </header>
        </>
    );
}

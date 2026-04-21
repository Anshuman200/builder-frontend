"use client";

import type { Block } from "@/types";
/**
 * blocks/shared.tsx — Shared types, context, and block wrappers
 */

import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TrashIcon, EllipsisHorizontalIcon, ArrowsPointingOutIcon, PhotoIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

import { useEditorStore } from "@/stores/editorStore";
import { IconButton } from "@/components/ui/IconButton";
import AppToolTip from "@/components/common/AppToolTip";
import { getIcon } from "@/lib/utils/icons";
import { DEFAULT_THEME } from "@/lib/utils/theme";

// ─── Preview context ──────────────────────────────────────────────────────────

export const PreviewContext = React.createContext(false);
export function PreviewProvider({ children }: { children: React.ReactNode }) {
    return <PreviewContext.Provider value={true}>{children}</PreviewContext.Provider>;
}

// ─── Active route path context ────────────────────────────────────────────────
// Shared by PreviewClient (real navigation) and EditorCanvas (active edit route)
// so HeaderBlock can highlight the correct nav link without prop-drilling.

export const ActivePathContext = React.createContext<string>("/");
export function useActivePath() {
    return React.useContext(ActivePathContext);
}

/**
 * useLinkHandler - Shared hook for blocks to handle internal vs external links
 * In preview mode, internal links (starting with /) are handled via hash changes.
 */
export function useLinkHandler() {
    const isPreview = React.useContext(PreviewContext);
    const { page, setActiveRoute } = useEditorStore();

    return (url: string, e?: React.MouseEvent) => {
        // In the editor (not preview)
        if (!isPreview) {
            // Handle internal page transitions within the editor
            if (url.startsWith("/")) {
                const targetRoute = page?.routes?.find(r => r.path === url);
                if (targetRoute) {
                    if (e) e.preventDefault();
                    setActiveRoute(targetRoute.id);
                    return;
                }
            }

            // Standard editor behavior: block the click so we don't navigate away
            if (e) e.preventDefault();
            return;
        }

        // Anchor links (e.g. #contact)
        if (url.startsWith("#") && url.length > 1) {
            if (e) e.preventDefault();
            const el = document.getElementById(url.substring(1));
            if (el) el.scrollIntoView({ behavior: "smooth" });
            return;
        }

        // Internal routes (e.g. /about)
        if (url.startsWith("/") && isPreview) {
            if (e) e.preventDefault();
            window.location.hash = url;
            return;
        }

        // External links or other manual URLs — let them follow default behavior in preview
    };
}

/**
 * Helper to identify blocks with primary media and their property names.
 */
export function getBlockMediaInfo(type: string) {
    if (type === "image") return { prop: "src", label: "Image", icon: PhotoIcon, mediaType: "image" as const };
    if (type === "video") return { prop: "url", label: "Video", icon: VideoCameraIcon, mediaType: "video" as const };
    if (["hero", "container", "wave", "header"].includes(type)) return { prop: "bgImage", label: "Background", icon: PhotoIcon, mediaType: "image" as const };
    if (["feature", "feature_card"].includes(type)) return { prop: "image", label: "Image", icon: PhotoIcon, mediaType: "image" as const };
    return null;
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface BlockProps {
    block: Block;
}

// ─── BlockRenderer forward declaration ───────────────────────────────────────
// Imported dynamically to avoid circular deps; actual implementation is in blocks.tsx


let _BlockRenderer: React.FC<{ block: Block }> = () => null;
export function setBlockRenderer(fn: React.FC<{ block: Block }>) {
    _BlockRenderer = fn;
}
export function BlockRendererRef({ block }: { block: Block }) {
    return <_BlockRenderer block={block} />;
}

// ─── ChildBlockWrapper ────────────────────────────────────────────────────────

export function ChildBlockWrapper({
    block,
    children,
    outlineColor = "#6366f1",
    outlineColorHover = "#a5b4fc",
}: {
    block: Block;
    children?: React.ReactNode;
    outlineColor?: string;
    outlineColorHover?: string;
}) {
    const isPreview = React.useContext(PreviewContext);
    // Targeted selectors — only re-render when THIS block's selection/hover state changes
    const isSelected = !isPreview && useEditorStore((s) => s.selectedBlockId === block.id);
    const isHovered = !isPreview && useEditorStore((s) => s.hoveredBlockId === block.id);
    const selectBlock = useEditorStore((s) => s.selectBlock);
    const hoverBlock = useEditorStore((s) => s.hoverBlock);
    const deleteBlock = useEditorStore((s) => s.deleteBlock);
    const isPicker = block.type === "media-picker";
    const showControls = (isSelected || isHovered) && !isPicker;

    const { attributes, listeners, setNodeRef, transform, isDragging, transition: sortableTransition } = useSortable({
        id: block.id,
        data: { type: "canvas", blockType: block.type },
        disabled: isPicker,
    });

    const animType = (block.props.animationType as string) || "none";
    const animDuration = Number(block.props.animationDuration || 0.5);
    const animDelay = Number(block.props.animationDelay || 0);
    const animPlayback = (block.props.animationPlayback as string) || "once";

    const getVariants = () => {
        if (animType === "none") return undefined;

        switch (animType) {
            case "fade":
                return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
            case "slide-up":
                return { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
            case "slide-down":
                return { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } };
            case "slide-left":
                return { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } };
            case "slide-right":
                return { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } };
            case "zoom-in":
                return { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } };
            case "zoom-out":
                return { hidden: { opacity: 0, scale: 1.1 }, visible: { opacity: 1, scale: 1 } };
            case "flip":
                return { hidden: { opacity: 0, rotateX: -90 }, visible: { opacity: 1, rotateX: 0 } } as any;
            case "bounce":
                return { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.5 } } } as any;
            default:
                return undefined;
        }
    };

    const variants = getVariants();
    const viewport = animPlayback === "always" ? { once: false, margin: "-50px" } : { once: true, margin: "-50px" };
    const transition = { duration: animDuration, delay: animDelay, ease: "easeOut" } as any;

    // Propagate explicit height:100% so image blocks inside columns can fill their parent.
    const needsFullHeight = block.props.height === "100%";

    if (isPreview) {
        if (animType !== "none" && variants) {
            return (
                <motion.div
                    style={{ position: "relative", width: "100%", height: needsFullHeight ? "100%" : undefined }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewport}
                    variants={variants}
                    transition={transition}
                >
                    {children || <BlockRendererRef block={block} />}
                </motion.div>
            );
        }

        return (
            <div style={{ position: "relative", width: "100%", height: needsFullHeight ? "100%" : undefined }}>
                {children || <BlockRendererRef block={block} />}
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            id={`block-${block.id}`}
            style={{
                position: "relative",
                width: "100%",
                height: needsFullHeight ? "100%" : undefined,
                transform: CSS.Transform.toString(transform),
                transition: sortableTransition || undefined,
                // Keep a very faint ghost in the original spot to prevent "gray holes" 
                // while still avoiding the double-rendering flicker.
                opacity: isDragging ? 0.2 : 1,
            }}
            onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
            onMouseEnter={() => hoverBlock(block.id)}
            onMouseLeave={() => hoverBlock(null)}
        >
            {/* Selection / hover ring — above all block content */}
            {(isSelected || isHovered) && !isDragging && (
                <div style={{
                    position: "absolute", inset: 0,
                    border: isSelected ? `2px solid ${outlineColor}` : `1px solid ${outlineColorHover}`,
                    boxShadow: isSelected ? `inset 0 0 0 1px ${outlineColor}22` : undefined,
                    zIndex: 9998, pointerEvents: "none",
                }} />
            )}
            {showControls && (
                <div style={{
                    position: "absolute", top: 4, right: 4,
                    display: "flex", gap: 2, padding: 3,
                    background: "#ffffff", borderRadius: 8, zIndex: 90,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                }}>
                    {/* Quick Media Change */}
                    {(() => {
                        const info = getBlockMediaInfo(block.type);
                        if (!info) return null;

                        return (
                            <AppToolTip title={`Change ${info.label}`}>
                                <IconButton
                                    icon={<info.icon style={{ width: 14, height: 14 }} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        useEditorStore.getState().showMediaPicker({
                                            type: info.mediaType,
                                            title: `Change ${info.label}`,
                                            onSelect: (url) => {
                                                useEditorStore.getState().updateBlock(block.id, { [info.prop]: url }, true);
                                            }
                                        });
                                    }}
                                />
                            </AppToolTip>
                        );
                    })()}

                    {/* Drag to reorder */}
                    <AppToolTip title="Drag to reorder">
                        <IconButton {...attributes} {...listeners} icon={<ArrowsPointingOutIcon style={{ width: 14, height: 14 }} />} />
                    </AppToolTip>
                    {/* Delete block */}
                    <AppToolTip title="Delete block">
                        <IconButton icon={<TrashIcon style={{ width: 13, height: 13 }} />} onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} />
                    </AppToolTip>
                </div>
            )}
            {children || <BlockRendererRef block={block} />}
        </div>
    );
}

// ─── SortableBlockGroup ───────────────────────────────────────────────────────
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export function SortableBlockGroup({ blocks, children }: { blocks: Block[], children: React.ReactNode }) {
    const isPreview = React.useContext(PreviewContext);
    if (isPreview) return <>{children}</>;
    return (
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {children}
        </SortableContext>
    );
}

// ─── DropZoneStrip ────────────────────────────────────────────────────────────

export function DropZoneStrip({
    zoneId,
    childProp,
    hasChildren,
    stripColor = "#6366f1",
    emptyLabel = "Drag blocks here",
}: {
    zoneId: string;
    childProp?: string;
    hasChildren: boolean;
    stripColor?: string;
    emptyLabel?: string;
}) {
    const isPreview = React.useContext(PreviewContext);
    const { setNodeRef, isOver } = useDroppable({ id: zoneId });
    const { openBlockPicker } = useEditorStore();

    if (isPreview) return null;

    return (
        <div
            ref={setNodeRef}
            onClick={(e) => {
                e.stopPropagation();

                // 1. Determine the actual block ID (cleaning prefixes if necessary)
                let targetId = zoneId;
                const colMatch = zoneId.match(/^col-([01])-(.+)$/);
                const childMatch = zoneId.match(/^(?:hero|container|wave|features|carousel)-(.+)$/);

                if (colMatch) targetId = colMatch[2];
                else if (childMatch) targetId = childMatch[1];

                // 2. Determine the child property
                let effectiveChildProp = childProp;
                if (!effectiveChildProp) {
                    if (colMatch) effectiveChildProp = `col${colMatch[1]}`;
                    else effectiveChildProp = "childBlocks";
                }

                openBlockPicker({ id: targetId, position: "inside", childProp: effectiveChildProp }, "elements");
            }}
            style={{
                width: "100%",
                minHeight: hasChildren ? 44 : 120,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px dashed ${isOver ? stripColor : "rgba(150,150,150,0.35)"}`,
                borderRadius: 8,
                background: isOver ? `${stripColor}15` : "transparent",
                transition: "all 0.15s",
                marginTop: hasChildren ? 8 : 0,
                cursor: "pointer",
                boxSizing: "border-box",
            }}
        >
            <span style={{ fontSize: 12, color: isOver ? stripColor : "rgba(150,150,150,0.6)", fontWeight: 500, userSelect: "none" }}>
                {isOver ? "Drop here" : hasChildren ? "+ drop more blocks here" : emptyLabel}
            </span>
        </div>
    );
}

// ─── CommonButton ────────────────────────────────────────────────────────────

export const BTN_SIZES: Record<string, { padding: string; fontSize: string; iconSize: number }> = {
    sm: { padding: "8px 18px", fontSize: "0.8rem", iconSize: 14 },
    md: { padding: "11px 26px", fontSize: "0.95rem", iconSize: 16 },
    lg: { padding: "14px 34px", fontSize: "1.05rem", iconSize: 18 },
    xl: { padding: "18px 44px", fontSize: "1.2rem", iconSize: 20 },
};

export const BTN_SHADOWS: Record<string, string> = {
    none: "none",
    sm: "0 1px 4px rgba(0,0,0,0.15)",
    md: "0 4px 12px rgba(0,0,0,0.18)",
    lg: "0 8px 24px rgba(0,0,0,0.22)",
    glow: "0 0 20px 4px rgba(99,102,241,0.35)",
};

interface CommonButtonProps {
    props: Record<string, any>;
    id?: string;
    onClick?: (e: React.MouseEvent) => void;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit";
    prefix?: string;
}

export function CommonButton({ props: p, id, onClick, isLoading, disabled, className, type = "button", prefix = "button" }: CommonButtonProps) {
    const isPreview = React.useContext(PreviewContext);
    const handleLink = useLinkHandler();

    // Standardize variant/size/align
    const variant = (p[`${prefix}Variant`] as string) || (p.buttonVariant as string) || (p.variant as string) || "solid";
    const size = (p[`${prefix}Size`] as string) || (p.size as string) || "md";
    const sizeStyle = BTN_SIZES[size] || BTN_SIZES.md;
    const shadow = BTN_SHADOWS[(p[`${prefix}Shadow`] as string) || (p.shadow as string) || "none"] || "none";
    const radius = (p[`${prefix}BorderRadius`] as string) || (p.buttonBorderRadius as string) || (p.borderRadius as string) || "8px";
    const bWidth = (p[`${prefix}BorderWidth`] as string) || (p.borderWidth as string) || "1px";

    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const defaultPrimary = theme.colors?.primary || "#6366f1";
    const defaultSecondary = theme.colors?.secondary || "#8b5cf6";
    const defaultText = theme.colors?.buttonText || "#ffffff";

    let background = defaultPrimary, color = defaultText, border = "none";
    const finalBg = (p[`${prefix}Bg`] as string) || (p[`${prefix}BgColor`] as string) || (p.buttonBg as string) || (p.bgColor as string);
    const finalText = (p[`${prefix}TextColor`] as string) || (p.buttonTextColor as string) || (p.textColor as string);

    switch (variant) {
        case "solid":
            background = finalBg || defaultPrimary;
            color = finalText || defaultText;
            break;
        case "outline":
            background = "transparent";
            color = finalText || finalBg || defaultPrimary;
            border = `${bWidth} solid ${(p[`${prefix}BorderColor`] as string) || (p.borderColor as string) || finalBg || defaultPrimary}`;
            break;
        case "ghost":
            background = finalBg ? `${finalBg}18` : "rgba(99,102,241,0.08)";
            color = finalText || finalBg || defaultPrimary;
            break;
        case "soft":
            background = finalBg ? `${finalBg}22` : "rgba(99,102,241,0.13)";
            color = finalText || finalBg || defaultPrimary;
            border = `${bWidth} solid ${(p[`${prefix}BorderColor`] as string) || (p.borderColor as string) || (finalBg ? `${finalBg}55` : "rgba(99,102,241,0.3)")}`;
            break;
        case "gradient":
            background = `linear-gradient(${(p[`${prefix}GradientDir`] as string) || (p.gradientDir as string) || "to right"}, ${(p[`${prefix}GradientFrom`] as string) || (p.gradientFrom as string) || defaultPrimary}, ${(p[`${prefix}GradientTo`] as string) || (p.gradientTo as string) || defaultSecondary})`;
            color = finalText || defaultText;
            break;
        case "link":
            background = "transparent";
            color = finalText || finalBg || defaultPrimary;
            break;
    }

    const IconLeft = (p[`${prefix}IconLeft`] as string) || (p.iconLeft as string) ? getIcon((p[`${prefix}IconLeft`] as string) || (p.iconLeft as string)) : null;
    const IconRight = (p[`${prefix}IconRight`] as string) || (p.iconRight as string) ? getIcon((p[`${prefix}IconRight`] as string) || (p.iconRight as string)) : null;

    const btnStyle: React.CSSProperties = {
        position: "relative",
        display: (p[`${prefix}FullWidth`] !== false && p.buttonFullWidth !== false && p.fullWidth !== false) ? "flex" : "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5em",
        width: (p[`${prefix}FullWidth`] === true || p.buttonFullWidth === true || p.fullWidth === true) ? "100%" : undefined,
        textDecoration: variant === "link" ? "underline" : "none",
        borderRadius: radius,
        fontWeight: (p[`${prefix}FontWeight`] as string) || (p.fontWeight as string) || "600",
        fontSize: (p[`${prefix}FontSize`] as string) || (p.fontSize as string) || sizeStyle.fontSize,
        letterSpacing: (p[`${prefix}LetterSpacing`] as string) || (p.letterSpacing as string) || "0.01em",
        cursor: (isPreview && !disabled && !isLoading) ? "pointer" : (isLoading || disabled ? "not-allowed" : "default"),
        boxShadow: shadow === "none" ? undefined : shadow,
        transition: "all 0.2s ease",
        background,
        color,
        border,
        padding: variant === "link" ? "0" : sizeStyle.padding,
        opacity: (disabled || isLoading) ? 0.7 : 1,
        userSelect: "none",
        outline: "none",
    };

    const label = (p.buttonText as string) || (p.submitLabel as string) || (p.ctaText as string) || (p.label as string) || "Button";

    const content = (
        <>
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && IconLeft && <IconLeft style={{ width: sizeStyle.iconSize, height: sizeStyle.iconSize }} />}
            <span>{label}</span>
            {!isLoading && IconRight && <IconRight style={{ width: sizeStyle.iconSize, height: sizeStyle.iconSize }} />}
        </>
    );

    if (type === "submit") {
        return (
            <button
                id={id}
                type="submit"
                disabled={disabled || isLoading}
                style={btnStyle}
                className={className}
                onClick={onClick}
            >
                {content}
            </button>
        );
    }

    return (
        <a
            id={id}
            href={isPreview ? (p.href as string || p.ctaUrl as string || "#") : undefined}
            onClick={(e) => {
                if (onClick) onClick(e);
                handleLink((p.href as string || p.ctaUrl as string || "#"), e);
            }}
            style={btnStyle}
            className={className}
        >
            {content}
        </a>
    );
}
// ─── Card Standardization ───────────────────────────────────────────────────

export const CARD_SHADOWS: Record<string, string> = {
    none: "none",
    sm: "0 2px 8px rgba(0,0,0,0.06)",
    md: "0 4px 20px rgba(0,0,0,0.1)",
    lg: "0 10px 40px rgba(0,0,0,0.12)",
    xl: "0 20px 60px rgba(0,0,0,0.18)",
    glow: "0 0 25px rgba(var(--primary-rgb), 0.3)",
};

interface GetCardStylesOptions {
    props: Record<string, any>;
    isFocused?: boolean;
    isHovered?: boolean;
    primaryColor?: string;
    primaryRgb?: string;
}

export function getCardStyles({ props: p, isFocused, isHovered, primaryColor = "#6366f1", primaryRgb = "99, 102, 241" }: GetCardStylesOptions): React.CSSProperties {
    const cardStyle = (p.cardStyle as string) || "raised";
    const cardBg = (p.cardBg as string) || "var(--surface)";
    const cardRadius = (p.cardRadius as string) || "16px";
    const shadowKey = (p.cardShadow as string) || (cardStyle === "raised" ? "md" : "none");
    const cardShadow = CARD_SHADOWS[shadowKey] || shadowKey;
    const padding = (p.cardPadding as string) || (cardStyle !== "none" ? "2rem 1.75rem" : "0.5rem");

    let baseStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        padding,
        borderRadius: cardStyle !== "none" ? cardRadius : 0,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
    };

    // Apply specific style variants
    switch (cardStyle) {
        case "raised":
            baseStyle.background = cardBg;
            baseStyle.boxShadow = cardShadow;
            break;
        case "outlined":
            baseStyle.background = cardBg;
            baseStyle.border = `1.5px solid ${p.cardBorderColor || "var(--border)"}`;
            break;
        case "filled":
            baseStyle.background = cardBg !== "var(--surface)" ? cardBg : `rgba(${primaryRgb}, 0.06)`;
            break;
        case "glass":
            baseStyle.background = "rgba(255, 255, 255, 0.7)";
            baseStyle.backdropFilter = "blur(12px)";
            baseStyle.border = "1px solid rgba(255, 255, 255, 0.3)";
            baseStyle.boxShadow = "0 8px 32px 0 rgba(31, 38, 135, 0.07)";
            break;
        case "none":
            baseStyle.background = "transparent";
            break;
    }

    // Apply hover effects
    if (isHovered && !isFocused) {
        const hoverEffect = (p.cardHoverEffect as string) || (cardStyle === "raised" ? "up" : "none");
        switch (hoverEffect) {
            case "up":
                baseStyle.transform = "translateY(-6px)";
                if (cardStyle === "raised") baseStyle.boxShadow = CARD_SHADOWS.lg;
                break;
            case "scale":
                baseStyle.transform = "scale(1.02)";
                break;
            case "glow":
                baseStyle.boxShadow = `0 0 20px 2px rgba(${primaryRgb}, 0.25)`;
                break;
        }
    }

    // Apply editor focus state
    if (isFocused) {
        baseStyle.boxShadow = "inset 0 0 0 3px #0099ff, 0 0 20px rgba(0,153,255,0.4)";
        baseStyle.zIndex = 50;
        baseStyle.transform = "scale(1.015)";
        baseStyle.cursor = "pointer";
    }

    return baseStyle;
}

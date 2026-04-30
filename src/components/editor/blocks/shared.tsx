"use client";

import type { Block } from "@/types";
/**
 * blocks/shared.tsx — Shared types, context, and block wrappers
 */

import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TrashIcon, EllipsisHorizontalIcon, PhotoIcon, VideoCameraIcon, ViewColumnsIcon, PaintBrushIcon, ArrowPathIcon, SparklesIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

import { useEditorStore } from "@/stores/editorStore";
import { IconButton } from "@/components/ui/IconButton";
import AppToolTip from "@/components/common/AppToolTip";
import { getIcon } from "@/lib/utils/icons";
import { DEFAULT_THEME } from "@/lib/utils/theme";
import { Dropdown } from "antd";

import { getTemplatesForBlock, transformBlockToTemplate } from "@/lib/config/templates";

// ─── Preview context ──────────────────────────────────────────────────────────

export const PreviewContext = React.createContext(false);
export const BlockContext = React.createContext<string | null>(null);

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

export function getBlockMediaInfo(type: string) {
    if (type === "image") return { prop: "src", label: "Image", icon: ArrowPathIcon, mediaType: "image" as const };
    if (type === "video") return { prop: "url", label: "Video", icon: VideoCameraIcon, mediaType: "video" as const };
    if (["hero", "container", "wave", "header", "features", "stats", "team"].includes(type)) return { prop: "bgImage", label: "Background", icon: ArrowPathIcon, mediaType: "image" as const };
    if (["feature", "feature_card"].includes(type)) return { prop: "image", label: "Image", icon: ArrowPathIcon, mediaType: "image" as const };
    return null;
}

/**
 * Helper to identify blocks with multiple layout styles.
 */
export function getBlockLayouts(type: string) {
    if (type === "header") return ["standard", "centered", "split"];
    if (type === "footer") return ["standard", "minimal", "centered", "columns"];
    if (type === "hero") return ["standard", "split", "centered"];
    if (type === "features") return ["grid", "alternating", "horizontal", "icon-grid", "bento"];
    if (type === "stats") return ["grid", "strip", "kpi"];
    if (type === "team") return ["grid", "list", "compact", "large", "spotlight"];
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
// ─── Quick Layout Switcher ──────────────────────────────────────────────────

export function QuickLayoutChange({ block }: { block: Block }) {
    const { replaceBlock } = useEditorStore();
    const templates = getTemplatesForBlock(block);

    if (!templates) return null;

    const currentTemplateId = (block.props.templateId as string) || templates[0].id;

    const menuItems = templates.map(s => ({
        key: s.id,
        label: (
            <div className="px-2 py-1 flex items-center justify-between gap-4">
                <span className="font-medium text-xs">{s.name}</span>
                {currentTemplateId === s.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
            </div>
        ),
        onClick: () => {
            const template = templates.find(ts => ts.id === s.id);
            if (template) {
                const newBlock = transformBlockToTemplate(block, template);
                replaceBlock(block.id, newBlock);
            }
        }
    }));


    return (
        <AppToolTip title="Change Template">
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
                <IconButton icon={<SparklesIcon style={{ width: 14, height: 14 }} />} />
            </Dropdown>
        </AppToolTip>
    );
}

// ─── BlockRenderer ──────────────────────────────────────────────────────────


export function BlockRendererRef({ block }: { block: Block }) {
    const Renderer = React.useMemo(() => _BlockRenderer, []);
    return Renderer ? <Renderer block={block} /> : null;
}

// ─── ChildBlockWrapper ────────────────────────────────────────────────────────

export function InlineTextEditor({
    blockId,
    propName,
    content,
    tagName = "span",
    style,
    className,
    placeholder = "Click to edit text…",
    multiline = false
}: {
    blockId: string;
    propName: string;
    content: string;
    tagName?: React.ElementType | string;
    style?: React.CSSProperties;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
}) {
    const isPreview = React.useContext(PreviewContext);
    const updateBlock = useEditorStore((s) => s.updateBlock);
    const { selectBlock, focusSubItem } = useEditorStore();
    const isSelected = useEditorStore((s) => s.selectedBlockId === blockId);
    const [isEditing, setIsEditing] = React.useState(false);
    const contentRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
        if (!isSelected && isEditing) {
            setIsEditing(false);
        }
    }, [isSelected, isEditing]);

    const handleClick = (e: React.MouseEvent) => {
        if (isPreview) return;
        e.stopPropagation();

        if (!isEditing) {
            e.preventDefault();
            selectBlock(blockId);
            focusSubItem(blockId, propName);
            setIsEditing(true);
            setTimeout(() => {
                if (contentRef.current) {
                    contentRef.current.focus();
                    // Move cursor to the end ONLY on initial click
                    try {
                        const range = document.createRange();
                        const sel = window.getSelection();
                        if (sel) {
                            range.selectNodeContents(contentRef.current);
                            range.collapse(false);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    } catch (err) { }
                }
            }, 0);
        }
    };

    const handleBlur = () => {
        if (!isEditing) return;
        setIsEditing(false);
        if (contentRef.current) {
            let newContent = contentRef.current.innerText || "";
            // Remove trailing extra newlines added by some browsers
            newContent = newContent.replace(/[\r\n]+$/, "");
            if (newContent !== content) {
                updateBlock(blockId, { [propName]: newContent }, true);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsEditing(false);
            if (contentRef.current) {
                contentRef.current.blur();
                contentRef.current.innerText = content;
            }
        } else if (e.key === "Enter" && !multiline) {
            e.preventDefault();
            contentRef.current?.blur();
        } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
            e.stopPropagation();
        }
    };

    const Tag = tagName as any;

    return (
        <Tag
            ref={contentRef}
            className={className}
            style={{
                ...style,
                outline: "none",
                cursor: isPreview ? "inherit" : (isEditing ? "text" : "pointer"),
                minWidth: isEditing ? "20px" : undefined,
                whiteSpace: multiline ? "pre-wrap" : (style?.whiteSpace || "normal"),
                wordBreak: "break-word",
            }}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onClick={handleClick}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        >
            {content || (isEditing ? "" : <span style={{ opacity: 0.5, fontStyle: "italic" }}>{placeholder}</span>)}
        </Tag>
    );
}

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
                    <QuickLayoutChange block={block} />

                    {/* Quick Media Change */}
                    {(() => {
                        const info = getBlockMediaInfo(block.type);
                        if (!info) return null;

                        return (
                            <AppToolTip title={`Change ${info.label}`}>
                                <IconButton
                                    icon={<info.icon />}
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

                    {block.type === "wave" && (
                        <AppToolTip title="Flip Orientation">
                            <IconButton
                                icon={<ArrowsRightLeftIcon style={{ width: 13, height: 13 }} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const p = block.props;
                                    useEditorStore.getState().updateBlock(block.id, {
                                        flipHorizontal: !p.flipHorizontal,
                                        flipVertical: !p.flipVertical
                                    }, true);
                                }}
                            />
                        </AppToolTip>
                    )}

                    <AppToolTip title="Drag to reorder">
                        <IconButton
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing"
                            icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="9" cy="5" r="2" />
                                    <circle cx="9" cy="12" r="2" />
                                    <circle cx="9" cy="19" r="2" />
                                    <circle cx="15" cy="5" r="2" />
                                    <circle cx="15" cy="12" r="2" />
                                    <circle cx="15" cy="19" r="2" />
                                </svg>
                            }
                        />
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
                const childMatch = zoneId.match(/^(?:hero|container|wave|features)-(.+)$/);

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
    blockId?: string; // Add blockId to support inline editing
}

export function CommonButton({ props: p, id, onClick, isLoading, disabled, className, type = "button", prefix = "button", blockId }: CommonButtonProps) {
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
            {blockId && !isPreview ? (
                <InlineTextEditor
                    blockId={blockId}
                    propName={p.buttonText !== undefined ? "buttonText" : (p.submitLabel !== undefined ? "submitLabel" : (p.ctaText !== undefined ? "ctaText" : "label"))}
                    content={label}
                    multiline={false}
                    style={{ display: "inline-block" }}
                />
            ) : (
                <span>{label}</span>
            )}
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

export function getBackgroundStyles(p: Record<string, any>, theme: any): React.CSSProperties {
    const bgColor = (p.bgColor as string) || (p.sectionBg as string) || "transparent";

    return {
        background: bgColor,
        position: "relative",
        overflow: "hidden",
    };
}

const WAVE_PATHS = {
    smooth: [
        "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
        "M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,176C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
        "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
    ],
    sharp: [
        "M0,224L120,192L240,256L360,160L480,192L600,128L720,224L840,192L960,256L1080,160L1200,192L1320,128L1440,224L1440,320L1320,320L1200,320L1080,320L960,320L840,320L720,320L600,320L480,320L360,320L240,320L120,320L0,320Z",
        "M0,160L120,192L240,128L360,224L480,160L600,192L720,128L840,224L960,160L1080,192L1200,128L1320,224L1440,160L1440,320L1320,320L1200,320L1080,320L960,320L840,320L720,320L600,320L480,320L360,320L240,320L120,320L0,320Z",
        "M0,96L120,128L240,64L360,160L480,96L600,128L720,64L840,160L960,96L1080,128L1200,64L1320,160L1440,96L1440,320L1320,320L1200,320L1080,320L960,320L840,320L720,320L600,320L480,320L360,320L240,320L120,320L0,320Z"
    ],
    stepped: [
        "M0,160L0,192L288,192L288,128L576,128L576,224L864,224L864,96L1152,96L1152,256L1440,256L1440,320L1152,320L1152,320L864,320L864,320L576,320L576,320L288,320L288,320L0,320L0,320Z",
        "M0,96L0,128L288,128L288,64L576,64L576,160L864,160L864,32L1152,32L1152,192L1440,192L1440,320L1152,320L1152,320L864,320L864,320L576,320L576,320L288,320L288,320L0,320L0,320Z",
        "M0,224L0,256L288,256L288,192L576,192L576,288L864,288L864,160L1152,160L1152,320L1440,320L1440,320L1152,320L1152,320L864,320L864,320L576,320L576,320L288,320L288,320L0,320L0,320Z"
    ],
    asymmetric: [
        "M0,160L80,176C160,192,320,224,480,213.3C640,203,800,149,960,128C1120,107,1280,117,1360,122.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z",
        "M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,218.7C840,213,960,171,1080,154.7C1200,139,1320,149,1380,154.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z",
        "M0,96L120,117.3C240,139,480,181,720,186.7C960,192,1200,160,1320,144L1440,128L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
    ]
};

function resolveCssColor(value: string): string {
    if (!value || !value.startsWith("var(")) return value;
    if (typeof window === "undefined" || !document?.documentElement) return value;
    try {
        const varName = value.replace(/^var\(/, "").replace(/\)$/, "").trim();
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || value;
    } catch { return value; }
}

function WaveQuickEditor({ p, blockId, onClose }: { p: Record<string, any>, blockId: string, onClose: () => void }) {
    const { updateBlock } = useEditorStore();
    const up = (key: string, val: any) => updateBlock(blockId, { [key]: val }, true);

    return (
        <div style={{
            position: "absolute",
            zIndex: 100000,
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
            width: "280px",
            color: "#fff",
            pointerEvents: "auto",
            marginTop: "10px"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.8 }}>Wave Editor</span>
                <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: 0.5 }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                   <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "10px", opacity: 0.6 }}>Style</span>
                        <select 
                            value={p.wavePattern || "smooth"} 
                            onChange={(e) => up("wavePattern", e.target.value)}
                            style={{ background: "#2a2a2a", border: "1px solid #3a3a3a", color: "#fff", fontSize: "11px", padding: "4px", borderRadius: "4px" }}
                        >
                            <option value="smooth">Smooth</option>
                            <option value="sharp">Sharp</option>
                            <option value="stepped">Steps</option>
                            <option value="asymmetric">Curve</option>
                        </select>
                   </div>
                   <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "10px", opacity: 0.6 }}>Position</span>
                        <select 
                            value={p.wavePosition || "bottom"} 
                            onChange={(e) => up("wavePosition", e.target.value)}
                            style={{ background: "#2a2a2a", border: "1px solid #3a3a3a", color: "#fff", fontSize: "11px", padding: "4px", borderRadius: "4px" }}
                        >
                            <option value="bottom">Bottom</option>
                            <option value="top">Top</option>
                        </select>
                   </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "10px", opacity: 0.6 }}>Color</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <input type="color" value={resolveCssColor(p.waveColor || "#3b82f6")} onChange={(e) => up("waveColor", e.target.value)} style={{ background: "none", border: "none", width: "100%", height: "24px", cursor: "pointer" }} />
                        <input type="color" value={resolveCssColor(p.waveGradientEnd || "#000000")} onChange={(e) => up("waveGradientEnd", e.target.value)} style={{ background: "none", border: "none", width: "100%", height: "24px", cursor: "pointer" }} />
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "10px", opacity: 0.6 }}>Height</span>
                        <span style={{ fontSize: "10px", opacity: 0.6 }}>{p.waveHeight || "120px"}</span>
                    </div>
                    <input 
                        type="range" min="20" max="400" 
                        value={parseInt(p.waveHeight || "120")} 
                        onChange={(e) => up("waveHeight", `${e.target.value}px`)}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>
        </div>
    );
}

function IntegratedWave({ p, blockId }: { p: Record<string, any>, blockId: string }) {
    const componentId = React.useId().replace(/:/g, "");
    const [popoverPos, setPopoverPos] = React.useState<{ x: number, y: number } | null>(null);
    const pattern = (p.wavePattern as keyof typeof WAVE_PATHS) || "smooth";
    const layers = Number(p.waveLayers ?? 3);
    const position = p.wavePosition || "bottom";
    const waveHeight = p.waveHeight || "120px";
    const animated = p.waveAnimated !== false;
    const waveOnTop = p.waveOnTop === true;
    const flipH = !!p.waveFlipH;
    const flipV = position === "top" ? !p.waveFlipV : !!p.waveFlipV;

    const fillColor = resolveCssColor(p.waveColor || "var(--primary)");
    const secondaryColor = resolveCssColor(p.waveSecondaryColor || "");
    const gradientEnd = resolveCssColor(p.waveGradientEnd || "");

    // Stable ID for the gradient def
    const gradId = `wave-grad-${componentId}`;

    const transform = [
        flipH ? "scaleX(-1)" : "",
        flipV ? "scaleY(-1)" : ""
    ].filter(Boolean).join(" ");

    const svgStyle: React.CSSProperties = {
        position: "absolute",
        left: animated ? "-100px" : 0,
        width: animated ? "calc(100% + 200px)" : "100%",
        height: waveHeight,
        bottom: position === "bottom" ? 0 : "auto",
        top: position === "top" ? 0 : "auto",
        transform: transform || "none",
        zIndex: waveOnTop ? 10 : 1,
        pointerEvents: "none",
        transition: "all 0.3s ease"
    };

    let allPaths = WAVE_PATHS[pattern] || WAVE_PATHS["smooth"];
    const paths = allPaths.slice(allPaths.length - Math.min(layers, allPaths.length));

    return (
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={svgStyle} xmlns="http://www.w3.org/2000/svg">
            {gradientEnd && (
                <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={fillColor} />
                        <stop offset="100%" stopColor={gradientEnd} />
                    </linearGradient>
                </defs>
            )}
            {animated && (
                <style>{`
                    @keyframes int-wave-pulse {
                        0% { transform: scaleY(1) ${transform}; }
                        100% { transform: scaleY(1.1) ${transform}; }
                    }
                    @keyframes int-wave-drift {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(80px); }
                    }
                `}</style>
            )}
            {paths.map((d, i) => {
                const isTop = i === paths.length - 1;
                const opacity = isTop ? 1 : 0.4 + (i * 0.15);
                const fill = isTop ? (gradientEnd ? `url(#${gradId})` : fillColor) : (secondaryColor || fillColor);
                return (
                    <path 
                        key={i} 
                        d={d} 
                        fill={fill} 
                        fillOpacity={opacity}
                        onClick={(e) => {
                            e.stopPropagation();
                            useEditorStore.getState().selectBlock(blockId);
                            useEditorStore.getState().focusSubItem(blockId, "Wave Decoration");
                            setPopoverPos({ x: e.clientX, y: e.clientY });
                        }}
                        style={{ 
                            cursor: "pointer",
                            pointerEvents: "auto",
                            animation: animated ? (isTop ? `int-wave-pulse 4s ease-in-out infinite alternate` : `int-wave-drift ${8 + i * 2}s linear infinite alternate`) : "none",
                            transformOrigin: position === "top" ? "top" : "bottom"
                        }} 
                    />
                );
            })}
            {popoverPos && (
                <foreignObject x="0" y="0" width="100%" height="100%" style={{ overflow: "visible" }}>
                    <div style={{ position: "fixed", left: popoverPos.x, top: popoverPos.y, pointerEvents: "auto" }}>
                        <WaveQuickEditor p={p} blockId={blockId} onClose={() => setPopoverPos(null)} />
                    </div>
                </foreignObject>
            )}
        </svg>
    );
}

export function BackgroundOverlay({ p }: { p: Record<string, any> }) {
    const blockId = React.useContext(BlockContext) || "bg";
    const bgImage = p.bgImage as string;
    const bgGradient = p.bgGradient as string;
    const imageOpacity = Number(p.bgImageOpacity ?? 40) / 100;
    const fillOpacity = Number(p.bgFillOpacity ?? 50) / 100;

    if (!bgImage && !bgGradient && !p.showWave) return null;

    const isVideo = bgImage ? (
        /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(bgImage) ||
        bgImage.toLowerCase().includes("video")
    ) : false;
    const bgAutoPlay = p.bgAutoPlay !== false;
    const bgLoop = p.bgLoop !== false;
    const bgMuted = p.bgMuted !== false;
    const bgControls = p.bgControls === true;

    return (
        <>
            {/* Image/Video Layer (Bottom) */}
            {bgImage && (
                isVideo ? (
                    <video
                        src={bgImage}
                        autoPlay={bgAutoPlay}
                        loop={bgLoop}
                        muted={bgMuted}
                        controls={bgControls}
                        playsInline
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: (p.bgImageSize as any) || "cover",
                            objectPosition: (p.bgImagePosition as string) || "center",
                            opacity: imageOpacity,
                            zIndex: 0,
                            pointerEvents: bgControls ? "auto" : "none"
                        }}
                    />
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url("${bgImage}")`,
                            backgroundSize: (p.bgImageSize as any) || "cover",
                            backgroundPosition: (p.bgImagePosition as string) || "center",
                            backgroundRepeat: (p.bgImageRepeat as any) || "no-repeat",
                            opacity: imageOpacity,
                            zIndex: 0,
                            pointerEvents: "none"
                        }}
                    />
                )
            )}

            {/* Fill Layer (Top / Overlay) */}
            {bgGradient && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: bgGradient,
                        opacity: fillOpacity,
                        zIndex: 1,
                        pointerEvents: "none"
                    }}
                />
            )}

            {/* Integrated Wave Decoration */}
            {p.showWave && <IntegratedWave p={p} blockId={blockId} />}
        </>
    );
}

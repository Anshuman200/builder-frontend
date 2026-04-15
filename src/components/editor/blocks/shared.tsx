"use client";

import type { Block } from "@/types";
/**
 * blocks/shared.tsx — Shared types, context, and block wrappers
 */

import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TrashIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

import { useEditorStore } from "@/stores/editorStore";

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
    
    return (url: string, e?: React.MouseEvent) => {
        if (!isPreview) {
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

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: block.id,
        data: { type: "canvas" },
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
            style={{
                position: "relative",
                width: "100%",
                height: needsFullHeight ? "100%" : undefined,
                transform: CSS.Translate.toString(transform),
                opacity: isDragging ? 0.3 : 1,
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
                    {/* <button
                        {...attributes}
                        {...listeners}
                        title="Drag to move"
                        style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "grab", color: "#475569", borderRadius: 6 }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
                    >
                        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" style={{ color: "#64748b" }}>
                            <circle cx="2.5" cy="2.5" r="1.4"/><circle cx="7.5" cy="2.5" r="1.4"/>
                            <circle cx="2.5" cy="7" r="1.4"/><circle cx="7.5" cy="7" r="1.4"/>
                            <circle cx="2.5" cy="11.5" r="1.4"/><circle cx="7.5" cy="11.5" r="1.4"/>
                        </svg>
                    </button> */}
                    <button
                        title="Delete block"
                        onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                        style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#ef4444", borderRadius: 6 }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
                    >
                        <TrashIcon style={{ width: 13, height: 13 }} />
                    </button>
                </div>
            )}
            {children || <BlockRendererRef block={block} />}
        </div>
    );
}

// ─── DropZoneStrip ────────────────────────────────────────────────────────────

export function DropZoneStrip({
    zoneId,
    hasChildren,
    stripColor = "#6366f1",
    emptyLabel = "Drag blocks here",
}: {
    zoneId: string;
    hasChildren: boolean;
    stripColor?: string;
    emptyLabel?: string;
}) {
    const isPreview = React.useContext(PreviewContext);
    const { setNodeRef, isOver } = useDroppable({ id: zoneId });

    if (isPreview) return null;

    return (
        <div
            ref={setNodeRef}
            style={{
                width: "100%",
                minHeight: hasChildren ? 44 : 120,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px dashed ${isOver ? stripColor : "rgba(150,150,150,0.35)"}`,
                borderRadius: 8,
                background: isOver ? `${stripColor}15` : "transparent",
                transition: "all 0.15s",
                marginTop: hasChildren ? 8 : 0,
                cursor: "default",
                boxSizing: "border-box",
            }}
        >
            <span style={{ fontSize: 12, color: isOver ? stripColor : "rgba(150,150,150,0.6)", fontWeight: 500, userSelect: "none" }}>
                {isOver ? "Drop here" : hasChildren ? "+ drop more blocks here" : emptyLabel}
            </span>
        </div>
    );
}

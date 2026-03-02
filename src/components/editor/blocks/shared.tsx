"use client";

import type { Block } from "@/@Types";
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
    outlineColor = "#6366f1",
    outlineColorHover = "#a5b4fc",
}: {
    block: Block;
    outlineColor?: string;
    outlineColorHover?: string;
}) {
    const isPreview = React.useContext(PreviewContext);
    const { selectedBlockId, hoveredBlockId, selectBlock, hoverBlock, deleteBlock } =
        useEditorStore();
    const isSelected = !isPreview && selectedBlockId === block.id;
    const isHovered = !isPreview && hoveredBlockId === block.id;
    const showControls = isSelected || isHovered;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: block.id,
        data: { type: "canvas" },
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

    if (isPreview) {
        if (animType !== "none" && variants) {
            return (
                <motion.div
                    style={{ position: "relative", width: "100%" }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewport}
                    variants={variants}
                    transition={transition}
                >
                    <BlockRendererRef block={block} />
                </motion.div>
            );
        }

        return (
            <div style={{ position: "relative", width: "100%" }}>
                <BlockRendererRef block={block} />
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={{
                position: "relative",
                width: "100%",
                transform: CSS.Translate.toString(transform),
                opacity: isDragging ? 0.3 : 1,
                outline: isSelected
                    ? `2px solid ${outlineColor}`
                    : isHovered
                        ? `1px solid ${outlineColorHover}`
                        : "1px solid transparent",
                outlineOffset: -1,
            }}
            onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
            onMouseEnter={() => hoverBlock(block.id)}
            onMouseLeave={() => hoverBlock(null)}
        >
            {showControls && (
                <div style={{
                    position: "absolute", top: 4, right: 4,
                    display: "flex", gap: 2, padding: 3,
                    background: "#ffffff", borderRadius: 8, zIndex: 90,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                }}>
                    <button
                        {...attributes}
                        {...listeners}
                        title="Drag to move"
                        style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "grab", color: "#475569", borderRadius: 6 }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
                    >
                        <EllipsisHorizontalIcon style={{ width: 13, height: 13 }} />
                    </button>
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
            <BlockRendererRef block={block} />
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

"use client";
import type { Block } from "@/types";
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { recursiveClone, useEditorStore } from "@/stores/editorStore";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PreviewContext, BlockProps, ChildBlockWrapper, DropZoneStrip, SortableBlockGroup, getBackgroundStyles, BackgroundOverlay, SectionChildBlocks } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";
import { cn } from "@/lib/utils";

function GridSlot({ zoneId, slotId, blockId, blocks, onDelete, itemsCount, style }: { zoneId: string; slotId: string; blockId: string; blocks: Block[]; onDelete: () => void; itemsCount: number; style?: React.CSSProperties }) {
    const isPreview = React.useContext(PreviewContext);
    const { setNodeRef, isOver } = useDroppable({ id: zoneId });
    const [isHovered, setIsHovered] = React.useState(false);
    const selectedBlockId = useEditorStore((s) => s.selectedBlockId);

    // Synthetic block representing this grid slot for the drop zone system
    const slotVirtualId = `col-${slotId}-${blockId}`;
    const slotBlock = React.useMemo(() => ({
        id: slotVirtualId,
        type: "grid-slot",
        props: { childBlocks: blocks }
    } as Block), [slotVirtualId, blocks]);

    const slotIsSelected = selectedBlockId === slotVirtualId
        || (!!selectedBlockId && blocks.some(b => b.id === selectedBlockId));

    return (
        <div
            ref={setNodeRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                minHeight: blocks.length === 0 ? 120 : undefined,
                border: isPreview ? "none" : `2px dashed ${isOver ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 12,
                background: !isPreview && isOver ? "var(--primary-light)" : "transparent",
                transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                padding: blocks.length > 0 ? 0 : 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                position: "relative",
                minWidth: 0,
                ...style
            }}
        >
            {!isPreview && isHovered && itemsCount > 2 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    title="Delete Cell"
                    className="absolute top-2 left-2 bg-red-600 p-2 rounded-full text-white z-[10000] cursor-pointer"
                >
                    <TrashIcon style={{ width: 14, height: 14 }} />
                </button>
            )}


            {blocks.length > 0 && (
                <SectionChildBlocks block={slotBlock} isSelected={slotIsSelected} childBlocks={blocks} bottom emptyLabel="Add Content" showChildAddBlock={false} childrenLabel="Add Content" stripColor="var(--primary)" />
            )}
            {!isPreview && (
                <div
                    className={cn("flex-1 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:bg-indigo-50/50 transition-all rounded-lg", blocks.length === 0 ? "p-8" : "p-2")}
                    onClick={() => {
                        useEditorStore.getState().openBlockPicker({ id: blockId, position: "inside", childProp: slotId }, "elements");
                    }}
                >
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform shadow-sm border border-indigo-100">
                        <PlusIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-500 transition-colors">Add Content</span>
                </div>
            )}
        </div>
    );
}

export function GridBlock({ block }: BlockProps) {
    const p = block.props;
    const columns = Number(p.columns ?? 0);
    const gap = (p.gap as string) || "1.5rem";
    const align = (p.align as string) || "center";
    const verticalAlign = (p.verticalAlign as string) || "center";
    const gridAlign = (p.gridAlign as string) || "stretch";

    // Card Style props
    const cardBg = (p.cardBg as string) || "";
    const cardPadding = (p.cardPadding as string) || "";
    const cardBorderRadius = (p.cardBorderRadius as string) || "12px";
    const cardBorderWidth = (p.cardBorderWidth as string) || "";
    const cardBorderColor = (p.cardBorderColor as string) || "";
    const cardShadowKey = (p.cardShadow as string) || "none";
    const shadowMap: Record<string, string> = {
        none: "none",
        sm: "0 1px 3px rgba(0,0,0,0.08)",
        md: "0 4px 12px rgba(0,0,0,0.12)",
        lg: "0 8px 30px rgba(0,0,0,0.18)",
    };
    const cardBoxShadow = shadowMap[cardShadowKey] || "none";
    const cardBorderStyle: React.CSSProperties = cardBorderWidth && cardBorderWidth !== "0px"
        ? { border: `${cardBorderWidth} solid ${cardBorderColor || "var(--border)"}` }
        : {};

    const { updateBlock, viewMode, openBlockPicker } = useEditorStore();
    const isPreview = React.useContext(PreviewContext);
    const isMobile = viewMode === "mobile";
    const isTablet = viewMode === "tablet";
    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const bgStyles = getBackgroundStyles(p, theme);
    const topBlocks = (p.topBlocks as Block[]) ?? [];

    // Alignment Mapping
    const justifyMap: Record<string, string> = {
        left: "start",
        center: "center",
        right: "end",
        stretch: "stretch"
    };

    const alignMap: Record<string, string> = {
        top: "start",
        center: "center",
        bottom: "end",
        stretch: "stretch"
    };

    const gridJustifyMap: Record<string, string> = {
        left: "start",
        center: "center",
        right: "end",
        stretch: "stretch"
    };

    const items = (p.items as { id: string, blocks: Block[] }[]) ?? [];

    const handleAddCell = () => {
        const templateBlocks = items.length > 0 && items[0].blocks && items[0].blocks.length > 0
            ? items[0].blocks.map(b => recursiveClone(b))
            : [];

        const next = [...items, { id: `slot-${crypto.randomUUID()}`, blocks: templateBlocks }];
        updateBlock(block.id, { items: next }, true);
    };

    const handleDeleteCell = (idx: number) => {
        if (items.length <= 2) return;
        const next = [...items];
        next.splice(idx, 1);
        updateBlock(block.id, { items: next }, true);
    };

    const desktopPadding = (p.padding as string) || "24px";
    const tabletPadding = (p.tabletPadding as string) || desktopPadding;
    const mobilePadding = (p.mobilePadding as string) || tabletPadding;
    const padding = isMobile ? mobilePadding : isTablet ? tabletPadding : desktopPadding;

    const isGroupAligned = gridAlign !== "stretch" && !isMobile;

    const getGridTemplate = () => {
        if (isMobile) return "1fr";

        if (columns === 0) {
            const minWidth = isTablet ? "240px" : "280px";
            return `repeat(auto-fit, minmax(${minWidth}, 1fr))`;
        }

        const trackSize = "1fr";

        if (isTablet) {
            if (columns === 1) return "1fr";
            return `repeat(2, ${trackSize})`;
        }

        return `repeat(${columns}, ${trackSize})`;
    };

    const gridTemplateColumns = getGridTemplate();

    // Smart width for group alignment (e.g. centering 2 items in 4 columns)
    const gridWidth = (isGroupAligned && items.length > 0 && items.length < columns)
        ? `${(items.length / columns) * 100}%`
        : "100%";

    return (
        <div
            id={(p.sectionId as string) || `block-${block.id}`}
            style={{
                ...bgStyles,
                width: "100%",
                padding,
                borderRadius: p.borderRadius as string,
                display: "flex",
                flexDirection: "column",
                gap: 24,
                position: "relative"
            }}
        >
            <BackgroundOverlay p={p} />
            <SectionChildBlocks block={block} isSelected={useEditorStore.getState().selectedBlockId === block.id} topBlocks={topBlocks} top prefix="gblock" />
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns,
                    gap,
                    width: gridAlign === "stretch" ? "100%" : gridWidth,
                    maxWidth: "100%",
                    margin: gridAlign === "center" ? "0 auto" : gridAlign === "right" ? "0 0 0 auto" : "0 auto 0 0",
                    overflow: "hidden",
                    // Cell internal alignment
                    justifyItems: "stretch",
                    alignItems: "stretch",
                    position: "relative",
                    zIndex: 2
                }}
            >
                {items.map((item, idx) => (
                    <GridSlot
                        key={item.id}
                        zoneId={`grid-${item.id}-${block.id}`}
                        slotId={item.id}
                        blockId={block.id}
                        blocks={item.blocks || []}
                        onDelete={() => handleDeleteCell(idx)}
                        itemsCount={items.length}
                        style={{
                            alignItems: justifyMap[align] || "center",
                            justifyContent: alignMap[verticalAlign] || "center",
                            width: "100%",
                            height: "100%",
                            textAlign: align === "stretch" ? "left" : (align as any),
                            // Card appearance
                            ...(cardBg ? { background: cardBg } : {}),
                            ...(cardPadding ? { padding: cardPadding } : {}),
                            borderRadius: cardBorderRadius,
                            boxShadow: cardBoxShadow,
                            ...cardBorderStyle,
                        }}
                    />
                ))}
            </div>
            <SectionChildBlocks block={block} isSelected={useEditorStore.getState().selectedBlockId === block.id} childBlocks={p.childBlocks as Block[]} bottom prefix="gblock" emptyLabel="Drop more blocks here" />

            {!isPreview && (
                <div className="flex items-center justify-center" style={{ position: "relative", zIndex: 2 }}>
                    <button
                        onClick={handleAddCell}
                        className="add-item-button w-96 border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center gap-2 text-gray-500 cursor-pointer hover:bg-blue-900 hover:text-white transition-all text-sm font-bold uppercase tracking-wide"
                    >
                        <PlusIcon style={{ width: 16, height: 16 }} />
                        <span>Add New Item</span>
                    </button>
                </div>
            )}
        </div>
    );
}


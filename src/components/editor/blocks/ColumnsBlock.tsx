"use client";
import type { Block } from "@/types";
import React from "react";
import { useDroppable } from "@dnd-kit/core";

import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, ChildBlockWrapper, SortableBlockGroup, DropZoneStrip, getBackgroundStyles, BackgroundOverlay } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";

function ColumnDropZone({ zoneId, blocks, label, flexBasis, alignItems }: { zoneId: string; blocks: Block[]; label: string; flexBasis: string; alignItems?: string }) {
    const isPreview = React.useContext(PreviewContext);
    const { setNodeRef, isOver } = useDroppable({ id: zoneId });
    const { viewMode } = useEditorStore();
    const isStacked = viewMode === "mobile" || viewMode === "tablet";

    return (
        <div
            ref={setNodeRef}
            style={{
                flex: isStacked ? "none" : `${flexBasis.replace("%", "")} ${flexBasis.replace("%", "")} 0%`,
                width: isStacked ? "100%" : undefined,
                minHeight: blocks.length === 0 ? 80 : undefined,
                display: "flex",
                flexDirection: "column",
                justifyContent: alignItems === "center" ? "center" : alignItems === "flex-end" ? "flex-end" : "flex-start",
                alignItems: "stretch",
                alignSelf: "stretch",
                border: isPreview ? "none" : `2px dashed ${isOver ? "#6366f1" : "#e2e8f0"}`,
                borderRadius: 6,
                background: !isPreview && isOver ? "rgba(99,102,241, 0.04)" : "transparent",
                transition: "all 0.15s",
                overflow: "hidden",
                position: "relative",
            }}
        >
            {blocks.length > 0 ? (
                <SortableBlockGroup blocks={blocks}>
                    {blocks.map((child) => <ChildBlockWrapper key={child.id} block={child} />)}
                </SortableBlockGroup>
            ) : !isPreview ? (
                <div style={{ padding: 12 }}>
                    <DropZoneStrip
                        zoneId={zoneId}
                        childProp={zoneId.startsWith("col-0") ? "col0" : "col1"}
                        hasChildren={false}
                        emptyLabel={label}
                    />
                </div>
            ) : null}
        </div>
    );
}

export function ColumnsBlock({ block }: BlockProps) {
    const p = block.props;
    const leftWidth = Number(p.leftWidth || 50);
    const rightWidth = 100 - leftWidth;
    const gap = (p.gap as string) || "1.5rem";
    const { viewMode } = useEditorStore();
    const isPreview = React.useContext(PreviewContext);
    const isStackedEditor = viewMode === "mobile" || viewMode === "tablet";

    const desktopPadding = (p.padding as string) || "16px 24px";
    const tabletPadding = (p.tabletPadding as string) || desktopPadding;
    const mobilePadding = (p.mobilePadding as string) || tabletPadding;
    const editorPadding = viewMode === "mobile" ? mobilePadding : viewMode === "tablet" ? tabletPadding : desktopPadding;
    const col0 = (p.col0 as Block[]) ?? [];
    const col1 = (p.col1 as Block[]) ?? [];

    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const bgStyles = getBackgroundStyles(p, theme);

    return (
        <div
            id={(p.sectionId as string) || `block-${block.id}`}
            className={isPreview ? `builder-columns-${block.id}` : undefined}
            style={{
                ...(isPreview ? {} : { display: "flex", flexDirection: isStackedEditor ? "column" : "row", alignItems: (p.alignItems as string) || "stretch", gap, width: "100%" }),
                ...bgStyles,
                padding: editorPadding,
                position: "relative"
            }}
        >
            <BackgroundOverlay p={p} />
            {isPreview && (
                <style>{`
          .builder-columns-${block.id} { display: flex; flex-direction: row; align-items: ${p.alignItems || "stretch"}; gap: ${gap}; width: 100%; }
          @media (max-width: 1024px) { .builder-columns-${block.id} { } }
          @media (max-width: 768px) { .builder-columns-${block.id} { flex-direction: column !important; } }
        `}</style>
            )}
            <ColumnDropZone zoneId={`col-0-${block.id}`} blocks={col0} label="Drag blocks here (Column 1)" flexBasis={`${leftWidth}%`} alignItems={p.alignItems as string} />
            <ColumnDropZone zoneId={`col-1-${block.id}`} blocks={col1} label="Drag blocks here (Column 2)" flexBasis={`${rightWidth}%`} alignItems={p.alignItems as string} />
        </div>
    );
}

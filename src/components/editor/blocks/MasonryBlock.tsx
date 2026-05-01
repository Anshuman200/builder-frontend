"use client";

import React from "react";
import type { Block } from "@/types";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { ChildBlockWrapper, PreviewContext, DropZoneStrip, SortableBlockGroup, getBackgroundStyles, BackgroundOverlay } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { DEFAULT_THEME } from "@/lib/utils/theme";

interface MasonryBlockProps {
    block: Block;
}

export const MasonryContext = React.createContext<string | null>(null);

export const MasonryBlock: React.FC<MasonryBlockProps> = ({ block }) => {
    const isPreview = React.useContext(PreviewContext);
    const viewMode = useEditorStore(s => s.viewMode);
    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;

    const {
        gap: rawGap = 8,
        padding = "24px",
        childBlocks = [],
        columns,
        columnsTablet,
        columnsMobile,
    } = block.props as any;

    const bgStyles = getBackgroundStyles(block.props, theme);
    const gap = typeof rawGap === "number" ? `${rawGap}px` : rawGap;

    const items = (childBlocks as Block[]);

    // Exclude media-picker from the main masonry in ALL modes
    const mediaItems = items.filter((item: Block) => item.type !== "media-picker");
    const pickerItems = items.filter((item: Block) => item.type === "media-picker");

    // Responsive column counts (handle legacy object format or missing values)
    const getCol = (val: any, def: number) => {
        if (typeof val === "object" && val !== null) {
            return Number(val.lg || val.desktop || val.md || def);
        }
        return Number(val) || def;
    };

    const cols = getCol(columns, 4);
    const colsTablet = getCol(columnsTablet, 2);
    const colsMobile = getCol(columnsMobile, 1);

    // Active column count for live view based on viewMode
    const colCount = viewMode === "mobile" ? colsMobile : viewMode === "tablet" ? colsTablet : cols;
    const getEditorColumns = () => {
        const count = Math.max(1, colCount);
        const distributedColumns: Block[][] = Array.from({ length: count }, () => []);

        mediaItems.forEach((item: Block, index: number) => {
            distributedColumns[index % count].push(item);
        });

        return distributedColumns;
    };
    const editorColumns = getEditorColumns();

    return (
        <div
            className="w-full"
            style={{
                ...bgStyles,
                padding,
                minHeight: isPreview ? "auto" : "200px",
                position: "relative"
            }}
        >
            <BackgroundOverlay p={block.props} />
            <MasonryContext.Provider value={block.id}>
                <div style={{ position: "relative", zIndex: 2 }}>
                    {/* ── Masonry media grid ───────────────────────────────── */}
                    {mediaItems.length > 0 && (
                        isPreview ? (
                            <div className="masonry-preview-grid">
                                <style>{`
                                    .masonry-preview-grid {
                                        column-count: ${cols};
                                        column-gap: ${gap};
                                    }
                                    @media (max-width: 1280px) {
                                        .masonry-preview-grid { column-count: ${cols}; }
                                    }
                                    @media (max-width: 1024px) {
                                        .masonry-preview-grid { column-count: ${colsTablet}; }
                                    }
                                    @media (max-width: 768px) {
                                        .masonry-preview-grid { column-count: ${colsTablet}; }
                                    }
                                    @media (max-width: 480px) {
                                        .masonry-preview-grid { column-count: ${colsMobile}; }
                                    }
                                `}</style>
                                {mediaItems.map((child: Block) => (
                                    <div
                                        key={child.id}
                                        style={{
                                            breakInside: "avoid",
                                            display: "inline-block",
                                            width: "100%",
                                            marginBottom: gap,
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <ChildBlockWrapper block={child} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <SortableBlockGroup blocks={mediaItems} strategy={rectSortingStrategy}>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: `repeat(${Math.max(1, colCount)}, minmax(0, 1fr))`,
                                        gap,
                                        alignItems: "start",
                                    }}
                                >
                                    {editorColumns.map((column, columnIndex) => (
                                        <div
                                            key={columnIndex}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap,
                                                minWidth: 0,
                                            }}
                                        >
                                            {column.map((child: Block) => (
                                                <div
                                                    key={child.id}
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: "12px",
                                                        overflow: "visible",
                                                    }}
                                                >
                                                    <ChildBlockWrapper block={child} />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </SortableBlockGroup>
                        )
                    )
                    }

                    {/* ── "Add Media" always pinned at bottom-left ─────────── */}
                    {
                        !isPreview && pickerItems.length > 0 && (
                            <div
                                style={{
                                    marginTop: mediaItems.length > 0 ? gap : 0,
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <div style={{ width: "min(100%, 280px)" }}>
                                    {pickerItems.map((picker: Block) => (
                                        <ChildBlockWrapper key={picker.id} block={picker} />
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    {/* ── Empty state ──────────────────────────────────────── */}
                    {
                        !isPreview && mediaItems.length === 0 && pickerItems.length === 0 && (
                            <div style={{ marginTop: 16 }}>
                                <DropZoneStrip zoneId={block.id} hasChildren={false} />
                            </div>
                        )
                    }
                </div>
            </MasonryContext.Provider >
        </div >
    );
};

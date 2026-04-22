"use client";

import React from "react";
import type { Block } from "@/types";
import { ChildBlockWrapper, PreviewContext, DropZoneStrip, SortableBlockGroup } from "./shared";
import { useEditorStore } from "@/stores/editorStore";

interface MasonryBlockProps {
    block: Block;
}

export const MasonryContext = React.createContext<string | null>(null);

export const MasonryBlock: React.FC<MasonryBlockProps> = ({ block }) => {
    const isPreview = React.useContext(PreviewContext);
    const viewMode = useEditorStore(s => s.viewMode);

    const {
        gap: rawGap = 8,
        padding = "24px",
        bgColor = "transparent",
        childBlocks = [],
        columns,
        columnsTablet,
        columnsMobile,
    } = block.props as any;

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

    return (
        <div
            className="w-full"
            style={{
                padding,
                backgroundColor: bgColor as string,
                minHeight: isPreview ? "auto" : "200px",
            }}
        >
            <MasonryContext.Provider value={block.id}>
                {/* ── CSS Columns masonry ──────────────────────────────── */}
                {mediaItems.length > 0 && (
                    <div
                        style={{
                            columns: isPreview ? undefined : colCount,
                            columnCount: isPreview ? undefined : colCount,
                            columnGap: gap,
                            // In preview, use CSS responsive columns via classname (below)
                        }}
                        className={isPreview ? "masonry-preview-grid" : undefined}
                    >
                        {isPreview && (
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
                        )}
                        <SortableBlockGroup blocks={mediaItems}>
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
                        </SortableBlockGroup>
                    </div>
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
            </MasonryContext.Provider >
        </div >
    );
};

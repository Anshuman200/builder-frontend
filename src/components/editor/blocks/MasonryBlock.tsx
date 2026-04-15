"use client";

import React from "react";
import type { Block } from "@/types";
import { ChildBlockWrapper, PreviewContext, DropZoneStrip } from "./shared";
import { useEditorStore } from "@/stores/editorStore";

interface MasonryBlockProps {
    block: Block;
}

export const MasonryContext = React.createContext<string | null>(null);

export const MasonryBlock: React.FC<MasonryBlockProps> = ({ block }) => {
    const isPreview = React.useContext(PreviewContext);
    const viewMode = useEditorStore(s => s.viewMode);

    const {
        gap = 8,
        padding = "24px",
        bgColor = "transparent",
        childBlocks = [],
    } = block.props as any;

    const items = (childBlocks as Block[]);

    // Exclude media-picker from the main masonry in ALL modes
    const mediaItems = items.filter((item: Block) => item.type !== "media-picker");
    const pickerItems = items.filter((item: Block) => item.type === "media-picker");

    // Responsive column count — more columns = smaller images
    const colCount = viewMode === "mobile" ? 3 : viewMode === "tablet" ? 4 : 5;

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
                            columnGap: `${gap}px`,
                            // In preview, use CSS responsive columns via classname (below)
                        }}
                        className={isPreview ? "masonry-preview-grid" : undefined}
                    >
                        {isPreview && (
                            <style>{`
                                .masonry-preview-grid {
                                    column-count: 5;
                                    column-gap: ${gap}px;
                                }
                                @media (max-width: 1280px) {
                                    .masonry-preview-grid { column-count: 4; }
                                }
                                @media (max-width: 1024px) {
                                    .masonry-preview-grid { column-count: 3; }
                                }
                                @media (max-width: 768px) {
                                    .masonry-preview-grid { column-count: 2; }
                                }
                                @media (max-width: 480px) {
                                    .masonry-preview-grid { column-count: 1; }
                                }
                            `}</style>
                        )}
                        {mediaItems.map((child: Block) => (
                            <div
                                key={child.id}
                                style={{
                                    breakInside: "avoid",
                                    marginBottom: `${gap}px`,
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                }}
                            >
                                <ChildBlockWrapper block={child} />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── "Add Media" always pinned at bottom-left ─────────── */}
                {!isPreview && pickerItems.length > 0 && (
                    <div
                        style={{
                            marginTop: mediaItems.length > 0 ? `${gap}px` : 0,
                            width: `calc(${100 / colCount}% - ${(gap * (colCount - 1)) / colCount}px)`,
                        }}
                    >
                        {pickerItems.map((picker: Block) => (
                            <ChildBlockWrapper key={picker.id} block={picker} />
                        ))}
                    </div>
                )}

                {/* ── Empty state ──────────────────────────────────────── */}
                {!isPreview && mediaItems.length === 0 && pickerItems.length === 0 && (
                    <div style={{ marginTop: 16 }}>
                        <DropZoneStrip zoneId={block.id} hasChildren={false} />
                    </div>
                )}
            </MasonryContext.Provider>
        </div>
    );
};

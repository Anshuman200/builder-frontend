"use client";

import React from "react";
import type { Block } from "@/@Types";
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
        gap = 16,
        padding = "24px",
        bgColor = "transparent",
        childBlocks = [],
    } = block.props as any;

    const items = (childBlocks as Block[]);
    
    // Separate media items from picker items to keep picker at the bottom
    const mediaItems = items.filter(item => item.type !== "media-picker");
    const pickerItems = items.filter(item => item.type === "media-picker");
    const sortedItems = [...mediaItems, ...pickerItems];

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
                <div
                    className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 w-full"
                    style={{
                        columnGap: `${gap}px`,
                        columnCount: !isPreview ? (viewMode === "mobile" ? 2 : viewMode === "tablet" ? 3 : 5) : undefined,
                    }}
                >
                    {sortedItems.map((child: Block) => (
                        <div 
                            key={child.id} 
                            className="relative break-inside-avoid-column w-full inline-block"
                            style={{ 
                                marginBottom: `${gap}px`,
                            }}
                        >
                            <ChildBlockWrapper block={child} />
                        </div>
                    ))}
                </div>
            </MasonryContext.Provider>
            {!isPreview && sortedItems.length === 0 && (
                <div style={{ marginTop: 16 }}>
                    <DropZoneStrip zoneId={block.id} hasChildren={false} />
                </div>
            )}
        </div>
    );
};

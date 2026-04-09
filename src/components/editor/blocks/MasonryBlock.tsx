"use client";

import React from "react";
import type { Block } from "@/types";
import { ChildBlockWrapper, PreviewContext, DropZoneStrip } from "./shared";
import { useEditorStore } from "@/stores/editorStore";

interface MasonryBlockProps {
    block: Block;
}
 
export const MasonryContext = React.createContext<string | null>(null);

function useColumnCount(viewMode: string, isPreview: boolean) {
  const [width, setWidth] = React.useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  React.useEffect(() => {
    if (!isPreview) return; // In editor, we rely on viewMode
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isPreview]);

  if (!isPreview) {
    if (viewMode === "mobile") return 2;
    if (viewMode === "tablet") return 3;
    return 5;
  }

  if (width < 640) return 2;
  if (width < 768) return 2;
  if (width < 1024) return 3;
  if (width < 1280) return 4;
  return 5;
}

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

    const columnCount = useColumnCount(viewMode, isPreview);
    
    // Distribute items into columns
    const columns: Block[][] = Array.from({ length: columnCount }, () => []);
    sortedItems.forEach((item, index) => {
        columns[index % columnCount].push(item);
    });

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
                <div className="flex w-full" style={{ gap: `${gap}px` }}>
                    {columns.map((colItems, colIndex) => (
                        <div key={colIndex} className="flex-1 flex flex-col" style={{ gap: `${gap}px` }}>
                            {colItems.map((child: Block) => (
                                <div key={child.id} className="w-full">
                                    <ChildBlockWrapper block={child} />
                                </div>
                            ))}
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

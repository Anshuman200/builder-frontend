"use client";
import type { Block } from "@/types";

import React from "react";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, ChildBlockWrapper, DropZoneStrip, SortableBlockGroup, getBackgroundStyles, BackgroundOverlay, SectionChildBlocks } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";

export function ContainerBlock({ block }: BlockProps) {
    const p = block.props;
    const childBlocks = (p.childBlocks as any[]) ?? [];
    const topBlocks = (p.topBlocks as any[]) ?? [];

    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const bgStyles = getBackgroundStyles(p, theme);

    const viewMode = useEditorStore((s) => s.viewMode);
    const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
    const isSelected = selectedBlockId === block.id;
    const isPreview = React.useContext(PreviewContext);

    const desktopPadding = (p.padding as string) || "24px";
    const tabletPadding = (p.tabletPadding as string) || desktopPadding;
    const mobilePadding = (p.mobilePadding as string) || tabletPadding;
    const editorPadding = viewMode === "mobile" ? mobilePadding : viewMode === "tablet" ? tabletPadding : desktopPadding;

    return (
        <>
            {isPreview && (
                <style>{`
          .container-${block.id} { padding: ${desktopPadding}; }
          @media (max-width: 1024px) { .container-${block.id} { padding: ${tabletPadding}; } }
          @media (max-width: 768px) { .container-${block.id} { padding: ${mobilePadding}; } }
        `}</style>
            )}
            <div
                id={(p.sectionId as string) || `block-${block.id}`}
                className={isPreview ? `container-${block.id}` : undefined}
                style={{
                    ...bgStyles,
                    padding: isPreview ? undefined : editorPadding,
                    maxWidth: (p.maxWidth as string) || "100%",
                    width: "100%",
                    margin: "0 auto",
                    marginTop: (p.marginTop as string) || "0",
                    marginLeft: (p.marginLeft as string) || "0",
                    marginRight: (p.marginRight as string) || "0",
                    marginBottom: (p.marginBottom as string) || "0",
                    position: (p.position as any) || "relative",
                    top: (p.top as string) || "auto",
                    left: (p.left as string) || "auto",
                    right: (p.right as string) || "auto",
                    bottom: (p.bottom as string) || "auto",
                    zIndex: (p.zIndex as number) || "auto",
                    borderRadius: (p.borderRadius as string) || "0px",
                    boxSizing: "border-box",
                    border: childBlocks.length === 0 ? "1px dashed #cbd5e1" : "none",
                    // Content alignment
                    display: "flex",
                    flexDirection: "column",
                    alignItems: (p.contentAlign as string) || "center",
                    justifyContent: (p.contentJustify as string) || "center",
                    minHeight: (p.minHeight as string) || undefined,
                }}
            >
                <BackgroundOverlay p={p} />
                <SectionChildBlocks block={block} isSelected={isSelected} topBlocks={topBlocks} top prefix="container" />
                <SectionChildBlocks block={block} isSelected={isSelected} childBlocks={childBlocks} bottom prefix="container" emptyLabel="Drag blocks into this container" />
            </div>
        </>
    );
}

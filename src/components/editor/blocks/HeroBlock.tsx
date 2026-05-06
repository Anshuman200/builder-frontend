"use client";
import React from "react";

import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, ChildBlockWrapper, DropZoneStrip, SortableBlockGroup, getBackgroundStyles, BackgroundOverlay, getTextStyles } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";
import NextImage from "next/image";

export function HeroBlock({ block }: BlockProps) {
    const p = block.props;
    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const defaultPrimary = theme.colors?.primary || "#d97706";
    const bgStyles = getBackgroundStyles(p, theme);
    const childBlocks = (p.childBlocks as any[]) ?? [];
    const align = (p.align as string) || "center";

    const viewMode = useEditorStore((s) => s.viewMode);
    const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
    const isSelected = selectedBlockId === block.id;
    const layoutObj = useEditorStore((s) => s.page?.theme?.layout) || { maxWidth: "100dvw", paddingX: "32px", tabletPaddingX: "24px", mobilePaddingX: "16px" };
    const isPreview = React.useContext(PreviewContext);

    const desktopPadding = (p.padding as string) || "4rem 0px";
    const tabletPadding = (p.tabletPadding as string) || desktopPadding;
    const mobilePadding = (p.mobilePadding as string) || tabletPadding;
    const editorPadding = viewMode === "mobile" ? mobilePadding : viewMode === "tablet" ? tabletPadding : desktopPadding;

    const layout = (p.layout as string) || "fluid";
    const innerMaxWidth = layout === "fluid" ? "100%" : (layout === "narrow" ? "800px" : layoutObj.maxWidth);
    const sectionMinHeight = layout === "fullscreen" ? "100dvh" : (p.minHeight as string) || "80dvh";

    // Recursive helper to check if a block ID is a descendant of the given blocks
    const isDescendantOf = (id: string, blocks: any[]): boolean => {
        for (const b of blocks) {
            if (b.id === id) return true;
            // Check props for nested blocks (grid slots, childBlocks, etc.)
            if (b.props) {
                if (Array.isArray(b.props.childBlocks) && isDescendantOf(id, b.props.childBlocks)) return true;
                if (Array.isArray(b.props.col0) && isDescendantOf(id, b.props.col0)) return true;
                if (Array.isArray(b.props.col1) && isDescendantOf(id, b.props.col1)) return true;
                if (Array.isArray(b.props.items)) {
                    for (const item of b.props.items) {
                        if (item.blocks && isDescendantOf(id, item.blocks)) return true;
                    }
                }
            }
        }
        return false;
    };

    // Show drop zones if the section is selected OR if any descendant block is selected
    const isDescendantSelected = React.useMemo(() => {
        if (!selectedBlockId) return false;
        return isDescendantOf(selectedBlockId, childBlocks);
    }, [selectedBlockId, childBlocks]);

    // const showDropZones = !isPreview && (isSelected || isDescendantSelected);
    const showDropZones = !isPreview

    return (
        <>
            {isPreview && (
                <style>{`
          .hero-${block.id} { padding: ${desktopPadding}; padding-left: 0; padding-right: 0; }
          .hero-inner-${block.id} { max-width: ${innerMaxWidth}; padding-left: ${layoutObj.paddingX}; padding-right: ${layoutObj.paddingX}; margin: 0 auto; width: 100%; box-sizing: border-box; }
          @media (max-width: 1024px) { .hero-${block.id} { padding: ${tabletPadding}; padding-left: 0; padding-right: 0; } .hero-inner-${block.id} { padding-left: ${layoutObj.tabletPaddingX}; padding-right: ${layoutObj.tabletPaddingX}; } }
          @media (max-width: 768px) { .hero-${block.id} { padding: ${mobilePadding}; padding-left: 0; padding-right: 0; } .hero-inner-${block.id} { padding-left: ${layoutObj.mobilePaddingX}; padding-right: ${layoutObj.mobilePaddingX}; } }
        `}</style>
            )}
            <section
                id={(p.sectionId as string) || `block-${block.id}`}
                className={isPreview ? `hero-${block.id}` : undefined}
                style={{
                    ...bgStyles,
                    minHeight: sectionMinHeight,
                    borderRadius: (p.borderRadius as string) || "0px",
                    color: (getTextStyles(p).color as string) || "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "center",
                    padding: isPreview ? undefined : editorPadding,
                    paddingLeft: isPreview ? undefined : 0,
                    paddingRight: isPreview ? undefined : 0,
                    textAlign: align as React.CSSProperties["textAlign"],
                    position: "relative"
                }}
            >
                <BackgroundOverlay p={p} />
                <div
                    className={isPreview ? `hero-inner-${block.id}` : undefined}
                    style={{
                        position: "relative",
                        zIndex: 2,
                        maxWidth: innerMaxWidth,
                        margin: "0 auto",
                        width: "100%",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        gap: 4,
                        paddingLeft: isPreview ? undefined : (viewMode === "mobile" ? layoutObj.mobilePaddingX : viewMode === "tablet" ? layoutObj.tabletPaddingX : layoutObj.paddingX),
                        paddingRight: isPreview ? undefined : (viewMode === "mobile" ? layoutObj.mobilePaddingX : viewMode === "tablet" ? layoutObj.tabletPaddingX : layoutObj.paddingX)
                    }}
                >
                    {showDropZones && (
                        <DropZoneStrip
                            zoneId={`hero-top-${block.id}`}
                            hasChildren={childBlocks.length > 0}
                            position="inside-start"
                            stripColor="#ffffff"
                            emptyLabel="Add block at the top"
                        />
                    )}
                    <SortableBlockGroup blocks={childBlocks}>
                        {childBlocks.map((child) => (
                            <ChildBlockWrapper key={child.id} block={child} outlineColor="#d97706" outlineColorHover="rgba(217,119,6,0.6)" />
                        ))}
                    </SortableBlockGroup>
                    {(showDropZones || childBlocks.length === 0) && (
                        <DropZoneStrip zoneId={`hero-${block.id}`} hasChildren={childBlocks.length > 0} stripColor="#ffffff" emptyLabel="Drag blocks here to build your Hero" />
                    )}
                </div>
            </section>
        </>
    );
}

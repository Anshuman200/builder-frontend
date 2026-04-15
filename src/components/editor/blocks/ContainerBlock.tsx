"use client";
import React from "react";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, ChildBlockWrapper, DropZoneStrip } from "./shared";

export function ContainerBlock({ block }: BlockProps) {
    const p = block.props;
    const childBlocks = (p.childBlocks as any[]) ?? [];
    const rawBg = p.bgColor as string;
    const bgImage = p.bgImage as string;

    const viewMode = useEditorStore((s) => s.viewMode);
    const isPreview = React.useContext(PreviewContext);
    const background = bgImage 
        ? (bgImage.startsWith("linear-gradient") || bgImage.startsWith("radial-gradient")
            ? bgImage
            : `url("${bgImage}") center/cover no-repeat`)
        : (rawBg || "transparent");

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
                    padding: isPreview ? undefined : editorPadding,
                    background: background || "transparent",
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
                {!isPreview && childBlocks.length === 0 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingBottom: 8, color: "#94a3b8" }}>
                        <Square2StackIcon style={{ width: 22, height: 22 }} />
                        <span style={{ fontSize: 11, fontWeight: 500 }}>Container</span>
                    </div>
                )}
                {childBlocks.map((child) => (<ChildBlockWrapper key={child.id} block={child} />))}
                {childBlocks.length === 0 && (
                    <DropZoneStrip zoneId={`container-${block.id}`} hasChildren={false} emptyLabel="Drag blocks into this container" />
                )}
            </div>
        </>
    );
}

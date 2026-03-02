"use client";
import React from "react";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, BlockProps, ChildBlockWrapper, DropZoneStrip } from "./shared";

export function ContainerBlock({ block }: BlockProps) {
    const p = block.props;
    const childBlocks = (p.childBlocks as any[]) ?? [];
    const rawBg = p.bgColor as string;

    const { viewMode, page } = useEditorStore();
    const isDark = (page?.theme?.mode || "light") === "dark";
    const isPreview = React.useContext(PreviewContext);

    let bgColor = rawBg || "transparent";
    const LIGHT_BGS = ["#ffffff", "#fff", "#f8fafc", "#f1f5f9"];
    if (isDark && LIGHT_BGS.includes(bgColor.toLowerCase())) {
        bgColor = bgColor.toLowerCase() === "#f8fafc" || bgColor.toLowerCase() === "#f1f5f9" ? "#09090b" : "transparent";
    }

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
                style={{ padding: isPreview ? undefined : editorPadding, background: bgColor || "transparent", maxWidth: (p.maxWidth as string) || "100%", width: "100%", margin: "0 auto", borderRadius: (p.borderRadius as string) || "0px", boxSizing: "border-box", border: childBlocks.length === 0 ? "1px dashed #cbd5e1" : "none" }}
            >
                {childBlocks.length === 0 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingBottom: 8, color: "#94a3b8" }}>
                        <Square2StackIcon style={{ width: 22, height: 22 }} />
                        <span style={{ fontSize: 11, fontWeight: 500 }}>Container</span>
                    </div>
                )}
                {childBlocks.map((child) => (<ChildBlockWrapper key={child.id} block={child} />))}
                <DropZoneStrip zoneId={`container-${block.id}`} hasChildren={childBlocks.length > 0} emptyLabel="Drag blocks into this container" />
            </div>
        </>
    );
}

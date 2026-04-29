"use client";
import React from "react";
import { QRCode } from "antd";
import { BlockProps, getBackgroundStyles, BackgroundOverlay } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { DEFAULT_THEME } from "@/lib/utils/theme";

export function QRCodeBlock({ block }: BlockProps) {
    const p = block.props;
    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const bgStyles = getBackgroundStyles(p, theme);
    const viewMode = useEditorStore((s) => s.viewMode);

    const padding = viewMode === "mobile" 
        ? (p.mobilePadding as string || p.padding as string || "16px") 
        : viewMode === "tablet" 
            ? (p.tabletPadding as string || p.padding as string || "16px") 
            : (p.padding as string || "16px");

    const align = (p.align as string) || "center";

    return (
        <div
            id={(p.sectionId as string) || `block-${block.id}`}
            style={{
                ...bgStyles,
                padding,
                display: "flex",
                justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
                width: "100%",
            }}
        >
            <BackgroundOverlay p={p} />
            <div style={{ position: "relative", zIndex: 1 }}>
                <QRCode
                    value={(p.value as string) || "https://solarioforge.com"}
                    type={(p.renderType as "canvas" | "svg") || "canvas"}
                    errorLevel={(p.errorLevel as "L" | "M" | "Q" | "H") || "M"}
                    color={(p.color as string) || "#000000"}
                    bgColor={(p.bgColor as string) || "transparent"}
                    icon={(p.icon as string) || undefined}
                    iconSize={Number(p.iconSize) || 60}
                    bordered={p.bordered !== false}
                    size={Number(p.size) || 250}
                />
            </div>
        </div>
    );
}

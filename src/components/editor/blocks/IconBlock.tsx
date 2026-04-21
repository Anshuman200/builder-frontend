"use client";
import React from "react";
import { getIcon } from "@/lib/utils/icons";
import { BlockProps } from "./shared";
import { Square2StackIcon } from "@heroicons/react/24/outline";

export function IconBlock({ block }: BlockProps) {
    const p = block.props;
    const iconName = (p.iconName as string) || "Star";
    const IconCmp = getIcon(iconName);
    const size: any = p.size || "24px";
    const align = (p.align as string) || "center";
    const color = (p.color as string) || "#6366f1";

    const wrapperStyle: React.CSSProperties = {
        padding: (p.padding as string) || "16px",
        width: "100%",
        display: "flex",
        justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
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
    };

    return (
        <div id={(p.sectionId as string) || `block-${block.id}`} style={wrapperStyle}>
            {IconCmp ? (
                <IconCmp width={size} height={size} style={{ color }} />
            ) : (
                <Square2StackIcon style={{ color: "#94a3b8", width: size, height: size }} />
            )}
        </div>
    );
}

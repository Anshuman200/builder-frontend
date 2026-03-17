"use client";
import React from "react";
import { getIcon } from "@/lib/utils/icons";
import { BlockProps } from "./shared";
import { Square2StackIcon } from "@heroicons/react/24/outline";

export function IconBlock({ block }: BlockProps) {
    const p = block.props;
    const iconName = (p.iconName as string) || "Star";
    const IconCmp = getIcon(iconName);
    const size = p.size ? Number(p.size) : 24;
    const align = (p.align as string) || "center";
    const color = (p.color as string) || "#6366f1";

    return (
        <div id={(p.sectionId as string) || `block-${block.id}`} style={{ padding: (p.padding as string) || "16px", width: "100%", display: "flex", justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center" }}>
            {IconCmp ? (
                <IconCmp style={{ width: size, height: size, color }} />
            ) : (
                <Square2StackIcon style={{ width: size, height: size, color: "#94a3b8" }} />
            )}
        </div>
    );
}

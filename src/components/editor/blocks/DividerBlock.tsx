"use client";
import React from "react";
import { BlockProps } from "./shared";

export function DividerBlock({ block }: BlockProps) {
    const p = block.props;
    return (
        <div id={(p.sectionId as string) || `block-${block.id}`} style={{ padding: `${(p.marginY as string) || "1rem"} 24px`, width: "100%" }}>
            <hr style={{ border: "none", borderTopWidth: (p.thickness as string) || "1px", borderTopStyle: ((p.style as string) || "solid") as React.CSSProperties["borderTopStyle"], borderTopColor: (p.color as string) || "var(--border)", margin: 0 }} />
        </div>
    );
}

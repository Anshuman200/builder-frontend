"use client";
import React from "react";
import { PreviewContext, BlockProps, CommonButton } from "./shared";

export function ButtonBlock({ block }: BlockProps) {
    const isPreview = React.useContext(PreviewContext);
    const p = block.props;
    const align = (p.align as string) || "left";

    return (
        <div
            id={(p.sectionId as string) || `block-${block.id}`}
            style={{
                padding: "24px",
                width: "100%",
                textAlign: align as React.CSSProperties["textAlign"],
                boxSizing: "border-box"
            }}
        >
            <CommonButton
                props={p}
                id={`btn-${block.id}`}
                blockId={block.id}
            />
        </div>
    );
}

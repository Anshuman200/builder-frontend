"use client";
import React from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { BlockProps } from "./shared";

export function ImageBlock({ block }: BlockProps) {
    const p = block.props;
    const src = p.src as string;
    const link = p.link as string;
    const caption = p.caption as string;
    const align = (p.align as string) || "center";
    const aspectRatio = p.aspectRatio as string;
    const height = p.height as string;

    const alignStyle: React.CSSProperties = {
        display: "flex", flexDirection: "column", width: "100%",
        alignItems: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
    };

    const imgStyle: React.CSSProperties = {
        display: "block",
        width: (p.width as string) || "100%",
        objectFit: (p.objectFit as React.CSSProperties["objectFit"]) || "cover",
        borderRadius: (p.borderRadius as string) || "0px",
        boxShadow: (p.boxShadow as string) || "none",
        ...(aspectRatio && aspectRatio !== "auto" ? { aspectRatio } : {}),
        ...(height && height !== "auto" ? { height } : {}),
    };

    const wrapperStyle: React.CSSProperties = {
        padding: "8px 16px",
        width: "100%",
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

    if (!src) {
        return (
            <div id={(p.sectionId as string) || `block-${block.id}`} style={{ ...wrapperStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, height: 200, background: "var(--surface)", border: "2px dashed var(--border)", color: "var(--text-subtle)" }}>
                <PhotoIcon style={{ width: 28, height: 28 }} />
                <span style={{ fontSize: 13 }}>Set image URL in properties →</span>
            </div>
        );
    }

    // eslint-disable-next-line @next/next/no-img-element
    const imgEl = <img src={src} alt={(p.alt as string) || ""} style={imgStyle} />;

    return (
        <div id={(p.sectionId as string) || `block-${block.id}`} style={wrapperStyle}>
            <div style={alignStyle}>
                {link ? (<a href={link} onClick={(e) => e.preventDefault()} style={{ display: "block", width: "100%" }}>{imgEl}</a>) : imgEl}
                {caption && (<p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--text-muted)", textAlign: align as React.CSSProperties["textAlign"] }}>{caption}</p>)}
            </div>
        </div>
    );
}

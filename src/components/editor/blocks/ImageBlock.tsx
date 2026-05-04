"use client";

import React from "react";
import { BlockProps, PreviewContext } from "./shared";
import { MasonryContext } from "./MasonryBlock";
import { EditorMedia } from "./EditorMedia";

export function ImageBlock({ block }: BlockProps) {
    const p = block.props;
    const isInMasonry = React.useContext(MasonryContext);

    const src = (p.src as string) || "";
    const alt = (p.alt as string) || "";
    const caption = (p.caption as string) || "";
    const link = (p.link as string) || "";
    const align = (p.align as string) || "center";

    const width = (p.width as string) || "100%";
    const height = (p.height as string) || "auto";
    const aspectRatio = (p.aspectRatio as string) || "auto";
    const objectFit = (p.objectFit as React.CSSProperties["objectFit"]) || "cover";
    const borderRadius = (p.borderRadius as string) || "0px";
    const boxShadow = (p.boxShadow as string) || "none";
    const priority = p.priority === true;

    const autoPlay = p.autoPlay === true;
    const loop = p.loop === true;
    const muted = p.muted !== false;
    const controls = p.controls !== false;

    const wrapperStyle: React.CSSProperties = {
        padding: isInMasonry ? "0" : (p.padding as string) || "8px 16px",
        width: "100%",
        height: height === "100%" ? "100%" : "auto",
        display: height === "100%" ? "flex" : "block",
        flexDirection: height === "100%" ? "column" : undefined,
        flex: height === "100%" ? 1 : undefined,
        overflow: "hidden",
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

    const alignStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: height === "100%" ? "100%" : undefined,
        flex: height === "100%" ? 1 : undefined,
        justifyContent: "center",
        alignItems:
            align === "left" ? "flex-start"
            : align === "right" ? "flex-end"
            : "center",
    };

    const media = (
        <EditorMedia
            src={src}
            alt={alt}
            objectFit={objectFit}
            borderRadius={borderRadius}
            aspectRatio={aspectRatio}
            width={width}
            height={height}
            boxShadow={boxShadow}
            priority={priority}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            controls={controls}
        />
    );

    return (
        <div
            id={(p.sectionId as string) || `block-${block.id}`}
            style={wrapperStyle}
        >
            <div style={alignStyle}>
                {link ? (
                    <a href={link} onClick={(e) => e.preventDefault()} style={{ display: "block", width: "100%", height: height === "100%" ? "100%" : "auto", flex: height === "100%" ? 1 : undefined }}>
                        {media}
                    </a>
                ) : media}

                {caption && (
                    <p style={{
                        margin: "6px 0 0",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        textAlign: align as React.CSSProperties["textAlign"],
                    }}>
                        {caption}
                    </p>
                )}
            </div>
        </div>
    );
}

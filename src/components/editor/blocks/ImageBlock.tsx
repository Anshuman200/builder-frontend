"use client";
import React from "react";
import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { BlockProps } from "./shared";
import { MasonryContext } from "./MasonryBlock";

export function ImageBlock({ block }: BlockProps) {
    const p = block.props;
    const src = p.src as string;
    const link = p.link as string;
    const caption = p.caption as string;
    const align = (p.align as string) || "center";
    const aspectRatio = p.aspectRatio as string;
    const height = p.height as string;
    const width = (p.width as string) || "100%";
    const objectFit = (p.objectFit as any) || "cover";
    const borderRadius = (p.borderRadius as string) || "0px";
    const boxShadow = (p.boxShadow as string) || "none";
    const priority = p.priority === true;
    const isInMasonry = React.useContext(MasonryContext);

    const alignStyle: React.CSSProperties = {
        display: "flex", flexDirection: "column", width: "100%",
        alignItems: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
    };

    const wrapperStyle: React.CSSProperties = {
        padding: isInMasonry ? "0" : "8px 16px",
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

    const hasAspect = aspectRatio && aspectRatio !== "auto";
    const hasHeight = height && height !== "auto";
    const isNatural = !hasAspect && !hasHeight;

    // Detect if we can use Next Image optimization (whitelisted domains)
    const isOptimizable = src.includes('unsplash.com') || src.includes('pexels.com') || src.includes('amazonaws.com') || src.includes('cloudfront.net');

    const imgEl = (
        <div style={{ 
            position: "relative", 
            width: width, 
            overflow: "hidden", 
            borderRadius, 
            boxShadow,
            maxWidth: "100%",
            maxHeight: "min(85vh, 1200px)", // Fix for "images too big" issue
            ...(hasAspect ? { aspectRatio } : {}),
            ...(hasHeight ? { height } : { height: "auto" })
        }}>
            <Image 
                src={src} 
                alt={(p.alt as string) || ""} 
                fill={!isNatural}
                width={isNatural ? 800 : undefined}
                height={isNatural ? 600 : undefined}
                style={{ 
                    objectFit: objectFit,
                    position: isNatural ? "relative" : "absolute",
                    width: isNatural ? "100%" : undefined,
                    height: isNatural ? "auto" : undefined,
                }}
                unoptimized={!isOptimizable}
                priority={priority}
            />
        </div>
    );

    return (
        <div id={(p.sectionId as string) || `block-${block.id}`} style={wrapperStyle}>
            <div style={alignStyle}>
                {link ? (<a href={link} onClick={(e) => e.preventDefault()} style={{ display: "block", width: "100%" }}>{imgEl}</a>) : imgEl}
                {caption && (<p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--text-muted)", textAlign: align as React.CSSProperties["textAlign"] }}>{caption}</p>)}
            </div>
        </div>
    );
}

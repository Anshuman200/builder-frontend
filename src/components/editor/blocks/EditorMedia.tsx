"use client";

/**
 * EditorMedia — Reusable image/video renderer for all editor blocks.
 *
 * Usage:
 *   import { EditorMedia } from "@/components/editor/blocks/EditorMedia";
 *
 *   <EditorMedia src={src} objectFit="cover" aspectRatio="16/9" borderRadius="12px" />
 *
 * ─── Rules ────────────────────────────────────────────────────────────────────
 *  • When `aspectRatio` or explicit `height` is set → uses fill + constrained
 *    container so objectFit / cover / contain all work correctly.
 *  • When neither is set (natural mode) → renders at intrinsic size, width 100%.
 *  • Always shows a shimmer skeleton while loading.
 *  • Falls back to a placeholder if `src` is empty or the image errors.
 *  • Videos are rendered via a native <video> tag.
 */

import React from "react";
import NextImage from "next/image";
import { PhotoIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

// ─── Shimmer style (inline, no Tailwind needed) ──────────────────────────────

const SHIMMER_KEYFRAMES = `
@keyframes em-shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
`;

function ShimmerLayer() {
    return (
        <>
            <style>{SHIMMER_KEYFRAMES}</style>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(100,116,139,0.06)",
                    zIndex: 1,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
                        animation: "em-shimmer 1.4s infinite ease-in-out",
                    }}
                />
            </div>
        </>
    );
}

// ─── Placeholder ─────────────────────────────────────────────────────────────

function Placeholder({ isVideo, style }: { isVideo?: boolean; style?: React.CSSProperties }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "rgba(100,116,139,0.06)",
                border: "2px dashed rgba(100,116,139,0.25)",
                color: "rgba(100,116,139,0.6)",
                width: "100%",
                minHeight: 140,
                ...style,
            }}
        >
            {isVideo
                ? <VideoCameraIcon style={{ width: 28, height: 28 }} />
                : <PhotoIcon style={{ width: 28, height: 28 }} />}
            <span style={{ fontSize: 12, fontWeight: 500 }}>
                {isVideo ? "No video" : "No image"}
            </span>
        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface EditorMediaProps {
    src?: string;
    alt?: string;
    /** "cover" | "contain" | "fill" | "none" — default: "cover" */
    objectFit?: React.CSSProperties["objectFit"];
    borderRadius?: string;
    /** CSS aspect-ratio string: "16/9" | "4/3" | "1/1" | "auto" */
    aspectRatio?: string;
    /** Explicit CSS width ("100%", "300px"). Default: "100%" */
    width?: string;
    /** Explicit CSS height ("auto", "300px", "100%"). Default: "auto" */
    height?: string;
    boxShadow?: string;
    priority?: boolean;
    /** Force render as video */
    isVideo?: boolean;
    /** For video: show native controls */
    controls?: boolean;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

// ─── EditorMedia ──────────────────────────────────────────────────────────────

export function EditorMedia({
    src = "",
    alt = "",
    objectFit = "cover",
    borderRadius = "0px",
    aspectRatio,
    width = "100%",
    height = "auto",
    boxShadow = "none",
    priority = false,
    isVideo,
    controls = true,
    autoPlay = false,
    loop = false,
    muted = true,
    style,
    className,
}: EditorMediaProps) {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const lastSrc = React.useRef(src);

    React.useEffect(() => {
        // Only reset loading if the source URL actually changed.
        // This prevents the initial mount effect from resetting a successful load
        // that might have happened extremely fast (e.g., from browser cache).
        if (src !== lastSrc.current) {
            setLoading(true);
            setError(false);
            lastSrc.current = src;
        }
    }, [src]);

    // Detect video by extension / prop
    const autoDetectVideo = src ? (
        /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(src) || 
        src.toLowerCase().includes("video") ||
        src.includes("youtube.com") || 
        src.includes("youtu.be") || 
        src.includes("vimeo.com")
    ) : false;
    const renderAsVideo = isVideo || autoDetectVideo;

    // Container sizing logic
    const hasAspect = aspectRatio && aspectRatio !== "auto";
    const hasExplicitHeight = height && height !== "auto" && height !== "100%";
    const fillMode = hasAspect || hasExplicitHeight || height === "100%";

    const containerStyle: React.CSSProperties = {
        position: "relative",
        width,
        maxWidth: "100%",
        overflow: "hidden",
        borderRadius,
        boxShadow,
        backgroundColor: "rgba(100,116,139,0.04)",
        ...(hasAspect ? { aspectRatio } : {}),
        ...(hasExplicitHeight ? { height } : {}),
        ...(height === "100%" ? { height: "100%" } : {}),
        ...style,
    };

    // ── Empty / error state ─────────────────────────────────────────────────
    if (!src || error) {
        return (
            <Placeholder
                isVideo={renderAsVideo}
                style={{ borderRadius, ...containerStyle }}
            />
        );
    }

    // ── Video ───────────────────────────────────────────────────────────────
    if (renderAsVideo) {
        return (
            <div style={containerStyle} className={className}>
                {loading && <ShimmerLayer />}
                <video
                    src={src}
                    controls={controls}
                    autoPlay={autoPlay}
                    loop={loop}
                    muted={muted}
                    playsInline
                    style={{
                        width: "100%",
                        height: fillMode ? "100%" : "auto",
                        display: "block",
                        objectFit: fillMode ? objectFit : undefined,
                        opacity: loading ? 0 : 1,
                        transition: "opacity 0.3s ease",
                    }}
                    onLoadedData={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                />
            </div>
        );
    }

    // ── Image: optimizable domains ──────────────────────────────────────────
    const optimizableDomains = [
        "unsplash.com", 
        "pexels.com", 
        "amazonaws.com",
        "cloudfront.net", 
        "imgix.net",
        "cdn.sanity.io",
        "images.ctfassets.net",
        "res.cloudinary.com",
        "cdn.shopify.com",
        "static.wixstatic.com",
        "lh3.googleusercontent.com"
    ];
    const isOptimizable = src.startsWith("/") || optimizableDomains.some(d => src.includes(d));

    // ── Image: fill mode (aspectRatio or explicit height) ───────────────────
    if (fillMode) {
        return (
            <div style={containerStyle} className={className}>
                {loading && <ShimmerLayer />}
                <NextImage
                    src={src}
                    alt={alt}
                    fill
                    style={{
                        objectFit,
                        opacity: loading ? 0 : 1,
                        transition: "opacity 0.35s ease",
                    }}
                    onLoad={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                    unoptimized={!isOptimizable}
                    priority={priority}
                    sizes={width === "100%" ? "100vw" : `${width}`}
                />
            </div>
        );
    }

    // ── Image: natural mode (auto height, no aspect ratio) ──────────────────
    // Use a plain img so masonry items keep their true intrinsic proportions.
    // NextImage requires fixed dimensions here, which makes unknown media look
    // like 16:9 thumbnails and breaks natural masonry height.
    return (
        <div
            style={{
                ...containerStyle,
                minHeight: loading ? 140 : undefined,
            }}
            className={className}
        >
            {loading && <ShimmerLayer />}
            <img
                src={src}
                alt={alt}
                style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    objectFit,
                    opacity: loading ? 0 : 1,
                    transition: "opacity 0.35s ease",
                }}
                onLoad={() => setLoading(false)}
                onError={() => { setLoading(false); setError(true); }}
            />
        </div>
    );
}

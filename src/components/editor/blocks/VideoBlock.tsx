"use client";
import React from "react";
import { VideoCameraIcon } from "@heroicons/react/24/outline";
import { BlockProps } from "./shared";
import { MasonryContext } from "./MasonryBlock";

export function VideoBlock({ block }: BlockProps) {
    const p = block.props;
    const url = p.url as string;
    const autoPlay = p.autoPlay === true;
    const loop = p.loop === true;
    const muted = p.muted === true;
    const controls = p.controls !== false;
    const align = (p.align as string) || "center";
    const aspectRatio = (p.aspectRatio as string) || "16/9";
    const isInMasonry = React.useContext(MasonryContext);

    const isYouTube = url?.includes("youtube.com") || url?.includes("youtu.be");
    const isVimeo = url?.includes("vimeo.com");

    const getYouTubeId = (u: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = u?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const wrapperStyle: React.CSSProperties = { padding: isInMasonry ? "0" : (p.padding as string) || "16px", width: "100%", display: "flex", flexDirection: "column", alignItems: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center" };
    const videoContainerStyle: React.CSSProperties = { width: (p.width as string) || "100%", maxWidth: "100%", aspectRatio, borderRadius: (p.borderRadius as string) || "8px", overflow: "hidden", background: "#000", position: "relative" };

    if (!url) {
        return (
            <div id={(p.sectionId as string) || `block-${block.id}`} style={wrapperStyle}>
                <div style={{ ...videoContainerStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface)", border: "2px dashed var(--border)", color: "var(--text-subtle)" }}>
                    <VideoCameraIcon style={{ width: 28, height: 28 }} />
                    <span style={{ fontSize: 13, marginTop: 8 }}>Set video URL in properties →</span>
                </div>
            </div>
        );
    }

    return (
        <div id={(p.sectionId as string) || `block-${block.id}`} style={wrapperStyle}>
            <div style={videoContainerStyle}>
                {isYouTube ? (
                    <iframe src={`https://www.youtube.com/embed/${getYouTubeId(url)}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`} style={{ width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : isVimeo ? (
                    <iframe src={`https://player.vimeo.com/video/${url.split("/").pop()}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}`} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                ) : (
                    <video src={url} autoPlay={autoPlay} loop={loop} muted={muted} controls={controls} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { BlockProps, PreviewContext } from "./shared";
import { MasonryContext } from "./MasonryBlock";
import { useEditorStore } from "@/stores/editorStore";
import { makeBlock } from "@/lib/config/blocks";
import dynamic from "next/dynamic";

const MediaPicker = dynamic(() => import("@/components/editor/MediaPicker"), { ssr: false });

// ─── Skeleton loader card ─────────────────────────────────────────────────────
function SkeletonCard({ count }: { count: number }) {
    return (
        <>
            <style>{`
                @keyframes skeleton-shimmer {
                    0%   { background-position: -400px 0; }
                    100% { background-position: 400px 0; }
                }
                .media-skeleton {
                    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 75%);
                    background-size: 800px 100%;
                    animation: skeleton-shimmer 1.4s infinite linear;
                    border-radius: 12px;
                    width: 100%;
                    aspect-ratio: 1/1;
                }
            `}</style>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="media-skeleton" />
            ))}
        </>
    );
}

export function MediaPickerBlock({ block }: BlockProps) {
    const isPreview = React.useContext(PreviewContext);
    const masonryId = React.useContext(MasonryContext);
    const [pickerOpen, setPickerOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [pendingCount, setPendingCount] = React.useState(0);

    const { updateBlock, page, activeRouteId } = useEditorStore();

    if (isPreview) return null;

    // ─── Find the masonry block in the ACTIVE route (multi-page aware) ─────────
    const findMasonryBlock = (blockId: string): any => {
        if (!page) return null;

        const searchBlocks = (blocks: any[]): any => {
            for (const b of blocks) {
                if (b.id === blockId) return b;
                // Search inside childBlocks (masonry/container children)
                if (b.props?.childBlocks) {
                    const found = searchBlocks(b.props.childBlocks);
                    if (found) return found;
                }
                // Search in column props
                if (b.props?.col0) {
                    const found = searchBlocks(b.props.col0);
                    if (found) return found;
                }
                if (b.props?.col1) {
                    const found = searchBlocks(b.props.col1);
                    if (found) return found;
                }
            }
            return null;
        };

        // 1. Search active route content (primary)
        const activeRoute = page.routes?.find(r => r.id === activeRouteId);
        if (activeRoute?.content) {
            const found = searchBlocks(activeRoute.content);
            if (found) return found;
        }

        // 2. Search globalBlocks (header / footer — unlikely but safe)
        if (page.globalBlocks?.header) {
            const found = searchBlocks([page.globalBlocks.header]);
            if (found) return found;
        }
        if (page.globalBlocks?.footer) {
            const found = searchBlocks([page.globalBlocks.footer]);
            if (found) return found;
        }

        // 3. Fallback: legacy page.content
        if (page.content?.length) {
            const found = searchBlocks(page.content);
            if (found) return found;
        }

        return null;
    };

    const handleSelect = (urls: string[]) => {
        if (!masonryId || !page) return;

        const masonryBlock = findMasonryBlock(masonryId);
        if (!masonryBlock) {
            console.warn("[MediaPickerBlock] Could not find masonry block:", masonryId);
            setPickerOpen(false);
            return;
        }

        // Show loading skeletons
        setLoading(true);
        setPendingCount(urls.length);
        setPickerOpen(false);

        // Create new image/video blocks
        const newBlocks = urls.map(url => {
            const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];
            const lowerUrl = url.toLowerCase();
            const isVid = videoExtensions.some(ext => lowerUrl.endsWith(ext)) || lowerUrl.includes("video");

            if (isVid) {
                return makeBlock("video", {
                    url,
                    width: "100%",
                    aspectRatio: "16/9",
                    borderRadius: "12px",
                    controls: true,
                    autoPlay: false,
                    loop: true,
                    muted: true,
                    objectFit: "cover",
                });
            }

            return makeBlock("image", {
                src: url,
                height: "auto",
                aspectRatio: "auto",
                borderRadius: "12px",
                objectFit: "cover",
                width: "100%",
            });
        });

        // Insert before the picker card, or at end
        const currentChildren: any[] = masonryBlock.props.childBlocks || [];
        const pickerIndex = currentChildren.findIndex((c: any) => c.id === block.id);
        const newChildren = [...currentChildren];
        if (pickerIndex !== -1) {
            newChildren.splice(pickerIndex, 0, ...newBlocks);
        } else {
            newChildren.push(...newBlocks);
        }

        // Small delay so skeleton is visible, then commit
        setTimeout(() => {
            updateBlock(masonryId, { childBlocks: newChildren }, true);
            setLoading(false);
            setPendingCount(0);
        }, 600);
    };

    return (
        <>
            {/* Skeleton placeholders shown before commit */}
            {loading && <SkeletonCard count={pendingCount} />}

            {/* Add Media trigger card */}
            <div
                id={`block-${block.id}`}
                onClick={() => !loading && setPickerOpen(true)}
                style={{
                    width: "100%",
                    height: "72px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    background: "var(--surface)",
                    border: "2px dashed var(--border)",
                    borderRadius: (block.props.borderRadius as string) || "12px",
                    cursor: loading ? "wait" : "pointer",
                    transition: "all 0.2s ease",
                    padding: "0 20px",
                    color: loading ? "var(--text-muted)" : "var(--text-subtle)",
                    opacity: loading ? 0.5 : 1,
                    boxSizing: "border-box",
                    marginBottom: "10px",
                }}
            >
                {loading ? (
                    <>
                        <svg style={{ width: 20, height: 20, animation: "spin 1s linear infinite", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em" }}>Adding {pendingCount} item{pendingCount !== 1 ? "s" : ""}…</span>
                    </>
                ) : (
                    <>
                        <PlusCircleIcon style={{ width: 20, height: 20, strokeWidth: 1.5, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>Add Media</span>
                    </>
                )}
            </div>

            {pickerOpen && (
                <MediaPicker
                    open={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    onSelect={handleSelect}
                    title="Add to Gallery"
                    multiple={true}
                />
            )}
        </>
    );
}

"use client";

import React from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { BlockProps, PreviewContext } from "./shared";
import { MasonryContext } from "./MasonryBlock";
import { useEditorStore } from "@/stores/editorStore";
import { makeBlock } from "@/lib/config/blocks";
import dynamic from "next/dynamic";

const MediaPicker = dynamic(() => import("@/components/editor/MediaPicker"), { ssr: false });

export function MediaPickerBlock({ block }: BlockProps) {
    const isPreview = React.useContext(PreviewContext);
    const masonryId = React.useContext(MasonryContext);
    const [pickerOpen, setPickerOpen] = React.useState(false);
    
    const { updateBlock, page } = useEditorStore();
    
    if (isPreview) return null;

    const handleSelect = (urls: string[]) => {
        if (!masonryId || !page) return;
        
        // Find the parent masonry block to get current childBlocks
        const findBlock = (blocks: any[]): any => {
            for (const b of blocks) {
                if (b.id === masonryId) return b;
                if (b.props?.childBlocks) {
                    const found = findBlock(b.props.childBlocks);
                    if (found) return found;
                }
            }
            return null;
        };

        const masonryBlock = findBlock(page.content);
        if (!masonryBlock) return;

        const currentChildren = masonryBlock.props.childBlocks || [];
        
        // Create new blocks
        const newBlocks = urls.map(url => {
            const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
            const lowerUrl = url.toLowerCase();
            const isVid = videoExtensions.some(ext => lowerUrl.endsWith(ext)) || lowerUrl.includes('video');

            if (isVid) {
                return makeBlock("video", { 
                    url: url, 
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
                width: "100%"
            });
        });

        // Add before the picker or at the end
        const pickerIndex = currentChildren.findIndex((c: any) => c.id === block.id);
        const newChildren = [...currentChildren];
        if (pickerIndex !== -1) {
            newChildren.splice(pickerIndex, 0, ...newBlocks);
        } else {
            newChildren.push(...newBlocks);
        }

        updateBlock(masonryId, { childBlocks: newChildren }, true);
        setPickerOpen(false);
    };

    return (
        <div 
            id={`block-${block.id}`}
            onClick={() => setPickerOpen(true)}
            style={{
                width: "100%",
                aspectRatio: "1/1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                background: "var(--surface)",
                border: "2px dashed var(--border)",
                borderRadius: (block.props.borderRadius as string) || "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                padding: "20px",
                color: "var(--text-subtle)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.background = "var(--primary-light)";
                e.currentTarget.style.color = "var(--primary)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.color = "var(--text-subtle)";
            }}
        >
            <PlusCircleIcon style={{ width: 32, height: 32, strokeWidth: 1.5 }} />
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>Add Media</span>

            {pickerOpen && (
                <MediaPicker 
                    open={pickerOpen} 
                    onClose={() => setPickerOpen(false)} 
                    onSelect={handleSelect}
                    title="Add to Gallery"
                    multiple={true}
                />
            )}
        </div>
    );
}

"use client";

import React from "react";
import { useEditorStore } from "@/stores/editorStore";
import MediaPicker from "./MediaPicker";

/**
 * GlobalMediaPicker Singleton
 * Renders the media selection modal controlled by editorStore.
 */
export function GlobalMediaPicker() {
    const { mediaPicker, hideMediaPicker } = useEditorStore();
    const { open, type, onSelect, title } = mediaPicker;

    return (
        <MediaPicker
            open={open}
            onClose={hideMediaPicker}
            onSelect={(urls) => {
                const url = Array.isArray(urls) ? urls[0] : urls;
                
                // 1. Trigger close immediately for snappy feel
                hideMediaPicker();
                
                // 2. Defer the heavy block update to next tick
                if (url) {
                    setTimeout(() => onSelect(url), 10);
                }
            }}
            type={type}
            title={title}
            multiple={false}
        />
    );
}

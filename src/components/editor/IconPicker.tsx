"use client";

import React, { useRef } from "react";
import { MagnifyingGlassIcon, SwatchIcon } from "@heroicons/react/24/outline";
import { getIcon } from "@/lib/utils/icons";
import { useEditorStore } from "@/stores/editorStore";

interface IconPickerProps {
    value: string;          // e.g. "Star"
    onChange: (name: string) => void;
}

/**
 * This component is now just a TRIGGER for the GlobalIconPicker singleton.
 * It calculates its position on click and tells the global picker to show up there.
 */
export function IconPicker({ value, onChange }: IconPickerProps) {
    const btnRef = useRef<HTMLButtonElement>(null);
    const { showIconPicker, hideIconPicker, iconPicker } = useEditorStore();
    const CurrentIcon = getIcon(value);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // If THIS specific picker is already open, close it (toggle behavior)
        if (iconPicker.open && iconPicker.onSelect === onChange) {
            hideIconPicker();
            return;
        }

        // Otherwise, open it at our location
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            // We use a tiny delay if another one was open to ensure Ant Design Popover resets cleanly
            if (iconPicker.open) hideIconPicker();
            
            setTimeout(() => {
                showIconPicker({
                    value: value || "",
                    onSelect: onChange,
                    anchorRect: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    }
                });
            }, iconPicker.open ? 50 : 0);
        }
    };

    return (
        <button
            ref={btnRef}
            type="button"
            title="Pick an icon"
            onClick={handleClick}
            style={{
                display: "flex", alignItems: "center", gap: 6,
                width: "100%", height: 26, padding: "0 8px",
                fontSize: 11, background: "#222222",
                border: "1px solid transparent",
                borderRadius: 4, color: "#ededed",
                outline: "none", cursor: "pointer",
                transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#2a2a2a")}
            onMouseLeave={e => (e.currentTarget.style.background = "#222222")}
        >
            {CurrentIcon ? (
                <CurrentIcon style={{ width: 14, height: 14, flexShrink: 0, color: "#818cf8" }} />
            ) : (
                <SwatchIcon style={{ width: 14, height: 14, flexShrink: 0, color: "#555" }} />
            )}
            <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {value || "None"}
            </span>
            <MagnifyingGlassIcon style={{ width: 10, height: 10, opacity: 0.4, flexShrink: 0 }} />
        </button>
    );
}

"use client";

import React, { useRef } from "react";
import { MagnifyingGlassIcon, SwatchIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getIcon } from "@/lib/utils/icons";
import { useEditorStore } from "@/stores/editorStore";
import { IconButton } from "../ui/IconButton";

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

    const triggerStyle: React.CSSProperties = {
        display: "flex", alignItems: "center", gap: 6,
        minWidth: 0, flex: 1, height: 26, padding: "0 8px",
        fontSize: 11, background: "transparent",
        border: "none", color: "#ededed",
        outline: "none", cursor: "pointer",
        textAlign: "left",
    };

    return (
        <div
            style={{
                display: "flex", alignItems: "center",
                width: "100%", height: 26,
                background: "#222222",
                border: "1px solid transparent",
                borderRadius: 4, color: "#ededed",
                transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#2a2a2a")}
            onMouseLeave={e => (e.currentTarget.style.background = "#222222")}
        >
            <button
                ref={btnRef}
                type="button"
                title="Pick an icon"
                onClick={handleClick}
                style={triggerStyle}
            >
                {CurrentIcon ? (
                    <CurrentIcon style={{ width: 14, height: 14, flexShrink: 0, color: "#818cf8" }} />
                ) : (
                    <SwatchIcon style={{ width: 14, height: 14, flexShrink: 0, color: "#555" }} />
                )}
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {value || "None"}
                </span>
                {!value && <MagnifyingGlassIcon style={{ width: 14, height: 14, flexShrink: 0, color: "#71717a" }} />}
            </button>
            {value && (
                <IconButton
                    icon={<XMarkIcon />}
                    variant="ghost"
                    size="sm"
                    className="h-[24px] w-[24px] shrink-0 rounded"
                    tooltip="Clear icon"
                    onClick={(e) => { e.stopPropagation(); onChange(""); }}
                />
            )}
        </div>
    );
}

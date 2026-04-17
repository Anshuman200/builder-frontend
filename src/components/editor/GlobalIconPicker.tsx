"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ICON_LIST } from "@/lib/utils/icons";
import { useEditorStore } from "@/stores/editorStore";
import { SearchInput } from "../ui/SearchInput";
import { IconButton } from "../ui/IconButton";

/**
 * GlobalIconPicker Singleton
 * This component renders exactly ONE picker instance for the entire editor.
 * It uses absolute positioning relative to the trigger.
 */
export function GlobalIconPicker() {
    const { iconPicker, hideIconPicker, setIconPickerValue } = useEditorStore();
    const { open, value, onSelect, anchorRect } = iconPicker;

    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Auto-focus search input when opened
    useEffect(() => {
        if (open) {
            setQuery("");
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const filtered = useMemo(() => {
        if (!query.trim()) return ICON_LIST;
        const q = query.toLowerCase();
        return ICON_LIST.filter(
            ({ name, label }) =>
                name.toLowerCase().includes(q) || label.toLowerCase().includes(q)
        );
    }, [query]);

    if (!open || !anchorRect) return null;

    // Calculate position - default to right of the trigger
    const PADDING = 8;
    const PICKER_WIDTH = 260;
    const PICKER_HEIGHT = 340;

    let top = anchorRect.top;
    let left = anchorRect.left + anchorRect.width + PADDING;

    // Boundary checks
    if (left + PICKER_WIDTH > window.innerWidth) {
        left = anchorRect.left - PICKER_WIDTH - PADDING;
    }
    if (top + PICKER_HEIGHT > window.innerHeight) {
        top = window.innerHeight - PICKER_HEIGHT - PADDING;
    }

    return (
        <>
            {/* Backdrop to capture clicks outside */}
            <div
                style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 99998, background: "transparent"
                }}
                onClick={hideIconPicker}
            />

            {/* The Picker itself */}
            <div
                ref={pickerRef}
                style={{
                    position: "fixed",
                    top, left,
                    width: PICKER_WIDTH,
                    maxHeight: PICKER_HEIGHT,
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: 10,
                    boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    zIndex: 99999,
                    animation: "pickerIn 0.15s ease-out"
                }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {/* Search bar */}
                <div style={{ padding: "10px 12px", borderBottom: "1px solid #2a2a2a", flexShrink: 0 }}>
                    <SearchInput
                        ref={inputRef}
                        value={query}
                        onChange={v => setQuery(v)}
                        onClear={() => setQuery("")}
                        placeholder="Search icons…"
                        width="100%"
                        style={{ height: 30, fontSize: 12, background: "#242424", borderColor: "#333" }}
                    />
                </div>

                {/* Icon grid */}
                <div
                    style={{
                        flex: 1, overflowY: "auto",
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 4,
                        padding: "8px 12px 12px",
                        scrollbarWidth: "none",
                    }}
                >
                    {/* Option to clear icon */}
                    {!query && (
                        <button
                            type="button"
                            title="No Icon (Remove)"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIconPickerValue("");
                                onSelect("");
                                setTimeout(() => hideIconPicker(), 100);
                            }}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                width: "100%", aspectRatio: "1",
                                padding: 8,
                                borderRadius: 6,
                                border: !value ? "2px solid var(--primary)" : "1px solid #2a2a2a",
                                background: !value ? "rgba(99,102,241,0.1)" : "transparent",
                                cursor: "pointer",
                                color: !value ? "var(--primary)" : "#555",
                                transition: "all 0.15s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                            onMouseLeave={e => e.currentTarget.style.color = !value ? "var(--primary)" : "#555"}
                        >
                            <XMarkIcon style={{ width: 20, height: 20 }} />
                        </button>
                    )}
                    <IconButton
                        icon={<XMarkIcon style={{ width: 20, height: 20 }} />}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIconPickerValue("");
                            onSelect("");
                            setTimeout(() => hideIconPicker(), 100);
                        }}
                        tooltip="No Icon (Remove)"
                        variant="ghost"
                        size="sm"
                    />

                    {filtered.map(({ name, label, Icon }) => {
                        const isSelected = name === value;
                        return (
                            <button
                                key={name}
                                type="button"
                                title={label}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    // 1. Update visual highlight immediately
                                    setIconPickerValue(name);

                                    // 2. Perform global update
                                    onSelect(name);

                                    // 3. Close with a tiny delay for visual confirmation
                                    setTimeout(() => {
                                        hideIconPicker();
                                    }, 100);
                                }}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    width: "100%", aspectRatio: "1",
                                    padding: 8,
                                    borderRadius: 6,
                                    border: isSelected ? "2px solid var(--primary)" : "1px solid transparent",
                                    background: isSelected ? "rgba(99,102,241,0.1)" : "transparent",
                                    cursor: "pointer",
                                    color: isSelected ? "var(--primary)" : "#888",
                                    transition: "all 0.15s",
                                }}
                            >
                                <Icon style={{ width: 20, height: 20 }} />
                            </button>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "32px 0", color: "#555", fontSize: 12 }}>
                            No icons found
                        </div>
                    )}
                </div>

                {/* Footer / Selected name */}
                <div style={{ padding: "8px 12px", borderTop: "1px solid #2a2a2a", fontSize: 11, background: "#161616", flexShrink: 0 }}>
                    <span style={{ color: "#555" }}>Selected:</span> <span style={{ color: "#aaa", fontWeight: 500 }}>{value || "None"}</span>
                </div>

                <style>{`
                    @keyframes pickerIn {
                        from { opacity: 0; transform: translateY(4px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>
            </div>
        </>
    );
}

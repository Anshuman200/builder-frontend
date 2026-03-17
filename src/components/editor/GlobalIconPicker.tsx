"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ICON_LIST } from "@/lib/utils/icons";
import { useEditorStore } from "@/stores/editorStore";

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
                <div style={{ padding: "10px 12px", borderBottom: "1px solid #2a2a2a", position: "relative", flexShrink: 0 }}>
                    <MagnifyingGlassIcon
                        style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#555", pointerEvents: "none" }}
                    />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search icons…"
                        style={{
                            width: "100%", boxSizing: "border-box",
                            height: 30, paddingLeft: 28, paddingRight: query ? 28 : 10,
                            fontSize: 12, background: "#242424",
                            border: "1px solid #333", borderRadius: 6,
                            color: "#ededed", outline: "none",
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "#333")}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex", alignItems: "center", padding: 0 }}
                        >
                            <XMarkIcon style={{ width: 14, height: 14 }} />
                        </button>
                    )}
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

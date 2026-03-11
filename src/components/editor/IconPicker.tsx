"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon, SwatchIcon } from "@heroicons/react/24/outline";
import { Popover } from "antd";
import { ICON_LIST, getIcon } from "@/lib/icons";

interface IconPickerProps {
    value: string;          // e.g. "Star"
    onChange: (name: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const CurrentIcon = getIcon(value);

    // Auto-focus search input when opened
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery("");
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

    function handleSelect(name: string) {
        onChange(name);
        setOpen(false);
    }

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            placement="rightTop"
            trigger="click"
            styles={{
                root: {
                    width: 260,
                    padding: 0,
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: 340,
                    overflow: "hidden"
                }
            }}
            content={
                <>
                    {/* Search bar */}
                    <div style={{ padding: "8px 10px", borderBottom: "1px solid #2a2a2a", position: "relative", flexShrink: 0 }}>
                        <MagnifyingGlassIcon
                            style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "#555", pointerEvents: "none" }}
                        />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search icons…"
                            style={{
                                width: "100%", boxSizing: "border-box",
                                height: 26, paddingLeft: 26, paddingRight: query ? 26 : 8,
                                fontSize: 11, background: "#242424",
                                border: "1px solid #333", borderRadius: 4,
                                color: "#ededed", outline: "none",
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = "#0099ff66")}
                            onBlur={e => (e.currentTarget.style.borderColor = "#333")}
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center", padding: 0 }}
                            >
                                <XMarkIcon style={{ width: 11, height: 11 }} />
                            </button>
                        )}
                    </div>

                    {/* Count */}
                    <div style={{ padding: "4px 10px 2px", fontSize: 10, color: "#555", flexShrink: 0 }}>
                        {filtered.length} icon{filtered.length !== 1 ? "s" : ""}
                    </div>

                    {/* Icon grid */}
                    <div
                        style={{
                            flex: 1, overflowY: "auto",
                            display: "grid",
                            gridTemplateColumns: "repeat(6, 1fr)",
                            gap: 2,
                            padding: "4px 8px 10px",
                            scrollbarWidth: "none"
                        }}
                    >
                        {filtered.map(({ name, label, Icon }) => {
                            const isSelected = name === value;
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    title={label}
                                    onClick={() => handleSelect(name)}
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        width: "100%", aspectRatio: "1",
                                        padding: 6,
                                        borderRadius: 5,
                                        border: isSelected ? "1px solid #0099ff66" : "1px solid transparent",
                                        background: isSelected ? "#0099ff18" : "transparent",
                                        cursor: "pointer",
                                        color: isSelected ? "#4db8ff" : "#888",
                                        transition: "all 0.1s",
                                    }}
                                    onMouseEnter={e => {
                                        if (!isSelected) {
                                            (e.currentTarget as HTMLElement).style.background = "#2a2a2a";
                                            (e.currentTarget as HTMLElement).style.color = "#ededed";
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isSelected) {
                                            (e.currentTarget as HTMLElement).style.background = "transparent";
                                            (e.currentTarget as HTMLElement).style.color = "#888";
                                        }
                                    }}
                                >
                                    <Icon style={{ width: 16, height: 16 }} />
                                </button>
                            );
                        })}
                        {filtered.length === 0 && (
                            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px 0", color: "#555", fontSize: 11 }}>
                                No icons found
                            </div>
                        )}
                    </div>

                    {/* Selected name */}
                    {
                        value && (
                            <div style={{ padding: "5px 10px", borderTop: "1px solid #2a2a2a", fontSize: 10, color: "#555", flexShrink: 0 }}>
                                Selected: <span style={{ color: "#888" }}>{value}</span>
                            </div>
                        )
                    }
                </>
            }
        >
            <button
                type="button"
                title="Pick an icon"
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
        </Popover >
    );
}

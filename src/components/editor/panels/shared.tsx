"use client";

import type { Block, EditorPage } from "@/types";
/**
 * panels/shared.tsx — All shared UI primitives for the Properties Panel
 *
 * Exports: PANEL_COLORS, Field, TextInput, TextareaInput, SelectInput,
 *          BorderRadiusInput, ColorInput, ToggleSwitch, Section
 */

import React from "react";
import { ChevronDownIcon, CheckIcon, SwatchIcon, PhotoIcon, TrashIcon, VideoCameraIcon, ArrowPathIcon, LinkIcon, ArrowDownIcon, ArrowDownOnSquareIcon, ArrowDownTrayIcon, PlusIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { useEditorStore } from "@/stores/editorStore";
import { ColorPicker, ConfigProvider, Dropdown, Input, Popover, Select, Space, Switch, theme, Tooltip } from "antd";
import MediaPicker from "../MediaPicker";
import PillSegmented from "../../ui/PillSegmented";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars2Icon } from "@heroicons/react/20/solid";
import { IconPicker } from "../IconPicker";
import AppToolTip from "../../common/AppToolTip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export { arrayMove, rectSortingStrategy };

export type { Block, EditorPage };
export { useEditorStore };

// ─── Focus & Highlighting Hooks ──────────────────────────────────────────────
/**
 * useSubItemFocus
 * Reusable hook to handle focal scrolling and highlighting of sub-items
 * (e.g., specific members in a Team block, features in a Features block).
 */
export function useSubItemFocus(blockId: string) {
    const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);
    const [flashIdx, setFlashIdx] = React.useState<number | null>(null);
    const subItemFocus = useEditorStore(s => s.subItemFocus);

    const focusedIdx = (subItemFocus?.blockId === blockId) ? subItemFocus.index : null;

    React.useEffect(() => {
        let prev = useEditorStore.getState().subItemFocus;
        return useEditorStore.subscribe((state) => {
            const f = state.subItemFocus as any;
            if (f && f.blockId === blockId && f !== prev) {
                prev = f;
                const el = itemRefs.current[f.index];
                if (el) {
                    setTimeout(() => {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        setFlashIdx(f.index);
                        setTimeout(() => setFlashIdx(null), 2500);
                    }, 50);
                }
            }
        });
    }, [blockId]);

    return { flashIdx, itemRefs, focusedIdx };
}

// ─── Theme constants ──────────────────────────────────────────────────────────

export const PANEL_COLORS = {
    bg: "#050505",
    sectionBg: "#0a0a0a",
    border: "rgba(255, 255, 255, 0.12)",
    text: "#ffffff",
    muted: "#71717a",
    inputBg: "#111111",
    inputBorder: "rgba(255, 255, 255, 0.1)",
    inputHoverBg: "#1a1a1a",
    primary: "#6366f1",
};

// ─── MediaInput ───────────────────────────────────────────────────────────────

export function MediaInput({ value, onChange, placeholder, type = "image", variant = "default", aspectRatio }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: "image" | "video"; variant?: "default" | "compact"; aspectRatio?: string }) {
    const [pickerOpen, setPickerOpen] = React.useState(false);

    const isVideo = type === "video" || (value && (value?.endsWith(".mp4") || value?.includes("youtube.com") || value?.includes("vimeo.com") || value?.includes("youtu.be")));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {/* Direct URL Input */}
            <div style={{ position: "relative" }}>
                <div style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    pointerEvents: "none"
                }}>Link:</div>
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || (type === "video" ? "YouTube.com/watch?v=..." : "https://...")}
                    style={{
                        width: "100%",
                        padding: "8px 12px 8px 42px",
                        fontSize: 12,
                        background: PANEL_COLORS.inputBg,
                        border: `1px solid ${PANEL_COLORS.inputBorder}`,
                        borderRadius: 8,
                        color: PANEL_COLORS.text,
                        outline: "none",
                        transition: "all 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = PANEL_COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = PANEL_COLORS.inputBorder}
                />
            </div>

            {/* Visual Preview / Upload Button */}
            {!value ? (
                <button
                    onClick={() => setPickerOpen(true)}
                    style={{
                        width: "100%",
                        height: 70,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: PANEL_COLORS.inputBg,
                        border: `2px dashed ${PANEL_COLORS.inputBorder}`,
                        borderRadius: 10,
                        color: PANEL_COLORS.muted,
                        cursor: "pointer",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = PANEL_COLORS.primary; e.currentTarget.style.color = PANEL_COLORS.text; e.currentTarget.style.background = PANEL_COLORS.inputHoverBg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = PANEL_COLORS.inputBorder; e.currentTarget.style.color = PANEL_COLORS.muted; e.currentTarget.style.background = PANEL_COLORS.inputBg; }}
                >
                    {type === "video" ? <VideoCameraIcon style={{ width: 22, height: 22 }} /> : <PhotoIcon style={{ width: 22, height: 22 }} />}
                    <span style={{ fontSize: 11, fontWeight: 600 }}>Select from Library</span>
                </button>
            ) : (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 10,
                    background: PANEL_COLORS.inputBg,
                    border: `1px solid ${PANEL_COLORS.inputBorder}`,
                    borderRadius: 10,
                    overflow: "hidden"
                }}>
                    <div style={{
                        width: 64,
                        height: 48,
                        borderRadius: 6,
                        background: "#121212",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                        border: "1px solid rgba(255,255,255,0.1)",
                        position: "relative"
                    }}>
                        {isVideo ? (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <VideoCameraIcon style={{ width: 20, height: 20, color: PANEL_COLORS.primary }} />
                                <div style={{
                                    position: "absolute",
                                    top: 2,
                                    left: 2,
                                    background: "rgba(0,0,0,0.6)",
                                    fontSize: 8,
                                    padding: "1px 3px",
                                    borderRadius: 2,
                                    color: "white"
                                }}>{aspectRatio && aspectRatio !== "auto" ? aspectRatio.replace("/", ":") : "16:9"}</div>
                            </div>
                        ) : (
                            <img src={value} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as any).src = "https://placehold.co/100x100?text=Error"; }} />
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPickerOpen(true)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    background: "rgba(59, 130, 246, 0.1)",
                                    border: "1px solid rgba(59, 130, 246, 0.2)",
                                    color: "#60a5fa",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: "pointer"
                                }}
                            >
                                <ArrowPathIcon style={{ width: 14, height: 14 }} />
                                Change
                            </button>
                            <button
                                onClick={() => onChange("")}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    background: "rgba(239, 68, 68, 0.1)",
                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                    color: "#f87171",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: "pointer"
                                }}
                            >
                                <TrashIcon style={{ width: 14, height: 14 }} />
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ fontSize: 10, color: "#64748b", fontStyle: "italic", marginTop: -4 }}>
                Supported Formats: YouTube, Vimeo, and direct .mp4 links.
            </div>

            {pickerOpen && (
                <MediaPicker
                    open={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    onSelect={(urls) => onChange(Array.isArray(urls) ? urls[0] : urls)}
                    title={type === "image" ? "Select Image" : "Select Video"}
                />
            )}
        </div>
    );
}

// ─── Field ────────────────────────────────────────────────────────────────────

export function Field({ label, children, description, fullWidth }: { label: string; children: React.ReactNode; description?: string; fullWidth?: boolean }) {
    return (
        <div style={{ marginBottom: 12, gridColumn: fullWidth ? "span 2" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: PANEL_COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {children}
            </div>
            {description && <div style={{ marginTop: 4, fontSize: 10, color: PANEL_COLORS.muted, fontStyle: "italic", lineHeight: 1.4 }}>{description}</div>}
        </div>
    );
}

// ─── TextInput ────────────────────────────────────────────────────────────────
export function TextInput({ value, onChange, onBlur, placeholder, type = "text", style }: { value: string; onChange: (v: string) => void; onBlur?: (v: string) => void; placeholder?: string; type?: string, style?: React.CSSProperties }) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            style={{
                width: "100%", height: 34, padding: "0 12px", fontSize: 12,
                background: PANEL_COLORS.inputBg, border: `1px solid ${PANEL_COLORS.inputBorder}`,
                borderRadius: 8, color: PANEL_COLORS.text, outline: "none",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", ...style
            }}
            onMouseEnter={(e) => { if (document.activeElement !== e.currentTarget) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = PANEL_COLORS.inputHoverBg; } }}
            onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) { e.currentTarget.style.borderColor = PANEL_COLORS.inputBorder; e.currentTarget.style.background = PANEL_COLORS.inputBg; } }}
            onFocus={(e) => {
                e.currentTarget.style.background = "#000";
                e.currentTarget.style.borderColor = PANEL_COLORS.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99, 102, 241, 0.2)`;
            }}
            onBlur={(e) => {
                e.currentTarget.style.background = PANEL_COLORS.inputBg;
                e.currentTarget.style.borderColor = PANEL_COLORS.inputBorder;
                e.currentTarget.style.boxShadow = "none";
                onBlur?.(e.target.value);
            }}
        />
    );
}

/**
 * PanelInlineEditor
 * A seamless, premium input that feels like a text element until focused.
 */
export function PanelInlineEditor({ value, onChange, onBlur, placeholder, multiline = false, style }: { value: string; onChange: (v: string) => void; onBlur?: (v: string) => void; placeholder?: string; multiline?: boolean, style?: React.CSSProperties }) {
    const Component = multiline ? "textarea" : "input";

    return (
        <Component
            value={value}
            onChange={(e: any) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            rows={multiline ? 3 : undefined}
            style={{
                width: "100%",
                minHeight: multiline ? 60 : 34,
                padding: "8px 12px",
                fontSize: 12,
                lineHeight: 1.5,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid transparent`,
                borderRadius: 8,
                color: PANEL_COLORS.text,
                outline: "none",
                transition: "all 0.2s ease",
                cursor: "text",
                resize: multiline ? "vertical" : "none",
                ...style
            }}
            onMouseEnter={(e: any) => { if (document.activeElement !== e.currentTarget) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; } }}
            onMouseLeave={(e: any) => { if (document.activeElement !== e.currentTarget) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "transparent"; } }}
            onFocus={(e: any) => {
                e.currentTarget.style.background = "#000";
                e.currentTarget.style.borderColor = PANEL_COLORS.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99, 102, 241, 0.2)`;
            }}
            onBlur={(e: any) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.boxShadow = "none";
                onBlur?.(e.target.value);
            }}
        />
    );
}
// ─── TextInput With Unit Suffix ────────────────────────────────────────────────────────────────
export function TextInputWithUnit({ value = "", onChange, placeholder, style, type = "default" }: { value: string; onChange: (v: string) => void; placeholder?: string; style?: React.CSSProperties; type?: "width" | "height" | "default" }) {
    let units = [
        { label: "px", value: "px" },
        { label: "rem", value: "rem" },
        { label: "em", value: "em" },
        { label: "vh", value: "vh" },
        { label: "dvh", value: "dvh" },
        { label: "vw", value: "vw" },
        { label: "dvw", value: "dvw" },
        { label: "%", value: "%" },
    ];

    if (type === "width") {
        units = units.filter(u => u.value !== "vh" && u.value !== "dvh");
    } else if (type === "height") {
        units = units.filter(u => u.value !== "vw" && u.value !== "dvw");
    }

    // Robust parsing: extract leading number and whatever follows as unit
    const lastUnit = React.useRef("px");
    const match = String(value || "").match(/^([+-]?\d*\.?\d+)(.*)$/);

    let numValue = "";
    let unitValue = lastUnit.current;

    if (match) {
        numValue = match[1];
        unitValue = match[2] || lastUnit.current;
    } else if (value && units.some(u => u.value === value)) {
        // Value is just the unit (e.g. "px")
        numValue = "";
        unitValue = value;
    } else {
        numValue = value || "";
    }

    // Sync unit to ref for preservation when empty
    React.useEffect(() => {
        if (unitValue && units.some(u => u.value === unitValue)) {
            lastUnit.current = unitValue;
        }
    }, [unitValue]);

    const currentUnit = units.find(u => u.value === unitValue) ? unitValue : lastUnit.current;

    const handleNumChange = (v: string) => {
        const reg = /^-?\d*(\.\d*)?$/;
        if (reg.test(v) || v === '' || v === '-') {
            // Allow clearing the input fully
            if (v === "") {
                onChange("");
            } else {
                onChange(`${v}${currentUnit}`);
            }
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = PANEL_COLORS.border;
        if (numValue === "") {
            // Default to placeholder or 52 on blur if empty
            const fallbackStr = placeholder || "52";
            const fallbackMatch = fallbackStr.match(/^([+-]?\d*\.?\d+)/);
            const fallbackNum = fallbackMatch ? fallbackMatch[1] : "52";
            onChange(`${fallbackNum}${currentUnit}`);
        }
    };

    const handleUnitChange = (u: string) => {
        onChange(`${numValue}${u}`);
    };

    return (
        <div style={{ display: "flex", width: "100%", height: 30 }}>
            <Input
                value={numValue}
                placeholder={placeholder}
                style={{
                    height: 30, fontSize: 11, background: PANEL_COLORS.inputBg,
                    color: PANEL_COLORS.text, border: `1px solid ${PANEL_COLORS.inputBorder}`,
                    borderRight: "none", borderRadius: "6px 0 0 6px", flex: 1, ...style
                }}
                onChange={(e) => handleNumChange(e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = PANEL_COLORS.primary; e.target.style.background = "#09090b"; }}
                onBlur={(e) => { e.target.style.borderColor = PANEL_COLORS.inputBorder; e.target.style.background = PANEL_COLORS.inputBg; }}
            />
            <Select
                value={currentUnit}
                size="small"
                onChange={handleUnitChange}
                className="dark-select-theme"
                style={{
                    height: 30,
                    width: 65,
                    background: PANEL_COLORS.inputBg,
                    border: `1px solid ${PANEL_COLORS.inputBorder}`,
                    borderRadius: "0 6px 6px 0",
                }}
                dropdownStyle={{
                    background: "#18181b",
                    border: `1px solid ${PANEL_COLORS.inputBorder}`,
                }}
                options={units}
                suffixIcon={<ChevronDownIcon style={{ width: 10, height: 10, color: PANEL_COLORS.muted }} />}
            />
        </div>
    );
}

// ─── PrefixInput ────────────────────────────────────────────────────────────────
export function PrefixInput({ prefix, value, onChange, placeholder, style }: { prefix: string; value: string; onChange: (v: string) => void; placeholder?: string; style?: React.CSSProperties }) {
    return (
        <Space.Compact style={{ height: 30, width: "100%" }}>
            <div className="!h-7" style={{
                padding: "0 8px", background: "#111", border: `1px solid ${PANEL_COLORS.inputBorder}`,
                borderRight: "none", borderRadius: "6px 0 0 6px", color: PANEL_COLORS.muted,
                fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center"
            }}>
                {prefix}
            </div>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="!h-7"
                style={{
                    fontSize: 11, background: PANEL_COLORS.inputBg,
                    color: PANEL_COLORS.text, border: `1px solid ${PANEL_COLORS.inputBorder}`,
                    borderRadius: "0 6px 6px 0", ...style
                }}
                onFocus={(e) => { e.target.style.borderColor = PANEL_COLORS.primary; e.target.style.background = "#09090b"; }}
                onBlur={(e) => { e.target.style.borderColor = PANEL_COLORS.inputBorder; e.target.style.background = PANEL_COLORS.inputBg; }}
            />
        </Space.Compact>
    );
}

// ─── TextareaInput ────────────────────────────────────────────────────────────

export function TextareaInput({ value, onChange, onBlur, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; onBlur?: (v: string) => void; rows?: number; placeholder?: string }) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            spellCheck={false}
            style={{
                width: "100%", padding: "10px 12px", fontSize: 12,
                background: PANEL_COLORS.inputBg, border: `1px solid ${PANEL_COLORS.inputBorder}`,
                borderRadius: 8, color: PANEL_COLORS.text, outline: "none", resize: "vertical",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", lineHeight: 1.5
            }}
            onMouseEnter={(e) => { if (document.activeElement !== e.currentTarget) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = PANEL_COLORS.inputHoverBg; } }}
            onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) { e.currentTarget.style.borderColor = PANEL_COLORS.inputBorder; e.currentTarget.style.background = PANEL_COLORS.inputBg; } }}
            onFocus={(e) => {
                e.currentTarget.style.borderColor = PANEL_COLORS.primary;
                e.currentTarget.style.background = "#000";
                e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99, 102, 241, 0.2)`;
            }}
            onBlur={(e) => {
                e.currentTarget.style.background = PANEL_COLORS.inputBg;
                e.currentTarget.style.borderColor = PANEL_COLORS.inputBorder;
                e.currentTarget.style.boxShadow = "none";
                onBlur?.(e.target.value);
            }}
        />
    );
}

// ─── SelectInput ──────────────────────────────────────────────────────────────

export function SelectInput({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; placeholder?: string }) {
    const selectedOption = options.find((o) => o.value === value) || options[0];

    const menuItems = options.map((o) => ({
        key: o.value,
        label: (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                {o.label}
                {o.value === value && <CheckIcon style={{ width: 12, height: 12, color: PANEL_COLORS.primary }} />}
            </div>
        ),
        onClick: () => onChange(o.value),
        style: {
            padding: "6px 10px", fontSize: 11, color: PANEL_COLORS.text, borderRadius: 4, background: o.value === value ? "rgba(0,153,255,0.1)" : "transparent"
        }
    }));

    return (
        <Dropdown
            trigger={['click']}
            placement="bottomLeft"
            menu={{ items: menuItems, style: { background: "#18181b", border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 8, padding: 6, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" } }}
            getPopupContainer={() => document.body}
        >
            <button
                style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", height: 30,
                    padding: "0 10px", fontSize: 11, background: PANEL_COLORS.inputBg, border: `1px solid ${PANEL_COLORS.inputBorder}`,
                    borderRadius: 6, color: PANEL_COLORS.text, outline: "none", cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#52525b"; e.currentTarget.style.background = PANEL_COLORS.inputHoverBg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = PANEL_COLORS.inputBorder; e.currentTarget.style.background = PANEL_COLORS.inputBg; }}
            >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedOption?.label}</span>
                <ChevronDownIcon style={{ width: 12, height: 12, opacity: 0.5, flexShrink: 0 }} />
            </button>
        </Dropdown>
    );
}

// ─── LinkInput ────────────────────────────────────────────────────────────────

export function LinkInput({ value, onChange, placeholder = "URL (e.g. /about)" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    const { page } = useEditorStore();
    const routes = page?.routes || [];

    const handleRouteSelect = (path: string) => {
        onChange(path);
    };

    const items = [
        {
            key: 'routes-header',
            label: <span style={{ fontSize: 10, fontWeight: 700, color: PANEL_COLORS.muted, textTransform: "uppercase" }}>Internal Pages</span>,
            disabled: true,
        },
        ...routes.map(r => ({
            key: r.path,
            label: (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                    <span>{r.name}</span>
                    <span style={{ fontSize: 9, opacity: 0.5 }}>{r.path}</span>
                </div>
            ),
            onClick: () => handleRouteSelect(r.path)
        })),
        { type: 'divider' as const },
        {
            key: 'external-header',
            label: <span style={{ fontSize: 10, fontWeight: 700, color: PANEL_COLORS.muted, textTransform: "uppercase" }}>External</span>,
            disabled: true,
        },
        {
            key: 'manual',
            label: <span style={{ fontSize: 11 }}>External URL...</span>,
            onClick: () => {
                const url = window.prompt("Enter external URL:", "https://");
                if (url) onChange(url);
            }
        }
    ];

    return (
        <div style={{ display: "flex", gap: 4, width: "100%" }}>
            <TextInput
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{ flex: 1 }}
            />
            <Dropdown
                menu={{ items }}
                trigger={['click']}
                placement="bottomRight"
            >
                <button
                    style={{
                        width: 26,
                        height: 26,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: PANEL_COLORS.inputBg,
                        border: `1px solid ${PANEL_COLORS.inputBorder}`,
                        borderRadius: 4,
                        cursor: "pointer",
                        color: PANEL_COLORS.muted,
                        flexShrink: 0
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = PANEL_COLORS.inputHoverBg}
                    onMouseLeave={e => e.currentTarget.style.background = PANEL_COLORS.inputBg}
                >
                    <LinkIcon style={{ width: 14, height: 14 }} />
                </button>
            </Dropdown>
        </div>
    );
}


// ─── ShadowInput ──────────────────────────────────────────────────────────────

export const SHADOW_OPTIONS = [
    { label: "None", value: "none" },
    { label: "Subtle", value: "0 1px 4px #0000001a" },
    { label: "Soft", value: "0 4px 16px #0000001a" },
    { label: "Medium", value: "0 4px 24px #0000001a, 0 1px 6px #0000000f" },
    { label: "Elevated", value: "0 8px 32px #00000026, 0 2px 8px #0000001a" },
    { label: "Deep", value: "0 16px 48px #00000033, 0 4px 16px #00000026" },
    { label: "Glow Blue", value: "0 4px 32px #3b82f640, 0 1px 8px #3b82f626" },
    { label: "Glow Purple", value: "0 4px 32px #8b5cf640, 0 1px 8px #8b5cf626" }
];

export function ShadowInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <SelectInput
            value={value || "none"}
            onChange={onChange}
            options={SHADOW_OPTIONS}
        />
    );
}


// ─── BorderRadiusInput ────────────────────────────────────────────────────────

function parseRadius(val: string): [string, string, string, string] {
    const parts = (val || "0px").trim().split(/\s+/);
    if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
    if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
    if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
    return [parts[0], parts[1], parts[2], parts[3]];
}

function serializeRadius(tl: string, tr: string, br: string, bl: string): string {
    if (tl === tr && tr === br && br === bl) return tl;
    if (tl === br && tr === bl) return `${tl} ${tr}`;
    return `${tl} ${tr} ${br} ${bl}`;
}

const CornerIcon = ({ corner }: { corner: "tl" | "tr" | "br" | "bl" }) => {
    const D = 16; const r = 4; const pad = 2;
    const leftDots: [number, number][] = [[pad + 1, 2], [pad + 1, 5], [pad + 1, 8], [pad + 1, 11], [pad + 1, 14]];
    const rightDots: [number, number][] = [[D - pad - 1, 2], [D - pad - 1, 5], [D - pad - 1, 8], [D - pad - 1, 11], [D - pad - 1, 14]];
    const topDots: [number, number][] = [[3, pad], [6, pad], [9, pad], [12, pad]];
    const btmDots: [number, number][] = [[3, D - pad], [6, D - pad], [9, D - pad], [12, D - pad]];
    const showLeftDots = corner === "tr" || corner === "br";
    const showRightDots = corner === "tl" || corner === "bl";
    const showTopDots = corner === "br" || corner === "bl";
    const showBtmDots = corner === "tl" || corner === "tr";
    const arcs: Record<string, string> = {
        tl: `M${D - 1},${pad + 1} L${r + pad},${pad + 1} Q${pad},${pad} ${pad},${r + pad} L${pad},${D - 1}`,
        tr: `M${pad + 1},${pad + 1} L${D - r - pad},${pad + 1} Q${D - pad},${pad} ${D - pad},${r + pad} L${D - pad},${D - 1}`,
        br: `M${D - pad},${pad + 1} L${D - pad},${D - r - pad} Q${D - pad},${D - pad} ${D - r - pad},${D - pad} L${pad + 1},${D - pad}`,
        bl: `M${pad},${pad + 1} L${pad},${D - r - pad} Q${pad},${D - pad} ${r + pad},${D - pad} L${D - 1},${D - pad}`,
    };
    return (
        <svg width={D} height={D} viewBox={`0 0 ${D} ${D}`} fill="none">
            {showLeftDots && leftDots.map(([cx, cy], i) => <circle key={`l${i}`} cx={cx} cy={cy} r={0.9} fill="currentColor" opacity={0.35} />)}
            {showRightDots && rightDots.map(([cx, cy], i) => <circle key={`r${i}`} cx={cx} cy={cy} r={0.9} fill="currentColor" opacity={0.35} />)}
            {showTopDots && topDots.map(([cx, cy], i) => <circle key={`t${i}`} cx={cx} cy={cy} r={0.9} fill="currentColor" opacity={0.35} />)}
            {showBtmDots && btmDots.map(([cx, cy], i) => <circle key={`b${i}`} cx={cx} cy={cy} r={0.9} fill="currentColor" opacity={0.35} />)}
            <path d={arcs[corner]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
    );
};

export function BorderRadiusInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    const [tl, tr, br, bl] = parseRadius(value);
    const allEqual = tl === tr && tr === br && br === bl;
    const [linked, setLinked] = React.useState(allEqual);
    React.useEffect(() => { if (linked && !allEqual) setLinked(false); }, [value, linked, allEqual]);

    const setCorner = (corner: "tl" | "tr" | "br" | "bl", v: string) => {
        if (linked) { onChange(v); }
        else { const next = { tl, tr, br, bl, [corner]: v }; onChange(serializeRadius(next.tl, next.tr, next.br, next.bl)); }
    };

    const presets = ["0px", "8px", "16px", "24px", "28px", "36px", "40px", "48px", "56px", "64px", "999px"];
    const presetLabels = ["0", "8", "16", "24", "28", "36", "40", "48", "56", "64", "Full"];
    const corners: Array<{ key: "tl" | "tr" | "br" | "bl"; val: string }> = [
        { key: "tl", val: tl }, { key: "tr", val: tr }, { key: "bl", val: bl }, { key: "br", val: br },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {corners.map(({ key, val }) => (
                    <div key={key} style={{
                        display: "flex", alignItems: "center", gap: 6, background: PANEL_COLORS.inputBg,
                        border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 6, padding: "2px 8px"
                    }}>
                        <span style={{ color: PANEL_COLORS.muted, flexShrink: 0, display: "flex", lineHeight: 0 }}>
                            <CornerIcon corner={key} />
                        </span>
                        <input
                            value={val}
                            onChange={(e) => setCorner(key, e.target.value)}
                            onFocus={(e) => {
                                e.currentTarget.style.color = "#ffffff";
                                e.currentTarget.parentElement!.style.borderColor = PANEL_COLORS.primary;
                                e.currentTarget.parentElement!.style.background = "#09090b";
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.color = PANEL_COLORS.text;
                                e.currentTarget.parentElement!.style.borderColor = PANEL_COLORS.inputBorder;
                                e.currentTarget.parentElement!.style.background = PANEL_COLORS.inputBg;
                            }}
                            style={{ flex: 1, minWidth: 0, height: 20, fontSize: 10, fontFamily: "inherit", background: "transparent", border: "none", color: PANEL_COLORS.text, outline: "none", textAlign: "right", width: 40 }}
                        />
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", minWidth: 0 }}>
                <button
                    title={linked ? "Click to set corners independently" : "Click to link all corners"}
                    onClick={() => { const next = !linked; setLinked(next); if (next) onChange(tl); }}
                    style={{ height: 24, padding: "0 8px", display: "flex", alignItems: "center", gap: 4, background: linked ? "rgba(0,153,255,0.15)" : "#18181b", border: `1px solid ${linked ? "rgba(0,153,255,0.4)" : PANEL_COLORS.inputBorder}`, borderRadius: 4, cursor: "pointer", color: linked ? "#60a5fa" : PANEL_COLORS.muted, fontSize: 9, flexShrink: 0, transition: "all 0.15s" }}
                >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        {linked ? (<><path d="M3 5.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><rect x="0.75" y="3.25" width="3" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><rect x="7.25" y="3.25" width="3" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" /></>) : (<><rect x="0.75" y="3.25" width="3" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><rect x="7.25" y="3.25" width="3" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M4 5.5h1M6 5.5h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1 1" /></>)}
                    </svg>
                    {linked ? "Linked" : "Free"}
                </button>
                {presets.map((v, i) => (
                    <button key={v} onClick={() => { onChange(v); setLinked(true); }} title={v}
                        style={{ flex: 1, height: 24, fontSize: 9, padding: 0, background: value === v ? "rgba(0,153,255,0.15)" : "#18181b", border: `1px solid ${value === v ? "rgba(0,153,255,0.4)" : PANEL_COLORS.inputBorder}`, borderRadius: 4, cursor: "pointer", color: value === v ? "#60a5fa" : PANEL_COLORS.muted, transition: "all 0.15s" }}
                    >{presetLabels[i]}</button>
                ))}
            </div>
        </div>
    );
}

// ─── ColorInput ───────────────────────────────────────────────────────────────

function resolveColor(raw: string, theme?: any): string {
    if (!raw || typeof window === "undefined") return raw || "#000000";
    if (!raw.startsWith("var(")) return raw;
    const varName = raw.slice(4, -1).split(",")[0].trim();

    // First, try to resolve from the project theme object if provided
    if (theme?.colors) {
        const c = theme.colors;
        if (varName === "--primary") return c.primary;
        if (varName === "--secondary") return c.secondary;
        if (varName === "--background") return c.background;
        if (varName === "--surface") return c.surface;
        if (varName === "--text") return c.text;
        if (varName === "--text-muted") return c.textMuted || "#64748b";
        if (varName === "--border") return c.border;
        if (varName === "--button-text") return c.buttonText || "#ffffff";
        if (varName === "--accent") return c.accent || "#f59e0b";
    }

    // Fallback to computed style (global browser state)
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return resolved || "#000000";
}

function toHex(color: string, theme?: any): string {
    if (!color || typeof document === "undefined") return "#000000";
    if (color === "transparent" || color === "none") return "transparent";
    const resolved = resolveColor(color, theme);
    if (/^#[0-9a-fA-F]{6}$/.test(resolved)) return resolved;
    if (resolved === "transparent" || resolved === "none") return "transparent";
    const el = document.createElement("div");
    el.style.color = resolved;
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    document.body.removeChild(el);
    if (computed === "rgba(0, 0, 0, 0)" || computed === "transparent") return "transparent";
    const m = computed.match(/\d+/g);
    if (!m || m.length < 3) return "#000000";
    return "#" + m.slice(0, 3).map(n => Number(n).toString(16).padStart(2, "0")).join("");
}

// Test comment
// ─── Master AppColorPicker (DRY Source of Truth) ──────────────────────────
export function AppColorPicker({
    value,
    onChange,
    onChangeComplete,
    children,
    showText,
    ...props
}: {
    value: string;
    onChange: (color: any) => void;
    onChangeComplete?: (color: any) => void;
    children: React.ReactNode;
    showText?: any;
    [key: string]: any;
}) {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorBgElevated: '#171717',
                    colorBorder: '#262626',
                    zIndexPopupBase: 11000,
                }
            }}
        >
            {/* <ColorPicker
                value={value}
                onChange={onChange}
                onChangeComplete={onChangeComplete}
                showText={showText}
                presets={[
                    {
                        label: 'Brand Colors',
                        colors: ["#6366f1", "#0ea5e9", "#22c55e", "#eab308", "#f97316", "#ef4444", "#0099ff"],
                    },
                    {
                        label: 'Grayscale',
                        colors: ["#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#1e293b", "#0f172a", "#000000"],
                    },
                    {
                        label: 'Utilities',
                        colors: ["rgba(0,0,0,0)"],
                    }
                ]}
                {...props}
            >
                {children}
            </ColorPicker> */}
            <ColorPicker
                value={value}
                onChange={onChange}
                onChangeComplete={onChangeComplete}
                showText={showText}
                presets={[
                    {
                        label: 'Utilities',
                        colors: [
                            "rgba(0,0,0,0)", // transparent
                            "rgba(0,0,0,0.5)",
                            "rgba(255,255,255,0.5)"
                        ],
                    },
                    {
                        label: 'Brand Colors',
                        colors: [
                            "#6366f1", "#4f46e5", "#3b82f6", "#0ea5e9",
                            "#06b6d4", "#10b981", "#22c55e", "#84cc16",
                            "#eab308", "#f59e0b", "#f97316", "#ef4444",
                            "#ec4899", "#d946ef", "#a855f7", "#8b5cf6"
                        ],
                    },
                    {
                        label: 'Grayscale',
                        colors: [
                            "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0",
                            "#cbd5e1", "#94a3b8", "#64748b",
                            "#475569", "#1e293b", "#0f172a", "#000000"
                        ],
                    },
                    {
                        label: 'Soft Pastels',
                        colors: [
                            "#fbcfe8", "#fecaca", "#fde68a", "#bbf7d0",
                            "#a7f3d0", "#bfdbfe", "#c7d2fe", "#ddd6fe"
                        ],
                    },
                ]}
                {...props}
            >
                {children}
            </ColorPicker>
        </ConfigProvider>
    );
}

export function ColorInput({ value, onChange, onBlur, placeholder = "#ffffff", hideText = false }: { value: string; onChange: (v: string) => void; onBlur?: (v: string) => void; placeholder?: string; hideText?: boolean }) {
    const { page } = useEditorStore();
    const theme = page?.theme;
    const initialValue = value || placeholder;
    const resolvedDisplayValue = resolveColor(initialValue, theme);
    const isVariable = initialValue.startsWith("var(");

    return (
        <div style={{ display: "flex", gap: 4, width: "100%" }}>
            <AppColorPicker
                value={isVariable ? resolvedDisplayValue : initialValue}
                onChange={(color: any) => {
                    onChange(color.toRgbString());
                }}
                onChangeComplete={(color: any) => {
                    if (onBlur) onBlur(color.toRgbString());
                }}
                showText={hideText ? undefined : () => (
                    <span style={{ fontSize: 10, color: PANEL_COLORS.muted }}>
                        {toHex(initialValue)}
                    </span>
                )}
            >
                <button
                    style={{
                        display: "flex", gap: 10, alignItems: "center", flex: hideText ? "initial" : 1, height: 30, width: hideText ? 32 : "auto",
                        padding: hideText ? "0 7px" : "0 10px", fontSize: 11, background: PANEL_COLORS.inputBg,
                        border: `1px solid ${isVariable ? PANEL_COLORS.primary : PANEL_COLORS.inputBorder}`,
                        borderRadius: 6, color: PANEL_COLORS.text, outline: "none", cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#52525b"; e.currentTarget.style.background = PANEL_COLORS.inputHoverBg; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isVariable ? PANEL_COLORS.primary : PANEL_COLORS.inputBorder; e.currentTarget.style.background = PANEL_COLORS.inputBg; }}
                >
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: resolvedDisplayValue, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                    {!hideText && <span style={{ flex: 1, textAlign: "left", fontFamily: "monospace", fontSize: 11, opacity: 0.9, overflow: "hidden", textOverflow: "ellipsis" }}>{isVariable ? `${toHex(value, theme)} (Theme)` : (toHex(value, theme) === "transparent" ? "Transparent" : toHex(value, theme))}</span>}
                </button>
            </AppColorPicker>

            {!isVariable && !hideText && (
                <AppToolTip title="Reset to Theme Variable">
                    <button
                        onClick={() => {
                            // Smart guess: if white text -> var(--text), if dark bg -> var(--surface)
                            if (value.toLowerCase() === "#ffffff" || value.toLowerCase() === "#fff") {
                                onChange("var(--text)");
                            } else {
                                onChange("var(--primary)");
                            }
                        }}
                        style={{
                            width: 30, height: 30, display: "flex", alignItems: "center",
                            justifyContent: "center", background: PANEL_COLORS.inputBg,
                            border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 6,
                            cursor: "pointer", color: PANEL_COLORS.muted, transition: "all 0.2s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#52525b"; e.currentTarget.style.background = PANEL_COLORS.inputHoverBg; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = PANEL_COLORS.inputBorder; e.currentTarget.style.background = PANEL_COLORS.inputBg; }}
                    >
                        <ArrowPathIcon style={{ width: 16, height: 16 }} />
                    </button>
                </AppToolTip>
            )}
        </div>
    );
}

export function GradientInput({ value, onChange, onBlur }: { value: string; onChange: (v: string) => void; onBlur?: (v: string) => void }) {
    const gradients = [
        { name: "None", value: "" },
        { name: "Indigo Night", value: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
        { name: "Ocean Breeze", value: "linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)" },
        { name: "Sunset Glow", value: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)" },
        { name: "Midnight", value: "linear-gradient(135deg, #0f172a 0%, #334155 100%)" },
        { name: "Sweet Candy", value: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)" },
        { name: "Emerald", value: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
        { name: "Golden Hour", value: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" },
        { name: "Glass Dark", value: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)" },
        { name: "Neon Blue", value: "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)" },
    ];

    interface Stop { id: string; color: string; offset: number; }

    const parseStops = (val: string): { type: string, deg: number, stops: Stop[] } => {
        const typeMatch = val.match(/^(linear|radial|conic)-gradient/);
        const type = typeMatch ? typeMatch[1] : "linear";

        const degMatch = val.match(/(\d+)deg/);
        const deg = degMatch ? parseInt(degMatch[1]) : 135;

        // Match COLOR OFFSET%
        const stopsMatch = val.match(/((rgba?\(.*?\)|#[\da-fA-F]+|var\(.*?\))\s+(\d+)%)/g);
        if (stopsMatch) {
            return {
                type,
                deg,
                stops: stopsMatch.map((s, i) => {
                    const parts = s.match(/(.*)\s+(\d+)%/);
                    return { id: `stop-${i}`, color: parts![1].trim(), offset: parseInt(parts![2]) };
                })
            };
        }
        return { type: "linear", deg: 135, stops: [{ id: "s1", color: "#6366f1", offset: 0 }, { id: "s2", color: "#a855f7", offset: 100 }] };
    };

    const { type, deg, stops } = parseStops(value || gradients[1].value);

    const update = (newType: string, newDeg: number, newStops: Stop[]) => {
        const sorted = [...newStops].sort((a, b) => a.offset - b.offset);
        const stopsStr = sorted.map(s => `${s.color} ${s.offset}%`).join(", ");

        let newVal = "";
        if (newType === "linear") newVal = `linear-gradient(${newDeg}deg, ${stopsStr})`;
        else if (newType === "radial") newVal = `radial-gradient(circle at center, ${stopsStr})`;
        else if (newType === "conic") newVal = `conic-gradient(from ${newDeg}deg at center, ${stopsStr.replace(/%/g, 'deg')})`; // Conic uses deg or %? Actually it uses deg mostly, but CSS supports both. But for simplicity we map 0-100% to 0-360deg if needed, but CSS conic supports % too.

        // Fix for conic: conic-gradient(from 135deg at center, #6366f1 0%, #a855f7 100%) is valid.
        if (newType === "conic") newVal = `conic-gradient(from ${newDeg}deg at center, ${stopsStr})`;

        onChange(newVal);
    };

    const currentPreset = gradients.find(g => g.value === value);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", padding: "4px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Dropdown
                    menu={{
                        items: gradients.map(g => ({
                            key: g.name,
                            label: (
                                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
                                    <div style={{ width: 24, height: 24, borderRadius: 6, background: g.value || PANEL_COLORS.inputBg, border: "1px solid rgba(255,255,255,0.1)" }} />
                                    <span style={{ fontSize: 12 }}>{g.name}</span>
                                    {value === g.value && <CheckIcon style={{ width: 14, height: 14, marginLeft: "auto", color: PANEL_COLORS.primary }} />}
                                </div>
                            ),
                            onClick: () => { onChange(g.value); if (onBlur) onBlur(g.value); }
                        }))
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <button
                        style={{
                            display: "flex", gap: 10, alignItems: "center", height: 32, padding: "0 10px", fontSize: 11, background: PANEL_COLORS.inputBg,
                            border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 6, color: PANEL_COLORS.text, outline: "none", cursor: "pointer",
                            transition: "all 0.2s", flex: 1
                        }}
                    >
                        <div style={{ width: 18, height: 18, borderRadius: 4, background: value || PANEL_COLORS.inputBg, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                        <span style={{ flex: 1, textAlign: "left", fontSize: 11, opacity: 0.9 }}>{currentPreset ? currentPreset.name : `Custom ${type}`}</span>
                        <ChevronDownIcon style={{ width: 12, height: 12, opacity: 0.4 }} />
                    </button>
                </Dropdown>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Type Selection */}
                <div className="flex justify-between gap-4 items-center">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: PANEL_COLORS.muted, textTransform: "uppercase", fontWeight: 700 }}>Type</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <AppToolTip title="Reverse Stops">
                            <button
                                onClick={() => {
                                    const nS = [...stops].map(s => ({ ...s, offset: 100 - s.offset }));
                                    update(type, deg, nS);
                                }}
                                style={{ background: "none", border: "none", color: PANEL_COLORS.muted, cursor: "pointer", padding: 4, display: "flex", borderRadius: 4 }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                onMouseLeave={e => e.currentTarget.style.background = "none"}
                            >
                                <ArrowPathIcon style={{ width: 14, height: 14, transform: "rotate(90deg)" }} />
                            </button>
                        </AppToolTip>
                        <AppToolTip title="Shuffle Colors">
                            <button
                                onClick={() => {
                                    const colors = stops.map(s => s.color).sort(() => Math.random() - 0.5);
                                    const nS = stops.map((s, i) => ({ ...s, color: colors[i] }));
                                    update(type, deg, nS);
                                }}
                                style={{ background: "none", border: "none", color: PANEL_COLORS.muted, cursor: "pointer", padding: 4, display: "flex", borderRadius: 4 }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                onMouseLeave={e => e.currentTarget.style.background = "none"}
                            >
                                <ArrowPathIcon style={{ width: 14, height: 14 }} />
                            </button>
                        </AppToolTip>
                    </div>
                </div>
                <div className="border-y border-white/5 ">
                    <PillSegmented
                        value={type}
                        onChange={(v) => update(v, deg, stops)}
                        options={[
                            { label: "Linear", value: "linear" },
                            { label: "Radial", value: "radial" },
                            { label: "Angular", value: "conic" },
                        ]}
                        size="small"
                    />
                </div>
                {/* Visual Gradient Bar */}
                <div style={{ height: 24, width: "100%", borderRadius: 6, background: value || "transparent", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 4 }} />

                {/* Stops List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: PANEL_COLORS.muted, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Stops</span>
                        <button
                            onClick={() => update(type, deg, [...stops, { id: `stop-${Date.now()}`, color: "#ffffff", offset: 50 }])}
                            style={{ background: "none", border: "none", color: PANEL_COLORS.primary, cursor: "pointer", fontSize: 10, fontWeight: 700 }}
                        >
                            + Add Stop
                        </button>
                    </div>

                    {/* Sorted stops list */}
                    {[...stops].sort((a, b) => a.offset - b.offset).map((s) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", padding: "6px 8px", borderRadius: 6 }}>
                            <ColorInput
                                value={s.color}
                                onChange={(v) => {
                                    const nS = stops.map(st => st.id === s.id ? { ...st, color: v } : st);
                                    update(type, deg, nS);
                                }}
                                hideText
                            />
                            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
                                <input
                                    type="number"
                                    value={s.offset}
                                    min={0} max={100}
                                    onChange={(e) => {
                                        const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                        const nS = stops.map(st => st.id === s.id ? { ...st, offset: val } : st);
                                        update(type, deg, nS);
                                    }}
                                    style={{ width: 40, background: "none", border: "none", color: "#fff", fontSize: 11, textAlign: "right", outline: "none" }}
                                />
                                <span style={{ fontSize: 10, opacity: 0.4 }}>%</span>
                                <SliderInput
                                    value={s.offset}
                                    onChange={(v) => {
                                        const nS = stops.map(st => st.id === s.id ? { ...st, offset: v } : st);
                                        update(type, deg, nS);
                                    }}
                                />
                            </div>
                            {stops.length > 2 && (
                                <button
                                    onClick={() => update(type, deg, stops.filter(st => st.id !== s.id))}
                                    style={{ background: "none", border: "none", color: "#ef4444", opacity: 0.6, cursor: "pointer", padding: 4 }}
                                >
                                    <TrashIcon style={{ width: 14, height: 14 }} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Angle */}
                <div style={{ marginTop: 4, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: PANEL_COLORS.muted, textTransform: "uppercase", fontWeight: 700 }}>Angle</span>
                        <span style={{ fontSize: 10, color: PANEL_COLORS.primary }}>{deg}°</span>
                    </div>
                    <SliderInput value={deg} min={0} max={360} onChange={(v) => update(type, v, stops)} />
                </div>
            </div>
        </div>
    );
}
export function UnifiedBackgroundInput({
    bgColor,
    bgGradient,
    onChangeColor,
    onChangeGradient
}: {
    bgColor: string;
    bgGradient: string;
    onChangeColor: (v: string) => void;
    onChangeGradient: (v: string) => void;
}) {
    const [mode, setMode] = React.useState<"solid" | "gradient">(bgGradient ? "gradient" : "solid");

    // Sync mode if props change externally
    React.useEffect(() => {
        if (bgGradient && mode !== "gradient") setMode("gradient");
        else if (!bgGradient && mode !== "solid") setMode("solid");
    }, [bgGradient]);

    return (
        <div className="flex flex-col g-2 w-full">
            <PillSegmented
                value={mode}
                onChange={(v: any) => {
                    setMode(v);
                    if (v === "solid") {
                        onChangeGradient("");
                    }
                }}
                block
                size="small"
                options={[
                    { label: "Solid", value: "solid" },
                    { label: "Gradient", value: "gradient" },
                ]}
            />
            <div className="mt-2" style={{ minHeight: 32, }}>
                {mode === "solid" ? (
                    <ColorInput
                        value={bgColor || "transparent"}
                        onChange={onChangeColor}
                        onBlur={(v) => onChangeColor(v)}
                    />
                ) : (
                    <GradientInput
                        value={bgGradient || ""}
                        onChange={onChangeGradient}
                        onBlur={(v) => onChangeGradient(v)}
                    />
                )}
            </div>
        </div>
    );
}
// ─── ToggleInput ──────────────────────────────────────────────────────────────
export function ToggleInput({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
    const control = (
        <PillSegmented
            value={value ? "yes" : "no"}
            onChange={(v) => onChange(v === "yes")}
            block
            size="small"
            options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
            ]}
        />
    );
    if (label) {
        return (
            <div className="flex flex-col gap-2 mb-2">
                <span style={{ fontSize: 11, fontWeight: 500, color: PANEL_COLORS.text }}>{label}</span>
                {control}
            </div>
        );
    }
    return control;
}

// ─── ToggleSwitch ──────────────────────────────────────────────────────────────
export function ToggleSwitch({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
    const control = (
        <div className="flex items-center gap-2">
            <Switch
                checked={value}
                onChange={(v) => onChange(v)}
                size="small"
                style={{
                    backgroundColor: value ? "#3b82f6" : "rgba(255,255,255,0.1)",
                    boxShadow: value ? "0 0 6px rgba(59, 130, 246, 0.4)" : "none",
                    height: "16px",
                    minWidth: "28px"
                }}
            />
            <span
                style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    minWidth: "20px",
                    color: value ? "#60a5fa" : "#64748b",
                    transition: "all 0.2s"
                }}
            >
                {value ? "Yes" : "No"}
            </span>
        </div>
    );

    if (label) {
        return (
            <div className="flex items-center justify-between gap-2" style={{ width: "100%" }}>
                {label && <span style={{ fontSize: "11px", fontWeight: 500, color: "#94a3b8", whiteSpace: "nowrap" }}>{label}</span>}
                {control}
            </div>
        );
    }
    return control;
}

export function VideoPlaybackOptions({
    autoPlay, onChangeAutoPlay,
    loop, onChangeLoop,
    muted, onChangeMuted,
    controls, onChangeControls,
    title = "Playback Options",
}: {
    autoPlay: boolean; onChangeAutoPlay: (v: boolean) => void;
    loop: boolean; onChangeLoop: (v: boolean) => void;
    muted: boolean; onChangeMuted: (v: boolean) => void;
    controls?: boolean; onChangeControls?: (v: boolean) => void;
    title?: string;
}) {
    return (
        <div style={{ marginTop: 12 }}>
            <div style={{
                fontSize: 10,
                fontWeight: 800,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 8,
                paddingLeft: 4
            }}>
                {title}
            </div>
            <div className="border border-white/5 overflow-hidden rounded-md bg-neutral-800">
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {/* AutoPlay & Muted Row */}
                    <div className="flex border-b border-white/5">
                        <div className="flex-1 p-3 border-r border-white/5">
                            <ToggleSwitch label="AutoPlay" value={autoPlay} onChange={onChangeAutoPlay} />
                        </div>
                        <div className="flex-1 p-3">
                            <ToggleSwitch label="Muted" value={muted} onChange={onChangeMuted} />
                        </div>
                    </div>

                    {/* Loop & Optional Controls Row */}
                    <div className="flex">
                        <div className="flex-1 p-3 border-r border-white/5">
                            <ToggleSwitch label="Loop" value={loop} onChange={onChangeLoop} />
                        </div>
                        {onChangeControls !== undefined && (
                            <div className="flex-1 p-3">
                                <ToggleSwitch label="Controls" value={!!controls} onChange={onChangeControls} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── AspectPicker ─────────────────────────────────────────────────────────────
export function AspectPicker({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
    return (
        <div className="grid grid-cols-3 gap-2.5 mt-2">
            {options.map((opt) => {
                const isActive = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 4px",
                            borderRadius: "10px",
                            backgroundColor: isActive ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.02)",
                            border: `1.5px solid ${isActive ? "#3b82f6" : "rgba(255,255,255,0.06)"}`,
                            boxShadow: isActive ? "0 0 10px rgba(59, 130, 246, 0.2)" : "none",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer"
                        }}
                    >
                        <div style={{
                            width: "32px",
                            height: "24px",
                            borderRadius: "4px",
                            backgroundColor: isActive ? "#3b82f6" : "rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: isActive ? 1 : 0.7
                        }}>
                            <div style={{
                                width: opt.value === "1/1" ? "14px" : (opt.value === "21/9" ? "22px" : "18px"),
                                height: opt.value === "1/1" ? "14px" : (opt.value === "21/9" ? "10px" : "12px"),
                                border: `1.5px solid ${isActive ? "white" : "rgba(255,255,255,0.8)"}`,
                                borderRadius: "2px"
                            }} />
                        </div>
                        <span style={{
                            fontSize: "10px",
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? "#60a5fa" : "#94a3b8"
                        }}>{opt.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

// ─── SliderInput ──────────────────────────────────────────────────────────────
export function SliderInput({ value, onChange, min = 0, max = 100, step = 1, unit = "" }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", height: 30 }}>
            <style>{`
                .ag-slider-input::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    background: #3b82f6;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid #fff;
                    box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
                    transition: all 0.2s;
                }
                .ag-slider-input::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                }
                .ag-slider-input::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    background: ${PANEL_COLORS.primary};
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid #fff;
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
                }
            `}</style>
            <input
                type="range"
                className="ag-slider-input"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{
                    flex: 1,
                    height: 4,
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    borderRadius: 2,
                    appearance: "none",
                    outline: "none",
                    cursor: "pointer",
                }}
            />
            <div style={{
                minWidth: 45,
                fontSize: 10,
                fontWeight: 700,
                color: PANEL_COLORS.text,
                textAlign: "right",
                fontFamily: "monospace",
                background: PANEL_COLORS.inputBg,
                padding: "2px 6px",
                borderRadius: 4,
                border: `1px solid ${PANEL_COLORS.inputBorder}`
            }}>
                {value}{unit}
            </div>
        </div>
    );
}

// ─── AlignmentInput ──────────────────────────────────────────────────────────

const ALIGN_ICONS: Record<string, React.ReactNode> = {
    left: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="6" x2="3" y2="6" /><line x1="15" y1="12" x2="3" y2="12" /><line x1="17" y1="18" x2="3" y2="18" />
        </svg>
    ),
    center: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="18" y1="18" x2="6" y2="18" />
        </svg>
    ),
    right: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="9" y2="12" /><line x1="21" y1="18" x2="7" y2="18" />
        </svg>
    ),
    justify: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="21" y1="18" x2="3" y2="18" />
        </svg>
    ),
    top: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 3h16" /><path d="M8 21V7" /><path d="M12 21V7" /><path d="M16 21V7" />
        </svg>
    ),
    middle: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18" /><path d="M8 3v18" /><path d="M12 3v18" /><path d="M16 3v18" />
        </svg>
    ),
    bottom: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21h16" /><path d="M8 3v14" /><path d="M12 3v14" /><path d="M16 3v14" />
        </svg>
    ),
    stretch: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 3h16M4 21h16M8 3v18M12 3v18M16 3v18" />
        </svg>
    ),
    "flex-start": (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 3h16" /><path d="M8 21V7" /><path d="M12 21V7" /><path d="M16 21V7" />
        </svg>
    ),
    "flex-end": (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21h16" /><path d="M8 3v14" /><path d="M12 3v14" /><path d="M16 3v14" />
        </svg>
    )
};

export function AlignmentInput({ value, onChange, label, type = "horizontal", options }: { value: string; onChange: (v: string) => void; label?: string; type?: "horizontal" | "vertical" | "flex-vertical"; options?: { label: string; value: string }[] }) {
    const defaultOptions = type === "horizontal"
        ? [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]
        : type === "vertical"
            ? [{ label: "Top", value: "top" }, { label: "Middle", value: "middle" }, { label: "Bottom", value: "bottom" }]
            : [{ label: "Top", value: "flex-start" }, { label: "Center", value: "center" }, { label: "Bottom", value: "flex-end" }, { label: "Stretch", value: "stretch" }];

    const items = (options || defaultOptions).map(opt => ({
        label: (
            <AppToolTip title={opt.label}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", padding: "2px 0" }}>
                    {ALIGN_ICONS[opt.value] || opt.label}
                </div>
            </AppToolTip>
        ),
        value: opt.value
    }));

    return (
        <Field label={label || (type === "horizontal" ? "Alignment" : "Vertical Align")}>
            <div style={{ width: "100%" }}>
                <PillSegmented
                    value={items.some(i => i.value === value) ? value : items[1]?.value}
                    onChange={onChange}
                    options={items}
                    block
                    size="small"
                />
            </div>
        </Field>
    );
}

export function DirectionInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
    const options = [
        { label: "Right", value: "to right", icon: "→" },
        { label: "Bottom", value: "to bottom", icon: "↓" },
        { label: "Left", value: "to left", icon: "←" },
        { label: "Top Right", value: "to top right", icon: "↗" },
        { label: "Bottom Right", value: "to bottom right", icon: "↘" },
    ];

    return (
        <Field label={label || "Direction"}>
            <div style={{ width: "100%" }}>
                <PillSegmented
                    value={options.some(o => o.value === value) ? value : "to right"}
                    onChange={onChange}
                    options={options.map(o => ({
                        label: <span style={{ fontSize: 14, fontWeight: 700 }}>{o.icon}</span>,
                        value: o.value,
                        title: o.label
                    }))}
                    block
                    size="small"
                />
            </div>
        </Field>
    );
}

// ─── PaddingInput ─────────────────────────────────────────────────────────────

export function PaddingInput({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label?: string; placeholder?: string }) {
    const options = [
        { label: "None", value: "0px" },
        { label: "Tight (8px)", value: "0.5rem" },
        { label: "Compact (12px 16px)", value: "0.75rem 1rem" },
        { label: "Small (16px 20px)", value: "1rem 1.25rem" },
        { label: "Regular (24px)", value: "1.5rem" },
        { label: "Spacious (2rem 1.75rem)", value: "2rem 1.75rem" },
        { label: "Large (3rem 2rem)", value: "3rem 2rem" },
        { label: "Huge (4rem 2.5rem)", value: "4rem 2.5rem" }
    ];

    // Handle initial/empty state by finding the closest match or defaulting to Regular
    const currentVal = value || "0px";
    const hasPreset = options.some(opt => opt.value === currentVal);

    return (
        <Field label={label || "Padding"}>
            <SelectInput
                value={hasPreset ? currentVal : options[4].value}
                onChange={onChange}
                options={options}
                placeholder={placeholder}
            />
        </Field>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function Section({ title, children, focusKeys = [] }: { title: string; children: React.ReactNode, focusKeys?: (string | number)[] }) {
    const { subItemFocus, selectedBlockId } = useEditorStore();

    // Smart auto-focus matching for common patterns
    const autoFocusKeys = [...focusKeys];
    if (title.toLowerCase() === "content") autoFocusKeys.push("title", "subtitle");
    if (title.toLowerCase().includes("items") || title.toLowerCase().includes("members")) {
        // Auto-match indices 0-15 for list sections
        for (let i = 0; i < 16; i++) autoFocusKeys.push(i);
    }

    const isFocused = subItemFocus?.blockId === selectedBlockId && (
        subItemFocus?.index === title ||
        autoFocusKeys.includes(subItemFocus?.index as any)
    );
    const [isFlashing, setIsFlashing] = React.useState(false);

    const containerRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (isFocused) {
            setIsFlashing(true);
            const timer = setTimeout(() => setIsFlashing(false), 2500);
            if (containerRef.current) {
                containerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return () => clearTimeout(timer);
        }
    }, [isFocused, title]);

    // Generate a clean ID for scrolling
    const sectionId = `section-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;

    return (
        <div
            id={sectionId}
            ref={containerRef}
            style={{
                border: isFocused ? `1px solid ${PANEL_COLORS.primary}` : `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 12,
                margin: "14px 16px",
                padding: "16px 20px",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                background: isFlashing ? "rgba(99, 102, 241, 0.2)" : isFocused ? "rgba(99, 102, 241, 0.12)" : "rgba(255,255,255,0.03)",
                backdropFilter: isFocused ? "blur(8px)" : "none",
                position: "relative",
                boxShadow: isFocused
                    ? `0 8px 32px rgba(99, 102, 241, 0.2), inset 0 0 0 1px rgba(255,255,255,0.05)`
                    : "0 4px 12px rgba(0,0,0,0.25)"
            }}
        >
            <style>{`
                @keyframes section-flash {
                    0% { background: rgba(99, 102, 241, 0.3); }
                    100% { background: rgba(99, 102, 241, 0.05); }
                }
                .section-focused-flash {
                    animation: section-flash 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
            `}</style>
            <div className={isFlashing ? "section-focused-flash" : ""} style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 10 }} />

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: "1px solid rgba(255,255,255,0.03)"
            }}>
                <p id={sectionId + "-heading"} style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: isFocused ? PANEL_COLORS.primary : PANEL_COLORS.text,
                    opacity: 1,
                    transition: "all 0.3s"
                }}>{title}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {(title === "Typography" || title === "Wave Decoration") && (
                        <Tooltip title={`Open Floating ${title} Editor`}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectedBlockId) {
                                        useEditorStore.getState().focusSubItem(selectedBlockId, title);
                                    }
                                }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    padding: 0,
                                    cursor: "pointer",
                                    color: PANEL_COLORS.muted,
                                    opacity: 0.4,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
                            >
                                <ArrowTopRightOnSquareIcon style={{ width: 12, height: 12 }} />
                            </button>
                        </Tooltip>
                    )}
                    <div style={{ color: PANEL_COLORS.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, opacity: 0.3 }}>
                        <PlusIcon style={{ width: 12, height: 12 }} />
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
}

// ─── Reorderable List Primitives ───────────────────────────────────────────

export function SortableList<T extends { id: string }>({
    items,
    onReorder,
    onUpdate,
    onDelete,
    renderItemContent,
    containerClassName = "",
    strategy = verticalListSortingStrategy
}: {
    items: T[],
    onReorder: (activeId: string, overId: string) => void,
    onUpdate?: (idx: number, data: Partial<T>) => void,
    onDelete?: (idx: number) => void,
    renderItemContent: (item: T, index: number) => React.ReactNode,
    containerClassName?: string,
    strategy?: any
}) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            onReorder(active.id as string, over.id as string);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(l => l.id)} strategy={strategy}>
                <div
                    className={containerClassName}
                    style={{
                        display: !containerClassName ? "flex" : undefined,
                        flexDirection: !containerClassName ? "column" : undefined,
                        gap: !containerClassName ? 8 : undefined
                    }}
                >
                    {items.map((item, idx) => (
                        <SortableItem
                            key={item.id}
                            id={item.id}
                            index={idx}
                            onDelete={onDelete ? () => onDelete(idx) : undefined}
                        >
                            {renderItemContent(item, idx)}
                        </SortableItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function SortableItem({ id, index, children, onDelete }: { id: string, index: number, children: React.ReactNode, onDelete?: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : 1, position: "relative" as any, opacity: isDragging ? 0.6 : 1 };

    return (
        <div ref={setNodeRef} style={{
            ...style,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "8px",
            background: isDragging ? "rgba(255,255,255,0.05)" : "#0a0a0a",
            border: isDragging ? "1px solid var(--primary)" : `1px solid ${PANEL_COLORS.border}`,
            borderRadius: 12,
            boxShadow: isDragging ? "0 20px 40px rgba(0,0,0,0.4)" : "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            backdropFilter: isDragging ? "blur(8px)" : "none",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <div {...attributes} {...listeners} style={{ cursor: "grab", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "2px" }} title="Drag to reorder">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="5" r="2" />
                        <circle cx="9" cy="12" r="2" />
                        <circle cx="9" cy="19" r="2" />
                        <circle cx="15" cy="5" r="2" />
                        <circle cx="15" cy="12" r="2" />
                        <circle cx="15" cy="19" r="2" />
                    </svg>
                </div>
                {onDelete && (
                    <button
                        onClick={onDelete}
                        style={{
                            background: "rgba(239,68,68,0.05)",
                            border: "1px solid rgba(239,68,68,0.1)",
                            color: "#ef4444",
                            cursor: "pointer",
                            padding: "6px",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                            opacity: 0.8
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.opacity = "0.8";
                            e.currentTarget.style.background = "rgba(239,68,68,0.05)";
                            e.currentTarget.style.borderColor = "rgba(239,68,68,0.1)";
                        }}
                    >
                        <TrashIcon style={{ width: 14, height: 14 }} />
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

// ─── Property Groups ─────────────────────────────────────────────────────────

export interface PropertyGroupProps {
    p: any;
    up: (key: string, val: any, commit?: boolean) => void;
    prefix?: string;
}

/**
 * TypographyFields - Unified component for text editing.
 * Used in both the sidebar and floating quick editors.
 */
export function TypographyFields({
    p, up,
    prefix = "",
    showSubtitle = true,
    variant = "standard"
}: PropertyGroupProps & {
    showSubtitle?: boolean;
    variant?: "standard" | "quick";
}) {
    // Helper to resolve keys based on prefix and common patterns
    const getK = (base: string) => {
        if (!prefix) {
            if (base === "color" && p.textColor !== undefined) return "textColor";
            if (base === "fontSize" && p.size !== undefined) return "size";
            return base;
        }
        // Prefixed logic (e.g. title -> titleColor, titleSize, titleWeight)
        const camel = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        if (base === "color") return p[`${prefix}Color`] !== undefined ? `${prefix}Color` : (p[`${prefix}TextColor`] !== undefined ? `${prefix}TextColor` : "color");
        if (base === "fontSize") return p[`${prefix}Size`] !== undefined ? `${prefix}Size` : "fontSize";
        if (base === "fontWeight") return p[`${prefix}Weight`] !== undefined ? `${prefix}Weight` : "fontWeight";
        return `${prefix}${base.charAt(0).toUpperCase() + base.slice(1)}`;
    };

    // ─── Quick Variant (Popover) ─────────────────────────────────────────────
    if (variant === "quick") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {!prefix && p.content !== undefined && (
                    <Field label="Content">
                        <PanelInlineEditor
                            multiline
                            value={p.content || ""}
                            onChange={(v) => up("content", v)}
                        />
                    </Field>
                )}

                {/* Section Level Sizes (Responsive) */}
                {(p.titleSize !== undefined || p.subtitleSize !== undefined || p.descSize !== undefined) && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {p.titleSize !== undefined && (
                            <Field label="Title Size">
                                <TextInputWithUnit value={p.titleSize || ""} onChange={(v) => up("titleSize", v)} placeholder="2.5rem" />
                            </Field>
                        )}
                        {p.subtitleSize !== undefined && (
                            <Field label="Subtitle Size">
                                <TextInputWithUnit value={p.subtitleSize || ""} onChange={(v) => up("subtitleSize", v)} placeholder="1.2rem" />
                            </Field>
                        )}
                        {p.descSize !== undefined && (
                            <Field label="Desc Size">
                                <TextInputWithUnit value={p.descSize || ""} onChange={(v) => up("descSize", v)} placeholder="0.9rem" />
                            </Field>
                        )}
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Field label="Color">
                        <ColorInput
                            value={p[getK("color")] || "inherit"}
                            onChange={(v) => up(getK("color"), v)}
                            onBlur={(v) => up(getK("color"), v, true)}
                            hideText
                        />
                    </Field>
                    <Field label="Font Size">
                        <TextInputWithUnit
                            value={p[getK("fontSize")] || ""}
                            onChange={(v) => up(getK("fontSize"), v)}
                            placeholder="16px"
                        />
                    </Field>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Field label="Weight">
                        <SelectInput
                            value={String(p[getK("fontWeight")] || "400")}
                            onChange={(v) => up(getK("fontWeight"), v)}
                            options={[
                                { label: "Regular", value: "400" },
                                { label: "Medium", value: "500" },
                                { label: "SemiBold", value: "600" },
                                { label: "Bold", value: "700" },
                                { label: "Black", value: "900" }
                            ]}
                        />
                    </Field>
                    <Field label="Alignment">
                        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "2px" }}>
                            <AlignmentInput
                                value={(p[getK("align")] as string) || "left"}
                                onChange={(v) => up(getK("align"), v)}
                            />
                        </div>
                    </Field>
                </div>
            </div>
        );
    }

    // ─── Standard Variant (Sidebar) ──────────────────────────────────────────

    // Resolve keys for title/subtitle with backward compatibility
    const titleKey = (p.titleText !== undefined) ? "titleText" : "title";
    const subtitleKey = (p.subtitleText !== undefined) ? "subtitleText" : "subtitle";

    // If we have a 'title' or 'subtitle' prop explicitly, or we're using a prefix
    const hasTitle = !prefix && p[titleKey] !== undefined;
    const hasSubtitle = !prefix && p[subtitleKey] !== undefined;
    const showContent = prefix === "title" || prefix === "subtitle" || (!prefix && p.content !== undefined);
    return (
        <>
            {showContent && (
                <Field label={prefix ? (prefix.charAt(0).toUpperCase() + prefix.slice(1)) : "Content"}>
                    <PanelInlineEditor
                        multiline={prefix === "subtitle" || !prefix}
                        value={p[prefix || "content"] || ""}
                        onChange={(v) => up(prefix || "content", v)}
                    />
                </Field>
            )}

            {hasTitle && (
                <Field label="Title">
                    <PanelInlineEditor
                        value={String(p[titleKey] || "")}
                        onChange={(v) => up(titleKey, v)}
                    />
                </Field>
            )}

            {hasSubtitle && showSubtitle && (
                <Field label="Subtitle">
                    <PanelInlineEditor
                        multiline
                        value={String(p[subtitleKey] || "")}
                        onChange={(v) => up(subtitleKey, v)}
                    />
                </Field>
            )}

            {p[getK("align")] !== undefined && <AlignmentInput value={(p[getK("align")] as string) || "left"} onChange={(v) => up(getK("align"), v)} />}

            <Field label={`${prefix ? (prefix.charAt(0).toUpperCase() + prefix.slice(1) + " ") : ""}Color`}>
                <ColorInput
                    value={(p[getK("color")] || "#0f172a") as string}
                    onChange={(v) => up(getK("color"), v)}
                    onBlur={(v) => up(getK("color"), v, true)}
                />
            </Field>

            {p[getK("fontSize")] !== undefined && (
                <Field label={`${prefix ? (prefix.charAt(0).toUpperCase() + prefix.slice(1) + " ") : ""}Size`}>
                    <TextInputWithUnit value={p[getK("fontSize")] || ""} onChange={(v) => up(getK("fontSize"), v)} placeholder="1rem" />
                </Field>
            )}

            {/* Responsive Sizes (Section Level) */}
            {p.titleSize !== undefined && <Field label="Title Size"><TextInputWithUnit value={p.titleSize || ""} onChange={(v) => up("titleSize", v)} placeholder="2.5rem" /></Field>}
            {p.subtitleSize !== undefined && <Field label="Subtitle Size"><TextInputWithUnit value={p.subtitleSize || ""} onChange={(v) => up("subtitleSize", v)} placeholder="1.25rem" /></Field>}
            {p.descSize !== undefined && <Field label="Desc Size"><TextInputWithUnit value={p.descSize || ""} onChange={(v) => up("descSize", v)} placeholder="0.9rem" /></Field>}

            {p[getK("fontWeight")] !== undefined && (
                <Field label={`${prefix ? (prefix.charAt(0).toUpperCase() + prefix.slice(1) + " ") : ""}Weight`}>
                    <SelectInput
                        value={String(p[getK("fontWeight")] || "400")}
                        onChange={(v) => up(getK("fontWeight"), v)}
                        options={[
                            { label: "Thin (100)", value: "100" },
                            { label: "Light (300)", value: "300" },
                            { label: "Regular (400)", value: "400" },
                            { label: "Medium (500)", value: "500" },
                            { label: "Semibold (600)", value: "600" },
                            { label: "Bold (700)", value: "700" },
                            { label: "Extrabold (800)", value: "800" },
                            { label: "Black (900)", value: "900" }
                        ]}
                    />
                </Field>
            )}

            {p[getK("bold")] !== undefined && (
                <Field label={`${prefix ? (prefix.charAt(0).toUpperCase() + prefix.slice(1) + " ") : ""}Style`}>
                    <div className="w-full" style={{ display: "flex", gap: 6 }}>
                        {[["B", "bold", "Bold"], ["I", "italic", "Italic"], ["U", "underline", "Underline"], ["S", "strikethrough", "Strikethrough"]].map(([label, key, title]) => {
                            const fullKey = getK(key);
                            return (
                                <button key={key} title={title} onClick={() => up(fullKey, !p[fullKey])} style={{ flex: 1, padding: "5px 0", fontSize: 13, fontWeight: label === "B" ? 800 : 400, fontStyle: label === "I" ? "italic" : "normal", textDecoration: label === "U" ? "underline" : label === "S" ? "line-through" : "none", background: p[fullKey] ? "#ff0000" : "#2a2a2a", color: p[fullKey] ? "#fff" : "#aaa", border: "none", borderRadius: 4, cursor: "pointer", transition: "all 0.15s" }}>{label}</button>
                            );
                        })}
                    </div>
                </Field>
            )}

            {p[getK("lineHeight")] !== undefined && <Field label="Line Height"><TextInputWithUnit value={(p[getK("lineHeight")] as string) ?? ""} onChange={(v) => up(getK("lineHeight"), v)} placeholder="1.6" /></Field>}
            {p[getK("letterSpacing")] !== undefined && <Field label="Letter Spacing"><TextInputWithUnit value={(p[getK("letterSpacing")] as string) ?? ""} onChange={(v) => up(getK("letterSpacing"), v)} placeholder="0em" /></Field>}
        </>
    );
}


export function LayoutFields({ p, up, options = {} }: PropertyGroupProps & { options?: { layouts?: { label: string, value: string }[], showCols?: boolean, showGap?: boolean, showAlign?: boolean } }) {
    const { layouts, showCols = true, showGap = true, showAlign = true } = options;
    return (
        <>
            {layouts && <Field label="Layout"><SelectInput value={p.layout || layouts[0].value} onChange={(v) => up("layout", v)} options={layouts} /></Field>}
            {showCols && p.layout !== "strip" && <Field label="Columns"><SelectInput value={String(p.columns || "3")} onChange={(v) => up("columns", Number(v))} options={[{ label: "1 Column", value: "1" }, { label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" }, { label: "5 Columns", value: "5" }, { label: "6 Columns", value: "6" }]} /></Field>}
            {showGap && <Field label="Gap"><TextInputWithUnit value={p.gap || ""} onChange={(v) => up("gap", v)} placeholder="2" /></Field>}
            {showAlign && <AlignmentInput value={(p.align as string) || "center"} onChange={(v) => up("align", v)} />}
        </>
    );
}

export function IconFields({ p, up, prefix = "" }: PropertyGroupProps) {
    const getK = (suffix: string) => {
        if (!prefix) return suffix;
        return `${prefix}${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`;
    };

    return (
        <>
            <Field label="Icon Size">
                <TextInputWithUnit
                    value={String(p[getK("iconSize")] ?? "")}
                    placeholder="24"
                    onChange={(v) => up(getK("iconSize"), v)}
                />
            </Field>
            <Field label="Icon Color">
                <ColorInput
                    value={(p[getK("iconColor")] as string) || ""}
                    placeholder="var(--primary)"
                    onChange={(v) => up(getK("iconColor"), v, true)}
                />
            </Field>
            <Field label="Wrapper Size">
                <TextInputWithUnit
                    value={String(p[getK("iconWrapperSize")] ?? "")}
                    placeholder="52"
                    onChange={(v) => up(getK("iconWrapperSize"), v)}
                />
            </Field>
            <Field label="Wrapper Background">
                <ColorInput
                    value={(p[getK("iconBg")] as string) || ""}
                    placeholder="rgba(var(--primary-rgb), 0.1)"
                    onChange={(v) => up(getK("iconBg"), v, true)}
                />
            </Field>
            <Field label="Wrapper Radius">
                <BorderRadiusInput
                    value={(p[getK("iconRadius")] as string) || "14px"}
                    onChange={(v) => up(getK("iconRadius"), v)}
                />
            </Field>
        </>
    );
}

export function CardFields({ p, up, prefix = "card" }: PropertyGroupProps) {
    const styleKey = `${prefix}Style`;
    const bgKey = `${prefix}Bg`;
    const radiusKey = `${prefix}Radius`;
    const shadowKey = `${prefix}Shadow`;
    const borderColorKey = `${prefix}BorderColor`;
    const paddingKey = `${prefix}Padding`;
    const hoverEffectKey = `${prefix}HoverEffect`;

    const cardStyle = (p[styleKey] as string) || "raised";

    return (
        <>
            <Field label="Card Style">
                <SelectInput
                    value={cardStyle}
                    onChange={(v) => up(styleKey, v)}
                    options={[
                        { label: "Raised (Shadow)", value: "raised" },
                        { label: "Outlined", value: "outlined" },
                        { label: "Filled", value: "filled" },
                        { label: "Glassmorphism", value: "glass" },
                        { label: "None (Clean)", value: "none" },
                    ]}
                />
            </Field>
            {cardStyle !== "none" && (
                <>
                    <Field label="Card Background"><ColorInput value={p[bgKey] || "var(--surface)"} onChange={(v) => up(bgKey, v)} onBlur={(v) => up(bgKey, v, true)} /></Field>
                    <Field label="Border Radius"><BorderRadiusInput value={p[radiusKey] || "16px"} onChange={(v) => up(radiusKey, v)} /></Field>
                    {cardStyle === "raised" && (
                        <Field label="Shadow">
                            <SelectInput
                                value={p[shadowKey] || "md"}
                                onChange={(v) => up(shadowKey, v)}
                                options={[
                                    { label: "Small", value: "sm" },
                                    { label: "Medium", value: "md" },
                                    { label: "Large", value: "lg" },
                                    { label: "Extra Large", value: "xl" },
                                    { label: "Action Glow", value: "glow" },
                                    { label: "None", value: "none" },
                                ]}
                            />
                        </Field>
                    )}
                    {cardStyle === "outlined" && (
                        <Field label="Border Color"><ColorInput value={p[borderColorKey] || "var(--border)"} onChange={(v) => up(borderColorKey, v)} /></Field>
                    )}
                </>
            )}
            <Field label="Card Padding"><TextInputWithUnit value={p[paddingKey] || ""} onChange={(v) => up(paddingKey, v)} placeholder="2rem 1.75rem" /></Field>
            <Field label="Hover Effect">
                <SelectInput
                    value={p[hoverEffectKey] || (cardStyle === "raised" ? "up" : "none")}
                    onChange={(v) => up(hoverEffectKey, v)}
                    options={[
                        { label: "Lift Up", value: "up" },
                        { label: "Scale Up", value: "scale" },
                        { label: "Accent Glow", value: "glow" },
                        { label: "None", value: "none" },
                    ]}
                />
            </Field>
        </>
    );
}

export function ButtonFields({ p, up, prefix = "button", hideLabel = false, textKey: customTextKey }: PropertyGroupProps & { hideLabel?: boolean; textKey?: string }) {
    // Resolve keys
    const textKey = customTextKey || (prefix === "button" ? "buttonText" : `${prefix}Text`);
    const variantKey = `${prefix}Variant`;
    const radiusKey = `${prefix}BorderRadius`;
    const shadowKey = `${prefix}Shadow`;
    const fontSizeKey = `${prefix}FontSize`;
    const fontWeightKey = `${prefix}FontWeight`;
    const letterSpacingKey = `${prefix}LetterSpacing`;

    const getK = (suffix: string) => {
        const prefixed = `${prefix}${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`;
        if (p[prefixed] !== undefined) return prefixed;
        if (p[suffix] !== undefined) return suffix;
        return prefix === "button" ? suffix : prefixed;
    };

    const variant = (p[variantKey] as string) || (p.variant as string) || "solid";

    return (
        <>
            <Section title="Button Content">
                {!hideLabel && <Field label="Action Text"><TextInput value={p[textKey] || ""} onChange={(v) => up(textKey, v)} placeholder="Click Me" /></Field>}
                <Field label="Variant">
                    <SelectInput
                        value={variant}
                        onChange={(v) => up(variantKey, v)}
                        options={[
                            { label: "Solid", value: "solid" },
                            { label: "Outline", value: "outline" },
                            { label: "Ghost", value: "ghost" },
                            { label: "Gradient", value: "gradient" },
                            { label: "Link", value: "link" },
                        ]}
                    />
                </Field>
                {variant !== "gradient" && (
                    <Field label="Background Color">
                        <ColorInput
                            value={(p[getK("bg")] as string) || (p[`${prefix}Bg`] as string) || (prefix === "button" ? "var(--primary)" : "")}
                            onChange={(v) => up(getK("bg"), v)}
                            onBlur={(v) => up(getK("bg"), v, true)}
                        />
                    </Field>
                )}
                <Field label="Text Color">
                    <ColorInput
                        value={(p[getK("textColor")] as string) || (p[`${prefix}TextColor`] as string) || (prefix === "button" ? "var(--button-text)" : "")}
                        onChange={(v) => up(getK("textColor"), v)}
                        onBlur={(v) => up(getK("textColor"), v, true)}
                    />
                </Field>
            </Section>

            {variant === "gradient" && (
                <Section title="Button Gradient">
                    <Field label="From Color"><ColorInput value={p[getK("gradientFrom")] || "#6366f1"} onChange={(v) => up(getK("gradientFrom"), v)} onBlur={(v) => up(getK("gradientFrom"), v, true)} /></Field>
                    <Field label="To Color"><ColorInput value={p[getK("gradientTo")] || "#8b5cf6"} onChange={(v) => up(getK("gradientTo"), v)} onBlur={(v) => up(getK("gradientTo"), v, true)} /></Field>
                    <DirectionInput value={p[getK("gradientDir")] || "to right"} onChange={(v) => up(getK("gradientDir"), v)} />
                </Section>
            )}

            <Section title="Button Appearance">
                <Field label="Size">
                    <SelectInput
                        value={p[getK("size")] || "md"}
                        onChange={(v) => up(getK("size"), v)}
                        options={[
                            { label: "Small", value: "sm" },
                            { label: "Medium", value: "md" },
                            { label: "Large", value: "lg" },
                            { label: "Extra Large", value: "xl" }
                        ]}
                    />
                </Field>
                <AlignmentInput label="Alignment" value={p[getK("align")] || "center"} onChange={(v) => up(getK("align"), v)} />
                <ToggleSwitch value={!!(p[getK("fullWidth")])} onChange={(v) => up(getK("fullWidth"), v)} label="Full Width" />
            </Section>

            <Section title="Button Shape & Shadow">
                <Field label="Shadow">
                    <SelectInput
                        value={p[shadowKey] || "none"}
                        onChange={(v) => up(shadowKey, v)}
                        options={[
                            { label: "None", value: "none" },
                            { label: "Small", value: "sm" },
                            { label: "Medium", value: "md" },
                            { label: "Large", value: "lg" },
                            { label: "Glow", value: "glow" }
                        ]}
                    />
                </Field>
                <Field label="Radius"><BorderRadiusInput value={p[radiusKey] || "8px"} onChange={(v) => up(radiusKey, v)} /></Field>
                <Field label="Border Width"><TextInputWithUnit value={(p[getK("borderWidth")] as string) ?? ""} onChange={(v) => up(getK("borderWidth"), v)} placeholder="0px" /></Field>
                <Field label="Border Color"><ColorInput value={(p[getK("borderColor")] as string) || ""} onChange={(v) => up(getK("borderColor"), v)} onBlur={(v) => up(getK("borderColor"), v, true)} /></Field>
            </Section>

            <Section title="Button Typography">
                <Field label="Font Size override"><TextInputWithUnit value={(p[fontSizeKey] as string) ?? ""} onChange={(v) => up(fontSizeKey, v)} placeholder="auto" /></Field>
                <Field label="Font Weight">
                    <SelectInput
                        value={(p[fontWeightKey] as string) || "700"}
                        onChange={(v) => up(fontWeightKey, v)}
                        options={[
                            { label: "Normal (400)", value: "400" },
                            { label: "Medium (500)", value: "500" },
                            { label: "Semibold (600)", value: "600" },
                            { label: "Bold (700)", value: "700" },
                            { label: "Black (900)", value: "900" }
                        ]}
                    />
                </Field>
                <Field label="Letter Spacing"><TextInputWithUnit value={(p[letterSpacingKey] as string) ?? ""} onChange={(v) => up(letterSpacingKey, v)} placeholder="0.02em" /></Field>
            </Section>

            <Section title="Button Icons">
                <Field label="Left Icon"><IconPicker value={p[getK("iconLeft")] || ""} onChange={(v) => up(getK("iconLeft"), v)} /></Field>
                <Field label="Right Icon"><IconPicker value={p[getK("iconRight")] || ""} onChange={(v) => up(getK("iconRight"), v)} /></Field>
            </Section>
        </>
    );
}

export function ImageFields({ p, up, prefix = "image" }: PropertyGroupProps) {
    const urlKey = prefix === "image" ? "image" : `${prefix}Url`;
    const radiusKey = `${prefix}Radius`;
    const shadowKey = `${prefix}Shadow`;
    const styleKey = `${prefix}Style`;

    return (
        <>
            <Field label="Image Source"><MediaInput value={p[urlKey] || ""} onChange={(v) => up(urlKey, v)} /></Field>
            <Field label="Style"><SelectInput value={p[styleKey] || "cover"} onChange={(v) => up(styleKey, v)} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Circle", value: "circle" }, { label: "Square", value: "square" }]} /></Field>
            <Field label="Radius"><BorderRadiusInput value={p[radiusKey] || "8px"} onChange={(v) => up(radiusKey, v)} /></Field>
            <Field label="Shadow"><ShadowInput value={p[shadowKey] || "none"} onChange={(v) => up(shadowKey, v)} /></Field>
        </>
    );
}

export function PaddingFields({ p, up }: PropertyGroupProps) {
    return (
        <>
            <PaddingInput label="Desktop" value={p.padding || ""} onChange={(v) => up("padding", v)} placeholder="64px 24px" />
            <PaddingInput label="Tablet" value={p.tabletPadding || ""} onChange={(v) => up("tabletPadding", v)} placeholder="48px 16px" />
            <PaddingInput label="Mobile" value={p.mobilePadding || ""} onChange={(v) => up("mobilePadding", v)} placeholder="32px 16px" />
        </>
    );
}

export function InputFields({ p, up, prefix = "input" }: PropertyGroupProps) {
    const bgKey = `${prefix}Bg`;
    const textColorKey = `${prefix}TextColor`;
    const placeholderColorKey = `${prefix}PlaceholderColor`;
    const borderColorKey = `${prefix}BorderColor`;
    const labelColorKey = prefix === "input" ? "labelColor" : `${prefix}LabelColor`;
    const radiusKey = `${prefix}Radius`;
    const heightKey = `${prefix}Height`;

    const defaults = {
        bg: "#f8fafc",
        text: "#111827",
        placeholder: "#e2e8f0",
        border: "#e2e8f0",
        label: "#374151"
    };

    const bgLabel = prefix === "input" ? "Input Background" : `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Background`;

    return (
        <>
            <Field label={bgLabel}><ColorInput value={p[bgKey] || ""} onChange={(v) => up(bgKey, v)} placeholder={defaults.bg} /></Field>
            <Field label="Text Color"><ColorInput value={p[textColorKey] || ""} onChange={(v) => up(textColorKey, v)} placeholder={defaults.text} /></Field>
            <Field label="Placeholder"><ColorInput value={p[placeholderColorKey] || ""} onChange={(v) => up(placeholderColorKey, v)} placeholder={defaults.placeholder} /></Field>
            <Field label="Border Color"><ColorInput value={p[borderColorKey] || ""} onChange={(v) => up(borderColorKey, v)} placeholder={defaults.border} /></Field>
            <Field label="Label Color"><ColorInput value={p[labelColorKey] || ""} onChange={(v) => up(labelColorKey, v)} placeholder={defaults.label} /></Field>
            <Field label="Height"><TextInputWithUnit value={p[heightKey] || ""} onChange={(v) => up(heightKey, v)} placeholder="48px" /></Field>
            <Field label="Border Radius"><BorderRadiusInput value={p[radiusKey] || ""} onChange={(v) => up(radiusKey, v)} placeholder="10px" /></Field>
        </>
    );
}

export function WaveDecorationFields({ p, up }: PropertyGroupProps) {
    const showWave = !!p.showWave;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Field label="Enable Wave">
                <ToggleSwitch
                    value={showWave}
                    onChange={(v) => up("showWave", v, true)}
                    label={showWave ? "Yes" : "No"}
                />
            </Field>

            {showWave && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden" }}
                >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <Field label="Position">
                            <SelectInput
                                value={(p.wavePosition as string) || "bottom"}
                                onChange={(v) => up("wavePosition", v, true)}
                                options={[
                                    { label: "Bottom", value: "bottom" },
                                    { label: "Top", value: "top" },
                                ]}
                            />
                        </Field>
                        <Field label="Style">
                            <SelectInput
                                value={(p.wavePattern as string) || "smooth"}
                                onChange={(v) => up("wavePattern", v, true)}
                                options={[
                                    { label: "Smooth", value: "smooth" },
                                    { label: "Sharp", value: "sharp" },
                                    { label: "Steps", value: "stepped" },
                                    { label: "Curve", value: "asymmetric" },
                                ]}
                            />
                        </Field>
                    </div>

                    <Field label="Height">
                        <TextInputWithUnit
                            value={(p.waveHeight as string) || "120px"}
                            onChange={(v) => up("waveHeight", v, true)}
                            placeholder="120px"
                        />
                    </Field>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <Field label="Main Color">
                            <ColorInput value={(p.waveColor as string) || "var(--primary)"} onChange={(v) => up("waveColor", v, true)} />
                        </Field>
                        <Field label="Grad End">
                            <ColorInput value={(p.waveGradientEnd as string) || ""} onChange={(v) => up("waveGradientEnd", v, true)} />
                        </Field>
                    </div>

                    <Field label="Layers (Depth)">
                        <SliderInput min={1} max={3} value={Number(p.waveLayers ?? 3)} onChange={(v) => up("waveLayers", v, true)} />
                    </Field>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "10px",
                        background: "rgba(255,255,255,0.03)",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                        <ToggleSwitch label="Animate" value={p.waveAnimated !== false} onChange={(v) => up("waveAnimated", v, true)} />
                        <ToggleSwitch label="On Top" value={!!p.waveOnTop} onChange={(v) => up("waveOnTop", v, true)} />
                        <ToggleSwitch label="Flip H" value={!!p.waveFlipH} onChange={(v) => up("waveFlipH", v, true)} />
                        <ToggleSwitch label="Flip V" value={!!p.waveFlipV} onChange={(v) => up("waveFlipV", v, true)} />
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// ─── Export constants / types ──────────────────────────────────────────────────
// AnimationPanel should be imported directly from ./AnimationPanel.tsx to avoid circular deps

"use client";

import type { Block, EditorPage } from "@/types";
/**
 * panels/shared.tsx — All shared UI primitives for the Properties Panel
 *
 * Exports: PANEL_COLORS, Field, TextInput, TextareaInput, SelectInput,
 *          BorderRadiusInput, ColorInput, ToggleInput, Section
 */

import React from "react";
import { ChevronDownIcon, CheckIcon, SwatchIcon, PhotoIcon, TrashIcon, VideoCameraIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

import { useEditorStore } from "@/stores/editorStore";
import { ColorPicker, Dropdown, Popover, Tooltip } from "antd";
import MediaPicker from "../MediaPicker";
import PillSegmented from "../../ui/PillSegmented";

export type { Block, EditorPage };
export { useEditorStore };

// ─── Theme constants ──────────────────────────────────────────────────────────

export const PANEL_COLORS = {
    bg: "#111111",
    sectionBg: "#1a1a1a",
    border: "#2a2a2a",
    text: "#ededed",
    muted: "#888888",
    inputBg: "#222222",
    inputBorder: "transparent",
    inputHoverBg: "#2a2a2a",
    primary: "#0099ff",
};

// ─── MediaInput ───────────────────────────────────────────────────────────────

export function MediaInput({ value, onChange, placeholder, type = "image" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: "image" | "video" }) {
    const [pickerOpen, setPickerOpen] = React.useState(false);

    const isVideo = type === "video" || (value && (value?.endsWith(".mp4") || value?.includes("youtube.com") || value?.includes("vimeo.com")));

    return (
        <div style={{ width: "100%" }}>
            {!value ? (
                <button
                    onClick={() => setPickerOpen(true)}
                    style={{
                        width: "100%",
                        height: 60,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        background: PANEL_COLORS.inputBg,
                        border: `1px dashed ${PANEL_COLORS.inputBorder}`,
                        borderRadius: 8,
                        color: PANEL_COLORS.muted,
                        cursor: "pointer",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--text)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = PANEL_COLORS.inputBorder; e.currentTarget.style.color = PANEL_COLORS.muted; }}
                >
                    {type === "video" ? <VideoCameraIcon style={{ width: 18, height: 18 }} /> : <PhotoIcon style={{ width: 18, height: 18 }} />}
                    <span style={{ fontSize: 10, fontWeight: 500 }}>Select {type === "video" ? "Video" : "Image"}</span>
                </button>
            ) : (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 8,
                    background: PANEL_COLORS.inputBg,
                    border: `1px solid ${PANEL_COLORS.inputBorder}`,
                    borderRadius: 8,
                    overflow: "hidden"
                }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 4,
                        background: "#121212",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                        border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                        {isVideo ? (
                            <VideoCameraIcon style={{ width: 16, height: 16, color: "var(--primary)" }} />
                        ) : (
                            <img src={value} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as any).src = "https://placehold.co/100x100?text=Error"; }} />
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex flex-col">
                            <button
                                onClick={() => setPickerOpen(true)}
                                style={{ background: "none", border: "none", padding: 0, color: "var(--primary)", fontSize: 10, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}
                            >
                                <ArrowPathIcon style={{ width: 10, height: 10 }} /> Change
                            </button>
                            <button
                                onClick={() => onChange("")}
                                style={{ background: "none", border: "none", padding: 0, color: "#ef4444", fontSize: 10, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}
                            >
                                <TrashIcon style={{ width: 10, height: 10 }} /> Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", alignItems: "center", gap: 12, minHeight: 28 }}>
            <label style={{ fontSize: 11, fontWeight: 500, color: PANEL_COLORS.muted, userSelect: "none", lineHeight: 1 }}>
                {label}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                {children}
            </div>
        </div>
    );
}

// ─── TextInput ────────────────────────────────────────────────────────────────

export function TextInput({ value, onChange, placeholder, type = "text", style }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string, style?: React.CSSProperties }) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            style={{ width: "100%", height: 26, padding: "0 8px", fontSize: 11, background: PANEL_COLORS.inputBg, border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 4, color: PANEL_COLORS.text, outline: "none", transition: "all 0.15s", ...style }}
            onMouseEnter={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.background = PANEL_COLORS.inputHoverBg; }}
            onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.background = PANEL_COLORS.inputBg; }}
            onFocus={(e) => { e.currentTarget.style.background = PANEL_COLORS.sectionBg; e.currentTarget.style.borderColor = PANEL_COLORS.primary; }}
            onBlur={(e) => { e.currentTarget.style.background = PANEL_COLORS.inputBg; e.currentTarget.style.borderColor = PANEL_COLORS.inputBorder; }}
        />
    );
}

// ─── TextareaInput ────────────────────────────────────────────────────────────

export function TextareaInput({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            spellCheck={false}
            style={{ width: "100%", padding: "6px 8px", fontSize: 11, background: PANEL_COLORS.inputBg, border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 4, color: PANEL_COLORS.text, outline: "none", resize: "vertical", transition: "all 0.15s" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = PANEL_COLORS.primary; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = PANEL_COLORS.inputBorder; }}
        />
    );
}

// ─── SelectInput ──────────────────────────────────────────────────────────────

export function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
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
            padding: "4px 8px", fontSize: 11, color: PANEL_COLORS.text, borderRadius: 4, background: o.value === value ? "#0099ff33" : "transparent"
        }
    }));

    return (
        <Dropdown
            trigger={['click']}
            placement="bottomLeft"
            menu={{ items: menuItems, style: { background: "#1e1e1e", border: `1px solid ${PANEL_COLORS.border}`, borderRadius: 6, padding: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" } }}
            getPopupContainer={() => document.body}
        >
            <button
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", height: 26, padding: "0 8px", fontSize: 11, background: PANEL_COLORS.inputBg, border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 4, color: PANEL_COLORS.text, outline: "none", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = PANEL_COLORS.inputHoverBg}
                onMouseLeave={e => e.currentTarget.style.background = PANEL_COLORS.inputBg}
            >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedOption?.label}</span>
                <ChevronDownIcon style={{ width: 12, height: 12, opacity: 0.5, flexShrink: 0 }} />
            </button>
        </Dropdown>
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

export function BorderRadiusInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [tl, tr, br, bl] = parseRadius(value);
    const allEqual = tl === tr && tr === br && br === bl;
    const [linked, setLinked] = React.useState(allEqual);
    React.useEffect(() => { if (linked && !allEqual) setLinked(false); }, [value, linked, allEqual]);

    const setCorner = (corner: "tl" | "tr" | "br" | "bl", v: string) => {
        if (linked) { onChange(v); }
        else { const next = { tl, tr, br, bl, [corner]: v }; onChange(serializeRadius(next.tl, next.tr, next.br, next.bl)); }
    };

    const presets = ["0px", "4px", "8px", "12px", "16px", "999px"];
    const presetLabels = ["0", "4", "8", "12", "16", "Full"];
    const corners: Array<{ key: "tl" | "tr" | "br" | "bl"; val: string }> = [
        { key: "tl", val: tl }, { key: "tr", val: tr }, { key: "bl", val: bl }, { key: "br", val: br },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {corners.map(({ key, val }) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 3, background: "#181818", border: "1px solid #2a2a2a", borderRadius: 4, padding: "2px 5px" }}>
                        <span style={{ color: "#7a8a9e", flexShrink: 0, display: "flex", lineHeight: 0 }}>
                            <CornerIcon corner={key} />
                        </span>
                        <input
                            value={val}
                            onChange={(e) => setCorner(key, e.target.value)}
                            onFocus={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.parentElement!.style.borderColor = "#0099ff66"; }}
                            onBlur={(e) => { e.currentTarget.style.color = "#e2e8f0"; e.currentTarget.parentElement!.style.borderColor = "#2a2a2a"; }}
                            style={{ flex: 1, minWidth: 0, height: 18, fontSize: 10, fontFamily: "inherit", background: "transparent", border: "none", color: "#e2e8f0", outline: "none", textAlign: "right", width: 40 }}
                        />
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", minWidth: 0 }}>
                <button
                    title={linked ? "Click to set corners independently" : "Click to link all corners"}
                    onClick={() => { const next = !linked; setLinked(next); if (next) onChange(tl); }}
                    style={{ height: 22, padding: "0 7px", display: "flex", alignItems: "center", gap: 3, background: linked ? "#0099ff1a" : "#1a1a1a", border: `1px solid ${linked ? "#0099ff44" : "#2a2a2a"}`, borderRadius: 4, cursor: "pointer", color: linked ? "#4db8ff" : "#555", fontSize: 9, flexShrink: 0, transition: "all 0.15s" }}
                >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        {linked ? (<><path d="M3 5.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><rect x="0.75" y="3.25" width="3" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><rect x="7.25" y="3.25" width="3" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" /></>) : (<><rect x="0.75" y="3.25" width="3" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><rect x="7.25" y="3.25" width="3" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M4 5.5h1M6 5.5h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1 1" /></>)}
                    </svg>
                    {linked ? "Linked" : "Free"}
                </button>
                {presets.map((v, i) => (
                    <button key={v} onClick={() => { onChange(v); setLinked(true); }} title={v}
                        style={{ flex: 1, height: 22, fontSize: 9, padding: 0, background: value === v ? "#0099ff1a" : "#1a1a1a", border: `1px solid ${value === v ? "#0099ff44" : "#2a2a2a"}`, borderRadius: 4, cursor: "pointer", color: value === v ? "#4db8ff" : "#555", transition: "all 0.15s" }}
                    >{presetLabels[i]}</button>
                ))}
            </div>
        </div>
    );
}

// ─── ColorInput ───────────────────────────────────────────────────────────────

function resolveColor(raw: string): string {
    if (!raw || typeof window === "undefined") return raw || "#000000";
    if (!raw.startsWith("var(")) return raw;
    const varName = raw.slice(4, -1).split(",")[0].trim();
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return resolved || "#000000";
}

function toHex(color: string): string {
    if (!color || typeof document === "undefined") return "#000000";
    const resolved = resolveColor(color);
    if (/^#[0-9a-fA-F]{6}$/.test(resolved)) return resolved;
    const el = document.createElement("div");
    el.style.color = resolved;
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    document.body.removeChild(el);
    const m = computed.match(/\d+/g);
    if (!m || m.length < 3) return "#000000";
    return "#" + m.slice(0, 3).map(n => Number(n).toString(16).padStart(2, "0")).join("");
}

export function ColorInput({ value, onChange, onBlur }: { value: string; onChange: (v: string) => void; onBlur?: (v: string) => void }) {
    const displayValue = resolveColor(value);
    const isVariable = value.startsWith("var(");

    return (
        <div style={{ display: "flex", gap: 4, width: "100%" }}>
            <ColorPicker
                value={isVariable ? displayValue : value}
                onChange={(color) => {
                    onChange(color.toRgbString());
                }}
                onChangeComplete={(color) => {
                    if (onBlur) onBlur(color.toRgbString());
                }}
                showText={() => (
                    <span style={{ fontSize: 10, color: PANEL_COLORS.muted }}>
                        {toHex(value)}
                    </span>
                )}
                presets={[
                    {
                        label: 'Brand Colors',
                        colors: ["#6366f1", "#0ea5e9", "#22c55e", "#eab308", "#f97316", "#ef4444", "#0099ff"],
                    },
                    {
                        label: 'Grayscale',
                        colors: ["#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#1e293b", "#0f172a", "#000000"],
                    }
                ]}
            >
                <button
                    style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, height: 26, padding: "0 8px", fontSize: 11, background: PANEL_COLORS.inputBg, border: `1px solid ${isVariable ? "var(--primary)" : PANEL_COLORS.inputBorder}`, borderRadius: 4, color: PANEL_COLORS.text, outline: "none", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = PANEL_COLORS.inputHoverBg}
                    onMouseLeave={e => e.currentTarget.style.background = PANEL_COLORS.inputBg}
                >
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: displayValue, border: "1px solid rgba(255,255,255,0.15)" }} />
                    <span style={{ flex: 1, textAlign: "left", fontFamily: "monospace", fontSize: 11, opacity: 0.9, overflow: "hidden", textOverflow: "ellipsis" }}>{isVariable ? `${toHex(value)} (Theme)` : toHex(value)}</span>
                </button>
            </ColorPicker>

            {!isVariable && (
                <Tooltip title="Reset to Theme Variable">
                    <button
                        onClick={() => {
                            // Smart guess: if white text -> var(--text), if dark bg -> var(--surface)
                            if (value.toLowerCase() === "#ffffff" || value.toLowerCase() === "#fff") {
                                onChange("var(--text)");
                            } else {
                                onChange("var(--primary)");
                            }
                        }}
                        style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", background: PANEL_COLORS.inputBg, border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 4, cursor: "pointer", color: PANEL_COLORS.muted }}
                    >
                        <ArrowPathIcon style={{ width: 14, height: 14 }} />
                    </button>
                </Tooltip>
            )}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: PANEL_COLORS.text }}>{label}</span>
                {control}
            </div>
        );
    }
    return control;
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ borderBottom: `1px solid ${PANEL_COLORS.border}`, padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: PANEL_COLORS.text }}>{title}</p>
                <div style={{ color: PANEL_COLORS.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {children}
            </div>
        </div>
    );
}

// ─── Export AnimationPanel ───────────────────────────────────────────────────
export * from "./AnimationPanel";

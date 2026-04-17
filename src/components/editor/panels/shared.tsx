"use client";

import type { Block, EditorPage } from "@/types";
/**
 * panels/shared.tsx — All shared UI primitives for the Properties Panel
 *
 * Exports: PANEL_COLORS, Field, TextInput, TextareaInput, SelectInput,
 *          BorderRadiusInput, ColorInput, ToggleSwitch, Section
 */

import React from "react";
import { ChevronDownIcon, CheckIcon, SwatchIcon, PhotoIcon, TrashIcon, VideoCameraIcon, ArrowPathIcon, LinkIcon } from "@heroicons/react/24/outline";

import { useEditorStore } from "@/stores/editorStore";
import { ColorPicker, Dropdown, Popover, Switch, Tooltip } from "antd";
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
    const resolved = resolveColor(color, theme);
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

export function ColorInput({ value, onChange, onBlur, placeholder = "#ffffff" }: { value: string; onChange: (v: string) => void; onBlur?: (v: string) => void; placeholder?: string }) {
    const { page } = useEditorStore();
    const theme = page?.theme;
    const initialValue = value || placeholder;
    const resolvedDisplayValue = resolveColor(initialValue, theme);
    const isVariable = initialValue.startsWith("var(");

    return (
        <div style={{ display: "flex", gap: 4, width: "100%" }}>
            <ColorPicker
                value={isVariable ? resolvedDisplayValue : initialValue}
                onChange={(color) => {
                    onChange(color.toRgbString());
                }}
                onChangeComplete={(color) => {
                    if (onBlur) onBlur(color.toRgbString());
                }}
                showText={() => (
                    <span style={{ fontSize: 10, color: PANEL_COLORS.muted }}>
                        {toHex(initialValue)}
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
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: resolvedDisplayValue, border: "1px solid rgba(255,255,255,0.15)" }} />
                    <span style={{ flex: 1, textAlign: "left", fontFamily: "monospace", fontSize: 11, opacity: 0.9, overflow: "hidden", textOverflow: "ellipsis" }}>{isVariable ? `${toHex(value, theme)} (Theme)` : toHex(value, theme)}</span>
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

// ─── ToggleSwitch ──────────────────────────────────────────────────────────────
export function ToggleSwitch({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
    const control = (
        <div className="flex items-center gap-2 mt-1">
            <Switch checked={value} onChange={(v) => onChange(v)} />
            <span className={`${value ? "text-green-500" : "text-red-500"} min-w-8 mx-auto`}>{value ? "Yes" : "No"}</span>
        </div>
    );
    if (label) {
        return (
            <div className="flex justify-between">
                <span style={{ fontSize: 11, fontWeight: 500, color: PANEL_COLORS.text }}>{label}</span>
                {control}
            </div>
        );
    }
    return control;
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
        ? [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }, { label: "Justify", value: "justify" }]
        : type === "vertical"
            ? [{ label: "Top", value: "top" }, { label: "Middle", value: "middle" }, { label: "Bottom", value: "bottom" }]
            : [{ label: "Top", value: "flex-start" }, { label: "Center", value: "center" }, { label: "Bottom", value: "flex-end" }, { label: "Stretch", value: "stretch" }];

    const items = (options || defaultOptions).map(opt => ({
        label: (
            <Tooltip title={opt.label}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", padding: "2px 0" }}>
                    {ALIGN_ICONS[opt.value] || opt.label}
                </div>
            </Tooltip>
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

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    const { subItemFocus, selectedBlockId } = useEditorStore();
    const isFocused = subItemFocus?.blockId === selectedBlockId && subItemFocus?.index === title;
    
    // Generate a clean ID for scrolling
    const sectionId = `section-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;

    return (
        <div 
            id={sectionId}
            style={{ 
                borderBottom: `1px solid ${PANEL_COLORS.border}`, 
                padding: "12px 16px",
                transition: "background 0.5s ease",
                background: isFocused ? "rgba(0, 153, 255, 0.08)" : "transparent",
                position: "relative"
            }}
        >
            {isFocused && (
                <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "var(--primary)", borderRadius: "0 4px 4px 0" }} />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: isFocused ? "var(--primary)" : PANEL_COLORS.text, transition: "color 0.3s" }}>{title}</p>
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

// ─── Property Groups ─────────────────────────────────────────────────────────

export interface PropertyGroupProps {
    p: any;
    up: (key: string, val: any, commit?: boolean) => void;
    prefix?: string;
}

export function TypographyFields({ p, up, prefix = "", showSubtitle = true }: PropertyGroupProps & { showSubtitle?: boolean }) {
    const titleKey = prefix ? (prefix === "title" ? "titleText" : `${prefix}Title`) : "title";
    const subtitleKey = prefix ? (prefix === "title" ? "subtitleText" : `${prefix}Subtitle`) : "subtitle";
    const titleColorKey = prefix ? `${prefix}Color` : "titleColor";
    const subtitleColorKey = prefix ? (prefix === "title" ? "subtitleColor" : `${prefix}SubtitleColor`) : "subtitleColor";

    // Backward compatibility / convenience for 'title' prefix
    const finalTitleKey = (prefix === "title" && p.titleText === undefined && p.title !== undefined) ? "title" : titleKey;
    const finalSubtitleKey = (prefix === "title" && p.subtitleText === undefined && p.subtitle !== undefined) ? "subtitle" : subtitleKey;

    return (
        <>
            <Field label="Title"><TextInput value={p[finalTitleKey] || ""} onChange={(v) => up(finalTitleKey, v)} /></Field>
            {showSubtitle && <Field label="Subtitle"><TextInput value={p[finalSubtitleKey] || ""} onChange={(v) => up(finalSubtitleKey, v)} /></Field>}
            <Field label="Title Color"><ColorInput value={p[titleColorKey] || "var(--text)"} onChange={(v) => up(titleColorKey, v)} onBlur={(v) => up(titleColorKey, v, true)} /></Field>
            {showSubtitle && <Field label="Subtitle Color"><ColorInput value={p[subtitleColorKey] || "var(--text-muted)"} onChange={(v) => up(subtitleColorKey, v)} onBlur={(v) => up(subtitleColorKey, v, true)} /></Field>}
        </>
    );
}

export function LayoutFields({ p, up, options = {} }: PropertyGroupProps & { options?: { layouts?: { label: string, value: string }[], showCols?: boolean, showGap?: boolean, showAlign?: boolean } }) {
    const { layouts, showCols = true, showGap = true, showAlign = true } = options;
    return (
        <>
            {layouts && <Field label="Layout"><SelectInput value={p.layout || layouts[0].value} onChange={(v) => up("layout", v)} options={layouts} /></Field>}
            {showCols && <Field label="Columns"><SelectInput value={String(p.columns || "3")} onChange={(v) => up("columns", Number(v))} options={[{ label: "1 Column", value: "1" }, { label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" }]} /></Field>}
            {showGap && <Field label="Gap"><TextInput value={p.gap || "2rem"} onChange={(v) => up("gap", v)} placeholder="2rem" /></Field>}
            {showAlign && <AlignmentInput value={(p.align as string) || "center"} onChange={(v) => up("align", v)} />}
        </>
    );
}

export function CardFields({ p, up, prefix = "card" }: PropertyGroupProps) {
    const styleKey = `${prefix}Style`;
    const bgKey = `${prefix}Bg`;
    const radiusKey = `${prefix}Radius`;
    const shadowKey = `${prefix}Shadow`;
    const hoverShadowKey = `${prefix}ShadowHover`;

    return (
        <>
            <Field label="Style"><SelectInput value={p[styleKey] || "raised"} onChange={(v) => up(styleKey, v)} options={[{ label: "None", value: "none" }, { label: "Raised Shadow", value: "raised" }, { label: "Outlined", value: "outlined" }, { label: "Filled", value: "filled" }]} /></Field>
            {p[styleKey] !== "none" && (
                <>
                    <Field label="Background"><ColorInput value={p[bgKey] || "var(--background)"} onChange={(v) => up(bgKey, v)} onBlur={(v) => up(bgKey, v, true)} /></Field>
                    <Field label="Radius"><BorderRadiusInput value={p[radiusKey] || "12px"} onChange={(v) => up(radiusKey, v)} /></Field>
                    {p[styleKey] === "raised" && (
                        <>
                            <Field label="Shadow"><ShadowInput value={p[shadowKey] || "none"} onChange={(v) => up(shadowKey, v)} /></Field>
                            <Field label="Hover Shadow"><ShadowInput value={p[hoverShadowKey] || "none"} onChange={(v) => up(hoverShadowKey, v)} /></Field>
                        </>
                    )}
                </>
            )}
        </>
    );
}

export function ButtonFields({ p, up, prefix = "button", hideLabel = false, textKey: customTextKey }: PropertyGroupProps & { hideLabel?: boolean; textKey?: string }) {
    const textKey = customTextKey || (prefix === "button" ? "buttonText" : `${prefix}Text`);
    const bgKey = `${prefix}Bg`;
    const colorKey = `${prefix}TextColor`;
    const radiusKey = `${prefix}BorderRadius`;
    const variantKey = `${prefix}Variant`;

    const variantOptions = [
        { label: "Solid", value: "solid" },
        { label: "Outline", value: "outline" },
        { label: "Ghost", value: "ghost" },
        { label: "Soft", value: "soft" },
    ];

    return (
        <>
            {!hideLabel && <Field label="Text"><TextInput value={p[textKey] || "Click Me"} onChange={(v) => up(textKey, v)} /></Field>}
            <Field label="Variant"><SelectInput value={p[variantKey] || "solid"} onChange={(v) => up(variantKey, v)} options={variantOptions} /></Field>
            <Field label="Background"><ColorInput value={p[bgKey] || "var(--primary)"} onChange={(v) => up(bgKey, v)} onBlur={(v) => up(bgKey, v, true)} /></Field>
            <Field label="Text Color"><ColorInput value={p[colorKey] || "var(--button-text)"} onChange={(v) => up(colorKey, v)} onBlur={(v) => up(colorKey, v, true)} /></Field>
            <Field label="Radius"><BorderRadiusInput value={p[radiusKey] || "8px"} onChange={(v) => up(radiusKey, v)} /></Field>
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
            <Field label="Height"><TextInput value={p[heightKey] || ""} onChange={(v) => up(heightKey, v)} placeholder="48px" /></Field>
            <Field label="Border Radius"><BorderRadiusInput value={p[radiusKey] || ""} onChange={(v) => up(radiusKey, v)} placeholder="10px" /></Field>
        </>
    );
}

// ─── Export AnimationPanel ───────────────────────────────────────────────────
export * from "./AnimationPanel";

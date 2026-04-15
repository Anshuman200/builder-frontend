"use client";
import type { Block, EditorPage } from "@/types";
import React, { useMemo, useEffect, useRef } from "react";
import { useEditorStore, DEFAULT_THEME } from "@/stores/editorStore";

import {
    Section, Field, TextInput, TextareaInput, SelectInput, ColorInput, BorderRadiusInput, ToggleInput, MediaInput, AnimationPanel, PANEL_COLORS, ShadowInput,
    TypographyFields, LayoutFields, CardFields, ButtonFields, ImageFields, PaddingFields,
    InputFields
} from "./shared";
import { IconPicker } from "../IconPicker";
import { EDITOR_FEATURES } from "@/lib/config/features";
import { useAuth } from "@/hooks/useAuth";
import { Dropdown } from "antd";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false }) as any;

export function FeaturesPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props as any;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    // Scroll-to + flash when a feature card is clicked on canvas
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [flashIdx, setFlashIdx] = React.useState<number | null>(null);
    useEffect(() => {
        let prev = useEditorStore.getState().subItemFocus;
        return useEditorStore.subscribe((state) => {
            const f = state.subItemFocus;
            if (f && f.blockId === block.id && f !== prev) {
                prev = f;
                const el = itemRefs.current[f.index];
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    setFlashIdx(f.index);
                    setTimeout(() => setFlashIdx(null), 2000);
                }
            }
        });
    }, [block.id]);

    return (
        <>
            <Section title="Content">
                <TypographyFields p={p} up={up} />
            </Section>
            <Section title="Layout & Style">
                <LayoutFields p={p} up={up} options={{
                    layouts: [{ label: "Card Grid", value: "grid" }, { label: "Alternating Row (Icon + Text)", value: "alternating" }, { label: "Horizontal List", value: "horizontal" }, { label: "Icon-Only Grid", value: "icon-grid" }, { label: "Bento / Asymmetric", value: "bento" }]
                }} />
                <Field label="Background Color"><ColorInput value={(p.bgColor as string) || "#ffffff"} onChange={(v) => up("bgColor", v)} onBlur={(v) => up("bgColor", v, true)} /></Field>
                <Field label="Text Color"><ColorInput value={(p.textColor as string) || "#1e293b"} onChange={(v) => up("textColor", v)} onBlur={(v) => up("textColor", v, true)} /></Field>
            </Section>
            <Section title="Card Styling">
                <CardFields p={p} up={up} />
            </Section>
            <Section title="Typography">
                <Field label="Section Title Size"><TextInput value={(p.titleSize as string) || "2.25rem"} onChange={(v) => up("titleSize", v)} placeholder="2.25rem" /></Field>
                <Field label="Section Subtitle Size"><TextInput value={(p.subtitleSize as string) || "1.125rem"} onChange={(v) => up("subtitleSize", v)} placeholder="1.125rem" /></Field>
                <Field label="Card Title Size"><TextInput value={(p.cardTitleSize as string) || "1.2rem"} onChange={(v) => up("cardTitleSize", v)} placeholder="1.2rem" /></Field>
                <Field label="Card Description Size"><TextInput value={(p.cardDescSize as string) || "0.95rem"} onChange={(v) => up("cardDescSize", v)} placeholder="0.95rem" /></Field>
            </Section>
            <Section title="Icon Styling">
                <Field label="Icon Size"><TextInput value={String(p.iconSize || 24)} onChange={(v) => up("iconSize", Number(v) || 24)} placeholder="24" /></Field>
                <Field label="Icon Color"><ColorInput value={(p.iconColor as string) || "var(--primary)"} onChange={(v) => up("iconColor", v)} onBlur={(v) => up("iconColor", v, true)} /></Field>
                <Field label="Wrapper Size"><TextInput value={String(p.iconWrapperSize || 52)} onChange={(v) => up("iconWrapperSize", Number(v) || 52)} placeholder="52" /></Field>
                <Field label="Wrapper Radius"><BorderRadiusInput value={(p.iconRadius as string) || "14px"} onChange={(v) => up("iconRadius", v)} /></Field>
                <Field label="Wrapper Background"><ColorInput value={(p.iconBg as string) || "rgba(var(--primary-rgb), 0.15)"} onChange={(v) => up("iconBg", v)} onBlur={(v) => up("iconBg", v, true)} /></Field>
            </Section>
            <Section title="Padding (Responsive)">
                <Field label="Desktop"><TextInput value={(p.padding as string) || ""} onChange={(v) => up("padding", v)} placeholder="64px 24px" /></Field>
                <Field label="Tablet ≤ 1024px"><TextInput value={(p.tabletPadding as string) || ""} onChange={(v) => up("tabletPadding", v)} placeholder="48px 16px" /></Field>
                <Field label="Mobile ≤ 768px"><TextInput value={(p.mobilePadding as string) || ""} onChange={(v) => up("mobilePadding", v)} placeholder="32px 16px" /></Field>
            </Section>
            <Section title="Feature Items">
                <style>{`
                    @keyframes subitem-flash {
                        0%   { background: rgba(99,102,241,0.18); box-shadow: inset 3px 0 0 #6366f1; }
                        60%  { background: rgba(99,102,241,0.10); box-shadow: inset 3px 0 0 #6366f188; }
                        100% { background: transparent; box-shadow: inset 3px 0 0 transparent; }
                    }
                    .subitem-flash { animation: subitem-flash 2s cubic-bezier(0.22,1,0.36,1) forwards; }
                `}</style>
                <div style={{ padding: "8px 0", fontSize: 11, color: "var(--text-subtle)" }}>Add or remove feature items below.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {((p.features as any[]) || []).map((feature, idx) => (
                        <div key={feature.id || idx}
                            ref={(el) => { itemRefs.current[idx] = el; }}
                            className={flashIdx === idx ? "subitem-flash" : undefined}
                            style={{ display: "flex", flexDirection: "column", gap: 4, padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, transition: "background 0.2s" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 10, fontWeight: 600 }}>Feature {idx + 1}</span>
                                <button onClick={() => { const nF = [...((p.features as any[]) || [])]; nF.splice(idx, 1); up("features", nF); }} style={{ background: "transparent", border: "none", color: "var(--error, red)", cursor: "pointer", fontSize: 12 }}>&times;</button>
                            </div>
                            <input value={feature.title} onChange={(e) => { const nF = [...((p.features as any[]) || [])]; nF[idx] = { ...nF[idx], title: e.target.value }; up("features", nF); }} placeholder="Feature Title" style={{ fontSize: 11, padding: "4px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, outline: "none", color: "var(--text)" }} />
                            <textarea value={feature.description} onChange={(e) => { const nF = [...((p.features as any[]) || [])]; nF[idx] = { ...nF[idx], description: e.target.value }; up("features", nF); }} placeholder="Feature Description" rows={2} style={{ fontSize: 11, padding: "4px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, outline: "none", color: "var(--text)", resize: "vertical" }} />
                            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                <div style={{ flex: 1 }}>
                                    <SelectInput
                                        value={feature.iconType || "icon"}
                                        onChange={(v) => {
                                            const nF = [...((p.features as any[]) || [])];
                                            nF[idx] = { ...nF[idx], iconType: v };
                                            up("features", nF);
                                        }}
                                        options={[{ label: "Icon", value: "icon" }, { label: "Image", value: "image" }]}
                                    />
                                </div>
                                <div style={{ flex: 2 }}>
                                    {feature.iconType === "image" ? (
                                        <MediaInput value={feature.image || ""} onChange={(v) => { const nF = [...((p.features as any[]) || [])]; nF[idx] = { ...nF[idx], image: v }; up("features", nF); }} placeholder="Image URL" />
                                    ) : (
                                        <IconPicker value={feature.icon || "Star"} onChange={(v) => { const nF = [...((p.features as any[]) || [])]; nF[idx] = { ...nF[idx], icon: v }; up("features", nF); }} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => { const nF = [...((p.features as any[]) || [])]; nF.push({ id: crypto.randomUUID(), title: "New Feature", description: "Describe it here.", icon: "Star" }); up("features", nF); }} style={{ padding: "6px 0", background: "var(--primary-light)", color: "var(--primary)", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Add Feature</button>
                </div>
            </Section>
            <AnimationPanel block={block} />
        </>
    );
}

export function TeamPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props as any;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    // Scroll-to + flash when a member card is clicked on canvas
    const memberRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [flashIdx, setFlashIdx] = React.useState<number | null>(null);
    useEffect(() => {
        let prev = useEditorStore.getState().subItemFocus;
        return useEditorStore.subscribe((state) => {
            const f = state.subItemFocus;
            if (f && f.blockId === block.id && f !== prev) {
                prev = f;
                const el = memberRefs.current[f.index];
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    setFlashIdx(f.index);
                    setTimeout(() => setFlashIdx(null), 2000);
                }
            }
        });
    }, [block.id]);

    return (
        <>
            <Section title="Content">
                <TypographyFields p={p} up={up} />
            </Section>
            <Section title="Layout & Grid">
                <LayoutFields p={p} up={up} options={{
                    layouts: [{ label: "Card Grid", value: "grid" }, { label: "Horizontal List (Photo Left)", value: "list" }, { label: "Large Cards (1 per row)", value: "large" }, { label: "Compact Row (Mini Cards)", value: "compact" }, { label: "Circular Spotlight", value: "spotlight" }]
                }} />
            </Section>
            <Section title="Card Styling">
                <CardFields p={p} up={up} />
                <Field label="Card Height"><TextInput value={(p.cardHeight as string) || "auto"} onChange={(v) => up("cardHeight", v)} placeholder="auto or 400px" /></Field>
                <Field label="Card Padding"><SelectInput value={(p.cardPadding as string) || "2rem 1.75rem"} onChange={(v) => up("cardPadding", v)} options={[{ label: "None", value: "0px" }, { label: "Compact (0.75rem 1rem)", value: "0.75rem 1rem" }, { label: "Small (1rem 1.25rem)", value: "1rem 1.25rem" }, { label: "Medium (1.5rem 1.5rem)", value: "1.5rem 1.5rem" }, { label: "Large (2rem 1.75rem)", value: "2rem 1.75rem" }, { label: "XL (3rem 2rem)", value: "3rem 2rem" }]} /></Field>
                <Field label="Text Padding"><SelectInput value={(p.cardContentPadding as string) || "1rem 1.25rem"} onChange={(v) => up("cardContentPadding", v)} options={[{ label: "None", value: "0px" }, { label: "Tight (0.5rem 0.75rem)", value: "0.5rem 0.75rem" }, { label: "Small (0.75rem 1rem)", value: "0.75rem 1rem" }, { label: "Medium (1rem 1.25rem)", value: "1rem 1.25rem" }, { label: "Large (1.5rem 1.5rem)", value: "1.5rem 1.5rem" }, { label: "XL (2rem 1.75rem)", value: "2rem 1.75rem" }]} /></Field>
            </Section>
            <Section title="Image Styling">
                <Field label="Image Style"><SelectInput value={(p.imageStyle as string) || "circle"} onChange={(v) => up("imageStyle", v)} options={[{ label: "Circle", value: "circle" }, { label: "Square", value: "square" }, { label: "Floating Cutout", value: "float" }, { label: "Card Cover", value: "cover" }]} /></Field>
                {p.imageStyle !== "cover" && (<>
                    <Field label="Image Size"><TextInput value={(p.imageSize as string) || "120px"} onChange={(v) => up("imageSize", v)} placeholder="120px" /></Field>
                    {p.imageStyle === "square" && (<Field label="Image Height"><TextInput value={(p.imageHeight as string) || "240px"} onChange={(v) => up("imageHeight", v)} placeholder="240px" /></Field>)}
                    <Field label="Image Radius"><BorderRadiusInput value={(p.imageRadius as string) || "50%"} onChange={(v) => up("imageRadius", v)} /></Field>
                    <Field label="Image Position"><SelectInput value={(p.imagePosition as string) || "center"} onChange={(v) => up("imagePosition", v)} options={[{ label: "Center", value: "center" }, { label: "Top", value: "top" }, { label: "Bottom", value: "bottom" }]} /></Field>
                </>)}
                {p.imageStyle === "cover" && (<Field label="Gradient Overlay"><ColorInput value={(p.coverGradientBottom as string) || "rgba(0,0,0,0.9)"} onChange={(v) => up("coverGradientBottom", v)} /></Field>)}
            </Section>
            <Section title="Colors">
                <Field label="Main Background"><ColorInput value={(p.bgColor as string) || "#ffffff"} onChange={(v) => up("bgColor", v)} /></Field>
                <Field label="Name Text"><ColorInput value={(p.nameColor as string) || "#0f172a"} onChange={(v) => up("nameColor", v)} /></Field>
                <Field label="Role Text"><ColorInput value={(p.roleColor as string) || "#64748b"} onChange={(v) => up("roleColor", v)} /></Field>
                <Field label="Description Text"><ColorInput value={(p.descColor as string) || "#475569"} onChange={(v) => up("descColor", v)} /></Field>
                <Field label="Social Links"><ColorInput value={(p.socialColor as string) || "#94a3b8"} onChange={(v) => up("socialColor", v)} /></Field>
            </Section>
            <Section title="Team Members">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {((p.members as any[]) || []).map((member, idx) => (
                        <div key={member.id || idx}
                            ref={(el) => { memberRefs.current[idx] = el; }}
                            className={flashIdx === idx ? "subitem-flash" : undefined}
                            style={{ background: "#1a1a1a", border: "1px solid #2d2d2d", borderRadius: 8, overflow: "hidden" }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#222", borderBottom: "1px solid #2d2d2d" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    {member.image ? (
                                        <img src={member.image} alt="" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #3a3a3a" }} />
                                    ) : (
                                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#333", border: "1.5px solid #3a3a3a", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 10, color: "#888" }}>?</span></div>
                                    )}
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0" }}>{member.name || "New Member"}</span>
                                    <span style={{ fontSize: 10, color: "#555", padding: "1px 6px", background: "#2a2a2a", borderRadius: 4 }}>{member.role || "—"}</span>
                                </div>
                                <button onClick={() => up("members", ((p.members as any[]) || []).filter((_, i) => i !== idx))} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")} onMouseLeave={(e) => (e.currentTarget.style.color = "#555")} title="Remove member">×</button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                {[{ label: "Name", field: "name", placeholder: "Full name" }, { label: "Role", field: "role", placeholder: "e.g. Lead Designer" }].map(({ label, field, placeholder }) => (
                                    <div key={field} style={{ display: "grid", gridTemplateColumns: "68px 1fr", alignItems: "center", borderBottom: "1px solid #222", padding: "0 10px" }}>
                                        <span style={{ fontSize: 10, color: "#666", fontWeight: 500 }}>{label}</span>
                                        <input value={(member[field] as string) || ""} onChange={(e) => up("members", ((p.members as any[]) || []).map((m, i) => i === idx ? { ...m, [field]: e.target.value } : m))} placeholder={placeholder} style={{ fontSize: 11, padding: "7px 0", background: "transparent", border: "none", outline: "none", color: "#e2e8f0", width: "100%" }} />
                                    </div>
                                ))}
                                <div style={{ display: "grid", gridTemplateColumns: "68px 1fr", alignItems: "start", borderBottom: "1px solid #222", padding: "6px 10px" }}>
                                    <span style={{ fontSize: 10, color: "#666", fontWeight: 500, paddingTop: 2 }}>Bio</span>
                                    <textarea value={member.description || ""} onChange={(e) => up("members", ((p.members as any[]) || []).map((m, i) => i === idx ? { ...m, description: e.target.value } : m))} placeholder="Short bio or description…" rows={2} style={{ fontSize: 11, padding: 0, background: "transparent", border: "none", outline: "none", color: "#e2e8f0", resize: "vertical", width: "100%", lineHeight: 1.5 }} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", alignItems: "center", borderBottom: "1px solid #222", padding: "0 10px" }}>
                                    <span style={{ fontSize: 10, color: "#666", fontWeight: 500 }}>Member Image</span>
                                    <div style={{ padding: "4px 0" }}>
                                        <MediaInput value={member.image || ""} onChange={(v) => up("members", ((p.members as any[]) || []).map((m, i) => i === idx ? { ...m, image: v } : m))} placeholder="https://…" />
                                    </div>
                                </div>
                                <div style={{ padding: "8px 10px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                        <div style={{ fontSize: 10, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Social Links</div>
                                        <select
                                            defaultValue=""
                                            onChange={(e) => {
                                                const plat = e.target.value;
                                                if (!plat) return;
                                                e.target.value = "";
                                                up("members", ((p.members as any[]) || []).map((m, i) => {
                                                    if (i !== idx) return m;
                                                    const socials = { ...(m.socials || {}) };
                                                    if (!socials[plat]) socials[plat] = { url: "", icon: "" };
                                                    return { ...m, socials };
                                                }));
                                            }}
                                            style={{ fontSize: 10, background: "#2a2a2a", color: "#94a3b8", border: "1px solid #333", borderRadius: 4, padding: "3px 5px", cursor: "pointer" }}
                                        >
                                            <option value="">+ Add</option>
                                            {[{ v: "twitter", l: "Twitter / X" }, { v: "linkedin", l: "LinkedIn" }, { v: "github", l: "GitHub" }, { v: "instagram", l: "Instagram" }, { v: "facebook", l: "Facebook" }, { v: "dribbble", l: "Dribbble" }, { v: "youtube", l: "YouTube" }, { v: "tiktok", l: "TikTok" }, { v: "email", l: "Email" }, { v: "website", l: "Website" }]
                                                .filter(o => !member.socials?.[o.v])
                                                .map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {Object.entries(member.socials || {}).map(([key, val]: [string, any]) => {
                                            const url = typeof val === "string" ? val : val?.url || "";
                                            const icon = typeof val === "object" ? val?.icon || "" : "";
                                            const LABELS: Record<string, string> = { twitter: "Twitter/X", linkedin: "LinkedIn", github: "GitHub", instagram: "Instagram", facebook: "Facebook", dribbble: "Dribbble", youtube: "YouTube", tiktok: "TikTok", email: "Email", website: "Website" };
                                            const setSocial = (field: "url" | "icon", v: string) => up("members", ((p.members as any[]) || []).map((m, i) => {
                                                if (i !== idx) return m;
                                                const updated = { ...(m.socials || {}) };
                                                updated[key] = { url: field === "url" ? v : url, icon: field === "icon" ? v : icon };
                                                return { ...m, socials: updated };
                                            }));
                                            const removeSocial = () => up("members", ((p.members as any[]) || []).map((m, i) => {
                                                if (i !== idx) return m;
                                                const s = { ...(m.socials || {}) };
                                                delete s[key];
                                                return { ...m, socials: s };
                                            }));
                                            return (
                                                <div key={key} style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 6, overflow: "hidden" }}>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", background: "#222", borderBottom: "1px solid #2a2a2a" }}>
                                                        <span style={{ fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>{LABELS[key] || key}</span>
                                                        <button onClick={removeSocial} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "0 2px" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")} onMouseLeave={(e) => (e.currentTarget.style.color = "#555")} title="Remove">×</button>
                                                    </div>
                                                    <div style={{ padding: "5px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                                                        <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", alignItems: "center", gap: 4 }}>
                                                            <span style={{ fontSize: 9, color: "#555", fontWeight: 600 }}>URL</span>
                                                            <input value={url} onChange={(e) => setSocial("url", e.target.value)} placeholder="https://…" style={{ fontSize: 10, padding: "4px 0", background: "transparent", border: "none", borderBottom: "1px solid #2a2a2a", outline: "none", color: "#94a3b8", width: "100%" }} />
                                                        </div>
                                                        <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", alignItems: "center", gap: 4 }}>
                                                            <span style={{ fontSize: 9, color: "#555", fontWeight: 600 }}>Icon</span>
                                                            <MediaInput value={icon} onChange={(v) => setSocial("icon", v)} placeholder="Upload or paste icon URL (optional)" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {Object.keys(member.socials || {}).length === 0 && (
                                            <div style={{ fontSize: 10, color: "#444", textAlign: "center", padding: "6px 0" }}>No social links yet. Use "+ Add" above.</div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                    <button onClick={() => { const nM = [...((p.members as any[]) || [])]; nM.push({ id: crypto.randomUUID(), name: "New Member", role: "Role", description: "", image: "https://placehold.co/400x400/e2e8f0/64748b?text=Image", socials: {} }); up("members", nM); }} style={{ padding: "6px 0", background: "var(--primary-light)", color: "var(--primary)", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Add Member</button>
                </div>
            </Section>
            <Section title="Padding (Responsive)">
                <Field label="Desktop"><TextInput value={(p.padding as string) || ""} onChange={(v) => up("padding", v)} placeholder="64px 24px" /></Field>
                <Field label="Tablet ≤ 1024px"><TextInput value={(p.tabletPadding as string) || ""} onChange={(v) => up("tabletPadding", v)} placeholder="48px 16px" /></Field>
                <Field label="Mobile ≤ 768px"><TextInput value={(p.mobilePadding as string) || ""} onChange={(v) => up("mobilePadding", v)} placeholder="32px 16px" /></Field>
            </Section>
            <AnimationPanel block={block} />
        </>
    );
}

export function PageSettingsPanel({ page }: { page: EditorPage }) {
    const { updateTheme, updatePageData, activeRouteId, setActiveRoute, addRoute, updateRoute, deleteRoute } = useEditorStore();
    const { user } = useAuth();
    const theme = page.theme || DEFAULT_THEME;
    const l = theme.layout || DEFAULT_THEME.layout!;
    const f = theme.features || DEFAULT_THEME.features!;
    const c = theme.colors || DEFAULT_THEME.colors;
    const upL = (key: string, val: string) => updateTheme({ layout: { ...l, [key]: val } });
    const upF = (key: string, val: unknown) => updateTheme({ features: { ...f, [key]: val } });
    const upP = (key: string, val: unknown) => updatePageData({ [key]: val });

    return (
        <aside style={{ width: 240, flexShrink: 0, background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Page Settings</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text)", fontWeight: 600 }}>Global Configuration</p>
            </div>

            <Section title="Pages & Navigation">
                <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 8, lineHeight: 1.4 }}>Manage routes and multiple pages.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(page.routes || []).map((route) => {
                        const isActive = route.id === activeRouteId;
                        return (
                            <div
                                key={route.id}
                                onClick={() => !isActive && setActiveRoute(route.id)}
                                style={{
                                    padding: "8px",
                                    background: isActive ? "rgba(99,102,241,0.08)" : "var(--surface)",
                                    border: `1px solid ${isActive ? "var(--primary)" : "var(--border)"}`,
                                    borderRadius: 6,
                                    cursor: isActive ? "default" : "pointer",
                                    transition: "all 0.2s",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                                onMouseEnter={e => !isActive && (e.currentTarget.style.borderColor = "var(--primary-light)")}
                                onMouseLeave={e => !isActive && (e.currentTarget.style.borderColor = "var(--border)")}
                            >
                                {isActive && (
                                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--primary)" }} />
                                )}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "var(--primary)" : "var(--text)" }}>{route.name}</span>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        {isActive ? (
                                            <span style={{ fontSize: 9, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Editing</span>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteRoute(route.id); }}
                                                style={{ padding: "2px 6px", fontSize: 10, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: 4, cursor: "pointer" }}
                                                title="Delete Page"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }} onClick={e => e.stopPropagation()}>
                                    <div>
                                        <span style={{ fontSize: 9, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Name</span>
                                        <input
                                            value={route.name}
                                            onChange={(e) => updateRoute(route.id, { name: e.target.value })}
                                            style={{ width: "100%", fontSize: 11, padding: "4px 6px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                                        />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: 9, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Path</span>
                                        <input
                                            value={route.path}
                                            onChange={(e) => updateRoute(route.id, { path: e.target.value })}
                                            style={{ width: "100%", fontSize: 11, padding: "4px 6px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", paddingTop: 6, borderTop: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }} title="Show this page in the header navigation">
                                        <input
                                            type="checkbox"
                                            checked={route.showInHeader !== false}
                                            onChange={(e) => updateRoute(route.id, { showInHeader: e.target.checked })}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <span style={{ fontSize: 9, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase" }}>In Header</span>
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }} title="Show this page in the footer navigation">
                                        <input
                                            type="checkbox"
                                            checked={!!route.showInFooter}
                                            onChange={(e) => updateRoute(route.id, { showInFooter: e.target.checked })}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <span style={{ fontSize: 9, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase" }}>In Footer</span>
                                    </label>
                                    <div style={{ width: "100%", height: 0 }} />
                                    <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={!!route.hideHeader}
                                            onChange={(e) => updateRoute(route.id, { hideHeader: e.target.checked })}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Hide Header</span>
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={!!route.hideFooter}
                                            onChange={(e) => updateRoute(route.id, { hideFooter: e.target.checked })}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Hide Footer</span>
                                    </label>
                                </div>
                            </div>
                        );
                    })}

                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [
                                { key: 'standard', label: 'Standard Page (H+F + Nav)', onClick: () => addRoute({ name: "New Page", path: "/new-page", showInHeader: true }) },
                                { key: 'ghost', label: 'Ghost Page (No H/F, No Nav)', onClick: () => addRoute({ name: "Ghost Page", path: "/ghost", hideHeader: true, hideFooter: true, showInHeader: false, showInFooter: false }) },
                                { key: 'no-header', label: 'No Header Layout', onClick: () => addRoute({ name: "No Header", path: "/page", hideHeader: true }) },
                                { key: 'no-footer', label: 'No Footer Layout', onClick: () => addRoute({ name: "No Footer", path: "/page", hideFooter: true }) },
                            ]
                        }}
                    >
                        <button
                            style={{
                                padding: "8px 0",
                                background: "var(--surface)",
                                border: "1px dashed var(--border)",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                color: "var(--primary)",
                                cursor: "pointer",
                                marginTop: 4,
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6
                            }}
                        >
                            <span style={{ fontSize: 14 }}>+</span> Add Page
                        </button>
                    </Dropdown>
                </div>
            </Section>
            <Section title="Global Theme">
                <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 8, lineHeight: 1.4 }}>Synchronize colors across all components.</div>
                <Field label="Primary Color">
                    <ColorInput
                        value={c.primary}
                        onChange={(v) => updateTheme({ colors: { ...c, primary: v } })}
                        onBlur={(v) => { updateTheme({ colors: { ...c, primary: v } }, true); useEditorStore.getState().migrateThemeColors(); }}
                    />
                </Field>
                <Field label="Secondary Color">
                    <ColorInput
                        value={c.secondary}
                        onChange={(v) => updateTheme({ colors: { ...c, secondary: v } })}
                        onBlur={(v) => updateTheme({ colors: { ...c, secondary: v } }, true)}
                    />
                </Field>
                <Field label="Button Text">
                    <ColorInput
                        value={c.buttonText || "#ffffff"}
                        onChange={(v) => updateTheme({ colors: { ...c, buttonText: v } })}
                        onBlur={(v) => updateTheme({ colors: { ...c, buttonText: v } }, true)}
                    />
                </Field>
                <Field label="Overlay Tint">
                    <ColorInput
                        value={c.overlay || "rgba(0,0,0,0.25)"}
                        onChange={(v) => updateTheme({ colors: { ...c, overlay: v } })}
                        onBlur={(v) => updateTheme({ colors: { ...c, overlay: v } }, true)}
                    />
                </Field>
                <button
                    onClick={() => useEditorStore.getState().migrateThemeColors()}
                    style={{ marginTop: 8, padding: "4px 8px", fontSize: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", color: "var(--text)" }}
                >
                    Sync all components now
                </button>
            </Section>
            <Section title="Visibility & Access">
                <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 12, lineHeight: 1.4 }}>Control who can view or use your page.</div>

                <Field label="Page Visibility">
                    <SelectInput
                        value={page.visibility || "PUBLIC"}
                        onChange={(v) => upP("visibility", v)}
                        options={[
                            { label: "Public (Everyone)", value: "PUBLIC" },
                            { label: "Private (Password)", value: "PRIVATE" }
                        ]}
                    />
                </Field>

                {page.visibility === "PRIVATE" && (
                    <Field label="Page Password">
                        <TextInput
                            value={page.password || ""}
                            onChange={(v) => upP("password", v)}
                            placeholder="Set access password"
                            type="password"
                        />
                    </Field>
                )}

                <div style={{ margin: "16px 0", height: 1, background: "var(--border)" }} />

                <ToggleInput
                    value={!!page.isPublic}
                    onChange={(v) => { upP("isPublic", v); if (v) upP("isTemplate", true); }}
                    label="Public Template"
                />
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4, paddingLeft: 28 }}>
                    Allows others to clone this design as a template.
                </div>

                {page.isPublic && (
                    <Field label="Template Category">
                        <SelectInput
                            value={page.category || "Other"}
                            onChange={(v) => upP("category", v)}
                            options={[{ label: "Portfolio", value: "Portfolio" }, { label: "Landing Page", value: "Landing Page" }, { label: "E-commerce", value: "E-commerce" }, { label: "Blog", value: "Blog" }, { label: "Other", value: "Other" }]}
                        />
                    </Field>
                )}
                {user?.role === "admin" && (
                    <>
                        <div style={{ margin: "12px 0", height: 1, background: "var(--border)" }} />
                        <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 8, lineHeight: 1.4 }}><span style={{ color: "var(--primary)", fontWeight: 600 }}>Admin Only:</span> Prevent others from editing this template directly.</div>
                        <ToggleInput value={!!page.isLocked} onChange={(v) => upP("isLocked", v)} label="Lock Template" />
                    </>
                )}
            </Section>
            <Section title="Global Container">
                <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 8, lineHeight: 1.4 }}>Controls max-width & horizontal padding for top-level blocks.</div>
                <Field label="Max Width"><TextInput value={l.maxWidth} onChange={(v) => upL("maxWidth", v)} placeholder="100dvw" /></Field>
                <PaddingFields p={{ padding: l.paddingX, tabletPadding: l.tabletPaddingX, mobilePadding: l.mobilePaddingX }} up={(key, val) => {
                    const map: any = { padding: "paddingX", tabletPadding: "tabletPaddingX", mobilePadding: "mobilePaddingX" };
                    upL(map[key], val);
                }} />
            </Section>
            <Section title="Page Features">
                {EDITOR_FEATURES.enableScrollToTop && (
                    <>
                        <ToggleInput value={f.scrollToTop} onChange={(v) => upF("scrollToTop", v)} label="Scroll to Top Button" />
                        {f.scrollToTop && (<>
                            <Field label="Position"><SelectInput value={f.scrollToTopPosition} onChange={(v) => upF("scrollToTopPosition", v)} options={[{ label: "Bottom Right", value: "bottom-right" }, { label: "Bottom Left", value: "bottom-left" }]} /></Field>
                            <Field label="Button Color"><ColorInput value={f.scrollToTopColor} onChange={(v) => upF("scrollToTopColor", v)} /></Field>
                        </>)}
                        {EDITOR_FEATURES.enableThemeToggle && <div style={{ margin: "16px 0", height: 1, background: "var(--border)" }} />}
                    </>
                )}
                {EDITOR_FEATURES.enableThemeToggle && (
                    <>
                        <ToggleInput value={f.themeSwitcher} onChange={(v) => upF("themeSwitcher", v)} label="Theme Switcher Button" />
                        {f.themeSwitcher && (<Field label="Position"><SelectInput value={f.themeSwitcherPosition} onChange={(v) => upF("themeSwitcherPosition", v)} options={[{ label: "Bottom Left", value: "bottom-left" }, { label: "Bottom Right", value: "bottom-right" }]} /></Field>)}
                    </>
                )}
            </Section>
        </aside>
    );
}

export function ContactFormPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p: any = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    return (
        <>
            <Section title="Destination">
                <Field label="Submit Mode">
                    <SelectInput
                        value={(p.mode as string) || "email"}
                        onChange={(v) => up("mode", v)}
                        options={[
                            { label: "Send Email", value: "email" },
                            { label: "API Webhook", value: "api" }
                        ]}
                    />
                </Field>
                {p.mode === "api" ? (
                    <Field label="API URL">
                        <TextInput value={(p.apiUrl as string) || ""} onChange={(v) => up("apiUrl", v)} placeholder="https://api.example.com/webhook" />
                    </Field>
                ) : (
                    <Field label="Receiver Email">
                        <TextInput value={(p.receiverEmail as string) || "ansh.official03@gmail.com"} onChange={(v) => up("receiverEmail", v)} placeholder="hello@yourdomain.com" />
                    </Field>
                )}
            </Section>

            <Section title="Form Setup">
                <Field label="Section Layout"><SelectInput value={(p.layout as string) || "centered"} onChange={(v) => up("layout", v)} options={[{ label: "Centered (Narrow)", value: "centered" }, { label: "Split — Form + Info Panel", value: "split" }, { label: "Full Width", value: "full" }, { label: "Card / Floating", value: "card" }]} /></Field>
                <ToggleInput value={p.showLastName !== false} onChange={(v) => up("showLastName", v)} label="Show Last Name Field" />
                <ToggleInput value={p.showGender === true} onChange={(v) => up("showGender", v)} label="Show Gender Field" />
            </Section>

            <Section title="Field Labels & Validation">
                <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                    <Field label="First Name"><TextInput value={(p.firstNameLabel as string) || "First Name"} onChange={(v) => up("firstNameLabel", v)} /></Field>
                    {p.mode === "api" && <Field label="Form Name"><TextInput value={(p.firstNameApiKey as string) || "firstName"} onChange={(v) => up("firstNameApiKey", v)} placeholder="firstName" /></Field>}
                </div>

                {p.showLastName !== false && (
                    <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                        <Field label="Last Name"><TextInput value={(p.lastNameLabel as string) || "Last Name"} onChange={(v) => up("lastNameLabel", v)} /></Field>
                        <ToggleInput value={p.lastNameRequired === true} onChange={(v) => up("lastNameRequired", v)} label="Required Field" />
                        {p.mode === "api" && <Field label="Form Name"><TextInput value={(p.lastNameApiKey as string) || "lastName"} onChange={(v) => up("lastNameApiKey", v)} placeholder="lastName" /></Field>}
                    </div>
                )}

                <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                    <Field label="Email"><TextInput value={(p.emailLabel as string) || "Email"} onChange={(v) => up("emailLabel", v)} /></Field>
                    {p.mode === "api" && <Field label="Form Name"><TextInput value={(p.emailApiKey as string) || "email"} onChange={(v) => up("emailApiKey", v)} placeholder="email" /></Field>}
                </div>

                {p.showGender === true && (
                    <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                        <Field label="Gender"><TextInput value={(p.genderLabel as string) || "Gender"} onChange={(v) => up("genderLabel", v)} /></Field>
                        <ToggleInput value={p.genderRequired !== false} onChange={(v) => up("genderRequired", v)} label="Required Field" />
                        {p.mode === "api" && <Field label="Form Name"><TextInput value={(p.genderApiKey as string) || "gender"} onChange={(v) => up("genderApiKey", v)} placeholder="gender" /></Field>}
                    </div>
                )}

                <div>
                    <Field label="Message"><TextInput value={(p.messageLabel as string) || "Message"} onChange={(v) => up("messageLabel", v)} /></Field>
                    {p.mode === "api" && <Field label="Form Name"><TextInput value={(p.messageApiKey as string) || "message"} onChange={(v) => up("messageApiKey", v)} placeholder="message" /></Field>}
                </div>
            </Section>



            <Section title="Submit Button">
                <ButtonFields p={p} up={up} prefix="button" textKey="submitLabel" />
                <ToggleInput value={p.buttonFullWidth !== false} onChange={(v) => up("buttonFullWidth", v)} label="Full Width Button" />
                {p.buttonFullWidth === false && (
                    <Field label="Alignment">
                        <SelectInput value={(p.buttonAlign as string) || "right"} onChange={(v) => up("buttonAlign", v)} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} />
                    </Field>
                )}
            </Section>

            <Section title="Feedback Messages">
                <Field label="Success"><TextInput value={(p.successMessage as string) || "Thanks! We'll get back to you shortly."} onChange={(v) => up("successMessage", v)} /></Field>
                <Field label="Error"><TextInput value={(p.errorMessage as string) || "Something went wrong. Please try again."} onChange={(v) => up("errorMessage", v)} /></Field>
            </Section>

            <Section title="Inside Text (Optional)">
                <TypographyFields p={p} up={up} prefix="title" />
            </Section>

            <Section title="Section Style">
                <Field label="Background"><ColorInput value={(p.sectionBg as string) || "transparent"} onChange={(v) => up("sectionBg", v)} placeholder="transparent" /></Field>
                <Field label="Padding"><TextInput value={(p.sectionPadding as string) || "4rem 1rem"} onChange={(v) => up("sectionPadding", v)} placeholder="4rem 1rem" /></Field>
            </Section>

            <Section title="Card Style">
                <Field label="Background"><ColorInput value={(p.bgColor as string) || "#ffffff"} onChange={(v) => up("bgColor", v)} /></Field>
                <Field label="Padding"><TextInput value={(p.padding as string) || "3rem 2rem"} onChange={(v) => up("padding", v)} /></Field>
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "20px"} onChange={(v) => up("borderRadius", v)} /></Field>
            </Section>

            <Section title="Input Style">
                <InputFields p={p} up={up} />
            </Section>
            <AnimationPanel block={block} />
        </>
    );
}

export function AccordionPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p: any = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    return (
        <>
            <Section title="Accordion Items">
                <div style={{ padding: "8px 0", fontSize: 11, color: "var(--text-subtle)" }}>Manage FAQ items below.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {((p.items as any[]) || []).map((item, idx) => (
                        <div key={item.id || idx} style={{ display: "flex", flexDirection: "column", gap: 4, padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 10, fontWeight: 600 }}>Item {idx + 1}</span>
                                <button onClick={() => { const nT = [...((p.items as any[]) || [])]; nT.splice(idx, 1); up("items", nT); }} style={{ background: "transparent", border: "none", color: "var(--error, red)", cursor: "pointer", fontSize: 12 }}>&times;</button>
                            </div>
                            <input value={item.title} onChange={(e) => { const nT = [...((p.items as any[]) || [])]; nT[idx] = { ...nT[idx], title: e.target.value }; up("items", nT); }} placeholder="Question / Title" style={{ fontSize: 11, padding: "4px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, outline: "none", color: "var(--text)" }} />
                            <textarea value={item.content} onChange={(e) => { const nT = [...((p.items as any[]) || [])]; nT[idx] = { ...nT[idx], content: e.target.value }; up("items", nT); }} placeholder="Answer / Content" rows={3} style={{ fontSize: 11, padding: "4px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, outline: "none", color: "var(--text)", resize: "vertical" }} />
                        </div>
                    ))}
                    <button onClick={() => { const nT = [...((p.items as any[]) || [])]; nT.push({ id: crypto.randomUUID(), title: "New FAQ", content: "Details here..." }); up("items", nT); }} style={{ padding: "6px 0", background: "var(--primary-light)", color: "var(--primary)", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Add FAQ Item</button>
                </div>
            </Section>

            <Section title="Layout & Style">
                <LayoutFields p={p} up={up} options={{
                    layouts: [{ label: "Contained", value: "contained" }, { label: "Separated", value: "separated" }, { label: "Minimal", value: "minimal" }],
                    showCols: false,
                    showAlign: false
                }} />
                <Field label="Divider"><SelectInput value={(p.divider as string) || "line"} onChange={(v) => up("divider", v)} options={[{ label: "Line", value: "line" }, { label: "None", value: "none" }]} /></Field>
                <Field label="Max Width"><TextInput value={(p.maxWidth as string) || "800px"} onChange={(v) => up("maxWidth", v)} placeholder="800px or 100%" /></Field>
                <Field label="Item Radius"><BorderRadiusInput value={(p.itemRadius as string) || "8px"} onChange={(v) => up("itemRadius", v)} /></Field>
            </Section>

            <Section title="Typography">
                <Field label="Title Size"><TextInput value={(p.titleSize as string) || "16px"} onChange={(v) => up("titleSize", v)} placeholder="16px" /></Field>
                <Field label="Title Weight"><SelectInput value={(p.titleWeight as string) || "600"} onChange={(v) => up("titleWeight", v)} options={[{ label: "Normal (400)", value: "400" }, { label: "Medium (500)", value: "500" }, { label: "Semibold (600)", value: "600" }, { label: "Bold (700)", value: "700" }]} /></Field>
                <Field label="Description Size"><TextInput value={(p.descSize as string) || "15px"} onChange={(v) => up("descSize", v)} placeholder="15px" /></Field>
            </Section>

            <Section title="Icon">
                <Field label="Icon Style"><SelectInput value={(p.iconStyle as string) || "chevron"} onChange={(v) => up("iconStyle", v)} options={[{ label: "Chevron", value: "chevron" }, { label: "Plus / Minus", value: "plus" }]} /></Field>
                <Field label="Icon Size"><TextInput value={(p.iconSize as string) || "20px"} onChange={(v) => up("iconSize", v)} placeholder="20px" /></Field>
                <Field label="Icon Color"><ColorInput value={(p.iconColor as string) || "var(--primary)"} onChange={(v) => up("iconColor", v)} /></Field>
            </Section>


            <Section title="Colors">
                <Field label="Main Background"><ColorInput value={(p.bgColor as string) || "transparent"} onChange={(v) => up("bgColor", v)} /></Field>
                <Field label="Item Background"><ColorInput value={(p.itemBgColor as string) || "#ffffff"} onChange={(v) => up("itemBgColor", v)} /></Field>
                <Field label="Item Border"><ColorInput value={(p.itemBorderColor as string) || "#e2e8f0"} onChange={(v) => up("itemBorderColor", v)} /></Field>
                <Field label="Title Color"><ColorInput value={(p.titleColor as string) || "#0f172a"} onChange={(v) => up("titleColor", v)} /></Field>
                <Field label="Content Color"><ColorInput value={(p.contentColor as string) || "#475569"} onChange={(v) => up("contentColor", v)} /></Field>
            </Section>

            <Section title="Container Padding">
                <Field label="Padding"><TextInput value={(p.padding as string) || "24px"} onChange={(v) => up("padding", v)} placeholder="e.g. 64px 24px" /></Field>
            </Section>

            <AnimationPanel block={block} />
        </>
    );
}

export function StatsPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p: any = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    return (
        <>
            <Section title="Layout & Style">
                <LayoutFields p={p} up={up} options={{
                    layouts: [{ label: "Grid", value: "grid" }, { label: "Strip", value: "strip" }, { label: "KPI Cards", value: "kpi" }]
                }} />
                <Field label="Background"><ColorInput value={(p.bgColor as string) || "transparent"} onChange={(v) => up("bgColor", v)} /></Field>
                <Field label="Text Color"><ColorInput value={(p.textColor as string) || "var(--text)"} onChange={(v) => up("textColor", v)} /></Field>
                <Field label="Accent Color"><ColorInput value={(p.accentColor as string) || "var(--primary)"} onChange={(v) => up("accentColor", v)} /></Field>
            </Section>

            <Section title="Card Styling">
                <Field label="Style"><SelectInput value={(p.cardStyle as string) || "none"} onChange={(v) => up("cardStyle", v)} options={[{ label: "None", value: "none" }, { label: "Solid Card", value: "card" }, { label: "Glassmorphism", value: "glass" }, { label: "Flat / Ghost", value: "flat" }]} /></Field>
                {p.cardStyle !== "none" && (
                    <>
                        <Field label="Card Background"><ColorInput value={(p.cardBg as string) || "var(--surface)"} onChange={(v) => up("cardBg", v)} /></Field>
                        <Field label="Corner Radius"><BorderRadiusInput value={(p.cardRadius as string) || "1.5rem"} onChange={(v) => up("cardRadius", v)} /></Field>
                    </>
                )}
            </Section>

            <Section title="Metric Items">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {((p.items as any[]) || []).map((item, idx) => (
                        <div key={item.id || idx} style={{ padding: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)" }}>Metric {idx + 1}</span>
                                <button onClick={() => { const nI = [...((p.items as any[]) || [])]; nI.splice(idx, 1); up("items", nI); }} style={{ background: "transparent", border: "none", color: "var(--error, red)", cursor: "pointer" }}>&times;</button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                                <TextInput value={item.value} onChange={(v) => { const nI = [...((p.items as any[]) || [])]; nI[idx] = { ...nI[idx], value: v }; up("items", nI); }} placeholder="420%" />
                                <TextInput value={item.unit} onChange={(v) => { const nI = [...((p.items as any[]) || [])]; nI[idx] = { ...nI[idx], unit: v }; up("items", nI); }} placeholder="Unit (e.g. %)" />
                            </div>
                            <TextInput value={item.label} onChange={(v) => { const nI = [...((p.items as any[]) || [])]; nI[idx] = { ...nI[idx], label: v }; up("items", nI); }} placeholder="Label (e.g. Growth)" style={{ marginBottom: 8 }} />
                            <div style={{ marginBottom: 8 }}>
                                <IconPicker value={item.icon || "Zap"} onChange={(v) => { const nI = [...((p.items as any[]) || [])]; nI[idx] = { ...nI[idx], icon: v }; up("items", nI); }} />
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <SelectInput value={item.trend || "none"} onChange={(v) => { const nI = [...((p.items as any[]) || [])]; nI[idx] = { ...nI[idx], trend: v }; up("items", nI); }} options={[{ label: "No Trend", value: "none" }, { label: "Up Trend", value: "up" }, { label: "Down Trend", value: "down" }]} />
                                {item.trend !== "none" && <TextInput value={item.trendValue} onChange={(v) => { const nI = [...((p.items as any[]) || [])]; nI[idx] = { ...nI[idx], trendValue: v }; up("items", nI); }} placeholder="12%" />}
                            </div>
                        </div>
                    ))}
                    <button onClick={() => { const nI = [...((p.items as any[]) || [])]; nI.push({ id: crypto.randomUUID(), value: "0", label: "New Stat", icon: "Activity" }); up("items", nI); }} style={{ padding: "8px", background: "var(--primary)", color: "white", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Add Metric</button>
                </div>
            </Section>
            <AnimationPanel block={block} />
        </>
    );
}

export function ChartPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p: any = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    return (
        <>
            <Section title="Chart Settings">
                <Field label="Type"><SelectInput value={(p.chartType as string) || "area"} onChange={(v) => up("chartType", v)} options={[{ label: "Area Chart", value: "area" }, { label: "Bar Chart", value: "bar" }, { label: "Line Chart", value: "line" }, { label: "Pie Chart", value: "pie" }, { label: "Donut Chart", value: "donut" }]} /></Field>
                <Field label="Height"><TextInput value={(p.height as string) || "300px"} onChange={(v) => up("height", v)} /></Field>
                <Field label="Primary Color"><ColorInput value={(p.color as string) || "var(--primary)"} onChange={(v) => up("color", v)} /></Field>
                <Field label="Secondary Color"><ColorInput value={(p.secondaryColor as string) || "var(--accent)"} onChange={(v) => up("secondaryColor", v)} /></Field>
            </Section>

            <Section title="Display Options">
                <ToggleInput label="Show Grid" value={p.showGrid !== false} onChange={(v) => up("showGrid", v)} />
                <ToggleInput label="X Axis" value={p.showXAxis !== false} onChange={(v) => up("showXAxis", v)} />
                <ToggleInput label="Y Axis" value={p.showYAxis !== false} onChange={(v) => up("showYAxis", v)} />
                <ToggleInput label="Tooltip" value={p.showTooltip !== false} onChange={(v) => up("showTooltip", v)} />
                <ToggleInput label="Legend" value={p.showLegend === true} onChange={(v) => up("showLegend", v)} />
                <Field label="Line Curve"><SelectInput value={(p.curve as string) || "smooth"} onChange={(v) => up("curve", v)} options={[{ label: "Smooth", value: "smooth" }, { label: "Step", value: "step" }, { label: "Linear", value: "linear" }]} /></Field>
            </Section>

            <Section title="Data Management">
                <div style={{ padding: "0 0 12px", borderBottom: `1px solid ${PANEL_COLORS.border}`, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: PANEL_COLORS.muted, textTransform: "uppercase" }}>Quick Bulk Edit</span>
                        <span style={{ fontSize: 9, color: PANEL_COLORS.muted, opacity: 0.6 }}>Format: Label, Value</span>
                    </div>
                    <textarea
                        style={{ width: "100%", background: PANEL_COLORS.bg, border: `1px solid ${PANEL_COLORS.border}`, borderRadius: 8, padding: 8, fontSize: 11, color: PANEL_COLORS.text, outline: "none", resize: "vertical", minHeight: 60 }}
                        placeholder="Jan, 400&#10;Feb, 600&#10;Mar, 800"
                        onBlur={(e) => {
                            const val = e.target.value.trim();
                            if (!val) return;
                            const lines = val.split("\n");
                            const newData = lines.map(line => {
                                const [name, value] = line.split(",").map(s => s.trim());
                                return { name: name || "New", value: Number(value) || 0 };
                            }).filter(d => d.name || d.value);
                            if (newData.length > 0) up("data", newData, true);
                            e.target.value = "";
                        }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 24px", gap: 8, padding: "0 4px" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: PANEL_COLORS.muted }}>LABEL</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: PANEL_COLORS.muted }}>VALUE</span>
                        <span></span>
                    </div>
                    {((p.data as any[]) || []).map((point, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 24px", gap: 6, alignItems: "center" }}>
                            <input
                                value={point.name}
                                onChange={(e) => { const nD = [...((p.data as any[]) || [])]; nD[idx] = { ...nD[idx], name: e.target.value }; up("data", nD); }}
                                onBlur={() => up("data", p.data, true)}
                                placeholder="Label"
                                style={{ background: PANEL_COLORS.inputBg, border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 6, padding: "5px 8px", fontSize: 11, color: PANEL_COLORS.text, outline: "none" }}
                            />
                            <input
                                value={point.value}
                                type="number"
                                onChange={(e) => { const nD = [...((p.data as any[]) || [])]; nD[idx] = { ...nD[idx], value: Number(e.target.value) || 0 }; up("data", nD); }}
                                onBlur={() => up("data", p.data, true)}
                                placeholder="0"
                                style={{ background: PANEL_COLORS.inputBg, border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 6, padding: "5px 8px", fontSize: 11, color: PANEL_COLORS.text, outline: "none" }}
                            />
                            <button onClick={() => { const nD = [...((p.data as any[]) || [])]; nD.splice(idx, 1); up("data", nD, true); }} style={{ background: "transparent", border: "none", color: PANEL_COLORS.muted, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.color = "#ef4444"} onMouseLeave={e => e.currentTarget.style.color = PANEL_COLORS.muted}>&times;</button>
                        </div>
                    ))}
                    <button onClick={() => { const nD = [...((p.data as any[]) || [])]; nD.push({ name: "New Item", value: 0 }); up("data", nD, true); }} style={{ marginTop: 4, padding: "8px", background: "rgba(0,153,255,0.1)", color: "#4db8ff", border: "1px dashed rgba(0,153,255,0.3)", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Add Data Point</button>
                </div>
            </Section>
            <AnimationPanel block={block} />
        </>
    );
}

export function LegalPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p: any = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    const joditConfig = useMemo(() => ({
        readonly: false,
        theme: "dark",
        height: 400,
        placeholder: 'Start typing here...',
        buttons: ['bold', 'italic', 'underline', 'strikethrough', 'ul', 'ol', 'font', 'fontsize', 'brush', 'image', 'table', 'link', 'align', 'undo', 'redo'],
        style: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' },
        // Improved paste behavior
        askBeforePasteFromWord: false,
        askBeforePasteHTML: false,
        defaultActionOnPaste: 'insert_clear_html',
    }), []);

    // Local state for debounced updates to the store
    const [localContent, setLocalContent] = React.useState(p.content || "");

    // Sync local state when external props change (e.g. undo/redo)
    React.useEffect(() => {
        if (p.content !== localContent) {
            setLocalContent(p.content || "");
        }
    }, [p.content]);

    // Debounce the store update
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (localContent !== p.content) {
                up("content", localContent);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localContent]);

    return (
        <>
            <Section title="Data Source">
                <Field label="Content Mode">
                    <SelectInput
                        value={(p.mode as string) || "manual"}
                        onChange={(v) => up("mode", v)}
                        options={[
                            { label: "Manual Editor", value: "manual" },
                            { label: "API Webhook", value: "api" }
                        ]}
                    />
                </Field>
                {p.mode === "api" && (
                    <>
                        <Field label="API URL">
                            <TextInput
                                value={(p.apiUrl as string) || ""}
                                onChange={(v) => up("apiUrl", v)}
                                placeholder="https://api.example.com/legal/tos"
                            />
                        </Field>
                        <Field label="Data Path">
                            <TextInput
                                value={(p.dataPath as string) || ""}
                                onChange={(v) => up("dataPath", v)}
                                placeholder="data.terms (leave empty for root)"
                            />
                        </Field>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                            Enter the path to the text content in the API response. Example: <code>data.terms</code>
                        </div>
                    </>
                )}
            </Section>

            {p.mode !== "api" && (
                <Section title="Manual Content">
                    <div style={{ marginBottom: 8, fontSize: 11, color: "var(--text-subtle)" }}>Edit your content using the rich text editor below:</div>
                    <div className="jodit-dark-theme-override">
                        <JoditEditor
                            value={localContent}
                            config={joditConfig}
                            onChange={(newContent: any) => setLocalContent(newContent)}
                            onBlur={(newContent: any) => {
                                setLocalContent(newContent);
                                up("content", newContent, true);
                            }}
                        />
                    </div>
                </Section>
            )}

            <Section title="Title Settings">
                <ToggleInput label="Show Title" value={p.showTitle !== false} onChange={(v) => up("showTitle", v)} />
                {p.showTitle !== false && (
                    <>
                        <TypographyFields p={p} up={up} />
                        <Field label="Title Alignment">
                            <SelectInput
                                value={(p.titleAlign as string) || "left"}
                                onChange={(v) => up("titleAlign", v)}
                                options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]}
                            />
                        </Field>
                        <Field label="Title Weight">
                            <SelectInput value={(p.titleFontWeight as string) || "700"} onChange={(v) => up("titleFontWeight", v)} options={[{ label: "Light (300)", value: "300" }, { label: "Regular (400)", value: "400" }, { label: "Medium (500)", value: "500" }, { label: "Semibold (600)", value: "600" }, { label: "Bold (700)", value: "700" }, { label: "Extrabold (800)", value: "800" }]} />
                        </Field>

                        <div style={{ marginTop: 12 }}>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Font Size (Responsive)</p>
                            <Field label="Desktop">
                                <TextInput value={(p.titleFontSize as string) || "2rem"} onChange={(v) => up("titleFontSize", v)} placeholder="2rem" />
                            </Field>
                            <Field label="Tablet">
                                <TextInput value={(p.titleTabletFontSize as string) || ""} onChange={(v) => up("titleTabletFontSize", v)} placeholder="1.75rem" />
                            </Field>
                            <Field label="Mobile">
                                <TextInput value={(p.titleMobileFontSize as string) || ""} onChange={(v) => up("titleMobileFontSize", v)} placeholder="1.5rem" />
                            </Field>
                        </div>
                    </>
                )}
            </Section>

            <Section title="Section Styling">
                <Field label="Background Color">
                    <ColorInput value={(p.bgColor as string) || "transparent"} onChange={(v) => up("bgColor", v)} onBlur={(v) => up("bgColor", v, true)} />
                </Field>
                <Field label="Text Color">
                    <ColorInput value={(p.textColor as string) || "var(--text)"} onChange={(v) => up("textColor", v)} onBlur={(v) => up("textColor", v, true)} />
                </Field>
                <Field label="Section Padding">
                    <TextInput value={(p.padding as string) || "64px 24px"} onChange={(v) => up("padding", v)} placeholder="64px 24px" />
                </Field>
                <AnimationPanel block={block} />
            </Section>
        </>
    );
}

export function DeleteAccountPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p: any = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    return (
        <>
            <Section title="API Configuration">
                <Field label="API URL">
                    <TextInput
                        value={(p.apiUrl as string) || ""}
                        onChange={(v) => up("apiUrl", v)}
                        placeholder="https://api.example.com/delete-account"
                    />
                </Field>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                    Endpoint to send the deletion request.
                </div>
            </Section>

            <Section title="Heading & Text">
                <TypographyFields p={p} up={up} prefix="title" />
            </Section>

            <Section title="Branding (Logo)">
                <ImageFields p={p} up={up} prefix="logo" />
                <Field label="Alignment">
                    <SelectInput
                        value={(p.logoAlign as string) || "center"}
                        onChange={(v) => up("logoAlign", v)}
                        options={[
                            { label: "Left", value: "left" },
                            { label: "Center", value: "center" },
                            { label: "Right", value: "right" }
                        ]}
                    />
                </Field>
                <Field label="Height"><TextInput value={(p.logoHeight as string) || "48px"} onChange={(v) => up("logoHeight", v)} placeholder="48px" /></Field>
                <Field label="Width"><TextInput value={(p.logoWidth as string) || "auto"} onChange={(v) => up("logoWidth", v)} placeholder="auto" /></Field>
            </Section>

            <Section title="Form Fields">
                <ToggleInput value={p.showFirstName === true} onChange={(v) => up("showFirstName", v)} label="Show First Name" />
                {p.showFirstName && <ToggleInput value={p.firstNameRequired === true} onChange={(v) => up("firstNameRequired", v)} label="First Name Required" />}

                <ToggleInput value={p.showLastName === true} onChange={(v) => up("showLastName", v)} label="Show Last Name" />
                {p.showLastName && <ToggleInput value={p.lastNameRequired === true} onChange={(v) => up("lastNameRequired", v)} label="Last Name Required" />}

                <ToggleInput value={p.reasonShow !== false} onChange={(v) => up("reasonShow", v)} label="Show Reason Select" />
                {p.reasonShow !== false && <ToggleInput value={p.reasonRequired === true} onChange={(v) => up("reasonRequired", v)} label="Reason Required" />}
            </Section>

            {p.reasonShow !== false && (
                <Section title="Reason Options">
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8 }}>Enter options one per line:</div>
                    <TextareaInput
                        value={(p.reasonOptions as string) || ""}
                        onChange={(v) => up("reasonOptions", v)}
                        placeholder="Privacy concerns&#10;Found better alternative..."
                        rows={5}
                    />
                </Section>
            )}

            <Section title="Delete Button">
                <ButtonFields p={p} up={up} prefix="button" hideLabel={true} />
                <Field label="Label">
                    <TextInput value={(p.submitLabel as string) || "Delete Account"} onChange={(v) => up("submitLabel", v)} />
                </Field>
            </Section>

            <Section title="Style & Background">
                <Field label="Section Background">
                    <ColorInput value={(p.sectionBg as string) || "transparent"} onChange={(v) => up("sectionBg", v)} placeholder="transparent" />
                </Field>
                <Field label="Section Padding">
                    <TextInput value={(p.sectionPadding as string) || "4rem 1rem"} onChange={(v) => up("sectionPadding", v)} placeholder="4rem 1rem" />
                </Field>
                <Field label="Card Background">
                    <ColorInput value={(p.bgColor as string) || "var(--surface)"} onChange={(v) => up("bgColor", v)} />
                </Field>
                <Field label="BG Image">
                    <MediaInput value={(p.bgImage as string) || ""} onChange={(v) => up("bgImage", v)} />
                </Field>
                <Field label="Text Color">
                    <ColorInput value={(p.textColor as string) || "var(--text)"} onChange={(v) => up("textColor", v)} />
                </Field>

                <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
                <InputFields p={p} up={up} />

                <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />

                <Field label="Padding">
                    <TextInput value={(p.padding as string) || "3rem 2rem"} onChange={(v) => up("padding", v)} />
                </Field>
                <Field label="Radius">
                    <BorderRadiusInput value={(p.borderRadius as string) || "20px"} onChange={(v) => up("borderRadius", v)} />
                </Field>
                <Field label="Shadow">
                    <ShadowInput value={(p.boxShadow as string) || ""} onChange={(v) => up("boxShadow", v)} />
                </Field>
            </Section>

            <Section title="Feedback Messages">
                <Field label="Success">
                    <TextInput value={(p.successMessage as string) || ""} onChange={(v) => up("successMessage", v)} placeholder="Success message" />
                </Field>
                <Field label="Error">
                    <TextInput value={(p.errorMessage as string) || ""} onChange={(v) => up("errorMessage", v)} placeholder="Error message" />
                </Field>
            </Section>

            <AnimationPanel block={block} />
        </>
    );
}

"use client";
import type { Block, EditorPage } from "@/@Types";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";

import { Section, Field, TextInput, SelectInput, ColorInput, BorderRadiusInput, ToggleInput, MediaInput, AnimationPanel } from "./shared";
import { EDITOR_FEATURES } from "@/lib/editorFeatures";
import { useAuth } from "@/hooks/useAuth";

export function FeaturesPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });

    return (
        <>
            <Section title="Content">
                <Field label="Title"><TextInput value={(p.title as string) || ""} onChange={(v) => up("title", v)} placeholder="Our Features" /></Field>
                <Field label="Subtitle"><TextInput value={(p.subtitle as string) || ""} onChange={(v) => up("subtitle", v)} placeholder="What makes us different" /></Field>
            </Section>
            <Section title="Layout & Style">
                <Field label="Columns"><SelectInput value={String(p.columns || "3")} onChange={(v) => up("columns", Number(v))} options={[{ label: "1 Column", value: "1" }, { label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" }]} /></Field>
                <Field label="Gap"><TextInput value={(p.gap as string) || "2rem"} onChange={(v) => up("gap", v)} placeholder="2rem" /></Field>
                <Field label="Text Alignment"><SelectInput value={(p.align as string) || "center"} onChange={(v) => up("align", v)} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} /></Field>
                <Field label="Background Color"><ColorInput value={(p.bgColor as string) || "#ffffff"} onChange={(v) => up("bgColor", v)} /></Field>
                <Field label="Text Color"><ColorInput value={(p.textColor as string) || "#1e293b"} onChange={(v) => up("textColor", v)} /></Field>
            </Section>
            <Section title="Card Styling">
                <Field label="Card Style"><SelectInput value={(p.cardStyle as string) || "raised"} onChange={(v) => up("cardStyle", v)} options={[{ label: "None (Text Only)", value: "none" }, { label: "Raised Shadow", value: "raised" }, { label: "Outlined", value: "outlined" }, { label: "Filled / Tinted", value: "filled" }]} /></Field>
                {(p.cardStyle === "raised" || p.cardStyle === "outlined") && (<Field label="Card Background"><ColorInput value={(p.cardBg as string) || "#ffffff"} onChange={(v) => up("cardBg", v)} /></Field>)}
                {p.cardStyle !== "none" && (<Field label="Border Radius"><BorderRadiusInput value={(p.cardRadius as string) || "16px"} onChange={(v) => up("cardRadius", v)} /></Field>)}
                {p.cardStyle === "raised" && (<>
                    <Field label="Card Shadow"><TextInput value={(p.cardShadow as string) || ""} onChange={(v) => up("cardShadow", v)} placeholder="0 4px 24px rgba(0,0,0,0.08)" /></Field>
                    <Field label="Card Hover Shadow"><TextInput value={(p.cardShadowHover as string) || ""} onChange={(v) => up("cardShadowHover", v)} placeholder="0 12px 40px rgba(0,0,0,0.12)" /></Field>
                </>)}
            </Section>
            <Section title="Typography">
                <Field label="Section Title Size"><TextInput value={(p.titleSize as string) || "2.25rem"} onChange={(v) => up("titleSize", v)} placeholder="2.25rem" /></Field>
                <Field label="Section Subtitle Size"><TextInput value={(p.subtitleSize as string) || "1.125rem"} onChange={(v) => up("subtitleSize", v)} placeholder="1.125rem" /></Field>
                <Field label="Card Title Size"><TextInput value={(p.cardTitleSize as string) || "1.2rem"} onChange={(v) => up("cardTitleSize", v)} placeholder="1.2rem" /></Field>
                <Field label="Card Description Size"><TextInput value={(p.cardDescSize as string) || "0.95rem"} onChange={(v) => up("cardDescSize", v)} placeholder="0.95rem" /></Field>
            </Section>
            <Section title="Icon Styling">
                <Field label="Icon Size"><TextInput value={String(p.iconSize || 24)} onChange={(v) => up("iconSize", Number(v) || 24)} placeholder="24" /></Field>
                <Field label="Icon Color"><ColorInput value={(p.iconColor as string) || "#6366f1"} onChange={(v) => up("iconColor", v)} /></Field>
                <Field label="Wrapper Size"><TextInput value={String(p.iconWrapperSize || 52)} onChange={(v) => up("iconWrapperSize", Number(v) || 52)} placeholder="52" /></Field>
                <Field label="Wrapper Radius"><BorderRadiusInput value={(p.iconRadius as string) || "14px"} onChange={(v) => up("iconRadius", v)} /></Field>
                <Field label="Wrapper Background"><TextInput value={(p.iconBg as string) || "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))"} onChange={(v) => up("iconBg", v)} placeholder="linear-gradient(...) or color" /></Field>
            </Section>
            <Section title="Padding (Responsive)">
                <Field label="Desktop"><TextInput value={(p.padding as string) || ""} onChange={(v) => up("padding", v)} placeholder="64px 24px" /></Field>
                <Field label="Tablet ≤ 1024px"><TextInput value={(p.tabletPadding as string) || ""} onChange={(v) => up("tabletPadding", v)} placeholder="48px 16px" /></Field>
                <Field label="Mobile ≤ 768px"><TextInput value={(p.mobilePadding as string) || ""} onChange={(v) => up("mobilePadding", v)} placeholder="32px 16px" /></Field>
            </Section>
            <Section title="Feature Items">
                <div style={{ padding: "8px 0", fontSize: 11, color: "var(--text-subtle)" }}>Add or remove feature items below.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {((p.features as any[]) || []).map((feature, idx) => (
                        <div key={feature.id || idx} style={{ display: "flex", flexDirection: "column", gap: 4, padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 10, fontWeight: 600 }}>Feature {idx + 1}</span>
                                <button onClick={() => { const nF = [...((p.features as any[]) || [])]; nF.splice(idx, 1); up("features", nF); }} style={{ background: "transparent", border: "none", color: "var(--error, red)", cursor: "pointer", fontSize: 12 }}>&times;</button>
                            </div>
                            <input value={feature.title} onChange={(e) => { const nF = [...((p.features as any[]) || [])]; nF[idx] = { ...nF[idx], title: e.target.value }; up("features", nF); }} placeholder="Feature Title" style={{ fontSize: 11, padding: "4px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, outline: "none", color: "var(--text)" }} />
                            <textarea value={feature.description} onChange={(e) => { const nF = [...((p.features as any[]) || [])]; nF[idx] = { ...nF[idx], description: e.target.value }; up("features", nF); }} placeholder="Feature Description" rows={2} style={{ fontSize: 11, padding: "4px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, outline: "none", color: "var(--text)", resize: "vertical" }} />
                            <input value={feature.icon} onChange={(e) => { const nF = [...((p.features as any[]) || [])]; nF[idx] = { ...nF[idx], icon: e.target.value }; up("features", nF); }} placeholder="Lucide Icon (e.g. Star)" style={{ fontSize: 11, padding: "4px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, outline: "none", color: "var(--text)" }} />
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
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });

    return (
        <>
            <Section title="Content">
                <Field label="Title"><TextInput value={(p.title as string) || ""} onChange={(v) => up("title", v)} placeholder="Meet Our Team" /></Field>
                <Field label="Subtitle"><TextInput value={(p.subtitle as string) || ""} onChange={(v) => up("subtitle", v)} placeholder="The people behind the magic" /></Field>
            </Section>
            <Section title="Layout & Grid">
                <Field label="Layout Type"><SelectInput value={(p.layout as string) || "grid"} onChange={(v) => up("layout", v)} options={[{ label: "Grid", value: "grid" }, { label: "List (Horizontal)", value: "list" }]} /></Field>
                {(p.layout as string) !== "list" && (
                    <Field label="Columns"><SelectInput value={String(p.columns || "3")} onChange={(v) => up("columns", Number(v))} options={[{ label: "1 Column", value: "1" }, { label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" }]} /></Field>
                )}
                <Field label="Card Spacing"><TextInput value={(p.gap as string) || "2rem"} onChange={(v) => up("gap", v)} placeholder="e.g. 1rem or 24px" /></Field>
                <Field label="Text Alignment"><SelectInput value={(p.align as string) || "center"} onChange={(v) => up("align", v)} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} /></Field>
            </Section>
            <Section title="Card Styling">
                <Field label="Card Style"><SelectInput value={(p.cardStyle as string) || "raised"} onChange={(v) => up("cardStyle", v)} options={[{ label: "None", value: "none" }, { label: "Raised Shadow", value: "raised" }, { label: "Outlined", value: "outlined" }, { label: "Filled / Tinted", value: "filled" }]} /></Field>
                {(p.cardStyle === "raised" || p.cardStyle === "outlined" || p.cardStyle === "filled") && (<Field label="Card Background"><ColorInput value={(p.cardBg as string) || "#ffffff"} onChange={(v) => up("cardBg", v)} /></Field>)}
                <Field label="Radius"><BorderRadiusInput value={(p.cardRadius as string) || "16px"} onChange={(v) => up("cardRadius", v)} /></Field>
                <Field label="Card Height"><TextInput value={(p.cardHeight as string) || "auto"} onChange={(v) => up("cardHeight", v)} placeholder="auto or 400px" /></Field>
                <Field label="Card Padding"><SelectInput value={(p.cardPadding as string) || "2rem 1.75rem"} onChange={(v) => up("cardPadding", v)} options={[{ label: "None", value: "0px" }, { label: "Compact (0.75rem 1rem)", value: "0.75rem 1rem" }, { label: "Small (1rem 1.25rem)", value: "1rem 1.25rem" }, { label: "Medium (1.5rem 1.5rem)", value: "1.5rem 1.5rem" }, { label: "Large (2rem 1.75rem)", value: "2rem 1.75rem" }, { label: "XL (3rem 2rem)", value: "3rem 2rem" }]} /></Field>
                <Field label="Text Padding"><SelectInput value={(p.cardContentPadding as string) || "1rem 1.25rem"} onChange={(v) => up("cardContentPadding", v)} options={[{ label: "None", value: "0px" }, { label: "Tight (0.5rem 0.75rem)", value: "0.5rem 0.75rem" }, { label: "Small (0.75rem 1rem)", value: "0.75rem 1rem" }, { label: "Medium (1rem 1.25rem)", value: "1rem 1.25rem" }, { label: "Large (1.5rem 1.5rem)", value: "1.5rem 1.5rem" }, { label: "XL (2rem 1.75rem)", value: "2rem 1.75rem" }]} /></Field>
                {(p.cardStyle === "raised" || p.cardStyle === "outlined") && (<Field label="Card Shadow"><SelectInput value={(p.cardShadow as string) || "0 4px 24px #0000001a"} onChange={(v) => up("cardShadow", v)} options={[{ label: "None", value: "none" }, { label: "Subtle", value: "0 1px 4px #0000001a" }, { label: "Soft", value: "0 4px 16px #0000001a" }, { label: "Medium (Default)", value: "0 4px 24px #0000001a, 0 1px 6px #0000000f" }, { label: "Elevated", value: "0 8px 32px #00000026, 0 2px 8px #0000001a" }, { label: "Deep", value: "0 16px 48px #00000033, 0 4px 16px #00000026" }, { label: "Glow Blue", value: "0 4px 32px #3b82f640, 0 1px 8px #3b82f626" }, { label: "Glow Purple", value: "0 4px 32px #8b5cf640, 0 1px 8px #8b5cf626" }]} /></Field>)}
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
                        <div key={member.id || idx} style={{ background: "#1a1a1a", border: "1px solid #2d2d2d", borderRadius: 8, overflow: "hidden" }}>
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
                                    <div style={{ fontSize: 10, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Social Links</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                        {[{ key: "twitter", label: "Twitter / X" }, { key: "linkedin", label: "LinkedIn" }, { key: "github", label: "GitHub" }, { key: "instagram", label: "Instagram" }, { key: "facebook", label: "Facebook" }, { key: "dribbble", label: "Dribbble" }].map(({ key, label }) => (
                                            <div key={key} style={{ display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "center", borderTop: "1px solid #282828" }}>
                                                <span style={{ fontSize: 10, color: "#555", padding: "6px 0" }}>{label}</span>
                                                <input value={member.socials?.[key] || ""} onChange={(e) => { const val = e.target.value; up("members", ((p.members as any[]) || []).map((m, i) => { if (i !== idx) return m; const socials = { ...(m.socials || {}) }; if (val) socials[key] = val; else delete socials[key]; return { ...m, socials }; })); }} placeholder="https://…" style={{ fontSize: 10, padding: "6px 0", background: "transparent", border: "none", outline: "none", color: "#94a3b8", width: "100%" }} />
                                            </div>
                                        ))}
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
    const { updateTheme, updatePageData } = useEditorStore();
    const { user } = useAuth();
    const l = page.theme?.layout || { maxWidth: "100dvw", paddingX: "32px", tabletPaddingX: "24px", mobilePaddingX: "16px" };
    const f = page.theme?.features || { scrollToTop: false, scrollToTopPosition: "bottom-right", scrollToTopColor: "#6366f1", themeSwitcher: true, themeSwitcherPosition: "bottom-left" };
    const upL = (key: string, val: string) => updateTheme({ layout: { ...l, [key]: val } });
    const upF = (key: string, val: unknown) => updateTheme({ features: { ...f, [key]: val } });
    const upP = (key: string, val: unknown) => updatePageData({ [key]: val });

    return (
        <aside style={{ width: 240, flexShrink: 0, background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Page Settings</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text)", fontWeight: 600 }}>Global Configuration</p>
            </div>
            <Section title="Visibility & Access">
                <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 8, lineHeight: 1.4 }}>Make this page public for others to view and duplicate.</div>
                <ToggleInput value={!!page.isPublic} onChange={(v) => { upP("isPublic", v); if (v) upP("isTemplate", true); }} label="Make Public" />
                {page.isPublic && (
                    <Field label="Category">
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
                <Field label="Desktop Padding X"><TextInput value={l.paddingX} onChange={(v) => upL("paddingX", v)} placeholder="32px" /></Field>
                <Field label="Tablet Padding X (≤ 1024)"><TextInput value={l.tabletPaddingX} onChange={(v) => upL("tabletPaddingX", v)} placeholder="24px" /></Field>
                <Field label="Mobile Padding X (≤ 768)"><TextInput value={l.mobilePaddingX} onChange={(v) => upL("mobilePaddingX", v)} placeholder="16px" /></Field>
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
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });

    return (
        <>
            <Section title="Destination Email">
                <Field label="Receiver Email"><TextInput value={(p.receiverEmail as string) || ""} onChange={(v) => up("receiverEmail", v)} placeholder="hello@yourdomain.com" /></Field>
            </Section>

            <Section title="Form Setup">
                <ToggleInput value={p.showLastName !== false} onChange={(v) => up("showLastName", v)} label="Show Last Name Field" />
            </Section>

            <Section title="Field Labels & Validation">
                <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                    <Field label="First Name"><TextInput value={(p.firstNameLabel as string) || "First Name"} onChange={(v) => up("firstNameLabel", v)} /></Field>
                    <ToggleInput value={p.firstNameRequired !== false} onChange={(v) => up("firstNameRequired", v)} label="Required Field" />
                </div>

                {p.showLastName !== false && (
                    <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                        <Field label="Last Name"><TextInput value={(p.lastNameLabel as string) || "Last Name"} onChange={(v) => up("lastNameLabel", v)} /></Field>
                        <ToggleInput value={p.lastNameRequired === true} onChange={(v) => up("lastNameRequired", v)} label="Required Field" />
                    </div>
                )}

                <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                    <Field label="Email"><TextInput value={(p.emailLabel as string) || "Email"} onChange={(v) => up("emailLabel", v)} /></Field>
                    <ToggleInput value={p.emailRequired !== false} onChange={(v) => up("emailRequired", v)} label="Required Field" />
                </div>

                <div>
                    <Field label="Message"><TextInput value={(p.messageLabel as string) || "Message"} onChange={(v) => up("messageLabel", v)} /></Field>
                    <ToggleInput value={p.messageRequired !== false} onChange={(v) => up("messageRequired", v)} label="Required Field" />
                </div>
            </Section>



            <Section title="Submit Button">
                <Field label="Button Text"><TextInput value={(p.submitLabel as string) || "Send Message →"} onChange={(v) => up("submitLabel", v)} /></Field>
                <Field label="Button Color"><ColorInput value={(p.buttonBg as string) || "#6366f1"} onChange={(v) => up("buttonBg", v)} /></Field>
                <Field label="Text Color"><ColorInput value={(p.buttonTextColor as string) || "#ffffff"} onChange={(v) => up("buttonTextColor", v)} /></Field>
                <Field label="Border Radius"><BorderRadiusInput value={(p.buttonBorderRadius as string) || "10px"} onChange={(v) => up("buttonBorderRadius", v)} /></Field>
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
                <Field label="Title"><TextInput value={(p.titleText as string) || ""} onChange={(v) => up("titleText", v)} placeholder="Send us a message" /></Field>
                <Field label="Subtitle"><TextInput value={(p.subtitleText as string) || ""} onChange={(v) => up("subtitleText", v)} placeholder="We'd love to hear from you." /></Field>
                <Field label="Title Color"><ColorInput value={(p.titleColor as string) || "#0f172a"} onChange={(v) => up("titleColor", v)} /></Field>
                <Field label="Subtitle Color"><ColorInput value={(p.subtitleColor as string) || "#64748b"} onChange={(v) => up("subtitleColor", v)} /></Field>
            </Section>

            <Section title="Container Style">
                <Field label="Background"><ColorInput value={(p.bgColor as string) || "#ffffff"} onChange={(v) => up("bgColor", v)} /></Field>
                <Field label="Padding"><TextInput value={(p.padding as string) || "3rem 2rem"} onChange={(v) => up("padding", v)} /></Field>
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "20px"} onChange={(v) => up("borderRadius", v)} /></Field>
            </Section>

            <Section title="Input Style">
                <Field label="Background"><ColorInput value={(p.inputBg as string) || "#f8fafc"} onChange={(v) => up("inputBg", v)} /></Field>
                <Field label="Border Color"><ColorInput value={(p.inputBorderColor as string) || "#e2e8f0"} onChange={(v) => up("inputBorderColor", v)} /></Field>
                <Field label="Focus Color"><ColorInput value={(p.inputFocusBorderColor as string) || "#6366f1"} onChange={(v) => up("inputFocusBorderColor", v)} /></Field>
                <Field label="Text Color"><ColorInput value={(p.inputTextColor as string) || "#111827"} onChange={(v) => up("inputTextColor", v)} /></Field>
                <Field label="Label Color"><ColorInput value={(p.labelColor as string) || "#374151"} onChange={(v) => up("labelColor", v)} /></Field>
            </Section>
            <AnimationPanel block={block} />
        </>
    );
}

export function AccordionPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });

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
                <Field label="Variant"><SelectInput value={(p.variant as string) || "contained"} onChange={(v) => up("variant", v)} options={[{ label: "Contained", value: "contained" }, { label: "Separated", value: "separated" }, { label: "Minimal", value: "minimal" }]} /></Field>
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
                <Field label="Icon Color"><ColorInput value={(p.iconColor as string) || "#6366f1"} onChange={(v) => up("iconColor", v)} /></Field>
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


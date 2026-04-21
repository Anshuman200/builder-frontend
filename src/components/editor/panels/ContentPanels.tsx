"use client";
import type { Block, EditorPage } from "@/types";
import React, { useMemo, useEffect, useRef } from "react";
import { useEditorStore, DEFAULT_THEME } from "@/stores/editorStore";

import {
    Section, Field, TextInput, TextareaInput, SelectInput, ColorInput, BorderRadiusInput, ToggleInput, MediaInput, PANEL_COLORS, ShadowInput,
    TypographyFields, LayoutFields, CardFields, ButtonFields, ImageFields, PaddingFields,
    InputFields,
    ToggleSwitch, AlignmentInput, PaddingInput, SortableList, arrayMove,
    TextInputWithUnit, useSubItemFocus
} from "./shared";
import { AnimationPanel } from "./AnimationPanel";
import { IconPicker } from "../IconPicker";
import { EDITOR_FEATURES } from "@/lib/config/features";
import { Dropdown } from "antd";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false }) as any;

export function FeaturesPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props as any;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    const { flashIdx, itemRefs } = useSubItemFocus(block.id);

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
                <Field label="Section Title Size"><TextInputWithUnit value={(p.titleSize as string) || "2.25rem"} onChange={(v) => up("titleSize", v)} placeholder="2.25rem" /></Field>
                <Field label="Section Subtitle Size"><TextInputWithUnit value={(p.subtitleSize as string) || "1.125rem"} onChange={(v) => up("subtitleSize", v)} placeholder="1.125rem" /></Field>
                <Field label="Card Title Size"><TextInputWithUnit value={(p.cardTitleSize as string) || "1.2rem"} onChange={(v) => up("cardTitleSize", v)} placeholder="1.2rem" /></Field>
                <Field label="Card Description Size"><TextInputWithUnit value={(p.cardDescSize as string) || "0.95rem"} onChange={(v) => up("cardDescSize", v)} placeholder="0.95rem" /></Field>
            </Section>
            <Section title="Icon Styling">
                <Field label="Icon Size"><TextInputWithUnit value={String(p.iconSize || 24)} onChange={(v) => up("iconSize", v)} placeholder="24px" /></Field>
                <Field label="Icon Color"><ColorInput value={(p.iconColor as string) || "var(--primary)"} onChange={(v) => up("iconColor", v)} onBlur={(v) => up("iconColor", v, true)} /></Field>
                <Field label="Wrapper Size"><TextInputWithUnit value={String(p.iconWrapperSize || 52)} onChange={(v) => up("iconWrapperSize", v)} placeholder="52px" /></Field>
                <Field label="Wrapper Radius"><BorderRadiusInput value={(p.iconRadius as string) || "14px"} onChange={(v) => up("iconRadius", v)} /></Field>
                <Field label="Wrapper Background"><ColorInput value={(p.iconBg as string) || "rgba(var(--primary-rgb), 0.15)"} onChange={(v) => up("iconBg", v)} onBlur={(v) => up("iconBg", v, true)} /></Field>
            </Section>
            <Section title="Section Padding (Responsive)">
                <PaddingFields p={p} up={up} />
            </Section>
            <Section title="Feature Items">
                <div style={{ padding: "8px 0", fontSize: 11, color: "var(--text-subtle)" }}>Add or remove feature items below.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <SortableList
                        items={(p.features as any[]) || []}
                        onReorder={(activeId, overId) => {
                            const oldIndex = (p.features as any[]).findIndex((f) => f.id === activeId);
                            const newIndex = (p.features as any[]).findIndex((f) => f.id === overId);
                            up("features", arrayMove(p.features as any[], oldIndex, newIndex), true);
                        }}
                        onDelete={(idx) => {
                            const nF = [...((p.features as any[]) || [])];
                            nF.splice(idx, 1);
                            up("features", nF, true);
                        }}
                        renderItemContent={(feature, idx) => (
                            <div
                                ref={(el) => { itemRefs.current[idx] = el; }}
                                className={flashIdx === idx ? "subitem-highlight" : undefined}
                                style={{ display: "flex", flexDirection: "column", gap: 4, transition: "background 0.2s" }}
                            >
                                <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, letterSpacing: "0.05em", marginBottom: 2 }}>FEATURE {idx + 1}</span>
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
                        )}
                    />
                    <button onClick={() => { const nF = [...((p.features as any[]) || [])]; nF.push({ id: crypto.randomUUID(), title: "New Feature", description: "Describe it here.", icon: "Star" }); up("features", nF, true); }} style={{ padding: "8px 0", background: "rgba(99,102,241,0.08)", color: "var(--primary)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", marginTop: 4, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}>+ Add Feature</button>
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

    const { flashIdx, itemRefs } = useSubItemFocus(block.id);

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
                <Field label="Card Height"><TextInputWithUnit value={(p.cardHeight as string) || "auto"} onChange={(v) => up("cardHeight", v)} placeholder="auto or 400px" /></Field>
                <PaddingInput label="Card Padding" value={(p.cardPadding as string) || "2rem 1.75rem"} onChange={(v) => up("cardPadding", v)} />
                <PaddingInput label="Text Padding" value={(p.cardContentPadding as string) || "1rem 1.25rem"} onChange={(v) => up("cardContentPadding", v)} />
            </Section>
            <Section title="Image Styling">
                <Field label="Image Style"><SelectInput value={(p.imageStyle as string) || "circle"} onChange={(v) => up("imageStyle", v)} options={[{ label: "Circle", value: "circle" }, { label: "Square", value: "square" }, { label: "Floating Cutout", value: "float" }, { label: "Card Cover", value: "cover" }]} /></Field>
                {p.imageStyle !== "cover" && (<>
                    <Field label="Image Size"><TextInputWithUnit value={(p.imageSize as string) || "120px"} onChange={(v) => up("imageSize", v)} placeholder="120px" /></Field>
                    {p.imageStyle === "square" && (<Field label="Image Height"><TextInputWithUnit value={(p.imageHeight as string) || "240px"} onChange={(v) => up("imageHeight", v)} placeholder="240px" /></Field>)}
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
                    <SortableList
                        items={(p.members as any[]) || []}
                        onReorder={(activeId, overId) => {
                            const oldIndex = (p.members as any[]).findIndex((m) => m.id === activeId);
                            const newIndex = (p.members as any[]).findIndex((m) => m.id === overId);
                            up("members", arrayMove(p.members as any[], oldIndex, newIndex), true);
                        }}
                        onDelete={(idx) => {
                            const nM = [...((p.members as any[]) || [])];
                            nM.splice(idx, 1);
                            up("members", nM, true);
                        }}
                        renderItemContent={(member, idx) => (
                            <div
                                ref={(el) => { itemRefs.current[idx] = el; }}
                                className={flashIdx === idx ? "subitem-highlight" : undefined}
                                style={{ background: "#222", borderRadius: 6, overflow: "hidden", border: "1px solid #333", transition: "all 0.3s" }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", background: "#282828", borderBottom: "1px solid #333" }}>
                                    {member.image ? (
                                        <img src={member.image} alt="" style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }} />
                                    ) : (
                                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#444" }} />
                                    )}
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{member.name || "Member"}</span>
                                    <span style={{ fontSize: 9, color: "#666", marginLeft: "auto" }}>ROLE: {member.role || "—"}</span>
                                </div>
                                <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                                    <TextInput value={member.name} onChange={(v) => up("members", p.members.map((m: any, i: number) => i === idx ? { ...m, name: v } : m))} placeholder="Name" />
                                    <TextInput value={member.role} onChange={(v) => up("members", p.members.map((m: any, i: number) => i === idx ? { ...m, role: v } : m))} placeholder="Role" />
                                    <TextareaInput value={member.description} onChange={(v) => up("members", p.members.map((m: any, i: number) => i === idx ? { ...m, description: v } : m))} placeholder="Bio" rows={2} />
                                    <MediaInput value={member.image} onChange={(v) => up("members", p.members.map((m: any, i: number) => i === idx ? { ...m, image: v } : m))} />
                                </div>
                            </div>
                        )}
                    />
                    <button onClick={() => { const nM = [...((p.members as any[]) || [])]; nM.push({ id: crypto.randomUUID(), name: "New Member", role: "Role", description: "", image: "https://placehold.co/400x400/e2e8f0/64748b?text=Image", socials: {} }); up("members", nM, true); }} style={{ padding: "8px 0", background: "rgba(99,102,241,0.08)", color: "var(--primary)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", marginTop: 4, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}>+ Add Member</button>
                </div>
            </Section>
            <Section title="Section Padding (Responsive)">
                <PaddingFields p={p} up={up} />
            </Section>
            <AnimationPanel block={block} />
        </>
    );
}

export function PageSettingsPanel({ page }: { page: EditorPage }) {
    const { updateTheme, updatePageData, activeRouteId, setActiveRoute, addRoute, updateRoute, deleteRoute } = useEditorStore();
    const theme = page.theme || DEFAULT_THEME;
    const l = theme.layout || DEFAULT_THEME.layout!;
    const f = theme.features || DEFAULT_THEME.features!;
    const c = theme.colors || DEFAULT_THEME.colors;
    const upL = (key: string, val: string) => updateTheme({ layout: { ...l, [key]: val } });
    const upF = (key: string, val: unknown) => updateTheme({ features: { ...f, [key]: val } });

    return (
        <aside style={{ width: 380, flexShrink: 0, background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Page Settings</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text)", fontWeight: 600 }}>Global Configuration</p>
            </div>

            <Section title="Pages & Navigation">
                <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 8, lineHeight: 1.4 }}>Manage routes and multipage structure.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <SortableList
                        items={(page.routes || [])}
                        onReorder={(activeId, overId) => {
                            const oldIndex = (page.routes || []).findIndex((r) => r.id === activeId);
                            const newIndex = (page.routes || []).findIndex((r) => r.id === overId);
                            updatePageData({ routes: arrayMove(page.routes || [], oldIndex, newIndex) }, true);
                        }}
                        renderItemContent={(route) => {
                            const isActive = route.id === activeRouteId;
                            return (
                                <div
                                    onClick={() => !isActive && setActiveRoute(route.id)}
                                    style={{
                                        padding: "8px",
                                        background: isActive ? "rgba(99,102,241,0.08)" : "var(--surface)",
                                        border: isActive ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                                        borderRadius: 6,
                                        cursor: isActive ? "default" : "pointer",
                                        transition: "all 0.2s",
                                        width: "100%"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "var(--primary)" : "var(--text)" }}>{route.name}</span>
                                        {!isActive && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteRoute(route.id); }}
                                                style={{ padding: "2px 6px", fontSize: 10, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: 4, cursor: "pointer" }}
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }} onClick={e => e.stopPropagation()}>
                                        <TextInput value={route.name} onChange={(v) => updateRoute(route.id, { name: v })} placeholder="Name" />
                                        <TextInput value={route.path} onChange={(v) => updateRoute(route.id, { path: v })} placeholder="Path" />
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px" }} onClick={e => e.stopPropagation()}>
                                        <label style={{ fontSize: 9, display: "flex", alignItems: "center", gap: 4, color: route.showInHeader !== false ? "var(--primary)" : "var(--text-muted)", fontWeight: 600 }}>
                                            <input type="checkbox" checked={route.showInHeader !== false} onChange={(e) => updateRoute(route.id, { showInHeader: e.target.checked })} />
                                            HEADER
                                        </label>
                                        <label style={{ fontSize: 9, display: "flex", alignItems: "center", gap: 4, color: route.showInFooter ? "var(--primary)" : "var(--text-muted)", fontWeight: 600 }}>
                                            <input type="checkbox" checked={!!route.showInFooter} onChange={(e) => updateRoute(route.id, { showInFooter: e.target.checked })} />
                                            FOOTER
                                        </label>
                                    </div>
                                </div>
                            );
                        }}
                    />
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
                        <button style={{ padding: "8px 0", background: "rgba(99,102,241,0.08)", color: "var(--primary)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", marginTop: 4, width: "100%" }}>+ Add Page</button>
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
            <Section title="Global Container">
                <div style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 8, lineHeight: 1.4 }}>Controls max-width & horizontal padding for top-level blocks.</div>
                <Field label="Max Width"><TextInputWithUnit value={l.maxWidth} onChange={(v) => upL("maxWidth", v)} placeholder="100dvw" /></Field>
                <PaddingFields p={{ padding: l.paddingX, tabletPadding: l.tabletPaddingX, mobilePadding: l.mobilePaddingX }} up={(key, val) => {
                    const map: any = { padding: "paddingX", tabletPadding: "tabletPaddingX", mobilePadding: "mobilePaddingX" };
                    upL(map[key], val);
                }} />
            </Section>
            <Section title="Page Features">
                {EDITOR_FEATURES.enableScrollToTop && (
                    <>
                        <ToggleSwitch value={f.scrollToTop} onChange={(v) => upF("scrollToTop", v)} label="Scroll to Top Button" />
                        {f.scrollToTop && (<>
                            <Field label="Position"><SelectInput value={f.scrollToTopPosition} onChange={(v) => upF("scrollToTopPosition", v)} options={[{ label: "Bottom Right", value: "bottom-right" }, { label: "Bottom Left", value: "bottom-left" }]} /></Field>
                            <Field label="Button Color"><ColorInput value={f.scrollToTopColor} onChange={(v) => upF("scrollToTopColor", v)} /></Field>
                        </>)}
                        {EDITOR_FEATURES.enableThemeToggle && <div style={{ margin: "16px 0", height: 1, background: "var(--border)" }} />}
                    </>
                )}
                {EDITOR_FEATURES.enableThemeToggle && (
                    <>
                        <ToggleSwitch value={f.themeSwitcher} onChange={(v) => upF("themeSwitcher", v)} label="Theme Switcher Button" />
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
                <ToggleSwitch value={p.showLastName !== false} onChange={(v) => up("showLastName", v)} label="Show Last Name Field" />
                <ToggleSwitch value={p.showGender === true} onChange={(v) => up("showGender", v)} label="Show Gender Field" />
            </Section>

            <Section title="Spacing">
                <Field label="Section Background"><ColorInput value={(p.sectionBg as string) || "transparent"} onChange={(v) => up("sectionBg", v)} placeholder="transparent" /></Field>
                <PaddingInput label="Section Padding" value={(p.sectionPadding as string) || "4rem 1rem"} onChange={(v) => up("sectionPadding", v)} placeholder="4rem 1rem" />
            </Section>

            <Section title="Card Style">
                <Field label="Card Background"><ColorInput value={(p.bgColor as string) || "#ffffff"} onChange={(v) => up("bgColor", v)} /></Field>
                <PaddingInput label="Card Padding" value={(p.padding as string) || "3rem 2rem"} onChange={(v) => up("padding", v)} placeholder="3rem 2rem" />
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "20px"} onChange={(v) => up("borderRadius", v)} /></Field>
            </Section>

            <Section title="Input Style">
                <InputFields p={p} up={up} />
            </Section>

            <Section title="Field Labels &amp; Validation">
                <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                    <Field label="First Name"><TextInput value={(p.firstNameLabel as string) || "First Name"} onChange={(v) => up("firstNameLabel", v)} /></Field>
                    {p.mode === "api" && <Field label="Form Name"><TextInput value={(p.firstNameApiKey as string) || "firstName"} onChange={(v) => up("firstNameApiKey", v)} placeholder="firstName" /></Field>}
                </div>

                {p.showLastName !== false && (
                    <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                        <Field label="Last Name"><TextInput value={(p.lastNameLabel as string) || "Last Name"} onChange={(v) => up("lastNameLabel", v)} /></Field>
                        <ToggleSwitch value={p.lastNameRequired === true} onChange={(v) => up("lastNameRequired", v)} label="Required Field" />
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
                        <ToggleSwitch value={p.genderRequired !== false} onChange={(v) => up("genderRequired", v)} label="Required Field" />
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
                <ToggleSwitch value={p.buttonFullWidth !== false} onChange={(v) => up("buttonFullWidth", v)} label="Full Width Button" />
                {p.buttonFullWidth === false && (
                    <AlignmentInput label="Alignment" value={(p.buttonAlign as string) || "right"} onChange={(v) => up("buttonAlign", v)} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} />
                )}
            </Section>

            <Section title="Feedback Messages">
                <Field label="Success"><TextInput value={(p.successMessage as string) || "Thanks! We'll get back to you shortly."} onChange={(v) => up("successMessage", v)} /></Field>
                <Field label="Error"><TextInput value={(p.errorMessage as string) || "Something went wrong. Please try again."} onChange={(v) => up("errorMessage", v)} /></Field>
            </Section>

            <Section title="Inside Text (Optional)">
                <TypographyFields p={p} up={up} prefix="title" />
            </Section>

            <AnimationPanel block={block} />
        </>
    );
}

export function AccordionPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p: any = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    const { flashIdx, itemRefs } = useSubItemFocus(block.id);

    return (
        <>
            <Section title="Accordion Items">
                <div style={{ padding: "8px 0", fontSize: 11, color: "var(--text-subtle)" }}>Manage FAQ items below.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <SortableList
                        items={(p.items as any[]) || []}
                        onReorder={(activeId, overId) => {
                            const oldIndex = (p.items as any[]).findIndex((i) => i.id === activeId);
                            const newIndex = (p.items as any[]).findIndex((i) => i.id === overId);
                            up("items", arrayMove(p.items as any[], oldIndex, newIndex), true);
                        }}
                        onDelete={(idx) => {
                            const nT = [...((p.items as any[]) || [])];
                            nT.splice(idx, 1);
                            up("items", nT, true);
                        }}
                        renderItemContent={(item, idx) => (
                            <div
                                ref={(el) => { itemRefs.current[idx] = el; }}
                                className={flashIdx === idx ? "subitem-highlight" : undefined}
                                style={{ display: "flex", flexDirection: "column", gap: 4, transition: "background 0.2s" }}
                            >
                                <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, letterSpacing: "0.05em", marginBottom: 2 }}>ITEM {idx + 1}</span>
                                <input value={item.title} onChange={(e) => { const nT = [...((p.items as any[]) || [])]; nT[idx] = { ...nT[idx], title: e.target.value }; up("items", nT); }} placeholder="Question / Title" style={{ fontSize: 11, padding: "4px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, outline: "none", color: "var(--text)" }} />
                                <textarea value={item.content} onChange={(e) => { const nT = [...((p.items as any[]) || [])]; nT[idx] = { ...nT[idx], content: e.target.value }; up("items", nT); }} placeholder="Answer / Content" rows={3} style={{ fontSize: 11, padding: "4px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, outline: "none", color: "var(--text)", resize: "vertical" }} />
                            </div>
                        )}
                    />
                    <button onClick={() => { const nT = [...((p.items as any[]) || [])]; nT.push({ id: crypto.randomUUID(), title: "New FAQ", content: "Details here..." }); up("items", nT, true); }} style={{ padding: "8px 0", background: "rgba(99,102,241,0.08)", color: "var(--primary)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", marginTop: 4, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}>+ Add FAQ Item</button>
                </div>
            </Section>

            <Section title="Layout & Style">
                <LayoutFields p={p} up={up} options={{
                    layouts: [{ label: "Contained", value: "contained" }, { label: "Separated", value: "separated" }, { label: "Minimal", value: "minimal" }],
                    showCols: false,
                    showAlign: false
                }} />
                <Field label="Divider"><SelectInput value={(p.divider as string) || "line"} onChange={(v) => up("divider", v)} options={[{ label: "Line", value: "line" }, { label: "None", value: "none" }]} /></Field>
                <Field label="Max Width"><TextInputWithUnit value={(p.maxWidth as string) || "800px"} onChange={(v) => up("maxWidth", v)} placeholder="800px or 100%" /></Field>
                <Field label="Item Radius"><BorderRadiusInput value={(p.itemRadius as string) || "8px"} onChange={(v) => up("itemRadius", v)} /></Field>
            </Section>

            <Section title="Typography">
                <Field label="Title Size"><TextInputWithUnit value={(p.titleSize as string) || "16px"} onChange={(v) => up("titleSize", v)} placeholder="16px" /></Field>
                <Field label="Title Weight"><SelectInput value={(p.titleWeight as string) || "600"} onChange={(v) => up("titleWeight", v)} options={[{ label: "Normal (400)", value: "400" }, { label: "Medium (500)", value: "500" }, { label: "Semibold (600)", value: "600" }, { label: "Bold (700)", value: "700" }]} /></Field>
                <Field label="Description Size"><TextInputWithUnit value={(p.descSize as string) || "15px"} onChange={(v) => up("descSize", v)} placeholder="15px" /></Field>
            </Section>

            <Section title="Icon">
                <Field label="Icon Style"><SelectInput value={(p.iconStyle as string) || "chevron"} onChange={(v) => up("iconStyle", v)} options={[{ label: "Chevron", value: "chevron" }, { label: "Plus / Minus", value: "plus" }]} /></Field>
                <Field label="Icon Size"><TextInputWithUnit value={(p.iconSize as string) || "20px"} onChange={(v) => up("iconSize", v)} placeholder="20px" /></Field>
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
                <PaddingInput value={(p.padding as string) || "24px"} onChange={(v) => up("padding", v)} placeholder="e.g. 64px 24px" />
            </Section>

            <AnimationPanel block={block} />
        </>
    );
}

export function StatsPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p: any = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    const { flashIdx, itemRefs } = useSubItemFocus(block.id);

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
                    <SortableList
                        items={(p.items as any[]) || []}
                        onReorder={(activeId, overId) => {
                            const oldIndex = (p.items as any[]).findIndex((i) => i.id === activeId);
                            const newIndex = (p.items as any[]).findIndex((i) => i.id === overId);
                            up("items", arrayMove(p.items as any[], oldIndex, newIndex), true);
                        }}
                        onDelete={(idx) => {
                            const nI = [...((p.items as any[]) || [])];
                            nI.splice(idx, 1);
                            up("items", nI, true);
                        }}
                        renderItemContent={(item, idx) => (
                            <div
                                ref={(el) => { itemRefs.current[idx] = el; }}
                                className={flashIdx === idx ? "subitem-highlight" : undefined}
                                style={{ display: "flex", flexDirection: "column", gap: 4, transition: "background 0.2s" }}
                            >
                                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 2 }}>METRIC {idx + 1}</span>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 4 }}>
                                    <TextInput value={item.value} onChange={(v) => { const nI = [...((p.items as any[]) || [])]; nI[idx] = { ...nI[idx], value: v }; up("items", nI); }} placeholder="Value" />
                                    <TextInput value={item.unit} onChange={(v) => { const nI = [...((p.items as any[]) || [])]; nI[idx] = { ...nI[idx], unit: v }; up("items", nI); }} placeholder="Unit" />
                                </div>
                                <TextInput value={item.label} onChange={(v) => { const nI = [...((p.items as any[]) || [])]; nI[idx] = { ...nI[idx], label: v }; up("items", nI); }} placeholder="Label" style={{ marginBottom: 4 }} />
                                <IconPicker value={item.icon || "Zap"} onChange={(v) => { const nI = [...((p.items as any[]) || [])]; nI[idx] = { ...nI[idx], icon: v }; up("items", nI); }} />
                            </div>
                        )}
                    />
                    <button onClick={() => { const nI = [...((p.items as any[]) || [])]; nI.push({ id: crypto.randomUUID(), value: "0", label: "New Stat", icon: "Activity" }); up("items", nI, true); }} style={{ padding: "8px 0", background: "rgba(99,102,241,0.08)", color: "var(--primary)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", marginTop: 4, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}>+ Add Metric</button>
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
                <Field label="Height"><TextInputWithUnit value={(p.height as string) || "300px"} onChange={(v) => up("height", v)} /></Field>
                <Field label="Primary Color"><ColorInput value={(p.color as string) || "var(--primary)"} onChange={(v) => up("color", v)} /></Field>
                <Field label="Secondary Color"><ColorInput value={(p.secondaryColor as string) || "var(--accent)"} onChange={(v) => up("secondaryColor", v)} /></Field>
            </Section>

            <Section title="Display Options">
                <ToggleSwitch label="Show Grid" value={p.showGrid !== false} onChange={(v) => up("showGrid", v)} />
                <ToggleSwitch label="X Axis" value={p.showXAxis !== false} onChange={(v) => up("showXAxis", v)} />
                <ToggleSwitch label="Y Axis" value={p.showYAxis !== false} onChange={(v) => up("showYAxis", v)} />
                <ToggleSwitch label="Tooltip" value={p.showTooltip !== false} onChange={(v) => up("showTooltip", v)} />
                <ToggleSwitch label="Legend" value={p.showLegend === true} onChange={(v) => up("showLegend", v)} />
                <Field label="Line Curve"><SelectInput value={(p.curve as string) || "smooth"} onChange={(v) => up("curve", v)} options={[{ label: "Smooth", value: "smooth" }, { label: "Step", value: "step" }, { label: "Linear", value: "linear" }]} /></Field>
            </Section>

            <Section title="Data Management">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <SortableList
                        items={((p.data as any[]) || []).map((d, i) => ({ ...d, id: d.id || `data-${i}` }))}
                        onReorder={(activeId, overId) => {
                            const data = [...((p.data as any[]) || []).map((d, i) => ({ ...d, id: d.id || `data-${i}` }))];
                            const oldIndex = data.findIndex((d) => d.id === activeId);
                            const newIndex = data.findIndex((d) => d.id === overId);
                            up("data", arrayMove(data, oldIndex, newIndex), true);
                        }}
                        onDelete={(idx) => {
                            const nD = [...((p.data as any[]) || [])];
                            nD.splice(idx, 1);
                            up("data", nD, true);
                        }}
                        renderItemContent={(point, idx) => (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, alignItems: "center" }}>
                                <input
                                    value={point.name}
                                    onChange={(e) => {
                                        const nD = [...((p.data as any[]) || [])];
                                        nD[idx] = { ...nD[idx], name: e.target.value };
                                        up("data", nD);
                                    }}
                                    onBlur={() => up("data", p.data, true)}
                                    placeholder="Label"
                                    style={{ background: PANEL_COLORS.inputBg, border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 6, padding: "5px 8px", fontSize: 11, color: PANEL_COLORS.text, outline: "none" }}
                                />
                                <input
                                    value={point.value}
                                    type="number"
                                    onChange={(e) => {
                                        const nD = [...((p.data as any[]) || [])];
                                        nD[idx] = { ...nD[idx], value: Number(e.target.value) || 0 };
                                        up("data", nD);
                                    }}
                                    onBlur={() => up("data", p.data, true)}
                                    placeholder="0"
                                    style={{ background: PANEL_COLORS.inputBg, border: `1px solid ${PANEL_COLORS.inputBorder}`, borderRadius: 6, padding: "5px 8px", fontSize: 11, color: PANEL_COLORS.text, outline: "none" }}
                                />
                            </div>
                        )}
                    />
                    <button onClick={() => { const nD = [...((p.data as any[]) || [])]; nD.push({ id: crypto.randomUUID(), name: "New Item", value: 0 }); up("data", nD, true); }} style={{ marginTop: 4, padding: "8px", background: "rgba(0,153,255,0.08)", color: "#4db8ff", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Add Data Point</button>
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
                <ToggleSwitch label="Show Title" value={p.showTitle !== false} onChange={(v) => up("showTitle", v)} />
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
                                <TextInputWithUnit value={(p.titleFontSize as string) || "2rem"} onChange={(v) => up("titleFontSize", v)} placeholder="2rem" />
                            </Field>
                            <Field label="Tablet">
                                <TextInputWithUnit value={(p.titleTabletFontSize as string) || ""} onChange={(v) => up("titleTabletFontSize", v)} placeholder="1.75rem" />
                            </Field>
                            <Field label="Mobile">
                                <TextInputWithUnit value={(p.titleMobileFontSize as string) || ""} onChange={(v) => up("titleMobileFontSize", v)} placeholder="1.5rem" />
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
                <PaddingInput label="Section Padding" value={(p.padding as string) || "64px 24px"} onChange={(v) => up("padding", v)} placeholder="64px 24px" />
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
                <Field label="Height"><TextInputWithUnit value={(p.logoHeight as string) || "48px"} onChange={(v) => up("logoHeight", v)} placeholder="48px" /></Field>
                <Field label="Width"><TextInputWithUnit value={(p.logoWidth as string) || "auto"} onChange={(v) => up("logoWidth", v)} placeholder="auto" /></Field>
                <Field label="Object Fit"><SelectInput value={(p.logoObjectFit as string) || "cover"} onChange={(v) => up("logoObjectFit", v)} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }, { label: "Auto", value: "none" }]} /></Field>
            </Section>

            <Section title="Form Fields">
                <ToggleSwitch value={p.showFirstName === true} onChange={(v) => up("showFirstName", v)} label="Show First Name" />
                {p.showFirstName && <ToggleSwitch value={p.firstNameRequired === true} onChange={(v) => up("firstNameRequired", v)} label="First Name Required" />}

                <ToggleSwitch value={p.showLastName === true} onChange={(v) => up("showLastName", v)} label="Show Last Name" />
                {p.showLastName && <ToggleSwitch value={p.lastNameRequired === true} onChange={(v) => up("lastNameRequired", v)} label="Last Name Required" />}

                <ToggleSwitch value={p.reasonShow !== false} onChange={(v) => up("reasonShow", v)} label="Show Reason Select" />
                {p.reasonShow !== false && <ToggleSwitch value={p.reasonRequired === true} onChange={(v) => up("reasonRequired", v)} label="Reason Required" />}
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

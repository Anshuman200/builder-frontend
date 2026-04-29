"use client";
import type { Block } from "@/types";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";

import { Section, Field, TextInput, TextareaInput, SelectInput, ColorInput, MediaInput, LinkInput, ButtonFields, ToggleSwitch, AlignmentInput, PaddingInput, SortableList, arrayMove, PaddingFields, TextInputWithUnit } from "./shared";
import { AnimationPanel } from "./AnimationPanel";
import { IconPicker } from "@/components/editor/IconPicker";
import { EDITOR_FEATURES } from "@/lib/config/features";
import { BackgroundPanel } from "./BackgroundPanel";

export function ButtonPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    const variant = (p.variant as string) || "solid";

    return (
        <>
            <Section title="Content">
                <ButtonFields p={p} up={up} hideLabel={false} />
                <Field label="Link (href)"><LinkInput value={(p.href as string) || ""} onChange={(v) => up("href", v)} placeholder="#" /></Field>
            </Section>
            <Section title="Appearance">
                <Field label="Size"><SelectInput value={(p.size as string) || "md"} onChange={(v) => up("size", v)} options={[{ label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }, { label: "Extra Large", value: "xl" }]} /></Field>
                <AlignmentInput label="Alignment" value={(p.align as string) || "left"} onChange={(v) => up("align", v)} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} />
                <ToggleSwitch value={!!(p.fullWidth)} onChange={(v) => up("fullWidth", v)} label="Full Width" />
            </Section>
            {variant === "gradient" && (
                <Section title="Gradient">
                    <Field label="From Color"><ColorInput value={(p.gradientFrom as string) || "#6366f1"} onChange={(v) => up("gradientFrom", v)} onBlur={(v) => up("gradientFrom", v, true)} /></Field>
                    <Field label="To Color"><ColorInput value={(p.gradientTo as string) || "#8b5cf6"} onChange={(v) => up("gradientTo", v)} onBlur={(v) => up("gradientTo", v, true)} /></Field>
                    <Field label="Direction"><SelectInput value={(p.gradientDir as string) || "to right"} onChange={(v) => up("gradientDir", v)} options={[{ label: "→ Right", value: "to right" }, { label: "← Left", value: "to left" }, { label: "↓ Bottom", value: "to bottom" }, { label: "↗ Top Right", value: "to top right" }, { label: "↘ Bottom Right", value: "to bottom right" }]} /></Field>
                </Section>
            )}
            <Section title="Shape & Shadow">
                <Field label="Shadow"><SelectInput value={(p.shadow as string) || "none"} onChange={(v) => up("shadow", v)} options={[{ label: "None", value: "none" }, { label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }, { label: "Glow", value: "glow" }]} /></Field>
                <Field label="Border Width"><TextInputWithUnit value={(p.borderWidth as string) ?? ""} onChange={(v) => up("borderWidth", v)} placeholder="2px" /></Field>
                <Field label="Border Color"><ColorInput value={(p.borderColor as string) || ""} onChange={(v) => up("borderColor", v)} onBlur={(v) => up("borderColor", v, true)} /></Field>
            </Section>
            <Section title="Typography">
                <Field label="Font Size override"><TextInputWithUnit value={(p.fontSize as string) ?? ""} onChange={(v) => up("fontSize", v)} placeholder="auto" /></Field>
                <Field label="Font Weight"><SelectInput value={(p.fontWeight as string) || "700"} onChange={(v) => up("fontWeight", v)} options={[{ label: "Normal (400)", value: "400" }, { label: "Medium (500)", value: "500" }, { label: "Semibold (600)", value: "600" }, { label: "Bold (700)", value: "700" }, { label: "Black (900)", value: "900" }]} /></Field>
                <Field label="Letter Spacing"><TextInputWithUnit value={(p.letterSpacing as string) ?? ""} onChange={(v) => up("letterSpacing", v)} placeholder="0.02em" /></Field>
            </Section>
            <Section title="Icons">
                <Field label="Left Icon"><IconPicker value={(p.iconLeft as string) || ""} onChange={(v) => up("iconLeft", v)} /></Field>
                <Field label="Right Icon"><IconPicker value={(p.iconRight as string) || ""} onChange={(v) => up("iconRight", v)} /></Field>
            </Section>
            <AnimationPanel block={block} />
        </>
    );
}

export function HeaderPanel({ block }: { block: Block }) {
    const { updateBlock, page, updateRoute } = useEditorStore();
    const routes = page?.routes || [];
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    const updateProps = (newProps: Record<string, unknown>) => updateBlock(block.id, newProps);

    return (
        <>
            <Section title="Layout & Styling">
                <Field label="Header Layout"><SelectInput value={(p.layout as string) || "standard"} onChange={(v) => updateProps({ layout: v })} options={[{ label: "Standard (Logo Left, Nav Right)", value: "standard" }, { label: "Centered (Logo Center)", value: "centered" }, { label: "Split (Nav Left, Logo Center)", value: "split" }]} /></Field>
                <Field label="Header Width"><SelectInput value={(p.layoutWidth as string) || (p.fullWidth ? "fluid" : "centered")} onChange={(v) => updateProps({ layoutWidth: v, fullWidth: v === "fluid" })} options={[{ label: "Fluid / Edge-to-Edge", value: "fluid" }, { label: "Centered (Container)", value: "centered" }, { label: "Narrow Content (800px)", value: "narrow" }]} /></Field>
                <Field label="Position"><SelectInput value={(p.position as string) || "static"} onChange={(v) => updateProps({ position: v })} options={[{ label: "Static (Normal flow)", value: "static" }, { label: "Sticky (Stays at top)", value: "sticky" }, { label: "Fixed (Overlays content)", value: "fixed" }]} /></Field>
                <Field label="Background Style"><SelectInput value={(p.style as string) || "solid"} onChange={(v) => up("style", v)} options={[{ label: "Solid Color", value: "solid" }, { label: "Glassmorphism (Blur)", value: "glass" }, { label: "Transparent", value: "transparent" }]} /></Field>
                <Field label="Text Color"><ColorInput value={(p.textColor as string) || "#1e293b"} onChange={(v) => up("textColor", v)} onBlur={(v) => up("textColor", v, true)} /></Field>
            </Section>
            <BackgroundPanel block={block} />
            <Section title="Section Padding (Responsive)">
                <PaddingFields p={p} up={up} />
            </Section>
            <Section title="Brand (Logo)">
                <Field label="Logo Type"><SelectInput value={(p.logoType as string) || "text"} onChange={(v) => up("logoType", v)} options={[{ label: "Text Only", value: "text" }, { label: "Image", value: "image" }]} /></Field>
                <Field label="Logo Text"><TextInput value={(p.logoText as string) || "PageCraft"} onChange={(v) => up("logoText", v)} placeholder="Your Brand" /></Field>
                {p.logoType === "image" && (<>
                    <Field label="Logo Image"><MediaInput value={(p.logoImage as string) || ""} onChange={(v) => up("logoImage", v)} placeholder="https://..." /></Field>
                    <Field label="Image Width"><TextInputWithUnit value={(p.logoWidth as string) ?? ""} onChange={(v) => up("logoWidth", v)} placeholder="120px" /></Field>
                    <Field label="Image Height"><TextInputWithUnit value={(p.logoHeight as string) ?? ""} onChange={(v) => up("logoHeight", v)} placeholder="40px" /></Field>
                    <Field label="Object Fit"><SelectInput value={(p.logoObjectFit as string) || "cover"} onChange={(v) => up("logoObjectFit", v)} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }, { label: "Auto", value: "none" }]} /></Field>
                    <Field label="Logo Shape"><SelectInput value={(p.logoShape as string) || "square"} onChange={(v) => up("logoShape", v)} options={[{ label: "Square", value: "square" }, { label: "Circle", value: "circle" }, { label: "Rounded", value: "rounded" }]} /></Field>
                </>)}
            </Section>
            <Section title="Call to Action (CTA)">
                <ToggleSwitch value={p.showCta !== false} onChange={(v) => up("showCta", v)} label="Show CTA Button" />
                {p.showCta !== false && (
                    <>
                        <ButtonFields p={p} up={up} prefix="cta" textKey="ctaText" />
                        <Field label="Button URL"><LinkInput value={(p.ctaUrl as string) || "#"} onChange={(v) => up("ctaUrl", v)} placeholder="https://..." /></Field>
                    </>
                )}
            </Section>
            <Section title="Navigation Links">
                <div style={{ padding: "8px 0", fontSize: 11, color: "var(--text-subtle)" }}>Dynamic links from your Pages and custom links. Drag to reorder.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(() => {
                        const autoRoutes = (routes || []).filter(r => r.showInHeader !== false);
                        const currentLinks = (p.links as any[]) || [];

                        // Merge logic: ensure all visible routes are present in the list
                        let unified = [...currentLinks];
                        autoRoutes.forEach(r => {
                            if (!unified.find(l => l.routeId === r.id)) {
                                unified.push({ id: r.id, routeId: r.id, isAuto: true });
                            }
                        });

                        // Filter to only show currently visible routes and all custom links
                        const displayItems = unified.filter(l => {
                            if (!l.isAuto) return true;
                            return autoRoutes.some(r => r.id === l.routeId);
                        });

                        return (
                            <SortableList
                                items={displayItems}
                                onReorder={(activeId, overId) => {
                                    const oldIndex = displayItems.findIndex((l) => l.id === activeId);
                                    const newIndex = displayItems.findIndex((l) => l.id === overId);
                                    const next = arrayMove(displayItems, oldIndex, newIndex);
                                    up("links", next, true);
                                }}
                                onDelete={(idx) => {
                                    const item = displayItems[idx];
                                    if (item.isAuto && item.routeId) {
                                        updateRoute(item.routeId, { showInHeader: false });
                                    }
                                    const next = [...displayItems];
                                    next.splice(idx, 1);
                                    up("links", next, true);
                                }}
                                renderItemContent={(item, idx) => {
                                    if (item.isAuto) {
                                        const route = autoRoutes.find(r => r.id === item.routeId);
                                        if (!route) return null;
                                        return (
                                            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{route.name}</div>
                                                    <div style={{ fontSize: 9, opacity: 0.5, overflow: "hidden", textOverflow: "ellipsis" }}>{route.path === "/" ? "Home" : route.path} (Auto Page)</div>
                                                </div>
                                                <div style={{ fontSize: 8, fontWeight: 800, color: "var(--primary)", background: "rgba(0, 153, 255, 0.1)", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.05em" }}>NAV</div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, letterSpacing: "0.05em" }}>CUSTOM LINK</span>
                                            <input
                                                value={item.label}
                                                onChange={(e) => {
                                                    const next = [...displayItems];
                                                    next[idx] = { ...next[idx], label: e.target.value };
                                                    up("links", next);
                                                }}
                                                placeholder="Label"
                                                style={{ fontSize: 11, fontWeight: 600, padding: "6px 8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 6, outline: "none", color: "var(--text)" }}
                                            />
                                            <LinkInput
                                                value={item.url}
                                                onChange={(v) => {
                                                    const next = [...displayItems];
                                                    next[idx] = { ...next[idx], url: v };
                                                    up("links", next);
                                                }}
                                                placeholder="URL (e.g. /about)"
                                            />
                                        </div>
                                    );
                                }}
                            />
                        );
                    })()}
                    <button onClick={() => {
                        const autoRoutes = (routes || []).filter(r => r.showInHeader !== false);
                        const currentLinks = (p.links as any[]) || [];
                        let unified = [...currentLinks];
                        autoRoutes.forEach(r => { if (!unified.find(l => l.routeId === r.id)) unified.push({ id: r.id, routeId: r.id, isAuto: true }); });
                        const displayItems = unified.filter(l => !l.isAuto || autoRoutes.some(r => r.id === l.routeId));

                        const next = [...displayItems];
                        next.push({ id: crypto.randomUUID(), label: "New Link", url: "#" });
                        up("links", next, true);
                    }} style={{ padding: "8px 0", background: "rgba(99,102,241,0.08)", color: "var(--primary)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", marginTop: 4, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}>+ Add Custom Link</button>
                </div>
            </Section>

            <Section title="Navigation Style">
                <Field label="Active Style">
                    <SelectInput
                        value={(p.navActiveStyle as string) || "underline"}
                        onChange={(v) => up("navActiveStyle", v)}
                        options={[
                            { label: "Underline", value: "underline" },
                            { label: "Dot (below)", value: "dot" },
                            { label: "Pill / Background", value: "pill" },
                            { label: "Bold only", value: "bold" },
                        ]}
                    />
                </Field>
                {(p.navActiveStyle as string) && (
                    <Field label="Active Color">
                        <ColorInput
                            value={(p.navActiveColor as string) || (p.ctaBgColor as string) || "#6366f1"}
                            onChange={(v) => up("navActiveColor", v)}
                            onBlur={(v) => up("navActiveColor", v, true)}
                        />
                    </Field>
                )}
                <Field label="Active Weight">
                    <SelectInput
                        value={(p.navActiveWeight as string) || "700"}
                        onChange={(v) => up("navActiveWeight", v)}
                        options={[
                            { label: "Normal (400)", value: "400" },
                            { label: "Medium (500)", value: "500" },
                            { label: "Semibold (600)", value: "600" },
                            { label: "Bold (700)", value: "700" },
                            { label: "Extra Bold (800)", value: "800" },
                        ]}
                    />
                </Field>
                <Field label="Inactive Opacity">
                    <SelectInput
                        value={(p.navInactiveOpacity as string) || "0.75"}
                        onChange={(v) => up("navInactiveOpacity", v)}
                        options={[
                            { label: "40%", value: "0.4" },
                            { label: "50%", value: "0.5" },
                            { label: "60%", value: "0.6" },
                            { label: "70%", value: "0.7" },
                            { label: "75% (default)", value: "0.75" },
                            { label: "80%", value: "0.8" },
                            { label: "90%", value: "0.9" },
                            { label: "Full (100%)", value: "1" },
                        ]}
                    />
                </Field>
            </Section>

            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function FooterPanel({ block }: { block: Block }) {
    const { updateBlock, page, updateRoute } = useEditorStore();
    const routes = page?.routes || [];
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    const updateProps = (newProps: Record<string, unknown>) => updateBlock(block.id, newProps);

    return (
        <>
            <Section title="Layout & Styling">
                <Field label="Section Layout"><SelectInput value={(p.layout as string) || "standard"} onChange={(v) => updateProps({ layout: v })} options={[{ label: "Standard (Logo + Links)", value: "standard" }, { label: "Centered (Logo Center)", value: "centered" }, { label: "Columns (Multi-section)", value: "columns" }, { label: "Minimal (1 line)", value: "minimal" }]} /></Field>
                <ToggleSwitch label="Full Width Container" value={!!p.fullWidth} onChange={(v) => updateProps({ fullWidth: v })} />
            </Section>
            <BackgroundPanel block={block} />
            <Section title="Text Styling">
                <Field label="Text Color"><ColorInput value={(p.textColor as string) || "#f8fafc"} onChange={(v) => up("textColor", v)} onBlur={(v) => up("textColor", v, true)} /></Field>
            </Section>
            <Section title="Section Padding (Responsive)">
                <PaddingFields p={p} up={up} />
            </Section>
            <Section title="Brand & Content">
                <Field label="Logo Type"><SelectInput value={(p.logoType as string) || "text"} onChange={(v) => up("logoType", v)} options={[{ label: "Text Only", value: "text" }, { label: "Image", value: "image" }]} /></Field>
                <Field label="Logo Text"><TextInput value={(p.logoText as string) || "PageCraft"} onChange={(v) => up("logoText", v)} placeholder="Your Brand" /></Field>
                {p.logoType === "image" && (<>
                    <Field label="Logo Image"><MediaInput value={(p.logoImage as string) || ""} onChange={(v) => up("logoImage", v)} placeholder="https://..." /></Field>
                    <Field label="Image Width"><TextInputWithUnit value={(p.logoWidth as string) ?? ""} onChange={(v) => up("logoWidth", v)} placeholder="120px" /></Field>
                    <Field label="Image Height"><TextInputWithUnit value={(p.logoHeight as string) ?? ""} onChange={(v) => up("logoHeight", v)} placeholder="40px" /></Field>
                    <Field label="Object Fit"><SelectInput value={(p.logoObjectFit as string) || "cover"} onChange={(v) => up("logoObjectFit", v)} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }, { label: "Auto", value: "none" }]} /></Field>
                    <Field label="Logo Shape"><SelectInput value={(p.logoShape as string) || "square"} onChange={(v) => up("logoShape", v)} options={[{ label: "Square", value: "square" }, { label: "Circle", value: "circle" }, { label: "Rounded", value: "rounded" }]} /></Field>
                </>)}
                <Field label="Description"><TextareaInput value={(p.description as string) || ""} onChange={(v) => up("description", v)} rows={3} placeholder="Brief company description..." /></Field>
            </Section>
            <Section title="Copyright">
                <Field label="Copyright"><TextInput value={(p.copyright as string) || ""} onChange={(v) => up("copyright", v)} placeholder="© 2026 Company" /></Field>
            </Section>
            <Section title="Footer Links">
                <div style={{ padding: "8px 0", fontSize: 11, color: "var(--text-subtle)", marginBottom: 8 }}>Pages set to "Show in Footer" and custom links. Drag to reorder.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(() => {
                        const autoRoutes = (routes || []).filter(r => !!r.showInFooter);
                        const currentLinks = (p.links as any[]) || [];

                        // Merge logic: ensure all visible routes are present in the list
                        let unified = [...currentLinks];
                        autoRoutes.forEach(r => {
                            if (!unified.find(l => l.routeId === r.id)) {
                                unified.push({ id: r.id, routeId: r.id, isAuto: true });
                            }
                        });

                        // Filter to only show currently visible routes and all custom links
                        const displayItems = unified.filter(l => {
                            if (!l.isAuto) return true;
                            return autoRoutes.some(r => r.id === l.routeId);
                        });

                        return (
                            <SortableList
                                items={displayItems}
                                onReorder={(activeId, overId) => {
                                    const oldIndex = displayItems.findIndex((l) => l.id === activeId);
                                    const newIndex = displayItems.findIndex((l) => l.id === overId);
                                    const next = arrayMove(displayItems, oldIndex, newIndex);
                                    up("links", next, true);
                                }}
                                onDelete={(idx) => {
                                    const item = displayItems[idx];
                                    if (item.isAuto && item.routeId) {
                                        updateRoute(item.routeId, { showInFooter: false });
                                    }
                                    const next = [...displayItems];
                                    next.splice(idx, 1);
                                    up("links", next, true);
                                }}
                                renderItemContent={(item, idx) => {
                                    if (item.isAuto) {
                                        const route = autoRoutes.find(r => r.id === item.routeId);
                                        if (!route) return null;
                                        return (
                                            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{route.name}</div>
                                                    <div style={{ fontSize: 9, opacity: 0.5, overflow: "hidden", textOverflow: "ellipsis" }}>{route.path === "/" ? "Home" : route.path} (Auto Page)</div>
                                                </div>
                                                <div style={{ fontSize: 8, fontWeight: 800, color: "var(--primary)", background: "rgba(0, 153, 255, 0.1)", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.05em" }}>NAV</div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, letterSpacing: "0.05em" }}>CUSTOM LINK</span>
                                            <input
                                                value={item.label}
                                                onChange={(e) => {
                                                    const next = [...displayItems];
                                                    next[idx] = { ...next[idx], label: e.target.value };
                                                    up("links", next);
                                                }}
                                                placeholder="Label"
                                                style={{ fontSize: 11, fontWeight: 600, padding: "6px 8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 6, outline: "none", color: "var(--text)" }}
                                            />
                                            <LinkInput
                                                value={item.url}
                                                onChange={(v) => {
                                                    const next = [...displayItems];
                                                    next[idx] = { ...next[idx], url: v };
                                                    up("links", next);
                                                }}
                                                placeholder="URL (e.g. #contact)"
                                            />
                                        </div>
                                    );
                                }}
                            />
                        );
                    })()}
                    <button onClick={() => {
                        const autoRoutes = (routes || []).filter(r => !!r.showInFooter);
                        const currentLinks = (p.links as any[]) || [];
                        let unified = [...currentLinks];
                        autoRoutes.forEach(r => { if (!unified.find(l => l.routeId === r.id)) unified.push({ id: r.id, routeId: r.id, isAuto: true }); });
                        const displayItems = unified.filter(l => !l.isAuto || autoRoutes.some(r => r.id === l.routeId));

                        const next = [...displayItems];
                        next.push({ id: crypto.randomUUID(), label: "New Link", url: "#" });
                        up("links", next, true);
                    }} style={{ padding: "8px 0", background: "rgba(99,102,241,0.08)", color: "var(--primary)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", marginTop: 4, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}>+ Add Custom Link</button>
                </div>
            </Section>

            {p.layout === "columns" && (
                <Section title="Column Link Groups">
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {((p.linkGroups as any[]) || []).map((group, gIdx) => (
                            <div key={group.id} style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <input value={group.heading} onChange={(e) => { const nG = [...(p.linkGroups as any[])]; nG[gIdx] = { ...nG[gIdx], heading: e.target.value }; up("linkGroups", nG); }} placeholder="Group Heading" style={{ fontWeight: 700, fontSize: 12, background: "transparent", border: "none", borderBottom: "1px solid var(--border)", color: "var(--text)", outline: "none", width: "80%" }} />
                                    <button onClick={() => { const nG = (p.linkGroups as any[]).filter((_, i) => i !== gIdx); up("linkGroups", nG); }} style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer" }}>&times;</button>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                                    {group.links.map((link: any, lIdx: number) => (
                                        <div key={link.id} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                            <input value={link.label} onChange={(e) => {
                                                const nG = [...(p.linkGroups as any[])];
                                                const nL = [...nG[gIdx].links];
                                                nL[lIdx] = { ...nL[lIdx], label: e.target.value };
                                                nG[gIdx] = { ...nG[gIdx], links: nL };
                                                up("linkGroups", nG);
                                            }} placeholder="Label" style={{ flex: 1, fontSize: 11, padding: "4px 6px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }} />
                                            <LinkInput value={link.url} onChange={(v) => {
                                                const nG = [...(p.linkGroups as any[])];
                                                const nL = [...nG[gIdx].links];
                                                nL[lIdx] = { ...nL[lIdx], url: v };
                                                nG[gIdx] = { ...nG[gIdx], links: nL };
                                                up("linkGroups", nG);
                                            }} placeholder="URL" />
                                            <button onClick={() => {
                                                const nG = [...(p.linkGroups as any[])];
                                                const nL = nG[gIdx].links.filter((_: any, i: number) => i !== lIdx);
                                                nG[gIdx] = { ...nG[gIdx], links: nL };
                                                up("linkGroups", nG);
                                            }} style={{ background: "transparent", border: "none", opacity: 0.5, cursor: "pointer" }}>&times;</button>
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        const nG = [...(p.linkGroups as any[])];
                                        const nL = [...nG[gIdx].links, { id: crypto.randomUUID(), label: "New Link", url: "#" }];
                                        nG[gIdx] = { ...nG[gIdx], links: nL };
                                        up("linkGroups", nG);
                                    }} style={{ alignSelf: "flex-start", fontSize: 10, background: "none", border: "none", color: "var(--primary)", cursor: "pointer", padding: 0 }}>+ Add Link</button>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => {
                            const nG = [...((p.linkGroups as any[]) || []), { id: crypto.randomUUID(), heading: "New Group", links: [] }];
                            up("linkGroups", nG);
                        }} style={{ padding: "8px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add Column Group</button>
                    </div>
                </Section>
            )}
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

"use client";
import type { Block } from "@/types";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";

import { Section, Field, TextInput, TextareaInput, SelectInput, ColorInput, MediaInput, LinkInput, ButtonFields, ToggleSwitch, AlignmentInput, PaddingInput, SortableList, arrayMove, PaddingFields, TextInputWithUnit, PanelInlineEditor, BorderRadiusInput, DirectionInput, ShadowInput, BorderPropertyInput, FontStyleInput, TypographyFields } from "./shared";
import { AnimationPanel } from "./AnimationPanel";
import { IconPicker } from "@/components/editor/IconPicker";
import { EDITOR_FEATURES } from "@/lib/config/features";
import { BackgroundPanel } from "./BackgroundPanel";

export function ButtonPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    return (
        <>
            <ButtonFields p={p} up={up} hideLabel={false} />
            <Section title="Link Settings">
                <Field label="Link (href)"><LinkInput value={(p.href as string) || ""} onChange={(v) => up("href", v)} placeholder="#" /></Field>
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
            <Section title="Header Layout">
                <Field label="Header Style">
                    <SelectInput
                        value={(p.style as string) || "solid"}
                        onChange={(v) => up("style", v)}
                        options={[
                            { label: "Solid", value: "solid" },
                            { label: "Transparent", value: "transparent" },
                            { label: "Glassmorphism", value: "glass" },
                        ]}
                    />
                </Field>
                <Field label="Position">
                    <SelectInput
                        value={(p.position as string) || "static"}
                        onChange={(v) => up("position", v)}
                        options={[
                            { label: "Standard (Scrolls)", value: "static" },
                            { label: "Fixed (Sticky)", value: "fixed" },
                        ]}
                    />
                </Field>
                <Field label="Floating Mode">
                    <ToggleSwitch
                        value={!!p.isFloating}
                        onChange={(v) => up("isFloating", v, true)}
                        label="Floating Island"
                    />
                </Field>
                {p.isFloating && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px", marginTop: 12 }}>
                        <Field label="Width" fullWidth><TextInputWithUnit type="width" value={(p.floatingWidth as string) || ""} onChange={(v) => up("floatingWidth", v)} placeholder="auto" /></Field>
                        <Field label="Top Offset" fullWidth><TextInputWithUnit value={(p.floatingTop as string) || "20px"} onChange={(v) => up("floatingTop", v)} placeholder="20px" /></Field>
                        <Field label="Border" fullWidth>
                            <BorderPropertyInput
                                radius={p.floatingRadius || "16px"}
                                width={p.floatingBorderWidth || "1px"}
                                color={p.floatingBorderColor || "rgba(255,255,255,0.1)"}
                                onChange={({ radius, width, color }) => {
                                    up("floatingRadius", radius);
                                    up("floatingBorderWidth", width);
                                    up("floatingBorderColor", color);
                                }}
                                placeholderRadius="16px"
                                placeholderWidth="1px"
                                placeholderColor="rgba(255,255,255,0.1)"
                            />
                        </Field>
                        <Field label="Header Shadow" fullWidth>
                            <ShadowInput value={p.floatingShadow || "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"} onChange={(v) => up("floatingShadow", v)} />
                        </Field>
                    </div>
                )}
            </Section>

            <Section title="Brand (Logo)">
                <Field label="Logo Type"><SelectInput value={(p.logoType as string) || "text"} onChange={(v) => up("logoType", v)} options={[{ label: "Text Only", value: "text" }, { label: "Image", value: "image" }]} /></Field>
                <Field label="Logo Text"><PanelInlineEditor value={(p.logoText as string) || "Solario Forge"} onChange={(v) => up("logoText", v)} placeholder="Your Brand" /></Field>
                {p.logoType === "image" && (<>
                    <Field label="Logo Image"><MediaInput value={(p.logoImage as string) || ""} onChange={(v) => up("logoImage", v)} placeholder="https://..." /></Field>
                    <Field label="Image Width"><TextInputWithUnit value={(p.logoWidth as string) ?? ""} onChange={(v) => up("logoWidth", v)} placeholder="120px" /></Field>
                    <Field label="Image Height"><TextInputWithUnit value={(p.logoHeight as string) ?? ""} onChange={(v) => up("logoHeight", v)} placeholder="40px" /></Field>
                    <Field label="Object Fit"><SelectInput value={(p.logoObjectFit as string) || "cover"} onChange={(v) => up("logoObjectFit", v)} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }, { label: "Auto", value: "none" }]} /></Field>
                    <Field label="Logo Shape"><SelectInput value={(p.logoShape as string) || "square"} onChange={(v) => up("logoShape", v)} options={[{ label: "Square", value: "square" }, { label: "Circle", value: "circle" }, { label: "Rounded", value: "rounded" }]} /></Field>
                </>)}
                {((p.logoType as string) || "text") === "text" && (
                    <TypographyFields p={p} up={up} prefix="logo" showContentField={false} showAlign={false} />
                )}

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
                            value={(p.navActiveColor as string) || (p.ctaBgColor as string) || "#d97706"}
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
                <Field label="Link Color">
                    <ColorInput
                        value={(p.navColor as string) || (p.textColor as string) || "#1e293b"}
                        onChange={(v) => up("navColor", v)}
                        onBlur={(v) => up("navColor", v, true)}
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

            <BackgroundPanel block={block} hasWave={false} />

            <Section title="Section Padding (Responsive)">
                <PaddingFields p={p} up={up} />
            </Section>

            <Section title="Call to Action (CTA)">
                <section className="mb-3">
                    <ToggleSwitch value={p.showCta !== false} onChange={(v) => up("showCta", v)} label="Show CTA Button" />
                </section>
                {p.showCta !== false && (
                    <>
                        <ButtonFields p={p} up={up} prefix="cta" textKey="ctaText" hasMargin={false} />
                        <section className="mt-3">
                            <Field label="Button URL"><LinkInput value={(p.ctaUrl as string) || "#"} onChange={(v) => up("ctaUrl", v)} placeholder="https://..." /></Field>
                        </section>
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
                                            <PanelInlineEditor
                                                value={item.label}
                                                onChange={(v) => {
                                                    const next = [...displayItems];
                                                    next[idx] = { ...next[idx], label: v };
                                                    up("links", next);
                                                }}
                                                placeholder="Label"
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
            <BackgroundPanel block={block} hasWave={false} />
            <Section title="Text Styling">
                <Field label="Text Color"><ColorInput value={(p.textColor as string) || "#f8fafc"} onChange={(v) => up("textColor", v)} onBlur={(v) => up("textColor", v, true)} /></Field>
                <Field label="Link Color"><ColorInput value={(p.navColor as string) || (p.textColor as string) || "#f8fafc"} onChange={(v) => up("navColor", v)} onBlur={(v) => up("navColor", v, true)} /></Field>
            </Section>
            <Section title="Section Padding (Responsive)">
                <PaddingFields p={p} up={up} />
            </Section>
            <Section title="Brand & Content">
                <Field label="Logo Type"><SelectInput value={(p.logoType as string) || "text"} onChange={(v) => up("logoType", v)} options={[{ label: "Text Only", value: "text" }, { label: "Image", value: "image" }]} /></Field>
                <Field label="Logo Text"><PanelInlineEditor value={(p.logoText as string) || "Solario Forge"} onChange={(v) => up("logoText", v)} placeholder="Your Brand" /></Field>
                {p.logoType === "image" && (<>
                    <Field label="Logo Image"><MediaInput value={(p.logoImage as string) || ""} onChange={(v) => up("logoImage", v)} placeholder="https://..." /></Field>
                    <Field label="Image Width"><TextInputWithUnit value={(p.logoWidth as string) ?? ""} onChange={(v) => up("logoWidth", v)} placeholder="120px" /></Field>
                    <Field label="Image Height"><TextInputWithUnit value={(p.logoHeight as string) ?? ""} onChange={(v) => up("logoHeight", v)} placeholder="40px" /></Field>
                    <Field label="Object Fit"><SelectInput value={(p.logoObjectFit as string) || "cover"} onChange={(v) => up("logoObjectFit", v)} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }, { label: "Auto", value: "none" }]} /></Field>
                    <Field label="Logo Shape"><SelectInput value={(p.logoShape as string) || "square"} onChange={(v) => up("logoShape", v)} options={[{ label: "Square", value: "square" }, { label: "Circle", value: "circle" }, { label: "Rounded", value: "rounded" }]} /></Field>
                </>)}
                {((p.logoType as string) || "text") === "text" && (
                    <TypographyFields p={p} up={up} prefix="logo" showContentField={false} showAlign={false} />
                )}

                <Field label="Description"><PanelInlineEditor multiline value={(p.description as string) || ""} onChange={(v) => up("description", v)} placeholder="Brief company description..." /></Field>
            </Section>
            <Section title="Copyright">
                <Field label="Copyright"><PanelInlineEditor value={(p.copyright as string) || ""} onChange={(v) => up("copyright", v)} placeholder="© 2026 Company" /></Field>
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
                                            <PanelInlineEditor
                                                value={item.label}
                                                onChange={(v) => {
                                                    const next = [...displayItems];
                                                    next[idx] = { ...next[idx], label: v };
                                                    up("links", next);
                                                }}
                                                placeholder="Label"
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
                            <div key={group.id} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
                                    <PanelInlineEditor
                                        value={group.heading}
                                        onChange={(v) => { const nG = [...(p.linkGroups as any[])]; nG[gIdx] = { ...nG[gIdx], heading: v }; up("linkGroups", nG); }}
                                        placeholder="Group Heading"
                                        style={{ fontWeight: 700, fontSize: 13, background: "transparent", border: "none", color: "var(--text)", outline: "none", width: "80%", padding: 0 }}
                                    />
                                    <button onClick={() => { const nG = (p.linkGroups as any[]).filter((_, i) => i !== gIdx); up("linkGroups", nG); }} style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer", fontSize: 18 }}>&times;</button>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                                    {group.links.map((link: any, lIdx: number) => (
                                        <div key={link.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                            <PanelInlineEditor
                                                value={link.label}
                                                onChange={(v) => {
                                                    const nG = [...(p.linkGroups as any[])];
                                                    const nL = [...nG[gIdx].links];
                                                    nL[lIdx] = { ...nL[lIdx], label: v };
                                                    nG[gIdx] = { ...nG[gIdx], links: nL };
                                                    up("linkGroups", nG);
                                                }}
                                                placeholder="Label"
                                                style={{ flex: 1 }}
                                            />
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

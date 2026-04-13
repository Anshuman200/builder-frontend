"use client";
import type { Block } from "@/types";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";

import { Section, Field, TextInput, TextareaInput, SelectInput, ColorInput, BorderRadiusInput, ToggleInput, MediaInput, AnimationPanel } from "./shared";
import { IconPicker } from "@/components/editor/IconPicker";
import { EDITOR_FEATURES } from "@/lib/config/features";

export function ButtonPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    const variant = (p.variant as string) || "solid";

    return (
        <>
            <Section title="Content">
                <Field label="Label"><TextInput value={(p.label as string) || ""} onChange={(v) => up("label", v)} placeholder="Click me" /></Field>
                <Field label="Link (href)"><TextInput value={(p.href as string) || ""} onChange={(v) => up("href", v)} placeholder="#" /></Field>
            </Section>
            <Section title="Appearance">
                <Field label="Variant"><SelectInput value={variant} onChange={(v) => up("variant", v)} options={[{ label: "Solid", value: "solid" }, { label: "Outline", value: "outline" }, { label: "Ghost", value: "ghost" }, { label: "Soft", value: "soft" }, { label: "Gradient", value: "gradient" }, { label: "Link", value: "link" }]} /></Field>
                <Field label="Size"><SelectInput value={(p.size as string) || "md"} onChange={(v) => up("size", v)} options={[{ label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }, { label: "Extra Large", value: "xl" }]} /></Field>
                <Field label="Alignment"><SelectInput value={(p.align as string) || "left"} onChange={(v) => up("align", v)} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} /></Field>
                <ToggleInput value={!!(p.fullWidth)} onChange={(v) => up("fullWidth", v)} label="Full Width" />
            </Section>
            <Section title="Colors">
                <Field label={variant === "gradient" ? "Unused (see Gradient)" : "Background Color"}><ColorInput value={(p.bgColor as string) || "#6366f1"} onChange={(v) => up("bgColor", v)} onBlur={(v) => up("bgColor", v, true)} /></Field>
                <Field label="Text Color"><ColorInput value={(p.textColor as string) || ""} onChange={(v) => up("textColor", v)} onBlur={(v) => up("textColor", v, true)} /></Field>
                <Field label="Border Color"><ColorInput value={(p.borderColor as string) || ""} onChange={(v) => up("borderColor", v)} onBlur={(v) => up("borderColor", v, true)} /></Field>
            </Section>
            {variant === "gradient" && (
                <Section title="Gradient">
                    <Field label="From Color"><ColorInput value={(p.gradientFrom as string) || "#6366f1"} onChange={(v) => up("gradientFrom", v)} onBlur={(v) => up("gradientFrom", v, true)} /></Field>
                    <Field label="To Color"><ColorInput value={(p.gradientTo as string) || "#8b5cf6"} onChange={(v) => up("gradientTo", v)} onBlur={(v) => up("gradientTo", v, true)} /></Field>
                    <Field label="Direction"><SelectInput value={(p.gradientDir as string) || "to right"} onChange={(v) => up("gradientDir", v)} options={[{ label: "→ Right", value: "to right" }, { label: "← Left", value: "to left" }, { label: "↓ Bottom", value: "to bottom" }, { label: "↗ Top Right", value: "to top right" }, { label: "↘ Bottom Right", value: "to bottom right" }]} /></Field>
                </Section>
            )}
            <Section title="Shape">
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "9999px"} onChange={(v) => up("borderRadius", v)} /></Field>
                <Field label="Border Width"><TextInput value={(p.borderWidth as string) || "2px"} onChange={(v) => up("borderWidth", v)} placeholder="2px" /></Field>
            </Section>
            <Section title="Typography">
                <Field label="Font Size override"><TextInput value={(p.fontSize as string) || ""} onChange={(v) => up("fontSize", v)} placeholder="auto" /></Field>
                <Field label="Font Weight"><SelectInput value={(p.fontWeight as string) || "700"} onChange={(v) => up("fontWeight", v)} options={[{ label: "Normal (400)", value: "400" }, { label: "Medium (500)", value: "500" }, { label: "Semibold (600)", value: "600" }, { label: "Bold (700)", value: "700" }, { label: "Black (900)", value: "900" }]} /></Field>
                <Field label="Letter Spacing"><TextInput value={(p.letterSpacing as string) || "0.02em"} onChange={(v) => up("letterSpacing", v)} placeholder="0.02em" /></Field>
            </Section>
            <Section title="Shadow">
                <Field label="Shadow"><SelectInput value={(p.shadow as string) || "none"} onChange={(v) => up("shadow", v)} options={[{ label: "None", value: "none" }, { label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }, { label: "Glow", value: "glow" }]} /></Field>
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
    const { updateBlock } = useEditorStore();
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
                <Field label="Background Color"><ColorInput value={(p.bgColor as string) || "#ffffff"} onChange={(v) => up("bgColor", v)} onBlur={(v) => up("bgColor", v, true)} /></Field>
                <Field label="Text/Link Color"><ColorInput value={(p.textColor as string) || "#0f172a"} onChange={(v) => up("textColor", v)} onBlur={(v) => up("textColor", v, true)} /></Field>
            </Section>
            <Section title="Padding (Responsive)">
                <Field label="Desktop"><TextInput value={(p.padding as string) || ""} onChange={(v) => up("padding", v)} placeholder="16px 32px" /></Field>
                <Field label="Tablet ≤ 1024px"><TextInput value={(p.tabletPadding as string) || ""} onChange={(v) => up("tabletPadding", v)} placeholder="same as desktop" /></Field>
                <Field label="Mobile ≤ 768px"><TextInput value={(p.mobilePadding as string) || ""} onChange={(v) => up("mobilePadding", v)} placeholder="same as tablet" /></Field>
            </Section>
            <Section title="Brand (Logo)">
                <Field label="Logo Type"><SelectInput value={(p.logoType as string) || "text"} onChange={(v) => up("logoType", v)} options={[{ label: "Text Only", value: "text" }, { label: "Image", value: "image" }]} /></Field>
                <Field label="Logo Text"><TextInput value={(p.logoText as string) || "PageCraft"} onChange={(v) => up("logoText", v)} placeholder="Your Brand" /></Field>
                {p.logoType === "image" && (<>
                    <Field label="Logo Image"><MediaInput value={(p.logoImage as string) || ""} onChange={(v) => up("logoImage", v)} placeholder="https://..." /></Field>
                    <Field label="Image Width"><TextInput value={(p.logoWidth as string) || "120px"} onChange={(v) => up("logoWidth", v)} placeholder="120px" /></Field>
                </>)}
            </Section>
            <Section title="Call to Action (CTA)">
                <ToggleInput value={p.showCta !== false} onChange={(v) => up("showCta", v)} label="Show CTA Button" />
                {p.showCta !== false && (<>
                    <Field label="Button Text"><TextInput value={(p.ctaText as string) || "Get Started"} onChange={(v) => up("ctaText", v)} placeholder="Get Started" /></Field>
                    <Field label="Button URL"><TextInput value={(p.ctaUrl as string) || "#"} onChange={(v) => up("ctaUrl", v)} placeholder="https://..." /></Field>
                    <Field label="Design Style"><SelectInput value={(p.ctaVariant as string) || "solid"} onChange={(v) => up("ctaVariant", v)} options={[{ label: "Solid Filled", value: "solid" }, { label: "Outline", value: "outline" }]} /></Field>
                    <Field label="Base Color"><ColorInput value={(p.ctaBgColor as string) || "#6366f1"} onChange={(v) => up("ctaBgColor", v)} onBlur={(v) => up("ctaBgColor", v, true)} /></Field>
                    {p.ctaVariant === "solid" && (<Field label="Text Color"><ColorInput value={(p.ctaTextColor as string) || "#ffffff"} onChange={(v) => up("ctaTextColor", v)} onBlur={(v) => up("ctaTextColor", v, true)} /></Field>)}
                </>)}
            </Section>
            <Section title="Navigation Links">
                <div style={{ padding: "8px 0", fontSize: 11, color: "var(--text-subtle)" }}>Add or remove links in the navigation bar.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {((p.links as { id: string; label: string; url: string }[]) || []).map((link, idx) => (
                        <div key={link.id || idx} style={{ display: "flex", flexDirection: "column", gap: 4, padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 10, fontWeight: 600 }}>Link {idx + 1}</span>
                                <button onClick={() => { const nL = [...((p.links as any[]) || [])]; nL.splice(idx, 1); up("links", nL); }} style={{ background: "transparent", border: "none", color: "var(--error, red)", cursor: "pointer", fontSize: 12 }}>&times;</button>
                            </div>
                            <input value={link.label} onChange={(e) => { const nL = (p.links as any[]) || []; up("links", nL.map((l, i) => i === idx ? { ...l, label: e.target.value } : l)); }} placeholder="Label" style={{ fontSize: 11, padding: "4px 8px" }} />
                            <input value={link.url} onChange={(e) => { const nL = (p.links as any[]) || []; up("links", nL.map((l, i) => i === idx ? { ...l, url: e.target.value } : l)); }} placeholder="URL (e.g. /about)" style={{ fontSize: 11, padding: "4px 8px" }} />
                        </div>
                    ))}
                    <button onClick={() => { const nL = [...((p.links as any[]) || [])]; nL.push({ id: crypto.randomUUID(), label: "New Link", url: "#" }); up("links", nL); }} style={{ padding: "6px 0", background: "var(--primary-light)", color: "var(--primary)", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Add Nav Link</button>
                </div>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function FooterPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    const updateProps = (newProps: Record<string, unknown>) => updateBlock(block.id, newProps);

    return (
        <>
            <Section title="Layout & Styling">
                <Field label="Section Layout"><SelectInput value={(p.layout as string) || "standard"} onChange={(v) => updateProps({ layout: v })} options={[{ label: "Standard (Logo + Links)", value: "standard" }, { label: "Centered (Logo Center)", value: "centered" }, { label: "Columns (Multi-section)", value: "columns" }, { label: "Minimal (1 line)", value: "minimal" }]} /></Field>
                <ToggleInput label="Full Width Container" value={!!p.fullWidth} onChange={(v) => updateProps({ fullWidth: v })} />
                <Field label="Background Color"><ColorInput value={(p.bgColor as string) || "#0f172a"} onChange={(v) => up("bgColor", v)} onBlur={(v) => up("bgColor", v, true)} /></Field>
                <Field label="Text Color"><ColorInput value={(p.textColor as string) || "#f8fafc"} onChange={(v) => up("textColor", v)} onBlur={(v) => up("textColor", v, true)} /></Field>
            </Section>
            <Section title="Padding (Responsive)">
                <Field label="Desktop"><TextInput value={(p.padding as string) || ""} onChange={(v) => up("padding", v)} placeholder="48px 32px" /></Field>
                <Field label="Tablet ≤ 1024px"><TextInput value={(p.tabletPadding as string) || ""} onChange={(v) => up("tabletPadding", v)} placeholder="32px 24px" /></Field>
                <Field label="Mobile ≤ 768px"><TextInput value={(p.mobilePadding as string) || ""} onChange={(v) => up("mobilePadding", v)} placeholder="24px 16px" /></Field>
            </Section>
            <Section title="Brand & Content">
                <Field label="Logo Type"><SelectInput value={(p.logoType as string) || "text"} onChange={(v) => up("logoType", v)} options={[{ label: "Text Only", value: "text" }, { label: "Image", value: "image" }]} /></Field>
                <Field label="Logo Text"><TextInput value={(p.logoText as string) || "PageCraft"} onChange={(v) => up("logoText", v)} placeholder="Your Brand" /></Field>
                {p.logoType === "image" && (<>
                    <Field label="Logo Image"><MediaInput value={(p.logoImage as string) || ""} onChange={(v) => up("logoImage", v)} placeholder="https://..." /></Field>
                    <Field label="Image Width"><TextInput value={(p.logoWidth as string) || "120px"} onChange={(v) => up("logoWidth", v)} placeholder="120px" /></Field>
                </>)}
                <Field label="Description"><TextareaInput value={(p.description as string) || ""} onChange={(v) => up("description", v)} rows={3} placeholder="Brief company description..." /></Field>
                <Field label="Copyright"><TextInput value={(p.copyright as string) || ""} onChange={(v) => up("copyright", v)} placeholder="© 2026 Company" /></Field>
            </Section>
            <Section title="Footer Links">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {((p.links as { id: string; label: string; url: string }[]) || []).map((link, idx) => (
                        <div key={link.id || idx} style={{ display: "flex", flexDirection: "column", gap: 4, padding: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 10, fontWeight: 600 }}>Link {idx + 1}</span>
                                <button onClick={() => { const nL = [...((p.links as any[]) || [])]; nL.splice(idx, 1); up("links", nL); }} style={{ background: "transparent", border: "none", color: "var(--error, red)", cursor: "pointer", fontSize: 12 }}>&times;</button>
                            </div>
                            <input value={link.label} onChange={(e) => { const nL = [...((p.links as any[]) || [])]; nL[idx].label = e.target.value; up("links", nL); }} placeholder="Label" style={{ fontSize: 11, padding: "4px 8px" }} />
                            <input value={link.url} onChange={(e) => { const nL = [...((p.links as any[]) || [])]; nL[idx].url = e.target.value; up("links", nL); }} placeholder="URL (e.g. #contact)" style={{ fontSize: 11, padding: "4px 8px" }} />
                        </div>
                    ))}
                    <button onClick={() => { const nL = [...((p.links as any[]) || [])]; nL.push({ id: crypto.randomUUID(), label: "New Link", url: "#" }); up("links", nL); }} style={{ padding: "6px 0", background: "var(--primary-light)", color: "var(--primary)", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Add Link</button>
                </div>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

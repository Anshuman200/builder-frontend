"use client";
import type { Block } from "@/@Types";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";

import { Section, Field, TextInput, SelectInput, ColorInput, BorderRadiusInput, AnimationPanel } from "./shared";
import { IconPicker } from "@/components/editor/IconPicker";
import { EDITOR_FEATURES } from "@/lib/editorFeatures";

export function HeroPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });
    return (
        <>
            <Section title="Background">
                <Field label="Background Color"><ColorInput value={(p.bgColor as string) || "#6366f1"} onChange={(v) => up("bgColor", v)} /></Field>
                <Field label="Background Image URL"><TextInput value={(p.bgImage as string) || ""} onChange={(v) => up("bgImage", v)} placeholder="https://... (overrides color)" /></Field>
                <Field label="Image Overlay Color"><TextInput value={(p.bgOverlay as string) || "rgba(0,0,0,0.25)"} onChange={(v) => up("bgOverlay", v)} placeholder="rgba(0,0,0,0.25)" /></Field>
            </Section>
            <Section title="Style">
                <Field label="Text Color"><ColorInput value={(p.textColor as string) || "#ffffff"} onChange={(v) => up("textColor", v)} /></Field>
                <Field label="Min Height"><TextInput value={(p.minHeight as string) || "480px"} onChange={(v) => up("minHeight", v)} placeholder="480px" /></Field>
                <Field label="Content Alignment"><SelectInput value={(p.align as string) || "center"} onChange={(v) => up("align", v)} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} /></Field>
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "0px"} onChange={(v) => up("borderRadius", v)} /></Field>
            </Section>
            <Section title="Padding (Responsive)">
                <Field label="Desktop"><TextInput value={(p.padding as string) || ""} onChange={(v) => up("padding", v)} placeholder="4rem 2rem" /></Field>
                <Field label="Tablet ≤ 1024px"><TextInput value={(p.tabletPadding as string) || ""} onChange={(v) => up("tabletPadding", v)} placeholder="same as desktop" /></Field>
                <Field label="Mobile ≤ 768px"><TextInput value={(p.mobilePadding as string) || ""} onChange={(v) => up("mobilePadding", v)} placeholder="same as tablet" /></Field>
                <div style={{ fontSize: 10, color: "var(--text-subtle)", lineHeight: 1.4, paddingTop: 2 }}>Switch viewport in toolbar to preview.</div>
            </Section>
            <div style={{ padding: "10px 14px" }}>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-subtle)", lineHeight: 1.5 }}>💡 Drag any block from the palette directly into the Hero section.</p>
            </div>
            <AnimationPanel block={block} />
        </>
    );
}

export function TextPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });
    return (
        <>
            <Section title="Content">
                <Field label="Tag"><SelectInput value={(p.tag as string) || "p"} onChange={(v) => up("tag", v)} options={[{ label: "Paragraph (p)", value: "p" }, { label: "Heading 1 (h1)", value: "h1" }, { label: "Heading 2 (h2)", value: "h2" }, { label: "Heading 3 (h3)", value: "h3" }, { label: "Heading 4 (h4)", value: "h4" }]} /></Field>
                <Field label="Text"><textarea value={(p.content as string) || ""} onChange={(e) => up("content", e.target.value)} rows={4} style={{ width: "100%", padding: "6px 8px", fontSize: 11, background: "#222222", border: "1px solid transparent", borderRadius: 4, color: "#ededed", outline: "none", resize: "vertical" }} /></Field>
            </Section>
            <Section title="Typography">
                <Field label="Alignment"><SelectInput value={(p.align as string) || "left"} onChange={(v) => up("align", v)} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} /></Field>
                <Field label="Color"><ColorInput value={(p.color as string) || "#0f172a"} onChange={(v) => up("color", v)} /></Field>
                <Field label="Line Height"><TextInput value={(p.lineHeight as string) || "1.6"} onChange={(v) => up("lineHeight", v)} placeholder="1.6" /></Field>
                <Field label="Letter Spacing"><TextInput value={(p.letterSpacing as string) || ""} onChange={(v) => up("letterSpacing", v)} placeholder="0em" /></Field>
            </Section>
            <Section title="Font Size (Responsive)">
                <Field label="Desktop"><TextInput value={(p.fontSize as string) || ""} onChange={(v) => up("fontSize", v)} placeholder="1rem" /></Field>
                <Field label="Tablet ≤ 768px"><TextInput value={(p.tabletFontSize as string) || ""} onChange={(v) => up("tabletFontSize", v)} placeholder="same as desktop" /></Field>
                <Field label="Mobile ≤ 390px"><TextInput value={(p.mobileFontSize as string) || ""} onChange={(v) => up("mobileFontSize", v)} placeholder="same as tablet" /></Field>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function ImagePanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });
    return (
        <>
            <Section title="Source">
                <Field label="Image URL"><TextInput value={(p.src as string) || ""} onChange={(v) => up("src", v)} placeholder="https://..." /></Field>
                <Field label="Alt Text"><TextInput value={(p.alt as string) || ""} onChange={(v) => up("alt", v)} placeholder="Describe the image" /></Field>
                <Field label="Caption"><TextInput value={(p.caption as string) || ""} onChange={(v) => up("caption", v)} placeholder="Optional caption..." /></Field>
                <Field label="Link (clickable)"><TextInput value={(p.link as string) || ""} onChange={(v) => up("link", v)} placeholder="https://..." /></Field>
            </Section>
            <Section title="Dimensions">
                <Field label="Width"><TextInput value={(p.width as string) || "100%"} onChange={(v) => up("width", v)} placeholder="100%" /></Field>
                <Field label="Height"><TextInput value={(p.height as string) || "auto"} onChange={(v) => up("height", v)} placeholder="auto or 300px" /></Field>
                <Field label="Aspect Ratio"><SelectInput value={(p.aspectRatio as string) || "auto"} onChange={(v) => up("aspectRatio", v)} options={[{ label: "Auto", value: "auto" }, { label: "16:9", value: "16/9" }, { label: "4:3", value: "4/3" }, { label: "1:1 (Square)", value: "1/1" }, { label: "3:2", value: "3/2" }, { label: "21:9", value: "21/9" }]} /></Field>
            </Section>
            <Section title="Style">
                <Field label="Alignment"><SelectInput value={(p.align as string) || "center"} onChange={(v) => up("align", v)} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} /></Field>
                <Field label="Object Fit"><SelectInput value={(p.objectFit as string) || "cover"} onChange={(v) => up("objectFit", v)} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }, { label: "None", value: "none" }]} /></Field>
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "0px"} onChange={(v) => up("borderRadius", v)} /></Field>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function DividerPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });
    return (
        <>
            <Section title="Style">
                <Field label="Line Style"><SelectInput value={(p.style as string) || "solid"} onChange={(v) => up("style", v)} options={[{ label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }]} /></Field>
                <Field label="Color"><ColorInput value={(p.color as string) || "#e2e8f0"} onChange={(v) => up("color", v)} /></Field>
                <Field label="Thickness"><TextInput value={(p.thickness as string) || "1px"} onChange={(v) => up("thickness", v)} placeholder="1px" /></Field>
                <Field label="Vertical Margin"><TextInput value={(p.marginY as string) || "1rem"} onChange={(v) => up("marginY", v)} placeholder="1rem" /></Field>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function ContainerPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });
    return (
        <>
            <Section title="Padding (Responsive)">
                <Field label="Desktop"><TextInput value={(p.padding as string) || ""} onChange={(v) => up("padding", v)} placeholder="24px" /></Field>
                <Field label="Tablet ≤ 1024px"><TextInput value={(p.tabletPadding as string) || ""} onChange={(v) => up("tabletPadding", v)} placeholder="same as desktop" /></Field>
                <Field label="Mobile ≤ 768px"><TextInput value={(p.mobilePadding as string) || ""} onChange={(v) => up("mobilePadding", v)} placeholder="same as tablet" /></Field>
            </Section>
            <Section title="Layout">
                <Field label="Max Width"><TextInput value={(p.maxWidth as string) || "100%"} onChange={(v) => up("maxWidth", v)} placeholder="100% or 100dvw" /></Field>
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "0px"} onChange={(v) => up("borderRadius", v)} /></Field>
            </Section>
            <Section title="Style">
                <Field label="Background Color"><ColorInput value={(p.bgColor as string) || ""} onChange={(v) => up("bgColor", v)} /></Field>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function IconPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });
    return (
        <>
            <Section title="Icon settings">
                <Field label="Icon"><IconPicker value={(p.iconName as string) || "Star"} onChange={(v) => up("iconName", v)} /></Field>
                <Field label="Size"><TextInput value={(p.size as string) || "24"} onChange={(v) => up("size", v)} placeholder="24" /></Field>
                <Field label="Color"><ColorInput value={(p.color as string) || "#6366f1"} onChange={(v) => up("color", v)} /></Field>
            </Section>
            <Section title="Layout & Spacing">
                <Field label="Alignment"><SelectInput value={(p.align as string) || "center"} onChange={(v) => up("align", v)} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} /></Field>
                <Field label="Padding"><TextInput value={(p.padding as string) || "16px"} onChange={(v) => up("padding", v)} placeholder="16px" /></Field>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function VideoPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });
    const ToggleRow = ({ label, propKey }: { label: string; propKey: string }) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
            <span style={{ fontSize: 11, color: "#ededed" }}>{label}</span>
            <div style={{ display: "flex", background: "#222", borderRadius: 4, overflow: "hidden", border: "1px solid #2a2a2a" }}>
                <button onClick={() => up(propKey, true)} style={{ padding: "3px 10px", fontSize: 11, background: !!(p[propKey]) ? "#333" : "transparent", color: !!(p[propKey]) ? "#fff" : "#888", border: "none", cursor: "pointer" }}>Yes</button>
                <button onClick={() => up(propKey, false)} style={{ padding: "3px 10px", fontSize: 11, background: !(p[propKey]) ? "#333" : "transparent", color: !(p[propKey]) ? "#fff" : "#888", border: "none", cursor: "pointer" }}>No</button>
            </div>
        </div>
    );
    return (
        <>
            <Section title="Video Source">
                <Field label="Video URL"><TextInput value={(p.url as string) || ""} onChange={(v) => up("url", v)} placeholder="YouTube / Vimeo / .mp4" /></Field>
                <div style={{ fontSize: 10, color: "var(--text-subtle)", marginTop: 4 }}>Supports YouTube, Vimeo, and direct .mp4 links.</div>
            </Section>
            <Section title="Playback Options">
                <ToggleRow label="AutoPlay" propKey="autoPlay" />
                <ToggleRow label="Loop" propKey="loop" />
                <ToggleRow label="Muted" propKey="muted" />
                <ToggleRow label="Show Controls" propKey="controls" />
            </Section>
            <Section title="Dimensions & Style">
                <Field label="Width"><TextInput value={(p.width as string) || "100%"} onChange={(v) => up("width", v)} placeholder="100%" /></Field>
                <Field label="Aspect Ratio"><SelectInput value={(p.aspectRatio as string) || "16/9"} onChange={(v) => up("aspectRatio", v)} options={[{ label: "16:9", value: "16/9" }, { label: "4:3", value: "4/3" }, { label: "1:1", value: "1/1" }, { label: "21:9", value: "21/9" }, { label: "9:16 (Vertical)", value: "9/16" }]} /></Field>
                <Field label="Padding"><TextInput value={(p.padding as string) || "16px"} onChange={(v) => up("padding", v)} placeholder="16px" /></Field>
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "8px"} onChange={(v) => up("borderRadius", v)} /></Field>
                <Field label="Alignment"><SelectInput value={(p.align as string) || "center"} onChange={(v) => up("align", v)} options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]} /></Field>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function ColumnsPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown) => updateBlock(block.id, { [key]: val });
    return (
        <>
            <Section title="Layout">
                <Field label="Left Col Width (%)">
                    <input type="range" min={20} max={80} step={5} value={Number(p.leftWidth || 50)} onChange={(e) => up("leftWidth", e.target.value)} style={{ width: "100%", accentColor: "var(--primary)" }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>{String(p.leftWidth ?? 50)}% / {String(100 - Number(p.leftWidth ?? 50))}%</span>
                </Field>
                <Field label="Gap"><TextInput value={(p.gap as string) || "1.5rem"} onChange={(v) => up("gap", v)} placeholder="1.5rem" /></Field>
            </Section>
            <Section title="Padding (Responsive)">
                <Field label="Desktop"><TextInput value={(p.padding as string) || ""} onChange={(v) => up("padding", v)} placeholder="16px 24px" /></Field>
                <Field label="Tablet ≤ 1024px"><TextInput value={(p.tabletPadding as string) || ""} onChange={(v) => up("tabletPadding", v)} placeholder="same as desktop" /></Field>
                <Field label="Mobile ≤ 768px"><TextInput value={(p.mobilePadding as string) || ""} onChange={(v) => up("mobilePadding", v)} placeholder="same as tablet" /></Field>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

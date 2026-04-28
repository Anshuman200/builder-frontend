"use client";
import type { Block } from "@/types";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";

import { Section, Field, TextInput, SelectInput, ColorInput, BorderRadiusInput, ToggleInput, MediaInput, ToggleSwitch, AlignmentInput, PaddingInput, TextInputWithUnit } from "./shared";
import { AnimationPanel } from "./AnimationPanel";
import { IconPicker } from "@/components/editor/IconPicker";
import { Input as AntInput } from "antd";
import { EDITOR_FEATURES } from "@/lib/config/features";
import { heroSections } from "@/lib/sections/hero";
import { BackgroundPanel } from "./BackgroundPanel";

export function HeroPanel({ block }: { block: Block }) {
    const { updateBlock, replaceBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    return (
        <>
            <BackgroundPanel block={block} />
            <Section title="Style">
                <Field label="Hero Template">
                    <SelectInput
                        value={(p.templateId as string) || ""}
                        onChange={(v) => {
                            const template = heroSections.find(s => s.id === v);
                            if (template) {
                                // 1. Extract content from current block
                                const extractText = (b: Block): string[] => {
                                    let res: string[] = [];
                                    if (b.type === "text" && b.props.content) res.push(b.props.content as string);
                                    else if (b.type === "button" && b.props.label) res.push(b.props.label as string);
                                    
                                    ["childBlocks", "col0", "col1"].forEach(pName => {
                                        const children = b.props[pName] as Block[] | undefined;
                                        if (Array.isArray(children)) children.forEach(c => { res = [...res, ...extractText(c)]; });
                                    });
                                    return res;
                                };
                                const oldText = extractText(block);

                                // 2. Create new block
                                const newBlock = template.create();
                                
                                // 3. Inject content into new block
                                const injectText = (b: Block, texts: string[]): string[] => {
                                    let remaining = [...texts];
                                    if (remaining.length === 0) return [];
                                    if (b.type === "text") b.props.content = remaining.shift();
                                    else if (b.type === "button") b.props.label = remaining.shift();
                                    
                                    ["childBlocks", "col0", "col1"].forEach(pName => {
                                        const children = b.props[pName] as Block[] | undefined;
                                        if (Array.isArray(children)) children.forEach(c => { remaining = injectText(c, remaining); });
                                    });
                                    return remaining;
                                };
                                injectText(newBlock, oldText);

                                // 4. Smart Merge: Preserve existing style props
                                const preserved: Record<string, any> = {};
                                [
                                    "bgColor", "bgImage", "bgOverlay", "bgOverlayColor", 
                                    "textColor", "minHeight", "padding", "tabletPadding", 
                                    "mobilePadding", "borderRadius"
                                ].forEach(prop => {
                                    if (p[prop] !== undefined) preserved[prop] = p[prop];
                                });

                                newBlock.props = {
                                    ...newBlock.props,
                                    ...preserved,
                                    templateId: v
                                };

                                replaceBlock(block.id, newBlock);
                            }
                        }}
                        options={[
                            ...heroSections.map(s => ({ label: s.name, value: s.id }))
                        ]}
                        placeholder="Select Template"
                    />
                </Field>
                <Field label="Text Color"><ColorInput value={(p.textColor as string) || "#ffffff"} onChange={(v) => up("textColor", v)} onBlur={(v) => up("textColor", v, true)} /></Field>
                <Field label="Min Height"><TextInputWithUnit value={(p.minHeight as string) ?? ""} onChange={(v) => up("minHeight", v)} placeholder="480px" /></Field>
                <AlignmentInput label="Content Alignment" value={(p.align as string) || "center"} onChange={(v) => up("align", v)} />
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "0px"} onChange={(v) => up("borderRadius", v)} /></Field>
            </Section>
            <Section title="Padding (Responsive)">
                <PaddingInput label="Desktop" value={(p.padding as string) || ""} onChange={(v) => up("padding", v)} placeholder="4rem 2rem" />
                <PaddingInput label="Tablet" value={(p.tabletPadding as string) || ""} onChange={(v) => up("tabletPadding", v)} placeholder="same as desktop" />
                <PaddingInput label="Mobile" value={(p.mobilePadding as string) || ""} onChange={(v) => up("mobilePadding", v)} placeholder="same as tablet" />
                <div style={{ fontSize: 10, color: "var(--text-subtle)", lineHeight: 1.4, paddingTop: 2 }}>Switch viewport in toolbar to preview.</div>
            </Section>
            <div style={{ padding: "10px 14px" }}>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-subtle)", lineHeight: 1.5 }}>💡 Drag any block from the palette directly into the Hero section.</p>
            </div>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function TextPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    const [taRef, setTaRef] = React.useState<HTMLTextAreaElement | null>(null);

    // Insert a prefix on every selected line (or current line if no selection)
    const insertLinePrefix = (prefix: string) => {
        const ta = taRef;
        if (!ta) return;
        const val = ta.value;
        const start = ta.selectionStart ?? 0;
        const end = ta.selectionEnd ?? 0;
        const lineStart = val.lastIndexOf("\n", start - 1) + 1;
        const lineEnd = val.indexOf("\n", end);
        const actualEnd = lineEnd === -1 ? val.length : lineEnd;
        const selected = val.slice(lineStart, actualEnd);
        // Toggle: if all lines already have prefix, remove it; otherwise add
        const lines = selected.split("\n");
        const allHave = lines.every(l => l.startsWith(prefix));
        const newLines = lines.map(l => allHave ? l.slice(prefix.length) : prefix + l);
        const newVal = val.slice(0, lineStart) + newLines.join("\n") + val.slice(actualEnd);
        up("content", newVal);
        // Restore caret (approx)
        requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(lineStart, lineStart + newLines.join("\n").length); });
    };

    // Add ordered list numbering on selected / current lines
    const insertNumbered = () => {
        const ta = taRef;
        if (!ta) return;
        const val = ta.value;
        const start = ta.selectionStart ?? 0;
        const end = ta.selectionEnd ?? 0;
        const lineStart = val.lastIndexOf("\n", start - 1) + 1;
        const lineEnd = val.indexOf("\n", end);
        const actualEnd = lineEnd === -1 ? val.length : lineEnd;
        const selected = val.slice(lineStart, actualEnd);
        const lines = selected.split("\n");
        // Strip existing "N. " prefix then re-number
        const stripped = lines.map(l => l.replace(/^\d+\.\s/, ""));
        const newLines = stripped.map((l, i) => `${i + 1}. ${l}`);
        const newVal = val.slice(0, lineStart) + newLines.join("\n") + val.slice(actualEnd);
        up("content", newVal);
        requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(lineStart, lineStart + newLines.join("\n").length); });
    };

    const toolbarBtns: { label: string; title: string; action: () => void }[] = [
        { label: "•", title: "Bullet list (•)", action: () => insertLinePrefix("• ") },
        { label: "–", title: "Dash list (–)", action: () => insertLinePrefix("– ") },
        { label: "→", title: "Arrow list (→)", action: () => insertLinePrefix("→ ") },
        { label: "✓", title: "Checkmark list (✓)", action: () => insertLinePrefix("✓ ") },
        { label: "☐", title: "Checkbox list (☐)", action: () => insertLinePrefix("☐ ") },
        { label: "1.", title: "Numbered list", action: insertNumbered },
        { label: "»", title: "Blockquote (»)", action: () => insertLinePrefix("» ") },
        { label: "⚡", title: "Emoji bullet (⚡)", action: () => insertLinePrefix("⚡ ") },
    ];

    // Known static prefixes (order matters — longer first to avoid partial matches)
    const STATIC_PREFIXES = ["→ ", "– ", "• ", "✓ ", "☐ ", "» ", "⚡ "];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const ta = e.currentTarget;
        if (e.key !== "Enter") return;

        const val = ta.value;
        const caret = ta.selectionStart ?? 0;
        // Find start of current line
        const lineStart = val.lastIndexOf("\n", caret - 1) + 1;
        const currentLine = val.slice(lineStart, caret);

        // --- Check numbered prefix (e.g. "1. ", "12. ") ---
        const numMatch = currentLine.match(/^(\d+)\.\s/);
        if (numMatch) {
            const lineContent = currentLine.slice(numMatch[0].length);
            e.preventDefault();
            if (!lineContent.trim()) {
                // Empty numbered line → exit list: replace prefix with nothing
                const newVal = val.slice(0, lineStart) + val.slice(lineStart + numMatch[0].length);
                up("content", newVal);
                requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(lineStart, lineStart); });
                return;
            }
            const nextNum = parseInt(numMatch[1]) + 1;
            const insertion = `\n${nextNum}. `;
            const newVal = val.slice(0, caret) + insertion + val.slice(caret);
            up("content", newVal);
            requestAnimationFrame(() => { const pos = caret + insertion.length; ta.focus(); ta.setSelectionRange(pos, pos); });
            return;
        }

        // --- Check static prefix ---
        const matched = STATIC_PREFIXES.find(px => currentLine.startsWith(px));
        if (matched) {
            const lineContent = currentLine.slice(matched.length);
            e.preventDefault();
            if (!lineContent.trim()) {
                // Empty list line → exit list: remove prefix on current line
                const newVal = val.slice(0, lineStart) + val.slice(lineStart + matched.length);
                up("content", newVal);
                requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(lineStart, lineStart); });
                return;
            }
            const insertion = `\n${matched}`;
            const newVal = val.slice(0, caret) + insertion + val.slice(caret);
            up("content", newVal);
            requestAnimationFrame(() => { const pos = caret + insertion.length; ta.focus(); ta.setSelectionRange(pos, pos); });
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const TextArea = (AntInput as any).TextArea;

    return (
        <>
            <Section title="Content">
                <Field label="Tag"><SelectInput value={(p.tag as string) || "p"} onChange={(v) => up("tag", v)} options={[{ label: "Paragraph (p)", value: "p" }, { label: "Heading 1 (h1)", value: "h1" }, { label: "Heading 2 (h2)", value: "h2" }, { label: "Heading 3 (h3)", value: "h3" }, { label: "Heading 4 (h4)", value: "h4" }, { label: "Unordered List (ul)", value: "ul" }, { label: "Ordered List (ol)", value: "ol" }]} /></Field>

                {/* ── Toolbar ───────────────────────────────────────────────── */}
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {toolbarBtns.map(btn => (
                        <button key={btn.label} title={btn.title} onMouseDown={(e) => { e.preventDefault(); btn.action(); }}
                            style={{ flex: 1, padding: "5px 0", fontSize: 13, textAlign: "center", background: "#2a2a2a", color: "#e2e8f0", border: "1px solid #3a3a3a", borderRadius: 4, cursor: "pointer", lineHeight: 1.4, transition: "background 0.15s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#3a3a3a")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#2a2a2a")}
                        >{btn.label}</button>
                    ))}
                </div>

                {/* ── Antd TextArea ─────────────────────────────────────────── */}
                <div className="ag-text-panel-textarea">
                    <TextArea
                        ref={(r: { resizableTextArea?: { textArea?: HTMLTextAreaElement } } | null) => { setTaRef(r?.resizableTextArea?.textArea ?? null); }}
                        value={(p.content as string) || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => up("content", e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoSize={{ minRows: 5, maxRows: 16 }}
                        showCount
                        allowClear={{ clearIcon: <span className="text-red-600 cursor-pointer border rounded-full h-3 w-3 flex items-center justify-center">✕</span> }}
                        placeholder={"Type your text here…\nEach line break → new line on canvas\n• Use toolbar above for bullets & lists\nPress Enter to continue a list, Enter again on empty line to stop"}
                        style={{ width: "100%", fontFamily: "monospace", fontSize: 11, lineHeight: 1.6, background: "#1a1a1a", color: "#ededed", borderColor: "#333" }}
                    />
                </div>
            </Section>
            <Section title="Typography">
                <AlignmentInput value={(p.align as string) || "left"} onChange={(v) => up("align", v)} />
                <Field label="Color"><ColorInput value={(p.color as string) || "#0f172a"} onChange={(v) => up("color", v)} onBlur={(v) => up("color", v, true)} /></Field>
                <Field label="Font Weight"><SelectInput value={(p.fontWeight as string) || "400"} onChange={(v) => up("fontWeight", v)} options={[{ label: "Thin (100)", value: "100" }, { label: "Light (300)", value: "300" }, { label: "Regular (400)", value: "400" }, { label: "Medium (500)", value: "500" }, { label: "Semibold (600)", value: "600" }, { label: "Bold (700)", value: "700" }, { label: "Extrabold (800)", value: "800" }, { label: "Black (900)", value: "900" }]} /></Field>
                <Field label="Font Style">
                    <div className="w-full" style={{ display: "flex", gap: 6 }}>
                        {[["B", "bold", "Bold"], ["I", "italic", "Italic"], ["U", "underline", "Underline"], ["S", "strikethrough", "Strikethrough"]].map(([label, key, title]) => (
                            <button key={key} title={title} onClick={() => up(key, !p[key])} style={{ flex: 1, padding: "5px 0", fontSize: 13, fontWeight: label === "B" ? 800 : 400, fontStyle: label === "I" ? "italic" : "normal", textDecoration: label === "U" ? "underline" : label === "S" ? "line-through" : "none", background: p[key] ? "#ff0000" : "#2a2a2a", color: p[key] ? "#fff" : "#aaa", border: "none", borderRadius: 4, cursor: "pointer", transition: "all 0.15s" }}>{label}</button>
                        ))}
                    </div>
                </Field>
                <Field label="Line Height"><TextInputWithUnit value={(p.lineHeight as string) ?? ""} onChange={(v) => up("lineHeight", v)} placeholder="1.6" /></Field>
                <Field label="Letter Spacing"><TextInputWithUnit value={(p.letterSpacing as string) ?? ""} onChange={(v) => up("letterSpacing", v)} placeholder="0em" /></Field>
            </Section>
            <Section title="Font Size (Responsive)">
                <Field label="Desktop"><TextInputWithUnit value={(p.fontSize as string) ?? ""} onChange={(v) => up("fontSize", v)} placeholder="1rem" /></Field>
                <Field label="Tablet ≤ 768px"><TextInputWithUnit value={(p.tabletFontSize as string) ?? ""} onChange={(v) => up("tabletFontSize", v)} placeholder="same as desktop" /></Field>
                <Field label="Mobile ≤ 390px"><TextInputWithUnit value={(p.mobileFontSize as string) ?? ""} onChange={(v) => up("mobileFontSize", v)} placeholder="same as tablet" /></Field>
            </Section>
            <Section title="Spacing">
                <PaddingInput value={(p.padding as string) || "12px 24px"} onChange={(v) => up("padding", v)} placeholder="12px 24px" />
                <Field label="Margin Top"><TextInputWithUnit value={(p.marginTop as string) ?? ""} onChange={(v) => up("marginTop", v)} placeholder="0" /></Field>
                <Field label="Margin Bottom"><TextInputWithUnit value={(p.marginBottom as string) ?? ""} onChange={(v) => up("marginBottom", v)} placeholder="0" /></Field>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function ImagePanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    return (
        <>
            <Section title="Source">
                <Field label="Image URL"><MediaInput value={(p.src as string) || ""} onChange={(v) => up("src", v)} placeholder="https://..." /></Field>
                <Field label="Alt Text"><TextInput value={(p.alt as string) || ""} onChange={(v) => up("alt", v)} placeholder="Describe the image" /></Field>
                <Field label="Caption"><TextInput value={(p.caption as string) || ""} onChange={(v) => up("caption", v)} placeholder="Optional caption..." /></Field>
                <Field label="Link (clickable)"><TextInput value={(p.link as string) || ""} onChange={(v) => up("link", v)} placeholder="https://..." /></Field>
            </Section>
            <Section title="Dimensions">
                <Field label="Width"><TextInputWithUnit value={(p.width as string) ?? ""} onChange={(v) => up("width", v)} placeholder="100%" /></Field>
                <Field label="Height"><TextInputWithUnit value={(p.height as string) ?? ""} onChange={(v) => up("height", v)} placeholder="auto or 300px" /></Field>
                <Field label="Aspect Ratio"><SelectInput value={(p.aspectRatio as string) || "auto"} onChange={(v) => up("aspectRatio", v)} options={[{ label: "Auto", value: "auto" }, { label: "16:9", value: "16/9" }, { label: "4:3", value: "4/3" }, { label: "1:1 (Square)", value: "1/1" }, { label: "3:2", value: "3/2" }, { label: "21:9", value: "21/9" }]} /></Field>
            </Section>
            <Section title="Style">
                <AlignmentInput value={(p.align as string) || "center"} onChange={(v) => up("align", v)} />
                <Field label="Object Fit"><SelectInput value={(p.objectFit as string) || "cover"} onChange={(v) => up("objectFit", v)} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }, { label: "Auto", value: "none" }]} /></Field>
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "0px"} onChange={(v) => up("borderRadius", v)} /></Field>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function DividerPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    return (
        <>
            <Section title="Style">
                <Field label="Line Style"><SelectInput value={(p.style as string) || "solid"} onChange={(v) => up("style", v)} options={[{ label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }]} /></Field>
                <Field label="Color"><ColorInput value={(p.color as string) || "#e2e8f0"} onChange={(v) => up("color", v)} onBlur={(v) => up("color", v, true)} /></Field>
                <Field label="Thickness"><TextInputWithUnit value={(p.thickness as string) ?? ""} onChange={(v) => up("thickness", v)} placeholder="1px" /></Field>
                <Field label="Vertical Margin"><TextInputWithUnit value={(p.marginY as string) ?? ""} onChange={(v) => up("marginY", v)} placeholder="1rem" /></Field>
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function ContainerPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    // Map alignment label → contentAlign + contentJustify values
    const ALIGN_OPTIONS = [
        { label: "Top Left", value: "top-left", alignItems: "flex-start", justifyContent: "flex-start" },
        { label: "Top Center", value: "top-center", alignItems: "flex-start", justifyContent: "center" },
        { label: "Top Right", value: "top-right", alignItems: "flex-start", justifyContent: "flex-end" },
        { label: "Center Left", value: "center-left", alignItems: "center", justifyContent: "flex-start" },
        { label: "Center", value: "center", alignItems: "center", justifyContent: "center" },
        { label: "Center Right", value: "center-right", alignItems: "center", justifyContent: "flex-end" },
        { label: "Bottom Left", value: "bottom-left", alignItems: "flex-end", justifyContent: "flex-start" },
        { label: "Bottom Center", value: "bottom-center", alignItems: "flex-end", justifyContent: "center" },
        { label: "Bottom Right", value: "bottom-right", alignItems: "flex-end", justifyContent: "flex-end" },
    ];

    // Derive current value from stored align/justify
    const currentAlign = (p.contentAlign as string) || "center";
    const currentJustify = (p.contentJustify as string) || "center";
    const currentAlignVal = ALIGN_OPTIONS.find(o => o.alignItems === currentAlign && o.justifyContent === currentJustify)?.value || "center";

    function setAlignment(val: string) {
        const opt = ALIGN_OPTIONS.find(o => o.value === val);
        if (opt) {
            up("contentAlign", opt.alignItems);
            up("contentJustify", opt.justifyContent);
        }
    }

    const WIDTH_OPTIONS = [
        { label: "Full Width (100%)", value: "100%" },
        { label: "Dynamic Viewport (100dvw)", value: "100dvw" },
        { label: "Viewport Width (100vw)", value: "100vw" },
        { label: "Wide (1200px)", value: "1200px" },
        { label: "Medium (960px)", value: "960px" },
        { label: "Responsive 75vw", value: "75vw" },
        { label: "Prose (60rem)", value: "60rem" },
        { label: "Compact (800px)", value: "800px" },
    ];
    const currentWidth = (p.maxWidth as string) || "100%";
    // If saved value isn't in presets, add it as a custom option
    const widthOptions = WIDTH_OPTIONS.find(o => o.value === currentWidth)
        ? WIDTH_OPTIONS
        : [...WIDTH_OPTIONS, { label: `Custom: ${currentWidth}`, value: currentWidth }];

    return (
        <>
            <Section title="Padding (Responsive)">
                <PaddingInput label="Desktop" value={(p.padding as string) || ""} onChange={(v) => up("padding", v)} placeholder="24px" />
                <PaddingInput label="Tablet" value={(p.tabletPadding as string) || ""} onChange={(v) => up("tabletPadding", v)} placeholder="same as desktop" />
                <PaddingInput label="Mobile" value={(p.mobilePadding as string) || ""} onChange={(v) => up("mobilePadding", v)} placeholder="same as tablet" />
            </Section>

            <Section title="Layout">
                {/* Max Width — SelectInput */}
                <Field label="Max Width">
                    <SelectInput value={currentWidth} onChange={(v) => up("maxWidth", v)} options={widthOptions} />
                </Field>

                {/* Content Alignment */}
                <Field label="Content Align">
                    <SelectInput
                        value={currentAlignVal}
                        onChange={setAlignment}
                        options={ALIGN_OPTIONS.map(o => ({ label: o.label, value: o.value }))}
                    />
                </Field>

                {/* Min Height */}
                <Field label="Min Height"><TextInputWithUnit value={(p.minHeight as string) ?? ""} onChange={(v) => up("minHeight", v)} placeholder="500" /></Field>
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "0px"} onChange={(v) => up("borderRadius", v)} /></Field>
            </Section>

            <BackgroundPanel block={block} />

            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function IconPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    return (
        <>
            <Section title="Icon settings">
                <Field label="Icon"><IconPicker value={(p.iconName as string) || "Star"} onChange={(v) => up("iconName", v)} /></Field>
                <Field label="Size"><TextInputWithUnit value={(p.size as string) ?? ""} onChange={(v) => up("size", v)} placeholder="24px" /></Field>
                <Field label="Color"><ColorInput value={(p.color as string) || "var(--primary)"} onChange={(v) => up("color", v)} onBlur={(v) => up("color", v, true)} /></Field>
            </Section>
            <Section title="Layout & Spacing">
                <AlignmentInput value={(p.align as string) || "center"} onChange={(v) => up("align", v)} />
                <PaddingInput value={(p.padding as string) || "16px"} onChange={(v) => up("padding", v)} placeholder="16px" />
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function VideoPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    return (
        <>
            <Section title="Video Source">
                <Field label="Video URL"><MediaInput value={(p.url as string) || ""} onChange={(v) => up("url", v)} placeholder="YouTube / Vimeo / .mp4" type="video" /></Field>
                <div style={{ fontSize: 10, color: "var(--text-subtle)", marginTop: 4 }}>Supports YouTube, Vimeo, and direct .mp4 links.</div>
            </Section>
            <Section title="Playback Options">
                <ToggleSwitch label="AutoPlay" value={!!(p.autoPlay)} onChange={(v: boolean) => up("autoPlay", v)} />
                <ToggleSwitch label="Loop" value={!!(p.loop)} onChange={(v: boolean) => up("loop", v)} />
                <ToggleSwitch label="Muted" value={!!(p.muted) === true} onChange={(v: boolean) => up("muted", v)} />
                <ToggleSwitch label="Show Controls" value={!!(p.controls) === true} onChange={(v: boolean) => up("controls", v)} />
            </Section>
            <Section title="Dimensions & Style">
                <Field label="Width"><TextInputWithUnit value={(p.width as string) ?? ""} onChange={(v) => up("width", v)} placeholder="100%" /></Field>
                <Field label="Aspect Ratio"><SelectInput value={(p.aspectRatio as string) || "16/9"} onChange={(v) => up("aspectRatio", v)} options={[{ label: "16:9", value: "16/9" }, { label: "4:3", value: "4/3" }, { label: "1:1", value: "1/1" }, { label: "21:9", value: "21/9" }, { label: "9:16 (Vertical)", value: "9/16" }]} /></Field>
                <PaddingInput value={(p.padding as string) || "16px"} onChange={(v) => up("padding", v)} placeholder="16px" />
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "8px"} onChange={(v) => up("borderRadius", v)} /></Field>
                <AlignmentInput value={(p.align as string) || "center"} onChange={(v) => up("align", v)} />
            </Section>
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function ColumnsPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    return (
        <>
            <Section title="Layout">
                <Field label="Left Col Width (%)">
                    <input type="range" min={20} max={80} step={5} value={Number(p.leftWidth || 50)} onChange={(e) => up("leftWidth", e.target.value)} style={{ width: "100%", accentColor: "var(--primary)" }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>{String(p.leftWidth ?? 50)}% / {String(100 - Number(p.leftWidth ?? 50))}%</span>
                </Field>
                <Field label="Gap"><TextInputWithUnit value={(p.gap as string) ?? ""} onChange={(v) => up("gap", v)} placeholder="1.5rem" /></Field>
                <Field label="Vertical Alignment"><SelectInput value={(p.alignItems as string) || "stretch"} onChange={(v) => up("alignItems", v)} options={[{ label: "Stretch (fill height)", value: "stretch" }, { label: "Top", value: "flex-start" }, { label: "Center", value: "center" }, { label: "Bottom", value: "flex-end" }]} /></Field>
            </Section>
            <Section title="Padding (Responsive)">
                <PaddingInput label="Desktop" value={(p.padding as string) || ""} onChange={(v) => up("padding", v)} placeholder="16px 24px" />
                <PaddingInput label="Tablet" value={(p.tabletPadding as string) || ""} onChange={(v) => up("tabletPadding", v)} placeholder="same as desktop" />
                <PaddingInput label="Mobile" value={(p.mobilePadding as string) || ""} onChange={(v) => up("mobilePadding", v)} placeholder="same as tablet" />
            </Section>
            <BackgroundPanel block={block} />
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function WavePanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    return (
        <>
            <Section title="Design">
                <Field label="Pattern">
                    <SelectInput
                        value={(p.pattern as string) || "smooth"}
                        onChange={(v) => up("pattern", v)}
                        options={[
                            { label: "Smooth Curve", value: "smooth" },
                            { label: "Layered Depth", value: "layered" },
                            { label: "Sharp & Jagged", value: "sharp" },
                            { label: "Asymmetric Curve", value: "curve" },
                            { label: "Swoosh", value: "swoosh" },
                            { label: "Water Level", value: "water" },
                            { label: "Blob Drop", value: "blob" },
                            { label: "Deep Valley", value: "valley" },
                            { label: "Deep Ocean", value: "deep" }
                        ]}
                    />
                </Field>
                <Field label="Density (Layers)">
                    <input type="range" min={1} max={3} step={1} value={Number(p.layers || 1)} onChange={(e) => up("layers", parseInt(e.target.value))} style={{ width: "100%", accentColor: "var(--primary)" }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>{String(p.layers ?? 1)}</span>
                </Field>
                <Field label="Primary Color"><ColorInput value={(p.fillColor as string) || "var(--primary)"} onChange={(v) => up("fillColor", v)} onBlur={(v) => up("fillColor", v, true)} /></Field>
                <Field label="Gradient End Color"><ColorInput value={(p.fillGradientEnd as string) || ""} onChange={(v) => up("fillGradientEnd", v)} onBlur={(v) => up("fillGradientEnd", v, true)} /></Field>
                <Field label="Secondary Color (Layers)"><ColorInput value={(p.secondaryColor as string) || ""} onChange={(v) => up("secondaryColor", v)} onBlur={(v) => up("secondaryColor", v, true)} /></Field>
                <Field label="Height"><TextInputWithUnit value={(p.height as string) ?? ""} onChange={(v) => up("height", v)} placeholder="150px or 15vw" /></Field>
                <Field label="Background Context Color"><ColorInput value={(p.bgColor as string) || "transparent"} onChange={(v) => up("bgColor", v)} onBlur={(v) => up("bgColor", v, true)} /></Field>
                <Field label="Content Gap"><TextInputWithUnit value={(p.contentGap as string) ?? ""} onChange={(v) => up("contentGap", v)} placeholder="1rem" /></Field>
            </Section>
            <Section title="Orientation & Animation">
                <PaddingInput label="Padding Top" value={(p.paddingTop as string) || ""} onChange={(v) => up("paddingTop", v)} placeholder="e.g., 5rem" />
                <PaddingInput label="Padding Bottom" value={(p.paddingBottom as string) || ""} onChange={(v) => up("paddingBottom", v)} placeholder="e.g., 2rem" />
                <PaddingInput label="Global Padding" value={(p.padding as string) || "24px"} onChange={(v) => up("padding", v)} placeholder="24px" />
                <ToggleSwitch label="Flip Horizontal" value={!!p.flipHorizontal} onChange={(v: boolean) => up("flipHorizontal", v)} />
                <ToggleSwitch label="Flip Vertical" value={!!p.flipVertical} onChange={(v: boolean) => up("flipVertical", v)} />
                <ToggleSwitch label="Wave on Top" value={!!p.waveOnTop} onChange={(v: boolean) => up("waveOnTop", v)} />
                <ToggleSwitch label="CSS Drift Animation" value={!!p.animated} onChange={(v: boolean) => up("animated", v)} />
            </Section>
            <BackgroundPanel block={block} />
            {EDITOR_FEATURES.enableAnimations && <AnimationPanel block={block} />}
        </>
    );
}

export function GridPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props as any;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);
    const items = (p.items as any[]) || [];

    return (
        <>
            <Section title="Grid Layout">
                <Field label="Desktop Columns">
                    <SelectInput
                        value={String(p.columns ?? 0)}
                        onChange={(v) => up("columns", Number(v))}
                        options={[
                            { label: "Auto (Responsive)", value: "0" },
                            { label: "1 Column", value: "1" },
                            { label: "2 Columns", value: "2" },
                            { label: "3 Columns", value: "3" },
                            { label: "4 Columns", value: "4" },
                            { label: "5 Columns", value: "5" },
                            { label: "6 Columns", value: "6" },
                        ]}
                    />
                </Field>
                {p.columns > 0 && items.length < p.columns && (
                    <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4, padding: "4px 8px", background: "rgba(245,158,11, 0.1)", borderRadius: 4 }}>
                        ⚠️ {items.length} cells present for {p.columns} columns. Add {p.columns - items.length} more cells for a full row.
                    </div>
                )}
                <AlignmentInput
                    label="Group Alignment"
                    value={(p.gridAlign as string) || "stretch"}
                    onChange={(v) => up("gridAlign", v)}
                    options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }, { label: "Stretch", value: "stretch" }]}
                />
                <div style={{ fontSize: 10, color: "var(--text-subtle)", marginTop: 4, padding: "0 8px" }}>
                    Centers or justifies the entire group of cards when they don't fill a full row.
                </div>
                <Field label="Gap"><TextInputWithUnit value={(p.gap as string) ?? ""} onChange={(v) => up("gap", v)} placeholder="1.5rem" /></Field>
            </Section>

            <Section title="Item Alignment (Inner)">
                <AlignmentInput
                    label="Horizontal"
                    value={(p.align as string) || "center"}
                    onChange={(v) => up("align", v)}
                    options={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }, { label: "Stretch", value: "stretch" }]}
                />
                <AlignmentInput
                    label="Vertical"
                    type="flex-vertical"
                    value={(p.verticalAlign as string) || "center"}
                    onChange={(v) => up("verticalAlign", v)}
                />
            </Section>

            <Section title="Grid Cells">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map((item, idx) => (
                        <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600 }}>Cell {idx + 1}</span>
                            <button
                                onClick={() => {
                                    const next = [...items];
                                    next.splice(idx, 1);
                                    up("items", next, true);
                                }}
                                style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14 }}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    <div style={{ fontSize: 10, color: "var(--text-subtle)", marginTop: 12 }}>
                        Deleting a cell will permanently remove all blocks inside it.
                    </div>
                </div>
            </Section>

            <BackgroundPanel block={block} />
            <Section title="Style">
                <Field label="Border Radius"><BorderRadiusInput value={(p.borderRadius as string) || "0px"} onChange={(v) => up("borderRadius", v)} /></Field>
            </Section>

            <Section title="Padding (Responsive)">
                <Field label="Desktop"><TextInputWithUnit value={(p.padding as string) ?? ""} onChange={(v) => up("padding", v)} placeholder="24px" /></Field>
                <Field label="Tablet"><TextInputWithUnit value={(p.tabletPadding as string) ?? ""} onChange={(v) => up("tabletPadding", v)} placeholder="same as desktop" /></Field>
                <Field label="Mobile"><TextInputWithUnit value={(p.mobilePadding as string) ?? ""} onChange={(v) => up("mobilePadding", v)} placeholder="same as tablet" /></Field>
            </Section>

            <AnimationPanel block={block} />
        </>
    );
}

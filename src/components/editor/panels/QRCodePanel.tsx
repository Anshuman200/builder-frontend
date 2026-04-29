"use client";
import type { Block } from "@/types";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";

import { Section, Field, TextInput, SelectInput, ColorInput, ToggleSwitch, AlignmentInput, PaddingInput, TextInputWithUnit, MediaInput } from "./shared";
import { AnimationPanel } from "./AnimationPanel";
import { BackgroundPanel } from "./BackgroundPanel";

export function QRCodePanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    return (
        <>
            <Section title="QR Code Data">
                <Field label="Value (URL/Text)">
                    <TextInput 
                        value={(p.value as string) || "https://solarioforge.com"} 
                        onChange={(v) => up("value", v)} 
                        placeholder="https://..." 
                    />
                </Field>
                <div style={{ fontSize: 10, color: "var(--text-subtle)", marginTop: 4 }}>
                    The content to encode in the QR code.
                </div>
            </Section>

            <Section title="Design">
                <Field label="Render Type">
                    <SelectInput
                        value={(p.renderType as string) || "canvas"}
                        onChange={(v) => up("renderType", v)}
                        options={[
                            { label: "Canvas", value: "canvas" },
                            { label: "SVG", value: "svg" },
                        ]}
                    />
                </Field>
                <Field label="Error Level">
                    <SelectInput
                        value={(p.errorLevel as string) || "M"}
                        onChange={(v) => up("errorLevel", v)}
                        options={[
                            { label: "Low (L - 7%)", value: "L" },
                            { label: "Medium (M - 15%)", value: "M" },
                            { label: "Quarter (Q - 25%)", value: "Q" },
                            { label: "High (H - 30%)", value: "H" },
                        ]}
                    />
                </Field>
                <Field label="QR Color">
                    <ColorInput 
                        value={(p.color as string) || "#000000"} 
                        onChange={(v) => up("color", v)} 
                        onBlur={(v) => up("color", v, true)} 
                    />
                </Field>
                <Field label="QR Background">
                    <ColorInput 
                        value={(p.bgColor as string) || "transparent"} 
                        onChange={(v) => up("bgColor", v)} 
                        onBlur={(v) => up("bgColor", v, true)} 
                    />
                </Field>
                <ToggleSwitch 
                    label="Show Border" 
                    value={p.bordered !== false} 
                    onChange={(v: boolean) => up("bordered", v)} 
                />
            </Section>

            <Section title="Logo Icon">
                <Field label="Icon URL">
                    <MediaInput 
                        value={(p.icon as string) || ""} 
                        onChange={(v) => up("icon", v)} 
                        placeholder="https://..." 
                    />
                </Field>
                <Field label="Icon Size (px)">
                    <TextInput 
                        type="number"
                        value={p.iconSize !== undefined ? String(p.iconSize) : "60"} 
                        onChange={(v) => up("iconSize", v === "" ? "" : Number(v))} 
                        onBlur={(v) => {
                            if (!v || Number(v) <= 0) up("iconSize", 60);
                        }}
                        placeholder="60" 
                    />
                </Field>
            </Section>

            <Section title="Layout & Spacing">
                <Field label="Size (px)">
                    <TextInput 
                        type="number"
                        value={p.size !== undefined ? String(p.size) : "250"} 
                        onChange={(v) => up("size", v === "" ? "" : Number(v))} 
                        onBlur={(v) => {
                            if (!v || Number(v) <= 0) up("size", 250);
                        }}
                        placeholder="250" 
                    />
                </Field>
                <AlignmentInput 
                    value={(p.align as string) || "center"} 
                    onChange={(v) => up("align", v)} 
                />
                <PaddingInput 
                    value={(p.padding as string) || "16px"} 
                    onChange={(v) => up("padding", v)} 
                    placeholder="16px" 
                />
            </Section>

            <BackgroundPanel block={block} />
            <AnimationPanel block={block} />
        </>
    );
}

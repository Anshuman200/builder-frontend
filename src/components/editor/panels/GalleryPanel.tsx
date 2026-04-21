"use client";
import type { Block } from "@/types";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";

import { Section, Field, TextInput, SelectInput, ColorInput, MediaInput, ToggleSwitch, PaddingFields, SortableList, arrayMove, TextInputWithUnit } from "./shared";
import { AnimationPanel } from "./AnimationPanel";

export function GalleryPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props as any;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    return (
        <>
            <Section title="Gallery Layout">
                <Field label="Columns"><SelectInput value={String(p.columns || "3")} onChange={(v) => up("columns", Number(v))} options={[{ label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" }, { label: "5 Columns", value: "5" }]} /></Field>
                <Field label="Gap"><TextInputWithUnit value={p.gap ?? ""} onChange={(v) => up("gap", v)} placeholder="1rem" /></Field>
                <Field label="Max Width"><TextInputWithUnit value={p.maxWidth ?? ""} onChange={(v) => up("maxWidth", v)} placeholder="1200px" /></Field>
            </Section>

            <Section title="Gallery Images">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <SortableList
                        items={(p.images as any[]) || []}
                        onReorder={(activeId, overId) => {
                            const oldIndex = (p.images as any[]).findIndex((img) => img.id === activeId);
                            const newIndex = (p.images as any[]).findIndex((img) => img.id === overId);
                            up("images", arrayMove(p.images as any[], oldIndex, newIndex), true);
                        }}
                        onDelete={(idx) => {
                            const nI = [...((p.images as any[]) || [])];
                            nI.splice(idx, 1);
                            up("images", nI, true);
                        }}
                        renderItemContent={(img, idx) => (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <img src={img.url} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover" }} />
                                    <div style={{ flex: 1 }}>
                                        <TextInput value={img.caption} onChange={(v) => {
                                            const nI = [...((p.images as any[]) || [])];
                                            nI[idx] = { ...nI[idx], caption: v };
                                            up("images", nI);
                                        }} placeholder="Caption / Alt text" />
                                    </div>
                                </div>
                                <MediaInput value={img.url} onChange={(v) => {
                                    const nI = [...((p.images as any[]) || [])];
                                    nI[idx] = { ...nI[idx], url: v };
                                    up("images", nI);
                                }} />
                            </div>
                        )}
                    />
                    <button onClick={() => {
                        const nI = [...((p.images as any[]) || [])];
                        nI.push({ id: crypto.randomUUID(), url: "https://placehold.co/600x400/e2e8f0/64748b?text=Image", caption: "" });
                        up("images", nI, true);
                    }} style={{ padding: "8px 0", background: "rgba(99,102,241,0.08)", color: "var(--primary)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>+ Add Image</button>
                </div>
            </Section>

            <Section title="Styling">
                <Field label="Background"><ColorInput value={p.bgColor || "transparent"} onChange={(v) => up("bgColor", v)} /></Field>
                <Field label="Border Radius"><TextInput value={p.borderRadius || "8px"} onChange={(v) => up("borderRadius", v)} /></Field>
                <ToggleSwitch label="Show Captions" value={p.showCaptions !== false} onChange={(v) => up("showCaptions", v)} />
            </Section>

            <Section title="Section Padding">
                <PaddingFields p={p} up={up} />
            </Section>

            <AnimationPanel block={block} />
        </>
    );
}

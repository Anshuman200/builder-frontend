"use client";
import type { Block } from "@/types";
import React from "react";
import { useEditorStore } from "@/stores/editorStore";

import { Section, Field, TextInput, SelectInput, ColorInput, MediaInput, ToggleSwitch, PaddingFields, SortableList, arrayMove, TextInputWithUnit, rectSortingStrategy } from "./shared";
import { AnimationPanel } from "./AnimationPanel";

import { BackgroundPanel } from "./BackgroundPanel";

export function GalleryPanel({ block }: { block: Block }) {
    const { updateBlock } = useEditorStore();
    const p = block.props as any;
    const up = (key: string, val: unknown, commit?: boolean) => updateBlock(block.id, { [key]: val }, commit);

    const getColStr = (val: any, def: string) => {
        if (typeof val === "object" && val !== null) {
            return String(val.lg || val.desktop || val.md || def);
        }
        return String(val || def);
    };

    return (
        <>
            <Section title="Columns">
                <Field label="Desktop"><SelectInput value={getColStr(p.columns, "4")} onChange={(v) => up("columns", v, true)} options={[{ label: "1 Column", value: "1" }, { label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" }, { label: "5 Columns", value: "5" }, { label: "6 Columns", value: "6" }]} /></Field>
                <Field label="Tablet"><SelectInput value={getColStr(p.columnsTablet, "2")} onChange={(v) => up("columnsTablet", v, true)} options={[{ label: "1 Column", value: "1" }, { label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" }]} /></Field>
                <Field label="Mobile"><SelectInput value={getColStr(p.columnsMobile, "1")} onChange={(v) => up("columnsMobile", v, true)} options={[{ label: "1 Column", value: "1" }, { label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }]} /></Field>
            </Section>

            <Section title="Spacing">
                <Field label="Item Spacing (Gap)">
                    <TextInputWithUnit value={String(p.gap ?? "")} onChange={(v) => up("gap", v, true)} placeholder="8" />
                </Field>
                <PaddingFields p={p} up={up} />
            </Section>

            <Section title="Gallery Images">
                {(() => {
                    const childBlocks = (p.childBlocks as Block[]) || [];
                    const mediaItems = childBlocks.filter(b => b.type !== 'media-picker');
                    const pickerItems = childBlocks.filter(b => b.type === 'media-picker');

                    return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <SortableList
                                items={mediaItems}
                                strategy={rectSortingStrategy}
                                onReorder={(activeId, overId) => {
                                    const oldIndex = mediaItems.findIndex((img) => img.id === activeId);
                                    const newIndex = mediaItems.findIndex((img) => img.id === overId);
                                    const reorderedMedia = arrayMove(mediaItems, oldIndex, newIndex);
                                    up("childBlocks", [...reorderedMedia, ...pickerItems], true);
                                }}
                                onDelete={(idx) => {
                                    const itemToDelete = mediaItems[idx];
                                    const nC = childBlocks.filter(b => b.id !== itemToDelete.id);
                                    up("childBlocks", nC, true);
                                }}
                                renderItemContent={(child, idx) => {
                                    const cp = child.props as any;
                                    const url = cp.src || cp.url || "";

                                    return (
                                        <div style={{ position: "relative" }}>
                                            <MediaInput
                                                value={url}
                                                variant="compact"
                                                onChange={(v) => {
                                                    const nC = childBlocks.map(b => b.id === child.id ? { ...b, props: { ...b.props, src: v } } : b);
                                                    up("childBlocks", nC);
                                                }}
                                            />
                                        </div>
                                    );
                                }}
                            />

                            {/* Add Image Button (Full Width) */}
                            <button
                                onClick={() => {
                                    const newImageBlock: Block = {
                                        id: crypto.randomUUID(),
                                        type: "image",
                                        props: {
                                            src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800",
                                            caption: "",
                                            width: "100%",
                                            borderRadius: "12px",
                                            objectFit: "cover"
                                        }
                                    };
                                    up("childBlocks", [...mediaItems, newImageBlock, ...pickerItems], true);
                                }}
                                style={{ padding: "8px 0", background: "rgba(99,102,241,0.08)", color: "#d97706", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                            >
                                + Add Image
                            </button>
                        </div>
                    );
                })()}
            </Section>

            <BackgroundPanel block={block} />
            <Section title="Styling">
                <Field label="Border Radius"><TextInput value={p.borderRadius || "8px"} onChange={(v) => up("borderRadius", v)} /></Field>
                <ToggleSwitch label="Show Captions" value={p.showCaptions !== false} onChange={(v) => up("showCaptions", v)} />
            </Section>

            <AnimationPanel block={block} />
        </>
    );
}

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
            <Section title="Spacing">
                <Field label="Item Spacing (Gap)">
                    <TextInputWithUnit value={String(p.gap ?? "")} onChange={(v) => up("gap", v, true)} placeholder="8" />
                </Field>
                <PaddingFields p={p} up={up} />
            </Section>

            <Section title="Gallery Images">
                <div className="grid grid-cols-2">
                    {(() => {
                        const childBlocks = (p.childBlocks as Block[]) || [];
                        const mediaItems = childBlocks.filter(b => b.type !== 'media-picker');
                        const pickerItems = childBlocks.filter(b => b.type === 'media-picker');

                        return (
                            <>
                                <SortableList
                                    items={mediaItems}
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
                                            <div className="">
                                                <MediaInput
                                                    value={url}
                                                    onChange={(v) => {
                                                        const nC = childBlocks.map(b => b.id === child.id ? { ...b, props: { ...b.props, src: v } } : b);
                                                        up("childBlocks", nC);
                                                    }}
                                                />
                                            </div>
                                        );
                                    }}
                                />
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
                                    style={{ padding: "8px 0", background: "rgba(99,102,241,0.08)", color: "var(--primary)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", marginTop: 4 }}
                                >
                                    + Add Image
                                </button>
                            </>
                        );
                    })()}
                </div>
            </Section>

            <Section title="Styling">
                <Field label="Background"><ColorInput value={p.bgColor || "transparent"} onChange={(v) => up("bgColor", v)} /></Field>
                <Field label="Border Radius"><TextInput value={p.borderRadius || "8px"} onChange={(v) => up("borderRadius", v)} /></Field>
                <ToggleSwitch label="Show Captions" value={p.showCaptions !== false} onChange={(v) => up("showCaptions", v)} />
            </Section>

            <AnimationPanel block={block} />
        </>
    );
}

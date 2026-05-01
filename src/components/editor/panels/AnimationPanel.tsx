"use client";

import type { Block } from "@/types";
import React from "react";

import { useEditorStore } from "@/stores/editorStore";
import { Section, SelectInput, TextInput, Field } from "./shared";

interface AnimationPanelProps {
    block: Block;
    hasMargin?:boolean;
}

export function AnimationPanel({ block, hasMargin=true }: AnimationPanelProps) {
    const { updateBlock } = useEditorStore();
    const p = block.props;

    const animationType = (p.animationType as string) || "none";
    const animationDuration = Number(p.animationDuration) || 0.5;
    const animationDelay = Number(p.animationDelay) || 0;
    const animationPlayback = (p.animationPlayback as string) || "once";

    return (
        <Section title="Animation" hasMargin={hasMargin}>
            <Field label="Type">
                <SelectInput
                    value={animationType}
                    onChange={(val) => updateBlock(block.id, { animationType: val })}
                    options={[
                        { value: "none", label: "None" },
                        { value: "fade", label: "Fade In" },
                        { value: "slide-up", label: "Slide Up" },
                        { value: "slide-down", label: "Slide Down" },
                        { value: "slide-left", label: "Slide Left" },
                        { value: "slide-right", label: "Slide Right" },
                        { value: "zoom-in", label: "Zoom In" },
                        { value: "zoom-out", label: "Zoom Out" },
                        { value: "flip", label: "Flip" },
                        { value: "bounce", label: "Bounce" },
                    ]}
                />
            </Field>

            {animationType !== "none" && (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: 11, fontWeight: 500, color: "#888888" }}>Duration (s)</span>
                            <TextInput
                                value={animationDuration.toString()}
                                onChange={(val) => {
                                    const num = parseFloat(val);
                                    if (!isNaN(num)) updateBlock(block.id, { animationDuration: num });
                                }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: 11, fontWeight: 500, color: "#888888" }}>Delay (s)</span>
                            <TextInput
                                value={animationDelay.toString()}
                                onChange={(val) => {
                                    const num = parseFloat(val);
                                    if (!isNaN(num)) updateBlock(block.id, { animationDelay: num });
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: "12px" }}>
                        <Field label="Playback">
                            <SelectInput
                                value={animationPlayback}
                                onChange={(val) => updateBlock(block.id, { animationPlayback: val })}
                                options={[
                                    { value: "once", label: "Play Once" },
                                    { value: "always", label: "Play Every Time" },
                                ]}
                            />
                        </Field>
                    </div>
                </>
            )}
        </Section>
    );
}

"use client";

import { useEditorStore } from "@/stores/editorStore";
import { PropertySection } from "./PropertySection";
import { ControlRow } from "./ControlRow";
import type { AnimationConfig } from "@/stores/editorStore";

interface AnimationControlsProps {
    blockId: string;
}

const ANIMATION_TYPES: AnimationConfig["type"][] = [
    "none",
    "fade-in",
    "slide-up",
    "slide-in-left",
    "zoom-in",
    "bounce",
];

export function AnimationControls({ blockId }: AnimationControlsProps) {
    const { page, updateBlockStyle } = useEditorStore();
    const block = page?.content.find((b) => b.id === blockId);
    if (!block) return null;

    const anim: AnimationConfig = block.style?.animation ?? {
        type: "none",
        delay: 0,
        duration: 600,
        trigger: "load",
    };

    function update(partial: Partial<AnimationConfig>) {
        updateBlockStyle(blockId, { animation: { ...anim, ...partial } });
    }

    return (
        <PropertySection title="Animation" defaultOpen={false}>
            <ControlRow label="Type">
                <select
                    value={anim.type}
                    onChange={(e) => update({ type: e.target.value as AnimationConfig["type"] })}
                    className="prop-select"
                >
                    {ANIMATION_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </ControlRow>
            {anim.type !== "none" && (
                <>
                    <ControlRow label="Trigger">
                        <select
                            value={anim.trigger}
                            onChange={(e) =>
                                update({ trigger: e.target.value as AnimationConfig["trigger"] })
                            }
                            className="prop-select"
                        >
                            <option value="load">On Load</option>
                            <option value="scroll">On Scroll</option>
                        </select>
                    </ControlRow>
                    <ControlRow label="Delay">
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min={0}
                                max={2000}
                                step={100}
                                value={anim.delay}
                                onChange={(e) => update({ delay: Number(e.target.value) })}
                                className="flex-1 accent-indigo-500"
                            />
                            <span className="text-xs text-white/40 w-10 shrink-0 text-right">
                                {anim.delay}ms
                            </span>
                        </div>
                    </ControlRow>
                    <ControlRow label="Duration">
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min={200}
                                max={2000}
                                step={100}
                                value={anim.duration}
                                onChange={(e) => update({ duration: Number(e.target.value) })}
                                className="flex-1 accent-indigo-500"
                            />
                            <span className="text-xs text-white/40 w-10 shrink-0 text-right">
                                {anim.duration}ms
                            </span>
                        </div>
                    </ControlRow>
                </>
            )}
        </PropertySection>
    );
}

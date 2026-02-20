"use client";

import { useEditorStore } from "@/stores/editorStore";
import { PropertySection } from "../shared/PropertySection";
import { ControlRow } from "../shared/ControlRow";
import { StyleControls } from "../shared/StyleControls";

interface ColumnsPropertiesProps {
    blockId: string;
}

export function ColumnsProperties({ blockId }: ColumnsPropertiesProps) {
    const { page, updateBlock } = useEditorStore();
    const block = page?.content.find((b) => b.id === blockId);
    if (!block) return null;
    const p = block.props as Record<string, unknown>;

    function set(key: string, value: unknown) {
        updateBlock(blockId, { [key]: value });
    }

    return (
        <>
            <PropertySection title="Columns">
                <ControlRow label="Ratio">
                    <select
                        value={(p.ratio as string) ?? "1:1"}
                        onChange={(e) => set("ratio", e.target.value)}
                        className="prop-select"
                    >
                        <option value="1:1">Equal (1:1)</option>
                        <option value="1:2">1:2</option>
                        <option value="2:1">2:1</option>
                        <option value="1:3">1:3</option>
                        <option value="3:1">3:1</option>
                    </select>
                </ControlRow>
                <ControlRow label="Gap">
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min={0}
                            max={64}
                            step={4}
                            value={(p.gap as number) ?? 24}
                            onChange={(e) => set("gap", Number(e.target.value))}
                            className="flex-1 accent-indigo-500"
                        />
                        <span className="text-xs text-white/40 w-8 shrink-0 text-right">
                            {(p.gap as number) ?? 24}px
                        </span>
                    </div>
                </ControlRow>
                <ControlRow label="Mobile">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={(p.stackMobile as boolean) ?? true}
                            onChange={(e) => set("stackMobile", e.target.checked)}
                            className="w-3.5 h-3.5 accent-indigo-500"
                        />
                        <span className="text-xs text-white/50">Stack on mobile</span>
                    </label>
                </ControlRow>
            </PropertySection>

            <StyleControls blockId={blockId} />
        </>
    );
}

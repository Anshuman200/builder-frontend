"use client";

import { useEditorStore } from "@/stores/editorStore";
import { PropertySection } from "../shared/PropertySection";
import { ControlRow } from "../shared/ControlRow";
import { ColorPicker } from "../shared/ColorPicker";
import { StyleControls } from "../shared/StyleControls";

interface DividerPropertiesProps {
    blockId: string;
}

export function DividerProperties({ blockId }: DividerPropertiesProps) {
    const { page, updateBlock } = useEditorStore();
    const block = page?.content.find((b) => b.id === blockId);
    if (!block) return null;
    const p = block.props as Record<string, unknown>;

    function set(key: string, value: unknown) {
        updateBlock(blockId, { [key]: value });
    }

    return (
        <>
            <PropertySection title="Divider">
                <ControlRow label="Style">
                    <select
                        value={(p.style as string) ?? "solid"}
                        onChange={(e) => set("style", e.target.value)}
                        className="prop-select"
                    >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                    </select>
                </ControlRow>
                <ControlRow label="Thickness">
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min={1}
                            max={8}
                            step={1}
                            value={(p.thickness as number) ?? 1}
                            onChange={(e) => set("thickness", Number(e.target.value))}
                            className="flex-1 accent-indigo-500"
                        />
                        <span className="text-xs text-white/40 w-6 shrink-0 text-right">
                            {(p.thickness as number) ?? 1}px
                        </span>
                    </div>
                </ControlRow>
                <ControlRow label="Width">
                    <select
                        value={(p.width as string) ?? "100%"}
                        onChange={(e) => set("width", e.target.value)}
                        className="prop-select"
                    >
                        <option value="25%">25%</option>
                        <option value="50%">50%</option>
                        <option value="75%">75%</option>
                        <option value="100%">100%</option>
                    </select>
                </ControlRow>
                <ControlRow label="Color">
                    <ColorPicker
                        value={(p.color as string) ?? "rgba(0,0,0,0.12)"}
                        onChange={(v) => set("color", v)}
                    />
                </ControlRow>
            </PropertySection>

            <StyleControls blockId={blockId} />
        </>
    );
}

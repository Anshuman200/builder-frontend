"use client";

import { useEditorStore } from "@/stores/editorStore";
import { PropertySection } from "../shared/PropertySection";
import { ControlRow } from "../shared/ControlRow";
import { ColorPicker } from "../shared/ColorPicker";
import { TextAlignControl } from "../shared/TextAlignControl";
import { StyleControls } from "../shared/StyleControls";
import { AnimationControls } from "../shared/AnimationControls";

interface ButtonPropertiesProps {
    blockId: string;
}

export function ButtonProperties({ blockId }: ButtonPropertiesProps) {
    const { page, updateBlock } = useEditorStore();
    const block = page?.content.find((b) => b.id === blockId);
    if (!block) return null;
    const p = block.props as Record<string, unknown>;

    function set(key: string, value: unknown) {
        updateBlock(blockId, { [key]: value });
    }

    return (
        <>
            <PropertySection title="Button">
                <ControlRow label="Label">
                    <input
                        type="text"
                        value={(p.label as string) ?? ""}
                        onChange={(e) => set("label", e.target.value)}
                        className="prop-input"
                        placeholder="Click Me"
                    />
                </ControlRow>
                <ControlRow label="URL">
                    <input
                        type="text"
                        value={(p.href as string) ?? ""}
                        onChange={(e) => set("href", e.target.value)}
                        className="prop-input"
                        placeholder="#"
                    />
                </ControlRow>
                <ControlRow label="New Tab">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={(p.openNewTab as boolean) ?? false}
                            onChange={(e) => set("openNewTab", e.target.checked)}
                            className="w-3.5 h-3.5 accent-indigo-500"
                        />
                        <span className="text-xs text-white/50">Open in new tab</span>
                    </label>
                </ControlRow>
                <ControlRow label="Full Width">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={(p.fullWidth as boolean) ?? false}
                            onChange={(e) => set("fullWidth", e.target.checked)}
                            className="w-3.5 h-3.5 accent-indigo-500"
                        />
                        <span className="text-xs text-white/50">Full width</span>
                    </label>
                </ControlRow>
            </PropertySection>

            <PropertySection title="Style">
                <ControlRow label="Variant">
                    <select
                        value={(p.variant as string) ?? "primary"}
                        onChange={(e) => set("variant", e.target.value)}
                        className="prop-select"
                    >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                    </select>
                </ControlRow>
                <ControlRow label="Size">
                    <select
                        value={(p.size as string) ?? "md"}
                        onChange={(e) => set("size", e.target.value)}
                        className="prop-select"
                    >
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                    </select>
                </ControlRow>
                <ControlRow label="Align">
                    <TextAlignControl
                        value={(p.textAlign as string) ?? "center"}
                        onChange={(v) => set("textAlign", v)}
                    />
                </ControlRow>
                <ControlRow label="Bg Color">
                    <ColorPicker
                        value={(p.bgColor as string) ?? "#6366f1"}
                        onChange={(v) => set("bgColor", v)}
                    />
                </ControlRow>
                <ControlRow label="Text Color">
                    <ColorPicker
                        value={(p.textColor as string) ?? "#ffffff"}
                        onChange={(v) => set("textColor", v)}
                    />
                </ControlRow>
            </PropertySection>

            <StyleControls blockId={blockId} />
            <AnimationControls blockId={blockId} />
        </>
    );
}

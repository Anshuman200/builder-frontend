"use client";

import { useEditorStore } from "@/stores/editorStore";
import { PropertySection } from "../shared/PropertySection";
import { ControlRow } from "../shared/ControlRow";
import { ColorPicker } from "../shared/ColorPicker";
import { TextAlignControl } from "../shared/TextAlignControl";
import { StyleControls } from "../shared/StyleControls";
import { AnimationControls } from "../shared/AnimationControls";

interface TextPropertiesProps {
    blockId: string;
}

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "30px", "36px", "48px", "60px", "72px"];
const FONT_WEIGHTS = [
    { label: "Light 300", value: "300" },
    { label: "Regular 400", value: "400" },
    { label: "Medium 500", value: "500" },
    { label: "Semibold 600", value: "600" },
    { label: "Bold 700", value: "700" },
    { label: "Extrabold 800", value: "800" },
];

export function TextProperties({ blockId }: TextPropertiesProps) {
    const { page, updateBlock } = useEditorStore();
    const block = page?.content.find((b) => b.id === blockId);
    if (!block) return null;
    const p = block.props as Record<string, unknown>;

    function set(key: string, value: unknown) {
        updateBlock(blockId, { [key]: value });
    }

    return (
        <>
            <PropertySection title="Content">
                <ControlRow label="Tag">
                    <select
                        value={(p.tag as string) ?? "p"}
                        onChange={(e) => set("tag", e.target.value)}
                        className="prop-select"
                    >
                        <option value="h1">H1 — Heading 1</option>
                        <option value="h2">H2 — Heading 2</option>
                        <option value="h3">H3 — Heading 3</option>
                        <option value="h4">H4 — Heading 4</option>
                        <option value="p">Paragraph</option>
                    </select>
                </ControlRow>
                <ControlRow label="Text">
                    <textarea
                        value={(p.content as string) ?? ""}
                        onChange={(e) => set("content", e.target.value)}
                        rows={4}
                        className="prop-input resize-none"
                        placeholder="Your text..."
                    />
                </ControlRow>
            </PropertySection>

            <PropertySection title="Typography">
                <ControlRow label="Align">
                    <TextAlignControl
                        value={(p.textAlign as string) ?? "left"}
                        onChange={(v) => set("textAlign", v)}
                    />
                </ControlRow>
                <ControlRow label="Size">
                    <select
                        value={(p.fontSize as string) ?? "16px"}
                        onChange={(e) => set("fontSize", e.target.value)}
                        className="prop-select"
                    >
                        {FONT_SIZES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </ControlRow>
                <ControlRow label="Weight">
                    <select
                        value={(p.fontWeight as string) ?? "400"}
                        onChange={(e) => set("fontWeight", e.target.value)}
                        className="prop-select"
                    >
                        {FONT_WEIGHTS.map((w) => (
                            <option key={w.value} value={w.value}>{w.label}</option>
                        ))}
                    </select>
                </ControlRow>
                <ControlRow label="Line Hgt">
                    <input
                        type="number"
                        min={1}
                        max={3}
                        step={0.1}
                        value={(p.lineHeight as string) ?? "1.6"}
                        onChange={(e) => set("lineHeight", e.target.value)}
                        className="prop-input"
                    />
                </ControlRow>
                <ControlRow label="Color">
                    <ColorPicker
                        value={(p.color as string) ?? "#0f172a"}
                        onChange={(v) => set("color", v)}
                    />
                </ControlRow>
            </PropertySection>

            <StyleControls blockId={blockId} />
            <AnimationControls blockId={blockId} />
        </>
    );
}

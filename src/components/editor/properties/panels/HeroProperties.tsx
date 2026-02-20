"use client";

import { useEditorStore } from "@/stores/editorStore";
import { PropertySection } from "../shared/PropertySection";
import { ControlRow } from "../shared/ControlRow";
import { ColorPicker } from "../shared/ColorPicker";
import { StyleControls } from "../shared/StyleControls";
import { AnimationControls } from "../shared/AnimationControls";

interface HeroPropertiesProps {
    blockId: string;
}

export function HeroProperties({ blockId }: HeroPropertiesProps) {
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
                <ControlRow label="Headline">
                    <textarea
                        value={(p.headline as string) ?? ""}
                        onChange={(e) => set("headline", e.target.value)}
                        rows={2}
                        className="prop-input resize-none"
                        placeholder="Your Headline"
                    />
                </ControlRow>
                <ControlRow label="Subline">
                    <textarea
                        value={(p.subheadline as string) ?? ""}
                        onChange={(e) => set("subheadline", e.target.value)}
                        rows={3}
                        className="prop-input resize-none"
                        placeholder="Supporting text..."
                    />
                </ControlRow>
                <ControlRow label="CTA Label">
                    <input
                        type="text"
                        value={(p.ctaLabel as string) ?? ""}
                        onChange={(e) => set("ctaLabel", e.target.value)}
                        className="prop-input"
                        placeholder="Get Started"
                    />
                </ControlRow>
                <ControlRow label="CTA URL">
                    <input
                        type="text"
                        value={(p.ctaUrl as string) ?? ""}
                        onChange={(e) => set("ctaUrl", e.target.value)}
                        className="prop-input"
                        placeholder="#"
                    />
                </ControlRow>
            </PropertySection>

            <PropertySection title="Background">
                <ControlRow label="From">
                    <ColorPicker
                        value={(p.gradientFrom as string) ?? "#0f0f23"}
                        onChange={(v) => set("gradientFrom", v)}
                    />
                </ControlRow>
                <ControlRow label="To">
                    <ColorPicker
                        value={(p.gradientTo as string) ?? "#1a0533"}
                        onChange={(v) => set("gradientTo", v)}
                    />
                </ControlRow>
            </PropertySection>

            <PropertySection title="Layout">
                <ControlRow label="Min Height">
                    <select
                        value={(p.minHeight as string) ?? "80vh"}
                        onChange={(e) => set("minHeight", e.target.value)}
                        className="prop-select"
                    >
                        {["50vh", "60vh", "70vh", "80vh", "90vh", "100vh"].map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </ControlRow>
            </PropertySection>

            <StyleControls blockId={blockId} />
            <AnimationControls blockId={blockId} />
        </>
    );
}

"use client";

import { useEditorStore } from "@/stores/editorStore";
import { PropertySection } from "./PropertySection";
import { ControlRow } from "./ControlRow";
import { ColorPicker } from "./ColorPicker";

interface StyleControlsProps {
    blockId: string;
}

export function StyleControls({ blockId }: StyleControlsProps) {
    const { page, updateBlockStyle } = useEditorStore();
    const block = page?.content.find((b) => b.id === blockId);
    if (!block) return null;

    const style = block.style ?? {};

    return (
        <PropertySection title="Spacing & Style" defaultOpen={false}>
            <ControlRow label="Padding">
                <input
                    type="text"
                    value={style.padding ?? ""}
                    onChange={(e) => updateBlockStyle(blockId, { padding: e.target.value })}
                    placeholder="16px 24px"
                    className="prop-input"
                />
            </ControlRow>
            <ControlRow label="Margin">
                <input
                    type="text"
                    value={style.margin ?? ""}
                    onChange={(e) => updateBlockStyle(blockId, { margin: e.target.value })}
                    placeholder="0"
                    className="prop-input"
                />
            </ControlRow>
            <ControlRow label="Background">
                <ColorPicker
                    value={style.background ?? "#ffffff"}
                    onChange={(v) => updateBlockStyle(blockId, { background: v })}
                />
            </ControlRow>
        </PropertySection>
    );
}
